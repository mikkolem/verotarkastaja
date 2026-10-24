// Pakkaa kaikki kansion assets-src/<malli>/ glTF-mallit tiedostoiksi
// public/models/<malli>.glb (meshopt-geometria, WebP-tekstuurit).
// Aja projektin juuresta:  npm run models
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'assets-src';
const OUT = 'public/models';

for (const name of readdirSync(SRC).sort()) {
  const dir = join(SRC, name);
  if (!statSync(dir).isDirectory()) continue;
  const gltf = readdirSync(dir).find((f) => f.endsWith('.gltf'));
  if (!gltf) continue;
  const out = join(OUT, `${name}.glb`);
  execFileSync('npx', [
    'gltf-transform', 'optimize', join(dir, gltf), out,
    '--compress', 'meshopt', '--texture-compress', 'webp', '--texture-size', '1024',
  ], { stdio: 'ignore' });
  console.log(`${name.padEnd(28)} ${(statSync(out).size / 1024).toFixed(0).padStart(5)} kt`);
}
