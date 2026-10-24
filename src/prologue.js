// Prologi: kaksi itsestään etenevää kohtausta, yhteensä noin 28 sekuntia.
//   1. Automatka sateessa (2D-canvas): kaupunki vilisee tuulilasin takana, pyyhkijä
//      pyyhkii, nimetön kirje nousee kojelaudalta. Auto pysähtyy rakennuksen eteen.
//   2. Käytävä (3D-huone): kamera lähestyy raollaan olevaa ovea, henkilökortit
//      vilahtavat kuvan laidassa, ovi aukeaa ja kamera ajaa työpöydän ääreen.
// Kohtauksesta toiseen pääsee nuolilla molempiin suuntiin; Esc tai Ohita hyppää yli.
// Kohtaus 1 pyörii huoneen latautuessa; kohtaus 2 odottaa, että huone on valmis.
import { SECRETS } from './game.js';

const CHARACTERS = [
  { id: 'kalevi', name: 'Kalevi Kivi', role: 'Toimitusjohtaja', line: () => `Vuoden veronmaksaja ${SECRETS.year}. Oman ilmoituksensa mukaan.` },
  { id: 'pirjo', name: 'Pirjo', role: 'Kirjanpitäjä, 19 vuotta talossa', line: () => 'Täsmäyttää kaiken. Myös sen, mikä ei täsmää.' },
  { id: 'sina', name: 'Sinä', role: 'Verotarkastaja', line: () => 'Et ole koskaan jättänyt yhtäkään kuittia tarkistamatta.' },
];

const DRIVE_LENGTH = 12;    // kohtaus 1, sekuntia
const HALL_LENGTH = 14;     // kohtaus 2

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}

// Piirretty siluetti, jos varsinaista kuvaa ei ole.
function silhouette(id) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 200 260');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('portrait-fallback', `portrait-${id}`);
  svg.innerHTML = '<circle cx="100" cy="88" r="44"/><path d="M28 260c0-70 30-112 72-112s72 42 72 112z"/>';
  return svg;
}

function portrait(id, name) {
  const fig = el('figure', 'portrait');
  const img = new Image();
  img.alt = name;
  img.src = `${import.meta.env.BASE_URL}characters/${id}.jpg`;
  img.addEventListener('error', () => img.replaceWith(silhouette(id)), { once: true });
  fig.appendChild(img);
  return fig;
}

// --- kohtaus 1: automatka ---------------------------------------------------------
// Kaikki piirretään 2D-canvakselle. Nopeus kiihtyy sekunnissa, pysähtyy 9–11 s.
function createDrive(canvas) {
  const g = canvas.getContext('2d');
  const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
  const speed = (t) => Math.min(1, t) * (1 - Math.min(1, Math.max(0, (t - 8.6) / 2.2)));
  // kokonaismatka pysähdykseen numeerisesti, jotta rakennus osuu keskelle
  let total = 0;
  for (let t = 0; t < DRIVE_LENGTH; t += 1 / 120) total += speed(t) * 520 / 120;

  const drops = [];
  const wiper = { angle: -2.6, dir: 1 };
  let dist = 0;
  let last = 0;

  function resize() {
    const r = Math.min(devicePixelRatio, 1.5);
    canvas.width = Math.round(innerWidth * r);
    canvas.height = Math.round(innerHeight * r);
    g.setTransform(r, 0, 0, r, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  function buildings(layerSeed, speedK, baseY, h0, h1, color, W, H, lit) {
    const unit = 90;
    const offset = (dist * speedK) % unit;
    g.fillStyle = color;
    for (let i = -1; i < W / unit + 2; i++) {
      const idx = Math.floor((dist * speedK) / unit) + i;
      const w = 50 + hash(idx * 3.1 + layerSeed) * 60;
      const h = h0 + hash(idx * 7.7 + layerSeed) * (h1 - h0);
      const x = i * unit - offset;
      g.fillRect(x, baseY - h, w, h);
      if (lit) {
        // valaistut ikkunat
        for (let wy = baseY - h + 10; wy < baseY - 12; wy += 16) {
          for (let wx = x + 6; wx < x + w - 8; wx += 14) {
            if (hash(idx * 11 + wy * 0.37 + wx * 0.11 + layerSeed) > 0.6) {
              g.fillStyle = 'rgba(255, 214, 150, 0.55)';
              g.fillRect(wx, wy, 6, 8);
            }
          }
        }
        g.fillStyle = color;
      }
    }
  }

  function draw(t) {
    const dt = Math.min(0.05, t - last);
    last = t;
    dist += speed(t) * 520 * dt;
    const W = innerWidth, H = innerHeight;
    const horizon = H * 0.58;

    // taivas: sateinen iltapäivä
    const sky = g.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#2e3440');
    sky.addColorStop(1, '#7b8699');
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);

    buildings(1, 0.18, horizon, 90, 260, '#4a5160', W, H, false);
    buildings(2, 0.42, horizon + 10, 60, 190, '#2f3541', W, H, true);

    // katu
    const road = g.createLinearGradient(0, horizon, 0, H);
    road.addColorStop(0, '#3a3a3c');
    road.addColorStop(1, '#17171a');
    g.fillStyle = road;
    g.fillRect(0, horizon, W, H - horizon);
    // märkä asfaltti heijastaa ikkunoiden valoa
    g.fillStyle = 'rgba(255, 200, 140, 0.05)';
    g.fillRect(0, horizon, W, 40);
    // kaistaviivat vilisevät
    g.fillStyle = 'rgba(240, 230, 200, 0.6)';
    const dash = 160;
    const off = (dist * 1.6) % dash;
    for (let x = -dash; x < W + dash; x += dash) g.fillRect(x - off, horizon + (H - horizon) * 0.55, 70, 5);

    // rakennus, jonka eteen pysähdytään: tulee oikealta ja jää keskelle
    const bx = W * 0.5 + (total - dist) * 0.42 - 150;
    if (bx < W + 50) {
      const bh = horizon - 40;
      g.fillStyle = '#5b5248';
      g.fillRect(bx, horizon + 12 - bh, 300, bh);
      g.fillStyle = '#3a332c';
      for (let wy = horizon + 12 - bh + 30; wy < horizon - 60; wy += 44) {
        for (let wx = bx + 24; wx < bx + 280; wx += 56) g.fillRect(wx, wy, 32, 26);
      }
      // ovi ja kyltti
      g.fillStyle = '#1d1a16';
      g.fillRect(bx + 120, horizon - 70, 60, 82);
      g.fillStyle = 'rgba(255, 220, 160, 0.9)';
      g.fillRect(bx + 100, horizon - 112, 100, 22);
      g.fillStyle = '#2a2118';
      g.font = 'bold 12px Georgia, serif';
      g.textAlign = 'center';
      g.fillText('KIVI & KUMPPANIT OY', bx + 150, horizon - 97);
    }

    // sadepisarat tuulilasilla
    if (drops.length < 220 && Math.random() < 0.9) {
      drops.push({ x: Math.random() * W, y: Math.random() * H * 0.9, r: 1.5 + Math.random() * 3, v: 10 + Math.random() * 40 });
    }
    for (const d of drops) { d.y += d.v * dt; d.x += (0.4 + speed(t) * 1.2) * dt * 30; }
    // pyyhkijä: heiluu edestakaisin, pyyhkii pisarat tieltään
    const pivot = { x: W * 0.62, y: H * 1.02 };
    const prev = wiper.angle;
    wiper.angle += wiper.dir * dt * 1.5;
    if (wiper.angle > -0.65) { wiper.angle = -0.65; wiper.dir = -1; }
    if (wiper.angle < -2.55) { wiper.angle = -2.55; wiper.dir = 1; }
    const len = H * 0.95;
    const lo = Math.min(prev, wiper.angle), hi = Math.max(prev, wiper.angle);
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      const a = Math.atan2(d.y - pivot.y, d.x - pivot.x);
      const dd = Math.hypot(d.x - pivot.x, d.y - pivot.y);
      if (d.y > H || (a >= lo - 0.02 && a <= hi + 0.02 && dd < len)) drops.splice(i, 1);
    }
    for (const d of drops) {
      g.fillStyle = 'rgba(210, 225, 240, 0.35)';
      g.beginPath();
      g.ellipse(d.x, d.y, d.r, d.r * 1.6, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255, 255, 255, 0.5)';
      g.beginPath();
      g.arc(d.x - d.r * 0.3, d.y - d.r * 0.5, d.r * 0.35, 0, Math.PI * 2);
      g.fill();
    }
    // pyyhkijän sulka
    g.strokeStyle = 'rgba(10, 10, 12, 0.92)';
    g.lineWidth = 14;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(pivot.x, pivot.y);
    g.lineTo(pivot.x + Math.cos(wiper.angle) * len, pivot.y + Math.sin(wiper.angle) * len);
    g.stroke();

    // kojelauta ja tuulilasin kehys
    const dash2 = g.createLinearGradient(0, H * 0.8, 0, H);
    dash2.addColorStop(0, 'rgba(12, 10, 9, 0)');
    dash2.addColorStop(0.3, '#120f0d');
    dash2.addColorStop(1, '#0a0908');
    g.fillStyle = dash2;
    g.fillRect(0, H * 0.78, W, H * 0.22);
    const vig = g.createRadialGradient(W / 2, H * 0.45, H * 0.3, W / 2, H * 0.45, H * 0.95);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.7)');
    g.fillStyle = vig;
    g.fillRect(0, 0, W, H);
  }

  return {
    draw,
    reset() { dist = 0; last = 0; drops.length = 0; },
    dispose() { removeEventListener('resize', resize); },
  };
}

export function runPrologue({ onDone, cinematic }) {
  // samassa selainistunnossa toinen pelikerta (Pelaa uudelleen) ohittaa prologin
  try {
    if (sessionStorage.getItem('prologueSeen')) {
      onDone();
      return;
    }
  } catch { /* tallennus ei käytössä: näytetään prologi */ }

  const root = el('div', 'prologue');
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', 'Prologi');
  const canvas = el('canvas', 'pro-canvas');
  const stage = el('div', 'pro-stage');
  const fade = el('div', 'pro-fade');
  const footer = el('div', 'pro-footer');
  const prev = el('button', 'pro-nav', '← Edellinen');
  const next = el('button', 'pro-nav', 'Seuraava →');
  const dots = el('div', 'pro-dots');
  [0, 1].forEach(() => dots.appendChild(el('span')));
  const skip = el('button', 'pro-skip', 'Ohita prologi');
  footer.append(prev, dots, next, skip);
  root.append(canvas, stage, fade, footer);
  document.body.appendChild(root);
  document.body.classList.add('prologue-open');

  const drive = createDrive(canvas);
  let scene = -1;
  let sceneStart = 0;
  let raf = 0;
  let finished = false;
  let waitingRoom = false;
  // ajastetut tekstit: [sekunti, elementti] – lisätään näyttämölle ajallaan
  let cues = [];

  function cue(t, node, hideAt) {
    cues.push({ t, node, hideAt, shown: false });
  }

  function buildDriveCues() {
    const stamp = el('div', 'pro-stamp');
    stamp.append(el('div', 'pro-stamp-city', 'Helsinki'), el('div', 'pro-stamp-time', 'Maanantai, kello 11.47'));
    cue(0.6, stamp, 4.5);
    const letter = el('div', 'pro-paper');
    ['Kivi & Kumppanit Oy:n toimitusjohtaja pitää toista kirjanpitoa.',
      'Se on hänen työhuoneessaan. Hän kutsuu sitä ”laatikko B:ksi”.',
      'Hän lähtee lounaalle tasan kello 12. Takaisin hän tulee vartin päästä.']
      .forEach((line, i) => {
        const p = el('p', 'pro-line', line);
        p.style.animationDelay = `${0.3 + i * 1.1}s`;
        letter.appendChild(p);
      });
    const sign = el('p', 'pro-line pro-sign', '– Joku, joka tietää');
    sign.style.animationDelay = '3.8s';
    letter.appendChild(sign);
    cue(3.6, letter, 10.2);
  }

  function buildHallCues() {
    CHARACTERS.forEach((c, i) => {
      const card = el('div', 'pro-card');
      const text = el('div', 'pro-card-text');
      text.append(el('div', 'pro-card-name', c.name), el('div', 'pro-card-role', c.role), el('p', 'pro-card-line', c.line()));
      card.append(portrait(c.id, c.name), text);
      cue(0.8 + i * 3.0, card, 0.8 + i * 3.0 + 2.7);
    });
    const stamp = el('div', 'pro-stamp pro-stamp-end');
    stamp.append(el('div', 'pro-stamp-time', 'Kello 12.03'), el('div', 'pro-stamp-city', 'Ovi jää raolleen.'));
    cue(9.8, stamp, 12.6);
  }

  function clearStage() {
    stage.replaceChildren();
    cues = [];
  }

  // Siirtyy kohtaukseen i (0 = automatka, 1 = käytävä). Kohtaus alkaa aina alusta.
  function go(i) {
    if (finished) return;
    if (i < 0) i = 0;
    if (i > 1) { finish(); return; }
    scene = i;
    clearStage();
    waitingRoom = false;
    root.classList.toggle('scene-drive', i === 0);
    root.classList.toggle('scene-hall', i === 1);
    fade.style.opacity = i === 0 ? '0' : '1';
    [...dots.children].forEach((d, j) => d.classList.toggle('active', j === i));
    prev.disabled = i === 0;
    next.textContent = i === 1 ? 'Astu sisään →' : 'Seuraava →';
    if (i === 0) {
      drive.reset();
      buildDriveCues();
      sceneStart = performance.now();
    } else {
      // huoneen pitää olla ladattu ennen käytäväkohtausta
      waitingRoom = true;
      stage.appendChild(el('div', 'pro-wait', 'Ladataan työhuonetta…'));
      const mine = scene;
      cinematic.whenReady.then(() => {
        if (finished || scene !== mine || !waitingRoom) return;
        waitingRoom = false;
        clearStage();
        buildHallCues();
        cinematic.update(0);
        sceneStart = performance.now();
      });
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (finished || waitingRoom) return;
    const t = (now - sceneStart) / 1000;
    for (const c of cues) {
      if (!c.shown && t >= c.t) { c.shown = true; stage.appendChild(c.node); }
      if (c.shown && c.hideAt != null && t >= c.hideAt && !c.node.classList.contains('leaving')) {
        c.node.classList.add('leaving');
        setTimeout(() => c.node.remove(), 700);
      }
    }
    if (scene === 0) {
      drive.draw(t);
      // pimennys kohtauksen lopussa
      fade.style.opacity = String(Math.max(0, Math.min(1, (t - (DRIVE_LENGTH - 1.2)) / 1.2)));
      if (t >= DRIVE_LENGTH) go(1);
    } else {
      cinematic.update(Math.min(t, cinematic.duration));
      // käytävä alkaa pimeästä
      fade.style.opacity = String(Math.max(0, 1 - t / 1.2));
      if (t >= HALL_LENGTH) finish();
    }
  }

  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    removeEventListener('keydown', keys, true);
    drive.dispose();
    try { sessionStorage.setItem('prologueSeen', '1'); } catch { /* ei haittaa */ }
    cinematic.finish();
    document.body.classList.remove('prologue-open');
    root.classList.add('leaving');
    setTimeout(() => root.remove(), 700);
    onDone();
  }

  const keys = (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); go(scene + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopImmediatePropagation(); go(scene - 1); }
    else if (e.key === 'Escape') { e.stopImmediatePropagation(); finish(); }
  };
  addEventListener('keydown', keys, true);
  prev.addEventListener('click', () => go(scene - 1));
  next.addEventListener('click', () => go(scene + 1));
  skip.addEventListener('click', finish);
  go(0);
  raf = requestAnimationFrame(frame);
}
