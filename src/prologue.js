// Prologi: kolme diaa kollaasikuvan päällä ja ovisiirtymä, alle puoli minuuttia.
//   1. Tarina ja pelin idea kolmessa virkkeessä.
//   2. Nimetön vihjekirje.
//   3. Henkilöt pieninä kortteina.
// Sitten ovi aukeaa ja kamera ajaa työpöydälle (main.js: cinematic).
// Eteenpäin klikkaamalla, nuolella tai välilyönnillä; taaksepäin nuolella; Esc ohittaa.
import { SECRETS } from './game.js';

const BASE = import.meta.env.BASE_URL;

// Diat: tarina, kirje ja henkilöt. Kollaasikuva on koko ajan taustalla.
const CHARACTERS = [
  { id: 'kalevi', name: 'Kalevi K.', role: 'Toimitusjohtaja, Kivi & Kumppanit Oy', line: () => `”Vuoden veronmaksaja ${SECRETS.year}.” Oman ilmoituksensa mukaan.` },
  { id: 'pirjo', name: 'Pirjo P.', role: 'Kirjanpitäjä, 3 vuotta talossa', line: () => 'Tietää, missä mapit ovat. Ja mitä niistä puuttuu.' },
  { id: 'sina', name: 'Sinä', role: 'Viranomainen', line: () => 'Et ole koskaan jättänyt yhtäkään kuittia tarkistamatta.' },
];

const SLIDES = [
  {
    kind: 'story',
    kicker: 'Helsinki, maanantai. Kello 11.47.',
    title: 'Tarkastuskäynti',
    subtitle: 'Kirjanpito, joka ei täsmää',
    lines: [
      'Rakennusliike Kivi & Kumppanit Oy ilmoittaa liikevaihdokseen puolet siitä, mitä sen pankkitilille tulee. Jokin ei täsmää.',
      'Sinä olet viranomainen. Virallinen tarkastus alkaa ensi kuussa – siihen mennessä paperit ovat silppurissa.',
      'Tänään pöydällesi tuli kirje ilman lähettäjää. Tämä on salapoliisityötä.',
    ],
  },
  {
    kind: 'letter',
    kicker: 'Kirje on kirjoitettu koneella. Ei allekirjoitusta.',
    lines: [
      'Kirjanpidosta puuttuu tosite 117. Se ei ole ainoa.',
      'Kalevi pitää toista kirjanpitoa, sitä oikeaa. Kaikki on hänen työhuoneessaan, jos osaa katsoa.',
      'Hän lähtee lounaalle tasan kello 12 ja palaa puolen tunnin päästä. Ovi jää raolleen.',
      'Etsi todisteet ennen kuin hän palaa.',
      '– Joku, joka tietää',
    ],
  },
  {
    kind: 'cast',
    kicker: 'Henkilöt',
    last: true,
  },
];

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}

// Rivi tulee näkyviin ajastimella eikä CSS-animaatiolla: latauksen aikana
// tekstuurilaskenta pysäyttää animaatiot, mutta ajastin ehtii väleihin.
function reveal(node, delay) {
  setTimeout(() => node.classList.add('shown'), delay);
  return node;
}

function portrait(c) {
  const img = new Image();
  img.className = 'cast-portrait';
  img.alt = c.name;
  img.draggable = false;
  img.src = `${BASE}characters/${c.id}.jpg`;
  return img;
}

function buildSlide(slide) {
  const s = el('section', `pro-slide pro-${slide.kind}`);
  if (slide.kicker) s.appendChild(el('div', 'pro-kicker', slide.kicker));
  if (slide.kind === 'story') {
    s.appendChild(el('h1', 'pro-title', slide.title));
    if (slide.subtitle) s.appendChild(el('div', 'pro-subtitle', slide.subtitle));
    slide.lines.forEach((line, i) => s.appendChild(reveal(el('p', 'pro-line', line), 600 + i * 1500)));
  } else if (slide.kind === 'letter') {
    const paper = el('div', 'pro-paper');
    slide.lines.forEach((line, i) => {
      paper.appendChild(reveal(el('p', `pro-line${i === slide.lines.length - 1 ? ' pro-sign' : ''}`, line), 400 + i * 900));
    });
    s.appendChild(paper);
  } else {
    const row = el('div', 'cast-row');
    CHARACTERS.forEach((c, i) => {
      const card = el('div', 'cast-card');
      card.append(portrait(c), el('div', 'cast-name', c.name), el('div', 'cast-role', c.role), el('p', 'cast-line', c.line()));
      row.appendChild(reveal(card, 300 + i * 700));
    });
    s.appendChild(row);
  }
  return s;
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
  // kollaasi koko ruudun taustana, hitaasti zoomaten
  const bg = el('div', 'pro-bg');
  const bgImg = new Image();
  bgImg.src = `${BASE}comic/collage.jpg`;
  bgImg.alt = '';
  bg.appendChild(bgImg);
  root.appendChild(bg);
  const stage = el('div', 'pro-stage');
  const footer = el('div', 'pro-footer');
  const prev = el('button', 'pro-nav', '← Edellinen');
  const next = el('button', 'pro-nav primary', 'Seuraava →');
  const dots = el('div', 'pro-dots');
  SLIDES.forEach(() => dots.appendChild(el('span')));
  const skip = el('button', 'pro-skip', 'Ohita prologi');
  footer.append(prev, dots, next, skip);
  root.append(stage, footer);
  document.body.appendChild(root);
  document.body.classList.add('prologue-open');

  let index = -1;
  let finished = false;
  let entering = false;
  let raf = 0;

  function show(i) {
    if (finished || entering) return;
    if (i >= SLIDES.length) { enterRoom(); return; }
    i = Math.max(0, i);
    index = i;
    stage.replaceChildren(buildSlide(SLIDES[i]));
    root.dataset.slide = String(i);
    [...dots.children].forEach((d, j) => d.classList.toggle('active', j === i));
    prev.disabled = i === 0;
    next.textContent = SLIDES[i].last ? 'Astu sisään →' : 'Seuraava →';
    next.focus({ preventScroll: true });
  }

  // Viimeisen ruudun jälkeen: sarjakuva häipyy, ovi aukeaa ja kamera ajaa pöydälle.
  function enterRoom() {
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
  stage.addEventListener('click', () => show(index + 1));
  skip.addEventListener('click', finish);
  show(0);
}
