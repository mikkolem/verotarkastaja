import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';

import { createMaterials } from './materials.js';
import { debugOverlay, detectQuality } from './quality.js';
import { createDust } from './dust.js';
import { createShafts } from './shafts.js';
import { addDecor } from './decor.js';
import { skyTexture } from './textures.js';
import { START_VIEW, VIEWS, ViewController } from './views.js';
import { PROPS } from './props.js';
import { addPaperItems, pagesFor, shredderCanvas } from './paper.js';
import { Interaction } from './interact.js';
import { createFinale } from './finale.js';
import { runPrologue } from './prologue.js';
import { ITEMS, NOTES, unheardMessages } from './items.js';
import { EVIDENCE, EVIDENCE_TOTAL, SECRETS, game } from './game.js';
import { codeLock, inventoryHud, passwordPrompt, readView, shredPuzzle, toast, voicemail } from './ui.js';
import './style.css';

// Ikkuna-aukko (vastaa blender/build_room.py:n mittoja)
const WINDOW = { x0: -0.2, x1: 1.4, y0: 0.9, y1: 2.3, z: -2.0 };
// Suunta kohti aurinkoa: ylhäältä, ikkunan takaa ja hieman sivusta.
// Pelin 30 minuutin aikana aurinko laskee kohti SUN_DIR_END-suuntaa ja
// valo lämpenee (ks. updateSun).
const SUN_DIR = new THREE.Vector3(3, 4.5, -7).normalize();
const SUN_DIR_END = new THREE.Vector3(3.6, 2.4, -7).normalize();
const SUN_COLOR = new THREE.Color(0xfff0d8);
const SUN_COLOR_END = new THREE.Color(0xffb878);
const DESK_HEIGHT = 0.78;

// --- renderöijä ja kamera ---------------------------------------------------
// Tarkkuus: piirretään näytön CSS-pikseleinä myös retina-näytöllä, koska
// jälkikäsittely ja reunojen pehmennys tasoittavat kuvan joka tapauksessa.
// Laskee automaattisesti, jos kone ei jaksa (ks. silmukka).
let pixelRatio = Math.min(window.devicePixelRatio, 1);
const MIN_PIXEL_RATIO = 0.75;

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(pixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
// Huone ei liiku, joten varjot lasketaan vain kerran latauksen jälkeen.
renderer.shadowMap.autoUpdate = false;
renderer.toneMapping = THREE.AgXToneMapping;
renderer.toneMappingExposure = 1.1;
document.getElementById('app').appendChild(renderer.domElement);
// Laatuprofiili (quality.js): tietokoneella kuten ennenkin, puhelimella kevyt polku.
const quality = detectQuality(renderer);
const updateDebug = debugOverlay(renderer, quality);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.05, 60);

// Kapealla (pysty)näytöllä levennetään näkökenttää, jotta vaakasuunnassa
// näkyy aina suunnilleen sama alue.
function fitCamera() {
  const aspect = innerWidth / innerHeight;
  const minHorizontal = THREE.MathUtils.degToRad(72);
  const vertical = 2 * Math.atan(Math.tan(minHorizontal / 2) / aspect);
  camera.fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(vertical), 55, 85);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
}
fitCamera();

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.06;

// --- valot --------------------------------------------------------------------
const sun = new THREE.DirectionalLight(0xfff0d8, 7);
sun.target.position.set(0.6, 0.8, -0.6);
sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(quality.shadowSize, quality.shadowSize);
Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 4, far: 24 });
sun.shadow.bias = -0.0002;
sun.shadow.normalBias = 0.012;
scene.add(sun, sun.target);
const sunNow = SUN_DIR.clone();

// Ikkunasta tuleva pehmeä taivaanvalo
RectAreaLightUniformsLib.init();
const skyLight = new THREE.RectAreaLight(0xcfe0ff, 3, WINDOW.x1 - WINDOW.x0, WINDOW.y1 - WINDOW.y0);
skyLight.position.set((WINDOW.x0 + WINDOW.x1) / 2, (WINDOW.y0 + WINDOW.y1) / 2, WINDOW.z + 0.05);
skyLight.lookAt(skyLight.position.x, skyLight.position.y, 0);
scene.add(skyLight);

// Auringon heijastus lattiasta ylöspäin (korvaa epäsuoraa valoa).
// Pinta-alavalo ei tee terävää kiiltopistettä kuten pistevalo.
const bounce = new THREE.RectAreaLight(0xffb27a, 0.3, 2.4, 2.0);
bounce.position.set(0.8, 0.05, -0.9);
bounce.lookAt(0.8, 2, -0.9);
scene.add(bounce);
scene.add(new THREE.HemisphereLight(0xc2d3ef, 0x4a3020, 0.35));

// Taivas ikkunan takana
const sky = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 20),
  new THREE.MeshBasicMaterial({ map: skyTexture(), color: new THREE.Color(1.7, 1.7, 1.7) }),
);
sky.position.set(0.6, 4, -9);
scene.add(sky);

// --- huone ---------------------------------------------------------------------
// Pöly on omassa näkymässään: se piirretään valmiin huonekuvan päälle, jolloin
// raskasta huonetta ei tarvitse piirtää uudelleen pelkän pölyn takia.
const dustScene = new THREE.Scene();
const dust = createDust({
  box: new THREE.Box3(new THREE.Vector3(-0.6, 0.2, -1.95), new THREE.Vector3(1.9, 2.5, 0.8)),
  sunDir: SUN_DIR,
  window: WINDOW,
});
dustScene.add(dust);

// Valonsäteet kaihtimien raoista (shafts.js). Ne kuuluvat huoneen kuvaan, jotta
// pöytä ja tuoli peittävät ne oikein.
const shafts = createShafts({ window: WINDOW, sunDir: SUN_DIR });
scene.add(shafts);

// Latauksen vaiheet ja niiden osuus edistymispalkista
const progress = { textures: 0, model: 0, compile: 0 };
const WEIGHTS = { textures: 0.7, model: 0.2, compile: 0.1 };
function showProgress(stage, value, label) {
  progress[stage] = value;
  const total = Object.keys(WEIGHTS).reduce((sum, k) => sum + WEIGHTS[k] * progress[k], 0);
  const pct = Math.round(total * 100);
  document.getElementById('loading-fill').style.width = `${pct}%`;
  document.getElementById('loading-pct').textContent = `${pct} %`;
  if (label) document.getElementById('loading-label').textContent = label;
}

let ready = false;
let finale = null;   // aikaraja, raportti ja loppu (luodaan latauksen jälkeen)
let roomReady;       // täyttyy, kun huone on ladattu (prologin ovisiirtymä odottaa tätä)
const whenRoomReady = new Promise((resolve) => { roomReady = resolve; });

// Ovi saranassaan ja käytävän valo. Prologi avaa oven, kun kamera ajaa sisään,
// ja loppukohtaus, kun Kalevi palaa. set(k): 0 = kiinni, 1 = auki.
function createDoor(scene) {
  const hallLight = new THREE.PointLight(0xffd9a0, 0, 7, 1.5);
  hallLight.position.set(-1.2, 2.3, 3.4);
  scene.add(hallLight);
  const hinge = new THREE.Group();
  hinge.position.set(-1.62, 0, 2.04);
  scene.add(hinge);
  hinge.updateMatrixWorld(true);
  hinge.attach(scene.getObjectByName('door_slab'));
  let current = 0;
  let hall = 0;
  return {
    set(k) {
      if (k === current) return;
      current = k;
      hinge.rotation.y = 1.25 * k;
      hallLight.intensity = Math.max(hall, 5 * k);
      renderer.shadowMap.needsUpdate = true;
      roomDirty = true;
    },
    // käytävän oma valaistus (prologissa kamera on käytävässä)
    hall(intensity) {
      hall = intensity;
      hallLight.intensity = Math.max(hall, 5 * current);
      roomDirty = true;
    },
  };
}
let door = null;

// Pöytälampun lämmin kohdevalo kuvun kohdalle, ja itse polttimo hehkumaan.
function addLampLight(lamp) {
  lamp.updateMatrixWorld(true);
  let bulb;
  lamp.traverse((o) => {
    if (o.isMesh && o.material.name.endsWith('_light')) bulb = o;
  });
  if (!bulb) return;
  bulb.material = bulb.material.clone();
  bulb.material.emissive = new THREE.Color(0xffc27a);
  bulb.material.emissiveIntensity = 6;
  const center = new THREE.Box3().setFromObject(bulb).getCenter(new THREE.Vector3());

  const light = new THREE.SpotLight(0xffc58a, 6, 4, 0.75, 0.6, 1.8);
  light.position.copy(center);
  light.target.position.set(center.x + 0.25, DESK_HEIGHT, center.z + 0.25);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.bias = -0.0005;
  light.shadow.normalBias = 0.01;
  scene.add(light, light.target);
}

// Aurinko laskee ja lämpenee pelin edetessä: t = 0…1 kuluneesta ajasta.
// Varjot lasketaan uudelleen vain tässä, joten kutsu harvoin (ks. silmukka).
let sunT = -1;
function updateSun(t) {
  t = THREE.MathUtils.clamp(t, 0, 1);
  if (Math.abs(t - sunT) < 0.002) return false;
  sunT = t;
  sunNow.lerpVectors(SUN_DIR, SUN_DIR_END, t).normalize();
  sun.position.copy(sun.target.position).addScaledVector(sunNow, 12);
  sun.color.lerpColors(SUN_COLOR, SUN_COLOR_END, t);
  sun.intensity = 7 - 1.2 * t;
  bounce.color.lerpColors(new THREE.Color(0xffb27a), new THREE.Color(0xff8a4a), t);
  shafts.userData.update(sunNow);
  shafts.userData.setColor(new THREE.Color(1.0, 0.82, 0.58).lerp(new THREE.Color(1.0, 0.62, 0.36), t), 0.03 + 0.01 * t);
  dust.userData.setSun(sunNow);
  renderer.shadowMap.needsUpdate = true;
  roomDirty = true;
  return true;
}

async function loadRoom() {
  // Mallit latautuvat verkosta samaan aikaan, kun tekstuureja lasketaan.
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const propUrls = [...new Set(PROPS.map((p) => p.url))];
  const urls = ['models/room.glb', 'models/custom_props.glb', ...propUrls];
  const loaded = urls.map(() => 0);
  const modelPromises = urls.map((url, i) => loader.loadAsync(`${import.meta.env.BASE_URL}${url}`, (e) => {
    if (!e.total) return;
    loaded[i] = e.loaded / e.total;
    showProgress('model', loaded.reduce((a, b) => a + b, 0) / urls.length);
  }));
  showProgress('textures', 0, 'Lakataan puupintoja…');
  const materials = await createMaterials(renderer.capabilities.getMaxAnisotropy(), (p) => {
    showProgress('textures', p);
  }, { textureScale: quality.textureScale });
  showProgress('textures', 1, 'Kannetaan huonekaluja…');
  const [room, custom, ...propModels] = await Promise.all(modelPromises);
  showProgress('model', 1);

  // Blenderillä tehdyt mallit: materiaalit vaihdetaan nimen perusteella
  for (const gltf of [room, custom]) {
    gltf.scene.traverse((obj) => {
      if (!obj.isMesh) return;
      const replacement = materials[obj.material.name];
      if (replacement) obj.material = replacement;
      const isGlass = obj.material === materials.glass;
      obj.castShadow = !isGlass;
      obj.receiveShadow = !isGlass;
    });
    scene.add(gltf.scene);
  }

  const used = new Set();
  for (const { name, url, position, rotationY = 0, rotationZ = 0, scale = 1 } of PROPS) {
    // ensimmäinen käyttö saa alkuperäisen, seuraavat kopion (jakavat geometrian)
    const source = propModels[propUrls.indexOf(url)].scene;
    const obj = used.has(url) ? source.clone() : source;
    used.add(url);
    obj.name = name;
    obj.position.set(...position);
    obj.rotation.y = rotationY;
    obj.rotation.z = rotationZ;
    obj.scale.setScalar(scale);
    obj.traverse((o) => {
      if (o.isMesh) o.castShadow = o.receiveShadow = true;
    });
    scene.add(obj);
  }
  addLampLight(scene.getObjectByName('lamp'));
  // roskakori on mallissa mukana, mutta se jätettiin pois pelistä (heikko malli, ei roolia)
  scene.getObjectByName('waste_bin')?.removeFromParent();
  // Käsialafontti ladataan verkosta (index.html); paperit piirretään vasta sen jälkeen.
  try { await Promise.race([document.fonts.load('30px Kalam'), new Promise((r) => setTimeout(r, 2500))]); } catch { /* ilman fonttia */ }
  addPaperItems(scene);
  addDecor(scene);
  interaction.register(scene);
  door = createDoor(scene);
  finale = createFinale({ scene, views, interaction, animations, toast, nextHint, door, onDirty: () => { roomDirty = true; } });
  renderer.shadowMap.needsUpdate = true;

  // Varjostinohjelmat käännetään etukäteen, ettei ensimmäinen kuva nyi.
  showProgress('model', 1, 'Avataan sälekaihtimia…');
  await renderer.compileAsync(scene, camera);

  // Heijastukset: huone kuvataan kerran kuutiokameralla keskeltä huonetta, ja
  // kuvasta tehdään ympäristökartta. Lakattu pöytä ja messinki heijastavat sitten
  // oikeasti ikkunaa ja seiniä. Yksi kertalasku latauksessa, ei kuluta pelin aikana.
  const probeTarget = new THREE.WebGLCubeRenderTarget(quality.probeSize, { type: quality.probeType });
  const probe = new THREE.CubeCamera(0.1, 30, probeTarget);
  probe.position.set(0.4, 1.3, -0.2);
  shafts.visible = false;
  dust.visible = false;
  probe.update(renderer, scene);
  shafts.visible = true;
  dust.visible = true;
  scene.environment = pmrem.fromCubemap(probeTarget.texture).texture;
  scene.environmentIntensity = 0.5;
  probeTarget.dispose();
  showProgress('compile', 1);

  ready = true;
  roomReady();
  // Latausnäkymä pois: prologi (tai tarkastusmääräys) peittää ruudun tästä eteenpäin.
  const loading = document.getElementById('loading');
  loading.classList.add('hidden');
  setTimeout(() => loading.remove(), 1000);
  maybeShowIntro();
}

// --- prologin loppu: ovi aukeaa ja kamera ajaa työpöydälle (noin 4 s) -------------
// Prologi (prologue.js) kutsuu update(t) joka kuvassa, t = sekuntia siirtymän alusta.
const KEYS = [
  [0, { pos: [-0.45, 1.5, 2.9], target: [-1.3, 1.1, 1.2] }],      // käytävässä, ovi raollaan
  [1.8, { pos: [-1.05, 1.55, 1.5], target: [0.2, 1.0, -0.5] }],   // oviaukossa
  [4, { pos: [...VIEWS[START_VIEW].pos], target: [...VIEWS[START_VIEW].target] }],  // aloitusnäkymä (Ikkuna)
];
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
function poseAt(t) {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1][0]) i++;
  const [t0, a] = KEYS[i];
  const [t1, b] = KEYS[i + 1];
  const k = easeInOut(THREE.MathUtils.clamp((t - t0) / (t1 - t0), 0, 1));
  return {
    pos: a.pos.map((v, j) => THREE.MathUtils.lerp(v, b.pos[j], k)),
    target: a.target.map((v, j) => THREE.MathUtils.lerp(v, b.target[j], k)),
  };
}
const cinematic = {
  whenReady: whenRoomReady,
  duration: KEYS[KEYS.length - 1][0],
  update(t) {
    views.override = poseAt(t);
    door?.hall(3.5);
    // ovi raollaan alussa, aukeaa 0,2–1,8 s
    door?.set(THREE.MathUtils.clamp(0.07 + 0.93 * (1 - Math.pow(1 - (t - 0.2) / 1.6, 3)), 0.07, 1));
    roomDirty = true;
  },
  finish() {
    views.override = null;
    door?.hall(0);
    door?.set(0);
    roomDirty = true;
  },
};

// Prologi pyörii latauksen aikana. Tarkastusmääräys (intro) avautuu, kun sekä
// prologi on katsottu että huone ladattu; jos lataus on vielä kesken,
// latausnäkymä jää näkyviin siihen asti.
let prologueDone = false;
// käynnistetään vasta, kun koko moduuli on alustettu (onDone voi tulla heti)
queueMicrotask(() => runPrologue({ cinematic, onDone: () => { prologueDone = true; maybeShowIntro(); } }));
function maybeShowIntro() {
  if (!ready || !prologueDone || started || introOpen) return;
  showIntro();
}

// Aloitusruutu (tarkastusmääräys) näkyy latauksen jälkeen huoneen päällä.
// Sillä aikaa kuvakulmia ei voi vaihtaa.
// Ohjeet-nappi avaa saman muistion uudelleen kesken pelin.
let introOpen = false;
let started = false;
// Muistio on kolmessa vaiheessa (tehtävä, näin pelaat, vihjeet ja aika).
const memoSteps = [...document.querySelectorAll('.memo-step')];
const memoDots = document.getElementById('memo-dots');
memoSteps.forEach(() => memoDots.appendChild(document.createElement('span')));
let memoIndex = 0;
function showMemoStep(i) {
  memoIndex = Math.max(0, Math.min(memoSteps.length - 1, i));
  memoSteps.forEach((el, j) => { el.hidden = j !== memoIndex; });
  [...memoDots.children].forEach((d, j) => d.classList.toggle('active', j === memoIndex));
  document.getElementById('memo-prev').disabled = memoIndex === 0;
  document.getElementById('memo-next').hidden = memoIndex === memoSteps.length - 1;
  document.getElementById('intro-start').hidden = memoIndex !== memoSteps.length - 1;
  document.getElementById('intro').scrollTop = 0;
}
document.getElementById('memo-prev').addEventListener('click', () => showMemoStep(memoIndex - 1));
document.getElementById('memo-next').addEventListener('click', () => showMemoStep(memoIndex + 1));
addEventListener('keydown', (e) => {
  if (!introOpen) return;
  if (e.key === 'ArrowRight') { e.stopImmediatePropagation(); showMemoStep(memoIndex + 1); }
  if (e.key === 'ArrowLeft') { e.stopImmediatePropagation(); showMemoStep(memoIndex - 1); }
}, true);

function showIntro() {
  const intro = document.getElementById('intro');
  intro.classList.remove('leaving');
  intro.hidden = false;
  introOpen = true;
  document.body.classList.add('intro-open');
  const start = document.getElementById('intro-start');
  start.textContent = started ? 'Jatka tarkastusta' : 'Aloita tarkastus';
  // ensimmäisellä kerralla alusta; pelin aikana avattuna suoraan ohjeisiin
  showMemoStep(started ? memoSteps.length - 1 : 0);
  document.getElementById('memo-next').focus({ preventScroll: true });
  finale?.pause(true);
  start.addEventListener('click', () => {
    introOpen = false;
    finale?.pause(false);
    document.body.classList.remove('intro-open');
    intro.classList.add('leaving');
    setTimeout(() => { intro.hidden = true; }, 600);
    if (!started) {
      started = true;
      hints.start();
      finale.start();
    }
  }, { once: true });
}
loadRoom();

// --- jälkikäsittely --------------------------------------------------------------
// Tietokone: liukulukupuskuri 4x MSAA:lla, AO, ääriviiva ja bloom (kuten ennenkin).
// Puhelin: ei MSAA:ta eikä AO:ta, ääriviivaa tai bloomia; puskuri 8-bittinen, jos
// laite ei osaa renderöidä liukulukuun (quality.js).
const target = new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: quality.targetType, samples: quality.samples });
const composer = new EffectComposer(renderer, target);
composer.addPass(new RenderPass(scene, camera));
let gtao = null;
if (quality.ao) {
  gtao = new GTAOPass(scene, camera, innerWidth, innerHeight);
  gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1, scale: 1.2, samples: 8 });
  gtao.blendIntensity = 0.9;
  composer.addPass(gtao);
}
// Hiiren alla olevan esineen kultainen ääriviiva (valitut objektit: interact.js)
let outline = null;
if (quality.outline) {
  outline = new OutlinePass(new THREE.Vector2(innerWidth, innerHeight), scene, camera);
  Object.assign(outline, { edgeStrength: 3.5, edgeGlow: 0.25, edgeThickness: 1.2 });
  outline.visibleEdgeColor.set(0xd9a04a);
  outline.hiddenEdgeColor.set(0x000000);   // ei piirretä muiden takana olevia osia (ei paljasta laatikon sisältöä)
  composer.addPass(outline);
}
// AO- ja ääriviivapassit piirtävät huoneen syvyyden uudelleen: valonsäteet eivät
// saa olla silloin mukana, muuten ne näkyisivät pintoina ilmassa.
for (const pass of [gtao, outline].filter(Boolean)) {
  const render = pass.render.bind(pass);
  pass.render = (...args) => {
    shafts.visible = false;
    render(...args);
    shafts.visible = true;
  };
}
if (quality.bloom) composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.15, 0.6, 1.4));
composer.addPass(new OutputPass());
// Kaikki välivaiheet samaan kokoon renderöijän tarkkuuden kanssa
composer.setPixelRatio(pixelRatio);
composer.setSize(innerWidth, innerHeight);
// Valmis huonekuva jää composerin puskuriin, josta se kopioidaan ruudulle
// joka kuvassa. Huone piirretään uudelleen vain, kun kamera liikkuu.
composer.renderToScreen = false;
// Kopio ei saa kirjoittaa syvyyttä, muuten se peittäisi pölyn kokonaan.
const copyQuad = new FullScreenQuad(new THREE.ShaderMaterial({
  ...CopyShader, uniforms: THREE.UniformsUtils.clone(CopyShader.uniforms), depthTest: false, depthWrite: false,
}));
// Huonekuvan välimuisti: valmis kuva kopioidaan heti piirron jälkeen tavalliseen
// 8-bittiseen puskuriin ilman reunanpehmennystä, ja ruudulle piirretään joka kuvassa
// siitä. Jälkikäsittelyn omaan (MSAA-liukuluku)puskuriin ei voi luottaa kuvasta
// toiseen: Apple Silicon -koneilla sen sisältö katosi, ja huone välähti vain
// liikkeen aikana (kaikki selaimet, Metal-näytönohjainpolku).
const roomCache = new THREE.WebGLRenderTarget(1, 1, { type: THREE.UnsignedByteType, depthBuffer: false });
function sizeRoomCache() {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  roomCache.setSize(size.x, size.y);
}
sizeRoomCache();

// Tarkastelun aikana huone näkyy taustalla himmennettynä ja sumennettuna
// (syväterävyyden tuntu). Yksi 12 näytteen sumennus koko ruudulle: halpa.
const dimQuad = new FullScreenQuad(new THREE.ShaderMaterial({
  uniforms: { tDiffuse: { value: null }, uBlur: { value: 0 }, uTexel: { value: new THREE.Vector2(1 / innerWidth, 1 / innerHeight) } },
  vertexShader: CopyShader.vertexShader,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uBlur;
    uniform vec2 uTexel;
    varying vec2 vUv;
    void main() {
      vec2 d = vUv - 0.5;
      float vignette = 1.0 - dot(d, d) * 1.2;
      vec2 r = uTexel * uBlur * 9.0;
      vec3 c = texture2D(tDiffuse, vUv).rgb * 0.16;
      c += texture2D(tDiffuse, vUv + r * vec2( 1.0,  0.0)).rgb * 0.07;
      c += texture2D(tDiffuse, vUv + r * vec2(-1.0,  0.0)).rgb * 0.07;
      c += texture2D(tDiffuse, vUv + r * vec2( 0.0,  1.0)).rgb * 0.07;
      c += texture2D(tDiffuse, vUv + r * vec2( 0.0, -1.0)).rgb * 0.07;
      c += texture2D(tDiffuse, vUv + r * vec2( 0.7,  0.7)).rgb * 0.07;
      c += texture2D(tDiffuse, vUv + r * vec2(-0.7,  0.7)).rgb * 0.07;
      c += texture2D(tDiffuse, vUv + r * vec2( 0.7, -0.7)).rgb * 0.07;
      c += texture2D(tDiffuse, vUv + r * vec2(-0.7, -0.7)).rgb * 0.07;
      c += texture2D(tDiffuse, vUv + r * vec2( 2.0,  0.5)).rgb * 0.07;
      c += texture2D(tDiffuse, vUv + r * vec2(-2.0, -0.5)).rgb * 0.07;
      c += texture2D(tDiffuse, vUv + r * vec2( 0.5, -2.0)).rgb * 0.07;
      c += texture2D(tDiffuse, vUv + r * vec2(-0.5,  2.0)).rgb * 0.07;
      gl_FragColor = vec4(c * mix(1.0, 0.3, uBlur) * vignette, 1.0);
    }
  `,
  depthTest: false,
  depthWrite: false,
}));
let roomDirty = true;
let blur = 0;   // taustan sumennus 0…1, liukuu tarkastelun alkaessa

// --- kuvakulmat ja käyttöliittymä ----------------------------------------------
const nav = document.getElementById('views');
const buttons = VIEWS.map((v, i) => {
  const b = document.createElement('button');
  b.textContent = v.name;
  b.addEventListener('click', () => views.go(i));
  nav.appendChild(b);
  return b;
});
const edgePrev = document.getElementById('edge-prev');
const edgeNext = document.getElementById('edge-next');
const viewName = (i) => VIEWS[(i + VIEWS.length) % VIEWS.length].name;
const setActive = (i) => {
  buttons.forEach((b, j) => b.classList.toggle('active', i === j));
  // reunanuolten alle sen suunnan nimi, johon nuoli kääntää
  edgePrev.querySelector('.edge-label').textContent = viewName(i - 1);
  edgeNext.querySelector('.edge-label').textContent = viewName(i + 1);
  interaction?.clearHover();
};
let interaction = null;
const views = new ViewController(camera, setActive);
setActive(START_VIEW);
interaction = new Interaction({
  camera,
  dom: renderer.domElement,
  environment: scene.environment,
  onChange: () => { roomDirty = true; },
  onHover: (objects) => { if (outline) outline.selectedObjects = objects; },
});

// --- pulmat ---------------------------------------------------------------------
// Käynnissä olevat animaatiot (esim. laatikon avaus). Niiden aikana huone ja
// varjot piirretään joka kuvassa uudelleen.
const animations = [];
const DRAWER_TRAVEL = 0.32;

function openDrawer(name) {
  const drawer = scene.getObjectByName(name);
  const start = drawer.position.z;
  let t = 0;
  animations.push((dt) => {
    t = Math.min(1, t + dt / 0.9);
    drawer.position.z = start + DRAWER_TRAVEL * (1 - Math.pow(1 - t, 3));
    return t < 1;
  });
}

// Kassakaapin ovi kääntyy saranansa ympäri. Ovi liitetään saranan kohdalle
// tehtyyn apuobjektiin, jota kierretään.
function openSafe() {
  const door = scene.getObjectByName('safe_door');
  const hinge = new THREE.Group();
  hinge.position.set(-2.154, 0, -0.58);
  scene.add(hinge);
  hinge.updateMatrixWorld(true);
  hinge.attach(door);
  let t = 0;
  animations.push((dt) => {
    t = Math.min(1, t + dt / 1.2);
    hinge.rotation.y = 1.75 * (1 - Math.pow(1 - t, 3));
    return t < 1;
  });
}

// Puhelinvastaajan merkkivalo palaa, kun kuuntelemattomia viestejä on, ja
// sammuu, kun kaikki on kuunneltu. Pirjo jättää uuden viestin joka todisteesta.
let ledOn = null;
game.onChange(() => {
  const on = unheardMessages() > 0;
  if (on === ledOn) return;
  ledOn = on;
  scene.getObjectByName('answering_machine')?.traverse((o) => {
    if (o.isMesh && o.material.name === 'led_red') o.material.emissiveIntensity = on ? 4 : 0.3;
  });
  roomDirty = true;
});

// Lukunäkymät, jotka eivät ole huoneessa omina esineinään
const READ_TITLES = {
  invoice_assembled: 'Koottu myyntilasku',
  calendar: 'Kalevin kalenteri',
  offshore_statement: 'Kunniakirjan takaa: tiliote',
};

// Muistiinpanot: johtolanka kirjautuu, kun esine avataan lähikuvaan tai paperi luetaan.
function addNote(kind, key) {
  const n = NOTES[kind][key];
  if (n) game.addNote(`${kind}:${key}`.replace('open:note_pirjo', 'read:note_pirjo'), n[0], n[1]());
}

// Esineiden toiminnot (items.js) käyttävät näitä.
interaction.api = {
  toast,
  close: () => interaction.close(),
  openDrawer,
  openSafe,
  codeLock,
  voicemail,
  passwordPrompt,
  // silppurin suikaleet järjestykseen (ui.js); onDone kun lasku on koossa
  shred(onDone) {
    interaction.close();
    shredPuzzle({ canvas: shredderCanvas(), strips: 5, onDone, onCancel: () => toast('Suikaleet jäivät säiliöön. Voit palata niihin myöhemmin.', 'notice') });
  },
  read(key) {
    addNote('read', key);
    readView(ITEMS[key]?.title ?? READ_TITLES[key], pagesFor(key), {
      isMarked: (page) => page.evidence && game.hasEvidence(page.evidence),
      onMark(page, button) {
        if (page.evidence && game.addEvidence(page.evidence)) {
          toast(`Todiste löytyi: ${EVIDENCE[page.evidence]}`, 'evidence');
          button.disabled = true;
          button.textContent = 'Merkitty todisteeksi';
          if (game.evidence.length === EVIDENCE_TOTAL) {
            setTimeout(() => toast('Kaikki todisteet löytyivät! Avaa tarkastusraportti oikeasta yläkulmasta.', 'success'), 4600);
          } else {
            setTimeout(() => { if (unheardMessages() > 0) toast('Puhelinvastaajan valo alkoi vilkkua: uusi viesti.', 'notice'); }, 5200);
          }
        } else if (page.evidence) {
          toast('Tämä on jo merkitty todisteeksi.');
        } else {
          toast(page.wrongText ?? 'Tässä ei näytä olevan mitään epäilyttävää.');
        }
      },
    });
  },
};
game.onChange(() => interaction.refresh());
interaction.onOpen = (key) => addNote('open', key);
inventoryHud(game, { onHelp: () => { interaction.close(); showIntro(); } });

// Vihjeet pyydetään yläkulman napista (maksaa aikaa, ks. finale.js). Jos peli ei
// etene NUDGE_DELAY sekuntiin, muistutetaan napista – vihjettä ei anneta ilmaiseksi.
const NUDGE_DELAY = 90;
const HINTS = [
  [() => !game.has('key'), 'Työpöydän tietokoneen kannessa on muistilappu: laatikon A varavain on kukkaruukun alla. Kasvi on Ikkuna-näkymässä.'],
  [() => !game.is('drawer_a_open'), 'Avaimessa lukee ”A”. Se avaa työpöydän vasemman laatikon A. Klikkaa laatikkoa, avain käytetään automaattisesti.'],
  [() => !game.hasEvidence('kiuas'), 'Lue laatikon A kuitit ja merkitse todisteeksi se, joka ei ole yrityksen kulu. Katso, minne tavara toimitettiin.'],
  [() => !game.is('drawer_b_open'), 'Laatikon B numerolukon koodi on vuosiluku. Laatikon A lappu kertoo, mistä se löytyy: kunniakirjasta Sohva-näkymässä.'],
  [() => !game.has('invoice_bottom'), 'Laatikon B lapun mukaan laskun loppuosa on silppurissa. Silppuri on Ikkuna-näkymässä työpöydän vasemmalla puolella. Kokoa suikaleet.'],
  [() => !game.hasEvidence('cayman_invoice'), 'Lue koottu lasku ja merkitse se todisteeksi. Lasku 117 puuttuu virallisesta kirjanpidosta.'],
  [() => !game.is('safe_open'), 'Kassakaapin (Kirjahylly, alahylly) koodi on Kalevin hääpäivä muodossa PPKK. Vaimo mainitsee päivän puhelinvastaajassa (Ovi-näkymä).'],
  [() => !game.hasEvidence('second_ledger'), 'Lue kassakaapin musta kirja ja merkitse se todisteeksi.'],
  [() => !game.is('laptop_open'), 'Tietokoneen salasana on Kalevin golftasoitus, pelkkä luku. Se on kaiverrettu golfpokaalin laattaan Kirjahylly-näkymässä.'],
  [() => !game.hasEvidence('cayman_transfer'), 'Avaa tietokoneelta Kalevin kalenteri. Mustan kirjan mukaan siirtojen ajankohdat on sovittu Raimon kanssa. Merkitse siirtomerkintä.'],
  [() => !game.hasEvidence('offshore_account'), 'Mustan kirjan viimeinen rivi: ”Tiliotteet: ylpeyteni takana.” Kalevin ylpeys roikkuu seinällä Sohva-näkymässä. Nosta kehystä.'],
  [() => true, 'Kaikki todisteet on löydetty. Lähetä tarkastusraportti (oikea yläkulma) ennen kuin Kalevi palaa.'],
];
const nextHint = () => HINTS.find(([when]) => when())[1];
const hints = {
  timer: null,
  start() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (!introOpen && !finale?.ending) toast('Jumissa? Voit pyytää vihjeen yläkulmasta – se maksaa viisi minuuttia aikaa.', 'notice');
      this.start();
    }, NUDGE_DELAY * 1000);
  },
};
game.onChange(() => { if (started) hints.start(); });
for (const [id, step] of [['prev', -1], ['next', 1], ['edge-prev', -1], ['edge-next', 1]]) {
  document.getElementById(id).addEventListener('click', () => views.go(views.index + step));
}

addEventListener('resize', () => {
  fitCamera();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  sizeRoomCache();
  dimQuad.material.uniforms.uTexel.value.set(1 / innerWidth, 1 / innerHeight);
  roomDirty = true;
});

if (import.meta.env.DEV) {
  window.__debug = {
    scene, camera, sun, bounce, skyLight, gtao, renderer, views, interaction, game, SECRETS, updateSun, composer, quality,
    get finale() { return finale; },
    // peek([x,y,z], [x,y,z]) vie kameran haluttuun paikkaan, peek() palauttaa
    peek(pos, target) {
      views.override = pos ? { pos, target } : null;
      roomDirty = true;
    },
  };
}

// --- silmukka --------------------------------------------------------------------
// Kun kamera on paikallaan, vain pöly liikkuu, joten 30 kuvaa sekunnissa riittää.
const IDLE_INTERVAL = 1 / 30;
// Jos liikkeen aikana kuvia tulee alle noin 40 sekunnissa, tarkkuutta lasketaan.
const SLOW_FRAME = 1 / 40;
const clock = new THREE.Clock();
let sinceRender = 0;
let slowFrames = 0;
let sunStep = 0;

function lowerQuality() {
  if (pixelRatio <= MIN_PIXEL_RATIO) return;
  pixelRatio = Math.max(MIN_PIXEL_RATIO, pixelRatio - 0.25);
  renderer.setPixelRatio(pixelRatio);
  composer.setPixelRatio(pixelRatio);
  sizeRoomCache();
  roomDirty = true;
}

function drawRoomAndDust() {
  if (roomDirty) {
    composer.render();
    // talteen omaan puskuriin heti, kun kuva on varmasti ehjä
    copyQuad.material.uniforms.tDiffuse.value = composer.readBuffer.texture;
    renderer.setRenderTarget(roomCache);
    copyQuad.render(renderer);
    roomDirty = false;
    updateDebug();
  }
  renderer.setRenderTarget(null);
  renderer.autoClear = false;
  if (interaction.inspecting) {
    dimQuad.material.uniforms.tDiffuse.value = roomCache.texture;
    dimQuad.material.uniforms.uBlur.value = blur;
    dimQuad.render(renderer);
    renderer.clearDepth();
    renderer.render(interaction.scene, interaction.inspectCamera);
  } else {
    copyQuad.material.uniforms.tDiffuse.value = roomCache.texture;
    copyQuad.render(renderer);
    renderer.clearDepth();
    renderer.render(dustScene, camera);
  }
  renderer.autoClear = true;
}

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  if (!ready) return;   // latausnäkymä peittää ruudun, ei piirretä turhaan
  sinceRender += dt;
  views.locked = !!interaction.inspecting || introOpen || !!finale?.ending || !!finale?.paused;
  finale?.update(dt);
  // aurinko liikkuu noin 20 sekunnin välein, ei joka kuvassa (varjot ovat kalliita)
  if (finale && !views.moving && !interaction.inspecting) {
    const step = Math.floor(finale.elapsed / 20) * 20;
    if (step !== sunStep) {
      sunStep = step;
      updateSun(step / finale.timeLimit);
    }
  }
  const moving = views.moving;
  // käynnissä olevat animaatiot; valmiit poistetaan listalta
  const animating = animations.length > 0;
  for (let i = animations.length - 1; i >= 0; i--) {
    if (!animations[i](dt)) animations.splice(i, 1);
  }
  if (animating) {
    roomDirty = true;
    renderer.shadowMap.needsUpdate = true;   // laatikko liikkuu, varjot mukana
  }
  // sumennus liukuu päälle lähikuvan alkaessa (ja nollautuu, kun se suljetaan)
  const blurTarget = interaction.inspecting ? 1 : 0;
  const blurring = Math.abs(blur - blurTarget) > 0.002;
  if (blurring) blur += (blurTarget - blur) * (1 - Math.exp(-dt * 8));
  else blur = blurTarget;
  const busy = interaction.busy || animating || blurring;   // esinettä pyöritetään tai jokin liikkuu
  views.update(dt);
  interaction.update(dt);
  if (!moving && !busy && sinceRender < IDLE_INTERVAL) return;

  if (moving) {
    slowFrames = sinceRender > SLOW_FRAME ? slowFrames + 1 : Math.max(0, slowFrames - 1);
    if (slowFrames > 30) {
      lowerQuality();
      slowFrames = 0;
    }
  }
  sinceRender = 0;
  if (moving) roomDirty = true;
  dust.userData.update(clock.elapsedTime);
  drawRoomAndDust();
});
