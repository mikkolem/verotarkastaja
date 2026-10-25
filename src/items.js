// Klikattavat esineet: objektin nimi -> otsikko ja kuvaus tarkastelunäkymään.
// rotation = esineen asento tarkastelussa (litteät paperit käännetään kohti katsojaa).
// text voi olla funktio, jolloin kuvaus riippuu pelin tilasta. actions(api) palauttaa
// tarkastelunäkymän napit; api tarjoaa pelin toiminnot (ks. main.js: puzzleApi).
import { SECRETS, game } from './game.js';

// Puhelinvastaajan viestit (pulmat 3 ja 4: kassakaapin koodi ja golftasoitus).
// Pirjo jättää lisäksi uuden viestin aina, kun pelaaja löytää todisteen.
const MESSAGES = [
  { from: 'Pirjo P., kirjanpito', time: 'tänään 9.12',
    text: 'Kalevi, Pirjo täällä. Kesäkuun myyntilasku numero 117 puuttuu kirjanpidosta, eikä liikevaihto täsmää pankkitiliin. Laitoitko sen taas silppuriin? Soita!' },
  { from: 'Marjatta', time: 'tänään 10.40',
    text: () => `Kalle, kulta. Muistathan, että meidän hääpäivä on ${SECRETS.weddingText}, niin kuin joka vuosi. Älä unohda tällä kertaa! Ja juhannuksena saunotaan uudella kiukaalla.` },
  { from: 'Raimo, golfklubi', time: 'tänään 11.05',
    text: 'Kalevi, Raimo tässä! Lauantaina klo 9 ykkösteellä. Ja se sinun tasoituksesi ei ole tasoitus vaan toive, hahhah! Perjantain ”golfmatka” meni kai läpi?' },
];

// Pirjon jatkoviestit todisteiden mukaan (järjestyksessä, jossa ne löytyvät)
const PIRJO_FOLLOWUPS = {
  kiuas: 'Kalevi, Pirjo. Rauta-Antin kuitti on edustuskuluissa. Se on kiuas. Mökille. Minä en kirjaa sitä, kirjaa itse.',
  cayman_invoice: 'Lasku 117 näkyy tiliotteella mutta ei mapissa. Jos se on silppurissa, se on sinun käsialaasi, ei minun. Minulla on kopio.',
  second_ledger: 'Se musta kirja kassakaapissa ei ole kirjanpitoa, Kalevi. Se on tunnustus.',
  cayman_transfer: 'Perjantain siirto. Minä irtisanoudun. Varavain on kukkaruukun alla, niin kuin aina.',
  offshore_account: 'Se kuori oli siellä koko ajan. Minä ripustin sen kunniakirjan. Suoraan.',
};
let heard = 0;   // montako viestiä pelaaja on kuunnellut

// Kaikki tällä hetkellä vastaajassa olevat viestit.
export function messages() {
  const extra = game.evidence
    .filter((id) => PIRJO_FOLLOWUPS[id])
    .map((id, i) => ({ from: 'Pirjo P., kirjanpito', time: `tänään 12.${String(9 + i * 2).padStart(2, '0')}`, text: PIRJO_FOLLOWUPS[id] }));
  return [...MESSAGES, ...extra];
}
export const unheardMessages = () => Math.max(0, messages().length - heard);

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
        api.toast('Ruukun alta löytyi messinkiavain, jossa lukee ”A”. Se on nyt tavaroissasi.', 'item');
      },
    }]),
  },
  // Todiste 5 (vaikein): kehyksen takana on teipattu kirjekuori. Vihje B-kirjassa: ”ylpeyteni takana”.
  diploma: {
    title: 'Kunniakirja',
    text: () => `Vuoden veronmaksaja ${SECRETS.year}. Myöntäjä: Kalevi K. Saaja: Kalevi K.${
      game.has('envelope') ? ' Kehyksen takana oli teipattu kirjekuori.' : ' Kehys roikkuu hieman vinossa, kuin sitä olisi nosteltu usein.'}`,
    actions: (api) => (game.has('envelope') ? [{ label: 'Lue tiliote', run: () => api.read('offshore_statement') }] : [{
      label: 'Nosta kehystä',
      run: () => {
        game.give('envelope');
        api.toast('Kehyksen takana oli teipattu kirjekuori: pankin tiliote.', 'item');
        api.read('offshore_statement');
      },
    }]),
  },
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
        failHint: 'Vihje: Kalevin golftasoitus on kaiverrettu johonkin tässä huoneessa.',
        check: (v) => v.replace(/\s/g, '') === SECRETS.handicap,
        onOpen: () => {
          game.set('laptop_open');
          api.toast('Sisällä! Kalevin kalenteri aukesi.', 'success');
          api.read('calendar');
        },
      }),
    }],
  },
  photo: {
    title: 'Mökkikuva',
    text: () => `Kalevi laiturilla. Taustalla uusi sauna, jota ei löydy yhdenkään yhtiön taseesta. Kulmaan on kirjoitettu: ”Hääpäivä ${SECRETS.weddingShort}${SECRETS.weddingYear}, mökillä”.`,
  },
  stapler: { title: 'Nitoja', text: 'Kirjattu käyttöomaisuudeksi. Poistoajaksi on merkitty 25 vuotta.' },
  glasses: { title: 'Lukulasit', text: 'Pientä präntättyä tekstiä varten. Näyttävät käyttämättömiltä.' },
  // Pulma 1 -> 2: laatikko A aukeaa avaimella
  drawer_a: {
    title: 'Pöytälaatikko A',
    text: () => {
      if (game.is('drawer_a_open')) return 'Laatikko on auki. Sisällä on kuittinippu ja käsin kirjoitettu lappu.';
      if (game.has('key')) return 'Etulevyssä on pieni messinkikyltti: ”A”. Avaimessasi lukee sama kirjain.';
      return 'Etulevyssä on pieni messinkikyltti: ”A”. Lukossa. Tietokoneen kannessa oleva lappu kertoo, missä varavain on.';
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
    title: 'Lappu laatikossa A',
    text: 'Siistiä käsialaa, ei Kalevin: ”Sinulle, joka osaat etsiä: laatikon B koodi on vuosi kunniakirjassa sohvan yläpuolella.” Ei allekirjoitusta.',
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
        code: SECRETS.year,
        hint: 'Vihje: Pirjon lappu laatikossa A kertoo, mistä vuosi löytyy. Käänny sohvalle.',
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
    text: 'Puolikas myyntilasku ja Kalevin käsin kirjoittama lappu silppurista ja kassakaapista.',
    rotation: FLAT,
    actions: (api) => [{ label: 'Lue paperit', run: () => api.read('drawer_b_papers') }],
  },
  note_avain: {
    title: 'Muistilappu',
    text: '”Varavain A kukkaruukun alla. ÄLÄ KASTELE (taidetta).” Kalevin muistisääntö. Viherkasvi on ikkunan vieressä.',
    rotation: [0, 0, 0],
  },

  // --- muualla huoneessa ---
  binder: { title: 'Muistikirja', text: 'Sivulla lukee isoin kirjaimin: ”EI PAPEREITA VEROTTAJALLE”. Alla pienemmällä: ”paitsi ne viralliset”.', rotation: FLAT },
  poster: { title: 'ALV-juliste', text: 'Yleinen arvonlisäverokanta 25,5 %. Joku on piirtänyt kulmaan surullisen naaman.', rotation: [0, 0, 0] },
  answering_machine: {
    title: 'Puhelinvastaaja',
    text: () => {
      const n = unheardMessages();
      if (n > 0) return `Punainen valo vilkkuu: ${n} ${n === 1 ? 'uusi viesti' : 'uutta viestiä'}.`;
      return `${messages().length} kuunneltua viestiä. Pirjo, vaimo ja golfkaveri Raimo${messages().length > 3 ? ' – ja Pirjo uudestaan' : ''}.`;
    },
    rotation: [0, Math.PI, 0],
    actions: (api) => [{
      label: unheardMessages() > 0 ? 'Kuuntele viestit' : 'Kuuntele uudelleen',
      run: () => {
        // uudet viestit ensin; vanhat voi kuunnella uudelleen alusta
        const all = messages();
        const list = unheardMessages() > 0 ? all.slice(heard) : all;
        api.voicemail(list, { onDone: () => { heard = all.length; game.set('messages_heard'); game.set(`heard_${heard}`); } });
      },
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
        code: SECRETS.weddingCode,
        labels: ['DEBET', 'KREDIT'],
        hint: 'Vihje: laatikon B lapussa lukee ”hääpäivä” (päivä ja kuukausi). Vaimo puhuu siitä puhelinvastaajassa, ja mökkikuvassakin lukee jotain.',
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
    text: 'Virallinen kirjanpito. Siisti, järjestelmällinen ja epäilyttävän ohut. Tuloslaskelma, tositeluettelo ja pankin tiliote.',
    rotation: [0, -Math.PI / 2, 0],
    actions: (api) => [{ label: 'Selaa mappia', run: () => api.read('binder_1') }],
  },
  binder_2: { title: 'Mappi: Kirjanpito 2024', text: 'Edellisen vuoden kirjanpito. Pölyinen.', rotation: [0, -Math.PI / 2, 0] },
  binder_3: {
    title: 'Mappi: Tilinpäätös',
    text: 'Edellisen vuoden tilinpäätös. Liikevaihto on pyöristetty alaspäin. Reippaasti. Taseessa on yksi taide-esine.',
    rotation: [0, -Math.PI / 2, 0],
    actions: (api) => [{ label: 'Selaa mappia', run: () => api.read('binder_3') }],
  },
  // Pulma 3: laskun alaosa on jäänyt jumiin silppuriin
  shredder: {
    title: 'Paperisilppuri',
    text: () => (game.has('invoice_bottom')
      ? 'Säiliö on tutkittu. Silppuri oli jumittunut kesken laskun.'
      : 'Säiliö on melkein täynnä. Silppuri on jumittunut kesken arkin: suikaleet ovat leveitä ja melkein ehjiä.'),
    actions: (api) => (game.is('drawer_b_open') && !game.has('invoice_bottom') ? [{
      label: 'Kaiva silppurin säiliötä',
      run: () => api.shred(() => {
        game.give('invoice_bottom');
        api.toast('Laskun alaosa koossa! Se on nyt tavaroissasi.', 'item');
        api.read('invoice_assembled');
      }),
    }] : []),
  },
  waste_bin: { title: 'Roskakori', text: 'Pari rypistettyä kahvikupin kantta. Siivooja kävi aamulla.' },

  // --- sisustus (decor.js) ---
  mug: { title: 'Kahvikuppi', text: '”Maailman paras johtaja.” Kirjattu edustuskuluksi. Kahvi on vielä lämmintä.' },
  pens: { title: 'Kynäpurkki', text: 'Neljä kynää, joista yksikään ei toimi. Allekirjoitukset tehdään ilmeisesti muualla.' },
  papers: { title: 'Paperipino', text: 'Päällimmäisenä pankin tiliote. Joku on yliviivannut siitä kesäkuun panot. Tarkempi ote on Kirjanpito 2025 -mapissa.' },
  decanter: { title: 'Viskikarahvi', text: 'Single malt, 18 vuotta. Kirjanpidossa: ”neuvottelutarjoilut”. Lasissa on vielä tilkka – lounaalle lähdettiin kiireellä.' },
  trophy: {
    title: 'Golfpokaali',
    text: () => `Kesäkisat, Kalevi K. Laattaan on kaiverrettu ”Tasoitus ${SECRETS.handicap}”. Kalevi on ylpeä luvusta, jota kukaan muu ei pidä saavutuksena.`,
    rotation: [0, -Math.PI / 2, 0],
  },
  pillow: { title: 'Sohvatyyny', text: 'Kukkakuvioinen tyyny. Kirjanpidossa: ”neuvottelutilan tekstiilit”. Tyynyn alla on golfkentän tuloskortti.' },
};

// Mappien selkämyslaput (paper.js) kuuluvat samaan esineeseen kuin itse mappi.
export const ALIASES = {
  safe_door: 'safe',
  binder_label_1: 'binder_1',
  binder_label_2: 'binder_2',
  binder_label_3: 'binder_3',
};
