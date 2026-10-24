import { defineConfig } from 'vite';

// Suhteelliset polut, jotta build toimii myös GitHub Pagesin alikansiossa.
export default defineConfig({
  base: './',
});
