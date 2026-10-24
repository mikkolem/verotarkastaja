# Laatikko B

Realistinen yhden huoneen pakohuonepeli selaimessa (three.js + Blender).
Pelin idea ja vaiheet: [PELISUUNNITELMA.md](PELISUUNNITELMA.md).

## Komennot

| Komento | Mitä tekee |
|---|---|
| `npm install` | asentaa riippuvuudet (kerran) |
| `npm run dev` | käynnistää pelin osoitteeseen http://localhost:5173 |
| `npm run model` | rakentaa huoneen ja erikoisesineet Blenderillä → `public/models/room.glb`, `custom_props.glb` |
| `npm run models` | pakkaa valmiit mallit kansiosta `assets-src/` → `public/models/` |
| `npm run build` | tekee julkaistavan version kansioon `dist/` |

## Rakenne

- `blender/build_room.py` – huoneen geometria Blender-skriptinä (seinät, ikkuna, sälekaihtimet, ovi, kalusteiden paikkamerkit)
- `blender/build_props.py` – pelin omat esineet: puhelinvastaaja, kassakaappi, mapit, silppuri, roskakori
- `src/main.js` – renderöinti, valot, varjot ja jälkikäsittely
- `src/materials.js`, `src/textures.js` – materiaalit ja koodilla piirretyt tekstuurit (puu, parketti, maali, nahka)
- `src/views.js` – kiinteät kuvakulmat ja niiden välinen siirtymä
- `src/props.js` – valmiit 3D-mallit (Poly Haven, CC0) ja niiden paikat huoneessa
- `src/paper.js` – paperit ja tekstit: kuitit, muistilaput, diplomi, mökkikuva, ALV-juliste, mappien selkämykset
- `src/items.js` – klikattavien esineiden nimet ja kuvaukset
- `src/interact.js` – korostus hiiren alla ja esineen tarkastelu lähikuvassa
- `src/dust.js` – auringonsäteessä leijuvat pölyhiukkaset

Ohjaus: alapalkin napit, ruudun reunojen nuolet tai nuolinäppäimet ← →. Esinettä klikkaamalla se avautuu lähikuvaan (vedä pyörittääksesi, Esc sulkee).

Valmiiden mallien alkuperäiset tiedostot ladataan kansioon `assets-src/` (ei versionhallinnassa); repoon tallennetaan vain pakatut versiot.
