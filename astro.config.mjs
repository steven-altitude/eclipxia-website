// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.eclipxia.com',
  adapter: vercel(),
  trailingSlash: 'always',
  integrations: [sitemap()],
});
