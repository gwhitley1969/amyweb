#!/usr/bin/env node
/**
 * Writes staticwebapp.config.json into the build output from the templates in
 * config/swa/ (BUILD_SPEC §4, §14).
 *
 * - PUBLIC_ENV=production  -> production.json (Front Door lockdown; requires
 *   FRONT_DOOR_ID, otherwise the build FAILS — a production build must never
 *   ship with an unlocked origin or a placeholder FDID).
 * - anything else          -> preview.json (no lockdown; PR previews rely on
 *   the SWA environment password instead).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const distDir = resolve(root, 'dist');
const isProduction = process.env.PUBLIC_ENV === 'production';
const variant = isProduction ? 'production' : 'preview';
const templatePath = resolve(root, 'config', 'swa', `${variant}.json`);

if (!existsSync(distDir)) {
  console.error('generate-swa-config: dist/ not found — run `astro build` first.');
  process.exit(1);
}

let config = readFileSync(templatePath, 'utf8');

if (isProduction) {
  const fdid = process.env.FRONT_DOOR_ID?.trim();
  const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!fdid || !guidPattern.test(fdid)) {
    console.error(
      'generate-swa-config: FRONT_DOOR_ID is missing or not a GUID. ' +
        'Production builds must inject the Front Door ID (repo variable FRONT_DOOR_ID). Aborting.',
    );
    process.exit(1);
  }
  config = config.replaceAll('__FRONT_DOOR_ID__', fdid);
} else if (config.includes('allowedIpRanges')) {
  console.error('generate-swa-config: preview template must not contain a network lockdown. Aborting.');
  process.exit(1);
}

// Drop the human-facing comment key from the deployed artifact.
const parsed = JSON.parse(config);
delete parsed.$comment;

// Analytics CSP (2026-08-17, DECISIONS same date): admit the Plausible
// event endpoint in connect-src ONLY when the built page actually ships
// the self-hosted tracker (BaseLayout emits it when siteConfig.analytics
// is enabled + 'plausible'). This script runs AFTER `astro build`, so
// sniffing dist/ ties the header to what shipped — the CSP cannot drift
// from the code, and while analytics is dark the artifact is
// byte-identical to before. script-src stays 'self': the tracker is
// self-hosted in public/js/ (the site's static-script rule).
const homeHtmlPath = resolve(distDir, 'index.html');
const analyticsShipped =
  existsSync(homeHtmlPath) && readFileSync(homeHtmlPath, 'utf8').includes('src="/js/plausible.js"');
if (analyticsShipped) {
  const csp = parsed.globalHeaders['Content-Security-Policy'];
  if (!csp.includes('connect-src')) {
    parsed.globalHeaders['Content-Security-Policy'] = csp.replace(
      "default-src 'self'; ",
      "default-src 'self'; connect-src 'self' https://plausible.io; ",
    );
  }
  if (!parsed.globalHeaders['Content-Security-Policy'].includes("connect-src 'self' https://plausible.io")) {
    console.error('generate-swa-config: analytics shipped but the CSP widening failed. Aborting.');
    process.exit(1);
  }
  console.log('generate-swa-config: analytics shipped — connect-src admits plausible.io');
}

const artifact = JSON.stringify(parsed, null, 2) + '\n';
if (artifact.includes('__FRONT_DOOR_ID__')) {
  console.error('generate-swa-config: placeholder survived into the artifact. Aborting.');
  process.exit(1);
}
if (isProduction && !artifact.includes(process.env.FRONT_DOOR_ID.trim())) {
  console.error('generate-swa-config: FRONT_DOOR_ID was not injected into the artifact. Aborting.');
  process.exit(1);
}

const outPath = resolve(distDir, 'staticwebapp.config.json');
writeFileSync(outPath, artifact);
console.log(`generate-swa-config: wrote ${variant} config -> dist/staticwebapp.config.json`);
