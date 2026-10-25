// Proseduraaliset tekstuurit: puu, parketti, maali ja nahka piirretään
// canvakselle kohinafunktioilla, joten erillisiä kuvatiedostoja ei tarvita.
// Kaikki tekstuurit ovat saumattomia (toistuvat ilman näkyvää rajaa).
import * as THREE from 'three';

// Kokonaislukuhajautus (nopeampi kuin sin-pohjainen), palauttaa 0..1.
function hash(ix, iy, seed) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Jaksollinen arvokohina: fu ja fv ovat kokonaislukuja, joten kuvio jatkuu saumatta.
function noise(u, v, fu, fv, seed) {
  const x = u * fu, y = v * fv;
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const x0 = ((ix % fu) + fu) % fu, x1 = (x0 + 1) % fu;
  const y0 = ((iy % fv) + fv) % fv, y1 = (y0 + 1) % fv;
  const a = hash(x0, y0, seed), b = hash(x1, y0, seed);
  const c = hash(x0, y1, seed), d = hash(x1, y1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

function fbm(u, v, fu, fv, octaves, seed) {
  let sum = 0, amp = 0.5, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(u, v, fu << i, fv << i, seed + i * 13);
    norm += amp;
    amp *= 0.5;
  }
  return sum / norm;
}

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function hexToRgb(hex) {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}

// Piirtää pikseli kerrallaan: fn(u, v) palauttaa { color: [r,g,b], height: 0..1 }.
function paint(size, fn) {
  const color = document.createElement('canvas');
  const height = document.createElement('canvas');
  color.width = color.height = height.width = height.height = size;
  const cctx = color.getContext('2d'), hctx = height.getContext('2d');
  const cimg = cctx.createImageData(size, size), himg = hctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const { color: c, height: h } = fn(x / size, y / size);
      const i = (y * size + x) * 4;
      cimg.data[i] = c[0]; cimg.data[i + 1] = c[1]; cimg.data[i + 2] = c[2]; cimg.data[i + 3] = 255;
      const hv = Math.max(0, Math.min(255, h * 255));
      himg.data[i] = himg.data[i + 1] = himg.data[i + 2] = hv; himg.data[i + 3] = 255;
    }
  }
  cctx.putImageData(cimg, 0, 0);
  hctx.putImageData(himg, 0, 0);
  return { color, height };
}

function toTextures({ color, height }, metersPerTile, anisotropy) {
  const make = (canvas, srgb) => {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / metersPerTile, 1 / metersPerTile);
    t.anisotropy = anisotropy;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  return { map: make(color, true), bump: make(height, false) };
}

// Pystysuuntainen puunsyy (paneelit, huonekalut).
export function woodTexture({ light, dark, seed = 1, size = 1024, meters = 1 }, anisotropy) {
  const L = hexToRgb(light), Dk = hexToRgb(dark);
  return toTextures(paint(size, (u, v) => {
    const warp = fbm(u, v, 3, 2, 3, seed) * 0.15;
    const streak = fbm(u + warp, v, 48, 2, 4, seed + 5);
    const fiber = fbm(u, v, 512, 8, 2, seed + 9);
    const t = Math.pow(streak, 1.6) * 0.85 + fiber * 0.15;
    return { color: mix(Dk, L, t), height: 0.5 + (streak - 0.5) * 0.6 + (fiber - 0.5) * 0.3 };
  }), meters, anisotropy);
}

// Tammiparketti: lankut x-suunnassa, jokaisella oma sävy ja syykuvio.
export function parquetTexture(anisotropy, { size = 1536, meters = 2, seed = 3 } = {}) {
  const rows = Math.round(meters / 0.14);              // lankun leveys noin 14 cm
  const L = hexToRgb(0xc29463), Dk = hexToRgb(0x6e4526);
  const rowStarts = [];
  for (let r = 0; r < rows; r++) {
    // lankun saumojen paikat riveittäin (u-koordinaatteina, jaksollisesti)
    const n = 2 + Math.floor(hash(r, 1, seed) * 2);
    const offs = hash(r, 2, seed);
    rowStarts.push(Array.from({ length: n }, (_, i) => (offs + i / n + hash(r, i + 10, seed) * 0.12) % 1).sort());
  }
  return toTextures(paint(size, (u, v) => {
    const r = Math.min(rows - 1, Math.floor(v * rows));
    const fv = v * rows - r;
    const starts = rowStarts[r];
    let plank = starts.length - 1;
    for (let i = 0; i < starts.length; i++) if (u >= starts[i]) plank = i;
    const id = r * 7 + plank;
    const tone = hash(id, 3, seed);
    const grain = fbm((u + hash(id, 4, seed)) % 1, v, 4, rows * 6, 4, seed + id % 5);
    const fiber = fbm(u, v, 16, 512, 2, seed + 2);
    let t = 0.25 + tone * 0.45 + (grain - 0.5) * 0.7 + (fiber - 0.5) * 0.15;
    // saumat: pitkittäiset rivien väliin ja poikittaiset lankkujen päihin
    let du = 1;
    for (const s of starts) du = Math.min(du, Math.abs(u - s), Math.abs(u - s + 1), Math.abs(u - s - 1));
    const seam = Math.min(fv, 1 - fv) * meters / rows < 0.0012 || du * meters < 0.0012;
    t = Math.max(0, Math.min(1, t));
    const c = mix(Dk, L, t);
    return seam ? { color: c.map((x) => x * 0.35), height: 0.1 } : { color: c, height: 0.55 + (grain - 0.5) * 0.2 };
  }), meters, anisotropy);
}

// Tasainen, hieman laikukas pinta: maali, nahka, katto.
export function mottledTexture({ base, variance = 0.06, seed = 7, size = 1024, meters = 2, freq = 8 }, anisotropy) {
  const B = hexToRgb(base);
  return toTextures(paint(size, (u, v) => {
    const n = fbm(u, v, freq, freq, 5, seed);
    const fine = noise(u, v, 256, 256, seed + 1);
    const k = 1 + (n - 0.5) * variance * 2 + (fine - 0.5) * variance * 0.5;
    return { color: B.map((x) => Math.min(255, x * k)), height: 0.5 + (n - 0.5) * 0.4 + (fine - 0.5) * 0.4 };
  }), meters, anisotropy);
}

// Taivas ja kaukainen kaupunkisiluetti ikkunan taakse.
export function skyTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, '#8fb4e6');
  grad.addColorStop(0.55, '#d9e6f2');
  grad.addColorStop(1, '#f6eedf');
  g.fillStyle = grad;
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = 'rgba(160, 172, 190, 0.55)';
  let x = 0, i = 0;
  while (x < c.width) {
    const w = 30 + hash(i, 1, 9) * 70, h = 60 + hash(i, 2, 9) * 160;
    g.fillRect(x, c.height - h, w, h);
    x += w + hash(i, 3, 9) * 12;
    i++;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Harjattu teräs: vaakasuuntaiset hiusnaarmut ja hento laikukkuus (kassakaappi, silppurin terät).
export function brushedTexture({ base = 0x4a4d52, seed = 21, size = 512, meters = 0.6 } = {}, anisotropy) {
  const B = hexToRgb(base);
  return toTextures(paint(size, (u, v) => {
    const streak = noise(u * 2, v * 900, 1, 1, seed) * 0.6 + noise(u * 6, v * 300, 1, 1, seed + 3) * 0.4;
    const blotch = fbm(u, v, 6, 6, 4, seed + 7);
    const scratch = noise(u * 400, v * 400, 1, 1, seed + 11) > 0.985 ? 0.25 : 0;
    const k = 0.82 + (streak - 0.5) * 0.25 + (blotch - 0.5) * 0.16 + scratch;
    return { color: B.map((x) => Math.min(255, x * k)), height: 0.5 + (streak - 0.5) * 0.5 + scratch };
  }), meters, anisotropy);
}

// Hienojakoinen muovipinta: pieni rakeisuus ja sormenjälkimäiset tummemmat läikät.
export function plasticTexture({ base = 0x55575a, seed = 31, size = 512, meters = 0.4 } = {}, anisotropy) {
  const B = hexToRgb(base);
  return toTextures(paint(size, (u, v) => {
    const grain = noise(u, v, 400, 400, seed);
    const smudge = fbm(u, v, 5, 5, 3, seed + 2);
    const k = 0.9 + (grain - 0.5) * 0.12 + (smudge - 0.5) * 0.14;
    return { color: B.map((x) => Math.min(255, x * k)), height: 0.5 + (grain - 0.5) * 0.6 };
  }), meters, anisotropy);
}
