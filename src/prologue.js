// Prologi: kaksi ruutua ja ovisiirtymä, yhteensä alle puoli minuuttia.
//   1. Kollaasikuva henkilöistä, jonka päällä kerrotaan tarina ja pelin idea.
//   2. Nimetön vihjekirje lähikuvassa.
// Sitten ovi aukeaa ja kamera ajaa työpöydälle (main.js: cinematic).
// Eteenpäin klikkaamalla, nuolella tai välilyönnillä; taaksepäin nuolella; Esc ohittaa.
import { SECRETS } from './game.js';

const BASE = import.meta.env.BASE_URL;

const PANELS = [
  {
    kind: 'collage',
    image: 'comic/collage.jpg',
    caption: 'Helsinki, maanantai. Kello 11.47.',
    story: [
      'Rakennusliike Kivi & Kumppanit Oy:n kirjanpito ei täsmää. Toimitusjohtaja Kalevi Kivi ' +
      `(”Vuoden veronmaksaja ${SECRETS.year}”, oman ilmoituksensa mukaan) ilmoittaa liikevaihdoksi puolet siitä, mitä pankkitilille tulee.`,
      'Kirjanpitäjä Pirjo on huomannut sen. Hän on 19 vuotta täsmäyttänyt Kalevin lukuja, eikä enää jaksa.',
      'Sinä olet Veroviraston tarkastaja. Tänään pöydällesi tuli kirje ilman lähettäjää.',
    ],
    labels: ['Kalevi Kivi · toimitusjohtaja', 'Pirjo · kirjanpitäjä', 'Sinä · verotarkastaja'],
  },
  {
    kind: 'letter',
    caption: 'Kirje on kirjoitettu koneella. Ei allekirjoitusta.',
    lines: [
      'Kalevi Kivi pitää toista kirjanpitoa. Oikeaa.',
      'Se on hänen työhuoneessaan. Hän kutsuu sitä ”laatikko B:ksi”.',
      'Hän lähtee lounaalle tasan kello 12 ja palaa vartin päästä. Ovi jää raolleen.',
      'Etsi todisteet ennen kuin hän palaa.',
      '– Joku, joka tietää',
    ],
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

function buildPanel(panel, index) {
  const frame = el('figure', 'comic-panel');
  frame.dataset.index = String(index + 1);
  if (panel.kind === 'collage') {
    frame.classList.add('comic-collage');
    const img = new Image();
    img.className = 'comic-art';
    img.alt = 'Kalevi Kivi, Pirjo ja verotarkastaja';
    img.draggable = false;
    img.src = `${BASE}${panel.image}`;
    frame.appendChild(img);
    frame.appendChild(el('div', 'comic-halftone'));
    // nimilaput kuvan kolmen osan alle
    const labels = el('div', 'comic-labels');
    panel.labels.forEach((t) => labels.appendChild(el('span', null, t)));
    frame.appendChild(labels);
    // tarina kuvan alareunassa, rivi kerrallaan
    const story = el('div', 'comic-story');
    panel.story.forEach((line, i) => story.appendChild(reveal(el('p', 'comic-line', line), 500 + i * 1600)));
    frame.appendChild(story);
  } else {
    frame.classList.add('comic-letter');
    const paper = el('div', 'comic-paper');
    panel.lines.forEach((line, i) => {
      paper.appendChild(reveal(el('p', `comic-line${i === panel.lines.length - 1 ? ' comic-sign' : ''}`, line), 400 + i * 900));
    });
    frame.appendChild(paper);
  }
  if (panel.caption) frame.appendChild(el('figcaption', 'comic-caption', panel.caption));
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
  let entering = false;
  let raf = 0;

  function show(i) {
    if (finished || entering) return;
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
