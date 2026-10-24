// Paperit ja tekstit: kuitit, muistilaput, diplomi, mökkikuva, ALV-juliste ja
// mappien selkämykset. Kaikki piirretään canvakselle, joten tekstiä on helppo
// muuttaa (ja myöhemmin pulmat voivat lukea samat luvut täältä).
import * as THREE from 'three';
import { game } from './game.js';

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
  { shop: 'RAUTA-ANTTI OY', date: '20.06.2025', rows: [['Puukiuas K16', '400,00']], total: '400,00', evidence: 'kiuas' },
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

// --- laatikon B paperit (johtavat pulmaan 3) -----------------------------------------
// Pirjon lappu laatikossa A: vihje laatikon B koodiin (diplomin vuosi 1998)
function pirjoNoteTexture() {
  return canvasTexture(420, 420, (g, w, h) => {
    paperBackground(g, w, h, '#fbf8ee');
    g.fillStyle = '#5a2a6a';
    g.font = `27px ${HAND}`;
    ['Kalevi,', 'laatikon B koodi on', 'se vuosi, josta olet', 'niin ylpeä.', 'Unohdat sen aina.', '        – P.'].forEach((l, i) => g.fillText(l, 26, 60 + i * 56));
  });
}

function invoiceHalfTexture() {
  return canvasTexture(840, 600, (g, w, h) => {
    // revitty alareuna: piirretään paperi sahalaitaisena monikulmiona
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(w, 0);
    for (let x = w; x >= 0; x -= 24) g.lineTo(x, h - 30 - Math.random() * 40);
    g.closePath();
    g.save();
    g.clip();
    paperBackground(g, w, h, '#f3efe4');
    g.fillStyle = '#1a1a1a';
    g.font = `bold 40px ${SERIF}`;
    g.fillText('MYYNTILASKU', 50, 80);
    g.font = `20px ${MONO}`;
    g.fillText('Nro 2025-117        Päiväys 30.6.2025', 50, 125);
    g.fillRect(50, 145, w - 100, 2);
    g.font = `bold 18px ${MONO}`;
    g.fillText('MYYJÄ', 50, 190);
    g.fillText('OSTAJA', 450, 190);
    g.font = `18px ${MONO}`;
    ['Kivi & Kumppanit Oy', 'Kivikatu 1', '00100 Helsinki'].forEach((l, i) => g.fillText(l, 50, 220 + i * 26));
    ['Kivi Consulting Ltd', 'Harbour Road 7', 'George Town', 'CAYMAN ISLANDS'].forEach((l, i) => g.fillText(l, 450, 220 + i * 26));
    g.font = `bold 18px ${MONO}`;
    g.fillText('Erittely', 50, 370);
    g.font = `18px ${MONO}`;
    g.fillText('Konsultointipalvelut', 50, 400);
    g.restore();
  }, { flipY: true });
}

function safeNoteTexture() {
  return canvasTexture(420, 420, (g, w, h) => {
    paperBackground(g, w, h, '#fbfaf4');
    g.strokeStyle = 'rgba(80, 120, 200, 0.35)';
    for (let y = 70; y < h; y += 42) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
    g.fillStyle = '#1f3a8a';
    g.font = `30px ${HAND}`;
    ['Silppuri –', 'älä unohda!!!', '', 'Kassakaappi:', 'HÄÄPÄIVÄ', '(älä kirjoita ylös)'].forEach((l, i) => g.fillText(l, 28, 62 + i * 42));
  });
}

// --- pulma 3: laskun alaosa silppurista, koottu lasku ja virallinen tuloslaskelma ---
function invoiceBottomCanvas() {
  const c = document.createElement('canvas');
  c.width = 840;
  c.height = 480;
  const g = c.getContext('2d');
  // revitty yläreuna
  g.beginPath();
  g.moveTo(0, c.height);
  g.lineTo(c.width, c.height);
  for (let x = c.width; x >= 0; x -= 24) g.lineTo(x, 20 + Math.random() * 40);
  g.closePath();
  g.clip();
  paperBackground(g, c.width, c.height, '#f3efe4');
  // silppurin terien jäljet
  g.fillStyle = 'rgba(0,0,0,0.07)';
  for (let x = 30; x < c.width; x += 60) g.fillRect(x, 0, 2, c.height);
  g.fillStyle = '#1a1a1a';
  g.font = `18px ${MONO}`;
  g.fillText('kesäkuu 2025 (sopimus KK/CI-04)', 50, 105);
  g.fillRect(50, 130, c.width - 100, 1);
  // EU:n ulkopuolelle myyty palvelu: ei Suomen arvonlisäveroa (oikein laskutettu),
  // mutta tuloa ei ole kirjattu yhtiön kirjanpitoon.
  const rows = [['Veroton hinta', '10 000,00 €'], ['ALV 0 % (myynti EU:n ulkop.)', '0,00 €'], ['YHTEENSÄ', '10 000,00 €']];
  rows.forEach(([label, value], i) => {
    const y = 175 + i * 40;
    g.font = i === 2 ? `bold 22px ${MONO}` : `20px ${MONO}`;
    g.textAlign = 'left';
    g.fillText(label, 50, y);
    g.textAlign = 'right';
    g.fillText(value, c.width - 50, y);
  });
  g.textAlign = 'left';
  g.font = `16px ${MONO}`;
  g.fillText('Maksuehto: heti netto', 50, 330);
  g.fillText('Tilille: Cayman National Bank, George Town', 50, 360);
  g.font = `italic 15px ${SERIF}`;
  g.fillStyle = '#555';
  g.fillText('Ei kirjanpitoon. – K.K.', 50, 420);
  return c;
}

function assembledInvoiceCanvas(top, bottom) {
  const c = document.createElement('canvas');
  c.width = 840;
  c.height = 600 + 480 - 100;
  const g = c.getContext('2d');
  // puoliskot limittäin, jotta revityt reunat peittävät toisensa lähes kokonaan
  g.drawImage(bottom, 0, 600 - 100);
  g.drawImage(top, 0, 0);
  // teippiliuskat saumassa
  g.fillStyle = 'rgba(240, 235, 200, 0.55)';
  for (const x of [120, 400, 680]) {
    g.save();
    g.translate(x, 535);
    g.rotate(-0.08 + Math.random() * 0.16);
    g.fillRect(-60, -18, 120, 36);
    g.restore();
  }
  return c;
}

// Virallinen tuloslaskelma (Kirjanpito 2025 -mappi): vertailukohta B-kirjanpidolle
function officialPnlCanvas() {
  const c = document.createElement('canvas');
  c.width = 600;
  c.height = 840;
  const g = c.getContext('2d');
  paperBackground(g, c.width, c.height, '#f1ede2');
  g.fillStyle = '#1a1a1a';
  g.font = `bold 26px ${MONO}`;
  g.fillText('KIVI & KUMPPANIT OY', 40, 70);
  g.font = `20px ${MONO}`;
  g.fillText('Tuloslaskelma 1.1.–30.6.2025', 40, 105);
  g.fillRect(40, 125, c.width - 80, 2);
  const rows = [
    ['Liikevaihto', '610 000'],
    ['Materiaalit ja palvelut', '−320 000'],
    ['Henkilöstökulut', '−210 000'],
    ['Liiketoiminnan muut kulut', '−62 000'],
    ['LIIKEVOITTO', '18 000'],
  ];
  rows.forEach(([label, value], i) => {
    const y = 190 + i * 64;
    if (i === 4) g.fillRect(40, y - 40, c.width - 80, 1);
    g.font = i === 4 ? `bold 21px ${MONO}` : `20px ${MONO}`;
    g.textAlign = 'left';
    g.fillText(label, 40, y);
    g.textAlign = 'right';
    g.fillText(value, c.width - 40, y);
  });
  g.textAlign = 'left';
  g.fillStyle = '#1f3a8a';
  g.font = `28px ${HAND}`;
  ['Kalevi! Liikevaihto ei', 'täsmää pankkitiliin.', 'Missä on kesäkuun', 'lasku nro 117?? – Pirjo'].forEach((l, i) => g.fillText(l, 40, 560 + i * 44));
  return c;
}

// --- pulma 4: kassakaapin B-kirjanpito ja tietokoneen kalenteri ----------------------
function secretLedgerCanvas() {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 860;
  const g = c.getContext('2d');
  paperBackground(g, c.width, c.height, '#ece6d6');
  g.fillStyle = '#7a1410';
  g.font = `bold 30px ${MONO}`;
  g.fillText('KIRJANPITO ”B”', 40, 70);
  g.fillStyle = '#1a1a1a';
  g.font = `18px ${MONO}`;
  g.fillText('Henkilökohtainen – EI VEROTTAJALLE', 40, 105);
  g.fillRect(40, 125, c.width - 80, 2);
  const rows = [
    ['', 'virallinen', 'todellinen'],
    ['Liikevaihto', '610 000', '1 480 000'],
    ['  josta Kivi Consulting', '–', '870 000'],
    ['Edustus (”mökki”)', '1 247', '14 300'],
    ['Taideteokset', '12 000', '89'],
  ];
  rows.forEach(([label, a, b], i) => {
    const y = 175 + i * 62;
    g.font = i === 0 ? `bold 16px ${MONO}` : `18px ${MONO}`;
    g.textAlign = 'left';
    g.fillText(label, 40, y);
    g.textAlign = 'right';
    g.fillText(a, 440, y);
    g.font = i === 0 ? `bold 16px ${MONO}` : `bold 18px ${MONO}`;
    g.fillText(b, c.width - 40, y);
  });
  g.textAlign = 'left';
  g.fillStyle = '#1f3a8a';
  g.font = `28px ${HAND}`;
  ['Ero siirretty Caymanille', '”golfmatkoina”.', 'Ks. kalenteri!'].forEach((l, i) => g.fillText(l, 40, 560 + i * 46));
  g.fillStyle = '#7a1410';
  g.font = `italic 17px ${SERIF}`;
  g.fillText('(Viherkasvin todellinen hinta: 89 € Plantagenista.)', 40, 780);
  return c;
}

export const CALENDAR = [
  ['Ma 23.6.', '10–11', 'Hallituksen kokous (= minä)'],
  ['Ti 24.6.', '12–15', 'Liikelounas, Kultainen Haarukka'],
  ['Ke 25.6.', '8–16', 'Golf (työmatka)'],
  ['To 26.6.', '9–10', 'Verotarkastus?? EI KOSKAAN'],
  ['Pe 27.6.', '14:00', 'SIIRTO CAYMANILLE 870 000 € – ”golfmatka”'],
];

function calendarCanvas() {
  const c = document.createElement('canvas');
  c.width = 1000;
  c.height = 640;
  const g = c.getContext('2d');
  g.fillStyle = '#e9eef5';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#1f4e79';
  g.fillRect(0, 0, c.width, 70);
  g.fillStyle = '#fff';
  g.font = `bold 26px ${SERIF}`;
  g.fillText('Kalenteri – Kalevi Kivi', 30, 45);
  g.font = `18px ${SERIF}`;
  g.textAlign = 'right';
  g.fillText('Viikko 26 / 2025', c.width - 30, 45);
  g.textAlign = 'left';
  CALENDAR.forEach(([day, time, text], i) => {
    const y = 100 + i * 104;
    const urgent = text.startsWith('SIIRTO');
    g.fillStyle = urgent ? '#fde2df' : '#ffffff';
    g.fillRect(30, y, c.width - 60, 88);
    g.fillStyle = urgent ? '#c0392b' : '#1f4e79';
    g.fillRect(30, y, 8, 88);
    g.fillStyle = '#333';
    g.font = `bold 20px ${SERIF}`;
    g.fillText(day, 60, y + 36);
    g.font = `18px ${MONO}`;
    g.fillText(time, 60, y + 66);
    g.font = `${urgent ? 'bold ' : ''}24px ${SERIF}`;
    g.fillStyle = urgent ? '#a5281b' : '#222';
    g.fillText(text, 220, y + 53);
  });
  return c;
}

// Kaikkien arkkien kuvat nimen mukaan lukunäkymää varten.
const PAGES = new Map();

// Paperiarkki: etupuolella teksti, takapuolella tyhjä paperi (back = takapuolen väri),
// jotta arkki ei katoa, kun sitä käännetään lähikuvassa.
function sheet(name, texture, width, height, { back = 0xebe7dc, torn = false } = {}) {
  const geometry = new THREE.PlaneGeometry(width, height);
  // torn = revitty reuna: tekstuurin läpinäkyvät kohdat leikataan pois
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    map: texture, roughness: 0.85, alphaTest: torn ? 0.5 : 0,
  }));
  mesh.name = name;
  mesh.receiveShadow = true;
  PAGES.set(name, texture.image);
  const backside = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    color: back, roughness: 0.9, alphaMap: torn ? texture : null, alphaTest: torn ? 0.5 : 0,
  }));
  backside.rotation.y = Math.PI;
  backside.position.z = -0.0002;
  mesh.add(backside);
  return mesh;
}

// Lisää paperit näkymään. Valmiiden mallien kuvat (diplomi, mökkikuva) vaihdetaan
// suoraan niiden omaan materiaaliin.
export function addPaperItems(scene) {
  const DESK = 0.783;

  // Laatikko A: kuittinippu viuhkana pääkirjan otteen päällä. Paperit ovat laatikon
  // lapsia, joten ne liikkuvat sen mukana, kun laatikko avataan.
  const drawerA = scene.getObjectByName('drawer_a');
  const DRAWER_BOTTOM = 0.532;
  const receipts = new THREE.Group();
  receipts.name = 'receipts';
  RECEIPTS.forEach((r, i) => {
    const m = sheet(`receipt_${i + 1}`, receiptTexture(r), 0.075, 0.17, { back: 0xe9e4d6 });
    m.rotation.set(-Math.PI / 2, 0, [0.12, -0.06, 0.08, -0.1][i]);
    m.position.set([-0.12, -0.04, 0.04, 0.12][i], 0.002 + i * 0.0006, [0.01, -0.01, 0.015, -0.005][i]);
    receipts.add(m);
  });
  receipts.position.set(-0.045, DRAWER_BOTTOM, -0.33);
  // attach säilyttää maailmasijainnin (pakattu malli ei ole origossa)
  drawerA.updateMatrixWorld(true);
  drawerA.attach(receipts);
  const notePirjo = sheet('note_pirjo', pirjoNoteTexture(), 0.09, 0.09, { back: 0xf4f2ea });
  notePirjo.rotation.set(-Math.PI / 2, 0, -0.15);
  notePirjo.position.set(-0.13, DRAWER_BOTTOM + 0.004, -0.235);
  drawerA.attach(notePirjo);

  // Laatikko B: puolikas lasku Caymansaarille ja lappu kassakaapin koodista
  const drawerB = scene.getObjectByName('drawer_b');
  const papersB = new THREE.Group();
  papersB.name = 'drawer_b_papers';
  const invoice = sheet('invoice_half', invoiceHalfTexture(), 0.21, 0.15, { torn: true });
  invoice.rotation.set(-Math.PI / 2, 0, -0.05);
  invoice.position.set(0, 0.001, -0.05);
  const safeNote = sheet('note_safe', safeNoteTexture(), 0.09, 0.09, { back: 0xf4f2ea });
  safeNote.rotation.set(-Math.PI / 2, 0, 0.25);
  safeNote.position.set(0.09, 0.0025, 0.03);
  papersB.add(invoice, safeNote);
  papersB.position.set(1.245, DRAWER_BOTTOM, -0.3);
  drawerB.updateMatrixWorld(true);
  drawerB.attach(papersB);

  // Varavainlappu teipattuna tietokoneen kanteen pelaajan puolelle, jotta se
  // huomataan heti ensimmäisestä kuvakulmasta.
  const noteKey = sheet('note_avain', noteTexture('Varavain\nsiellä missä\ntaide kasvaa'), 0.1, 0.1, { back: 0xf2dc5e });
  noteKey.rotation.set(-0.12, 0, 0.06);
  noteKey.position.set(0.95, 0.97, -0.584);
  scene.add(noteKey);

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

// Lukunäkymän sivut esineelle. markable = sivun voi merkitä epäilyttäväksi,
// evidence = todisteen tunnus, jos merkintä osuu oikeaan.
export function pagesFor(key) {
  if (key === 'receipts') {
    return [
      ...RECEIPTS.map((r, i) => ({
        canvas: PAGES.get(`receipt_${i + 1}`),
        label: r.shop,
        markable: true,
        evidence: r.evidence,
        wrongText: 'Tämä on tavallinen edustuskulu: liikeasiakkaiden kestitsemistä.',
      })),
    ];
  }
  const assembled = () => {
    if (!PAGES.has('invoice_assembled')) {
      PAGES.set('invoice_assembled', assembledInvoiceCanvas(PAGES.get('invoice_half'), invoiceBottomCanvas()));
    }
    return { canvas: PAGES.get('invoice_assembled'), label: 'Koottu myyntilasku', markable: true, evidence: 'cayman_invoice' };
  };
  if (key === 'drawer_b_papers') {
    return [
      game.has('invoice_bottom') ? assembled() : { canvas: PAGES.get('invoice_half'), label: 'Puolikas myyntilasku' },
      { canvas: PAGES.get('note_safe'), label: 'Käsin kirjoitettu lappu' },
    ];
  }
  if (key === 'invoice_assembled') return [assembled()];
  if (key === 'binder_1') return [{ canvas: once('pnl', officialPnlCanvas), label: 'Tuloslaskelma' }];
  if (key === 'ledger_book') {
    return [{ canvas: once('secret', secretLedgerCanvas), label: 'B-kirjanpito', markable: true, evidence: 'second_ledger' }];
  }
  if (key === 'calendar') {
    return [{ canvas: once('calendar', calendarCanvas), label: 'Kalenteri', markable: true, evidence: 'cayman_transfer' }];
  }
  return [];
}

// Lukusivut, jotka eivät ole huoneessa omina arkkeinaan, piirretään vasta tarvittaessa.
function once(name, draw) {
  if (!PAGES.has(name)) PAGES.set(name, draw());
  return PAGES.get(name);
}
