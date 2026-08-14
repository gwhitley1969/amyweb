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
    build: {
      // NEVER inline scripts into the HTML: the SWA config's CSP is
      // script-src 'self' (no unsafe-inline, by design — BUILD_SPEC §4),
      // so an inlined script is silently dead on the real host while
      // working on any header-less local server. Found the hard way when
      // the home carousel shipped inert (DECISIONS 2026-08-14). 0 forces
      // every component <script> out to a hashed same-origin file.
      assetsInlineLimit: 0,
    },
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
