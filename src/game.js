// Pelin tila: mukana kulkevat tavarat, löydetyt todisteet ja tapahtumaliput
// (esim. "laatikko A avattu"). Käyttöliittymä kuuntelee muutoksia onChange-kutsulla.

export const INVENTORY = {
  key: '🔑 Messinkiavain',
  invoice_bottom: '📄 Laskun alaosa',
};

export const EVIDENCE = {
  kiuas: 'Kesämökin kiuas kirjattu edustuskuluksi (400 €, juhannusaatto)',
  cayman_invoice: 'Myyntilasku 10 000 € Caymansaarille – puuttuu virallisesta kirjanpidosta',
  second_ledger: 'Salainen B-kirjanpito: todellinen liikevaihto 1,48 milj. € (virallinen 0,61 milj. €)',
  cayman_transfer: 'Kalenterimerkintä: 870 000 € siirto Caymansaarille ”golfmatkana”',
};
export const EVIDENCE_TOTAL = Object.keys(EVIDENCE).length;

const state = {
  inventory: new Set(),
  evidence: new Set(),
  flags: new Set(),
};
const listeners = new Set();

function changed() {
  for (const fn of listeners) fn(state);
}

export const game = {
  has: (item) => state.inventory.has(item),
  give(item) {
    state.inventory.add(item);
    changed();
  },
  is: (flag) => state.flags.has(flag),
  set(flag) {
    state.flags.add(flag);
    changed();
  },
  hasEvidence: (id) => state.evidence.has(id),
  addEvidence(id) {
    if (state.evidence.has(id)) return false;
    state.evidence.add(id);
    changed();
    return true;
  },
  get inventory() { return [...state.inventory]; },
  get evidence() { return [...state.evidence]; },
  onChange(fn) {
    listeners.add(fn);
    fn(state);
  },
};
