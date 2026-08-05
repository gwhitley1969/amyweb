#!/usr/bin/env node
/**
 * Compliance linter (CLAUDE.md hard constraint 3, BUILD_SPEC §8).
 *
 * Scans every text file under src/** (content, pages, components, layouts,
 * lib, styles — §8 applies to ALL text, including component copy and
 * comments) against the banned-pattern registry in
 * compliance/banned-patterns.json, then runs inverse checks on treatment
 * content:
 *   - investigational: true  -> the investigational disclosure must be present
 *   - retatrutide mentioned  -> investigational: true is required
 *   - symptom-awareness language -> bioteDisclaimer: true is required (the
 *     treatment layout injects the FDA disclaimer from that flag)
 *
 * `--self-test` proves the gate works before trusting it: every category must
 * flag a known-bad sample and pass a known-clean sample, and every inverse
 * check must fire. Test samples are assembled from string fragments at
 * runtime because banned phrasings (dosing etc.) may not exist verbatim in
 * any committed file.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const registryPath = resolve(root, 'compliance', 'banned-patterns.json');
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));

// Scope only ever grows (like the pattern list): narrowing it needs the
// human operator.
const SCAN_DIRS = ['src/content', 'src/pages', 'src/components', 'src/layouts', 'src/lib', 'src/styles'];
const TEXT_EXTENSIONS = new Set(['.md', '.mdx', '.astro', '.ts', '.js', '.mjs', '.json', '.html', '.txt']);

const categories = registry.categories.map((cat) => ({
  name: cat.name,
  regexes: cat.patterns.map((p) => new RegExp(p, 'iu')),
  patterns: cat.patterns,
}));

const SYMPTOM_LANGUAGE =
  /\b(?:fatigue|low\s+energy|night\s+sweats|hot\s+flashes|brain\s+fog|libido|mood\s+swings|trouble\s+sleeping|poor\s+sleep|weight\s+gain)\b/iu;
const INVESTIGATIONAL_FLAG = /^\s*investigational:\s*true\s*$/m;
const BIOTE_FLAG = /^\s*bioteDisclaimer:\s*true\s*$/m;
const INVESTIGATIONAL_DISCLOSURE = /investigational/i;
const NOT_FDA_APPROVED = /not\s+fda[- ]approved/i;

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...listFiles(full));
    } else if ([...TEXT_EXTENSIONS].some((ext) => entry.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

/** Scan one file's text; returns violations [{line, category, match}]. */
function scanText(text) {
  const violations = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((lineText, i) => {
    for (const cat of categories) {
      for (const re of cat.regexes) {
        const m = lineText.match(re);
        if (m) {
          violations.push({ line: i + 1, category: cat.name, match: m[0].trim() });
        }
      }
    }
  });
  return violations;
}

/** Inverse checks for treatment content files; returns violation strings. */
function inverseChecks(text) {
  const problems = [];
  if (INVESTIGATIONAL_FLAG.test(text)) {
    if (!INVESTIGATIONAL_DISCLOSURE.test(text.replace(INVESTIGATIONAL_FLAG, '')) || !NOT_FDA_APPROVED.test(text)) {
      problems.push(
        'investigational: true requires the investigational disclosure (must state the compound is investigational and not FDA-approved)',
      );
    }
  }
  if (/retatrutide/i.test(text) && !INVESTIGATIONAL_FLAG.test(text)) {
    problems.push('mentions Retatrutide but is not flagged investigational: true');
  }
  if (SYMPTOM_LANGUAGE.test(text) && !BIOTE_FLAG.test(text)) {
    problems.push(
      'contains symptom-awareness language but bioteDisclaimer is not true — the FDA disclaimer would not be injected',
    );
  }
  return problems;
}

function runScan() {
  let failed = false;
  for (const dir of SCAN_DIRS) {
    const abs = resolve(root, dir);
    let files = [];
    try {
      files = listFiles(abs);
    } catch {
      continue; // directory may not exist yet
    }
    for (const file of files) {
      const rel = relative(root, file).replaceAll('\\', '/');
      const text = readFileSync(file, 'utf8');
      for (const v of scanText(text)) {
        failed = true;
        console.error(`  ${rel}:${v.line}  [${v.category}]  "${v.match}"`);
      }
      if (rel.startsWith('src/content/treatments/')) {
        for (const p of inverseChecks(text)) {
          failed = true;
          console.error(`  ${rel}  [inverse-check]  ${p}`);
        }
      }
    }
  }
  if (failed) {
    console.error('\nlint:claims FAILED — fix the content; never weaken the pattern list to pass.');
    process.exit(1);
  }
  console.log('lint:claims passed — no banned patterns found.');
}

function runSelfTest() {
  // Known-bad samples per category, assembled from fragments (see header).
  const j = (...parts) => parts.join('');
  const badSamples = {
    dosing: [j('take 1', '0 m', 'g every week'), j('reconstitu', 'tion steps'), j('weekly injec', 'tions every month')],
    'disease-claims': [j('this trea', 'ts wrinkles'), j('supports patients with Alzhei', "mer's"), j('preven', 'ts illness')],
    'outcome-promises': [j('results guaran', 'teed'), j('pro', 'ven results'), j('see the before and af', 'ter')],
    superiority: [j('the #', '1 provider'), j('the be', 'st injector in town'), j('top-ra', 'ted med spa')],
    'banned-angles': [j('lowers blood su', 'gar'), j('anti-ag', 'ing benefits'), j('boo', 'sts immunity fast')],
    'credential-inflation': [j('Dr. A', 'my will see you'), j('our physi', 'cian on staff')],
  };
  const cleanSample = [
    'Needle Girlie offers injectable treatments in Harrisburg, NC.',
    'Wondering if this treatment fits your goals? Request a consultation.',
    'Book an appointment through our online scheduling partner.',
    'Retatrutide is investigational and not FDA-approved.',
  ].join('\n');

  let failed = false;
  for (const cat of categories) {
    const samples = badSamples[cat.name];
    if (!samples) {
      console.error(`self-test: no bad samples defined for category "${cat.name}" — add them.`);
      failed = true;
      continue;
    }
    for (const sample of samples) {
      const hits = scanText(sample).filter((v) => v.category === cat.name);
      if (hits.length === 0) {
        console.error(`self-test: category "${cat.name}" did NOT flag: "${sample}"`);
        failed = true;
      }
    }
  }
  const cleanHits = scanText(cleanSample);
  if (cleanHits.length > 0) {
    console.error('self-test: clean sample was flagged (false positive):', cleanHits);
    failed = true;
  }

  // Inverse checks must fire.
  const investigationalMissingDisclosure = 'investigational: true\n\nSome copy without the required wording.';
  const retatrutideUnflagged = 'investigational: false\n\nWe offer Retatrutide.';
  const symptomsWithoutBiote = 'bioteDisclaimer: false\n\nDo you struggle with fatigue or brain fog?';
  const compliantBiote =
    'bioteDisclaimer: true\n\nDo you struggle with fatigue or brain fog?';
  if (inverseChecks(investigationalMissingDisclosure).length === 0) {
    console.error('self-test: investigational disclosure check did not fire');
    failed = true;
  }
  if (inverseChecks(retatrutideUnflagged).length === 0) {
    console.error('self-test: retatrutide flag check did not fire');
    failed = true;
  }
  if (inverseChecks(symptomsWithoutBiote).length === 0) {
    console.error('self-test: biote symptom check did not fire');
    failed = true;
  }
  if (inverseChecks(compliantBiote).length !== 0) {
    console.error('self-test: biote check false positive on compliant file');
    failed = true;
  }

  if (failed) {
    console.error('lint:claims self-test FAILED — the gate itself is broken; do not trust a passing scan.');
    process.exit(1);
  }
  console.log(`lint:claims self-test passed — ${categories.length} categories verified.`);
}

if (process.argv.includes('--self-test')) {
  runSelfTest();
} else {
  runScan();
}
