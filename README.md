# Tarkastuskäynti – kirjanpito, joka ei täsmää

Realistinen yhden huoneen pakohuonepeli selaimessa (three.js + Blender).

Rakennusliike Kivi & Kumppanit Oy:n kirjanpito ei täsmää pankkitiliin. Toimitusjohtaja Kalevi K.
on lounaalla puoli tuntia. Sinulla on se aika etsiä hänen työhuoneestaan viisi todistetta
toisesta, oikeasta kirjanpidosta ja koota tarkastusraportti. Suomeksi, noin 15–25 minuuttia.

**Pelaa:** https://mikkolem.github.io/verotarkastaja/

Pelin tarina, pulmat ratkaisuineen ja tekniset ratkaisut: [PELISUUNNITELMA.md](PELISUUNNITELMA.md).

## Komennot

| Komento | Mitä tekee |
|---|---|
| `npm install` | asentaa riippuvuudet (kerran) |
| `npm run dev` | käynnistää pelin osoitteeseen http://localhost:5173 |
| `npm run build` | tekee julkaistavan version kansioon `dist/` |
| `npm run model` | rakentaa huoneen ja erikoisesineet Blenderillä → `public/models/room.glb`, `custom_props.glb` |
| `npm run models` | pakkaa valmiit mallit kansiosta `assets-src/` → `public/models/` |

Push `main`-haaraan julkaisee pelin GitHub Pagesiin automaattisesti.

## Rakenne

**Peli**
- `src/main.js` – renderöinti, valot, varjot, jälkikäsittely, latausjärjestys, vihjeet ja prologin ovisiirtymä
- `src/game.js` – pelin tila (tavarat, todisteet, liput), arvotut koodit, todisteiden nimet, raportin perusteet ja termit
- `src/items.js` – klikattavat esineet: nimet, kuvaukset, toiminnot ja puhelinvastaajan viestit
- `src/paper.js` – paperit ja tekstit canvakselle: kuitit, laput, laskut, mappien sivut, tiliotteet, kalenteri
- `src/finale.js` – aikaraja, vihjenappi, tauko, tarkastusraportti, loppukohtaus ja tulosnäkymä
- `src/prologue.js` – prologi: kollaasi ja kolme diaa
- `src/ui.js` – ilmoitukset, tavarat, lukunäkymä, numerolukko, puhelinvastaaja, salasana ja silppuripeli
- `src/interact.js` – korostus hiiren alla ja esineen lähikuva
- `src/views.js` – viisi kiinteää kuvakulmaa ja niiden välinen siirtymä

**Grafiikka**
- `src/materials.js`, `src/textures.js` – materiaalit ja koodilla piirretyt tekstuurit (puu, parketti, maali, nahka, harjattu teräs, muovi)
- `src/props.js` – valmiit 3D-mallit (Poly Haven, CC0) ja niiden paikat
- `src/decor.js` – koodilla rakennetut esineet ja lisäosat (kahvikuppi, karahvi, kassakaapin ja silppurin yksityiskohdat, pokaalin laatta)
- `src/shafts.js` – valonsäteet sälekaihtimien raoista
- `src/dust.js` – auringonsäteessä leijuva pöly
- `blender/build_room.py`, `blender/build_props.py` – huone, kalusteet ja erikoisesineet Blender-skripteinä

**Kuvat**
- `public/characters/` – henkilökuvat (Kalevi, Pirjo, pelaaja)
- `public/comic/collage.jpg` – prologin taustakollaasi

## Mobiili ja testauskytkimet

Puhelimella peli käyttää automaattisesti kevyempää renderöintiä (`src/quality.js`). Osoitteen perään voi lisätä:

| Kytkin | Mitä tekee |
|---|---|
| `?debug` | näyttää diagnoosirivin: näytönohjain, laatuprofiili ja virheet |
| `?quality=low` / `?quality=high` | pakottaa kevyen tai täyden renderöinnin |
| `?target=8` | pakottaa 8-bittisen puskurin (simuloi laitetta ilman liukulukupuskuria) |

## Ohjaus

Alapalkin napit, ruudun reunojen nuolet tai nuolinäppäimet ← →. Esinettä klikkaamalla se avautuu
lähikuvaan (vedä pyörittääksesi, Esc sulkee). P tai Tauko-nappi pysäyttää pelin.

Valmiiden mallien alkuperäiset tiedostot ladataan kansioon `assets-src/` (ei versionhallinnassa);
repoon tallennetaan vain pakatut versiot.
