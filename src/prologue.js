// Prologi sarjakuvana: viisi ruutua, joissa kuva, kuvateksti ja puhekupla.
// Eteenpäin klikkaamalla, nuolella tai välilyönnillä; taaksepäin nuolella.
//
// Ruutujen kuvat: public/comic/1.jpg … 5.jpg (ks. public/comic/README.txt).
// Jos ruudun kuva puuttuu, käytetään varakuvaa (henkilökuva tai piirretty taustaruutu).
import { SECRETS } from './game.js';

const BASE = import.meta.env.BASE_URL;

// kind: 'image' (kuva + tekstit) tai 'letter' (kirje lähikuvassa, ei kuvaa)
const PANELS = [
  {
    image: 'comic/1.jpg',
    fallback: 'characters/sina.jpg',
    scene: 'office',
    side: 'right',
    caption: 'Verovirasto, Helsinki. Maanantai, kello 11.47.',
    bubble: 'Pöydälläsi on kirjekuori ilman lähettäjää.',
    bubbleFrom: 'left',
  },
  {
    kind: 'letter',
    caption: 'Kirje on kirjoitettu koneella. Ei allekirjoitusta.',
    lines: [
      'Kivi & Kumppanit Oy:n toimitusjohtaja pitää toista kirjanpitoa.',
      'Se on hänen työhuoneessaan. Hän kutsuu sitä ”laatikko B:ksi”.',
      'Hän lähtee lounaalle tasan kello 12. Takaisin hän tulee vartin päästä.',
      '– Joku, joka tietää',
    ],
  },
  {
    image: 'comic/3.jpg',
    fallback: 'characters/kalevi.jpg',
    scene: 'lobby',
    side: 'right',
    speedLines: true,
    caption: () => `Kalevi Kivi, toimitusjohtaja. Vuoden veronmaksaja ${SECRETS.year} – oman ilmoituksensa mukaan.`,
    bubble: 'Lähden lounaalle. Älkää yhdistäkö puheluita.',
    bubbleFrom: 'right',
  },
  {
    image: 'comic/4.jpg',
    fallback: 'characters/pirjo.jpg',
    scene: 'bookkeeper',
    side: 'right',
    caption: 'Pirjo, kirjanpitäjä. Yhdeksäntoista vuotta talossa. Täsmäyttää kaiken – myös sen, mikä ei täsmää.',
    bubble: 'Lasku 117 puuttuu taas. Kalevi… Kalevi?',
    bubbleFrom: 'left',
  },
  {
    image: 'comic/5.jpg',
    fallback: 'characters/sina.jpg',
    scene: 'corridor',
    side: 'left',
    caption: 'Kello 12.03. Kalevin työhuoneen ovi on jäänyt raolleen.',
    bubble: 'Viisitoista minuuttia. Ei yhtään kuittia tarkistamatta.',
    bubbleFrom: 'right',
    last: true,
  },
];

// Ruutujen taustat piirretään SVG:nä henkilökuvan taakse: toimisto, aula,
// kirjanpitäjän työpiste ja käytävä. Litteitä muotoja sarjakuvan tyyliin.
const SCENES = {
  office: `
    <defs><linearGradient id="w1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5c6b7a"/><stop offset="1" stop-color="#8a98a6"/></linearGradient></defs>
    <rect width="1600" height="1000" fill="#6e665c"/>
    <rect y="620" width="1600" height="380" fill="#4a423a"/>
    <rect x="120" y="120" width="520" height="420" fill="url(#w1)" stroke="#1b140c" stroke-width="12"/>
    <line x1="380" y1="120" x2="380" y2="540" stroke="#1b140c" stroke-width="10"/>
    <line x1="120" y1="330" x2="640" y2="330" stroke="#1b140c" stroke-width="10"/>
    <g stroke="#dfe8f0" stroke-width="4" opacity="0.5">
      <line x1="200" y1="150" x2="180" y2="260"/><line x1="300" y1="200" x2="280" y2="330"/><line x1="470" y1="140" x2="450" y2="250"/><line x1="580" y1="260" x2="560" y2="400"/><line x1="240" y1="380" x2="220" y2="500"/>
    </g>
    <rect x="60" y="600" width="900" height="40" fill="#8a6a48" stroke="#1b140c" stroke-width="8"/>
    <rect x="80" y="640" width="860" height="300" fill="#6a4e34" stroke="#1b140c" stroke-width="8"/>
    <rect x="700" y="540" width="60" height="60" fill="#3a3a3a" stroke="#1b140c" stroke-width="6"/>
    <rect x="560" y="470" width="80" height="130" fill="#7a1410" stroke="#1b140c" stroke-width="6"/>
    <rect x="640" y="470" width="50" height="130" fill="#1d3466" stroke="#1b140c" stroke-width="6"/>
    <g transform="rotate(-8 320 575)"><rect x="240" y="550" width="160" height="100" fill="#f3ecdc" stroke="#1b140c" stroke-width="7"/><path d="M240 550 L320 610 L400 550" fill="none" stroke="#1b140c" stroke-width="7"/></g>
    <path d="M900 560 h70 v40 h-70z" fill="#f3ecdc" stroke="#1b140c" stroke-width="6"/>`,
  lobby: `
    <rect width="1600" height="1000" fill="#c9b79a"/>
    <rect y="700" width="1600" height="300" fill="#8f7a5c"/>
    <rect x="100" y="80" width="1400" height="40" fill="#5a4a38" stroke="#1b140c" stroke-width="8"/>
    <rect x="160" y="270" width="420" height="450" fill="#9fc4d8" stroke="#1b140c" stroke-width="12" opacity="0.9"/>
    <line x1="370" y1="270" x2="370" y2="720" stroke="#1b140c" stroke-width="10"/>
    <rect x="330" y="400" width="18" height="90" fill="#d4af5a" stroke="#1b140c" stroke-width="5"/>
    <rect x="392" y="400" width="18" height="90" fill="#d4af5a" stroke="#1b140c" stroke-width="5"/>
    <rect x="130" y="200" width="480" height="60" fill="#1d3466" stroke="#1b140c" stroke-width="8"/>
    <text x="370" y="243" font-family="Georgia, serif" font-weight="700" font-size="34" fill="#f3ecdc" text-anchor="middle">KIVI &amp; KUMPPANIT OY</text>
    <rect x="700" y="420" width="420" height="300" fill="#7a1410" stroke="#1b140c" stroke-width="8" rx="20"/>
    <rect x="720" y="380" width="380" height="60" fill="#9a2a20" stroke="#1b140c" stroke-width="8" rx="20"/>
    <circle cx="1380" cy="330" r="110" fill="#f3ecdc" stroke="#1b140c" stroke-width="10"/>
    <line x1="1380" y1="330" x2="1380" y2="250" stroke="#1b140c" stroke-width="8"/>
    <line x1="1380" y1="330" x2="1440" y2="330" stroke="#1b140c" stroke-width="8"/>`,
  bookkeeper: `
    <rect width="1600" height="1000" fill="#5a6a5c"/>
    <rect y="640" width="1600" height="360" fill="#3c3a36"/>
    <g stroke="#1b140c" stroke-width="8">
      <rect x="80" y="100" width="620" height="420" fill="#6a4e34"/>
      ${[0, 1, 2].map((r) => `<rect x="100" y="${120 + r * 135}" width="580" height="18" fill="#4a3424"/>`).join('')}
      ${[0, 1, 2].flatMap((r) => [0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${115 + i * 80}" y="${140 + r * 135}" width="62" height="110" fill="${['#1d3466', '#7a1410', '#1d3466', '#0b0b0c', '#1d3466', '#7a1410', '#1d3466'][i]}"/>`)).join('')}
    </g>
    <rect x="60" y="620" width="1000" height="40" fill="#b9a98c" stroke="#1b140c" stroke-width="8"/>
    <rect x="200" y="380" width="300" height="220" fill="#1a1a1a" stroke="#1b140c" stroke-width="10" rx="8"/>
    <rect x="215" y="395" width="270" height="190" fill="#dfe8c8"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="230" y="${410 + i * 28}" width="${120 + (i * 53) % 110}" height="8" fill="#3a4a3a"/>`).join('')}
    <rect x="520" y="400" width="280" height="200" fill="#1a1a1a" stroke="#1b140c" stroke-width="10" rx="8"/>
    <rect x="535" y="415" width="250" height="170" fill="#c8d8df"/>
    <rect x="860" y="540" width="150" height="80" fill="#2b2b2e" stroke="#1b140c" stroke-width="8" rx="10"/>
    <rect x="850" y="510" width="60" height="40" fill="#2b2b2e" stroke="#1b140c" stroke-width="6" rx="12"/>
    <rect x="1120" y="470" width="90" height="150" fill="#1d3466" stroke="#1b140c" stroke-width="6"/>
    <rect x="1210" y="470" width="90" height="150" fill="#7a1410" stroke="#1b140c" stroke-width="6"/>`,
  corridor: `
    <defs><linearGradient id="c1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2622"/><stop offset="1" stop-color="#4a423a"/></linearGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd27a" stop-opacity="0.95"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></linearGradient></defs>
    <rect width="1600" height="1000" fill="url(#c1)"/>
    <rect y="720" width="1600" height="280" fill="#3a2e24"/>
    <polygon points="0,1000 1600,1000 1250,720 350,720" fill="#5a4634"/>
    <rect x="620" y="120" width="420" height="600" fill="#1b140c"/>
    <rect x="640" y="140" width="380" height="580" fill="#4a2414" stroke="#1b140c" stroke-width="10"/>
    <polygon points="640,140 720,160 720,700 640,720" fill="#2e0f07" stroke="#1b140c" stroke-width="8"/>
    <rect x="610" y="150" width="34" height="570" fill="#ffd27a"/>
    <polygon points="610,720 300,1000 760,1000 644,720" fill="url(#beam)" opacity="0.9"/>
    <circle cx="990" cy="430" r="14" fill="#d4af5a" stroke="#1b140c" stroke-width="5"/>
    <rect x="1150" y="300" width="160" height="200" fill="#f3ecdc" stroke="#1b140c" stroke-width="8"/>
    <text x="1230" y="395" font-family="Georgia, serif" font-weight="700" font-size="54" fill="#1f4e79" text-anchor="middle">ALV</text>
    <text x="1230" y="445" font-family="Georgia, serif" font-weight="700" font-size="34" fill="#1f4e79" text-anchor="middle">25,5 %</text>`,
};

function sceneArt(name) {
  const wrap = el('div', 'comic-scene');
  wrap.innerHTML = `<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${SCENES[name]}</svg>`;
  return wrap;
}

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}

// Kuva, joka vaihtuu varakuvaan, jos varsinaista ei löydy.
function picture(panel) {
  const img = new Image();
  img.className = 'comic-art';
  img.alt = '';
  img.draggable = false;
  img.src = `${BASE}${panel.image}`;
  img.addEventListener('error', () => {
    if (img.dataset.fallback) return;
    img.dataset.fallback = '1';
    img.classList.add('comic-art-fallback', `side-${panel.side ?? 'right'}`);
    img.src = `${BASE}${panel.fallback}`;
    // piirretty tausta henkilökuvan taakse
    if (panel.scene) img.parentElement?.prepend(sceneArt(panel.scene));
    if (panel.speedLines) img.parentElement?.insertBefore(el('div', 'comic-speed'), img);
  });
  return img;
}

function buildPanel(panel, index) {
  const frame = el('figure', 'comic-panel');
  frame.dataset.index = String(index + 1);
  if (panel.kind === 'letter') {
    frame.classList.add('comic-letter');
    const paper = el('div', 'comic-paper');
    panel.lines.forEach((line, i) => {
      const p = el('p', `comic-line${i === panel.lines.length - 1 ? ' comic-sign' : ''}`, line);
      p.style.animationDelay = `${0.4 + i * 0.9}s`;
      paper.appendChild(p);
    });
    frame.appendChild(paper);
  } else {
    frame.appendChild(picture(panel));
    frame.appendChild(el('div', 'comic-halftone'));
    if (panel.bubble) {
      const b = el('div', `comic-bubble from-${panel.bubbleFrom ?? 'left'}`, panel.bubble);
      frame.appendChild(b);
    }
  }
  const caption = typeof panel.caption === 'function' ? panel.caption() : panel.caption;
  if (caption) frame.appendChild(el('figcaption', 'comic-caption', caption));
  return frame;
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
  const stage = el('div', 'comic-stage');
  const footer = el('div', 'pro-footer');
  const prev = el('button', 'pro-nav', '← Edellinen');
  const next = el('button', 'pro-nav primary', 'Seuraava →');
  const dots = el('div', 'pro-dots');
  PANELS.forEach(() => dots.appendChild(el('span')));
  const skip = el('button', 'pro-skip', 'Ohita prologi');
  footer.append(prev, dots, next, skip);
  root.append(stage, footer);
  document.body.appendChild(root);
  document.body.classList.add('prologue-open');

  let index = -1;
  let finished = false;

  function show(i) {
    if (finished) return;
    if (i >= PANELS.length) { enterRoom(); return; }
    i = Math.max(0, i);
    const forward = i > index;
    index = i;
    const panel = buildPanel(PANELS[i], i);
    panel.classList.add(forward ? 'enter-right' : 'enter-left');
    stage.replaceChildren(panel);
    [...dots.children].forEach((d, j) => d.classList.toggle('active', j === i));
    prev.disabled = i === 0;
    next.textContent = PANELS[i].last ? 'Astu sisään →' : 'Seuraava →';
    next.focus({ preventScroll: true });
  }

  // Viimeisen ruudun jälkeen: sarjakuva häipyy, ovi aukeaa ja kamera ajaa pöydälle.
  let entering = false;
  let raf = 0;
  function enterRoom() {
    if (entering) return;
    entering = true;
    stage.replaceChildren(el('div', 'pro-wait', 'Ladataan työhuonetta…'));
    footer.hidden = true;
    cinematic.whenReady.then(() => {
      if (finished) return;
      stage.replaceChildren();
      root.classList.add('scene-door');
      cinematic.update(0);
      const start = performance.now();
      const frame = (now) => {
        if (finished) return;
        const t = (now - start) / 1000;
        cinematic.update(Math.min(t, cinematic.duration));
        if (t >= cinematic.duration) { finish(); return; }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    });
  }

  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    cinematic.finish();
    removeEventListener('keydown', keys, true);
    try { sessionStorage.setItem('prologueSeen', '1'); } catch { /* ei haittaa */ }
    document.body.classList.remove('prologue-open');
    root.classList.add('leaving');
    setTimeout(() => root.remove(), 700);
    onDone();
  }

  const keys = (e) => {
    if (entering) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.stopImmediatePropagation(); finish(); } return; }
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); show(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopImmediatePropagation(); show(index - 1); }
    else if (e.key === 'Escape') { e.stopImmediatePropagation(); finish(); }
  };
  addEventListener('keydown', keys, true);
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  // klikkaus ruutuun vie eteenpäin (ei nappien päällä)
  stage.addEventListener('click', () => { if (!entering) show(index + 1); });
  skip.addEventListener('click', finish);
  show(0);
}
