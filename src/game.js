// Pelin tila: mukana kulkevat tavarat, löydetyt todisteet ja tapahtumaliput
// (esim. "laatikko A avattu"). Käyttöliittymä kuuntelee muutoksia onChange-kutsulla.

export const INVENTORY = {
  key: 'Messinkiavain',
};

export const EVIDENCE = {
  kiuas: 'Kesämökin kiuas kirjattu edustuskuluksi (400 €, juhannusaatto)',
};
export const EVIDENCE_TOTAL = 3;

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
