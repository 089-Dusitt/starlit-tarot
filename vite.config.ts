import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
export default defineConfig({plugins:[react(),tailwind()],base:process.env.VITE_BASE_PATH||'/',test:{maxWorkers:1,fileParallelism:false,environment:'jsdom',setupFiles:['./src/test-setup.ts'],restoreMocks:true},build:{rollupOptions:{output:{manualChunks:{react:['react','react-dom','react-router-dom'],motion:['framer-motion']}}}}});

