#!/usr/bin/env node
/**
 * Practice-name link gate (operator rule, 2026-09-27; DECISIONS same
 * date): wherever VISIBLE site text names the practice — "Mobile
 * Aesthetics" — the name is a link to the practice site.
 *
 * Every such link is an operator override of CLAUDE.md hard constraint 2
 * (the destination lists the location's other providers), so the gate
 * also holds the links themselves to the screened terms:
 *
 *   1. [unlinked]   the name in visible text sits outside a link to the
 *                   practice site.
 *   2. [attributes] a link to the practice site lacks the new tab,
 *                   `noopener`, the ma_site_click event, or the hidden
 *                   "(opens in new tab)" note.
 *   3. [address]    a link goes to the practice site at an address other
 *                   than the one screened (siteConfig.mobileAestheticsUrl).
 *   4. [control]    a link to the practice site sits inside a <summary>
 *                   or a <button> (it would hijack the control's click).
 *
 * WHAT COUNTS AS VISIBLE TEXT: text nodes of the built pages. Attribute
 * values (alt text, aria-labels, data-labels, meta descriptions, share
 * titles), scripts (JSON-LD included), styles and comments are not page
 * text and cannot hold a link, so they are not read. TWO places may name
 * the practice as plain text: an FAQ QUESTION (it renders in <summary>,
 * where a link is not allowed — rule 4) and a page's <title>.
 *
 * Scans the BUILT output (dist HTML) like lint:voice, so what is checked
 * is exactly what ships. Run after `npm run build`. `--self-test` proves
 * the gate fires before a passing scan is trusted. Like the other gates,
 * this one only ever grows — narrowing it needs the human operator.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const distDir = resolve(root, 'dist');

/** The practice's name, any whitespace between its two words (a
 * no-break space included). src/lib/inlineLinks.ts holds the same name
 * for the marker's label. */
const PRACTICE_NAME = /mobile\s+aesthetics/giu;

/** Elements whose content is not page text. */
const RAW_TEXT = new Set(['script', 'style', 'title', 'textarea']);

/** The one screened address, read from the site's own config so the gate
 * can never drift from the link it checks. */
function practiceUrl() {
  const src = readFileSync(resolve(root, 'src/lib/siteConfig.ts'), 'utf8');
  const m = src.match(/mobileAestheticsUrl:\s*'([^']+)'/);
  if (!m) {
    console.error('lint:practice-link: mobileAestheticsUrl not found in src/lib/siteConfig.ts.');
    process.exit(1);
  }
  return m[1].replace(/\/+$/, '');
}

function decode(text) {
  return text
    .replace(/&(?:nbsp|#160|#xa0);/gi, ' ')
    .replace(/&(?:#39|apos|#x27);/gi, "'")
    .replace(/&amp;/gi, '&')
    // every other entity is punctuation here (a chevron, a dash): a space
    .replace(/&[a-z][a-z0-9]*;|&#x?[0-9a-f]+;/gi, ' ');
}

/** Attributes of one start tag, names lower-cased. */
function attributes(tag) {
  const out = {};
  const re = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  const body = tag.replace(/^<\/?[a-zA-Z][a-zA-Z0-9-]*/, '').replace(/\/?>$/, '');
  for (const m of body.matchAll(re)) {
    out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return out;
}

/**
 * Walk one page. Returns the findings, each { rule, detail }.
 * A small tokenizer rather than tag-stripping regexes: attribute values
 * may hold a ">" and raw-text elements may hold a "<".
 */
function scanHtml(html, url) {
  const findings = [];
  const lower = html.toLowerCase();
  const site = url.toLowerCase();
  let visible = '';
  let link = null; // inside a link to the practice site: { attrs, text }
  let summaryDepth = 0;
  let buttonDepth = 0;
  let i = 0;

  const addText = (text) => {
    if (link) link.text += text;
    else if (summaryDepth === 0) visible += text;
  };

  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) {
      addText(html.slice(i));
      break;
    }
    addText(html.slice(i, lt));

    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt + 4);
      i = end === -1 ? html.length : end + 3;
      continue;
    }
    const open = /^<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/.exec(html.slice(lt, lt + 80));
    if (!open) {
      // "<!doctype …>", "<?…>", or a bare "<" in text
      if (html[lt + 1] === '!' || html[lt + 1] === '?') {
        const end = html.indexOf('>', lt);
        i = end === -1 ? html.length : end + 1;
      } else {
        addText('<');
        i = lt + 1;
      }
      continue;
    }

    // the end of this tag, quotes respected
    let j = lt + open[0].length;
    let quote = '';
    for (; j < html.length; j++) {
      const c = html[j];
      if (quote) {
        if (c === quote) quote = '';
      } else if (c === '"' || c === "'") quote = c;
      else if (c === '>') break;
    }
    const tag = html.slice(lt, j + 1);
    const closing = open[1] === '/';
    const name = open[2].toLowerCase();
    i = j + 1;

    if (!closing && RAW_TEXT.has(name)) {
      const end = lower.indexOf(`</${name}`, i);
      if (end === -1) {
        i = html.length;
      } else {
        const gt = html.indexOf('>', end);
        i = gt === -1 ? html.length : gt + 1;
      }
      addText(' ');
      continue;
    }

    if (name === 'summary') summaryDepth = Math.max(0, summaryDepth + (closing ? -1 : 1));
    if (name === 'button') buttonDepth = Math.max(0, buttonDepth + (closing ? -1 : 1));

    if (name === 'a') {
      if (closing) {
        if (link) {
          const { attrs, text } = link;
          link = null;
          const missing = [];
          if (attrs.target !== '_blank') missing.push('target="_blank"');
          if (!(attrs.rel ?? '').split(/\s+/).includes('noopener')) missing.push('rel="noopener"');
          if (attrs['data-event'] !== 'ma_site_click') missing.push('data-event="ma_site_click"');
          if (!/opens in (?:a )?new tab/i.test(decode(text))) missing.push('the hidden "(opens in new tab)" note');
          if (missing.length > 0) {
            findings.push({ rule: 'attributes', detail: `a link to the practice site lacks ${missing.join(', ')}` });
          }
        }
      } else {
        const attrs = attributes(tag);
        const href = (attrs.href ?? '').trim().toLowerCase();
        const bare = href.replace(/\/+$/, '');
        if (bare === site) {
          if (summaryDepth > 0 || buttonDepth > 0) {
            findings.push({
              rule: 'control',
              detail: 'a link to the practice site sits inside a <summary> or a <button>',
            });
          }
          link = { attrs, text: '' };
        } else if (href.startsWith(`${site}/`) || href.startsWith(`${site}?`) || href.startsWith(`${site}#`)) {
          findings.push({
            rule: 'address',
            detail: `a link goes to "${attrs.href}", not to the screened address ${url}`,
          });
        }
      }
    }
    addText(' ');
  }

  const text = decode(visible).replace(/\s+/g, ' ');
  for (const m of text.matchAll(PRACTICE_NAME)) {
    const at = m.index ?? 0;
    const around = text.slice(Math.max(0, at - 40), at + m[0].length + 40).trim();
    findings.push({ rule: 'unlinked', detail: `the practice's name is plain text: "…${around}…"` });
  }
  return findings;
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

const HOW_TO_FIX =
  'Wherever visible text names the practice, the name links to the practice site.\n' +
  '  - In an .astro page or an MDX body: <PracticeLink>Mobile Aesthetics</PracticeLink>\n' +
  '    (src/components/PracticeLink.astro).\n' +
  '  - In a plain string (an FAQ answer, a visit step): [Mobile Aesthetics](site:practice)\n' +
  '    (src/lib/inlineLinks.ts).\n' +
  '  - An FAQ question keeps the name as plain text. Inside any other control, reword.\n' +
  '  - Any other label, address or placement needs the human operator (CLAUDE.md constraint 2).';

function runScan() {
  if (!existsSync(distDir)) {
    console.error('lint:practice-link: dist/ not found — run `npm run build` first.');
    process.exit(1);
  }
  const url = practiceUrl();
  let count = 0;
  let links = 0;
  const files = listHtml(distDir);
  for (const file of files) {
    const rel = relative(root, file).replaceAll('\\', '/');
    const html = readFileSync(file, 'utf8');
    for (const f of scanHtml(html, url)) {
      count += 1;
      console.error(`  ${rel}  [${f.rule}]  ${f.detail}`);
    }
    links += countLinks(html, url);
  }
  if (count > 0) {
    console.error(`\nlint:practice-link FAILED — ${count} finding(s).\n${HOW_TO_FIX}`);
    process.exit(1);
  }
  console.log(
    `lint:practice-link passed — ${files.length} pages, ${links} links to the practice site, no plain mention of the practice's name in visible text.`,
  );
}

/** How many links on a page go to the screened address (for the summary line). */
function countLinks(html, url) {
  const site = url.toLowerCase();
  let n = 0;
  for (const m of html.matchAll(/<a\b[^>]*?\bhref\s*=\s*"([^"]*)"/gi)) {
    if (m[1].trim().toLowerCase().replace(/\/+$/, '') === site) n += 1;
  }
  return n;
}

function runSelfTest() {
  const url = 'https://yourmobileaesthetics.com';
  const good =
    '<a href="https://yourmobileaesthetics.com" class="x" data-event="ma_site_click" target="_blank" rel="noopener">' +
    'Mobile Aesthetics<span class="sr-only"> (opens in new tab)</span></a>';
  const bad = [
    ['unlinked', '<p>Amy owns Mobile Aesthetics in Harrisburg.</p>'],
    ['unlinked', '<p>Mobile&nbsp;Aesthetics</p>'],
    ['unlinked', '<p>Mobile Aesthetics</p>'],
    ['unlinked', '<p>Mobile\n      Aesthetics</p>'],
    ['unlinked', '<p>It runs under <strong>Mobile Aesthetics</strong>.</p>'],
    ['unlinked', '<h2>Mobile Aesthetics. On screen.</h2>'],
    ['unlinked', '<p><a href="https://example.com">Mobile Aesthetics</a></p>'],
    ['unlinked', `<p>${good} and again Mobile Aesthetics</p>`],
    ['unlinked', '<button type="button">Mobile Aesthetics</button>'],
    ['attributes', '<p><a href="https://yourmobileaesthetics.com">Mobile Aesthetics</a></p>'],
    [
      'attributes',
      '<a href="https://yourmobileaesthetics.com" target="_blank" rel="noopener" data-event="ma_site_click">Mobile Aesthetics</a>',
    ],
    [
      'attributes',
      '<a href="https://yourmobileaesthetics.com/" target="_blank" rel="noopener" data-event="book_click">Mobile Aesthetics<span> (opens in new tab)</span></a>',
    ],
    [
      'address',
      '<a href="https://yourmobileaesthetics.com/biote" target="_blank" rel="noopener" data-event="ma_site_click">Mobile Aesthetics<span> (opens in new tab)</span></a>',
    ],
    ['control', `<details><summary>Why ${good}?</summary><p>Because.</p></details>`],
    ['control', `<button type="button">${good}</button>`],
  ];
  const clean = [
    `<p>Amy owns ${good} in Harrisburg.</p>`,
    `<h2>${good}. On screen.</h2>`,
    `<p>It runs under <strong>${good}</strong>, Amy's own practice.</p>`,
    '<details><summary>Why does the storefront say Mobile Aesthetics?</summary><p>It is hers.</p></details>',
    '<title>Mobile Aesthetics | Needle Girlie</title>',
    '<img src="/a.png" alt="Mobile Aesthetics PLLC">',
    '<meta property="og:title" content="Mobile Aesthetics Harrisburg, NC">',
    '<div data-label="a > b — Mobile Aesthetics with Evolus">film</div>',
    "<div data-label='Girl team > Mobile Aesthetics'>film</div>",
    '<script type="application/ld+json">{"name":"Mobile Aesthetics","x":"<p>Mobile Aesthetics</p>"}</script>',
    '<style>.x::after{content:"Mobile Aesthetics"}</style>',
    '<!-- Mobile Aesthetics -->',
    '<p>in Medical Aesthetics training</p>',
    '<p>A mobile studio. Aesthetics, made personal.</p>',
    `<a href="https://yourmobileaesthetics.com" target="_blank" rel="noopener" data-event="ma_site_click"><img src="/m.svg" alt="Mobile Aesthetics PLLC"><span class="sr-only">(opens in new tab)</span></a>`,
    `<a href="https://yourmobileaesthetics.com" class="cta" target="_blank" rel="noopener" data-event="ma_site_click">Visit Mobile Aesthetics <span aria-hidden="true">&rsaquo;</span><span class="sr-only">(opens in new tab)</span></a>`,
  ];

  let failed = false;
  for (const [rule, sample] of bad) {
    const found = scanHtml(sample, url);
    if (!found.some((f) => f.rule === rule)) {
      console.error(`self-test: did NOT flag [${rule}]: ${sample}`);
      failed = true;
    }
  }
  for (const sample of clean) {
    const found = scanHtml(sample, url);
    if (found.length > 0) {
      console.error(`self-test: clean sample was flagged (${found.map((f) => f.rule).join(', ')}): ${sample}`);
      failed = true;
    }
  }
  if (failed) {
    console.error('lint:practice-link self-test FAILED — the gate itself is broken.');
    process.exit(1);
  }
  console.log('lint:practice-link self-test passed.');
}

if (process.argv.includes('--self-test')) {
  runSelfTest();
} else {
  runScan();
}
