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

/** One file's cue lines of MIN_CUE_WORDS+ words: [{ file, cue, text }]. */
export function cuesFromVtt(source, file) {
  return source
    .split(/\r?\n\s*\r?\n/) // WebVTT blocks are separated by blank lines
    .filter((block) => block.includes('-->')) // cues only: header, NOTE and STYLE blocks have no timing line
    .flatMap((block, i) => {
      const lines = block.split(/\r?\n/);
      const timing = lines.findIndex((l) => l.includes('-->'));
      const textLines = lines.slice(timing + 1).map((l) => squash(l.replace(/<[^>]+>/g, ' ')));
      // Each line, and the cue's lines joined (a cue is often two short lines).
      const texts = [...new Set([...textLines, textLines.join(' ')])];
      return texts
        .filter((text) => text.split(' ').length >= MIN_CUE_WORDS)
        .map((text) => ({ file, cue: i + 1, text }));
    });
}

export function captionCues(dir) {
  return walk(dir, (p) => p.endsWith('.vtt')).flatMap((f) =>
    cuesFromVtt(readFileSync(f, 'utf8'), relative(root, f)),
  );
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
    !isExcluded('/services') &&
    JSON.stringify(
      cuesFromVtt(
        'WEBVTT\n\nNOTE an editor note that runs on\nfor two long lines of words here\n\n1\n00:00.000 --> 00:01.000\nthe first cue has six words\n\n2\n00:01.000 --> 00:02.000\ntoo short\n',
        't.vtt',
      ),
    ) === JSON.stringify([{ file: 't.vtt', cue: 1, text: 'the first cue has six words' }]) &&
    // A cue's text split over two short lines is still caught, joined.
    findViolations({
      indexed: [{ url: '/a', content: 'x one two three four five six y' }],
      expected: ['/a'],
      cues: cuesFromVtt('WEBVTT\n\n1\n00:00.000 --> 00:01.000\none two three\nfour five six\n', 't.vtt'),
    }).length === 1;
  console.log(
    ok ? 'check-search-index self-test: ok' : `check-search-index self-test FAILED: ${JSON.stringify({ dirty, clean })}`,
  );
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
