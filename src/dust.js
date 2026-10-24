// Pölyhiukkaset, jotka leijuvat ilmassa ja hehkuvat vain auringonsäteen sisällä.
import * as THREE from 'three';

export function createDust({ count = 900, box, sunDir, window: win }) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = THREE.MathUtils.lerp(box.min.x, box.max.x, Math.random());
    positions[i * 3 + 1] = THREE.MathUtils.lerp(box.min.y, box.max.y, Math.random());
    positions[i * 3 + 2] = THREE.MathUtils.lerp(box.min.z, box.max.z, Math.random());
    seeds[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSunDir: { value: sunDir.clone().normalize() },
      // ikkuna-aukko: x0, x1, y0, y1 ja seinän z
      uWindow: { value: new THREE.Vector4(win.x0, win.x1, win.y0, win.y1) },
      uWindowZ: { value: win.z },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: /* glsl */ `
      attribute float seed;
      uniform float uTime, uWindowZ, uPixelRatio;
      uniform vec3 uSunDir;
      uniform vec4 uWindow;
      varying float vLight;
      void main() {
        vec3 p = position;
        float t = uTime * (0.02 + seed * 0.03);
        p += vec3(sin(t * 3.1 + seed * 40.0), sin(t * 2.3 + seed * 17.0) * 0.6 - t * 0.2 * seed, cos(t * 2.7 + seed * 9.0)) * 0.15;
        // Osuuko hiukkasesta aurinkoa kohti lähtevä säde ikkuna-aukkoon?
        float k = (uWindowZ - p.z) / uSunDir.z;
        vec2 hit = p.xy + uSunDir.xy * k;
        float inside = step(uWindow.x, hit.x) * step(hit.x, uWindow.y) * step(uWindow.z, hit.y) * step(hit.y, uWindow.w);
        // Pöly piirretään valmiin kuvan päälle ilman syvyystietoa, joten
        // työpöydän sisään jäävät hiukkaset piilotetaan tässä erikseen.
        float inDesk = step(-0.32, p.x) * step(p.x, 1.52) * step(p.y, 0.8) * step(-1.07, p.z) * step(p.z, -0.13);
        float twinkle = 0.6 + 0.4 * sin(uTime * (1.0 + seed * 2.0) + seed * 30.0);
        vLight = mix(0.003, 0.18, inside * step(0.0, k)) * twinkle * (1.0 - inDesk);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        // kameran lähellä olevat hiukkaset eivät saa kasvaa isoiksi palloiksi
        gl_PointSize = min((2.0 + seed * 3.0) * uPixelRatio * (1.0 / -mv.z), 4.0 * uPixelRatio);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vLight;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        vec3 linear = vec3(1.0, 0.9, 0.75) * vLight * a * 1.6;
        // Piirretään suoraan valmiin (sRGB-muotoisen) kuvan päälle, joten
        // muunnos tehdään tässä itse eikä jälkikäsittelyssä.
        gl_FragColor = vec4(pow(min(linear, vec3(1.0)), vec3(1.0 / 2.2)), 1.0);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.userData.update = (time) => { material.uniforms.uTime.value = time; };
  return points;
}
