// Kiinteät kuvakulmat ja pehmeä siirtymä niiden välillä.
// Hiiri kääntää katsetta hieman, jotta kuva tuntuu elävältä.
import * as THREE from 'three';

// Järjestys myötäpäivään ylhäältä katsottuna, jotta oikea nuoli kääntää
// katsetta oikealle ja vasen vasemmalle.
export const VIEWS = [
  { id: 'desk', name: 'Työpöytä', pos: [0.6, 1.6, 0.95], target: [0.6, 0.85, -0.75] },
  { id: 'window', name: 'Ikkuna', pos: [-0.9, 1.5, 0.9], target: [1.3, 1.1, -2.0] },
  { id: 'door', name: 'Ovi', pos: [1.0, 1.55, -0.9], target: [-0.9, 1.15, 2.0] },
  { id: 'shelf', name: 'Kirjahylly', pos: [0.7, 1.5, 0.25], target: [-2.4, 1.15, 0.0] },
];

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class ViewController {
  constructor(camera, onChange) {
    this.camera = camera;
    this.onChange = onChange;
    this.index = 0;
    this.pos = new THREE.Vector3(...VIEWS[0].pos);
    this.target = new THREE.Vector3(...VIEWS[0].target);
    this.from = { pos: this.pos.clone(), target: this.target.clone() };
    this.progress = 1;
    this.mouse = new THREE.Vector2();
    this.look = new THREE.Vector2();

    window.addEventListener('pointermove', (e) => {
      this.mouse.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.go(this.index + 1);
      if (e.key === 'ArrowLeft') this.go(this.index - 1);
    });
  }

  go(i) {
    const n = VIEWS.length;
    i = ((i % n) + n) % n;
    if (i === this.index && this.progress >= 1) return;
    this.from = { pos: this.pos.clone(), target: this.target.clone() };
    this.index = i;
    this.progress = 0;
    this.onChange?.(i);
  }

  // Onko kamera liikkeessä (siirtymä kesken tai katse vielä seuraa hiirtä)?
  get moving() {
    return this.progress < 1 || this.look.distanceTo(this.mouse) > 0.002;
  }

  update(dt) {
    // Kehitystyön apu: kamera pakotettuun paikkaan (ks. window.__debug.peek)
    if (this.override) {
      this.camera.position.set(...this.override.pos);
      this.camera.lookAt(...this.override.target);
      return;
    }
    const view = VIEWS[this.index];
    this.progress = Math.min(1, this.progress + dt / 1.4);
    const k = ease(this.progress);
    this.pos.lerpVectors(this.from.pos, new THREE.Vector3(...view.pos), k);
    this.target.lerpVectors(this.from.target, new THREE.Vector3(...view.target), k);

    // katseen pieni seuranta hiiren mukaan (pehmennettynä)
    this.look.lerp(this.mouse, 1 - Math.exp(-dt * 3));
    this.camera.position.copy(this.pos);
    const dir = this.target.clone().sub(this.pos);
    const right = new THREE.Vector3().crossVectors(dir, this.camera.up).normalize();
    const dist = dir.length();
    const lookAt = this.target.clone()
      .addScaledVector(right, this.look.x * dist * 0.06)
      .addScaledVector(this.camera.up, -this.look.y * dist * 0.04);
    this.camera.lookAt(lookAt);
  }
}
