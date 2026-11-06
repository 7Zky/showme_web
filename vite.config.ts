import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: '/showme_web/',
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
});
