import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { loadEnv } from 'vite';
import { SITE } from '../src/config';
import { identities } from '../src/data/cards/identities';
import { spreadsForTopic } from '../src/data/spreads';
import { topicIds } from '../src/data/topic-ids';
const env = loadEnv('production', process.cwd(), 'VITE_');
const raw = process.env.VITE_SITE_URL || env.VITE_SITE_URL || '';
const origin = raw.replace(/\/$/, '');
if (origin) {
  const url = new URL(origin);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw Error('VITE_SITE_URL must be a plain http(s) site URL');
}
const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
mkdirSync('public', { recursive: true });
writeFileSync(
  'public/robots.txt',
  `User-agent: *\nAllow: /\nDisallow: /history\nDisallow: /r/\n${origin ? `Sitemap: ${origin}/sitemap.xml` : ''}\n`,
);
const routes = [
  '/',
  '/daily',
  '/cards',
  '/about',
  ...identities.map((c) => `/cards/${c.id}`),
  ...topicIds.flatMap((topic) => [
    `/read/${topic}`,
    ...spreadsForTopic(topic).map((s) => `/read/${topic}/${s.id}`),
  ]),
];
writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${origin ? routes.map((path) => `<url><loc>${xml(origin + path)}</loc></url>`).join('') : ''}</urlset>`,
);
writeFileSync(
  'public/manifest.webmanifest',
  JSON.stringify(
    {
      name: `${SITE.name} · ${SITE.thaiName}`,
      short_name: SITE.name,
      lang: 'th',
      start_url: './',
      display: 'standalone',
      background_color: '#0a0618',
      theme_color: '#0a0618',
      icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
    },
    null,
    2,
  ),
);
writeFileSync(
  'public/social.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#100a22"/><circle cx="600" cy="315" r="255" stroke="#e6c36a" fill="none" opacity=".3"/><path d="m600 70 30 95 100 35-100 35-30 95-30-95-100-35 100-35Z" fill="none" stroke="#e6c36a" stroke-width="2"/><text x="600" y="395" text-anchor="middle" fill="#e6c36a" font-family="serif" font-size="64">${xml(SITE.name.toUpperCase())}</text><text x="600" y="450" text-anchor="middle" fill="#cfd3ff" font-family="serif" font-size="18" letter-spacing="8">A LITTLE STARDUST. A LITTLE CLARITY.</text></svg>`,
);
for (const font of ['cinzel', 'noto-serif-thai', 'noto-sans-thai']) {
  const source = `node_modules/@fontsource/${font}/LICENSE`;
  if (existsSync(source)) {
    mkdirSync('public/licenses', { recursive: true });
    copyFileSync(source, `public/licenses/${font}.txt`);
  }
}
