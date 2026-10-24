// Valonsäteet: sälekaihtimien raoista huoneeseen siivilöityvä aurinko piirretään
// ohuina, läpikuultavina valolevyinä. Jokainen lamellien väli saa oman levyn, joka
// lähtee ikkunasta ja jatkuu auringon suuntaan lattiaan asti. Levyt piirretään
// lisäävällä sekoituksella, joten ne vain kirkastavat kuvaa.
//
// Kevyt: noin 30 nelikulmiota ja yksi varjostin. Ei liikettä, joten huonetta ei
// tarvitse piirtää uudelleen säteiden takia.
import * as THREE from 'three';

const SLAT_STEP = 0.042;   // lamellien väli (blender/build_room.py)
const SLAT_TOP = 0.07;     // ensimmäinen lamelli valanssin alapuolella

export function createShafts({ window: win, sunDir }) {
  // lamellien väliset raot (keskikohdan y)
  const gaps = [];
  const top = win.y1 - 0.02;
  let y = top - SLAT_TOP;
  let prev = top - 0.04;
  while (y > win.y0 + 0.03) {
    gaps.push((prev + y) / 2);
    prev = y;
    y -= SLAT_STEP;
  }
  const n = gaps.length;

  // 4 kärkeä ja 2 kolmiota per rako; sijainnit lasketaan update()-kutsussa
  const positions = new Float32Array(n * 4 * 3);
  const uvs = new Float32Array(n * 4 * 2);
  const seeds = new Float32Array(n * 4);
  const rows = new Float32Array(n * 4);
  const index = [];
  for (let i = 0; i < n; i++) {
    const seed = (i * 0.618) % 1;
    for (let k = 0; k < 4; k++) {
      uvs[(i * 4 + k) * 2] = k % 2;                  // u: ikkunan leveys
      uvs[(i * 4 + k) * 2 + 1] = k < 2 ? 0 : 1;      // v: matka ikkunasta
      seeds[i * 4 + k] = seed;
      rows[i * 4 + k] = i / (n - 1);                 // 0 = ylin rako, 1 = alin
    }
    const b = i * 4;
    index.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('row', new THREE.BufferAttribute(rows, 1));
  geometry.setIndex(index);

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color(1.0, 0.82, 0.58) },
      uIntensity: { value: 0.03 },
    },
    vertexShader: /* glsl */ `
      attribute float seed;
      attribute float row;
      varying vec2 vUv;
      varying float vSeed;
      varying float vFacing;
      varying float vRow;
      varying float vDist;
      void main() {
        vUv = uv;
        vSeed = seed;
        vRow = row;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDist = -mv.z;
        // levy näkyy sitä heikommin, mitä enemmän sitä katsotaan syrjästä
        vec3 nrm = normalize(normalMatrix * normal);
        vFacing = abs(dot(normalize(-mv.xyz), nrm));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec2 vUv;
      varying float vSeed;
      varying float vFacing;
      varying float vRow;
      varying float vDist;
      void main() {
        // syttyy pehmeästi heti ikkunan jälkeen, himmenee matkan mukana
        float along = smoothstep(0.0, 0.08, vUv.y) * pow(1.0 - vUv.y, 2.6);
        // kameran vieressä kulkevat levyt eivät saa sumentaa koko kuvaa
        float near = smoothstep(0.3, 1.3, vDist);
        // joka toinen rako kirkkaampi: säteet erottuvat raitoina eivätkä sula usvaksi
        float stripe = 0.3 + 0.7 * step(0.5, fract(vRow * 15.0 + 0.25));
        // ylimmät ja alimmat raot himmeämpiä, jotta säteen reunat eivät ole terävät
        float rows = smoothstep(0.0, 0.25, vRow) * smoothstep(1.0, 0.7, vRow);
        float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
        // ikkunan välipuite jakaa säteen kahtia
        float mullion = 1.0 - 0.8 * smoothstep(0.03, 0.0, abs(vUv.x - 0.5) - 0.02);
        // pientä epätasaisuutta, ettei näytä liian puhtaalta
        float ripple = 0.85 + 0.15 * sin(vUv.x * 23.0 + vSeed * 40.0) * sin(vUv.y * 17.0 + vSeed * 9.0);
        float a = along * edge * mullion * ripple * rows * stripe * near * (0.25 + 0.75 * vFacing) * (0.8 + 0.4 * vSeed);
        gl_FragColor = vec4(uColor * uIntensity * a, 1.0);
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'light_shafts';
  mesh.frustumCulled = false;
  mesh.raycast = () => {};   // ei klikattava eikä estä esineiden valintaa
  mesh.renderOrder = 10;     // muiden läpinäkyvien (lasi) jälkeen

  const x0 = win.x0 + 0.03, x1 = win.x1 - 0.03;
  const dir = new THREE.Vector3();
  const p = new THREE.Vector3();

  // Laskee levyjen kärjet auringon suunnan mukaan. Kutsutaan, kun aurinko liikkuu.
  function update(sun) {
    dir.copy(sun).normalize().negate();   // valon kulkusuunta huoneeseen
    gaps.forEach((gy, i) => {
      // matka lattiaan (y = 0.02) tätä suuntaa pitkin
      const len = Math.min((gy - 0.02) / Math.max(0.05, -dir.y), 6);
      const b = i * 4 * 3;
      [[x0, 0], [x1, 0], [x0, len], [x1, len]].forEach(([x, t], k) => {
        p.set(x, gy, win.z + 0.02).addScaledVector(dir, t);
        positions[b + k * 3] = p.x;
        positions[b + k * 3 + 1] = p.y;
        positions[b + k * 3 + 2] = p.z;
      });
    });
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }
  update(sunDir);

  mesh.userData.update = update;
  mesh.userData.setColor = (color, intensity) => {
    material.uniforms.uColor.value.copy(color);
    material.uniforms.uIntensity.value = intensity;
  };
  return mesh;
}
