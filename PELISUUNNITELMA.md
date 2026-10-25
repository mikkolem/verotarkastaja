# Pelisuunnitelma: Tarkastuskäynti – kirjanpito, joka ei täsmää

> Realistinen yhden huoneen point-and-click-pakohuonepeli selaimessa.
> Pelaaja on viranomainen, joka tekee epävirallisen käynnin rakennusliikkeen toimitusjohtajan
> työhuoneeseen ja etsii todisteet kirjanpidosta, joka ei täsmää.

Pelaa: https://mikkolem.github.io/verotarkastaja/

---

## 1. Tavoite ja linjaukset

- **Miksi:** tekniikkademo siitä, että näyttävän 3D-selainpelin voi tehdä Claude-avusteisesti.
- **Painopiste:** realistinen ja näyttävä ulkoasu ilman raskasta kuormaa. Peli on lyhyt.
- **Kesto:** noin 15–25 minuuttia, aikaraja 30 minuuttia.
- **Tyyli:** huumoria, ei vakava trilleri.
- **Vaikeus:** kaksi ensimmäistä todistetta ohjattuja, viimeinen vaikein. Kuka tahansa pystyy
  ratkaisemaan pulmat; kirjanpidon osaamisesta on apua raportin perusteluissa.
- **Kieli:** suomi. **Ei ääniä.**
- **Nimet:** henkilöt esiintyvät vain etunimellä ja alkukirjaimella (Kalevi K., Pirjo P.).
  Virastoa ei nimetä. Kivi & Kumppanit Oy ja Pohjolan Säästöpankki ovat keksittyjä.
  Oikeiden virastojen tai yritysten nimiä ja logoja ei käytetä.

## 2. Tarina

Rakennusliike **Kivi & Kumppanit Oy** ilmoittaa liikevaihdokseen puolet siitä, mitä sen
pankkitilille tulee. Kirjanpidosta puuttuu tosite 117, eikä se ole ainoa.

**Sinä** olet viranomainen. Virallinen tarkastus alkaa ensi kuussa, ja siihen mennessä paperit
ovat silppurissa. Pöydällesi tulee kirje ilman lähettäjää: toimitusjohtaja pitää toista, oikeaa
kirjanpitoa työhuoneessaan, lähtee lounaalle tasan kello 12 ja palaa puolen tunnin päästä.
Tämä on salapoliisityötä, ei virallinen tarkastus. Oikea tarkastus ei tonki laatikoita johtajan
ollessa lounaalla; peli tunnustaa sen huumorilla. Sisältö (termit, kirjaukset, ALV) on silti
asiallisesti oikein.

**Kalevi K.**, toimitusjohtaja, ”Vuoden veronmaksaja” oman ilmoituksensa mukaan. Häntä ei nähdä
pelin aikana, mutta huoneen tavarat kertovat hänestä kaiken. Hän astuu ovesta loppukohtauksessa.
Työpöydän laatikot A ja B ovat hänen vitsinsä, ja kassakaapin musta kirja on hänen
”Kirjanpito B”:nsä.

**Pirjo P.**, kirjanpitäjä, 3 vuotta talossa. Whistleblower: hän yritti ensin sanoa Kaleville,
nyt hän jättää jälkiä vieraalle (nimetön lappu laatikossa A). Peli ei kerro suoraan, että kirje
on hänen. Hän jättää Kaleville viestejä puhelinvastaajaan ja uuden viestin jokaisesta löydetystä
todisteesta.

Sivuhenkilöt puhelinvastaajassa: vaimo Marjatta ja golfkaveri Raimo.

## 3. Pelin kulku

1. **Prologi** (src/prologue.js), alle puoli minuuttia. Kollaasikuva henkilöistä
   (public/comic/collage.jpg) koko ruudun taustana ja sen päällä kolme diaa: tarina kolmessa
   virkkeessä, nimetön vihjekirje ja henkilöt pieninä kortteina. Klikkaus tai nuolet eteen ja
   taakse, Esc ohittaa. Lopuksi ovi aukeaa ja kamera ajaa käytävästä huoneeseen.
2. **Tarkastusmääräys** kahdessa vaiheessa: tehtävä lyhyesti (viisi todistetta, 30 minuuttia) ja
   näin pelaat. Ohjeet-nappi avaa sen uudelleen.
3. **Huone.** Peli alkaa Ikkuna-näkymästä. Pelaaja etsii viisi todistetta, merkitsee ne papereista
   ja kokoaa tarkastusraportin. Kello käy.
4. **Raportti.** Jokaiselle löydetylle todisteelle valitaan peruste. Keskeneräinen lähetys vaatii
   varmistuksen.
5. **Loppukohtaus.** Ovi aukeaa ja Kalevi palaa. Tulosnäkymässä arvosana, tilastot, todisteet ja
   termit selityksineen.

## 4. Huone ja kuvakulmat

Toimitusjohtajan työhuone iltapäivällä. Aurinko siivilöityy sälekaihtimien läpi valonsäteinä,
pölyhiukkaset leijuvat valossa ja aurinko laskee pelin kuluessa. Puupaneelit, nahkasohva ja
viskikarahvi kertovat, että rahaa on.

Viisi kiinteää kuvakulmaa, järjestys myötäpäivään (src/views.js). Peli alkaa Ikkunasta.

| Kuvakulma | Mitä siellä on |
|---|---|
| **Työpöytä** | kannettava tietokone (kalenteri), muistilappu kannessa, pöytälaatikot A ja B, kahvikuppi, paperipino (tiliote), lukulasit, nitoja, mökkikuva kehyksessä, pöytälamppu |
| **Ikkuna** | viherkasvi (”taideteos”, avain ruukun alla), paperisilppuri, seinäkello; näkyy myös työpöytä |
| **Sohva** | Chesterfield-sohva, tyyny, kunniakirja ”Vuoden veronmaksaja” seinällä |
| **Ovi** | sivupöytä: puhelinvastaaja, muistikirja, viskikarahvi ja lasi; tiedotejuliste (ALV 25,5 %); ovi käytävään |
| **Kirjahylly** | kirjasarjat, mapit (Kirjanpito 2025, Kirjanpito 2024, Tilinpäätös), golfpokaali, kassakaappi alahyllyllä |

Esineitä voi klikata, jolloin ne lentävät lähikuvaan ja niitä voi pyöritellä. Lähikuvan napeilla
nostetaan, luetaan ja avataan. Avatut laatikot tarjoavat sisältönsä mistä tahansa kuvakulmasta.

## 5. Pulmat ja ratkaisut

Ei laskutehtäviä. Koodit (kunniakirjan vuosi VVVV, hääpäivä PPKK, golftasoitus NN) arvotaan joka
pelikerralla (`SECRETS`, src/game.js), ja jokaiseen koodiin on vähintään kaksi lähdettä.

| # | Todiste (termi) | Johtolanka | Ratkaisu | Vaikeus |
|---|---|---|---|---|
| 1 | **Kiuas edustuskuluissa** (peitelty osinko) | Tietokoneen lappu: ”Varavain A kukkaruukun alla!” | Ikkuna: kasvi → *Nosta ruukkua* → avain ”A”. Työpöytä: laatikko A → *Käytä messinkiavainta*. Kuiteista kolmessa asiakkaan nimi, Rauta-Antin kiukaassa ”Toimitus: Kivi, Mökkitie 3” → merkitse | Helppo, ohjattu |
| 2 | **Lasku 117 Cayman-yhtiölle** (ohimyynti) | Nimetön lappu laatikossa A: ”laatikon B koodi on vuosi kunniakirjassa sohvan yläpuolella” | Sohva: kunniakirja ”VVVV”. Laatikko B → koodi VVVV. Lappu: ”Silppuri ikkunan alla”. Ikkuna: silppuri → *Kaiva silppurin säiliötä* (vasta kun B on auki) → viisi suikaletta järjestykseen → koottu lasku → merkitse | Helppo–keski |
| 3 | **Musta kirjanpitokirja** (kaksoiskirjanpito) | Laatikon B lappu: ”Kassakaappi: HÄÄPÄIVÄ” | Ovi: puhelinvastaajassa Marjatta kertoo hääpäivän; sama päivä mökkikuvan reunassa. Kirjahylly: kassakaappi → PPKK (rullat DEBET / KREDIT) → musta kirja → merkitse | Keskitaso |
| 4 | **Siirto 870 000 €** (lähipiiriliiketoimi) | Salasanavihje ”tasoitukseni”, Raimon vitsi tasoituksesta, mustassa kirjassa ”ajankohdat sovittu Raimon kanssa” | Kirjahylly: golfpokaalin laatta ”Tasoitus NN”. Työpöytä: tietokone → salasana NN → kalenteri ”SIIRTO CAYMANILLE 870 000 €” → merkitse | Vaikea |
| 5 | **Cayman-tiliote, 2,1 milj. € Kalevin nimissä** (ilmoittamaton ulkomainen tili) | Mustan kirjan viimeinen rivi: ”Tiliotteet: ylpeyteni takana.” Kunniakirja roikkuu vinossa | Sohva: kunniakirja → *Nosta kehystä* → teipattu kirjekuori → tiliote → merkitse | Vaikein |

**Tukimateriaali, ei pakollinen:** Kirjanpito 2025 -mapissa tuloslaskelma, tositeluettelo
(ML 117 puuttuu välistä) ja pankin tiliote (pano Kivi Consulting Ltd:ltä ilman tositetta).
Tilinpäätös-mapissa tase (taide-esineet 12 000 €, 1 kpl viherkasvi; nitojan poistoaika 25 v).

**Järjestys:** vain silppuri on lukittu edellisen vaiheen taakse. Muut voi löytää missä
järjestyksessä tahansa, jos tietää vastauksen. *Nosta kehystä* on tarjolla heti alussa, joten
viides todiste voi löytyä vahingossa ensimmäisenä (avoin kysymys, luku 11).

**Väärät merkinnät:** paperin merkitseminen väärin antaa vain palautteen, ei sakkoa.

## 6. Vihjeet, aika ja ilmoitukset

- **Aikaraja** 30 minuuttia. Tarinan kello alkaa 12.03. Varoitukset 10, 5 ja 2 minuuttia ja
  30 sekuntia ennen loppua. Lopussa ovi aukeaa ja Kalevi palaa.
- **Vihje** (src/main.js, `HINTS`) maksaa viisi minuuttia. Napissa lukee aina ”Pyydä vihje” ja
  hinta (”−5 min” tai ”ilmainen”). Saman vaiheen vihjeen saa uudelleen ilmaiseksi, ja kun kaikki
  todisteet on löydetty, vihje on ilmainen. Jokainen vihje nimeää kohteen (lukko tai esine),
  kuvakulman ja mitä tehdään; Pirjoa ei mainita. Hinta näkyy kellon alla hetken ”−5:00”.
- **Lukkojen omat vihjeet** tulevat kolmen väärän yrityksen jälkeen (laatikko B, kassakaappi,
  tietokone).
- **Ilmoitukset kahdessa kanavassa:** tärkeät (vihje, todiste, löydetty tavara, avautui)
  yläreunan keskellä; vihje korostetaan sinisellä kehyksellä ja otsikolla ”Vihje”. Sivutiedotteet
  (ajan varoitukset, jumissa-muistutus 90 s välein, vastaajan valo) pieninä vasemmassa
  yläkulmassa, jotta ne eivät peitä kelloa eivätkä vihjettä.
- **Tauko** (nappi tai P) pysäyttää kellon ja peittää ruudun; mitään muuta ei voi tehdä ennen
  kuin pelaaja jatkaa.

- **Todisteet ja muistiinpanot** (yläkulman paneeli kahdella välilehdellä, src/ui.js):
  todistelista näyttää jokaisen löydetyn todisteen alla, mistä se löytyi (`EVIDENCE_PLACE`,
  src/game.js). Muistiinpanoihin kirjautuu automaattisesti jokainen johtolanka, kun pelaaja näkee
  sen: laput, kunniakirjan vuosi, mökkikuvan päiväys, pokaalin tasoitus, salasanavihje,
  puhelinvastaajan viestit, mustan kirjan rivit ja mappien huomiot (`NOTES`, src/items.js).
  Koodit kirjautuvat lukuina, koska peli on linjattu helpoksi. Uusi muistiinpano saa napin
  välähtämään; erillistä ilmoitusta ei tule.

## 7. Raportti ja arvosana

- Raportti on tarkistuslista viidestä todisteesta. Puuttuvan kohdalla näkyy vain kategoria
  (”myynti, jota ei ole kirjattu”), ei paikka.
- Jokaiselle löydetylle todisteelle valitaan peruste kolmesta vaihtoehdosta: oikea termi,
  uskottava väärä ja hölmö. Jokaisen alla on tarkastajan yhden rivin muistiinpano, joka selittää
  termin. **Termit selitetään vain raportissa ja tuloksessa, ei huoneessa.**
- Keskeneräisenä ”Jatka tutkimista” on päätoiminto. Lähetys vaatii varmistuksen, joka kertoo
  puuttuvat todisteet, puuttuvat perusteet ja jäljellä olevan ajan.
- **Arvosana** (src/finale.js, `grade`): Erinomainen = kaikki viisi, kaikki perusteet oikein ja
  enintään yksi vihje. Kiitettävä = kaikki viisi ja korkeintaan yksi peruste väärin. Sitten Hyvä,
  Tyydyttävä, Välttävä, Heikko ja Hylätty löydettyjen todisteiden mukaan.
- **Tulosnäkymä:** Kalevi ja repliikki (riippuu tuloksesta), arvosana, tilastot (todisteet,
  oikeat perusteet, aika, vihjeet), todisteet merkinnöin (✓ / ½ / –) ja termilista selityksineen.

Pelissä esiintyvät termit: debet ja kredit, tosite ja kirjausketju, täsmäytys, peitelty osinko,
ohimyynti, lähipiiriliiketoimi, ALV 0 % EU:n ulkopuolelle, ulkomainen tili.

## 8. Huumori ja yksityiskohdat

Esineiden kuvaukset src/items.js, paperit src/paper.js.

- Kunniakirja ”Vuoden veronmaksaja [vuosi]”. Myöntäjä: Kalevi K., saaja: Kalevi K.
- Kahvikuppi ”Maailman paras johtaja”, kirjattu edustuskuluksi. Viherkasvi taideteoksena
  12 000 € (oikea hinta 89 €). Nitojan poistoaika 25 vuotta. Sohva ”neuvottelutilan kalustus
  8 900 €”. Viski ”neuvottelutarjoilut”.
- Tietosanakirjasarja metreittäin, sivut leikkaamatta. Muistikirja ”EI PAPEREITA VEROTTAJALLE –
  paitsi ne viralliset”.
- Kalenterissa ”Hallituksen kokous (= minä)” ja ”Verotarkastus?? EI KOSKAAN”.
- Golfpokaalin laatassa tasoitus, josta Kalevi on ylpeä ja jota kukaan muu ei pidä saavutuksena.
- Tiedotejuliste ALV 25,5 %, johon joku on piirtänyt surullisen naaman.
- Pirjon jatkoviestit kiristyvät todiste todisteelta (”Minulla on kopio.”, ”Minä irtisanoudun.”).

## 9. Grafiikka ja mallit

- **Huone, ovi, käytävä, työpöytä, kirjahylly, sivupöytä:** blender/build_room.py.
- **Puhelinvastaaja, kassakaappi, mapit, silppuri:** blender/build_props.py (roskakori on mallissa,
  mutta poistetaan latauksessa). Kassakaapin näppäimistö, kyltti ja pultit sekä silppurin ikkuna,
  merkki ja paneeli lisätään koodilla (src/decor.js). Teräs ja muovi saavat proseduraaliset
  harjaus- ja rakeisuustekstuurit (src/textures.js).
- **15 valmista Poly Havenin CC0-mallia** (src/props.js), pakattu `npm run models`-komennolla.
  Niistä brass_goblets toimii golfpokaalina (yksi malja; laatta ja golfpallo koodilla) ja
  throw_pillows_01 sohvatyynynä.
- **Kahvikuppi, paperipino, karahvi:** three.js:n perusmuodot (src/decor.js).
- **Paperit ja tekstit** piirretään canvakselle (src/paper.js), käsiala Kalam-fontilla.
- **Henkilökuvat ja kollaasi:** tekoälyllä tehdyt piirroskuvat (public/characters, public/comic).

**Visuaaliset tehosteet** (kaikki valittu niin, ettei huonetta tarvitse piirtää joka kuvassa):

- Valonsäteet kaihtimien raoista (src/shafts.js), noin 30 läpikuultavaa levyä.
- Pöly näkyy vain auringonsäteessä ja lamellien raidoissa (src/dust.js).
- Aurinko laskee 30 minuutissa: suunta madaltuu, väri lämpenee, varjot pitenevät (päivitys 20 s välein).
- Heijastukset: huone kuvataan kerran latauksessa kuutiokameralla ympäristökartaksi.
- Lähikuva: esine lentää ruudun keskelle ja tausta sumenee.
- Kuvakulmasiirtymä kiertää katseen suuntaa (slerp).
- Jälkikäsittely: GTAO, bloom, ääriviiva hiiren alla, AgX-sävykartta.

## 10. Tekniikka

- **three.js** 0.186 ja **Vite**, mallit **Blenderistä** (4.5 LTS) meshopt-pakattuina, tekstuurit WebP.
- Huone piirretään vain kameran liikkuessa; levossa päivittyy vain pöly (30 fps). Tarkkuus
  laskee automaattisesti, jos kone ei jaksa.
- Julkaisu **GitHub Pagesissa** (.github/workflows/deploy.yml) jokaisesta pushista mainiin.
- **Laatuprofiili** (src/quality.js): tietokoneella täysi jälkikäsittely (liukulukupuskuri 4x MSAA,
  GTAO, ääriviiva, bloom, 4096 varjokartta). Puhelimella ja tabletilla, tai jos laite ei osaa
  renderöidä liukulukuun, kevyt polku: ei MSAA:ta, AO:ta, ääriviivaa eikä bloomia, 2048 varjokartta,
  puolet pienemmät koodilla lasketut tekstuurit ja 8-bittinen puskuri tarvittaessa. Syy: iPhone
  Safarissa huone jäi mustaksi (pöly näkyi), koska liukulukupuskuri MSAA:lla ja jälkikäsittelyn
  puskurit eivät toimineet. Kytkimet: `?quality=low|high`, `?target=8`, `?debug` (diagnoosirivi:
  näytönohjain, profiili, virheet).
- **Mobiilin yläpalkki** (alle 760 px): yhdellä rivillä aika, ”💡 Vihje −5 min”, tauko (⏸),
  ”📋 Raportti” ja valikko (☰ ja todisteiden määrä). Tavarat, todisteet, muistiinpanot ja ohjeet
  ovat valikon takana; otsikko piilotetaan. Tietokoneen yläpalkki on ennallaan.
- Toimii myös kapealla näytöllä (näkökenttä levenee, lähikuva pienenee, muistio, prologi ja
  tulosnäkymä mukautuvat); ensisijainen kohde on tietokoneen selain.

## 11. Avoimet kysymykset ja seuraavat askeleet

- Lukitaanko *Nosta kehystä* mustan kirjan lukemisen taakse, jotta viides todiste ei löydy
  vahingossa ensimmäisenä?
- Laskevan auringon häikäisy Ikkuna-näkymässä pelin loppupuolella: hillitäänkö?
- Kalevin repliikki löydösten mukaan (nyt määrän mukaan).
- Sohva-näkymän sisältö (tyynyn alla mainittu tuloskortti luettavaksi?).
- Cloudflare Pagesiin siirtyminen: myöhemmin, jos tarvetta.

## 12. Historia lyhyesti

1. Huone, valaistus ja kuvakulmat.
2. Kalusteet, esineet ja lähikuva.
3. Pulmaketju, aikaraja, raportti, loppukohtaus.
4. Wow-tehosteet: valonsäteet, laskeva aurinko, heijastukset, silppuripeli, satunnaiset koodit.
5. Tarina uusiksi: työnimi *Laatikko B* hylättiin, nimeksi *Tarkastuskäynti*. Pelaaja
   viranomaiseksi, käynti epäviralliseksi, Pirjo whistlebloweriksi, viides todiste.
6. Prologi kokeiltiin automatkana, sarjakuvana ja päätyi kollaasiin ja kolmeen diaan.
7. UI-hionta: vihjeiden selkeys, raportin varmistus, tauko, ilmoitusten kaksi kanavaa,
   loppunäkymä, parannellut esineet.
