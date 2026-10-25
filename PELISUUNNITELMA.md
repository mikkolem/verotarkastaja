# Pelisuunnitelma: "Laatikko B" (työnimi)

> Realistinen yhden huoneen point-and-click-pakohuonepeli selaimessa.
> Pelaaja on verotarkastaja, joka tekee yllätystarkastuksen toimitusjohtajan työhuoneeseen.

Muita nimiehdotuksia: *Yllätystarkastus*, *Kivi & Kumppanit*, *Toinen mappi*.

---

## 1. Tavoite ja linjaukset

- **Miksi:** tekniikkademo siitä, että näyttävän 3D-selainpelin voi tehdä Claude-avusteisesti.
- **Painopiste:** mahdollisimman realistinen ja näyttävä ulkoasu. Pelin ei tarvitse olla pitkä.
- **Kesto:** noin 15–25 minuuttia, aikaraja 30 minuuttia.
- **Tyyli:** huumoria, ei vakava trilleri.
- **Vaikeus:** alussa helppoa. Kuka tahansa pystyy ratkaisemaan pulmat, mutta kirjanpidon osaamisesta on apua.
- **Kieli:** suomi.

## 2. Tarina

Pelaaja on Verovirasto-nimisen (keksitty virasto) tarkastaja. Rakennusliike **Kivi & Kumppanit Oy:n** kirjanpidossa on ollut outoja lukuja, ja nyt tehdään yllätystarkastus.

Toimitusjohtaja **Kalevi Kivi** on "lähtenyt lounaalle" ja palaa noin 30 minuutin kuluttua. Siihen mennessä pelaajan pitää todistaa, että toinen, oikea kirjanpito on olemassa, ja koota tarkastusraportti.

**"Laatikko B"** on Kalevin oma kiertoilmaus koko rinnakkaiselle kirjanpidolle, ei fyysinen laatikko. Työpöydän laatikot A ja B ovat hänen vitsinsä, kassakaapin musta kirja on itse B-kirjanpito. Kirje sanoo sen ääneen: "Se ei ole laatikko."

**Tämä ei ole virallinen verotarkastus** vaan epävirallinen käynti ennen sitä (virallinen alkaa ensi kuussa, "siihen mennessä paperit ovat silppurissa"). Oikea tarkastus ei tonki laatikoita johtajan ollessa lounaalla; peli on salapoliisityötä tarkastajan vaatteissa, ja prologi tunnustaa sen huumorilla. Sisältö (termit, kirjaukset, ALV) on silti asiallisesti oikein.

Kalevia ei nähdä pelin aikana, mutta huoneen tavarat kertovat hänestä kaiken. Hän astuu ovesta
vasta loppukohtauksessa (henkilökuva ja repliikki, joka riippuu tuloksesta).

**Pirjo** on firman kirjanpitäjä ja nimettömän vihjeen lähettäjä. Hän jättää puhelinvastaajaan
viestejä Kaleville, jotka toimivat samalla vihjeinä pelaajalle, ja uuden viestin jokaisesta
löydetystä todisteesta.

## 3. Huone ja kuvakulmat

Toimitusjohtajan työhuone iltapäivällä. Aurinko siivilöityy sälekaihtimien läpi valonsäteinä,
pölyhiukkaset leijuvat valossa ja aurinko laskee pelin kuluessa. Puupaneelit, nahkasohva ja
viskikarahvi kertovat, että rahaa on. Ei ääniä.

Pelaaja liikkuu viiden kiinteän kuvakulman välillä (järjestys myötäpäivään):

| Kuvakulma | Mitä siellä on |
|---|---|
| **Työpöytä** | kannettava tietokone (kalenteri), muistilappu kannessa, pöytälaatikot A ja B, kahvikuppi, kynäpurkki, paperipino (tiliote), lukulasit, nitoja, mökkikuva kehyksessä, pöytälamppu |
| **Ikkuna** | viherkasvi (”taideteos”, avain ruukun alla), paperisilppuri, roskakori, seinäkello |
| **Sohva** | Chesterfield-sohva, kukkatyyny, kunniakirja ”Vuoden veronmaksaja” seinällä |
| **Ovi** | sivupöytä: puhelinvastaaja, muistikirja, viskikarahvi ja lasi; ALV-juliste; ovi käytävään |
| **Kirjahylly** | kirjasarjat, mapit (Kirjanpito 2025, Kirjanpito 2024, Tilinpäätös), golfpokaali, kassakaappi alahyllyllä |

Esineitä voi klikata, nostaa lähemmäs ja pyöritellä. Läheltä katsottaessa realistiset yksityiskohdat pääsevät oikeuksiinsa.

## 4. Pulmaketju (toteutettu)

Ei laskutehtäviä. Viisi todistetta vaikeusjärjestyksessä: kaksi ensimmäistä ovat ohjattuja
(laput kertovat paikan), kolmas vaatii kahden lähteen yhdistämistä, kaksi viimeistä päättelyä
ilman suoraa ohjausta. Koodit (diplomin vuosi, hääpäivä, golftasoitus) arvotaan joka
pelikerralla (`SECRETS`, src/game.js).

| # | Todiste | Johtava vihje | Paikka | Vaikeus |
|---|---|---|---|---|
| 1 | **Kiuas edustuskuluissa** (peitelty osinko) | Tietokoneen lappu: ”Varavain A kukkaruukun alla” → avaimessa ”A” → laatikko A. Kolmessa kuitissa asiakkaan nimi, yhdessä toimitusosoite mökille | Kasvi → laatikko A → kuitit | Helppo, ohjattu |
| 2 | **Lasku 117 Cayman-yhtiölle** (ohimyynti) | Pirjon lappu laatikossa A: ”koodi on vuosi kunniakirjassa sohvan yläpuolella” → laatikko B → lappu ”silppuri ikkunan alla” → suikaleet kootaan vetämällä | Sohva → laatikko B → silppuri | Helppo–keski |
| 3 | **Musta B-kirjanpito** (kaksoiskirjanpito) | Lappu: ”Kassakaappi: HÄÄPÄIVÄ”. Päivä pitää itse löytää: vaimon viesti vastaajassa tai mökkikuvan päiväys. Rullat DEBET / KREDIT | Vastaaja / mökkikuva → kassakaappi | Keskitaso |
| 4 | **Kalenterin siirto 870 000 €** (lähipiirisiirto) | Salasanavihje ”tasoitukseni”, Raimon vitsi tasoituksesta, pokaali hyllyssä (”Tasoitus NN”). B-kirja: ”ajankohdat sovittu Raimon kanssa” | Pokaali → tietokone → kalenteri | Vaikea |
| 5 | **Cayman-tiliote Kalevin omissa nimissä, 2,1 milj. €** (ilmoittamaton ulkomainen tili) | B-kirjan viimeinen rivi: ”Tiliotteet: ylpeyteni takana.” Kunniakirja roikkuu vinossa → ”Nosta kehystä” → teipattu kirjekuori | Sohva → kunniakirja | Vaikein |

**Tukimateriaali mapeissa:** Kirjanpito 2025 -mapissa on tuloslaskelman lisäksi tositeluettelo
(ML 117 puuttuu välistä) ja pankin tiliote (pano Kivi Consulting Ltd:ltä, jolle ei ole tositetta).
Tilinpäätös-mapissa on tase (taide-esineet 12 000 €, 1 kpl viherkasvi; nitojan poistoaika 25 v).

**Pirjo reagoi:** jokaisesta todisteesta puhelinvastaajaan tulee Pirjolta uusi viesti ja
merkkivalo syttyy uudelleen.

**Loppu:** tarkastusraportissa jokaiselle löydetylle todisteelle valitaan peruste kolmesta
vaihtoehdosta (oikea termi, uskottava väärä, hölmö). Jokaisen vaihtoehdon alla on tarkastajan
yhden rivin muistiinpano, joka selittää termin: termit selitetään vain raportissa ja tuloksessa,
ei huoneessa. Puuttuvan todisteen kohdalla näkyy vain kategoria ("myynti, jota ei ole kirjattu").
Raportin voi lähettää milloin tahansa. 30 minuutin aikarajan lopussa ovi aukeaa ja Kalevi palaa.
Arvosana määräytyy todisteiden, oikeiden perusteiden ja käytettyjen vihjeiden mukaan.
Vihje maksaa kolme minuuttia; väärästä epäilymerkinnästä ei ole sakkoa. Tuloksen alla on
termilista yhden rivin selityksineen.

**Prologi (src/prologue.js):** kollaasikuva henkilöistä (public/comic/collage.jpg) koko
ruudun taustana, sen päällä kolme diaa: 1) tarina ja pelin idea kolmessa virkkeessä,
2) nimetön vihjekirje (laatikko B, lounas kello 12, vartti aikaa), 3) henkilöt pieninä
kortteina. Sitten ovi aukeaa ja kamera ajaa käytävästä työpöydälle. Klikkaus eteen- ja
taaksepäin, Esc ohittaa. Huoneessa tarkastusmääräys kahdessa vaiheessa: tehtävä lyhyesti
ja näin pelaat.

## 5. Huumori ja yksityiskohdat

Toteutettu (esineiden kuvaukset src/items.js, paperit src/paper.js):

- Kunniakirja ”Vuoden veronmaksaja [arvottu vuosi]”. Myöntäjä: Kalevi Kivi, saaja: Kalevi Kivi.
- Muistilaput: ”Varavain siellä missä taide kasvaa”, ”Silppuri – älä unohda!!! Kassakaappi: HÄÄPÄIVÄ (älä kirjoita ylös)”, Pirjon lappu laatikossa A.
- Kahvikuppi ”Maailman paras johtaja”, kirjattu edustuskuluksi. Viherkasvi taideteoksena 12 000 € (oikea hinta 89 €). Nitojan poistoaika 25 vuotta. Sohva ”neuvottelutilan kalustus 8 900 €”.
- Tietosanakirjasarja metreittäin, ”ammattikirjallisuutta”, sivut leikkaamatta. Muistikirja ”EI PAPEREITA VEROTTAJALLE – paitsi ne viralliset”.
- Puhelinvastaajassa viestejä Pirjolta, vaimolta (Marjatta) ja golfkaveri Raimolta. Kalenterissa ”Hallituksen kokous (= minä)” ja ”Verotarkastus?? EI KOSKAAN”.
- ALV-juliste 25,5 %, johon joku on piirtänyt surullisen naaman.
- Verovirasto, Kivi & Kumppanit Oy ja Pohjolan Säästöpankki ovat keksittyjä. Oikeiden virastojen tai yritysten nimiä ja logoja ei käytetä (tyyny on yleinen kukkakuvio, ei tuotemerkki).

Ei toteutettu: Fiskarsin sakset, pankin joulukorttipino, nimetyt kirjat hyllyssä.

## 6. Tarvittavat esineet (mallilista)

**Huone:** seinät ja puupaneelit, lattia, ikkuna ja sälekaihtimet, ovi, katto ja valaisin

**Huonekalut:** työpöytä (2 laatikkoa), nahkatuoli, kirjahylly, sohva, kassakaappi, naulakko

**Esineet:** kannettava tietokone, pöytälamppu, puhelinvastaaja, seinäkello, viherkasvi ruukussa, paperisilppuri, roskakori, viskikarahvi ja lasi, kahvikuppi, kynäpurkki, paperipino, mapit (3), kirjasarjat, golfpokaali, sohvatyyny, kehykset (kunniakirja, mökkikuva), lukulasit, nitoja, muistikirja, muistilaput, kuitit, lasku (silputtu), avain, juliste. Kalenteri on tietokoneen näytöllä, ei pöydällä. Naulakkoa ei ole.

**Mistä mallit tulevat (toteutunut):**
- Huone, ovi, käytävä, työpöytä, kirjahylly ja sivupöytä: Blender-skripti blender/build_room.py
- Puhelinvastaaja, kassakaappi, mapit, silppuri, roskakori: blender/build_props.py
- 13 valmista Poly Havenin CC0-mallia (src/props.js), pakattu `npm run models`-komennolla
- Kahvikuppi, kynäpurkki, paperipino, karahvi, pokaali ja tyyny: three.js:n perusmuodot (src/decor.js)
- Paperit ja tekstit piirretään canvakselle (src/paper.js), käsiala Kalam-fontilla
- Henkilökuvat ja kollaasi: tekoälyllä tehdyt piirroskuvat (public/characters, public/comic)

## 7. Tekniikka (lyhyesti)

- **three.js** (0.186) ja **Vite**, mallit **Blenderistä** (4.5 LTS) meshopt-pakattuina
- Jälkikäsittely: GTAO, bloom, ääriviivat, AgX-sävykartta. Huone piirretään vain kameran liikkuessa, levossa päivittyy vain pöly.
- Julkaisu **GitHub Pagesissa** (.github/workflows/deploy.yml), osoite https://mikkolem.github.io/verotarkastaja/. Cloudflare Pages harkinnassa myöhemmin.
- **Ei ääniä.** Päätetty jättää pois; rytmi tehdään tekstien ilmestymisellä ja kameran liikkeellä.

## 8. Toteutusvaiheet

1. ✅ **Huone näkyviin:** tyhjä huone, valaistus ja kuvakulmien vaihto selaimessa.
2. ✅ **Kalusteet ja esineet:** huone täytetty, esineitä voi klikata ja tarkastella läheltä.
3. ✅ **Pulmat:** pulmaketju 1–4, aikaraja ja tarkastusraportti.
4. ✅ **Viimeistely:** huumoriyksityiskohdat, vihjeet, loppukohtaus ja prologi (ei ääniä).
5. ✅ **Julkaisu:** GitHub Pages.
6. ✅ **Wow-tehosteet ja termit:** valonsäteet, laskeva aurinko, satunnaiset koodit, silppuripeli, raportin perusteet (ks. luvut 4 ja 10).
7. ✅ **Tarina ja vaikeuskaari:** Laatikko B kiertoilmauksena, epävirallinen käynti, viides todiste, 30 min, vihje 3 min, raportin selitykset.
8. **Seuraavaksi:** UI-hionta, Sohva-näkymän sisältö, aikarajan näkyvyys, Kalevin repliikit löydösten mukaan.

## 9. Avoimet kysymykset

- Lopullinen nimi? (Työnimi ”Laatikko B” on käytössä otsikoissa.)
- Cloudflare Pagesiin siirtyminen: milloin, vai jäädäänkö GitHub Pagesiin?

Ratkaistut:
- Aikaraja on oikea: 30 minuuttia, kello käy, vihje maksaa kolme minuuttia, lopussa Kalevi palaa.
- Pelaaja on ”Sinä”, verotarkastaja, ilman nimeä. Virastossa kutsutaan ”Pilkuksi”.
- Peli toimii myös kapealla näytöllä (näkökenttä levenee, lähikuva pienenee, muistio ja prologi mukautuvat), mutta ensisijainen kohde on tietokoneen selain.
- Raportissa jokaiselle todisteelle kolme perustevaihtoehtoa: oikea, uskottava väärä ja hölmö, kukin selitysrivillä.
- Termit selitetään vain raportissa ja tuloksessa, henkilön äänellä, ei huoneessa.

## 10. Visuaaliset tehosteet (toteutettu)

Ei ääniä. Kaikki tehosteet on valittu niin, ettei huonetta tarvitse piirtää uudelleen joka kuvassa.

- **Valonsäteet** (src/shafts.js): jokaisesta kaihtimen raosta lähtee ohut läpikuultava valolevy
  auringon suuntaan. Noin 30 nelikulmiota, lisäävä sekoitus. Piilotetaan AO- ja ääriviivapassien
  ajaksi, jotteivät ne kirjoita syvyyttä.
- **Pöly** näkyy vain säteen sisällä ja lamellien raidoissa; kameran lähellä häivytetään.
- **Aurinko laskee** pelin 30 minuutin aikana: suunta madaltuu, väri lämpenee, varjot pitenevät.
  Päivitetään 20 sekunnin välein (varjokartta lasketaan silloin uudelleen).
- **Heijastukset**: huone kuvataan kerran latauksessa kuutiokameralla ja kuvasta tehdään
  ympäristökartta. Lakattu pöytä ja messinki heijastavat ikkunaa.
- **Lähikuva**: esine lentää huoneesta ruudun keskelle ja tausta sumenee (12 näytteen sumennus).
- **Kuvakulmasiirtymä** kiertää katseen suuntaa (slerp), ei kohdepistettä.
- **Sisustus** (src/decor.js): kahvikuppi, kynäpurkki, paperipino, viskikarahvi ja lasi,
  golfpokaali, sohvatyyny; kirjasarjat eri sävyissä. Rakennettu three.js:n perusmuodoista.
- **Käsialafontti** Kalam Google Fontsista (index.html); paperit piirretään vasta fontin latauduttua.
