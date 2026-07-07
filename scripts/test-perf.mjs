#!/usr/bin/env node
/**
 * Performance gate (BUILD_SPEC §13): Lighthouse CI against the built site
 * (lighthouserc.json holds the budgets). Uses an installed Chrome/Edge if
 * chrome-launcher can find one, otherwise falls back to the Chrome that
 * puppeteer (a pa11y-ci dependency) downloaded.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '..');

if (!existsSync(resolve(root, 'dist'))) {
  console.error('test-perf: dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const env = { ...process.env };
if (!env.CHROME_PATH) {
  try {
    const puppeteer = require('puppeteer');
    env.CHROME_PATH = puppeteer.executablePath();
  } catch {
    // fine — chrome-launcher will look for a system Chrome
  }
}

const pkgJsonPath = require.resolve('@lhci/cli/package.json', { paths: [root] });
const pkgJson = require(pkgJsonPath);
const bin = typeof pkgJson.bin === 'string' ? pkgJson.bin : Object.values(pkgJson.bin)[0];
const lhci = spawn(
  process.execPath,
  [join(dirname(pkgJsonPath), bin), 'autorun', '--config', resolve(root, 'lighthouserc.json')],
  { cwd: root, stdio: 'inherit', env },
);
lhci.on('close', (code) => process.exit(code ?? 1));
