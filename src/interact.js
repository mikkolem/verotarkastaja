// Esineiden korostus hiiren alla ja tarkastelunäkymä: klikattu esine tuodaan
// lähikuvaan, jossa sitä voi pyöritellä vetämällä.
import * as THREE from 'three';
import { ALIASES, ITEMS } from './items.js';

const HIGHLIGHT = new THREE.Color(0x4a3214);
const INSPECT_SIZE = 0.27;       // esineen suurin mitta lähikuvassa (m)
const CLICK_SLOP = 6;            // näin monta pikseliä saa liikkua, jotta painallus on klikkaus

export class Interaction {
  constructor({ camera, dom, environment, onChange, onHover }) {
    this.camera = camera;
    this.dom = dom;
    this.onChange = onChange;   // kutsutaan, kun huonekuva pitää piirtää uudelleen
    this.onHover = onHover;     // saa korostettavat objektit (ääriviiva)
    this.roots = new Map();     // objekti -> esineen avain
    this.hovered = null;
    this.inspecting = null;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.scene = new THREE.Scene();
    this.scene.environment = environment;
    this.scene.environmentIntensity = 0.9;
    const key = new THREE.DirectionalLight(0xfff0dc, 2.2);
    key.position.set(-0.6, 0.8, 1);
    const rim = new THREE.DirectionalLight(0xbcd0ff, 1.2);
    rim.position.set(0.8, 0.3, -0.8);
    this.scene.add(key, rim, new THREE.HemisphereLight(0xffffff, 0x3a2a1e, 0.6));
    this.inspectCamera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.01, 10);
    this.inspectCamera.position.set(0, 0, 0.9);
    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);
    this.rotTarget = new THREE.Vector2();
    this.drag = null;

    this.label = document.getElementById('hover-label');
    this.panel = document.getElementById('inspect');
    document.getElementById('inspect-close').addEventListener('click', () => this.close());
    addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
    addEventListener('resize', () => {
      this.inspectCamera.aspect = innerWidth / innerHeight;
      this.inspectCamera.updateProjectionMatrix();
    });
    dom.addEventListener('pointermove', (e) => this.onPointerMove(e));
    dom.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    addEventListener('pointerup', (e) => this.onPointerUp(e));
    dom.addEventListener('pointerleave', () => this.setHover(null));
  }

  // Etsii esineet näkymästä. Jokainen esine saa omat kopiot materiaaleistaan,
  // jotta korostus ei leviä muihin samaa materiaalia käyttäviin esineisiin.
  register(scene) {
    this.world = scene;
    for (const key of Object.keys(ITEMS)) {
      const obj = scene.getObjectByName(key);
      if (obj) this.addRoot(obj, key);
    }
    for (const [alias, key] of Object.entries(ALIASES)) {
      const obj = scene.getObjectByName(alias);
      if (obj) this.addRoot(obj, key);
    }
  }

  addRoot(obj, key) {
    this.roots.set(obj, key);
    obj.traverse((o) => {
      if (!o.isMesh) return;
      o.material = o.material.clone();
      o.userData.baseEmissive = o.material.emissive?.clone();
    });
  }

  keyAt(clientX, clientY) {
    this.pointer.set((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.world.children, true)[0];
    for (let o = hit?.object; o; o = o.parent) {
      if (this.roots.has(o)) return this.roots.get(o);
    }
    return null;
  }

  // Samaan esineeseen voi kuulua useampi objekti (mappi + selkämyslappu).
  objectsOf(key) {
    return [...this.roots].filter(([, k]) => k === key).map(([o]) => o);
  }

  // Käy läpi esineen meshit, mutta ei sen sisällä olevia toisia esineitä
  // (esim. laatikon sisällä olevat kuitit korostuvat erikseen).
  meshesOf(root, fn) {
    const visit = (o) => {
      if (o !== root && this.roots.has(o)) return;
      if (o.isMesh) fn(o);
      o.children.forEach(visit);
    };
    visit(root);
  }

  setHover(key) {
    if (key === this.hovered) return;
    for (const [k, on] of [[this.hovered, false], [key, true]]) {
      if (!k) continue;
      for (const root of this.objectsOf(k)) {
        this.meshesOf(root, (o) => {
          if (!o.userData.baseEmissive) return;
          if (on) o.material.emissive.add(HIGHLIGHT);
          else o.material.emissive.copy(o.userData.baseEmissive);
        });
      }
    }
    this.hovered = key;
    this.dom.style.cursor = key ? 'pointer' : '';
    this.label.textContent = key ? ITEMS[key].title : '';
    this.label.classList.toggle('visible', !!key);
    this.onHover?.(key ? this.objectsOf(key) : []);
    this.onChange();
  }

  clearHover() {
    this.setHover(null);
  }

  onPointerMove(e) {
    if (this.drag) {
      this.rotTarget.y += (e.clientX - this.drag.x) * 0.008;
      this.rotTarget.x = THREE.MathUtils.clamp(this.rotTarget.x + (e.clientY - this.drag.y) * 0.008, -1.3, 1.3);
      this.drag.moved += Math.abs(e.clientX - this.drag.x) + Math.abs(e.clientY - this.drag.y);
      this.drag.x = e.clientX;
      this.drag.y = e.clientY;
      return;
    }
    if (this.inspecting || !this.world) return;
    this.setHover(this.keyAt(e.clientX, e.clientY));
    // nimi kursorin oikealle puolelle, tai vasemmalle jos ruudun reuna tulee vastaan
    const w = this.label.offsetWidth;
    const x = e.clientX + 16 + w > innerWidth - 8 ? e.clientX - 16 - w : e.clientX + 16;
    this.label.style.transform = `translate(${x}px, ${e.clientY + 16}px)`;
  }

  onPointerDown(e) {
    this.drag = { x: e.clientX, y: e.clientY, moved: 0 };
  }

  onPointerUp(e) {
    const drag = this.drag;
    this.drag = null;
    if (!drag || this.inspecting || drag.moved > CLICK_SLOP || e.target !== this.dom) return;
    const key = this.keyAt(e.clientX, e.clientY);
    if (key) this.open(key);
  }

  open(key) {
    const item = ITEMS[key];
    this.setHover(null);
    this.pivot.clear();
    // Kopiot siirretään pääobjektin omaan koordinaatistoon (sijainti ja kierto
    // nollataan, koko säilyy). Mukana kulkevat esim. mapin selkämyslaput.
    const [main, ...rest] = this.objectsOf(key);
    const toLocal = new THREE.Matrix4()
      .compose(main.position, main.quaternion, new THREE.Vector3(1, 1, 1))
      .invert();
    const holder = new THREE.Group();
    for (const src of [main, ...rest]) {
      const copy = src.clone(true);
      // sisäkkäiset esineet (esim. laatikon kuitit) eivät kuulu lähikuvaan
      const nested = [];
      copy.traverse((o) => { if (o !== copy && ITEMS[o.name]) nested.push(o); });
      nested.forEach((o) => o.removeFromParent());
      copy.applyMatrix4(toLocal);
      holder.add(copy);
    }
    holder.rotation.set(...(item.rotation ?? [0, 0, 0]));
    this.pivot.add(holder);

    // keskitys ja skaalaus niin, että esine mahtuu lähikuvaan
    this.pivot.scale.setScalar(1);
    this.pivot.rotation.set(0, 0, 0);
    this.pivot.position.set(0, 0, 0);
    this.pivot.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(holder);
    const size = box.getSize(new THREE.Vector3());
    holder.position.sub(box.getCenter(new THREE.Vector3()));
    // kapealla (pysty)näytöllä esine pienennetään, jotta se mahtuu leveyssuunnassa
    const cam = this.inspectCamera;
    const visibleWidth = 2 * cam.position.z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect;
    const fit = Math.min(INSPECT_SIZE, visibleWidth * 0.65);   // varaa tilaa alkukierrolle
    this.pivot.scale.setScalar(fit / Math.max(size.x, size.y, size.z));
    this.pivot.position.set(0, 0.06, 0);   // hieman ylös, ettei tekstilaatikko peitä
    this.rotTarget.set(0.15, -0.35);
    this.pivot.rotation.set(0.15, -0.35, 0);

    this.inspecting = key;
    this.refresh();
    this.panel.hidden = false;
    document.body.classList.add('inspecting');
    this.onChange();
  }

  // Päivittää kuvauksen ja napit pelin tilan mukaan (kutsutaan myös tilan muuttuessa).
  refresh() {
    if (!this.inspecting) return;
    const item = ITEMS[this.inspecting];
    document.getElementById('inspect-title').textContent = item.title;
    document.getElementById('inspect-text').textContent =
      typeof item.text === 'function' ? item.text() : item.text;
    const actions = item.actions?.(this.api) ?? [];
    document.getElementById('inspect-todo').hidden = actions.length === 0;
    document.getElementById('inspect-buttons').replaceChildren(...actions.map(({ label, run }) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.addEventListener('click', run);
      return b;
    }));
  }

  close() {
    if (!this.inspecting) return;
    this.inspecting = null;
    this.pivot.clear();
    this.panel.hidden = true;
    document.body.classList.remove('inspecting');
    this.onChange();
  }

  // Pehmeä kääntö kohti vetämällä asetettua asentoa.
  update(dt) {
    if (!this.inspecting) return;
    const k = 1 - Math.exp(-dt * 10);
    this.pivot.rotation.x += (this.rotTarget.x - this.pivot.rotation.x) * k;
    this.pivot.rotation.y += (this.rotTarget.y - this.pivot.rotation.y) * k;
  }

  get busy() {
    if (!this.inspecting) return false;
    return !!this.drag
      || Math.abs(this.rotTarget.x - this.pivot.rotation.x) > 0.001
      || Math.abs(this.rotTarget.y - this.pivot.rotation.y) > 0.001;
  }
}
