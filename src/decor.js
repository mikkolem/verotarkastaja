// Pienet sisustusesineet, jotka rakennetaan suoraan three.js:n perusmuodoista:
// kahvikuppi, kynäpurkki, paperipino, viskikarahvi ja lasi, golfpokaali ja
// sohvatyyny. Lisäksi kirjasarjojen kopiot saavat eri sävyt, etteivät ne näytä
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

// Kynäpurkki ja muutama kynä lampun viereen.
function penCup() {
  const g = new THREE.Group();
  g.name = 'pens';
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.032, 0.1, 32, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x2b2b2e, roughness: 0.4, metalness: 0.6, side: THREE.DoubleSide }),
  );
  cup.position.y = 0.05;
  g.add(cup);
  const colors = [0x1d3466, 0x7a1410, 0xe8e2d2, 0x1a1a1a];
  colors.forEach((color, i) => {
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.15, 10), new THREE.MeshStandardMaterial({ color, roughness: 0.4 }));
    const a = i * 1.7;
    pen.position.set(Math.cos(a) * 0.016, 0.085, Math.sin(a) * 0.016);
    pen.rotation.set(Math.sin(a) * 0.18, 0, Math.cos(a) * 0.18);
    g.add(pen);
  });
  g.position.set(0.22, DESK, -0.95);
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

// Golfpokaali, jonka laattaan on kaiverrettu Kalevin tasoitus (tietokoneen salasana).
function trophy() {
  const g = new THREE.Group();
  g.name = 'trophy';
  const brass = new THREE.MeshStandardMaterial({ color: 0xd4af5a, roughness: 0.22, metalness: 1 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.12), new THREE.MeshStandardMaterial({ color: 0x1c1410, roughness: 0.35 }));
  base.position.y = 0.025;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.08, 24), brass);
  stem.position.y = 0.09;
  const cupProfile = [[0.02, 0], [0.05, 0.04], [0.058, 0.1], [0.05, 0.13], [0.054, 0.14]].map(([r, y]) => new THREE.Vector2(r, y));
  const cup = new THREE.Mesh(new THREE.LatheGeometry(cupProfile, 40), brass);
  cup.material = brass.clone();
  cup.material.side = THREE.DoubleSide;
  cup.position.y = 0.13;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.021, 24, 16), new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.5 }));
  ball.position.y = 0.285;
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.03), new THREE.MeshStandardMaterial({
    map: label(512, 170, (c, w, h) => {
      const grad = c.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#e8c978');
      grad.addColorStop(1, '#b8903c');
      c.fillStyle = grad;
      c.fillRect(0, 0, w, h);
      c.fillStyle = '#3a2a10';
      c.textAlign = 'center';
      c.font = 'bold 40px Georgia, serif';
      c.fillText('KESÄKISAT · KALEVI K.', w / 2, 62);
      c.font = 'bold 54px Georgia, serif';
      c.fillText(`TASOITUS ${SECRETS.handicap}`, w / 2, 130);
    }),
    roughness: 0.3, metalness: 0.6,
  }));
  plate.position.set(0.0, 0.028, 0.0605);
  g.add(base, stem, cup, ball, plate);
  g.position.set(-2.3, shelf(3), 0.55);
  g.rotation.y = Math.PI / 2;
  return shadowed(g);
}

// Kuvioitu tyyny sohvan kulmaan (isot kukkakuviot, ei tuotemerkkiä).
function pillow(sofa) {
  const g = new THREE.Group();
  g.name = 'pillow';
  const tex = label(512, 512, (c, w, h) => {
    c.fillStyle = '#f4efe3';
    c.fillRect(0, 0, w, h);
    const petals = ['#c8322b', '#e0574a', '#1f2a44'];
    [[120, 130, 110], [370, 110, 90], [150, 380, 95], [390, 370, 120], [270, 250, 60]].forEach(([x, y, r], i) => {
      c.fillStyle = petals[i % 3];
      c.beginPath();
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2;
        c.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.5, r * 0.36, a, 0, Math.PI * 2);
      }
      c.fill();
      c.fillStyle = '#1b1b1b';
      c.beginPath();
      c.arc(x, y, r * 0.18, 0, Math.PI * 2);
      c.fill();
    });
  });
  // pyöristetty tyyny: litistetty pallo
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 24), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
  mesh.scale.set(1, 1, 0.42);
  g.add(mesh);
  // sohvan rajat kertovat istuimen korkeuden ja selkänojan paikan
  const box = new THREE.Box3().setFromObject(sofa);
  g.position.set(box.max.x - 0.2, box.min.y + (box.max.y - box.min.y) * 0.55, box.min.z + 0.33);
  g.rotation.set(0.1, -Math.PI / 2 + 0.45, 0);
  return shadowed(g);
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
  scene.add(mug(), penCup(), paperStack(), whisky(), trophy());
  const sofa = scene.getObjectByName('sofa');
  if (sofa) scene.add(pillow(sofa));
  tintBooks(scene);
}
