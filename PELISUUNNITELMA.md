# Pelisuunnitelma: "Laatikko B" (työnimi)

> Realistinen yhden huoneen point-and-click-pakohuonepeli selaimessa.
> Pelaaja on verotarkastaja, joka tekee yllätystarkastuksen toimitusjohtajan työhuoneeseen.

Muita nimiehdotuksia: *Yllätystarkastus*, *Kivi & Kumppanit*, *Toinen mappi*.

---

## 1. Tavoite ja linjaukset

- **Miksi:** tekniikkademo siitä, että näyttävän 3D-selainpelin voi tehdä Claude-avusteisesti.
- **Painopiste:** mahdollisimman realistinen ja näyttävä ulkoasu. Pelin ei tarvitse olla pitkä.
- **Kesto:** noin 10–15 minuuttia.
- **Tyyli:** huumoria, ei vakava trilleri.
- **Vaikeus:** alussa helppoa. Kuka tahansa pystyy ratkaisemaan pulmat, mutta kirjanpidon osaamisesta on apua.
- **Kieli:** suomi.

## 2. Tarina

Pelaaja on Verovirasto-nimisen (keksitty virasto) tarkastaja. Rakennusliike **Kivi & Kumppanit Oy:n** kirjanpidossa on ollut outoja lukuja, ja nyt tehdään yllätystarkastus.

Toimitusjohtaja **Kalevi Kivi** on "lähtenyt lounaalle" ja palaa noin 15 minuutin kuluttua. Siihen mennessä pelaajan pitää löytää todisteet piilotetusta, toisesta kirjanpidosta ("laatikko B") ja koota tarkastusraportti.

Kalevia ei nähdä, mutta huoneen tavarat kertovat hänestä kaiken.

**Pirjo** on firman kirjanpitäjä, joka jättää puhelinvastaajaan viestejä Kaleville. Ne toimivat samalla vihjeinä pelaajalle.

## 3. Huone ja kuvakulmat

Toimitusjohtajan työhuone myöhään iltapäivällä. Aurinko siivilöityy sälekaihtimien läpi, pölyhiukkaset leijuvat valossa ja seinäkello tikittää. Puupaneelit, nahkatuoli ja viskikarahvi kertovat, että rahaa on.

Pelaaja liikkuu neljän kiinteän kuvakulman välillä:

| Kuvakulma | Mitä siellä on |
|---|---|
| **Työpöytä** | tietokone, muistilaput, pöytälaatikot A ja B, kahvikuppi, pöytäkalenteri |
| **Kirjahylly** | kirjat, virallinen mappi, kassakaappi (kirjojen takana) |
| **Ikkuna** | viherkasvi ("taideteos"), paperisilppuri, roskakori, kesämökin kuva |
| **Ovi** | puhelinvastaaja, kehystetty diplomi, ALV-juliste, naulakko |

Esineitä voi klikata, nostaa lähemmäs ja pyöritellä. Läheltä katsottaessa realistiset yksityiskohdat pääsevät oikeuksiinsa.

## 4. Pulmaketju (toteutettu)

Ei laskutehtäviä: koodit löytyvät huoneesta tutkimalla, ja kirjanpidon osaaminen auttaa
tunnistamaan todisteita. Jokainen vaihe vie eri kuvakulmaan. Koodit (diplomin vuosi,
hääpäivä ja golftasoitus) arvotaan joka pelikerralla (`SECRETS`, src/game.js), ja jokaiseen
koodiin on kaksi lähdettä.

| # | Missä | Mitä tapahtuu | Tulos |
|---|---|---|---|
| 1 | Työpöytä → Ikkuna | Tietokoneen kannen lappu: ”Varavain siellä missä taide kasvaa.” Viherkasvi on kirjattu taideteokseksi (myös Tilinpäätös-mapin taseessa) → **Nosta ruukkua** | Messinkiavain |
| 2 | Työpöytä | Laatikko A avautuu avaimella: kuitit ja Pirjon lappu | – |
| 2a | Lukunäkymä | Kolmessa kuitissa on asiakkaan nimi, yhdessä toimitusosoite mökille: kiuas | **Todiste 1**: peitelty osinko |
| 2b | Sohva | Pirjon lappu: koodi on vuosi, josta Kalevi on ylpein → diplomi ”Vuoden veronmaksaja” | Laatikko B: **diplomin vuosi** |
| 3 | Työpöytä → Ikkuna | Laatikossa B puolikas lasku ja lappu ”Silppuri / Kassakaappi: HÄÄPÄIVÄ”. Silppurin suikaleet kootaan vetämällä oikeaan järjestykseen (5 suikaletta) | **Todiste 2**: ohimyynti, lasku 117 Cayman-yhtiölle (ALV 0 %) |
| 3b | Ovi / Työpöytä | Vaimo mainitsee hääpäivän puhelinvastaajassa; sama päivä lukee mökkikuvan reunassa | Kassakaappi: **PPKK** (rullat DEBET / KREDIT) |
| 4 | Kirjahylly | Kassakaapissa musta ”Kirjanpito B” (vertailu: Kirjanpito 2025 -mapin tuloslaskelma) | **Todiste 3**: kaksoiskirjanpito |
| 4b | Kirjahylly → Työpöytä | Salasanavihje ”tasoitukseni”: Raimo sanoo, että tasoitus on kaiverrettu hyllyn golfpokaaliin. Kalenterissa pe 27.6. ”siirto Caymanille 870 000 €” | **Todiste 4**: lähipiirisiirto |

**Tukimateriaali mapeissa:** Kirjanpito 2025 -mapissa on tuloslaskelman lisäksi tositeluettelo
(ML 117 puuttuu välistä) ja pankin tiliote (pano Kivi Consulting Ltd:ltä, jolle ei ole tositetta).
Tilinpäätös-mapissa on tase (taide-esineet 12 000 €, 1 kpl viherkasvi; nitojan poistoaika 25 v).

**Pirjo reagoi:** jokaisesta todisteesta puhelinvastaajaan tulee Pirjolta uusi viesti ja
merkkivalo syttyy uudelleen.

**Loppu:** tarkastusraportissa jokaiselle löydetylle todisteelle valitaan peruste kolmesta
vaihtoehdosta (oikea termi, uskottava väärä, hölmö). Raportin voi lähettää milloin tahansa.
15 minuutin aikarajan lopussa ovi aukeaa ja Kalevi palaa. Arvosana määräytyy todisteiden,
oikeiden perusteiden ja käytettyjen vihjeiden mukaan. Vihje maksaa minuutin, väärä
epäilymerkintä puoli minuuttia. Tuloksen alla listataan pelissä esiintyneet termit.

**Prologi (src/prologue.js):** sarjakuva, viisi ruutua, klikkaus eteen- ja taaksepäin
(nuolet, nuolinäppäimet, Esc ohittaa). Ruuduissa kuva, keltainen kuvateksti ja puhekupla:
1) tarkastaja ja kirjekuori Verovirastossa, 2) kirje lähikuvassa, 3) Kalevi lähtee lounaalle,
4) Pirjo katsoo perään, 5) tarkastaja raollaan olevan oven edessä. Kuvat kansiosta
public/comic/ (ohje README.txt); puuttuvan kuvan tilalla näytetään henkilökuva.
Sen jälkeen tarkastusmääräys kolmessa vaiheessa (tehtävä, näin pelaat, ohjaus ja vihjeet).

## 5. Huumori ja yksityiskohdat

- Kehystetty diplomi "Vuoden veronmaksaja 1998", selvästi itse tehty
- Kirjahyllyssä *"Verosuunnittelu for Dummies"* ja *"Kuinka puhua tarkastajalle"* (alleviivattu)
- Muistilaput: *"Muista silputa!!!"*, *"Kuitit → laatikko B (EI laatikko A)"*
- Kahvikuppi "Maailman paras johtaja", kirjattu edustuskuluksi
- Puhelinvastaajassa viestejä vaimolta, golfkaverilta ja Pirjolta
- Suomalaista toimistokulttuuria: Fiskarsin sakset, pankin joulukorttipino, kesämökin kuva, Marimekon tyyny sohvalla
- Verovirasto ja firma ovat keksittyjä. Oikeiden virastojen tai yritysten nimiä ja logoja ei käytetä.

## 6. Tarvittavat esineet (mallilista)

**Huone:** seinät ja puupaneelit, lattia, ikkuna ja sälekaihtimet, ovi, katto ja valaisin

**Huonekalut:** työpöytä (2 laatikkoa), nahkatuoli, kirjahylly, sohva, kassakaappi, naulakko

**Esineet:** tietokone ja näyttö, pöytälamppu, puhelinvastaaja, seinäkello, viherkasvi ruukussa, paperisilppuri, roskakori, viskikarahvi ja lasi, kahvikuppi, mapit (2), kirjat, kehykset (diplomi, mökkikuva), muistilaput, kuitit, lasku (silputtava), avain, pöytäkalenteri, juliste

**Mistä mallit tulevat:**
- Ilmaiset, vapaasti käytettävät mallit ja materiaalit (esim. Poly Haven, Sketchfabin CC-mallit)
- Omat erikoisesineet, kuten paperit, laput ja mapit, tehdään Blenderissä tai suoraan koodilla
- Tarvittaessa täydennetään tekoälyllä tehdyillä 3D-malleilla

## 7. Tekniikka (lyhyesti)

- **three.js** selaimessa, mallit **Blenderistä** (asennettuna versio 4.5.14 LTS)
- Julkaisu **GitHub Pagesissa**, myöhemmin tarvittaessa Cloudflare Pagesissa
- Äänet: kellon tikitys, paperin kahina, puhelinvastaajan viestit (mahdollisesti tekoälyäänillä)

## 8. Toteutusvaiheet

1. **Huone näkyviin:** tyhjä huone, valaistus ja kuvakulmien vaihto selaimessa. Tästä näkee jo, onko ulkoasu näyttävä.
2. **Kalusteet ja esineet:** huone täytetään ja esineitä voi klikata ja tarkastella läheltä.
3. **Pulmat:** pulmaketju 1–4, aikaraja ja tarkastusraportti.
4. **Viimeistely:** äänet, huumoriyksityiskohdat, vihjeet ja loppukohtaus.
5. **Julkaisu:** GitHub Pages.

Jokaisen vaiheen jälkeen on olemassa jotain toimivaa ja näytettävää.

## 9. Avoimet kysymykset

- Lopullinen nimi?
- Onko aikaraja oikea (kello käy) vai vain tunnelmaa varten?
- Saako pelaaja nimen ja hahmon, vai onko hän vain "tarkastaja"?
- Pitääkö pelin toimia myös puhelimella?
- Pelaajan valitsemat raportin löydökset: kuinka monta harhautusta?

## 10. Visuaaliset tehosteet (toteutettu)

Ei ääniä. Kaikki tehosteet on valittu niin, ettei huonetta tarvitse piirtää uudelleen joka kuvassa.

- **Valonsäteet** (src/shafts.js): jokaisesta kaihtimen raosta lähtee ohut läpikuultava valolevy
  auringon suuntaan. Noin 30 nelikulmiota, lisäävä sekoitus. Piilotetaan AO- ja ääriviivapassien
  ajaksi, jotteivät ne kirjoita syvyyttä.
- **Pöly** näkyy vain säteen sisällä ja lamellien raidoissa; kameran lähellä häivytetään.
- **Aurinko laskee** pelin 15 minuutin aikana: suunta madaltuu, väri lämpenee, varjot pitenevät.
  Päivitetään 20 sekunnin välein (varjokartta lasketaan silloin uudelleen).
- **Heijastukset**: huone kuvataan kerran latauksessa kuutiokameralla ja kuvasta tehdään
  ympäristökartta. Lakattu pöytä ja messinki heijastavat ikkunaa.
- **Lähikuva**: esine lentää huoneesta ruudun keskelle ja tausta sumenee (12 näytteen sumennus).
- **Kuvakulmasiirtymä** kiertää katseen suuntaa (slerp), ei kohdepistettä.
- **Sisustus** (src/decor.js): kahvikuppi, kynäpurkki, paperipino, viskikarahvi ja lasi,
  golfpokaali, sohvatyyny; kirjasarjat eri sävyissä. Rakennettu three.js:n perusmuodoista.
- **Käsialafontti** Kalam Google Fontsista (index.html); paperit piirretään vasta fontin latauduttua.
