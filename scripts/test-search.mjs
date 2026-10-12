#!/usr/bin/env node
/**
 * Site-search browser test (DECISIONS 2026-10-12). `astro preview` sends no
 * CSP, so pa11y and Lighthouse can never see a CSP failure. This test serves
 * dist/ with the headers SWA will send (dist/staticwebapp.config.json's
 * globalHeaders, as generated for this build) and runs search in headless
 * Chrome. `--csp "<policy>"` overrides the policy (used to try the Plausible
 * variant). `--firefox` runs the same checks in the installed Firefox
 * (puppeteer over WebDriver BiDi; FIREFOX_PATH overrides the path) — run by
 * hand, not in verify (CI runners carry no Firefox). Requires `npm run build`
 * first.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve, extname, normalize } from 'node:path';
import { findChrome } from './lib/chrome.mjs';

const nodeRequire = createRequire(import.meta.url);
const puppeteer = nodeRequire('puppeteer');
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

// A path the server answers 404 for while a check runs (the "Pagefind
// unavailable" case). Done here, not with puppeteer's request interception:
// interception stalls requests from Pagefind's worker at random (seen
// 2026-10-12: 4 hangs in 9 runs with it on, 0 in 24 without).
let blockedPath = null;

const server = createServer((req, res) => {
  const pathname = new URL(req.url, BASE).pathname;
  const file = pathname === blockedPath ? null : resolveFile(pathname);
  if (!file) {
    res.writeHead(404, headers);
    res.end('not found');
    return;
  }
  res.writeHead(200, { ...headers, 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));

const firefox = process.argv.includes('--firefox');
const browser = firefox
  ? await puppeteer.launch({
      browser: 'firefox',
      executablePath: process.env.FIREFOX_PATH ?? 'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
      headless: true,
    })
  : await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ['--no-sandbox'] });
console.log(`browser: ${await browser.version()}`);
const failures = [];
const check = (ok, msg) => {
  if (!ok) failures.push(msg);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`);
};

/** `block`: a pathname the server answers 404 for until the next openPage. */
async function openPage(path, { block } = {}) {
  blockedPath = block ?? null;
  // A fresh context per check: its own HTTP cache, so a blocked path is
  // really fetched (and blocked), not served from an earlier check's cache.
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  page.once('close', () => context.close().catch(() => {}));
  const errors = [];
  const foreign = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('request', (r) => {
    if (!r.url().startsWith(BASE)) foreign.push(r.url());
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

  // Select the box's text in script, then Backspace: a triple-click does not
  // select in Firefox over BiDi (seen 2026-10-12: "peptide" appended to "laser").
  const typeSlowly = async (page, text) => {
    await page.$eval('#site-search-input', (el) => {
      el.focus();
      el.select();
    });
    await page.keyboard.press('Backspace');
    for (const ch of text) await page.keyboard.type(ch, { delay: 30 });
  };
  const settled = (page) =>
    page.waitForFunction(() => document.getElementById('site-search-status')?.dataset.state === 'done', {
      timeout: 15000,
    });
  const readResults = (page) =>
    page.$$eval('#site-search-results > li', (lis) =>
      lis.map((li) => ({
        href: li.querySelector('h2 a')?.getAttribute('href'),
        title: li.querySelector('h2 a')?.textContent,
        desc: li.querySelector('p')?.textContent,
        nestedLink: !!li.querySelector('h2 a a'),
        practiceLinks: li.querySelectorAll('p a[data-event="ma_site_click"]').length,
        marks: li.querySelectorAll('mark').length,
      })),
    );

  // Check 2: typing finds the laser page; clean links; no excerpts; nothing foreign.
  {
    const { page, errors, foreign } = await openPage('/search');
    check((await page.$('#site-search-nojs')) === null, 'no-JS notice removed when the script runs');
    await typeSlowly(page, 'laser');
    await settled(page);
    const r = await readResults(page);
    check(
      r.some((x) => x.href === '/services/laser-treatments'),
      `"laser" finds /services/laser-treatments (${r.map((x) => x.href)})`,
    );
    check(r.every((x) => x.href === '/' || !x.href.endsWith('/')), 'no result link ends in a slash (Review Focus 1)');
    check(r.every((x) => !/\|\s*Needle Girlie$/.test(x.title)), 'titles drop the " | Needle Girlie" suffix');
    check(r.every((x) => x.marks === 0), 'no highlighted excerpts');
    // The home page's <title> names the practice; a link can't hold the
    // PracticeLink, so the title link drops that part (constraint 2, 7th exception).
    check(
      r.some((x) => x.href === '/') && r.every((x) => !x.title.includes('Mobile Aesthetics')),
      `no title link names the practice (${r.map((x) => x.title).join(' / ')})`,
    );
    const status = await page.$eval('#site-search-status', (el) => el.textContent);
    check(/^\d+ pages? match/.test(status), `status announces the count ("${status}")`);
    check(foreign.length === 0, `no requests leave the site (${foreign.join(', ')})`);
    check(errors.length === 0, `no console errors (${errors.join(' | ')})`);
    // Review Focus 3: the final list belongs to the final query.
    // (The laser page never says "peptide" — checked 2026-10-12.)
    await typeSlowly(page, 'peptide');
    await settled(page);
    const pep = await readResults(page);
    check(
      pep.some((x) => x.href === '/services/peptide-therapy') &&
        !pep.some((x) => x.href === '/services/laser-treatments'),
      `after retyping, results are "peptide"'s, not "laser"'s (box "${await page.$eval('#site-search-input', (el) => el.value)}": ${pep.map((x) => x.href)})`,
    );
    await page.close();
  }

  // Check 3: /about's description names the practice -> PracticeLink, separate from the title link.
  {
    const { page } = await openPage('/search?q=owner');
    await settled(page);
    const r = await readResults(page);
    const about = r.find((x) => x.href === '/about');
    check(!!about, `"owner" (via ?q=) finds /about (${r.map((x) => x.href)})`);
    const one = await page.$eval('#site-search-status', (el) => el.textContent);
    check(r.length !== 1 || one.startsWith('1 page matches'), `singular grammar ("${one}")`);
    check(
      about && about.practiceLinks === 1 && !about.nestedLink,
      'practice name is one PracticeLink, not nested in the title link',
    );
    const attrs = await page.$eval('#site-search-results p a[data-event="ma_site_click"]', (a) =>
      [a.target, a.rel, a.querySelector('.sr-only')?.textContent].join('|'),
    );
    check(attrs === '_blank|noopener| (opens in new tab)', `PracticeLink markup intact (${attrs})`);
    await page.close();
  }

  // Check 4: no match, markup-looking input, empty input.
  {
    const { page } = await openPage('/search');
    await typeSlowly(page, 'zzqxv');
    await settled(page);
    check(
      (await page.$eval('#site-search-status', (el) => el.textContent)).startsWith('No pages match'),
      'no-match message',
    );
    await typeSlowly(page, '<img src=x onerror=alert(1)>');
    await settled(page);
    check((await page.$('#site-search-status img')) === null, 'query is echoed as text, never parsed (Review Focus 5)');
    await typeSlowly(page, '');
    await page.keyboard.press('Backspace');
    await page.waitForFunction(() => document.querySelectorAll('#site-search-results > li').length === 0);
    check(true, 'clearing the box clears the results');
    await page.close();
  }

  // Check 5: Pagefind unavailable -> plain message (Review Focus 2).
  {
    const { page } = await openPage('/search', { block: '/pagefind/pagefind.js' });
    await typeSlowly(page, 'laser');
    await settled(page);
    const status = await page.$eval('#site-search-status', (el) => el.textContent);
    check(status.startsWith("Search isn't available right now"), `unavailable message ("${status}")`);
    await page.close();
  }

  // Check 6: keyboard only — Tab from the box reaches the first result link.
  {
    const { page } = await openPage('/search?q=laser');
    await settled(page);
    await page.focus('#site-search-input');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.closest('#site-search-results') !== null);
    check(focused, 'Tab from the search box lands in the results');
    await page.close();
  }

  // Check 8: no sideways scroll — the header at 320px on any page, and a
  // long query echoed on /search (WCAG 1.4.10 Reflow).
  for (const [path, width] of [
    ['/', 320],
    ['/services/laser-treatments', 320],
    ['/search?q=laser', 320],
    [`/search?q=${'x'.repeat(120)}`, 375],
  ]) {
    const { page } = await openPage(path);
    await page.setViewport({ width, height: 800 });
    if (path.startsWith('/search')) await settled(page);
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    check(over <= 0, `no sideways scroll at ${width}px on ${path.slice(0, 40)} (${over}px over)`);
    await page.close();
  }

  // Check 9: keyboard only — Enter on the first result opens that page.
  {
    const { page } = await openPage('/search?q=laser');
    await settled(page);
    await page.focus('#site-search-results li a');
    await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.keyboard.press('Enter')]);
    const path = new URL(page.url()).pathname;
    check(path === '/services/laser-treatments', `Enter on the first result opens it (${path})`);
    await page.close();
  }

  // Check 10: the practice-name rule matches the lint's (/mobile\s+aesthetics/iu):
  // any casing or spacing becomes one PracticeLink, and leaves a title link.
  {
    const { page } = await openPage('/search');
    const out = await page.evaluate(async () => {
      const t = await import('/js/site-search-text.js');
      return {
        title: t.cleanTitle('Needle Girlie | MOBILE  AESTHETICS in Town | Needle Girlie'),
        parts: t.splitPractice('owner of Mobile\nAesthetics, and of mobile aesthetics too'),
      };
    });
    check(out.title === 'Needle Girlie', `title drops any spelling of the practice (${out.title})`);
    check(
      JSON.stringify(out.parts) === JSON.stringify(['owner of ', ', and of ', ' too']),
      `description splits on any spelling of the practice (${JSON.stringify(out.parts)})`,
    );
    await page.close();
  }

  // Check 7: the header's search link — every page; current on /search.
  for (const [path, current] of [
    ['/', null],
    ['/services/laser-treatments', null],
    ['/search', 'page'],
  ]) {
    const { page } = await openPage(path);
    const link = await page.$eval('nav.site-nav a[href="/search"]', (a) => ({
      name: a.textContent.trim(),
      current: a.getAttribute('aria-current'),
    })).catch(() => null);
    check(
      link?.name === 'Search' && link.current === current,
      `header search link on ${path} (${JSON.stringify(link)})`,
    );
    await page.close();
  }
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
