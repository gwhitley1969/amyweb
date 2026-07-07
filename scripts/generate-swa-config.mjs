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
