# Site Search (Pagefind) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `/search` page, reached from a header icon, that finds needlegirlie.com pages by word and shows each match's title and meta description, with nothing leaving the browser.

**Architecture:** `pagefind` indexes the built HTML after `astro build` (only `<main>` of searchable pages; title and description captured from `<head>`). `/search` loads a small same-origin script that imports Pagefind's runtime on the first keystroke and renders title + description only. A new build gate checks the index's page set and that no caption text got in; a new browser test runs search under the real generated CSP.

**Tech Stack:** Astro 5 (static), Tailwind v4, Pagefind 1.5.2 (devDependency, exact), Node 22 scripts, puppeteer (already present through pa11y-ci).

**Spec:** `docs/superpowers/specs/2026-10-12-site-search-design.md` (operator-approved 2026-10-12). Read it first.

## Global Constraints

- No server code, no `<form>` element, no cookies, no third-party requests, no analytics events for searches (CLAUDE.md constraints 1, 5).
- Results show the page title (minus ` | Needle Girlie`) and the meta description ONLY — never Pagefind's excerpt, never highlighted body text (spec: Compliance reasoning).
- When a description names "Mobile Aesthetics", the name renders as `PracticeLink`'s own markup, cloned from a server-rendered `<template>`, as its own link — never inside the title link (constraint 2, seventh exception).
- Site voice: no "we", "our", "us", "let's" in any rendered text (`npm run lint:voice`). The place is "the medspa", never "studio".
- CSP gains exactly `'wasm-unsafe-eval'` in `script-src`, in both `config/swa/production.json` and `config/swa/preview.json`. Nothing else in the CSP changes.
- Scripts are static files in `public/js/` (the CSP refuses inline scripts). No new runtime dependency; `pagefind` is a devDependency pinned to `1.5.2`.
- Links use the site's no-trailing-slash form (`trailingSlash: 'never'`); `/` stays `/`.
- `npm run build && npm run check` pass after every task; `npm run verify` passes before the PR. Never weaken a gate or a budget.
- Commit messages: conventional (`feat:`, `infra:`, `test:`, `docs:`), ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Never write a Tailwind-looking class name in `docs/` prose without re-checking the built stylesheet hash afterwards (Tailwind scans `docs/`).
- The worktree's `node_modules` is a junction to the main checkout's. Replace it with a real install (Task 1, Step 1) before any `npm install`, or the install edits the main checkout.

## Review Focus

1. **Trailing-slash URLs** — Pagefind returns `/about/`; a visitor clicking a result expects `/about` (a slash URL costs a 301 on SWA). Pinned in Task 3's browser test (every result `href` has no trailing slash, `/` excepted).
2. **Pagefind fails to load** (CSP mis-set, offline, a 404 on `/pagefind/…`) — the visitor expects a plain message, not a dead box. Pinned in Task 3 (`renderUnavailable` path; browser test blocks `/pagefind/pagefind.js` and checks the message).
3. **Fast typing / stale results** — typing "la" then "laser" must never leave "la"'s results on screen. Pinned in Task 3 (`debouncedSearch` returns `null` for superseded queries, which the script ignores; the browser test types character by character and checks the final list).
4. **Plausible flipped on later** — `generate-swa-config.mjs` rewrites the CSP to add `connect-src 'self' https://plausible.io`; Pagefind's same-origin fetches must still pass. Pinned in Task 2 (the browser test reads the generated `dist/staticwebapp.config.json`, and Step 6 runs it once with the Plausible variant's CSP string).
5. **A query that looks like markup or is very long** (`<img src=x>`, 300 characters) — the visitor expects it echoed as text, never parsed as HTML. Pinned in Task 3 (all rendering via `textContent`/DOM nodes; browser test types `<img src=x onerror=alert(1)>` and checks no `img` appears in the status).

---

### Task 1: Pagefind in the build, index scoped, and the index gate

**Files:**
- Modify: `package.json` (scripts `build`, `verify:fast`; new `check:search-index`; devDependency `pagefind`)
- Modify: `package-lock.json` (by npm)
- Modify: `src/layouts/BaseLayout.astro` (`<main>` gets `data-pagefind-body` on searchable paths)
- Modify: `src/components/SeoHead.astro:64-65` (`data-pagefind-meta` on `<title>` and the description meta)
- Create: `scripts/check-search-index.mjs`

**Interfaces:**
- Produces: `dist/pagefind/` after `npm run build` (`pagefind.js`, `fragment/*.pf_fragment`, …). Fragment format: gzip; the first 12 bytes are the ASCII `pagefind_dcd`, then JSON `{ url, content, word_count, filters, meta: { title, description, image?, image_alt? }, anchors }`. `url` ends in `/` (e.g. `/about/`, `/`).
- Produces: `npm run check:search-index` (self-test, then scan); exit 1 on any violation.
- Produces: the searchable rule — every built page is indexed except `/search`, `/404`, and `/styleguide` and everything under it.

- [ ] **Step 1: Give the worktree its own node_modules and add Pagefind**

PowerShell, from the worktree root:
```powershell
cmd /c rmdir node_modules   # removes the junction ONLY; never Remove-Item -Recurse here (it would empty the main checkout's node_modules)
npm ci
npm install --save-dev --save-exact pagefind@1.5.2
```
Expected: `package.json` gains `"pagefind": "1.5.2"` under `devDependencies`; `package-lock.json` lists `@pagefind/linux-x64` and `@pagefind/windows-x64` as optional packages. Check: `git diff --stat` shows only those two files.

- [ ] **Step 2: Write the gate with its self-test (fails first: no `dist/pagefind` yet)**

Create `scripts/check-search-index.mjs`:
```js
#!/usr/bin/env node
/**
 * Site-search index gate (DECISIONS 2026-10-12, the site search entry).
 * Pagefind indexes the BUILT site after `astro build`; this gate reads the
 * index it wrote (dist/pagefind/fragment/*.pf_fragment) and fails when:
 *  (a) the set of indexed pages is not exactly every built page minus the
 *      excluded ones (/search, /404, /styleguide and below), or
 *  (b) any caption cue line (six words or more) from a .vtt file under
 *      public/ appears in an indexed page's text. Caption cues are the one
 *      place some words are allowed to live (CLAUDE.md constraint 2, eighth
 *      exception, and the claims bullets); search must never surface them.
 *      Violations name the file and cue number, never the cue's words.
 *
 * `--self-test` proves the gate fires before trusting a passing scan. Like
 * the other gates, this one only ever grows.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join, resolve, relative, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const distDir = resolve(root, 'dist');
const publicDir = resolve(root, 'public');
const MIN_CUE_WORDS = 6;

export const isExcluded = (url) =>
  url === '/search' || url === '/404' || url === '/styleguide' || url.startsWith('/styleguide/');

/** `/about/` -> `/about`; `/` stays `/`. */
export const normalizeUrl = (url) => url.replace(/\/index\.html$/, '/').replace(/\/+$/, '') || '/';

function walk(dir, test, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, test, out);
    else if (test(p)) out.push(p);
  }
  return out;
}

const squash = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

export function readFragments(pagefindDir) {
  const dir = join(pagefindDir, 'fragment');
  return readdirSync(dir).map((name) => {
    const buf = gunzipSync(readFileSync(join(dir, name)));
    if (buf.subarray(0, 12).toString() !== 'pagefind_dcd') {
      throw new Error(`check-search-index: ${name} is not a Pagefind fragment (format changed?)`);
    }
    const j = JSON.parse(buf.subarray(12).toString());
    return { url: normalizeUrl(j.url), content: squash(j.content ?? '') };
  });
}

export function builtPageUrls(dist) {
  return walk(dist, (p) => p.endsWith('.html') && !p.includes(`${sep}pagefind${sep}`))
    .map((p) => '/' + relative(dist, p).split(sep).join('/'))
    // about/index.html -> /about ; index.html -> / ; 404.html -> /404
    .map((u) => (u.endsWith('/index.html') ? normalizeUrl(u) : u.replace(/\.html$/, '')))
    .filter((u) => !isExcluded(u));
}

/** Cue lines of MIN_CUE_WORDS+ words: [{ file, cue, text }]. */
export function captionCues(dir) {
  const cues = [];
  for (const file of walk(dir, (p) => p.endsWith('.vtt'))) {
    let cue = 0;
    for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line === 'WEBVTT' || line.startsWith('NOTE') || /^\d+$/.test(line)) continue;
      if (line.includes('-->')) { cue++; continue; }
      const text = squash(line.replace(/<[^>]+>/g, ' '));
      if (text.split(' ').length >= MIN_CUE_WORDS) cues.push({ file: relative(root, file), cue, text });
    }
  }
  return cues;
}

export function findViolations({ indexed, expected, cues }) {
  const v = [];
  const got = new Set(indexed.map((p) => p.url));
  const want = new Set(expected);
  for (const u of want) if (!got.has(u)) v.push(`not indexed: ${u}`);
  for (const u of got) if (!want.has(u)) v.push(`indexed but must not be: ${u}`);
  for (const page of indexed) {
    for (const c of cues) {
      if (page.content.includes(c.text)) v.push(`${page.url}: caption text indexed (${c.file}, cue ${c.cue})`);
    }
  }
  return v;
}

function selfTest() {
  const dirty = findViolations({
    indexed: [
      { url: '/styleguide/x', content: '' },
      { url: '/a', content: 'hello one two three four five six seven' },
    ],
    expected: ['/a', '/b'],
    cues: [{ file: 't.vtt', cue: 1, text: 'one two three four five six' }],
  });
  const clean = findViolations({
    indexed: [{ url: '/a', content: 'nothing here' }],
    expected: ['/a'],
    cues: [{ file: 't.vtt', cue: 1, text: 'one two three four five six' }],
  });
  const ok =
    dirty.length === 3 &&
    clean.length === 0 &&
    normalizeUrl('/about/') === '/about' &&
    normalizeUrl('/') === '/' &&
    isExcluded('/styleguide/concept') &&
    !isExcluded('/services');
  console.log(ok ? 'check-search-index self-test: ok' : `check-search-index self-test FAILED: ${JSON.stringify({ dirty, clean })}`);
  process.exit(ok ? 0 : 1);
}

if (process.argv.includes('--self-test')) selfTest();

const pagefindDir = join(distDir, 'pagefind');
if (!existsSync(pagefindDir)) {
  console.error('check-search-index: dist/pagefind is missing — run `npm run build` (it runs pagefind) first.');
  process.exit(1);
}
const violations = findViolations({
  indexed: readFragments(pagefindDir),
  expected: builtPageUrls(distDir),
  cues: captionCues(publicDir),
});
if (violations.length) {
  console.error(`check-search-index: ${violations.length} violation(s)`);
  for (const line of violations) console.error(`  ${line}`);
  process.exit(1);
}
console.log('check-search-index: ok');
```

In `package.json` `scripts`, add:
```json
"check:search-index": "node scripts/check-search-index.mjs --self-test && node scripts/check-search-index.mjs",
```

- [ ] **Step 3: Run it and watch it fail for the right reason**

Run: `npm run build; npm run check:search-index`
Expected: `check-search-index self-test: ok`, then `dist/pagefind is missing — run npm run build …`, exit 1.

- [ ] **Step 4: Run Pagefind in the build, scope the index, capture title + description**

`package.json` `build` becomes:
```json
"build": "astro build && pagefind --site dist && node scripts/generate-swa-config.mjs",
```
and `verify:fast` appends ` && npm run check:search-index` at the end.

`src/components/SeoHead.astro`, lines 64–65 become:
```astro
<title data-pagefind-meta="title">{title}</title>
<meta name="description" data-pagefind-meta="description[content]" content={description} />
```

`src/layouts/BaseLayout.astro`: after the `const { title, … } = Astro.props;` line add:
```ts
/* Site search (DECISIONS 2026-10-12): Pagefind indexes only <main> of
 * pages carrying data-pagefind-body. /search, /404 and the preview-only
 * styleguide (its treatment mirrors included) stay out of the index;
 * scripts/check-search-index.mjs holds the same list and fails the build
 * if the two disagree. */
const pagePath = Astro.url.pathname.replace(/\/+$/, '') || '/';
const searchable = !(
  pagePath === '/search' ||
  pagePath === '/404' ||
  pagePath === '/styleguide' ||
  pagePath.startsWith('/styleguide/')
);
```
and the `<main>` line becomes:
```astro
<main id="main" data-pagefind-body={searchable ? '' : undefined}>
```

- [ ] **Step 5: Run build, gate and checks**

Run: `npm run build; npm run check:search-index; npm run check`
Expected: the build log shows Pagefind's `Indexed 1 language` and `Indexed 21 pages` (home, /about, /visit, /injector-training, /tox-together, /privacy, /terms, /medical-disclaimer, /services and its 12 treatment pages), NOT the line `Did not find a data-pagefind-body element`; the gate prints `check-search-index: ok`; `astro check` reports 0 errors. If the gate reports `not indexed: /404` or `indexed but must not be: /404`, print `Astro.url.pathname` for the 404 page and fix `searchable` to match what Astro gives (do not edit the gate's list).

- [ ] **Step 6: Prove the gate catches a real leak**

Temporarily add, at the end of `src/pages/visit.astro`'s `<section>`, a `<p>` holding one six-word-plus cue line copied from any file in `public/media/*.vtt` (open the file; take a line with no person's name). Run `npm run build; npm run check:search-index`.
Expected: exit 1 with `/visit: caption text indexed (public/media/<file>.vtt, cue N)` and no cue words in the output. Then remove the `<p>` (`git diff src/pages/visit.astro` must be empty).

- [ ] **Step 7: Full fast gate, then commit**

Run: `npm run verify:fast`, and read the LAST line of output for success before committing.
```powershell
git add package.json package-lock.json scripts/check-search-index.mjs src/layouts/BaseLayout.astro src/components/SeoHead.astro
git commit -m "infra: index the built site with Pagefind; check-search-index gate`n`nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: CSP for WebAssembly, and a browser test that runs under it

**Files:**
- Modify: `config/swa/production.json:14`, `config/swa/preview.json:6` (CSP)
- Create: `scripts/test-search.mjs`
- Modify: `package.json` (new `test:search`; `verify:slow` appends it)

**Interfaces:**
- Consumes: `dist/pagefind/` from Task 1; `dist/staticwebapp.config.json` (written by `generate-swa-config.mjs`).
- Produces: `npm run test:search` — serves `dist/` on port 4326 with every `globalHeaders` entry from `dist/staticwebapp.config.json`, drives headless Chrome, exits 1 on any failed check. Task 3 adds the page checks; this task ships the harness plus one check that Pagefind's runtime initialises under the CSP.

- [ ] **Step 1: Write the harness and its first check (fails first: CSP blocks wasm)**

Create `scripts/test-search.mjs`:
```js
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
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.avif': 'image/avif', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2',
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
  if (!file) { res.writeHead(404, headers); res.end('not found'); return; }
  res.writeHead(200, { ...headers, 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));

const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ['--no-sandbox'] });
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); };

async function openPage(path, { block } = {}) {
  const page = await browser.newPage();
  const errors = [];
  const foreign = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.setRequestInterception(true);
  page.on('request', (r) => {
    if (!r.url().startsWith(BASE)) foreign.push(r.url());
    if (block && r.url().includes(block)) r.abort(); else r.continue();
  });
  await page.goto(BASE + path, { waitUntil: 'load' });
  return { page, errors, foreign };
}

try {
  // Check 1: Pagefind's runtime initialises and answers under the CSP.
  {
    const { page, errors } = await openPage('/');
    const n = await page.evaluate(async () => {
      const pf = await import('/pagefind/pagefind.js');
      const s = await pf.search('laser');
      return s.results.length;
    });
    check(n > 0, `pagefind answers "laser" under the CSP (${n} results)`);
    check(!errors.some((e) => /Content Security Policy|wasm/i.test(e)), `no CSP/wasm console errors (${errors.join(' | ')})`);
    await page.close();
  }

  /* TASK-3-CHECKS */
} finally {
  await browser.close();
  server.close();
}

if (failures.length) { console.error(`test-search: ${failures.length} failure(s)`); process.exit(1); }
console.log('test-search: ok');
```

`package.json` scripts: add `"test:search": "node scripts/test-search.mjs",` and change `verify:slow` to `"npm run test:a11y && npm run test:perf && npm run test:search"`.

- [ ] **Step 2: Run it — it must fail on the CSP**

Run: `npm run build; npm run test:search`
Expected: `FAIL no CSP/wasm console errors (... 'wasm-unsafe-eval' ...)` or `FAIL pagefind answers` (the evaluate throws a CompileError: treat a thrown error as the failure); exit 1.

- [ ] **Step 3: Add `'wasm-unsafe-eval'` to both CSP templates**

In `config/swa/production.json` and `config/swa/preview.json`, inside the `Content-Security-Policy` string, replace `script-src 'self';` with `script-src 'self' 'wasm-unsafe-eval';`. Nothing else in either file changes. Check: `git diff config/swa` shows exactly two changed lines, identical edits.

- [ ] **Step 4: Run it — passes**

Run: `npm run build; npm run test:search`
Expected: both `ok` lines, `test-search: ok`, exit 0.

- [ ] **Step 5: Production config sanity**

Run (PowerShell): `$env:PUBLIC_ENV='production'; $env:FRONT_DOOR_ID='00000000-0000-0000-0000-000000000000'; node scripts/generate-swa-config.mjs; Remove-Item Env:PUBLIC_ENV, Env:FRONT_DOOR_ID; Select-String -Path dist/staticwebapp.config.json -Pattern "wasm-unsafe-eval"`
Expected: one match. Then `npm run build` again to restore the preview config in `dist/`.

- [ ] **Step 6: The Plausible variant's CSP still allows search (Review Focus 4)**

Run: `npm run test:search -- --csp "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' https://media.needlegirlie.com; font-src 'self'; connect-src 'self' https://plausible.io; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"`
Expected: `test-search: ok`.

- [ ] **Step 7: Commit**

```powershell
git add config/swa/production.json config/swa/preview.json scripts/test-search.mjs package.json
git commit -m "infra: CSP allows WebAssembly for site search; test-search runs Pagefind under the real headers`n`nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: The `/search` page and its script

**Files:**
- Create: `src/pages/search.astro`
- Create: `public/js/site-search.js`
- Modify: `src/layouts/BaseLayout.astro` (new optional prop `noindex`), `src/components/SeoHead.astro` (honours it)
- Modify: `astro.config.mjs:13` (sitemap filter)
- Modify: `scripts/test-search.mjs` (replace `/* TASK-3-CHECKS */`)

**Interfaces:**
- Consumes: Pagefind runtime at `/pagefind/pagefind.js` — `import()` it; `pf.debouncedSearch(query)` resolves to `null` when superseded, else `{ results: [{ data(): Promise<{ url, meta: { title, description } }> }] }`.
- Produces: page element ids used by the script and tests — `site-search-input` (the `<input type="search">`), `site-search-status` (live region, `role="status"`), `site-search-results` (`<ol>`), `site-search-nojs` (no-JS notice, removed by the script), `site-search-practice-link` (`<template>` holding one `<PracticeLink />`). Each result is `<li><h2><a href="/path">Title</a></h2><p>Description</p></li>`.
- Produces: `BaseLayout` prop `noindex?: boolean` → `SeoHead` prop `noindex?: boolean`.

- [ ] **Step 1: Write the page checks (fail first: no /search page)**

In `scripts/test-search.mjs`, replace the line `/* TASK-3-CHECKS */` with:
```js
  const typeSlowly = async (page, text) => {
    await page.click('#site-search-input', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    for (const ch of text) await page.keyboard.type(ch, { delay: 30 });
  };
  const settled = (page) =>
    page.waitForFunction(() => document.getElementById('site-search-status')?.dataset.state === 'done', { timeout: 15000 });
  const readResults = (page) =>
    page.$$eval('#site-search-results > li', (lis) =>
      lis.map((li) => ({
        href: li.querySelector('h2 a')?.getAttribute('href'),
        title: li.querySelector('h2 a')?.textContent,
        desc: li.querySelector('p')?.textContent,
        nestedLink: !!li.querySelector('h2 a a'),
        practiceLinks: li.querySelectorAll('p a[data-event="ma_site_click"]').length,
        marks: li.querySelectorAll('mark').length,
      })));

  // Check 2: typing finds the laser page; clean links; no excerpts; nothing foreign.
  {
    const { page, errors, foreign } = await openPage('/search');
    check(await page.$('#site-search-nojs') === null, 'no-JS notice removed when the script runs');
    await typeSlowly(page, 'laser');
    await settled(page);
    const r = await readResults(page);
    check(r.some((x) => x.href === '/services/laser-treatments'), `"laser" finds /services/laser-treatments (${r.map((x) => x.href)})`);
    check(r.every((x) => x.href === '/' || !x.href.endsWith('/')), 'no result link ends in a slash (Review Focus 1)');
    check(r.every((x) => !/\|\s*Needle Girlie$/.test(x.title)), 'titles drop the " | Needle Girlie" suffix');
    check(r.every((x) => x.marks === 0), 'no highlighted excerpts');
    const status = await page.$eval('#site-search-status', (el) => el.textContent);
    check(/^\d+ pages? match/.test(status), `status announces the count ("${status}")`);
    check(foreign.length === 0, `no requests leave the site (${foreign.join(', ')})`);
    check(errors.length === 0, `no console errors (${errors.join(' | ')})`);
    // Review Focus 3: the final list belongs to the final query.
    // (The laser page never says "peptide" — checked 2026-10-12.)
    await typeSlowly(page, 'peptide');
    await settled(page);
    const pep = await readResults(page);
    check(pep.some((x) => x.href === '/services/peptide-therapy') && !pep.some((x) => x.href === '/services/laser-treatments'),
      `after retyping, results are "peptide"'s, not "laser"'s (${pep.map((x) => x.href)})`);
    await page.close();
  }

  // Check 3: /about's description names the practice -> PracticeLink, separate from the title link.
  {
    const { page } = await openPage('/search?q=owner');
    await settled(page);
    const r = await readResults(page);
    const about = r.find((x) => x.href === '/about');
    check(!!about, `"owner" (via ?q=) finds /about (${r.map((x) => x.href)})`);
    check(about && about.practiceLinks === 1 && !about.nestedLink, 'practice name is one PracticeLink, not nested in the title link');
    const attrs = await page.$eval('#site-search-results p a[data-event="ma_site_click"]', (a) =>
      [a.target, a.rel, a.querySelector('.sr-only')?.textContent].join('|'));
    check(attrs === '_blank|noopener| (opens in new tab)', `PracticeLink markup intact (${attrs})`);
    await page.close();
  }

  // Check 4: no match, markup-looking input, empty input.
  {
    const { page } = await openPage('/search');
    await typeSlowly(page, 'zzqxv');
    await settled(page);
    check((await page.$eval('#site-search-status', (el) => el.textContent)).startsWith('No pages match'), 'no-match message');
    await typeSlowly(page, '<img src=x onerror=alert(1)>');
    await settled(page);
    check(await page.$('#site-search-status img') === null, 'query is echoed as text, never parsed (Review Focus 5)');
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
```

- [ ] **Step 2: Run — fails**

Run: `npm run build; npm run test:search`
Expected: Check 1 `ok`; Check 2 fails (404 page has no `#site-search-input`; `page.click` throws — a thrown error is the failure); exit 1.

- [ ] **Step 3: `noindex` prop and sitemap filter**

`src/components/SeoHead.astro`: add to `Props`:
```ts
  /** Always noindex (e.g. /search, which has no content of its own). */
  noindex?: boolean;
```
destructure `noindex = false`, and replace line 66 with:
```astro
{(!isProduction || noindex) && <meta name="robots" content="noindex, nofollow" />}
```
`src/layouts/BaseLayout.astro`: add `noindex?: boolean;` to `Props` (with a one-line comment "forwarded to SeoHead"), add `noindex = false` to the destructuring, and pass `noindex={noindex}` to `<SeoHead … />`.

`astro.config.mjs` line 13 becomes:
```js
  integrations: [mdx(), sitemap({ filter: (page) => !/\/search\/?$/.test(page) })],
```

- [ ] **Step 4: Create the page**

`src/pages/search.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import PracticeLink from '../components/PracticeLink.astro';

/**
 * /search — site search (DECISIONS 2026-10-12; spec
 * docs/superpowers/specs/2026-10-12-site-search-design.md). Pagefind's
 * index is built after astro build; public/js/site-search.js loads its
 * runtime on the first keystroke. A result shows the page's title and
 * meta description ONLY — never an excerpt: an excerpt could print, here,
 * sentences whose exceptions say "never restated elsewhere" (CLAUDE.md
 * constraint 3). The practice name in a description renders as
 * PracticeLink, cloned from the template below (constraint 2, seventh
 * exception), beside the title link, never inside it. No <form>
 * (constraint 5); nothing about a query leaves the browser. noindex and
 * out of the sitemap: a search page has no content of its own.
 */
---

<BaseLayout
  title="Search | Needle Girlie"
  description="Search needlegirlie.com for Amy Palacios, FNP's services and pages."
  noindex
>
  <Header slot="header" />

  <section class="mx-auto max-w-3xl px-6 py-16 sm:py-20">
    <h1 class="display-2">Search</h1>
    <label for="site-search-input" class="mt-8 block font-semibold">Search the site</label>
    <input
      id="site-search-input"
      type="search"
      autocomplete="off"
      spellcheck="false"
      class="mt-2 w-full border border-current bg-transparent px-4 py-3"
    />
    <p id="site-search-nojs" class="mt-4">
      Search needs JavaScript. Every page is in the menu, or
      <a href="/services" class="underline underline-offset-4" style="color: var(--ng-link)">browse all of Amy's services</a>.
    </p>
    <p id="site-search-status" role="status" class="mt-6" data-state="idle"></p>
    <ol id="site-search-results" class="mt-6 space-y-8" role="list"></ol>
    <template id="site-search-practice-link"><PracticeLink /></template>
  </section>

  <Footer slot="footer" />
  {/* Static file, not a component script: the CSP is script-src 'self'
      with no inline code (the TreatmentVideo.astro:156 form). */}
  <script type="module" src="/js/site-search.js" is:inline></script>
</BaseLayout>
```
(`<Footer slot="footer" />` and the script form match `src/pages/visit.astro:63` and `src/components/TreatmentVideo.astro:156`.) Every class above is an existing site utility or a plain Tailwind utility; Step 7 checks the input border's contrast (≥ 3:1).

- [ ] **Step 5: Create the script**

`public/js/site-search.js`:
```js
/**
 * Site search for /search (DECISIONS 2026-10-12). Loads Pagefind's runtime
 * (/pagefind/pagefind.js, built by `pagefind --site dist`) on the first
 * focus or keystroke, then renders each match as its page TITLE (minus the
 * " | Needle Girlie" suffix) and META DESCRIPTION only — never an excerpt
 * (see src/pages/search.astro). Everything is built with DOM nodes and
 * textContent; a query is never parsed as HTML. No storage, no analytics,
 * no requests beyond this site.
 */
const input = document.getElementById('site-search-input');
const status = document.getElementById('site-search-status');
const list = document.getElementById('site-search-results');
const practiceTpl = document.getElementById('site-search-practice-link');
const PRACTICE = 'Mobile Aesthetics';
const MAX_RESULTS = 10;

if (input && status && list && practiceTpl) {
  document.getElementById('site-search-nojs')?.remove();

  // A failed import clears the cache so a later keystroke can retry.
  let pagefind = null;
  const load = () =>
    (pagefind ??= import('/pagefind/pagefind.js').catch((e) => {
      pagefind = null;
      throw e;
    }));

  const setStatus = (text, state) => {
    status.textContent = text;
    status.dataset.state = state;
  };
  const cleanUrl = (url) => url.replace(/\/+$/, '') || '/';
  const cleanTitle = (title) => (title ?? '').replace(/\s*\|\s*Needle Girlie\s*$/, '');

  function description(text) {
    const p = document.createElement('p');
    p.className = 'mt-2';
    const parts = (text ?? '').split(PRACTICE);
    parts.forEach((part, i) => {
      p.append(part);
      if (i < parts.length - 1) p.append(practiceTpl.content.cloneNode(true));
    });
    return p;
  }

  function render(items, query) {
    list.replaceChildren(
      ...items.map(({ url, meta }) => {
        const li = document.createElement('li');
        const h2 = document.createElement('h2');
        h2.className = 'heading-4';
        const a = document.createElement('a');
        a.href = cleanUrl(url);
        a.className = 'underline underline-offset-4';
        a.style.color = 'var(--ng-link)';
        a.textContent = cleanTitle(meta?.title);
        h2.append(a);
        li.append(h2, description(meta?.description));
        return li;
      }),
    );
    const n = items.length;
    setStatus(n ? `${n} page${n === 1 ? '' : 's'} match “${query}”.` : `No pages match “${query}”. Try another word, or browse all of Amy's services from the menu.`, 'done');
  }

  async function run() {
    const query = input.value.trim();
    if (!query) {
      list.replaceChildren();
      setStatus('', 'idle');
      return;
    }
    setStatus('Searching…', 'busy');
    try {
      const pf = await load();
      const search = await pf.debouncedSearch(query);
      if (search === null) return; // superseded by a newer keystroke
      const items = await Promise.all(search.results.slice(0, MAX_RESULTS).map((r) => r.data()));
      if (input.value.trim() !== query) return; // the box changed while loading
      render(items, query);
    } catch {
      list.replaceChildren();
      setStatus("Search isn't available right now. Every page is in the menu.", 'done');
    }
  }

  input.addEventListener('focus', () => { load().catch(() => {}); }, { once: true });
  input.addEventListener('input', run);

  const q = new URLSearchParams(location.search).get('q');
  if (q) {
    input.value = q;
    run();
  }
}
```
(`heading-4` is the site utility at `src/styles/global.css:76`. The focus preload's `.catch` keeps a failed preload from printing an uncaught error; `run()` reports it.)

- [ ] **Step 6: Run — passes**

Run: `npm run build; npm run check:search-index; npm run test:search`
Expected: every check `ok`, `test-search: ok`. The index gate still reports `ok` (proves /search itself is not indexed). `dist/sitemap-0.xml` contains no `/search` (`Select-String dist/sitemap-0.xml -Pattern "/search"` → no match).

- [ ] **Step 7: Look at it**

Run `npx astro preview --port 4321` and open `http://localhost:4321/search?q=laser` in Edge at 390px and 1440px widths. Check: the input border is visible against the page background (≥ 3:1), focus ring visible on the input and on the links, nothing overflows sideways at 390px. Stop the preview and close the tab.

- [ ] **Step 8: Gates and commit**

Run: `npm run verify:fast` (read the last line for success).
```powershell
git add src/pages/search.astro public/js/site-search.js src/layouts/BaseLayout.astro src/components/SeoHead.astro astro.config.mjs scripts/test-search.mjs
git commit -m "feat: /search page — Pagefind results as title and description only`n`nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Header search icon (operator sees renders first)

**Files:**
- Modify: `src/components/Header.astro` (link between Book and the menu button; CSS selector list)

**Interfaces:**
- Consumes: `/search` from Task 3.
- Produces: `<a href="/search" class="site-search-link">` in `nav.site-nav`, with `aria-current="page"` on /search.

- [ ] **Step 1: Add the link**

In `src/components/Header.astro`, directly after the Book `</a>` and before the `{/* menu button — all widths */}` comment, insert:
```astro
      {/* Site search (DECISIONS 2026-10-12): a plain link to /search — no
          script on any page but /search itself. */}
      <a
        href="/search"
        class="site-search-link"
        aria-current={Astro.url.pathname.replace(/\/+$/, '') === '/search' ? 'page' : undefined}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" fill="none">
          <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="2"></circle>
          <path d="M15.5 15.5 20.5 20.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
        </svg>
        <span class="sr-only">Search</span>
      </a>
```
In the `<style is:global>` block, the rule that begins `.site-nav-toggle {` (the one with `min-width: 2.75rem`) gets a second selector, so the link shares the 44px tap target and colours:
```css
  .site-nav-toggle,
  .site-search-link {
```
(add `text-decoration: none;` inside that rule — harmless on the button). Directly after the existing `@media (min-width: 1024px) { .site-nav-toggle svg { … } }` rule, add:
```css
  @media (min-width: 1024px) {
    .site-search-link svg {
      width: 30px;
      height: 30px;
    }
  }
```
Focus: the header has no custom focus style today (the browser's ring applies to both controls), so add none.

- [ ] **Step 2: Build and check**

Run: `npm run build; npm run check; npm run check:search-index`
Expected: all pass (the header is outside `<main>`, so the index is unchanged).

- [ ] **Step 3: Renders for the operator — STOP here for approval**

With `npx astro preview --port 4321`, capture the header (top 200px) of `/` and `/services/laser-treatments` at 390px and 1440px wide (headless Chrome, `--disable-checker-imaging --disable-gpu`), plus the same from the current production site for comparison. Save to the job's tmp folder and copy to the Desktop; open them in a new Edge window. Ask the operator: keep the icon as placed, move it, or put "Search" inside the menu instead. Do not commit until the operator answers; apply what they choose.

- [ ] **Step 4: Commit**

```powershell
git add src/components/Header.astro
git commit -m "feat: header search link to /search`n`nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: a11y and Lighthouse coverage, then full verify

**Files:**
- Modify: `.pa11yci.json` (two `/search` entries)
- Modify: `lighthouserc.json` (`/search` URL under the house row)

- [ ] **Step 1: Add the routes**

`.pa11yci.json` `urls`, after the `/medical-disclaimer` entry:
```json
    {
      "url": "http://localhost:4325/search",
      "levelCapWhenNeedsReview": "warning"
    },
    {
      "url": "http://localhost:4325/search?q=laser",
      "levelCapWhenNeedsReview": "warning",
      "actions": ["wait for element #site-search-results li to be added"]
    },
```
`lighthouserc.json` `ci.collect.url`, append `"http://localhost/search/index.html"`. Do not touch any assertion: the house row's regex already matches it, so it gets the 30 KB script budget.

- [ ] **Step 2: Full verify**

Run: `npm run verify` and read the LAST line. Expected: pass. Record /search's measured `resource-summary:script:size` from the Lighthouse output. If it exceeds 30,720 B, STOP: report the number to the operator before proposing anything; never edit the budget yourself.

- [ ] **Step 3: Commit**

```powershell
git add .pa11yci.json lighthouserc.json
git commit -m "test: /search joins the a11y and Lighthouse matrices`n`nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Records, PR, and the preview check

**Files:**
- Modify: `docs/DECISIONS.md` (append), `docs/CHANGELOG.md` (the `phase-c` section), `.claude/CLAUDE.md` (Locked technical decisions: the sixth sanctioned JS consumer and the CSP note)
- Memory (outside the repo): update `website-sow-divergences.md`; add a memory for the Smart App Control decision.

- [ ] **Step 1: DECISIONS entry** (append at the end; date 2026-10-12)

Heading: `## 2026-10-12 — Site search: Pagefind indexes the built site; /search shows titles and descriptions only (operator decisions after the flags)`. Body, a few short paragraphs: context (operator asked for search; ~20 pages; not in the SOW); decision (Pagefind 1.5.2 devDependency; index scoped to `<main>`, excluding /search, /404, /styleguide; results = title + meta description; `'wasm-unsafe-eval'` in both CSP templates; header icon); alternatives rejected (hand-written search — recommended, declined; Pagefind's default UI — 29.7 KB gzip and excerpts; Google site search — third party; excerpts — restate scoped-exception text on /search); consequences (Pagefind's native program needs Smart App Control off on the operator's PC — turned off by the operator after the flag that it has no per-program exception; two new gates `check:search-index` and `test:search`; /search's measured script bytes from Task 5; SOW divergence / change-order note; run-rate $0).

- [ ] **Step 2: CHANGELOG line and CLAUDE.md**

CHANGELOG, under the newest `phase-c` section: `- Site search: /search (Pagefind), header search link; results show page titles and descriptions only. (DECISIONS 2026-10-12)`.
CLAUDE.md, at the end of the "Zero client-side JS by default" bullet, before "The 30KB budget stands…": `Sixth sanctioned consumer (2026-10-12, operator-directed — DECISIONS same date): site search on /search ONLY — public/js/site-search.js, which imports Pagefind's runtime (/pagefind/pagefind.js, its worker and WebAssembly, built at build time) on the first keystroke; the CSP's script-src carries 'wasm-unsafe-eval' for it. Results show titles and meta descriptions only, never excerpts. Widening it to another page requires the human operator.`

- [ ] **Step 3: Stylesheet check, verify, commit, push**

Run `npm run build` and compare `dist/_astro/*.css` names with those from Task 5's build (identical, or explain the difference — Tailwind scans `docs/`). Run `npm run verify` and read the last line.
```powershell
git add docs/DECISIONS.md docs/CHANGELOG.md .claude/CLAUDE.md docs/superpowers/plans/2026-10-12-site-search.md
git commit -m "docs: site search records`n`nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git ls-remote origin phase-c
git push
```
If `phase-c` moved since `f469ad0`, merge `origin/phase-c` into the branch first and re-run `npm run verify`.

- [ ] **Step 4: Open the PR into phase-c**

`gh pr create --base phase-c --head feat/site-search --title "feat: site search (Pagefind)"` with a body listing what changed, the operator decisions, the gates added, the measured script bytes, and ending with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

- [ ] **Step 5: Preview checks (SWA serves Pagefind's files)**

When the preview deploy is green, probe six times (slash-less paths) until converged:
```bash
for f in pagefind/pagefind.js pagefind/pagefind-entry.json pagefind/wasm.en.pagefind; do curl -s -o /dev/null -w "%{http_code} %{content_type} $f\n" "$PREVIEW/$f"; done
curl -s "$PREVIEW/pagefind/pagefind-entry.json"
```
then one `.pf_meta`, one `.pf_index` and one `.pf_fragment` path from the build's `dist/pagefind`. Expected: 200 for each. If any returns 404, add to BOTH `config/swa/production.json` and `config/swa/preview.json` a top-level `"mimeTypes": { ".pagefind": "application/octet-stream", ".pf_meta": "application/octet-stream", ".pf_index": "application/octet-stream", ".pf_fragment": "application/octet-stream" }`, commit (`infra: SWA serves Pagefind's index files`), push, re-probe. Then open `$PREVIEW/search?q=laser` in a browser and click a result.

- [ ] **Step 6: Ask for the merge word**

End with one question: merge into `phase-c`? Give test links only after the preview converges.
