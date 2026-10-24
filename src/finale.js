// Pelin loppuosa: 15 minuutin aikaraja, tarkastusraportti ja loppukohtaus,
// jossa ovi aukeaa ja Kalevi palaa lounaalta.
import { EVIDENCE, EVIDENCE_TOTAL, REASONS, TERMS, game } from './game.js';

const TIME_LIMIT = 15 * 60;            // sekuntia
const HINT_COST = 60;                  // vihje vähentää aikaa näin monta sekuntia
const START_CLOCK = 12 * 60 + 3;       // tarinan kellonaika alussa (12.03)
const WARNINGS = [
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
  const correctReasons = () => Object.keys(REASONS).filter((id) => game.hasEvidence(id) && chosen[id] === REASONS[id][0]).length;
  let warned = 0;
  let ending = false;

  // --- aikanäyttö -----------------------------------------------------------------
  const timer = el('div', 'timer');
  timer.title = 'Aikaa jäljellä ennen kuin Kalevi palaa';
  const reportButton = el('button', 'timer-report', 'Tarkastusraportti');
  reportButton.addEventListener('click', () => openReport());
  const box = el('div', 'timer-box');
  // Vihje maksaa aikaa: näytetään vihje nykyiseen vaiheeseen ja kello hyppää eteenpäin.
  const hintButton = el('button', 'timer-hint', `💡 Vihje (−${HINT_COST / 60} min)`);
  hintButton.title = 'Näytä vihje seuraavaan vaiheeseen. Maksaa minuutin aikaa.';
  hintButton.addEventListener('click', () => {
    if (ending || !running) return;
    hintsUsed++;
    elapsed += HINT_COST;
    render();
    toast(nextHint(), 'hint');
  });
  box.append(timer, hintButton, reportButton);
  // yläkulman tietojen (tavarat, todisteet, ohjeet) eteen samalle riville
  document.querySelector('.hud').prepend(box);
  const render = () => {
    const left = Math.max(0, TIME_LIMIT - elapsed);
    timer.textContent = `⏱ ${fmt(left)}`;
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
      body.appendChild(el('div', null, ok ? EVIDENCE[id] : `Todiste ${i + 1}: ei vielä löydetty`));
      if (ok) {
        // peruste valitaan kolmesta vaihtoehdosta
        const reasons = el('div', 'report-reason');
        shuffled[id].forEach((text) => {
          const lab = el('label');
          const input = el('input');
          input.type = 'radio';
          input.name = `reason-${id}`;
          input.checked = chosen[id] === text;
          input.addEventListener('change', () => { chosen[id] = text; });
          lab.append(input, el('span', null, text));
          reasons.appendChild(lab);
        });
        body.appendChild(reasons);
      }
      item.append(el('span', 'report-check', ok ? '✓' : ''), body);
      list.appendChild(item);
    });
    const status = found === EVIDENCE_TOTAL
      ? 'Kaikki todisteet on koottu. Valitse jokaiselle peruste ja lähetä raportti.'
      : `Todisteita ${found}/${EVIDENCE_TOTAL}. Valitse löydöille peruste. Voit lähettää raportin nyt tai jatkaa tutkimista.`;
    const send = el('button', 'lock-open', found === EVIDENCE_TOTAL ? 'Lähetä raportti' : 'Lähetä keskeneräisenä');
    const cancel = el('button', 'lock-cancel', 'Jatka tutkimista');
    const buttons = el('div', 'lock-buttons');
    buttons.append(cancel, send);
    card.append(list, el('p', 'report-help', status), buttons);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    cancel.addEventListener('click', () => overlay.remove());
    send.addEventListener('click', () => {
      overlay.remove();
      finish({ reason: 'report' });
    });
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
  function showKalevi(reason, found) {
    const quote = reason === 'time'
      ? '– Mitä te teette minun laatikoillani?!'
      : found === EVIDENCE_TOTAL
        ? '– No mutta. Te olette… perusteellinen. Kahvia?'
        : '– Ai, tarkastus? Kukaan ei kertonut. Viskiä?';
    const card = el('div', 'kalevi-arrives');
    const img = new Image();
    img.src = `${import.meta.env.BASE_URL}characters/kalevi.jpg`;
    img.alt = 'Kalevi Kivi';
    card.append(img, el('p', 'kalevi-quote', quote));
    document.body.appendChild(card);
  }

  function grade(found) {
    const reasons = correctReasons();
    if (found === EVIDENCE_TOTAL && hintsUsed <= 1 && reasons === EVIDENCE_TOTAL) return ['Erinomainen', 'Kahdenkertainen kirjanpito, kaksinkertainen tarkastaja. Pirjon mielestä olisit loistava kirjanpitäjä.'];
    if (found === EVIDENCE_TOTAL && reasons >= EVIDENCE_TOTAL - 1) return ['Kiitettävä', 'Kaikki todisteet koossa ja perusteet lähes kohdallaan. Kalevin juristit tekevät ylitöitä.'];
    if (found === EVIDENCE_TOTAL) return ['Hyvä', 'Todisteet löytyivät, mutta perustelut horjuvat. Kalevin juristit löytävät aukon.'];
    if (found === 3) return ['Hyvä', 'Kalevi saa jälkiverot ja veronkorotukset. Golfmatkat jäävät väliin.'];
    if (found === 2) return ['Tyydyttävä', 'Tapaus siirtyy jatkoselvitykseen. Kesämökin sauna jää lämpiämään.'];
    if (found === 1) return ['Välttävä', 'Yksi kiuas ei vielä kaada imperiumia. Kalevi lähtee ”golfmatkalle”.'];
    return ['Hylätty', 'Kalevi tarjoaa sinulle viskiä. Kieltäydyt, mutta todisteita ei ole.'];
  }

  function showResult({ reason, found }) {
    const [title, line] = grade(found);
    const overlay = el('div', 'overlay lock result');
    const card = el('div', 'lock-card');
    const story = reason === 'report'
      ? `Lähetit raportin kello ${storyClock(elapsed)}. Samalla ovi aukeaa: Kalevi palaa lounaalta ja löytää sinut työpöytänsä äärestä.`
      : 'Ovi aukeaa ennen kuin raportti on valmis. Kalevi palaa lounaalta ja tuijottaa avattuja laatikoitaan. – Tämä on… rutiinitarkastus, sinä sanot.';
    card.append(
      el('div', 'result-kicker', reason === 'report' ? 'Tarkastus valmis' : 'Aika loppui'),
      el('h2', null, `Arvosana: ${title}`),
      el('p', 'result-story', story),
      el('p', 'result-line', line),
      el('p', 'result-stats', [
        `Todisteita ${found}/${EVIDENCE_TOTAL}`,
        `perusteista oikein ${correctReasons()}/${found}`,
        `aikaa kului ${fmt(Math.min(elapsed, TIME_LIMIT))}`,
        `vihjeitä ${hintsUsed}`,
      ].filter(Boolean).join(' · ')),
      el('p', 'result-terms', `Tarkastuksessa vastaan tulleet termit: ${TERMS.join(', ')}.`),
    );
    const again = el('button', 'lock-open', 'Pelaa uudelleen');
    again.addEventListener('click', () => location.reload());
    const buttons = el('div', 'lock-buttons');
    buttons.append(again);
    card.append(buttons);
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
