import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// For GitHub Pages project sites, build with: VITE_BASE=/repo-name/ npm run build
export default defineConfig({
  plugins: [vue()],
  base: process.env.VITE_BASE || './',
});
