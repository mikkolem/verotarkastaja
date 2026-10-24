// Pelin käyttöliittymän palaset: ilmoitukset, tavaraluettelo, paperien
// lukunäkymä ja numerolukko. Kaikki rakennetaan DOMiin tässä tiedostossa.
import { EVIDENCE, EVIDENCE_TOTAL, INVENTORY } from './game.js';

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}

// Esc sulkee päällimmäisen ikkunan eikä mitään sen alla.
function onEscape(close) {
  const handler = (e) => {
    if (e.key !== 'Escape') return;
    e.stopImmediatePropagation();
    close();
  };
  addEventListener('keydown', handler, true);
  return () => removeEventListener('keydown', handler, true);
}

// --- ilmoitus ----------------------------------------------------------------------
const toastEl = el('div', 'toast');
toastEl.setAttribute('role', 'status');
document.body.appendChild(toastEl);
let toastTimer;
export function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 3500);
}

// --- tavarat ja todisteet oikeassa yläkulmassa ----------------------------------------
export function inventoryHud(game) {
  const hud = el('div', 'hud');
  const items = el('div', 'hud-items');
  const evidence = el('button', 'hud-evidence');
  const list = el('ul', 'hud-list');
  list.hidden = true;
  evidence.addEventListener('click', () => { list.hidden = !list.hidden; });
  hud.append(items, evidence, list);
  document.body.appendChild(hud);

  game.onChange(() => {
    items.replaceChildren(...game.inventory.map((id) => el('span', 'hud-chip', INVENTORY[id])));
    evidence.textContent = `Todisteet ${game.evidence.length}/${EVIDENCE_TOTAL}`;
    list.replaceChildren(...(game.evidence.length
      ? game.evidence.map((id) => el('li', null, EVIDENCE[id]))
      : [el('li', 'hud-empty', 'Ei vielä todisteita.')]));
  });
}

// --- paperien lukunäkymä -----------------------------------------------------------
// pages: [{ canvas, label, markable }] ; onMark(page) kutsutaan, kun pelaaja
// merkitsee paperin epäilyttäväksi.
export function readView(title, pages, { onMark } = {}) {
  const overlay = el('div', 'overlay read');
  const head = el('div', 'overlay-head');
  const close = el('button', 'overlay-close', 'Sulje');
  head.append(el('h2', null, title), close);
  const strip = el('div', 'read-strip');
  for (const page of pages) {
    const fig = el('figure', 'read-page');
    const img = new Image();
    img.src = page.canvas.toDataURL('image/png');
    img.alt = page.label ?? '';
    fig.appendChild(img);
    if (page.markable) {
      const mark = el('button', 'read-mark', 'Merkitse epäilyttäväksi');
      mark.addEventListener('click', () => onMark?.(page, mark));
      fig.appendChild(mark);
    }
    strip.appendChild(fig);
  }
  overlay.append(head, strip);
  document.body.appendChild(overlay);
  const off = onEscape(done);
  close.addEventListener('click', done);
  function done() {
    off();
    overlay.remove();
  }
}

// --- numerolukko -------------------------------------------------------------------
export function codeLock({ title, digits, code, hint, onOpen }) {
  const values = Array(digits).fill(0);
  let fails = 0;
  const overlay = el('div', 'overlay lock');
  const card = el('div', 'lock-card');
  const wheels = el('div', 'lock-wheels');
  const message = el('p', 'lock-message', 'Pyöritä numerot oikeiksi.');
  values.forEach((_, i) => {
    const wheel = el('div', 'lock-wheel');
    const up = el('button', 'lock-step', '▲');
    const value = el('div', 'lock-digit', '0');
    const down = el('button', 'lock-step', '▼');
    up.setAttribute('aria-label', `Numero ${i + 1} ylös`);
    down.setAttribute('aria-label', `Numero ${i + 1} alas`);
    const step = (d) => {
      values[i] = (values[i] + d + 10) % 10;
      value.textContent = values[i];
    };
    up.addEventListener('click', () => step(1));
    down.addEventListener('click', () => step(-1));
    wheel.addEventListener('wheel', (e) => { e.preventDefault(); step(e.deltaY < 0 ? 1 : -1); });
    wheel.append(up, value, down);
    wheels.appendChild(wheel);
  });
  const open = el('button', 'lock-open', 'Avaa');
  const cancel = el('button', 'lock-cancel', 'Peruuta');
  const buttons = el('div', 'lock-buttons');
  buttons.append(cancel, open);
  card.append(el('h2', null, title), wheels, message, buttons);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // numeronäppäimet täyttävät rullat vasemmalta oikealle
  let cursor = 0;
  const keys = (e) => {
    if (/^[0-9]$/.test(e.key)) {
      values[cursor] = Number(e.key);
      wheels.children[cursor].querySelector('.lock-digit').textContent = e.key;
      cursor = (cursor + 1) % digits;
    } else if (e.key === 'Enter') {
      tryOpen();
    }
  };
  addEventListener('keydown', keys);
  const off = onEscape(done);
  cancel.addEventListener('click', done);
  open.addEventListener('click', tryOpen);

  function tryOpen() {
    if (values.join('') === code) {
      done();
      onOpen();
      return;
    }
    fails++;
    card.classList.remove('shake');
    void card.offsetWidth;   // käynnistää ravistusanimaation uudelleen
    card.classList.add('shake');
    message.textContent = fails >= 3 && hint ? hint : 'Ei aukea.';
  }
  function done() {
    off();
    removeEventListener('keydown', keys);
    overlay.remove();
  }
}
