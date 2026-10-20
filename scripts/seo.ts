import {mkdirSync,writeFileSync} from 'node:fs';
mkdirSync('public',{recursive:true});
const origin=(process.env.VITE_SITE_URL||'').replace(/\/$/,'');
writeFileSync('public/robots.txt',`User-agent: *\nAllow: /\n${origin?`Sitemap: ${origin}/sitemap.xml`:''}\n`);
writeFileSync('public/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${origin?['/','/daily','/cards','/about',...['love','exam','weather','general'].map(topic=>`/read/${topic}`)].map(path=>`<url><loc>${origin}${path}</loc></url>`).join(''):''}</urlset>`);
