import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/**
 * Resolve a Chrome/Edge executable for the headless gates. Preference order:
 * 1. CHROME_PATH (explicit override)
 * 2. A system-installed stable Chrome/Edge (CI runners ship one that is
 *    known-good there; puppeteer's downloaded build has crashed on
 *    ubuntu-24.04 runners)
 * 3. puppeteer's bundled Chrome (present as a pa11y-ci dependency)
 */
export function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const candidates =
    process.platform === 'win32'
      ? [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        ]
      : process.platform === 'darwin'
        ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
        : [
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
          ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }

  try {
    const puppeteer = require('puppeteer');
    return puppeteer.executablePath();
  } catch {
    return undefined;
  }
}
