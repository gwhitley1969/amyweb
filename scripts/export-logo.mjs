#!/usr/bin/env node
/**
 * Export a raster variant from a canonical logo HTML source (see
 * docs/BRAND-ASSETS.md). Renders the design in headless Chrome at high
 * device scale — a faithful export of the original, never a redraw — then
 * crops to the artwork keeping a background margin so the baked-in glow
 * fades out inside the image.
 *
 * Usage:
 *   node scripts/export-logo.mjs <source.html> <out.png> [scale] [padPx] [--transparent]
 *   e.g. node scripts/export-logo.mjs \
 *          src/assets/brand/source/needle-girlie-logo-black-bg.html \
 *          src/assets/brand/needle-girlie-logo-on-black-trimmed.png
 *
 * --transparent: neutralizes the source's explicit body background and
 * captures with alpha, so the design (incl. CSS glows) composites onto any
 * page surface. Trim then keys off alpha instead of the background color.
 */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { findChrome } from './lib/chrome.mjs';

const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
const sharp = require('sharp');

const args = process.argv.slice(2);
const transparent = args.includes('--transparent');
const [srcArg, outArg, scaleArg, padArg] = args.filter((a) => a !== '--transparent');
if (!srcArg || !outArg) {
  console.error(
    'usage: node scripts/export-logo.mjs <source.html> <out.png> [scale=4] [padPx=136] [--transparent]',
  );
  process.exit(1);
}
const scale = Number(scaleArg ?? 4);
const pad = Number(padArg ?? 136);

const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 700, deviceScaleFactor: scale });
await page.goto('file:///' + resolve(srcArg).replaceAll('\\', '/'), {
  waitUntil: 'networkidle0',
  timeout: 60000,
});
// The saved artifacts show a loading thumbnail until their bundle boots.
await page
  .waitForFunction(() => !document.querySelector('#__bundler_thumbnail'), { timeout: 30000 })
  .catch(() => console.warn('warning: loading thumbnail still present after 30s'));
await page.evaluate(async (makeTransparent) => {
  document.querySelector('#__bundler_loading')?.remove();
  if (makeTransparent) {
    // The saved artifacts paint explicit black backgrounds on the page AND
    // on full-bleed wrapper containers. Clear backgrounds only on elements
    // covering >= half the viewport, so art-level shapes are never touched.
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    const minArea = (window.innerWidth * window.innerHeight) / 2;
    for (const el of document.querySelectorAll('*')) {
      const rect = el.getBoundingClientRect();
      if (rect.width * rect.height < minArea) continue;
      const bg = getComputedStyle(el).backgroundColor;
      if (bg === 'rgb(0, 0, 0)' || bg === 'rgba(0, 0, 0, 1)') {
        el.style.background = 'transparent';
      }
    }
  }
  await document.fonts.ready;
}, transparent);
await new Promise((r) => setTimeout(r, 1500));
const shot = await page.screenshot({ omitBackground: transparent });
await browser.close();

const { info } = await sharp(shot).trim({ threshold: 3 }).toBuffer({ resolveWithObject: true });
const meta = await sharp(shot).metadata();
const left = Math.max(0, -info.trimOffsetLeft - pad);
const top = Math.max(0, -info.trimOffsetTop - pad);
const width = Math.min(meta.width - left, info.width + 2 * pad);
const height = Math.min(meta.height - top, info.height + 2 * pad);
const out = await sharp(shot).extract({ left, top, width, height }).png().toFile(resolve(outArg));
console.log(`exported ${out.width}x${out.height} -> ${outArg}`);
