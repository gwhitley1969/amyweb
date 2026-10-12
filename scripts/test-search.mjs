#!/usr/bin/env node
/**
 * Site-search browser test (DECISIONS 2026-10-12). `astro preview` sends no
 * CSP, so pa11y and Lighthouse can never see a CSP failure. This test serves
 * dist/ with the headers SWA will send (dist/staticwebapp.config.json's
 * globalHeaders, as generated for this build) and runs search in headless
 * Chrome. `--csp "<policy>"` overrides the policy (used to try the Plausible
 * variant). Requires `npm run build` first.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve, extname, normalize } from 'node:path';
import { findChrome } from './lib/chrome.mjs';

const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer');
const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const PORT = 4326;
const BASE = `http://localhost:${PORT}`;

const headers = JSON.parse(readFileSync(join(dist, 'staticwebapp.config.json'), 'utf8')).globalHeaders;
const cspArg = process.argv.indexOf('--csp');
if (cspArg > -1) headers['Content-Security-Policy'] = process.argv[cspArg + 1];
// SWA serves https; drop the upgrade so the local http test is not rewritten.
headers['Content-Security-Policy'] = headers['Content-Security-Policy'].replace(/;\s*upgrade-insecure-requests/, '');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^([\\/])+/, '');
  for (const cand of [clean, join(clean, 'index.html'), `${clean}.html`]) {
    const p = join(dist, cand);
    if (p.startsWith(dist) && existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}

const server = createServer((req, res) => {
  const file = resolveFile(new URL(req.url, BASE).pathname);
  if (!file) {
    res.writeHead(404, headers);
    res.end('not found');
    return;
  }
  res.writeHead(200, { ...headers, 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));

const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ['--no-sandbox'] });
const failures = [];
const check = (ok, msg) => {
  if (!ok) failures.push(msg);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`);
};

async function openPage(path, { block } = {}) {
  const page = await browser.newPage();
  const errors = [];
  const foreign = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.setRequestInterception(true);
  page.on('request', (r) => {
    if (!r.url().startsWith(BASE)) foreign.push(r.url());
    if (block && r.url().includes(block)) r.abort();
    else r.continue();
  });
  await page.goto(BASE + path, { waitUntil: 'load' });
  return { page, errors, foreign };
}

try {
  // Check 1: Pagefind's runtime initialises and answers under the CSP.
  {
    const { page, errors } = await openPage('/');
    const n = await page.evaluate(async () => {
      try {
        const pf = await import('/pagefind/pagefind.js');
        const s = await pf.search('laser');
        return s.results.length;
      } catch (e) {
        return `threw: ${e}`;
      }
    });
    check(typeof n === 'number' && n > 0, `pagefind answers "laser" under the CSP (${n})`);
    check(
      !errors.some((e) => /Content Security Policy|wasm/i.test(e)),
      `no CSP/wasm console errors (${errors.join(' | ')})`,
    );
    await page.close();
  }

  /* TASK-3-CHECKS */
} catch (e) {
  check(false, `test threw: ${e?.message ?? e}`);
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(`test-search: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log('test-search: ok');
