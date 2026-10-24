# Laatikko B

Realistinen yhden huoneen pakohuonepeli selaimessa (three.js + Blender).
Pelin idea ja vaiheet: [PELISUUNNITELMA.md](PELISUUNNITELMA.md).

## Komennot

| Komento | Mitä tekee |
|---|---|
| `npm install` | asentaa riippuvuudet (kerran) |
| `npm run dev` | käynnistää pelin osoitteeseen http://localhost:5173 |
| `npm run model` | rakentaa huoneen Blenderillä → `public/models/room.glb` |
| `npm run build` | tekee julkaistavan version kansioon `dist/` |

## Rakenne

- `blender/build_room.py` – huoneen geometria Blender-skriptinä (seinät, ikkuna, sälekaihtimet, ovi, kalusteiden paikkamerkit)
- `src/main.js` – renderöinti, valot, varjot ja jälkikäsittely
- `src/materials.js`, `src/textures.js` – materiaalit ja koodilla piirretyt tekstuurit (puu, parketti, maali, nahka)
- `src/views.js` – kiinteät kuvakulmat ja niiden välinen siirtymä
- `src/dust.js` – auringonsäteessä leijuvat pölyhiukkaset

Ohjaus: alapalkin napit tai nuolinäppäimet ← →.
