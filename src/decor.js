// Pienet sisustusesineet, jotka rakennetaan suoraan three.js:n perusmuodoista:
// kahvikuppi, paperipino, viskikarahvi ja lasi, sekä kassakaapin, silppurin ja
// pokaalin (Poly Havenin pikari) lisäosat valmiiden mallien päälle. Tyyny on Poly Havenin. Lisäksi kirjasarjojen kopiot saavat eri sävyt, etteivät ne näytä
// samalta hyllyltä viisi kertaa. Kaikki kevyttä geometriaa, ei uusia latauksia.
import * as THREE from 'three';
import { SECRETS } from './game.js';

const DESK = 0.782;
const SIDEBOARD = 0.85;
const shelf = (i) => 0.1 + i * (2.11 / 5) + 0.015;

function label(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function shadowed(obj) {
  obj.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  return obj;
}

// Kahvikuppi "Maailman paras johtaja" pöydän vasempaan etukulmaan.
function mug() {
  const g = new THREE.Group();
  g.name = 'mug';
  const tex = label(512, 256, (c, w, h) => {
    c.fillStyle = '#f4f1ea';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#9c2a1d';
    c.textAlign = 'center';
    c.font = 'bold 44px Georgia, serif';
    c.fillText('MAAILMAN PARAS', w / 2, 110);
    c.font = 'bold 56px Georgia, serif';
    c.fillText('JOHTAJA', w / 2, 175);
  });
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.041, 0.036, 0.095, 40, 1, true),
    new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.25, clearcoat: 0.6, side: THREE.DoubleSide }),
  );
  body.position.y = 0.0475;
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.036, 32), new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.3 }));
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = 0.001;
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.039, 32), new THREE.MeshPhysicalMaterial({ color: 0x2a160a, roughness: 0.08, clearcoat: 1 }));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.075;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.006, 12, 32, Math.PI), new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.3 }));
  handle.rotation.z = -Math.PI / 2;
  handle.position.set(0.042, 0.05, 0);
  g.add(body, bottom, coffee, handle);
  g.position.set(0.12, DESK, -0.42);
  g.rotation.y = 2.4;
  return shadowed(g);
}

// Paperipino: tulosteita ja päällimmäisenä pankin tiliote.
function paperStack() {
  const g = new THREE.Group();
  g.name = 'papers';
  const tex = label(420, 594, (c, w, h) => {
    c.fillStyle = '#f2efe6';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#1f4e79';
    c.fillRect(0, 0, w, 54);
    c.fillStyle = '#fff';
    c.font = 'bold 24px Georgia, serif';
    c.fillText('POHJOLAN SÄÄSTÖPANKKI', 20, 36);
    c.fillStyle = '#222';
    c.font = '16px "Courier New", monospace';
    c.fillText('Tiliote 6/2025 · Kivi & Kumppanit Oy', 20, 90);
    for (let i = 0; i < 14; i++) {
      c.fillStyle = i % 2 ? '#e9e4d8' : '#f2efe6';
      c.fillRect(20, 110 + i * 30, w - 40, 30);
    }
    c.fillStyle = '#333';
    c.font = '14px "Courier New", monospace';
    for (let i = 0; i < 14; i++) c.fillText(`${String(2 + i).padStart(2, '0')}.06.  ${i % 3 === 0 ? 'PANO' : 'OTTO'}  ${(1240 + i * 377) % 9000},00`, 28, 130 + i * 30);
  });
  const sheets = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.018, 0.297), new THREE.MeshStandardMaterial({ color: 0xe9e5da, roughness: 0.95 }));
  sheets.position.y = 0.009;
  const top = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.297), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }));
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.0185;
  g.add(sheets, top);
  g.position.set(1.25, DESK, -0.52);
  g.rotation.y = -0.12;
  return shadowed(g);
}

// Viskikarahvi ja lasi sivupöydälle. Lasi on läpinäkyvä pinta (ei valonmurtoa:
// se vaatisi huoneen piirtämisen uudelleen joka kuvassa).
function whisky() {
  const g = new THREE.Group();
  g.name = 'decanter';
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xdfe6ea, roughness: 0.04, transparent: true, opacity: 0.16, clearcoat: 1, depthWrite: false,
  });
  const whiskyMat = new THREE.MeshPhysicalMaterial({ color: 0xb8651a, roughness: 0.05, transparent: true, opacity: 0.85, clearcoat: 1 });
  const profile = [];
  [[0.0, 0], [0.055, 0.005], [0.065, 0.05], [0.06, 0.11], [0.04, 0.15], [0.022, 0.17], [0.022, 0.23], [0.028, 0.245]]
    .forEach(([r, y]) => profile.push(new THREE.Vector2(r, y)));
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), glassMat);
  const liquid = new THREE.Mesh(new THREE.LatheGeometry(profile.slice(0, 4).map((v) => new THREE.Vector2(v.x * 0.94, v.y * 0.95 + 0.003)), 48), whiskyMat);
  const stopper = new THREE.Mesh(new THREE.SphereGeometry(0.03, 24, 16), glassMat.clone());
  stopper.position.y = 0.27;
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.03, 0.085, 32, 1, true), glassMat.clone());
  glass.material.side = THREE.DoubleSide;
  glass.position.set(0.14, 0.0425, 0.03);
  const dram = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.029, 0.03, 32), whiskyMat.clone());
  dram.position.set(0.14, 0.016, 0.03);
  g.add(body, liquid, stopper, glass, dram);
  g.position.set(1.32, SIDEBOARD, 1.74);
  g.traverse((o) => { if (o.isMesh) o.receiveShadow = true; });
  body.castShadow = stopper.castShadow = glass.castShadow = false;
  liquid.castShadow = dram.castShadow = true;
  return g;
}

// Kassakaapin oveen: valmistajan kyltti, näppäimistö näyttöineen ja kulmapultit.
// Liitetään oveen (safe_door), jotta ne kääntyvät sen mukana.
function safeDetails(scene) {
  const door = scene.getObjectByName('safe_door');
  if (!door) return;
  const parts = [];
  const faceX = -2.147;   // oven etupinta (+x suuntaan)
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, roughness: 0.2, metalness: 1 });
  // kyltti
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.022), new THREE.MeshStandardMaterial({
    map: label(512, 112, (c, w, h) => {
      c.fillStyle = '#d9c38a';
      c.fillRect(0, 0, w, h);
      c.fillStyle = '#2a2118';
      c.textAlign = 'center';
      c.font = 'bold 40px Georgia, serif';
      c.fillText('SECURA · HELSINKI', w / 2, 70);
    }),
    roughness: 0.3, metalness: 0.6,
  }));
  sign.position.set(faceX, 0.38, -0.41);
  parts.push(sign);
  // näppäimistö ja näyttö
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.1), new THREE.MeshPhysicalMaterial({
    map: label(300, 400, (c, w, h) => {
      c.fillStyle = '#17181b';
      c.fillRect(0, 0, w, h);
      c.fillStyle = '#0f2a1a';
      c.fillRect(24, 22, w - 48, 64);
      c.fillStyle = '#6fe08a';
      c.font = 'bold 44px "Courier New", monospace';
      c.textAlign = 'center';
      c.fillText('- - - -', w / 2, 70);
      const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'];
      keys.forEach((k, i) => {
        const x = 24 + (i % 3) * 86, y = 104 + Math.floor(i / 3) * 70;
        c.fillStyle = '#3a3c42';
        c.fillRect(x, y, 70, 56);
        c.fillStyle = '#e8e8e8';
        c.font = 'bold 26px Arial, sans-serif';
        c.fillText(k, x + 35, y + 37);
      });
    }),
    roughness: 0.35, clearcoat: 0.5,
  }));
  pad.position.set(faceX, 0.29, -0.48);
  parts.push(pad);
  // kulmapultit
  for (const [y, z] of [[0.15, -0.56], [0.15, -0.26], [0.385, -0.56], [0.385, -0.26]]) {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 16), chrome);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(faceX + 0.001, y, z);
    parts.push(bolt);
  }
  for (const p of parts) {
    if (p.geometry.type === 'PlaneGeometry') p.rotation.y = Math.PI / 2;
    p.castShadow = false;
    p.receiveShadow = true;
    scene.add(p);
    door.attach(p);
  }
}

// Silppuriin: savunvärinen ikkuna, suikaleita säiliössä, merkki ja tukossa oleva merkkivalo.
function shredderDetails(scene) {
  const shredder = scene.getObjectByName('shredder');
  if (!shredder) return;
  const parts = [];
  const paper = new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: 0.9, side: THREE.DoubleSide });
  // Säiliön sisus maalataan ikkunaan: runko on umpinainen laatikko, joten oikeat
  // suikaleet eivät näkyisi sen läpi. Tumma sisätila, kasa suikaleita, kiiltävä pinta.
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.2), new THREE.MeshPhysicalMaterial({
    map: label(520, 400, (c, w, h) => {
      const grad = c.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#15161a');
      grad.addColorStop(1, '#23252a');
      c.fillStyle = grad;
      c.fillRect(0, 0, w, h);
      // suikalekasa alhaalla, muutama pystyssä
      for (let i = 0; i < 90; i++) {
        const x = Math.random() * w, y = h * 0.55 + Math.random() * h * 0.45;
        const len = 40 + Math.random() * 120, a = (Math.random() - 0.5) * 1.2;
        c.save();
        c.translate(x, y);
        c.rotate(a);
        c.fillStyle = `rgba(${225 + Math.random() * 25}, ${220 + Math.random() * 20}, ${205 + Math.random() * 20}, ${0.75 + Math.random() * 0.25})`;
        c.fillRect(-4, -len / 2, 8, len);
        c.restore();
      }
      for (let i = 0; i < 14; i++) {
        const x = 40 + Math.random() * (w - 80), len = 120 + Math.random() * 160;
        c.save();
        c.translate(x, h * 0.65);
        c.rotate((Math.random() - 0.5) * 0.4);
        c.fillStyle = 'rgba(236, 232, 220, 0.9)';
        c.fillRect(-4, -len, 8, len);
        c.restore();
      }
      // heijastus lasin yläreunassa
      const sheen = c.createLinearGradient(0, 0, w, h * 0.5);
      sheen.addColorStop(0, 'rgba(255,255,255,0.18)');
      sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
      c.fillStyle = sheen;
      c.fillRect(0, 0, w, h);
    }),
    roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05,
  }));
  glass.position.set(-0.775, 0.17, -1.6085);
  parts.push(glass);
  // ikkunan kehys
  const frame = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.22), new THREE.MeshStandardMaterial({
    map: label(280, 220, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      c.strokeStyle = '#2a2b2e';
      c.lineWidth = 12;
      c.strokeRect(6, 6, w - 12, h - 12);
    }),
    transparent: true, roughness: 0.5,
  }));
  frame.position.set(-0.775, 0.17, -1.608);
  parts.push(frame);
  // merkki
  const brand = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.018), new THREE.MeshStandardMaterial({
    map: label(400, 72, (c, w, h) => {
      c.fillStyle = '#2a2b2e';
      c.fillRect(0, 0, w, h);
      c.fillStyle = '#d0d0d0';
      c.font = 'bold 40px Arial, sans-serif';
      c.textAlign = 'center';
      c.fillText('SILPPU 3000', w / 2, 50);
    }),
    roughness: 0.5,
  }));
  brand.position.set(-0.775, 0.32, -1.6085);
  parts.push(brand);
  // ohjauspaneeli kannella: punainen valo = tukossa
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.03), new THREE.MeshStandardMaterial({
    map: label(240, 120, (c, w, h) => {
      c.fillStyle = '#2a2b2e';
      c.fillRect(0, 0, w, h);
      c.fillStyle = '#9a9a9a';
      c.font = 'bold 22px Arial, sans-serif';
      ['AUTO', 'REV', 'OFF'].forEach((t, i) => c.fillText(t, 16 + i * 76, 100));
      c.fillStyle = '#3a3c42';
      [0, 1, 2].forEach((i) => c.fillRect(16 + i * 76, 30, 50, 40));
    }),
    roughness: 0.5,
  }));
  panel.rotation.x = -Math.PI / 2;
  panel.position.set(-0.655, 0.4405, -1.66);
  parts.push(panel);
  const led = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.003, 12), new THREE.MeshStandardMaterial({
    color: 0x330000, emissive: 0xff2010, emissiveIntensity: 3, roughness: 0.3,
  }));
  led.position.set(-0.69, 0.442, -1.64);
  parts.push(led);
  for (const p of parts) {
    p.castShadow = false;
    p.receiveShadow = true;
    scene.add(p);
    shredder.attach(p);
  }
}

// Poly Havenin messinkipikari pokaalina: vain ensimmäinen malja näytetään, ja sen
// eteen lisätään kaiverrettu laatta (Kalevin tasoitus) sekä golfpallo maljan suulle.
function trophyDetails(scene) {
  const trophy = scene.getObjectByName('trophy');
  if (!trophy) return;
  let goblet;
  trophy.traverse((o) => {
    if (o.name === 'brass_goblet_02' || o.name === 'brass_goblet_03') o.visible = false;
    if (o.name === 'brass_goblet_01') goblet = o;
  });
  // keskitetään näkyvä malja hyllypaikkaan (mallin origo ei ole maljan alla)
  trophy.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(goblet ?? trophy);
  const center = box.getCenter(new THREE.Vector3());
  trophy.position.x += -2.3 - center.x;
  trophy.position.z += 0.55 - center.z;
  trophy.position.y += shelf(3) - box.min.y;
  trophy.updateMatrixWorld(true);
  box.setFromObject(goblet ?? trophy);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.028), new THREE.MeshPhysicalMaterial({
    map: label(512, 160, (c, w, h) => {
      const grad = c.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#f0d58a');
      grad.addColorStop(0.5, '#c9a24e');
      grad.addColorStop(1, '#e8c874');
      c.fillStyle = grad;
      c.fillRect(0, 0, w, h);
      c.strokeStyle = '#8a6a26';
      c.lineWidth = 6;
      c.strokeRect(8, 8, w - 16, h - 16);
      c.textAlign = 'center';
      c.fillStyle = 'rgba(255,245,210,0.7)';
      c.font = 'bold 36px Georgia, serif';
      c.fillText('KESÄKISAT · KALEVI K.', w / 2 + 1, 60 + 1);
      c.font = 'bold 52px Georgia, serif';
      c.fillText(`TASOITUS ${SECRETS.handicap}`, w / 2 + 1, 124 + 1);
      c.fillStyle = '#3a2a10';
      c.font = 'bold 36px Georgia, serif';
      c.fillText('KESÄKISAT · KALEVI K.', w / 2, 60);
      c.font = 'bold 52px Georgia, serif';
      c.fillText(`TASOITUS ${SECRETS.handicap}`, w / 2, 124);
    }),
    roughness: 0.25, metalness: 0.7, clearcoat: 0.4,
  }));
  // laatta nojaa pikarin jalkaan huoneen puolella (+x)
  plate.position.set(box.max.x + 0.004, box.min.y + 0.016, (box.min.z + box.max.z) / 2);
  plate.rotation.set(0, Math.PI / 2, 0);
  plate.rotateX(-0.25);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.021, 32, 24), new THREE.MeshPhysicalMaterial({
    map: label(256, 128, (c, w, h) => {
      c.fillStyle = '#f6f6f2';
      c.fillRect(0, 0, w, h);
      c.fillStyle = '#d9d9d4';
      for (let y = 6; y < h; y += 12) for (let x = (y / 12) % 2 ? 6 : 0; x < w; x += 12) { c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.fill(); }
    }),
    roughness: 0.45, clearcoat: 0.3,
  }));
  ball.position.set((box.min.x + box.max.x) / 2, box.max.y - 0.004, (box.min.z + box.max.z) / 2);
  for (const p of [plate, ball]) {
    p.castShadow = p.receiveShadow = true;
    scene.add(p);
    trophy.attach(p);
  }
}

// Poly Havenin tyyny sohvan kulmaan selkänojaa vasten; paikka lasketaan sohvan rajoista.
function placePillow(scene) {
  const pillow = scene.getObjectByName('pillow');
  const sofa = scene.getObjectByName('sofa');
  if (!pillow || !sofa) return;
  const box = new THREE.Box3().setFromObject(sofa);
  const h = box.max.y - box.min.y;
  pillow.position.set(box.max.x - 0.22, box.min.y + h * 0.42, box.min.z + 0.36);
  pillow.rotation.set(0.12, -Math.PI / 2 + 0.35, 0);
}

// Kirjasarjojen kopiot eri sävyisiksi (ja hieman eri kokoisiksi).
function tintBooks(scene) {
  const tints = { books1: 0xe0d2b8, books2: 0x6f86b8, books3: 0xb86a52, books4: 0x7fa36e, books5: 0xffffff };
  const scales = { books1: 1, books2: 0.94, books3: 1.04, books4: 0.97, books5: 1 };
  for (const [name, tint] of Object.entries(tints)) {
    const obj = scene.getObjectByName(name);
    if (!obj) continue;
    obj.scale.multiplyScalar(scales[name]);
    obj.traverse((o) => {
      if (!o.isMesh) return;
      o.material = o.material.clone();
      o.material.color.set(tint);
    });
  }
}

export function addDecor(scene) {
  scene.add(mug(), paperStack(), whisky());
  safeDetails(scene);
  shredderDetails(scene);
  trophyDetails(scene);
  placePillow(scene);
  tintBooks(scene);
}
