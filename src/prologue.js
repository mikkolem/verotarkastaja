// Prologi ennen huonetta: nimettömän vihjeen kirje ja henkilöesittelyt.
// Pyörii samalla, kun huone latautuu taustalla, joten odotus ei tunnu odotukselta.
//
// Henkilökuvat: jos kansiossa public/characters/ on kuva (esim. kalevi.jpg),
// sitä käytetään; muuten näytetään piirretty siluetti.

const CHARACTERS = {
  kalevi: {
    name: 'Kalevi Kivi',
    role: 'Toimitusjohtaja, Kivi & Kumppanit Oy',
    lines: [
      'Vuoden veronmaksaja 1998 – oman ilmoituksensa mukaan.',
      'Pelaa golfia aina, kun kalenterissa lukee ”työmatka”.',
      'Lähtee lounaalle joka päivä tasan kello 12.',
    ],
  },
  pirjo: {
    name: 'Pirjo',
    role: 'Kirjanpitäjä, 19 vuotta talossa',
    lines: [
      'Täsmäyttää kaiken. Myös sen, mikä ei täsmää.',
      'Jättää Kaleville puhelinvastaajaan viestejä, joihin tämä ei vastaa.',
      'Ei ole koskaan pitänyt viherkasveista. Eikä Kalevista.',
    ],
  },
  sina: {
    name: 'Sinä',
    role: 'Verotarkastaja, Verovirasto',
    lines: [
      'Virastossa sinua kutsutaan nimellä ”Pilkku”.',
      'Et ole koskaan jättänyt yhtäkään kuittia tarkistamatta.',
      'Tänään sinulla on viisitoista minuuttia.',
    ],
  },
};

const SLIDES = [
  { kind: 'title' },
  {
    kind: 'text',
    lines: ['Helsinki, kesäkuu 2025.', 'Maanantai, kello 11.47.', 'Pöydällesi on ilmestynyt kirjekuori ilman lähettäjää.'],
  },
  { kind: 'letter' },
  { kind: 'character', id: 'kalevi' },
  { kind: 'character', id: 'pirjo' },
  { kind: 'character', id: 'sina' },
  {
    kind: 'text',
    lines: ['Kello 12.03.', 'Kalevi Kivi poistuu rakennuksesta.', 'Hänen työhuoneensa ovi jää raolleen.'],
    last: true,
  },
];

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
  const shapes = {
    kalevi: '<circle cx="100" cy="88" r="44"/><path d="M28 260c0-70 30-112 72-112s72 42 72 112z"/><rect x="90" y="150" width="20" height="60" fill="var(--tie)"/>',
    pirjo: '<path d="M52 104c0-40 22-64 48-64s48 24 48 64c0 26-8 40-8 40H60s-8-14-8-40z"/><circle cx="100" cy="92" r="38"/><path d="M34 260c0-66 28-104 66-104s66 38 66 104z"/><rect x="72" y="84" width="56" height="12" rx="6" fill="var(--tie)" opacity="0.8"/>',
    sina: '<circle cx="100" cy="90" r="42"/><path d="M30 260c0-68 30-108 70-108s70 40 70 108z"/><path d="M58 70h84l-6-22H64z" fill="var(--tie)"/>',
  };
  svg.innerHTML = shapes[id];
  return svg;
}

function portrait(id) {
  const fig = el('figure', 'portrait');
  const img = new Image();
  img.alt = CHARACTERS[id].name;
  img.src = `${import.meta.env.BASE_URL}characters/${id}.jpg`;
  img.addEventListener('error', () => img.replaceWith(silhouette(id)), { once: true });
  fig.appendChild(img);
  return fig;
}

function buildSlide(slide) {
  const s = el('section', `pro-slide pro-${slide.kind}`);
  if (slide.kind === 'title') {
    s.append(
      el('div', 'pro-kicker', 'Verovirasto esittää'),
      el('h1', 'pro-title', 'Laatikko B'),
      el('div', 'pro-subtitle', 'Yllätystarkastus'),
    );
  } else if (slide.kind === 'text') {
    slide.lines.forEach((line, i) => {
      const p = el('p', 'pro-line', line);
      p.style.animationDelay = `${0.3 + i * 1.1}s`;
      s.appendChild(p);
    });
  } else if (slide.kind === 'letter') {
    const letter = el('div', 'pro-paper');
    [
      'Kivi & Kumppanit Oy:n toimitusjohtaja pitää toista kirjanpitoa.',
      'Se on hänen työhuoneessaan. Hän kutsuu sitä ”laatikko B:ksi”.',
      'Hän lähtee lounaalle tasan kello 12. Takaisin hän tulee vartin päästä.',
    ].forEach((line, i) => {
      const p = el('p', 'pro-line', line);
      p.style.animationDelay = `${0.4 + i * 1.2}s`;
      letter.appendChild(p);
    });
    const sign = el('p', 'pro-line pro-sign', '– Joku, joka tietää');
    sign.style.animationDelay = '4.2s';
    letter.appendChild(sign);
    s.appendChild(letter);
  } else if (slide.kind === 'character') {
    const c = CHARACTERS[slide.id];
    const text = el('div', 'pro-char-text');
    text.append(el('h2', 'pro-char-name', c.name), el('div', 'pro-char-role', c.role));
    c.lines.forEach((line, i) => {
      const p = el('p', 'pro-line', line);
      p.style.animationDelay = `${0.5 + i * 0.9}s`;
      text.appendChild(p);
    });
    s.append(portrait(slide.id), text);
  }
  return s;
}

export function runPrologue({ onDone }) {
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
  const stage = el('div', 'pro-stage');
  const footer = el('div', 'pro-footer');
  const dots = el('div', 'pro-dots');
  SLIDES.forEach(() => dots.appendChild(el('span')));
  const skip = el('button', 'pro-skip', 'Ohita prologi');
  const next = el('button', 'pro-next', 'Jatka');
  footer.append(skip, dots, next);
  root.append(stage, footer);
  document.body.appendChild(root);

  let index = -1;
  function show(i) {
    index = i;
    stage.replaceChildren(buildSlide(SLIDES[i]));
    [...dots.children].forEach((d, j) => d.classList.toggle('active', j === i));
    next.textContent = SLIDES[i].last ? 'Astu sisään' : 'Jatka';
    next.focus({ preventScroll: true });
  }
  function advance() {
    if (index < SLIDES.length - 1) show(index + 1);
    else finish();
  }
  function finish() {
    removeEventListener('keydown', keys);
    try { sessionStorage.setItem('prologueSeen', '1'); } catch { /* ei haittaa */ }
    root.classList.add('leaving');
    setTimeout(() => root.remove(), 700);
    onDone();
  }
  const keys = (e) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopImmediatePropagation();
      advance();
    } else if (e.key === 'Escape') {
      finish();
    }
  };
  addEventListener('keydown', keys, true);
  next.addEventListener('click', advance);
  skip.addEventListener('click', finish);
  stage.addEventListener('click', advance);
  show(0);
}
