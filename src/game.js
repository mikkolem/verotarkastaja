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
  key: '🔑 Avain ”A”',
  invoice_bottom: '📄 Laskun alaosa',
  envelope: '✉️ Kirjekuori kehyksen takaa',
};

// Todisteet nimetään kirjanpidon ja verotuksen omilla termeillä. Järjestys on
// myös vaikeusjärjestys: kaksi ensimmäistä ovat ohjattuja, viimeinen vaikein.
export const EVIDENCE = {
  kiuas: 'Peitelty osinko: kesämökin kiuas (400 €) kirjattu yhtiön edustuskuluksi',
  cayman_invoice: 'Ohimyynti: myyntilasku 117, 10 000 € Cayman-yhtiölle, tuloa ei kirjattu',
  second_ledger: 'Kaksoiskirjanpito: todellinen liikevaihto 1,48 milj. €, virallinen 0,61 milj. €',
  cayman_transfer: 'Lähipiirisiirto: 870 000 € omalle Cayman-yhtiölle ”golfmatkana”',
  offshore_account: 'Ilmoittamaton ulkomainen tili: Cayman National Bank, 2,1 milj. € Kalevin omissa nimissä',
};
export const EVIDENCE_TOTAL = Object.keys(EVIDENCE).length;

// Mistä kukin todiste löytyi: näytetään todistelistassa ja raportissa.
export const EVIDENCE_PLACE = {
  kiuas: 'Työpöytä · laatikko A · kuitit',
  cayman_invoice: 'Työpöytä · laatikko B + Ikkuna · silppuri',
  second_ledger: 'Kirjahylly · kassakaappi · musta kirja',
  cayman_transfer: 'Työpöytä · tietokone · kalenteri',
  offshore_account: 'Sohva · kunniakirjan takaa',
};

// Raportissa puuttuvan todisteen kohdalla näytetään vain kategoria: mitä etsitään, ei mistä.
export const EVIDENCE_CATEGORY = {
  kiuas: 'yksityinen kulu yhtiön kuluissa',
  cayman_invoice: 'myynti, jota ei ole kirjattu',
  second_ledger: 'toinen kirjanpito',
  cayman_transfer: 'varojen siirto ulkomaille',
  offshore_account: 'ilmoittamaton ulkomainen varallisuus',
};

// Tarkastusraportissa jokaiselle todisteelle valitaan peruste kolmesta.
// Ensimmäinen on oikea; vaihtoehdot sekoitetaan näytettäessä.
// Jokaisella vaihtoehdolla on tarkastajan oma muistiinpano (note), joka selittää
// termin yhdellä rivillä. Se näkyy vain raportissa, ei huoneessa.
export const REASONS = {
  kiuas: [
    { text: 'Osakkaan yksityinen kulu yhtiön kuluna → peitelty osinko', note: 'Omistaja ottaa yhtiöstä rahaa ”kuluina” osingon sijaan. Verotetaan kuin osinko, plus korotus.' },
    { text: 'Edustuskulusta vain 50 % on vähennyskelpoista', note: 'Totta sinänsä, mutta kiuas ei ole edustusta ollenkaan.' },
    { text: 'Kiukaan poistoaika on liian lyhyt', note: 'Poistoaika kertoo, monessako vuodessa hankinta vähennetään. Ei liity tähän.' },
  ],
  cayman_invoice: [
    { text: 'Myyntitulo jätetty kirjaamatta → ohimyynti, kirjausketju katkeaa', note: 'Ohimyynti = myynti, joka ei näy kirjanpidossa. Kirjausketju = jokaisesta tapahtumasta pitää päästä tositteeseen ja takaisin.' },
    { text: 'Laskussa olisi pitänyt olla ALV 25,5 %', note: 'Ei: palvelumyynti EU:n ulkopuolelle on arvonlisäverotonta. Lasku on siltä osin oikein.' },
    { text: 'Laskun numero on väärän mallinen', note: 'Numero 117 on ihan oikea. Se vain puuttuu mapista.' },
  ],
  second_ledger: [
    { text: 'Kaksi kirjanpitoa: virallinen ei anna oikeaa kuvaa → kirjanpitorikos', note: 'Kirjanpidon pitää antaa oikea ja riittävä kuva. Toinen, oikea kirjanpito todistaa, ettei virallinen anna.' },
    { text: 'Kirjanpito pitää tehdä sähköisesti, ei nahkakantiseen kirjaan', note: 'Muotoa ei ole säädetty. Paperikin kelpaa, kunhan sisältö on oikein.' },
    { text: 'Liikevaihto on pyöristetty väärään suuntaan', note: 'Pyöristys ei ole ongelma. Puolet liikevaihdosta puuttuu.' },
  ],
  cayman_transfer: [
    { text: 'Varojen siirto omaan yhtiöön ilman liiketoimintaa → veronkierto', note: 'Lähipiiriliiketoimi: kauppa oman yhtiön kanssa. Sallittua vain markkinaehtoisena ja oikeasta palvelusta.' },
    { text: 'Golfmatka on edustuskulu, josta puuttuu kuitti', note: 'Kuitti olisi pienin ongelma 870 000 euron ”golfmatkassa”.' },
    { text: 'Ulkomaanmaksusta puuttuu valuuttakurssi', note: 'Kurssi on tekninen yksityiskohta. Siirto itsessään on ongelma.' },
  ],
  offshore_account: [
    { text: 'Ulkomainen tili ja tulot ilmoittamatta → veropetos', note: 'Suomessa asuva ilmoittaa kaikki tulonsa ja tilinsä, myös ulkomaiset. Ilmoittamatta jättäminen on veropetos.' },
    { text: 'Tilin saldo pitäisi kirjata yhtiön taseeseen', note: 'Tili on Kalevin omissa nimissä, ei yhtiön. Se kuuluu hänen henkilökohtaiseen veroilmoitukseensa.' },
    { text: 'Tiliote on englanninkielinen', note: 'Kieli ei ole rikos. Sisältö on.' },
  ],
};

// Pelissä esiintyvät termit tuloksen loppuun, yhden rivin selityksellä
export const TERMS = [
  ['debet ja kredit', 'jokainen kirjaus tehdään kahdelle tilille: mistä raha tulee ja mihin se menee'],
  ['tosite ja kirjausketju', 'jokaisesta kirjauksesta pitää löytyä tosite, ja numerointi ei saa katketa'],
  ['täsmäytys', 'kirjanpidon ja pankin tiliotteen vertaaminen: jokaiselle panolle oma lasku'],
  ['peitelty osinko', 'omistajan yksityinen etu yhtiön kuluna'],
  ['ohimyynti', 'myynti, jota ei kirjata kirjanpitoon'],
  ['lähipiiriliiketoimi', 'kauppa oman tai läheisen yhtiön kanssa'],
  ['ALV 0 % EU:n ulkopuolelle', 'palvelumyynti EU:n ulkopuolelle on arvonlisäverotonta, tulo pitää silti kirjata'],
  ['ulkomainen tili', 'myös ulkomailla oleva tili ja sen tulot ilmoitetaan verottajalle'],
];

const state = {
  inventory: new Set(),
  evidence: new Set(),
  flags: new Set(),
  // muistiinpanot: johtolangat, jotka pelaaja on nähnyt (id -> { source, text }), lisäysjärjestyksessä
  notes: new Map(),
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
  // Kirjaa johtolangan muistiinpanoihin; palauttaa true, jos se oli uusi.
  addNote(id, source, text) {
    if (state.notes.has(id)) return false;
    state.notes.set(id, { source, text });
    changed();
    return true;
  },
  get notes() { return [...state.notes.values()]; },
  get inventory() { return [...state.inventory]; },
  get evidence() { return [...state.evidence]; },
  onChange(fn) {
    listeners.add(fn);
    fn(state);
  },
};
