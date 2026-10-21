# Site search (Pagefind) — design

Date: 2026-10-12. Status: design approved by the operator in chat (2026-10-12);
this written spec awaits review.

## Intent

Visitors type a word ("lips", "tox", "weight loss", "laser") and reach the
right page. Fully static: no server, no cookies, no third party, nothing
about a query leaves the browser.

Not in the signed SOW (it lists no search) — record as a SOW divergence /
possible change order.

## Operator decisions on record (2026-10-12)

1. Pagefind, chosen over the recommended hand-written search after the flag
   (new dependency; CSP gains `'wasm-unsafe-eval'`).
2. Pagefind's native program was blocked by Smart App Control on the
   operator's PC; the operator turned Smart App Control off for the machine
   after the flag that it has no per-program exception.
3. Results show the page's title and meta description only — never
   Pagefind's text excerpt.

## Measured (Pagefind 1.5.2 over the phase-c build at f469ad0)

- 25 pages, 1,716 words indexed in 0.04 s (before the body scoping below).
- `pagefind.js` 45.6 KB raw / 12.8 KB gzip; `pagefind-worker.js` 41.3 KB /
  11.9 KB; `wasm.en.pagefind` 72 KB (already compressed); index files
  ~88 KB on disk in total, fetched per query in small chunks.
- The worker loads from `/pagefind/pagefind-worker.js` (same origin), index
  chunks by same-origin fetch, the wasm through `WebAssembly.instantiate*`.
  So the only CSP change is `'wasm-unsafe-eval'` in `script-src`.
- The shipped default UI (`pagefind-ui.js`, 29.7 KB gzip) is NOT used.

## Design

### Index (build time)

- `pagefind` becomes a devDependency (exact version pinned). The build script
  becomes `astro build && pagefind --site dist && node
  scripts/generate-swa-config.mjs`. CI (Linux) gets its own platform package
  through npm's optional dependencies.
- `BaseLayout` puts `data-pagefind-body` on `<main>` for searchable pages only
  (a layout prop, default on). Off for: `/styleguide/*`, `404`, `/search`.
  Header and footer are outside `<main>`, so they are never indexed.
- The result's title and description come from the page's SEO title and meta
  description (`data-pagefind-meta` on the existing tags in `SeoHead`), the
  copy already written for display outside the page. Implementation verifies
  Pagefind reads meta captured in `<head>`; if it does not, a hidden element
  inside `<main>` carries the same two values.
- Caption files (`.vtt`) are never indexed: Pagefind reads HTML only.

### `/search` page

- New route `src/pages/search.astro` on `BaseLayout`: heading, a labelled
  `<input type="search">` (no `<form>` element — constraint 5's "no forms"),
  a results list, and a polite live region announcing the count ("3 pages
  match" / "No pages match — try another word, or browse the services").
- Always `noindex` and left out of the sitemap (a search page has no content
  of its own).
- Script `public/js/site-search.js` (CSP refuses inline scripts), small, no
  dependency. It imports `/pagefind/pagefind.js` only on the visitor's first
  focus or keystroke in the box, so the page's load fetches about 2 KB of
  script; the ~25 KB of Pagefind script and the 72 KB wasm arrive only when
  someone searches. Debounced input; up to 10 results.
- A result: the page title as the link (to the page), the meta description
  as plain text below. No excerpt, no highlighting.
- Practice-name rule (constraint 2, seventh exception): when a description
  names Mobile Aesthetics (today only /about's), the name is rendered as the
  `PracticeLink` component's own output — cloned from a `<template>` the page
  renders server-side, so the markup is the component's, not a copy — as its
  own link beside the title link, never nested inside it.
- Optional `?q=` on load pre-fills and runs the query (so a typed URL works);
  nothing writes the query anywhere else.
- Voice: Amy's voice, no "we"; microcopy reads "Search" / "Search the site".
- Works without JS? No — without JS the page says search needs JavaScript and
  links to /services. Every page stays reachable through the menu either way.

### Header

- A search icon link (magnifier, accessible name "Search") to `/search` in
  the header's right group, beside Book and the menu button. A plain link —
  no script on any other page. Desktop and phone renders go to the operator
  before the PR (the header has a history of changes rejected on sight).

### Compliance reasoning

- Excerpts are off because an excerpt can print, on /search, sentences whose
  exceptions say "never restated elsewhere": the EvolusLaurel ranking lines,
  "$265 for six weeks", the wrinkle-relaxers deck, the regenerative summary,
  "top of class", the Girl Team unit, the IPL who-performs lines, the
  allowlisted price strings and curriculum titles. Titles and meta
  descriptions are the copy already published outside each page (search
  engines, link previews), so showing them on /search restates nothing new.
- Matching still uses body text, so a query can find a page by a word only
  its body contains; only the title and description are displayed.
- The other providers' names live only in caption cues, which are not
  indexed; the booking vendor appears only on /privacy and /terms, whose
  descriptions do not name it.

### Infrastructure

- CSP: `script-src 'self' 'wasm-unsafe-eval'` in `config/swa/production.json`
  and `config/swa/preview.json` (kept in sync).
- SWA: the preview is tested for `.pf_meta`, `.pf_index`, `.pf_fragment` and
  `.pagefind`; if SWA will not serve them, `mimeTypes` entries
  (`application/octet-stream`) are added to both templates. Front Door caches
  them like any static file; the release's cache purge covers them.
- Run-rate cost: $0.

### Gates and tests

- `npm run build && npm run check` and `npm run verify` stay green.
- New `scripts/check-search-index.mjs` (in `verify:fast`, with a self-test
  like the other gates): reads the built index and fails if (a) the set of
  indexed URLs differs from the expected list (no /styleguide, 404, /search),
  or (b) any caption cue text from `public/media/*.vtt` appears in it.
- `/search` joins `.pa11yci.json` twice: empty, and with a query typed (pa11y
  actions), so results and the live region are checked.
- `/search` joins the Lighthouse URL list under the house row (30 KB script
  budget). If the measured number does not fit, the operator gets the number
  before any carve-out is proposed.
- Browser test: query → results → click, keyboard only; Chrome and Firefox.

### Records

- DECISIONS entry (context → decision → alternatives → consequences), the
  three operator decisions above included; CHANGELOG line; SOW-divergence
  memory note; CLAUDE.md "Locked technical decisions" gains the sanctioned
  JS consumer (`site-search.js` + Pagefind's runtime on /search only) and
  the CSP change.

### Out of scope

Search analytics, filters, typo-tolerance tuning, search inside the
header popover, indexing PDFs or captions.
