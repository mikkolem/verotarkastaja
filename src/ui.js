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
// type: 'info' | 'success' (avautui) | 'item' (löytyi tavara) | 'evidence' | 'hint'
const TOAST_ICONS = { info: 'ℹ️', success: '✅', item: '🔑', evidence: '📌', hint: '💡' };
export function toast(message, type = 'info') {
  toastEl.className = `toast ${type}`;
  toastEl.replaceChildren(el('span', 'toast-icon', TOAST_ICONS[type]), el('span', null, message));
  void toastEl.offsetWidth;   // käynnistää näkyviin liukumisen uudelleen
  toastEl.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('visible'), type === 'hint' ? 8000 : 4500);
}

// --- tavarat ja todisteet oikeassa yläkulmassa ----------------------------------------
export function inventoryHud(game, { onHelp }) {
  const hud = el('div', 'hud');
  const items = el('div', 'hud-items');
  const evidence = el('button', 'hud-evidence');
  evidence.title = 'Näytä löydetyt todisteet';
  const help = el('button', 'hud-help', 'Ohjeet');
  help.addEventListener('click', onHelp);
  const list = el('ul', 'hud-list');
  list.hidden = true;
  evidence.addEventListener('click', () => { list.hidden = !list.hidden; });
  hud.append(items, evidence, help, list);
  document.body.appendChild(hud);

  game.onChange(() => {
    const owned = game.inventory.map((id) => el('span', 'hud-chip', INVENTORY[id]));
    items.replaceChildren(...(owned.length ? [el('span', 'hud-label', 'Tavarat'), ...owned] : []));
    evidence.textContent = `Todisteet ${game.evidence.length}/${EVIDENCE_TOTAL}`;
    list.replaceChildren(...(game.evidence.length
      ? game.evidence.map((id) => el('li', null, EVIDENCE[id]))
      : [el('li', 'hud-empty', 'Ei vielä todisteita. Kun luet papereita, merkitse epäilyttävät kohdat todisteiksi.')]));
  });
}

// --- paperien lukunäkymä -----------------------------------------------------------
// Yksi paperi kerrallaan ruudun kokoon sovitettuna; selaus nuolilla tai pienoiskuvista.
// pages: [{ canvas, label, markable, evidence }] ; onMark(page, button) kutsutaan,
// kun pelaaja merkitsee paperin epäilyttäväksi, isMarked(page) kertoo tilan.
export function readView(title, pages, { onMark, isMarked } = {}) {
  let index = 0;
  const overlay = el('div', 'overlay read');
  const head = el('div', 'overlay-head');
  const counter = el('span', 'read-counter');
  const close = el('button', 'overlay-close', 'Sulje');
  const heading = el('h2', null, title);
  heading.appendChild(counter);
  head.append(heading, close);

  const main = el('div', 'read-main');
  const prev = el('button', 'read-nav', '‹');
  const next = el('button', 'read-nav', '›');
  prev.setAttribute('aria-label', 'Edellinen paperi');
  next.setAttribute('aria-label', 'Seuraava paperi');
  const img = new Image();
  img.className = 'read-image';
  main.append(prev, img, next);

  const foot = el('div', 'read-foot');
  const mark = el('button', 'read-mark');
  const thumbs = el('div', 'read-thumbs');
  const sources = pages.map((p) => p.canvas.toDataURL('image/png'));
  pages.forEach((p, i) => {
    const t = new Image();
    t.src = sources[i];
    t.alt = p.label ?? '';
    t.addEventListener('click', () => show(i));
    thumbs.appendChild(t);
  });
  foot.append(mark, thumbs);
  overlay.append(head, main, foot);
  document.body.appendChild(overlay);

  function show(i) {
    index = (i + pages.length) % pages.length;
    const page = pages[index];
    img.src = sources[index];
    img.alt = page.label ?? '';
    counter.textContent = pages.length > 1 ? ` · ${index + 1}/${pages.length}` : '';
    const multi = pages.length > 1;
    prev.style.visibility = next.style.visibility = multi ? 'visible' : 'hidden';
    thumbs.hidden = !multi;
    [...thumbs.children].forEach((t, j) => t.classList.toggle('active', j === index));
    mark.hidden = !page.markable;
    const done = isMarked?.(page);
    mark.disabled = !!done;
    mark.textContent = done ? '✓ Merkitty todisteeksi' : 'Merkitse epäilyttäväksi';
  }
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  mark.addEventListener('click', () => {
    onMark?.(pages[index], mark);
    show(index);
  });
  // nuolinäppäimet selaavat papereita eivätkä käännä kameraa
  const keys = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.stopImmediatePropagation();
      show(index + (e.key === 'ArrowRight' ? 1 : -1));
    }
  };
  addEventListener('keydown', keys, true);
  const off = onEscape(done);
  close.addEventListener('click', done);
  show(0);
  function done() {
    off();
    removeEventListener('keydown', keys, true);
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

// --- puhelinvastaajan viestit --------------------------------------------------------
// messages: [{ from, time, text }] ; näytetään yksi kerrallaan ”toistona”.
export function voicemail(messages, { onDone } = {}) {
  let index = 0;
  const overlay = el('div', 'overlay lock');
  const card = el('div', 'lock-card voicemail');
  const counter = el('div', 'vm-counter');
  const from = el('div', 'vm-from');
  const wave = el('div', 'vm-wave');
  for (let i = 0; i < 28; i++) wave.appendChild(el('span'));
  const text = el('p', 'vm-text');
  const next = el('button', 'lock-open');
  const close = el('button', 'lock-cancel', 'Sulje');
  const buttons = el('div', 'lock-buttons');
  buttons.append(close, next);
  card.append(el('h2', null, 'Puhelinvastaaja'), counter, from, wave, text, buttons);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  function show() {
    const m = messages[index];
    counter.textContent = `Viesti ${index + 1}/${messages.length}`;
    from.textContent = `${m.from} · ${m.time}`;
    text.textContent = '';
    wave.classList.add('playing');
    // teksti ”puhutaan” näkyviin pätkä kerrallaan
    let shown = 0;
    clearInterval(show.timer);
    show.timer = setInterval(() => {
      shown = Math.min(m.text.length, shown + 3);
      text.textContent = m.text.slice(0, shown);
      if (shown >= m.text.length) {
        clearInterval(show.timer);
        wave.classList.remove('playing');
      }
    }, 30);
    next.textContent = index < messages.length - 1 ? 'Seuraava viesti' : 'Valmis';
  }
  next.addEventListener('click', () => {
    if (index < messages.length - 1) {
      index++;
      show();
    } else {
      done();
    }
  });
  const off = onEscape(done);
  close.addEventListener('click', done);
  show();
  function done() {
    clearInterval(show.timer);
    off();
    overlay.remove();
    onDone?.();
  }
}

// --- salasanakenttä (tietokone) ------------------------------------------------------
export function passwordPrompt({ title, hint, check, failHint, onOpen }) {
  let fails = 0;
  const overlay = el('div', 'overlay lock');
  const card = el('form', 'lock-card login');
  const input = el('input', 'login-input');
  input.type = 'password';
  input.autocomplete = 'off';
  input.placeholder = 'Salasana';
  const message = el('p', 'lock-message', hint);
  const open = el('button', 'lock-open', 'Kirjaudu');
  open.type = 'submit';
  const cancel = el('button', 'lock-cancel', 'Peruuta');
  cancel.type = 'button';
  const buttons = el('div', 'lock-buttons');
  buttons.append(cancel, open);
  card.append(el('h2', null, title), el('div', 'login-user', 'Kalevi Kivi'), input, message, buttons);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  input.focus();

  const off = onEscape(done);
  cancel.addEventListener('click', done);
  card.addEventListener('submit', (e) => {
    e.preventDefault();
    if (check(input.value.trim())) {
      done();
      onOpen();
      return;
    }
    fails++;
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
    message.textContent = fails >= 3 && failHint ? failHint : 'Väärä salasana.';
    input.select();
  });
  function done() {
    off();
    overlay.remove();
  }
}
