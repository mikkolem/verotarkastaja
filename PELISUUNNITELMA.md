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
tunnistamaan todisteita. Jokainen vaihe vie eri kuvakulmaan.

| # | Missä | Mitä tapahtuu | Tulos |
|---|---|---|---|
| 1 | Työpöytä → Ikkuna | Tietokoneen kannen lappu: ”Varavain siellä missä taide kasvaa.” Viherkasvi on kirjattu taideteokseksi → **Nosta ruukkua** | Messinkiavain |
| 2 | Työpöytä | Laatikko A avautuu avaimella: kuitit ja Pirjon lappu | – |
| 2a | Lukunäkymä | Yksi edustuskuluksi kirjatuista kuiteista on kesämökin kiuas (juhannusaatto) | **Todiste 1**: yksityiskulu, peiteltyä osinkoa |
| 2b | Sohva | Pirjon lappu: koodi on vuosi, josta Kalevi on ylpein → diplomi ”Vuoden veronmaksaja 1998” | Laatikko B: **1998** |
| 3 | Työpöytä → Ikkuna | Laatikossa B puolikas lasku ja lappu ”Silppuri – älä unohda / Kassakaappi: HÄÄPÄIVÄ”. Silppurista löytyy laskun alaosa | **Todiste 2**: 10 000 € lasku Cayman-yhtiölle (ALV 0 %, myynti EU:n ulkopuolelle), tuloa ei kirjanpidossa |
| 3b | Ovi | Puhelinvastaaja: vaimo muistuttaa hääpäivästä 12.6., joka on myös kassakaapin koodi | Kassakaappi: **1206** |
| 4 | Kirjahylly | Kassakaapissa musta ”Kirjanpito B”: todellinen liikevaihto 1,48 milj. € vs. virallinen 0,61 milj. € (vertailu: Kirjanpito 2025 -mapin tuloslaskelma) | **Todiste 3** |
| 4b | Työpöytä | Tietokoneen salasana = golftasoitus **36** (golfkaveri Raimon viesti). Kalenterissa pe 27.6. klo 14 ”siirto Caymanille 870 000 € – golfmatka” | **Todiste 4** |

**Loppu:** tarkastusraportti on tarkistuslista neljästä todisteesta. Sen voi lähettää milloin
tahansa. 15 minuutin aikarajan lopussa ovi aukeaa ja Kalevi palaa. Arvosana määräytyy
löydettyjen todisteiden ja käytettyjen vihjeiden mukaan. Vihje maksaa minuutin aikaa.

**Prologi:** nimetön vihjekirje (Pirjolta) ja henkilöesittelyt (Kalevi, Pirjo, Sinä).

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
