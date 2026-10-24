// Paperit ja tekstit: kuitit, muistilaput, diplomi, mökkikuva, ALV-juliste ja
// mappien selkämykset. Kaikki piirretään canvakselle, joten tekstiä on helppo
// muuttaa (ja myöhemmin pulmat voivat lukea samat luvut täältä).
import * as THREE from 'three';

const HAND = '"Marker Felt", "Bradley Hand", "Comic Sans MS", cursive';
const MONO = '"Courier New", Courier, monospace';
const SERIF = 'Georgia, "Times New Roman", serif';

function canvasTexture(w, h, draw, { flipY = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.flipY = flipY;
  return t;
}

// Paperinen pinta: hieman epätasainen sävy, ettei näytä tietokonegrafiikalta.
function paperBackground(g, w, h, color) {
  g.fillStyle = color;
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) {
    g.fillStyle = `rgba(0,0,0,${Math.random() * 0.025})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }
}

function lines(g, rows, x, y, step) {
  rows.forEach((row, i) => {
    if (Array.isArray(row)) {
      g.textAlign = 'left';
      g.fillText(row[0], x, y + i * step);
      g.textAlign = 'right';
      // leveys muunnosmatriisin mukaan (kuitit piirretään skaalattuna)
      g.fillText(row[1], g.canvas.width / g.getTransform().a - x, y + i * step);
      g.textAlign = 'left';
    } else {
      g.fillText(row, x, y + i * step);
    }
  });
}

// --- kuitit (pelisuunnitelman pulma 2: yhteensä 862 €) ---------------------------
export const RECEIPTS = [
  { shop: 'RAVINTOLA KULTAINEN HAARUKKA', date: '14.03.2025', rows: [['Liikelounas x4', '186,00'], ['Kahvit x4', '28,00']], total: '214,00' },
  { shop: 'GOLFKLUBI BIRDIE RY', date: '02.05.2025', rows: [['Greenfee', '120,00'], ['Pallot 12 kpl', '38,00']], total: '158,00' },
  { shop: 'KUKKAKAUPPA ORVOKKI', date: '21.05.2025', rows: [['Kukkakimppu', '90,00']], total: '90,00' },
  { shop: 'RAUTA-ANTTI OY', date: '20.06.2025', rows: [['Puukiuas K16', '400,00']], total: '400,00' },
];

function receiptTexture({ shop, date, rows, total }) {
  // piirretään 2x tarkkuudella, jotta teksti on terävää myös lähikuvassa
  return canvasTexture(512, 1152, (g) => {
    const w = 256, h = 576;
    g.scale(2, 2);
    paperBackground(g, w, h, '#e9e4d6');
    g.fillStyle = '#111';
    g.font = `bold 19px ${MONO}`;
    g.textAlign = 'center';
    shop.split(' ').reduce((acc, word) => {
      const last = acc[acc.length - 1];
      if (last && (last + ' ' + word).length <= 15) acc[acc.length - 1] = last + ' ' + word;
      else acc.push(word);
      return acc;
    }, []).forEach((l, i) => g.fillText(l, w / 2, 50 + i * 24));
    g.font = `bold 17px ${MONO}`;
    g.fillText(date, w / 2, 120);
    g.fillText('- - - - - - - - - - - -', w / 2, 145);
    g.textAlign = 'left';
    lines(g, rows, 16, 185, 30);
    g.textAlign = 'center';
    g.fillText('- - - - - - - - - - - -', w / 2, 400);
    g.font = `bold 22px ${MONO}`;
    lines(g, [['YHT.', `${total} €`]], 16, 435, 0);
    g.font = `bold 15px ${MONO}`;
    g.textAlign = 'center';
    g.fillText('ALV 25,5 % sis.', w / 2, 470);
    g.fillText('KIITOS KÄYNNISTÄ!', w / 2, 520);
  });
}

// --- muistilappu -----------------------------------------------------------------
function noteTexture(text) {
  return canvasTexture(256, 256, (g, w, h) => {
    paperBackground(g, w, h, '#f7e36b');
    g.fillStyle = '#1f3a8a';
    g.font = `34px ${HAND}`;
    g.textAlign = 'center';
    text.split('\n').forEach((l, i, arr) => g.fillText(l, w / 2, h / 2 + (i - (arr.length - 1) / 2) * 42));
  });
}

// --- diplomi sohvan yläpuolelle (korvaa taulun maalauksen) -----------------------
function diplomaTexture() {
  return canvasTexture(1024, 768, (g, w, h) => {
    paperBackground(g, w, h, '#f3ead2');
    // kehys peittää kuvan reunat, joten sisältö pienennetään keskelle
    g.translate(w / 2, h / 2);
    g.scale(0.74, 0.74);
    g.translate(-w / 2, -h / 2);
    g.strokeStyle = '#a8873e';
    g.lineWidth = 10;
    g.strokeRect(40, 40, w - 80, h - 80);
    g.lineWidth = 2;
    g.strokeRect(60, 60, w - 120, h - 120);
    g.fillStyle = '#3b2a12';
    g.textAlign = 'center';
    g.font = `italic 34px ${SERIF}`;
    g.fillText('Kunniakirja', w / 2, 170);
    g.font = `bold 72px ${SERIF}`;
    g.fillText('VUODEN VERONMAKSAJA', w / 2, 290);
    g.font = `bold 96px ${SERIF}`;
    g.fillText('1998', w / 2, 410);
    g.font = `italic 34px ${SERIF}`;
    g.fillText('myönnetään', w / 2, 490);
    g.font = `48px ${SERIF}`;
    g.fillText('Kalevi Kivelle', w / 2, 560);
    g.font = `22px ${SERIF}`;
    g.fillStyle = '#6b5a3a';
    g.fillText('Myöntäjä: Kalevi Kivi', w / 2, 660);
    // kultainen sinetti
    g.fillStyle = '#c99a2e';
    g.beginPath();
    g.arc(w - 170, h - 170, 55, 0, Math.PI * 2);
    g.fill();
  }, { flipY: false });
}

// --- mökkikuva pöydän valokuvakehykseen ------------------------------------------
function cottagePhotoTexture() {
  return canvasTexture(512, 640, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#7fa8d6');
    sky.addColorStop(1, '#f2d7a8');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#2f4a2a';                       // metsänreuna
    for (let x = 0; x < w; x += 18) g.fillRect(x, h * 0.42 - Math.random() * 60, 20, 200);
    const lake = g.createLinearGradient(0, h * 0.55, 0, h);
    lake.addColorStop(0, '#5d82a8');
    lake.addColorStop(1, '#2d4766');
    g.fillStyle = lake;
    g.fillRect(0, h * 0.55, w, h * 0.45);
    g.fillStyle = '#8b1e16';                       // uusi punainen sauna
    g.fillRect(300, h * 0.42, 150, 90);
    g.fillStyle = '#3a2a1e';
    g.beginPath();
    g.moveTo(290, h * 0.42);
    g.lineTo(375, h * 0.34);
    g.lineTo(460, h * 0.42);
    g.fill();
    g.fillStyle = '#7a5a3a';                       // laituri
    g.fillRect(60, h * 0.6, 220, 18);
    g.fillStyle = '#1c1c1c';                       // Kalevi laiturilla
    g.fillRect(150, h * 0.6 - 70, 26, 70);
    g.beginPath();
    g.arc(163, h * 0.6 - 84, 16, 0, Math.PI * 2);
    g.fill();
  }, { flipY: false });
}

// --- ALV-juliste oven viereen ----------------------------------------------------
function posterTexture() {
  return canvasTexture(512, 724, (g, w, h) => {
    paperBackground(g, w, h, '#f5f1e6');
    g.fillStyle = '#1f4e79';
    g.fillRect(0, 0, w, 150);
    g.fillStyle = '#ffffff';
    g.textAlign = 'center';
    g.font = `bold 40px ${SERIF}`;
    g.fillText('VEROVIRASTO', w / 2, 90);
    g.fillStyle = '#1f4e79';
    g.font = `bold 150px ${SERIF}`;
    g.fillText('ALV', w / 2, 330);
    g.font = `bold 110px ${SERIF}`;
    g.fillText('25,5 %', w / 2, 460);
    g.fillStyle = '#333';
    g.font = `italic 38px ${SERIF}`;
    g.fillText('– muista! –', w / 2, 540);
    g.font = `20px ${SERIF}`;
    g.fillText('Yleinen arvonlisäverokanta 1.9.2024 alkaen', w / 2, 650);
  });
}

// --- mapin selkämys --------------------------------------------------------------
function spineTexture(text, bg) {
  return canvasTexture(128, 512, (g, w, h) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#f4f1e8';
    g.fillRect(14, 140, w - 28, 300);
    g.fillStyle = '#222';
    g.font = `bold 30px ${MONO}`;
    g.textAlign = 'center';
    g.save();
    g.translate(w / 2 + 10, 290);
    g.rotate(-Math.PI / 2);
    g.fillText(text, 0, 0);
    g.restore();
  });
}

// Paperiarkki: etupuolella teksti, takapuolella tyhjä paperi (back = takapuolen väri),
// jotta arkki ei katoa, kun sitä käännetään lähikuvassa.
function sheet(name, texture, width, height, { back = 0xebe7dc } = {}) {
  const geometry = new THREE.PlaneGeometry(width, height);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85 }));
  mesh.name = name;
  mesh.receiveShadow = true;
  const backside = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: back, roughness: 0.9 }));
  backside.rotation.y = Math.PI;
  backside.position.z = -0.0002;
  mesh.add(backside);
  return mesh;
}

// Lisää paperit näkymään. Valmiiden mallien kuvat (diplomi, mökkikuva) vaihdetaan
// suoraan niiden omaan materiaaliin.
export function addPaperItems(scene) {
  const DESK = 0.783;

  // kuittinippu pöydän oikealla puolella, hieman sikin sokin
  const receipts = new THREE.Group();
  receipts.name = 'receipts';
  RECEIPTS.forEach((r, i) => {
    const m = sheet(`receipt_${i + 1}`, receiptTexture(r), 0.075, 0.17, { back: 0xe9e4d6 });
    // levitetty viuhkaksi, jotta jokainen kuitti erottuu
    m.rotation.set(-Math.PI / 2, 0, [0.12, -0.06, 0.08, -0.1][i]);
    m.position.set([-0.12, -0.04, 0.04, 0.12][i], i * 0.0006, [0.01, -0.01, 0.015, -0.005][i]);
    receipts.add(m);
  });
  receipts.position.set(1.25, DESK, -0.42);
  scene.add(receipts);

  // muistilaput: pöydän reunalla ja lampun juurella
  const note1 = sheet('note_silppu', noteTexture('Muista\nsilputa!!!'), 0.076, 0.076, { back: 0xf2dc5e });
  note1.rotation.set(-Math.PI / 2, 0, 0.12);
  note1.position.set(0.02, DESK + 0.0008, -0.3);
  scene.add(note1);
  const note2 = sheet('note_avain', noteTexture('Varavain\nsiellä missä\ntaide kasvaa'), 0.076, 0.076, { back: 0xf2dc5e });
  note2.rotation.set(-Math.PI / 2, 0, -0.2);
  note2.position.set(0.48, DESK + 0.0008, -0.95);
  scene.add(note2);

  // ALV-juliste oven oikealla puolella
  const poster = sheet('poster', posterTexture(), 0.42, 0.594, { back: 0xf0ece0 });
  poster.rotation.y = Math.PI;
  poster.position.set(-0.15, 1.55, 1.995);
  scene.add(poster);

  // mappien selkämykset (vastaa build_props.py:n mappien paikkoja)
  const shelf1 = 0.1 + 2.11 / 5 + 0.015;
  [['KIRJANPITO 2025', '#1d3466', 0.10], ['KIRJANPITO 2024', '#1d3466', 0.185], ['TILINPÄÄTÖS', '#7a1410', 0.27]]
    .forEach(([text, bg, z], i) => {
      const s = sheet(`binder_label_${i + 1}`, spineTexture(text, bg), 0.07, 0.28);
      s.rotation.y = Math.PI / 2;
      s.position.set(-2.1585, shelf1 + 0.17, z + 0.0375);
      scene.add(s);
    });

  // valmiiden kehysten kuvat
  scene.getObjectByName('diploma')?.traverse((o) => {
    if (o.isMesh && o.material.name.endsWith('_canvas')) {
      o.material = o.material.clone();
      o.material.map = diplomaTexture();
    }
  });
  scene.getObjectByName('photo')?.traverse((o) => {
    if (o.isMesh && o.material.name.endsWith('_artwork')) {
      o.material = o.material.clone();
      o.material.map = cottagePhotoTexture();
    }
  });
}
