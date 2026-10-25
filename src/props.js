// Valmiit 3D-mallit (Poly Haven, CC0-lisenssi) ja niiden paikat huoneessa.
// Sijainnit metreinä huoneen koordinaatistossa, kierto y-akselin ympäri radiaaneina.
// Sama malli voi esiintyä useaan kertaan (esim. kirjat), se ladataan silti vain kerran.
// Mallit pakataan kansiosta assets-src komennolla `npm run models`.
const PI = Math.PI;
const DESK_TOP = 0.782;          // nahkasuojuksen pinta työpöydällä
const SHELF_X = -2.3;            // kirjahyllyn keskikohta syvyyssuunnassa
const shelf = (i) => 0.1 + i * (2.11 / 5) + 0.015;   // hyllytason yläpinta (vastaa build_room.py:tä)

export const PROPS = [
  // --- kalusteet ---
  { name: 'chair', url: 'modern_arm_chair_01', position: [0.15, 0, -1.4], rotationY: -0.3 },
  { name: 'sofa', url: 'sofa_02', position: [1.99, 0, 0.6], rotationY: -PI / 2 },
  { name: 'plant', url: 'potted_plant_02', position: [2.0, 0, -1.5], rotationY: 0.6 },

  // --- seinät ---
  // "Vuoden veronmaksaja 1998" sohvan yläpuolella (diplomin teksti: paper.js)
  // kehys roikkuu hieman vinossa: hiljainen vihje siitä, että sitä on nosteltu (todiste 5 takana)
  { name: 'diploma', url: 'fancy_picture_frame_01', position: [2.5, 1.55, 0.65], rotationY: -PI / 2, rotationZ: 0.035 },
  // kello ikkunan vasemmalla puolella, näkyy sekä työpöydän että ikkunan suunnasta
  { name: 'clock', url: 'wall_clock', position: [-1.3, 1.8, -2.0] },

  // --- kirjahylly ---
  // Kirjasarja on 0,53 m pitkä ja kiertyy hyllyn suuntaiseksi (alkaa annetusta
  // z:sta ja jatkuu negatiiviseen suuntaan). Lokerot: z -1…0 ja 0…1.
  { name: 'books1', url: 'book_encyclopedia_set_01', position: [SHELF_X, shelf(1), -0.4], rotationY: PI / 2 },
  { name: 'books2', url: 'book_encyclopedia_set_01', position: [SHELF_X, shelf(2), 0.95], rotationY: PI / 2 },
  { name: 'books3', url: 'book_encyclopedia_set_01', position: [SHELF_X, shelf(3), -0.05], rotationY: PI / 2 },
  { name: 'books4', url: 'book_encyclopedia_set_01', position: [SHELF_X, shelf(4), 0.6], rotationY: PI / 2 },
  { name: 'books5', url: 'book_encyclopedia_set_01', position: [SHELF_X, 0.1, 0.75], rotationY: PI / 2 },

  // --- työpöytä ---
  // lampun varsi kurottaa pöydän yli (valo syttyy main.js:ssä lampun kuvun kohdalle)
  { name: 'lamp', url: 'desk_lamp_arm_01', position: [-0.12, DESK_TOP + 0.088, -0.92], rotationY: 0.5 + PI },
  { name: 'laptop', url: 'classic_laptop', position: [0.95, DESK_TOP, -0.72], rotationY: PI, scale: 0.55 },
  { name: 'photo', url: 'standing_picture_frame_01', position: [1.38, DESK_TOP, -0.95], rotationY: 2.4 },
  { name: 'stapler', url: 'vintage_stapler', position: [1.3, DESK_TOP + 0.013, -0.24], rotationY: 0.4 },
  { name: 'glasses', url: 'round_spectacles', position: [0.6, DESK_TOP + 0.023, -0.35], rotationY: -0.6 },

  // --- Poly Havenin pikari pokaalina ja tyyny sohvalle (laatta ja tarkka paikka: decor.js) ---
  // pikarisarjassa on kolme maljaa; vain ensimmäinen näytetään, muut piilotetaan latauksessa
  { name: 'trophy', url: 'brass_goblets', position: [-2.3, shelf(3) - 0.004, 0.55 - 0.12], rotationY: PI / 2, scale: 0.95 },
  { name: 'pillow', url: 'throw_pillows_01', position: [1.9, 0.45, 0.9], rotationY: -PI / 2, scale: 0.55 },

  // --- sivupöytä oven vieressä ---
  { name: 'binder', url: 'binder_notebook', position: [0.9, 0.85 + 0.002, 1.72], rotationY: 0.2 },
].map((p) => ({ ...p, url: `models/${p.url}.glb` }));
