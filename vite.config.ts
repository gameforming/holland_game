import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths keep the project deployable from a GitHub Pages subpath.
  base: './',
});
