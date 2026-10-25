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
    caption: () => `Kalevi Kivi, toimitusjohtaja. Vuoden veronmaksaja ${SECRETS.year} – oman ilmoituksensa mukaan.`,
    bubble: 'Lähden lounaalle. Älkää yhdistäkö puheluita.',
    bubbleFrom: 'right',
  },
  {
    image: 'comic/4.jpg',
    fallback: 'characters/pirjo.jpg',
    caption: 'Pirjo, kirjanpitäjä. Yhdeksäntoista vuotta talossa. Täsmäyttää kaiken – myös sen, mikä ei täsmää.',
    bubble: 'Lasku 117 puuttuu taas. Kalevi… Kalevi?',
    bubbleFrom: 'left',
  },
  {
    image: 'comic/5.jpg',
    fallback: 'characters/sina.jpg',
    caption: 'Kello 12.03. Kalevin työhuoneen ovi on jäänyt raolleen.',
    bubble: 'Viisitoista minuuttia. Ei yhtään kuittia tarkistamatta.',
    bubbleFrom: 'right',
    last: true,
  },
];

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
    img.classList.add('comic-art-fallback');
    img.src = `${BASE}${panel.fallback}`;
  }, { once: false });
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
