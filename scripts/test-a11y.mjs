#!/usr/bin/env node
/**
 * Accessibility gate (BUILD_SPEC §12): serves the built site with
 * `astro preview` and runs pa11y-ci (axe runner, WCAG 2.2 AA-oriented)
 * against the routes in .pa11yci.json. Requires `npm run build` first.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '..');
const PORT = 4325;

if (!existsSync(resolve(root, 'dist'))) {
  console.error('test-a11y: dist/ not found — run `npm run build` first.');
  process.exit(1);
}

function binPath(pkg) {
  const pkgJsonPath = require.resolve(`${pkg}/package.json`, { paths: [root] });
  const pkgJson = require(pkgJsonPath);
  const bin = typeof pkgJson.bin === 'string' ? pkgJson.bin : Object.values(pkgJson.bin)[0];
  return join(dirname(pkgJsonPath), bin);
}

const server = spawn(
  process.execPath,
  [binPath('astro'), 'preview', '--port', String(PORT)],
  { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] },
);
server.stderr.on('data', (d) => process.stderr.write(d));

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('astro preview did not start within 30s');
}

let exitCode = 1;
try {
  await waitForServer();
  exitCode = await new Promise((resolvePromise) => {
    const pa11y = spawn(
      process.execPath,
      [binPath('pa11y-ci'), '--config', resolve(root, '.pa11yci.json')],
      { cwd: root, stdio: 'inherit' },
    );
    pa11y.on('close', (code) => resolvePromise(code ?? 1));
  });
} catch (err) {
  console.error(`test-a11y: ${err.message}`);
} finally {
  server.kill();
}
process.exit(exitCode);
