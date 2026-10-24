// Pelin tila: mukana kulkevat tavarat, löydetyt todisteet ja tapahtumaliput
// (esim. "laatikko A avattu"). Käyttöliittymä kuuntelee muutoksia onChange-kutsulla.

// Pelikohtaiset salaisuudet arvotaan joka latauksella, jotta koodeja ei voi
// muistaa ulkoa: diplomin vuosi (laatikko B), hääpäivä (kassakaappi) ja
// golftasoitus (tietokone). Kaikki paperit ja viestit piirretään näistä.
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const MONTHS = ['tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta', 'toukokuuta', 'kesäkuuta',
  'heinäkuuta', 'elokuuta', 'syyskuuta', 'lokakuuta', 'marraskuuta', 'joulukuuta'];
const year = rnd(1994, 2006);
const day = rnd(1, 28);
const month = rnd(1, 12);
const handicap = rnd(21, 48);
export const SECRETS = {
  year: String(year),
  weddingDay: day,
  weddingMonth: month,
  weddingText: `${day}. ${MONTHS[month - 1]}`,          // esim. "12. kesäkuuta"
  weddingShort: `${day}.${month}.`,                     // esim. "12.6."
  weddingCode: `${String(day).padStart(2, '0')}${String(month).padStart(2, '0')}`,
  weddingYear: String(year - rnd(3, 9)),
  handicap: String(handicap),
};

export const INVENTORY = {
  key: '🔑 Messinkiavain',
  invoice_bottom: '📄 Laskun alaosa',
};

// Todisteet nimetään kirjanpidon ja verotuksen omilla termeillä.
export const EVIDENCE = {
  kiuas: 'Peitelty osinko: kesämökin kiuas (400 €) kirjattu yhtiön edustuskuluksi',
  cayman_invoice: 'Ohimyynti: myyntilasku 117, 10 000 € Cayman-yhtiölle, tuloa ei kirjattu',
  second_ledger: 'Kaksoiskirjanpito: todellinen liikevaihto 1,48 milj. €, virallinen 0,61 milj. €',
  cayman_transfer: 'Lähipiirisiirto: 870 000 € omalle Cayman-yhtiölle ”golfmatkana”',
};
export const EVIDENCE_TOTAL = Object.keys(EVIDENCE).length;

// Tarkastusraportissa jokaiselle todisteelle valitaan peruste kolmesta.
// Ensimmäinen on oikea; vaihtoehdot sekoitetaan näytettäessä.
export const REASONS = {
  kiuas: [
    'Osakkaan yksityinen kulu yhtiön kuluna → peitelty osinko',
    'Edustuskulusta vain 50 % on vähennyskelpoista',
    'Kiukaan poistoaika on liian lyhyt',
  ],
  cayman_invoice: [
    'Myyntitulo jätetty kirjaamatta → ohimyynti, kirjausketju katkeaa',
    'Laskussa olisi pitänyt olla ALV 25,5 %',
    'Laskun numero on väärän mallinen',
  ],
  second_ledger: [
    'Kaksi kirjanpitoa: virallinen ei anna oikeaa kuvaa → kirjanpitorikos',
    'Kirjanpito pitää tehdä sähköisesti, ei nahkakantiseen kirjaan',
    'Liikevaihto on pyöristetty väärään suuntaan',
  ],
  cayman_transfer: [
    'Varojen siirto omaan yhtiöön ilman liiketoimintaa → veronkierto',
    'Golfmatka on edustuskulu, josta puuttuu kuitti',
    'Ulkomaanmaksusta puuttuu valuuttakurssi',
  ],
};

// Pelissä esiintyvät termit tuloksen loppuun
export const TERMS = ['debet ja kredit', 'tosite ja kirjausketju', 'täsmäytys tiliotteeseen', 'peitelty osinko', 'ohimyynti', 'lähipiiriliiketoimi', 'ALV 0 % EU:n ulkopuolelle'];

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
