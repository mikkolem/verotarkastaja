// Pelin loppuosa: 15 minuutin aikaraja, tarkastusraportti ja loppukohtaus,
// jossa ovi aukeaa ja Kalevi palaa lounaalta.
import * as THREE from 'three';
import { EVIDENCE, EVIDENCE_TOTAL, game } from './game.js';

const TIME_LIMIT = 15 * 60;            // sekuntia
const HINT_COST = 60;                  // vihje vähentää aikaa näin monta sekuntia
const START_CLOCK = 12 * 60 + 3;       // tarinan kellonaika alussa (12.03)
const WARNINGS = [
  [5 * 60, 'Käytävältä kuuluu askelia… ei, se oli vain siivooja. Viisi minuuttia jäljellä.'],
  [2 * 60, 'Hissi kilahtaa alakerrassa! Kaksi minuuttia jäljellä.'],
  [30, 'Oven takaa kuuluu avainten kilinää!'],
];
// Raportin harhautukset: totta, mutta eivät veropetoksia.
const DECOYS = [
  'Toimitusjohtajan tuoli on epäilyttävän mukava',
  'Nitoja on kirjattu käyttöomaisuudeksi',
  'Kunniakirja on itse itselle myönnetty',
  'Viherkasvia ei ole kasteltu',
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

// Kalevin siluetti oviaukossa: musta hahmo läpinäkyvällä taustalla.
function silhouetteTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 680;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.beginPath();
  g.arc(128, 70, 46, 0, Math.PI * 2);                      // pää
  g.fill();
  g.beginPath();                                            // hartiat, vatsa ja jalat
  g.moveTo(40, 170);
  g.quadraticCurveTo(128, 120, 216, 170);
  g.quadraticCurveTo(250, 330, 214, 420);
  g.lineTo(190, 680);
  g.lineTo(140, 680);
  g.lineTo(128, 460);
  g.lineTo(116, 680);
  g.lineTo(66, 680);
  g.lineTo(42, 420);
  g.quadraticCurveTo(6, 330, 40, 170);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createFinale({ scene, views, interaction, animations, toast, onDirty, nextHint }) {
  let elapsed = 0;
  let hintsUsed = 0;
  let running = false;
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

  // --- käytävän valo ja Kalevin siluetti (valmiina, mutta näkymättöminä) -------------
  // Valo luodaan heti latauksessa, jotta sen lisääminen ei käännä varjostimia
  // uudelleen kesken loppukohtauksen.
  const hallLight = new THREE.PointLight(0xffd9a0, 0, 7, 1.5);
  hallLight.position.set(-1.2, 2.3, 3.4);
  scene.add(hallLight);
  const kalevi = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 1.66),
    new THREE.MeshBasicMaterial({ map: silhouetteTexture(), transparent: true, opacity: 0, depthWrite: false }),
  );
  kalevi.position.set(-1.2, 0.83, 2.6);
  kalevi.rotation.y = Math.PI;
  kalevi.visible = false;
  scene.add(kalevi);

  function openDoor() {
    const slab = scene.getObjectByName('door_slab');
    const hinge = new THREE.Group();
    hinge.position.set(-1.62, 0, 2.04);
    scene.add(hinge);
    hinge.updateMatrixWorld(true);
    hinge.attach(slab);
    kalevi.visible = true;
    let t = 0;
    animations.push((dt) => {
      t = Math.min(1, t + dt / 2.2);
      const k = 1 - Math.pow(1 - t, 3);
      hinge.rotation.y = 1.25 * k;
      hallLight.intensity = 5 * k;
      kalevi.material.opacity = Math.min(1, t * 1.6);
      return t < 1;
    });
  }

  // --- tarkastusraportti -------------------------------------------------------------
  function openReport() {
    if (ending) return;
    interaction.close();
    const overlay = el('div', 'overlay lock');
    const card = el('form', 'lock-card report');
    const found = game.evidence;
    card.append(
      el('h2', null, 'Tarkastusraportti'),
      el('p', 'report-meta', `Kohde: Kivi & Kumppanit Oy · Kello ${storyClock(elapsed)}`),
      el('p', 'report-help', 'Valitse raporttiin havainnot, jotka osoittavat veropetoksen. Turhat havainnot heikentävät raporttia.'),
    );
    const list = el('div', 'report-list');
    // löydetyt todisteet ja harhautukset sekaisin, mutta aina samassa järjestyksessä
    const options = [
      ...found.map((id) => ({ id, text: EVIDENCE[id], real: true })),
      ...DECOYS.map((text, i) => ({ id: `decoy${i}`, text, real: false })),
    ].sort((a, b) => a.text.localeCompare(b.text, 'fi'));
    for (const o of options) {
      const label = el('label', 'report-item');
      const box = el('input');
      box.type = 'checkbox';
      box.value = o.id;
      label.append(box, el('span', null, o.text));
      list.appendChild(label);
    }
    const missing = EVIDENCE_TOTAL - found.length;
    if (missing > 0) list.appendChild(el('p', 'report-missing', `Löytämättä: ${missing} todistetta.`));
    const send = el('button', 'lock-open', 'Lähetä raportti');
    send.type = 'submit';
    const cancel = el('button', 'lock-cancel', 'Jatka tutkimista');
    cancel.type = 'button';
    const buttons = el('div', 'lock-buttons');
    buttons.append(cancel, send);
    card.append(list, buttons);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    cancel.addEventListener('click', () => overlay.remove());
    card.addEventListener('submit', (e) => {
      e.preventDefault();
      const chosen = [...list.querySelectorAll('input:checked')].map((i) => options.find((o) => o.id === i.value));
      overlay.remove();
      finish({ reason: 'report', chosen });
    });
  }

  // --- loppu --------------------------------------------------------------------------
  function finish({ reason, chosen }) {
    if (ending) return;
    running = false;
    interaction.close();
    // aikaloppu: raporttiin menee se, mitä ehdittiin löytää
    const picked = chosen ?? game.evidence.map((id) => ({ id, real: true }));
    const correct = picked.filter((o) => o.real).length;
    const wrong = picked.filter((o) => !o.real).length;

    views.locked = false;
    views.go(views.indexOf('door'));
    ending = true;
    box.hidden = true;
    document.body.classList.add('ending');
    setTimeout(() => { openDoor(); onDirty(); }, 1500);
    setTimeout(() => showResult({ reason, correct, wrong }), 4600);
  }

  function grade(correct, wrong) {
    const score = correct - wrong * 0.5;
    if (correct === EVIDENCE_TOTAL && wrong === 0) return ['Erinomainen', 'Pirjon mielestä olisit loistava kirjanpitäjä. Verovirasto harkitsee ylennystäsi.'];
    if (score >= 3) return ['Hyvä', 'Kalevin juristit joutuvat tekemään ylitöitä.'];
    if (score >= 1.5) return ['Tyydyttävä', 'Kalevi saa jälkiveroja, mutta kesämökin sauna jää lämpiämään.'];
    if (score > 0) return ['Välttävä', 'Tapaus siirtyy jatkoselvitykseen. Kalevi lähtee ”golfmatkalle”.'];
    return ['Hylätty', 'Kalevi tarjoaa sinulle viskiä. Kieltäydyt, mutta todisteita ei ole.'];
  }

  function showResult({ reason, correct, wrong }) {
    const [title, line] = grade(correct, wrong);
    const overlay = el('div', 'overlay lock result');
    const card = el('div', 'lock-card');
    const story = reason === 'report'
      ? `Lähetit raportin kello ${storyClock(elapsed)}. Samalla ovi aukeaa: Kalevi palaa lounaalta ja löytää sinut työpöytänsä äärestä. – No mutta, hän sanoo. – Kahvia?`
      : 'Ovi aukeaa ennen kuin raportti on valmis. Kalevi palaa lounaalta ja tuijottaa avattuja laatikoitaan. – Tämä on… rutiinitarkastus, sinä sanot.';
    card.append(
      el('div', 'result-kicker', reason === 'report' ? 'Tarkastus valmis' : 'Aika loppui'),
      el('h2', null, `Arvosana: ${title}`),
      el('p', 'result-story', story),
      el('p', 'result-line', line),
      el('p', 'result-stats', [
        `Todisteita raportissa ${correct}/${EVIDENCE_TOTAL}`,
        wrong ? `turhia havaintoja ${wrong}` : null,
        `aikaa kului ${fmt(Math.min(elapsed, TIME_LIMIT))}`,
        `vihjeitä ${hintsUsed}`,
      ].filter(Boolean).join(' · ')),
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
