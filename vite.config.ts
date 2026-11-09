import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: '/showme_web/',
  plugins: [react()], assetsInclude: ['**/*.glb'],
  build: {
    manifest: true,
    rollupOptions: { output: { manualChunks(id) {
      if (!id.includes('node_modules')) return;
      if (id.includes('/three/')) return 'three';
      if (id.includes('/gsap/')) return 'motion';
      if (/\/(react|react-dom|scheduler)\//.test(id)) return 'react';
    } } },
  },
});
