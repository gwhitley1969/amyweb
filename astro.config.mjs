// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { FontaineTransform } from 'fontaine';

// https://astro.build/config
export default defineConfig({
  site: 'https://needlegirlie.com',
  output: 'static',
  trailingSlash: 'never',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [
      tailwindcss(),
      // Generates metric-adjusted fallback @font-face rules (size-adjust,
      // ascent/descent/line-gap overrides) so font swap causes no CLS.
      FontaineTransform.vite({
        fallbacks: ['Georgia', 'Arial'],
        resolvePath: (id) => new URL(`./node_modules/${id}`, import.meta.url),
      }),
    ],
  },
});
