/**
 * Text rules for /search results (DECISIONS 2026-10-12), kept apart from
 * the DOM code in site-search.js so scripts/test-search.mjs can check them.
 *
 * PRACTICE matches the practice's name the way lint:practice-link does
 * (scripts/lint-practice-link.mjs: /mobile\s+aesthetics/iu) — any casing,
 * any run of whitespace — because visible text naming the practice must
 * become PracticeLink (CLAUDE.md constraint 2, seventh exception).
 */
export const PRACTICE = /mobile\s+aesthetics/iu;
const PRACTICE_ALL = new RegExp(PRACTICE.source, 'giu');

/** `/about/` -> `/about`; `/` stays `/`. */
export const cleanUrl = (url) => url.replace(/\/+$/, '') || '/';

/**
 * The title is the result's link text, and a link cannot hold the
 * PracticeLink, so a title part that names the practice is dropped (the
 * home page's "Needle Girlie | Mobile Aesthetics in …" shows "Needle Girlie").
 */
export function cleanTitle(title) {
  const parts = (title ?? '').replace(/\s*\|\s*Needle Girlie\s*$/, '').split(/\s*\|\s*/);
  return parts.filter((part) => !PRACTICE.test(part)).join(' | ') || 'Needle Girlie';
}

/** The description's text around each mention of the practice. */
export const splitPractice = (text) => (text ?? '').split(PRACTICE_ALL);
