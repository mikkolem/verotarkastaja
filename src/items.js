// Klikattavat esineet: objektin nimi -> otsikko ja kuvaus tarkastelunäkymään.
// rotation = esineen asento tarkastelussa (litteät paperit käännetään kohti katsojaa).
// text voi olla funktio, jolloin kuvaus riippuu pelin tilasta. actions(api) palauttaa
// tarkastelunäkymän napit; api tarjoaa pelin toiminnot (ks. main.js: puzzleApi).
import { game } from './game.js';

// Puhelinvastaajan viestit (pulmat 3 ja 4: kassakaapin koodi ja golftasoitus)
const MESSAGES = [
  { from: 'Pirjo, kirjanpito', time: 'tänään 9.12',
    text: 'Kalevi, Pirjo täällä. Kesäkuun myyntilasku numero 117 puuttuu kirjanpidosta, eikä liikevaihto täsmää pankkitiliin. Laitoitko sen taas silppuriin? Soita!' },
  { from: 'Marjatta', time: 'tänään 10.40',
    text: 'Kalle, kulta. Muistathan, että ensi viikolla on meidän hääpäivä, kahdestoista kesäkuuta – ja että se on myös sen sinun kassakaappisi koodi. Ja juhannuksena saunotaan uudella kiukaalla!' },
  { from: 'Raimo, golfklubi', time: 'tänään 11.05',
    text: 'Kalevi, Raimo tässä! Lauantaina klo 9 ykkösteellä. Ja muistutan: tasoitus 36 ei ole tasoitus vaan toive, hahhah! Perjantain ”golfmatka” meni kai läpi?' },
];

const FLAT = [Math.PI / 2, 0, 0];
const BOOKS = {
  title: 'Tietosanakirjasarja',
  text: 'Selkämykset kiiltävät ja sivut ovat leikkaamattomat. Ostettu metreittäin, kirjattu ”ammattikirjallisuudeksi”.',
};

export const ITEMS = {
  // --- kalusteet ---
  chair: { title: 'Toimitusjohtajan tuoli', text: 'Istuin on vielä lämmin. Kalevi ei ole ollut poissa kauan.' },
  sofa: { title: 'Chesterfield-sohva', text: 'Kirjanpidossa: ”neuvottelutilan kalustus, 8 900 €”. Tyynyn välissä on golflehti.' },
  // Pulma 1: ”Varavain siellä missä taide kasvaa” -> avain ruukun alta
  plant: {
    title: 'Viherkasvi',
    text: () => (game.has('key')
      ? 'Kirjattu taideteokseksi, arvo 12 000 €. Ruukun alla oli avain – nyt siellä on vain multaa.'
      : 'Kirjattu taideteokseksi, arvo 12 000 €. Multa on kuivaa – taidetta ei kai kastella. Ruukku on painava.'),
    actions: (api) => (game.has('key') ? [] : [{
      label: 'Nosta ruukkua',
      run: () => {
        game.give('key');
        api.toast('Ruukun alta löytyi pieni messinkiavain! Se on nyt tavaroissasi.', 'item');
      },
    }]),
  },
  diploma: { title: 'Kunniakirja', text: 'Vuoden veronmaksaja 1998. Myöntäjä: Kalevi Kivi. Saaja: Kalevi Kivi.' },
  clock: { title: 'Seinäkello', text: 'Tik, tak. Kalevin lounas ei kestä ikuisesti.' },
  books1: BOOKS, books2: BOOKS, books3: BOOKS, books4: BOOKS, books5: BOOKS,

  // --- työpöytä ---
  lamp: { title: 'Pöytälamppu', text: 'Kirjanpidossa: ”valaistusinvestointi”, 1 200 €.' },
  // Pulma 4b: salasana = golftasoitus (36, puhelinvastaajasta) -> kalenterin Cayman-siirto
  laptop: {
    title: 'Kannettava tietokone',
    text: () => (game.is('laptop_open')
      ? 'Kirjauduttu sisään Kalevin tunnuksilla. Näytöllä on auki kalenteri.'
      : 'Kirjautumisruutu. Salasanan vihjeenä lukee: ”tasoitukseni”.'),
    actions: (api) => [game.is('laptop_open') ? {
      label: 'Avaa kalenteri',
      run: () => api.read('calendar'),
    } : {
      label: 'Kirjaudu sisään',
      run: () => api.passwordPrompt({
        title: 'Kirjaudu',
        hint: 'Salasanan vihje: ”tasoitukseni”',
        failHint: 'Vihje: joku puhelinvastaajassa tietää Kalevin golftasoituksen.',
        check: (v) => v.replace(/\s/g, '') === '36',
        onOpen: () => {
          game.set('laptop_open');
          api.toast('Sisällä! Kalevin kalenteri aukesi.', 'success');
          api.read('calendar');
        },
      }),
    }],
  },
  photo: { title: 'Mökkikuva', text: 'Kalevi laiturilla. Taustalla uusi sauna, jota ei löydy yhdenkään yhtiön taseesta.' },
  stapler: { title: 'Nitoja', text: 'Kirjattu käyttöomaisuudeksi. Poistoajaksi on merkitty 25 vuotta.' },
  glasses: { title: 'Lukulasit', text: 'Pientä präntättyä tekstiä varten. Näyttävät käyttämättömiltä.' },
  // Pulma 1 -> 2: laatikko A aukeaa avaimella
  drawer_a: {
    title: 'Pöytälaatikko A',
    text: () => {
      if (game.is('drawer_a_open')) return 'Laatikko on auki. Sisällä on kuittinippu ja käsin kirjoitettu lappu.';
      if (game.has('key')) return 'Etulevyssä on pieni messinkikyltti: ”A”. Lukko näyttää sopivan löytämällesi avaimelle.';
      return 'Etulevyssä on pieni messinkikyltti: ”A”. Lukossa. Avain on varmasti jossain lähellä – Kalevi ei vaikuta ihmiseltä, joka kantaa avaimia mukanaan.';
    },
    actions: (api) => (!game.is('drawer_a_open') && game.has('key') ? [{
      label: 'Käytä messinkiavainta',
      run: () => {
        api.close();
        api.openDrawer('drawer_a');
        game.set('drawer_a_open');
        api.toast('Laatikko A aukesi. Sisällä on kuitteja ja lappu.', 'success');
      },
    }] : []),
  },
  // Pulma 2: yksi edustuskuluksi kirjatuista kuiteista on yksityinen (kesämökin kiuas)
  receipts: {
    title: 'Edustuskulujen kuitit',
    text: 'Neljä kuittia, jotka Kalevi on kirjannut yrityksen edustuskuluiksi. Onko jokin niistä oikeasti yksityinen kulu?',
    rotation: FLAT,
    actions: (api) => [{ label: 'Lue paperit', run: () => api.read('receipts') }],
  },
  // Pulma 2b: laatikon B koodi = vuosi, josta Kalevi on ylpein (diplomi 1998)
  note_pirjo: {
    title: 'Pirjon lappu',
    text: 'Pirjon siistiä käsialaa: ”Kalevi, laatikon B koodi on se vuosi, josta olet niin ylpeä. Kirjoitin sen tähän, koska unohdat sen aina. – P.” Vuosilukua ei ole kirjoitettu.',
    rotation: [0, 0, 0],
  },
  drawer_b: {
    title: 'Pöytälaatikko B',
    text: () => (game.is('drawer_b_open')
      ? 'Laatikko on auki. Sisällä on puolikas lasku ja käsin kirjoitettu lappu.'
      : 'Messinkikyltti: ”B”. Nelinumeroinen numerolukko.'),
    actions: (api) => (game.is('drawer_b_open') ? [] : [{
      label: 'Kokeile koodia',
      run: () => api.codeLock({
        title: 'Laatikko B',
        digits: 4,
        code: '1998',
        hint: 'Vihje: lue laatikon A lappu. Mistä vuodesta Kalevi on ylpein? Katso seiniä.',
        onOpen: () => {
          api.close();
          api.openDrawer('drawer_b');
          game.set('drawer_b_open');
          api.toast('Klik! Laatikko B aukesi.', 'success');
        },
      }),
    }]),
  },
  drawer_b_papers: {
    title: 'Laatikon B paperit',
    text: 'Puolikas myyntilasku ja Kalevin käsin kirjoittama lappu.',
    rotation: FLAT,
    actions: (api) => [{ label: 'Lue paperit', run: () => api.read('drawer_b_papers') }],
  },
  note_avain: {
    title: 'Muistilappu',
    text: '”Varavain siellä missä taide kasvaa.” Kalevin muistisääntö, ilmeisesti. Mitä tässä huoneessa on kirjattu taiteeksi?',
    rotation: [0, 0, 0],
  },

  // --- muualla huoneessa ---
  binder: { title: 'Muistikirja', text: 'Sivulla lukee isoin kirjaimin: ”EI PAPEREITA VEROTTAJALLE”. Alla pienemmällä: ”paitsi ne viralliset”.', rotation: FLAT },
  poster: { title: 'ALV-juliste', text: 'Yleinen arvonlisäverokanta 25,5 %. Joku on piirtänyt kulmaan surullisen naaman.', rotation: [0, 0, 0] },
  answering_machine: {
    title: 'Puhelinvastaaja',
    text: () => (game.is('messages_heard')
      ? 'Kolme kuunneltua viestiä: Pirjo, vaimo ja golfkaveri Raimo.'
      : 'Punainen valo vilkkuu: 3 uutta viestiä.'),
    rotation: [0, Math.PI, 0],
    actions: (api) => [{
      label: game.is('messages_heard') ? 'Kuuntele uudelleen' : 'Kuuntele viestit',
      run: () => api.voicemail(MESSAGES, { onDone: () => game.set('messages_heard') }),
    }],
  },
  // Pulma 3: kassakaapin koodi = hääpäivä 12.6. (vaimon viesti puhelinvastaajassa)
  safe: {
    title: 'Kassakaappi',
    text: () => (game.is('safe_open')
      ? 'Kassakaappi on auki. Sisällä on musta kirjanpitokirja.'
      : 'Nelinumeroinen numerolukko. Kalevi ei ilmeisesti luota pankkeihin.'),
    rotation: [0, -Math.PI / 2, 0],
    actions: (api) => (game.is('safe_open') ? [] : [{
      label: 'Kokeile koodia',
      run: () => api.codeLock({
        title: 'Kassakaappi',
        digits: 4,
        code: '1206',
        hint: 'Vihje: laatikon B lapussa lukee ”hääpäivä”. Kuka puhelinvastaajassa puhuu hääpäivästä?',
        onOpen: () => {
          api.close();
          api.openSafe();
          game.set('safe_open');
          api.toast('Kassakaappi aukesi!', 'success');
        },
      }),
    }]),
  },
  ledger_book: {
    title: 'Musta kirjanpitokirja',
    text: 'Paksu nahkakantinen kirja. Kannessa punainen lappu, jossa lukee käsin: ”B”.',
    rotation: [0, -Math.PI / 2, 0],
    actions: (api) => [{ label: 'Lue kirja', run: () => api.read('ledger_book') }],
  },
  binder_1: {
    title: 'Mappi: Kirjanpito 2025',
    text: 'Virallinen kirjanpito. Siisti, järjestelmällinen ja epäilyttävän ohut. Päällimmäisenä on puolivuotistuloslaskelma.',
    rotation: [0, -Math.PI / 2, 0],
    actions: (api) => [{ label: 'Selaa mappia', run: () => api.read('binder_1') }],
  },
  binder_2: { title: 'Mappi: Kirjanpito 2024', text: 'Edellisen vuoden kirjanpito. Pölyinen.', rotation: [0, -Math.PI / 2, 0] },
  binder_3: { title: 'Mappi: Tilinpäätös', text: 'Liikevaihto on pyöristetty alaspäin. Reippaasti.', rotation: [0, -Math.PI / 2, 0] },
  // Pulma 3: laskun alaosa on jäänyt jumiin silppuriin
  shredder: {
    title: 'Paperisilppuri',
    text: () => (game.has('invoice_bottom')
      ? 'Säiliö on tutkittu. Silppuri oli jumittunut kesken laskun.'
      : 'Säiliö on melkein täynnä. Raosta roikkuu vielä suikaleita.'),
    actions: (api) => (game.is('drawer_b_open') && !game.has('invoice_bottom') ? [{
      label: 'Kaiva silppurin säiliötä',
      run: () => {
        game.give('invoice_bottom');
        api.toast('Silppuri oli jumittunut: laskun alaosa löytyi melkein ehjänä!', 'item');
        api.read('invoice_assembled');
      },
    }] : []),
  },
  waste_bin: { title: 'Roskakori', text: 'Pari rypistettyä kahvikupin kantta. Siivooja kävi aamulla.' },
};

// Mappien selkämyslaput (paper.js) kuuluvat samaan esineeseen kuin itse mappi.
export const ALIASES = {
  safe_door: 'safe',
  binder_label_1: 'binder_1',
  binder_label_2: 'binder_2',
  binder_label_3: 'binder_3',
};
