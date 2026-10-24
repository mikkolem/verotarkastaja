import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';

import { createMaterials } from './materials.js';
import { createDust } from './dust.js';
import { skyTexture } from './textures.js';
import { VIEWS, ViewController } from './views.js';
import { PROPS } from './props.js';
import './style.css';

// Ikkuna-aukko (vastaa blender/build_room.py:n mittoja)
const WINDOW = { x0: -0.2, x1: 1.4, y0: 0.9, y1: 2.3, z: -2.0 };
// Suunta kohti aurinkoa: ylhäältä, ikkunan takaa ja hieman sivusta
const SUN_DIR = new THREE.Vector3(3, 4.5, -7).normalize();

// --- renderöijä ja kamera ---------------------------------------------------
// Tarkkuus: piirretään näytön CSS-pikseleinä myös retina-näytöllä, koska
// jälkikäsittely ja reunojen pehmennys tasoittavat kuvan joka tapauksessa.
// Laskee automaattisesti, jos kone ei jaksa (ks. silmukka).
let pixelRatio = Math.min(window.devicePixelRatio, 1);
const MIN_PIXEL_RATIO = 0.75;

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(pixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
// Huone ei liiku, joten varjot lasketaan vain kerran latauksen jälkeen.
renderer.shadowMap.autoUpdate = false;
renderer.toneMapping = THREE.AgXToneMapping;
renderer.toneMappingExposure = 1.1;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.05, 60);

// Kapealla (pysty)näytöllä levennetään näkökenttää, jotta vaakasuunnassa
// näkyy aina suunnilleen sama alue.
function fitCamera() {
  const aspect = innerWidth / innerHeight;
  const minHorizontal = THREE.MathUtils.degToRad(72);
  const vertical = 2 * Math.atan(Math.tan(minHorizontal / 2) / aspect);
  camera.fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(vertical), 55, 85);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
}
fitCamera();

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.06;

// --- valot --------------------------------------------------------------------
const sun = new THREE.DirectionalLight(0xfff0d8, 7);
sun.target.position.set(0.6, 0.8, -0.6);
sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -4.5, right: 4.5, top: 4.5, bottom: -4.5, near: 4, far: 22 });
sun.shadow.bias = -0.0002;
sun.shadow.normalBias = 0.012;
scene.add(sun, sun.target);

// Ikkunasta tuleva pehmeä taivaanvalo
RectAreaLightUniformsLib.init();
const skyLight = new THREE.RectAreaLight(0xcfe0ff, 3, WINDOW.x1 - WINDOW.x0, WINDOW.y1 - WINDOW.y0);
skyLight.position.set((WINDOW.x0 + WINDOW.x1) / 2, (WINDOW.y0 + WINDOW.y1) / 2, WINDOW.z + 0.05);
skyLight.lookAt(skyLight.position.x, skyLight.position.y, 0);
scene.add(skyLight);

// Auringon heijastus lattiasta ylöspäin (korvaa epäsuoraa valoa).
// Pinta-alavalo ei tee terävää kiiltopistettä kuten pistevalo.
const bounce = new THREE.RectAreaLight(0xffb27a, 0.3, 2.4, 2.0);
bounce.position.set(0.8, 0.05, -0.9);
bounce.lookAt(0.8, 2, -0.9);
scene.add(bounce);
scene.add(new THREE.HemisphereLight(0xc2d3ef, 0x4a3020, 0.35));

// Taivas ikkunan takana
const sky = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 20),
  new THREE.MeshBasicMaterial({ map: skyTexture(), color: new THREE.Color(2.4, 2.4, 2.4) }),
);
sky.position.set(0.6, 4, -9);
scene.add(sky);

// --- huone ---------------------------------------------------------------------
// Pöly on omassa näkymässään: se piirretään valmiin huonekuvan päälle, jolloin
// raskasta huonetta ei tarvitse piirtää uudelleen pelkän pölyn takia.
const dustScene = new THREE.Scene();
const dust = createDust({
  box: new THREE.Box3(new THREE.Vector3(-0.6, 0.2, -1.95), new THREE.Vector3(1.9, 2.5, 0.8)),
  sunDir: SUN_DIR,
  window: WINDOW,
});
dustScene.add(dust);

// Latauksen vaiheet ja niiden osuus edistymispalkista
const progress = { textures: 0, model: 0, compile: 0 };
const WEIGHTS = { textures: 0.7, model: 0.2, compile: 0.1 };
function showProgress(stage, value, label) {
  progress[stage] = value;
  const total = Object.keys(WEIGHTS).reduce((sum, k) => sum + WEIGHTS[k] * progress[k], 0);
  const pct = Math.round(total * 100);
  document.getElementById('loading-fill').style.width = `${pct}%`;
  document.getElementById('loading-pct').textContent = `${pct} %`;
  if (label) document.getElementById('loading-label').textContent = label;
}

let ready = false;

async function loadRoom() {
  // Mallit latautuvat verkosta samaan aikaan, kun tekstuureja lasketaan.
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const urls = ['models/room.glb', ...PROPS.map((p) => p.url)];
  const loaded = urls.map(() => 0);
  const modelPromises = urls.map((url, i) => loader.loadAsync(`${import.meta.env.BASE_URL}${url}`, (e) => {
    if (!e.total) return;
    loaded[i] = e.loaded / e.total;
    showProgress('model', loaded.reduce((a, b) => a + b, 0) / urls.length);
  }));
  showProgress('textures', 0, 'Lakataan puupintoja…');
  const materials = await createMaterials(renderer.capabilities.getMaxAnisotropy(), (p) => {
    showProgress('textures', p);
  });
  showProgress('textures', 1, 'Kannetaan huonekaluja…');
  const [room, ...props] = await Promise.all(modelPromises);
  showProgress('model', 1);

  room.scene.traverse((obj) => {
    if (!obj.isMesh) return;
    const replacement = materials[obj.material.name];
    if (replacement) obj.material = replacement;
    const isGlass = obj.material === materials.glass;
    obj.castShadow = !isGlass;
    obj.receiveShadow = !isGlass;
  });
  scene.add(room.scene);

  props.forEach((gltf, i) => {
    const { name, position, rotationY = 0 } = PROPS[i];
    gltf.scene.name = name;
    gltf.scene.position.set(...position);
    gltf.scene.rotation.y = rotationY;
    gltf.scene.traverse((obj) => {
      if (obj.isMesh) obj.castShadow = obj.receiveShadow = true;
    });
    scene.add(gltf.scene);
  });
  renderer.shadowMap.needsUpdate = true;

  // Varjostinohjelmat käännetään etukäteen, ettei ensimmäinen kuva nyi.
  showProgress('model', 1, 'Avataan sälekaihtimia…');
  await renderer.compileAsync(scene, camera);
  showProgress('compile', 1);

  ready = true;
  const loading = document.getElementById('loading');
  loading.classList.add('hidden');
  setTimeout(() => loading.remove(), 1000);
}
loadRoom();

// --- jälkikäsittely --------------------------------------------------------------
const target = new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, target);
composer.addPass(new RenderPass(scene, camera));
const gtao = new GTAOPass(scene, camera, innerWidth, innerHeight);
gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1, scale: 1.2, samples: 8 });
gtao.blendIntensity = 0.9;
composer.addPass(gtao);
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.15, 0.6, 1.4));
composer.addPass(new OutputPass());
// Kaikki välivaiheet samaan kokoon renderöijän tarkkuuden kanssa
composer.setPixelRatio(pixelRatio);
composer.setSize(innerWidth, innerHeight);
// Valmis huonekuva jää composerin puskuriin, josta se kopioidaan ruudulle
// joka kuvassa. Huone piirretään uudelleen vain, kun kamera liikkuu.
composer.renderToScreen = false;
// Kopio ei saa kirjoittaa syvyyttä, muuten se peittäisi pölyn kokonaan.
const copyQuad = new FullScreenQuad(new THREE.ShaderMaterial({
  ...CopyShader, uniforms: THREE.UniformsUtils.clone(CopyShader.uniforms), depthTest: false, depthWrite: false,
}));
let roomDirty = true;

// --- kuvakulmat ja käyttöliittymä ----------------------------------------------
const nav = document.getElementById('views');
const buttons = VIEWS.map((v, i) => {
  const b = document.createElement('button');
  b.textContent = v.name;
  b.addEventListener('click', () => views.go(i));
  nav.appendChild(b);
  return b;
});
const edgePrev = document.getElementById('edge-prev');
const edgeNext = document.getElementById('edge-next');
const viewName = (i) => VIEWS[(i + VIEWS.length) % VIEWS.length].name;
const setActive = (i) => {
  buttons.forEach((b, j) => b.classList.toggle('active', i === j));
  // reunanuolten alle sen suunnan nimi, johon nuoli kääntää
  edgePrev.querySelector('.edge-label').textContent = viewName(i - 1);
  edgeNext.querySelector('.edge-label').textContent = viewName(i + 1);
};
const views = new ViewController(camera, setActive);
setActive(0);
for (const [id, step] of [['prev', -1], ['next', 1], ['edge-prev', -1], ['edge-next', 1]]) {
  document.getElementById(id).addEventListener('click', () => views.go(views.index + step));
}

addEventListener('resize', () => {
  fitCamera();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  roomDirty = true;
});

if (import.meta.env.DEV) {
  window.__debug = {
    scene, camera, sun, bounce, skyLight, gtao, renderer, views,
    // peek([x,y,z], [x,y,z]) vie kameran haluttuun paikkaan, peek() palauttaa
    peek(pos, target) {
      views.override = pos ? { pos, target } : null;
      roomDirty = true;
    },
  };
}

// --- silmukka --------------------------------------------------------------------
// Kun kamera on paikallaan, vain pöly liikkuu, joten 30 kuvaa sekunnissa riittää.
const IDLE_INTERVAL = 1 / 30;
// Jos liikkeen aikana kuvia tulee alle noin 40 sekunnissa, tarkkuutta lasketaan.
const SLOW_FRAME = 1 / 40;
const clock = new THREE.Clock();
let sinceRender = 0;
let slowFrames = 0;

function lowerQuality() {
  if (pixelRatio <= MIN_PIXEL_RATIO) return;
  pixelRatio = Math.max(MIN_PIXEL_RATIO, pixelRatio - 0.25);
  renderer.setPixelRatio(pixelRatio);
  composer.setPixelRatio(pixelRatio);
  roomDirty = true;
}

function drawRoomAndDust() {
  if (roomDirty) {
    composer.render();
    roomDirty = false;
  }
  copyQuad.material.uniforms.tDiffuse.value = composer.readBuffer.texture;
  renderer.setRenderTarget(null);
  renderer.autoClear = false;
  copyQuad.render(renderer);
  renderer.clearDepth();
  renderer.render(dustScene, camera);
  renderer.autoClear = true;
}

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  if (!ready) return;   // latausnäkymä peittää ruudun, ei piirretä turhaan
  sinceRender += dt;
  const moving = views.moving;
  views.update(dt);
  if (!moving && sinceRender < IDLE_INTERVAL) return;

  if (moving) {
    slowFrames = sinceRender > SLOW_FRAME ? slowFrames + 1 : Math.max(0, slowFrames - 1);
    if (slowFrames > 30) {
      lowerQuality();
      slowFrames = 0;
    }
  }
  sinceRender = 0;
  if (moving) roomDirty = true;
  dust.userData.update(clock.elapsedTime);
  drawRoomAndDust();
});
