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
  integrations: [
    mdx(),
    // /search (no content of its own) and the ad landing pages (/go/*) are
    // noindex in every build and stay out of the sitemap (DECISIONS 2026-10-12).
    sitemap({ filter: (page) => !page.includes('/go/') && !/\/search\/?$/.test(page) }),
  ],
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
