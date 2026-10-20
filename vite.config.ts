import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { SITE } from './src/config';
import { th } from './src/i18n/th';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const url = (process.env.VITE_SITE_URL || env.VITE_SITE_URL || '').replace(/\/$/, '');
  const base = process.env.VITE_BASE_PATH || env.VITE_BASE_PATH || '/';
  const escape = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  return {
    plugins: [
      react(),
      tailwind(),
      {
        name: 'starlit-metadata',
        transformIndexHtml(html: string) {
          return html
            .replaceAll(
              '__SITE_TITLE__',
              escape(`${SITE.name} · ${SITE.thaiName} | ${th.seo.titleSuffix}`),
            )
            .replaceAll('__SITE_DESCRIPTION__', escape(th.seo.description))
            .replaceAll('__SITE_URL__', escape(url || base))
            .replaceAll(
              '__SOCIAL_IMAGE__',
              escape(url ? `${url}/social.png` : `${base}social.png`),
            );
        },
      },
    ],
    base,
    test: {
      maxWorkers: 1,
      fileParallelism: false,
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
      restoreMocks: true,
    },
    build: {
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
          },
        },
      },
    },
  };
});
