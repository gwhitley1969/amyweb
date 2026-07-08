#!/usr/bin/env node
/**
 * Brand-voice gate (operator rule, 2026-07-08): the site speaks as AMY,
 * never as a collective. First-person plural ("we", "our", "us", "let's")
 * must not appear in any rendered site text — it implies a team, and a
 * team implies the other providers at the multi-provider location
 * (CLAUDE.md hard constraint 2 adjacency).
 *
 * Scans the BUILT output (dist HTML) rather than source, so code comments
 * and build assets never false-positive: what is checked is exactly what
 * ships. Checks visible text AND meta/OG descriptions + JSON-LD (voice
 * applies to all shipped text). Run after `npm run build`.
 *
 * `--self-test` proves the gate fires before trusting a passing scan.
 * Like the claims linter: this gate only ever grows — narrowing it needs
 * the human operator.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const distDir = resolve(root, 'dist');

// Case-insensitive plural voice words. "us" is matched lowercase-only so
// the country abbreviation "US" stays legal.
const PLURAL_VOICE = /\b(?:we|we're|we've|we'll|we'd|our|ours|ourselves|let's)\b/iu;
const LOWERCASE_US = /\bus\b/u;

/** Extract the text a visitor (or crawler) actually receives. */
function renderedText(html) {
  return (
    html
      // keep JSON-LD content (crawler-visible text), drop other script/style bodies
      .replace(/<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      // surface meta description/OG content attributes as text
      .replace(/<meta[^>]*content="([^"]*)"[^>]*>/gi, ' $1 ')
      .replace(/<[^>]+>/g, ' ')
      // decode apostrophes so "let&#39;s" is still caught as "let's"
      .replace(/&(?:#39|apos|#x27);/gi, "'")
      .replace(/&(?:amp|lt|gt|quot|rsaquo|nbsp|#\d+);/g, ' ')
  );
}

function scanText(text) {
  const violations = [];
  text.split(/\r?\n/).forEach((line, i) => {
    const m = line.match(PLURAL_VOICE) ?? line.match(LOWERCASE_US);
    if (m) violations.push({ line: i + 1, match: m[0] });
  });
  return violations;
}

function listHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listHtml(full));
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

function runScan() {
  if (!existsSync(distDir)) {
    console.error('lint:voice: dist/ not found — run `npm run build` first.');
    process.exit(1);
  }
  let failed = false;
  for (const file of listHtml(distDir)) {
    const rel = relative(root, file).replaceAll('\\', '/');
    for (const v of scanText(renderedText(readFileSync(file, 'utf8')))) {
      failed = true;
      console.error(`  ${rel}  [voice]  first-person plural in rendered text: "${v.match}"`);
    }
  }
  if (failed) {
    console.error('\nlint:voice FAILED — the site speaks as Amy, never as a collective. Fix the copy.');
    process.exit(1);
  }
  console.log('lint:voice passed — no first-person plural in rendered output.');
}

function runSelfTest() {
  const bad = [
    '<p>What we offer</p>',
    '<p>Pardon our dust</p>',
    '<p>Visit us today</p>',
    "<p>Let's talk it through</p>",
    '<p>Let&#39;s talk it through</p>',
    '<meta name="description" content="What we offer in Harrisburg">',
  ];
  const clean =
    '<p>What Amy offers</p><p>US-licensed</p><script>// we is fine in dropped scripts</script>' +
    '<p>Focus on the pousse-café</p><!-- our comment -->';

  let failed = false;
  for (const sample of bad) {
    if (scanText(renderedText(sample)).length === 0) {
      console.error(`self-test: did NOT flag: ${sample}`);
      failed = true;
    }
  }
  if (scanText(renderedText(clean)).length > 0) {
    console.error('self-test: clean sample was flagged (false positive)');
    failed = true;
  }
  if (failed) {
    console.error('lint:voice self-test FAILED — the gate itself is broken.');
    process.exit(1);
  }
  console.log('lint:voice self-test passed.');
}

if (process.argv.includes('--self-test')) {
  runSelfTest();
} else {
  runScan();
}
