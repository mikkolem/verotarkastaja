// Pelin loppuosa: 30 minuutin aikaraja, tarkastusraportti ja loppukohtaus,
// jossa ovi aukeaa ja Kalevi palaa lounaalta.
import { EVIDENCE, EVIDENCE_CATEGORY, EVIDENCE_TOTAL, REASONS, TERMS, game } from './game.js';

const TIME_LIMIT = 30 * 60;            // sekuntia
const HINT_COST = 5 * 60;              // vihje vähentää aikaa näin monta sekuntia
const START_CLOCK = 12 * 60 + 3;       // tarinan kellonaika alussa (12.03)
const WARNINGS = [
  [10 * 60, 'Sihteeri soittaa: Kalevi on tilannut jälkiruoan. Kymmenen minuuttia jäljellä.'],
  [5 * 60, 'Käytävältä kuuluu askelia… ei, se oli vain siivooja. Viisi minuuttia jäljellä.'],
  [2 * 60, 'Hissi kilahtaa alakerrassa! Kaksi minuuttia jäljellä.'],
  [30, 'Oven takaa kuuluu avainten kilinää!'],
];
function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const storyClock = (elapsed) => {
  const m = START_CLOCK + Math.floor(elapsed / 60);
  return `${Math.floor(m / 60)}.${String(m % 60).padStart(2, '0')}`;
};

export function createFinale({ scene, views, interaction, animations, toast, onDirty, nextHint, door }) {
  let elapsed = 0;
  let hintsUsed = 0;
  let running = false;
  // raportissa valitut perusteet: todiste -> valitun vaihtoehdon teksti
  const chosen = {};
  // vaihtoehtojen järjestys arvotaan kerran, jotta oikea ei ole aina ensimmäinen
  const shuffled = Object.fromEntries(Object.entries(REASONS).map(([id, list]) => [id, [...list].sort(() => Math.random() - 0.5)]));
  const correctReasons = () => Object.keys(REASONS).filter((id) => game.hasEvidence(id) && chosen[id] === REASONS[id][0].text).length;
  let warned = 0;
  let ending = false;

  // --- aikanäyttö -----------------------------------------------------------------
  const timer = el('div', 'timer');
  timer.title = 'Aikaa jäljellä ennen kuin Kalevi palaa';
  const reportButton = el('button', 'timer-report', 'Tarkastusraportti');
  reportButton.addEventListener('click', () => openReport());
  const box = el('div', 'timer-box');
  // Vihje maksaa aikaa vain ensimmäisellä kerralla: saman vaiheen vihjeen voi
  // pyytää uudelleen ilmaiseksi. Kun kaikki todisteet on löydetty, vihje on ilmainen.
  const hintButton = el('button', 'timer-hint');
  const hintText = el('span', null, '💡 Pyydä vihje');
  const hintCost = el('span', 'timer-hint-cost');
  hintButton.append(hintText, hintCost);
  const paidHints = new Set();
  const hintIsFree = (hint) => paidHints.has(hint) || game.evidence.length === EVIDENCE_TOTAL;
  const renderHint = () => {
    const free = hintIsFree(nextHint());
    const label = free ? 'ilmainen' : `−${HINT_COST / 60} min`;
    if (hintCost.textContent !== label) {
      hintCost.textContent = label;
      hintButton.classList.toggle('free', free);
      hintButton.title = free
        ? 'Tämän vaiheen vihje on jo maksettu: näet sen uudelleen ilmaiseksi.'
        : `Näytä vihje seuraavaan vaiheeseen. Maksaa ${HINT_COST / 60} minuuttia aikaa.`;
    }
  };
  hintButton.addEventListener('click', () => {
    if (ending || !running) return;
    const hint = nextHint();
    if (!hintIsFree(hint)) {
      paidHints.add(hint);
      hintsUsed++;
      elapsed += HINT_COST;
    }
    render();
    toast(hint, 'hint');
  });
  box.append(timer, hintButton, reportButton);
  // yläkulman tietojen (tavarat, todisteet, ohjeet) eteen samalle riville
  document.querySelector('.hud').prepend(box);
  const render = () => {
    const left = Math.max(0, TIME_LIMIT - elapsed);
    timer.textContent = `⏱ ${fmt(left)}`;
    renderHint();
    timer.classList.toggle('urgent', left <= 120);
  };
  render();

  // Ovi ja käytävän valo ovat yhteiset prologin kanssa (main.js: createDoor).
  function openDoor() {
    let t = 0;
    animations.push((dt) => {
      t = Math.min(1, t + dt / 2.2);
      const k = 1 - Math.pow(1 - t, 3);
      door.set(k);
      return t < 1;
    });
  }

  // --- tarkastusraportti: tarkistuslista todisteista ------------------------------------
  function openReport() {
    if (ending) return;
    interaction.close();
    const overlay = el('div', 'overlay lock');
    const card = el('div', 'lock-card report');
    const found = game.evidence.length;
    card.append(
      el('h2', null, 'Tarkastusraportti'),
      el('p', 'report-meta', `Kohde: Kivi & Kumppanit Oy · Kello ${storyClock(elapsed)}`),
    );
    const list = el('ol', 'report-list');
    Object.keys(EVIDENCE).forEach((id, i) => {
      const ok = game.hasEvidence(id);
      const item = el('li', `report-item${ok ? ' found' : ''}`);
      const body = el('div', 'report-item-body');
      body.appendChild(el('div', null, ok ? EVIDENCE[id] : `Todiste ${i + 1}: ${EVIDENCE_CATEGORY[id]} – ei vielä löydetty`));
      if (ok) {
        // peruste valitaan kolmesta vaihtoehdosta; muistiinpano selittää termin
        const reasons = el('div', 'report-reason');
        shuffled[id].forEach(({ text, note }) => {
          const lab = el('label');
          const input = el('input');
          input.type = 'radio';
          input.name = `reason-${id}`;
          input.checked = chosen[id] === text;
          input.addEventListener('change', () => { chosen[id] = text; });
          const span = el('span');
          span.append(el('span', 'report-reason-text', text), el('span', 'report-reason-note', note));
          lab.append(input, span);
          reasons.appendChild(lab);
        });
        body.appendChild(reasons);
      }
      item.append(el('span', 'report-check', ok ? '✓' : ''), body);
      list.appendChild(item);
    });
    const complete = found === EVIDENCE_TOTAL;
    const status = complete
      ? 'Kaikki todisteet on koottu. Valitse jokaiselle peruste ja lähetä raportti.'
      : `Todisteita ${found}/${EVIDENCE_TOTAL}. Valitse löydöille peruste ja jatka tutkimista. `
        + 'Raportin lähettäminen päättää tarkastuksen.';
    // Kesken: ”Jatka tutkimista” on päätoiminto, lähetys toissijainen.
    // Valmis: ”Lähetä raportti” on päätoiminto.
    const send = el('button', complete ? 'lock-open' : 'lock-cancel', complete ? 'Lähetä raportti' : 'Lähetä keskeneräisenä');
    const cancel = el('button', complete ? 'lock-cancel' : 'lock-open', 'Jatka tutkimista');
    const buttons = el('div', 'lock-buttons');
    buttons.append(complete ? cancel : send, complete ? send : cancel);
    const help = el('p', 'report-help', status);
    card.append(list, help, buttons);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    cancel.addEventListener('click', () => overlay.remove());
    send.addEventListener('click', () => {
      const missingReasons = Object.keys(EVIDENCE).filter((id) => game.hasEvidence(id) && !chosen[id]).length;
      if (complete && missingReasons === 0) {
        overlay.remove();
        finish({ reason: 'report' });
        return;
      }
      confirmSend({
        missing: EVIDENCE_TOTAL - found,
        missingReasons,
        onBack: () => overlay.remove(),   // takaisin huoneeseen, raportti sulkeutuu
        onConfirm: () => { overlay.remove(); finish({ reason: 'report' }); },
      });
    });
  }

  // Varmistus ennen keskeneräisen raportin lähettämistä: peli päättyy siihen.
  function confirmSend({ missing, missingReasons, onConfirm, onBack }) {
    const overlay = el('div', 'overlay lock confirm');
    const card = el('div', 'lock-card confirm-card');
    const lines = [];
    if (missing > 0) lines.push(`${missing} ${missing === 1 ? 'todiste jää' : 'todistetta jää'} löytymättä.`);
    if (missingReasons > 0) lines.push(`${missingReasons} ${missingReasons === 1 ? 'löydöltä' : 'löydöltä'} puuttuu peruste, mikä laskee arvosanaa.`);
    lines.push(`Aikaa on vielä ${fmt(Math.max(0, TIME_LIMIT - elapsed))}.`);
    const back = el('button', 'lock-open', 'Jatka tutkimista');
    const ok = el('button', 'lock-cancel', 'Lähetä silti');
    const buttons = el('div', 'lock-buttons');
    buttons.append(ok, back);
    card.append(el('h2', null, 'Lähetetäänkö raportti?'), el('p', 'confirm-lead', 'Lähettäminen päättää tarkastuksen. Et voi palata huoneeseen.'));
    lines.forEach((t) => card.appendChild(el('p', 'confirm-line', t)));
    card.appendChild(buttons);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    back.focus();
    const close = () => overlay.remove();
    back.addEventListener('click', () => { close(); onBack?.(); });
    ok.addEventListener('click', () => { close(); onConfirm(); });
  }

  // --- loppu --------------------------------------------------------------------------
  function finish({ reason }) {
    if (ending) return;
    running = false;
    interaction.close();
    const found = game.evidence.length;

    views.locked = false;
    views.go(views.indexOf('door'));
    ending = true;
    box.hidden = true;
    document.body.classList.add('ending');
    setTimeout(() => { openDoor(); onDirty(); }, 1500);
    setTimeout(() => showKalevi(reason, found), 3300);
    setTimeout(() => showResult({ reason, found }), 6200);
  }

  // Kalevi astuu ovesta: henkilökuva ja repliikki ruudun vasempaan laitaan.
  function kaleviQuote(reason, found) {
    return reason === 'time'
      ? '– Mitä te teette minun laatikoillani?!'
      : found === EVIDENCE_TOTAL
        ? '– No mutta. Te olette… perusteellinen. Kahvia?'
        : '– Ai, tarkastus? Kukaan ei kertonut. Viskiä?';
  }

  function showKalevi(reason, found) {
    const quote = kaleviQuote(reason, found);
    const card = el('div', 'kalevi-arrives');
    const img = new Image();
    img.src = `${import.meta.env.BASE_URL}characters/kalevi.jpg`;
    img.alt = 'Kalevi K.';
    card.append(img, el('p', 'kalevi-quote', quote));
    document.body.appendChild(card);
  }

  function grade(found) {
    const reasons = correctReasons();
    if (found === EVIDENCE_TOTAL && hintsUsed <= 1 && reasons === EVIDENCE_TOTAL) return ['Erinomainen', 'Kahdenkertainen kirjanpito, kaksinkertainen tarkastaja. Pirjon mielestä olisit loistava kirjanpitäjä.'];
    if (found === EVIDENCE_TOTAL && reasons >= EVIDENCE_TOTAL - 1) return ['Kiitettävä', 'Kaikki todisteet koossa ja perusteet lähes kohdallaan. Kalevin juristit tekevät ylitöitä.'];
    if (found === EVIDENCE_TOTAL) return ['Hyvä', 'Todisteet löytyivät, mutta perustelut horjuvat. Kalevin juristit löytävät aukon.'];
    if (found === 4) return ['Hyvä', 'Cayman-tili jäi löytymättä, mutta B-kirjanpito riittää. Kalevi saa jälkiverot ja veronkorotukset.'];
    if (found === 3) return ['Tyydyttävä', 'Toinen kirjanpito on todistettu. Virallinen tarkastus jatkaa siitä, mihin jäit.'];
    if (found === 2) return ['Välttävä', 'Tapaus siirtyy jatkoselvitykseen. Kesämökin sauna jää lämpiämään.'];
    if (found === 1) return ['Heikko', 'Yksi kiuas ei vielä kaada imperiumia. Kalevi lähtee ”golfmatkalle”.'];
    return ['Hylätty', 'Kalevi tarjoaa sinulle viskiä. Kieltäydyt, mutta todisteita ei ole.'];
  }

  // Lopputulos isona näkymänä: vasemmalla Kalevi repliikkeineen, oikealla arvosana,
  // tarina, tilastot ja löydetyt todisteet; alla termit kahdessa sarakkeessa.
  function showResult({ reason, found }) {
    document.body.classList.add('result-open');
    const [title, line] = grade(found);
    const overlay = el('div', 'overlay lock result');
    const card = el('div', 'lock-card result-card');

    const side = el('aside', 'result-side');
    const img = new Image();
    img.src = `${import.meta.env.BASE_URL}characters/kalevi.jpg`;
    img.alt = 'Kalevi K.';
    side.append(img, el('p', 'result-quote', kaleviQuote(reason, found)));

    const main = el('div', 'result-main');
    const story = reason === 'report'
      ? `Lähetit raportin kello ${storyClock(elapsed)}. Samalla ovi aukeaa: Kalevi palaa lounaalta ja löytää sinut työpöytänsä äärestä.`
      : 'Ovi aukeaa ennen kuin raportti on valmis. Kalevi palaa lounaalta ja tuijottaa avattuja laatikoitaan. – Tämä on… rutiinikäynti, sinä sanot.';
    const stats = el('div', 'result-stats');
    [
      ['Todisteita', `${found}/${EVIDENCE_TOTAL}`],
      ['Perusteet oikein', `${correctReasons()}/${found}`],
      ['Aikaa kului', fmt(Math.min(elapsed, TIME_LIMIT))],
      ['Vihjeitä', String(hintsUsed)],
    ].forEach(([k, v]) => {
      const s = el('div', 'result-stat');
      s.append(el('div', 'result-stat-value', v), el('div', 'result-stat-label', k));
      stats.appendChild(s);
    });
    const list = el('ul', 'result-evidence');
    Object.keys(EVIDENCE).forEach((id) => {
      const ok = game.hasEvidence(id);
      const right = ok && chosen[id] === REASONS[id][0].text;
      const li = el('li', ok ? (right ? 'ok' : 'half') : 'miss');
      li.append(
        el('span', 'result-evidence-mark', ok ? (right ? '✓' : '½') : '–'),
        el('span', null, ok ? EVIDENCE[id] : `Löytymättä: ${EVIDENCE_CATEGORY[id]}`),
      );
      list.appendChild(li);
    });
    main.append(
      el('div', 'result-kicker', reason === 'report' ? 'Tarkastus valmis' : 'Aika loppui'),
      el('h2', null, `Arvosana: ${title}`),
      el('p', 'result-line', line),
      el('p', 'result-story', story),
      stats,
      list,
    );

    // termit yhden rivin selityksineen
    const terms = el('section', 'result-terms');
    terms.appendChild(el('h3', 'result-terms-title', 'Tarkastuksessa vastaan tulleet termit'));
    const grid = el('dl', 'result-terms-grid');
    TERMS.forEach(([term, note]) => {
      const row = el('div');
      row.append(el('dt', null, term), el('dd', null, note));
      grid.appendChild(row);
    });
    terms.appendChild(grid);

    const again = el('button', 'lock-open', 'Pelaa uudelleen');
    again.addEventListener('click', () => location.reload());
    const buttons = el('div', 'lock-buttons');
    buttons.append(again);
    card.append(side, main, terms, buttons);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }

  return {
    get ending() { return ending; },
    get elapsed() { return elapsed; },
    get hintsUsed() { return hintsUsed; },
    timeLimit: TIME_LIMIT,
    openReport,
    skip(seconds) { elapsed += seconds; },   // kehitystyön apu
    start() { running = true; },
    pause(p) { if (!ending) running = !p; },
    update(dt) {
      if (!running) return;
      elapsed += dt;
      const left = TIME_LIMIT - elapsed;
      while (warned < WARNINGS.length && left <= WARNINGS[warned][0]) {
        toast(WARNINGS[warned][1], 'hint');
        warned++;
      }
      render();
      if (left <= 0) finish({ reason: 'time' });
    },
  };
}
