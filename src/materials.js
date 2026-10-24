// Korvaa Blenderistä tulevat materiaalit nimen perusteella realistisemmilla.
import * as THREE from 'three';
import { mottledTexture, parquetTexture, woodTexture } from './textures.js';

// Antaa selaimelle välissä mahdollisuuden piirtää latausnäkymä uudelleen.
// setTimeout varmistaa etenemisen myös taustavälilehdessä, jossa
// requestAnimationFrame ei käy.
const nextFrame = () => new Promise((resolve) => {
  requestAnimationFrame(() => resolve());
  setTimeout(resolve, 50);
});

// Tekstuurit lasketaan yksi kerrallaan, ja onProgress(0..1) kertoo etenemisen.
export async function createMaterials(anisotropy, onProgress = () => {}) {
  const jobs = {
    walnut: () => woodTexture({ light: 0x6b4128, dark: 0x2a160b, seed: 2 }, anisotropy),
    mahogany: () => woodTexture({ light: 0x7a3420, dark: 0x2e0f07, seed: 11, meters: 1.2 }, anisotropy),
    parquet: () => parquetTexture(anisotropy),
    wall: () => mottledTexture({ base: 0x3f5243, variance: 0.05, seed: 4 }, anisotropy),
    ceiling: () => mottledTexture({ base: 0xd2ccbf, variance: 0.03, seed: 8 }, anisotropy),
    leather: () => mottledTexture({ base: 0x4a2414, variance: 0.12, seed: 5, meters: 0.5, freq: 16 }, anisotropy),
  };
  const tex = {};
  const names = Object.keys(jobs);
  for (const [i, name] of names.entries()) {
    await nextFrame();
    tex[name] = jobs[name]();
    onProgress((i + 1) / names.length);
  }
  const { walnut, mahogany, parquet, wall, ceiling, leather } = tex;

  return {
    wall_paint: new THREE.MeshStandardMaterial({
      map: wall.map, bumpMap: wall.bump, bumpScale: 0.6, roughness: 0.9,
    }),
    wood_panel: new THREE.MeshStandardMaterial({
      map: walnut.map, bumpMap: walnut.bump, bumpScale: 0.8, roughness: 0.45,
    }),
    desk_wood: new THREE.MeshPhysicalMaterial({
      map: mahogany.map, bumpMap: mahogany.bump, bumpScale: 0.4, roughness: 0.4,
      clearcoat: 0.7, clearcoatRoughness: 0.12,
    }),
    floor_parquet: new THREE.MeshPhysicalMaterial({
      map: parquet.map, bumpMap: parquet.bump, bumpScale: 1.5, roughness: 0.6,
      clearcoat: 0.1, clearcoatRoughness: 0.3,
    }),
    ceiling: new THREE.MeshStandardMaterial({
      map: ceiling.map, bumpMap: ceiling.bump, bumpScale: 0.3, roughness: 0.95,
    }),
    window_frame: new THREE.MeshStandardMaterial({ color: 0xe9e6de, roughness: 0.5 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xffffff, roughness: 0.02, transparent: true, opacity: 0.1, depthWrite: false,
    }),
    blind: new THREE.MeshStandardMaterial({
      color: 0xe6dfcf, roughness: 0.5, metalness: 0.15, side: THREE.DoubleSide,
    }),
    brass: new THREE.MeshStandardMaterial({ color: 0xc9a063, roughness: 0.28, metalness: 1 }),
    leather: new THREE.MeshPhysicalMaterial({
      map: leather.map, bumpMap: leather.bump, bumpScale: 1.2, roughness: 0.55,
      sheen: 0.3, sheenColor: new THREE.Color(0x8a5a40),
    }),
    terracotta: new THREE.MeshStandardMaterial({ color: 0xa4593a, roughness: 0.85 }),

    drawer_inner: new THREE.MeshStandardMaterial({ color: 0x9a7650, roughness: 0.75 }),

    // erikoisesineet (blender/build_props.py)
    plastic_black: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.35 }),
    plastic_grey: new THREE.MeshStandardMaterial({ color: 0x55575a, roughness: 0.5 }),
    led_red: new THREE.MeshStandardMaterial({
      color: 0x330000, emissive: 0xff2010, emissiveIntensity: 4, roughness: 0.3,
    }),
    steel_dark: new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.45, metalness: 0.9 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xd8d8d8, roughness: 0.15, metalness: 1 }),
    binder_blue: new THREE.MeshStandardMaterial({ color: 0x1d3466, roughness: 0.55 }),
    binder_red: new THREE.MeshStandardMaterial({ color: 0x7a1410, roughness: 0.55 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: 0.9 }),
  };
}
