// Klikattavat esineet: objektin nimi -> otsikko ja kuvaus tarkastelunäkymään.
// rotation = esineen asento tarkastelussa (litteät paperit käännetään kohti katsojaa).
// text voi olla funktio, jolloin kuvaus riippuu pelin tilasta. actions(api) palauttaa
// tarkastelunäkymän napit; api tarjoaa pelin toiminnot (ks. main.js: puzzleApi).
import { game } from './game.js';

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
        api.toast('Ruukun alta löytyi pieni messinkiavain!');
      },
    }]),
  },
  diploma: { title: 'Kunniakirja', text: 'Vuoden veronmaksaja 1998. Myöntäjä: Kalevi Kivi. Saaja: Kalevi Kivi.' },
  clock: { title: 'Seinäkello', text: 'Tik, tak. Kalevin lounas ei kestä ikuisesti.' },
  books1: BOOKS, books2: BOOKS, books3: BOOKS, books4: BOOKS, books5: BOOKS,

  // --- työpöytä ---
  lamp: { title: 'Pöytälamppu', text: 'Kirjanpidossa: ”valaistusinvestointi”, 1 200 €.' },
  laptop: { title: 'Kannettava tietokone', text: 'Kirjautumisruutu. Salasanan vihjeenä lukee: ”tasoitukseni”.' },
  photo: { title: 'Mökkikuva', text: 'Kalevi laiturilla. Taustalla uusi sauna, jota ei löydy yhdenkään yhtiön taseesta.' },
  notepads: { title: 'Muistilehtiöt', text: 'Ylimpään lehtiöön on painunut edellisen sivun teksti: ”Cayman – pe klo 14”.', rotation: FLAT },
  stapler: { title: 'Nitoja', text: 'Kirjattu käyttöomaisuudeksi. Poistoajaksi on merkitty 25 vuotta.' },
  glasses: { title: 'Lukulasit', text: 'Pientä präntättyä tekstiä varten. Näyttävät käyttämättömiltä.' },
  // Pulma 1 -> 2: laatikko A aukeaa avaimella
  drawer_a: {
    title: 'Pöytälaatikko A',
    text: () => {
      if (game.is('drawer_a_open')) return 'Laatikko on auki. Sisällä on kuittinippu ja kirjanpidon ote.';
      if (game.has('key')) return 'Etulevyssä on pieni messinkikyltti: ”A”. Lukko näyttää sopivan löytämällesi avaimelle.';
      return 'Etulevyssä on pieni messinkikyltti: ”A”. Lukossa. Avain on varmasti jossain lähellä – Kalevi ei vaikuta ihmiseltä, joka kantaa avaimia mukanaan.';
    },
    actions: (api) => (!game.is('drawer_a_open') && game.has('key') ? [{
      label: 'Käytä messinkiavainta',
      run: () => {
        api.close();
        api.openDrawer('drawer_a');
        game.set('drawer_a_open');
        api.toast('Laatikko A aukesi.');
      },
    }] : []),
  },
  // Pulma 2: kuittien summa (862 €) vs. kirjanpito (1 247 €) -> erotus 385 avaa laatikon B
  receipts: {
    title: 'Kuittinippu ja kirjanpidon ote',
    text: 'Edustuskulujen kuitit ja pääkirjan ote. Kannattaisi verrata lukuja keskenään.',
    rotation: FLAT,
    actions: (api) => [{ label: 'Lue paperit', run: () => api.read('receipts') }],
  },
  drawer_b: {
    title: 'Pöytälaatikko B',
    text: () => (game.is('drawer_b_open')
      ? 'Laatikko on auki. Sisällä on puolikas lasku ja käsin kirjoitettu lappu.'
      : 'Messinkikyltti: ”B”. Kolminumeroinen numerolukko. Lukon viereen on raapustettu tussilla: ”se mikä puuttuu”.'),
    actions: (api) => (game.is('drawer_b_open') ? [] : [{
      label: 'Kokeile koodia',
      run: () => api.codeLock({
        title: 'Laatikko B',
        digits: 3,
        code: '385',
        hint: 'Vihje: laske kuitit yhteen ja vertaa kirjanpidon edustuskuluihin.',
        onOpen: () => {
          api.close();
          api.openDrawer('drawer_b');
          game.set('drawer_b_open');
          api.toast('Klik! Laatikko B aukesi.');
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
  note_silppu: { title: 'Muistilappu', text: '”Muista silputa!!!” Kolme huutomerkkiä. Kiireellinen asia.', rotation: [0, 0, 0] },
  note_avain: {
    title: 'Muistilappu',
    text: '”Varavain siellä missä taide kasvaa.” Kalevin muistisääntö, ilmeisesti. Mitä tässä huoneessa on kirjattu taiteeksi?',
    rotation: [0, 0, 0],
  },

  // --- muualla huoneessa ---
  binder: { title: 'Muistikirja', text: 'Sivulla lukee isoin kirjaimin: ”EI PAPEREITA VEROTTAJALLE”. Alla pienemmällä: ”paitsi ne viralliset”.', rotation: FLAT },
  poster: { title: 'ALV-juliste', text: 'Yleinen arvonlisäverokanta 25,5 %. Joku on piirtänyt kulmaan surullisen naaman.', rotation: [0, 0, 0] },
  answering_machine: { title: 'Puhelinvastaaja', text: 'Punainen valo vilkkuu: 3 uutta viestiä.', rotation: [0, Math.PI, 0] },
  safe: { title: 'Kassakaappi', text: 'Nelinumeroinen numerolukko. Kalevi ei ilmeisesti luota pankkeihin.', rotation: [0, -Math.PI / 2, 0] },
  binder_1: { title: 'Mappi: Kirjanpito 2025', text: 'Virallinen kirjanpito. Siisti, järjestelmällinen ja epäilyttävän ohut.', rotation: [0, -Math.PI / 2, 0] },
  binder_2: { title: 'Mappi: Kirjanpito 2024', text: 'Edellisen vuoden kirjanpito. Pölyinen.', rotation: [0, -Math.PI / 2, 0] },
  binder_3: { title: 'Mappi: Tilinpäätös', text: 'Liikevaihto on pyöristetty alaspäin. Reippaasti.', rotation: [0, -Math.PI / 2, 0] },
  shredder: { title: 'Paperisilppuri', text: 'Säiliö on melkein täynnä. Raosta roikkuu vielä suikaleita.' },
  waste_bin: { title: 'Roskakori', text: 'Pari rypistettyä kahvikupin kantta. Siivooja kävi aamulla.' },
};

// Mappien selkämyslaput (paper.js) kuuluvat samaan esineeseen kuin itse mappi.
export const ALIASES = {
  binder_label_1: 'binder_1',
  binder_label_2: 'binder_2',
  binder_label_3: 'binder_3',
};
