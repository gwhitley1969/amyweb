# Ad landing pages (`/go/<slug>`) — design spec

**Date:** 2026-10-12 · **Branch:** `feat/landing-pages` (worktree off `phase-c`)
**Routes:** `/go/wrinkle-relaxers`, `/go/dermal-fillers`, `/go/biostimulators`,
`/go/laser-treatments`, `/go/skin-rejuvenation`, `/go/body-contouring`,
`/go/skincare`, `/go/iv-therapy` — eight pages, one per service line Google
will accept ads for today. The other four lines are deferred (see §12).
**Status:** decisions 1–6 locked by the operator on 2026-10-12 (DECISIONS
same date, the landing-pages entry, written when the branch opens).
**Addendum:** §13 (2026-10-13) — the four deferred lines enabled at Amy's
request; twelve pages.

## 1. Context

Amy's text of 2026-10-12 listed "SEO set up / Landing pages / Google search
ads". The operator judged that "the treatment pages already serve as landing
pages", while true, would not satisfy the client, and chose purpose-built ad
pages. The pages exist to be the destinations of search ads (and of
Instagram, text and QR links); until an ad points at one it has no visitors.

Facts that shape the design, all recorded in DECISIONS 2026-10-12:

- Google judges the landing page as well as the ad. For US campaigns,
  prescription drug names may appear in ad text and on the landing page
  without certification; keyword-targeting them requires certification.
- Platelet-rich plasma is named on Google's cell-therapy prohibition, so
  `/services/regenerative` is not an ad destination at all. Weight loss,
  hormones and peptides may be refused (drug-name keywords; the
  prescription-services rule; retatrutide is investigational, which sits
  under Google's speculative-treatment rule). Amy holds no LegitScript
  certification. Those four lines are out of the first build.
- Hard constraint 5 bars Google's conversion tag. Ad results are calls (a
  Google forwarding number inside the ad) and bookings; no attribution.

## 2. Goals and non-goals

Goals: eight pages Amy can open on her phone that read as finished ad pages;
each one subject, one action; nothing written twice; hidden from search
engines; inside every existing gate and budget; add-a-page is a one-line
list edit.

Non-goals: new treatment copy (a later content round if Amy wants ad-tuned
headlines); forms or lead capture (constraint 5); conversion tracking
(constraint 5); films, photos or decks from the treatment pages (page-scoped
overrides stay on their pages); a page for the four deferred lines (the
layout supports them; the list does not enable them).

## 3. Routes, indexing, hosting

- `src/pages/go/[slug].astro` — `getStaticPaths` over `LANDING_SLUGS` in
  `src/lib/landing.ts`, reading the treatment collection. A slug in the
  list that is `draft: true` or missing from the collection fails the build.
- **noindex.** `SeoHead` gains `noindex?: boolean`; when true it emits
  `<meta name="robots" content="noindex, nofollow">` in every build (today
  the tag is emitted only in non-production builds). `BaseLayout` passes it
  through. Both SWA templates (`config/swa/production.json`,
  `config/swa/preview.json`) gain a route `/go/*` with
  `X-Robots-Tag: noindex, nofollow` (the shared-headers rule: the two files
  stay in sync). `robots.txt` is unchanged: a `Disallow` would stop Google
  reading the tag.
- **Sitemap.** `astro.config.mjs`: `sitemap({ filter: (page) =>
  !page.includes('/go/') })`. The sitemap stays at 21 URLs.
- Canonical is self (noindex plus a cross-canonical is a mixed signal).
  `<title>` and description are the entry's `seo` strings. No JSON-LD on
  these pages beyond the sitewide business block BaseLayout already emits
  (no second `Service` node for the same service).
- Google's click id arrives as a query string; the static page serves
  unchanged with it (checked on production 2026-10-12).

## 4. Content model

Every string on a landing page is an approved string from the treatment
entry, a site-config fact, or a layout string that already renders on the
treatment pages. The pages render, in this fixed order:

| Block | Source | Note |
|---|---|---|
| Header bar | `LandingHeader` | wordmark (not a link), `CTAButton variant="call"` |
| Eyebrow | site config | "Harrisburg, NC · near Charlotte" (the locality fact plus the phrase every treatment description already uses) |
| H1 | `entry.data.title` | same words as the treatment page's H1 |
| Lead | `entry.data.schemaDescription ?? entry.data.summary` | the factual description wherever an override exists (regenerative is the only such page; deferred anyway) |
| CTA row | `CTAButton` book / consult / shop by `ctaType`, chip emphasis; `CTAButton variant="call"` | the same buttons the treatment pages carry |
| Portrait | the home hero's studio-counter portrait asset, in the arch, alt text from the share card | the one photo already approved sitewide; no caption |
| Evolus plaque | `EvolusLaurel` when `landing.ts` says so | wrinkle-relaxers and dermal-fillers only (§8) |
| "What Amy offers" | `ProductDetailCards` / products list | identical to the treatment page |
| Notices | `InvestigationalNotice`, `BioteDisclaimer` by the entry's flags | none of the eight sets either; the layout honours both |
| Visit steps | `VisitSteps` | as on the treatment pages |
| FAQ | `FaqAccordion` with `entry.data.faq` minus `landing.ts` exclusions | the laser "Can I book a laser treatment directly?" answer is excluded by its question text (§8) |
| Router card | the layout's existing card and chip | approved copy |
| Disclaimer | `DisclaimerBlock` | mandatory, never collapsed |
| Noir close | "Ready when you are" + CTA + call + `TrustChips` | as on the treatment pages |
| Footer | `Footer` in a `landing` variant | the address block (practice name through `PracticeLink`) and the legal links; no nav, no social, no app block |
| Sticky bar | `StickyActions` | phones only: book/consult/shop chip + call; CSS only |

Not rendered: `deck`, the MDX body (`<Content />`), `film`, any photo from
the entry, breadcrumbs, the primary nav, the header badge.

`src/lib/landing.ts`:

```ts
export const LANDING_SLUGS = [
  'wrinkle-relaxers', 'dermal-fillers', 'biostimulators', 'laser-treatments',
  'skin-rejuvenation', 'body-contouring', 'skincare', 'iv-therapy',
] as const;
// Per-page selection rules. Each entry cites the DECISIONS date of the
// page-scoped authorization it honours.
export const LANDING_RULES: Record<string, { laurel?: true; faqExclude?: string[] }> = {
  'wrinkle-relaxers': { laurel: true },           // CLAUDE.md c.3, extended 2026-10-12
  'dermal-fillers':   { laurel: true },           // same
  'laser-treatments': { faqExclude: ['Can I book a laser treatment directly?'] }, // §8.7 exception stays on its page
};
```

A `faqExclude` question that no longer exists in the entry fails the build
(`astro check`-time assertion in the route), so the rule cannot silently
rot.

## 5. Design plan (BUILD_SPEC §5) and self-critique

**Palette and type:** unchanged; the pages use the design tokens as they
are (noir shell, ombre canvas, Playfair display, the pink-500 chip, ink
accents on the canvas). No new colour.

**Layout concept:** a single column at the treatment page's measure, with
the two actions placed where a paid click expects them: under the lead,
and pinned to the bottom of a phone screen. The header is a noir bar with
the wordmark and one Call button and nothing to tap through to. The page
is the treatment page with its editorial tissue removed: no breadcrumbs,
no deck, no media rows, no films, no site navigation. The noir close and
the disclaimer stay exactly as they are.

**Signature element:** the sticky action bar is the only new element. It
is the conversion convention of the genre and the one thing a visitor from
an ad notices. It wears the noir surface with the pink chip, so it reads
as the site's own close, always in view.

**Self-critique.** A menu-less page with a sticky bar is what any agency
builds for any med spa; what keeps it this site is the arch portrait, the
plaque, the typographic scale of the H1 and the ombre canvas, none of
which is generic. The risk is bareness: without the media rows a page is
title, lead, cards, FAQ. The portrait under the CTA row is the answer, and
it is why decision 5 included it. A second risk is the sticky bar covering
the disclaimer's last lines on short screens; the main element takes a
bottom padding equal to the bar's height so nothing is hidden. The bar is
hidden from `md` up, where the CTA row and the close are always a scroll
away.

## 6. Components and files

New:
- `src/layouts/LandingLayout.astro` — props mirror `TreatmentLayout`'s
  minus `deck`, `film`, `jsonLd`; plus `laurel: boolean`, `faq` already
  filtered. The compliance order in §4 is fixed here, as it is in
  `TreatmentLayout`; the header comment says so.
- `src/components/LandingHeader.astro` — noir bar: `Picture` wordmark (no
  link), `CTAButton variant="call"`. No nav, no badge.
- `src/components/StickyActions.astro` — fixed bottom bar, `md:hidden`,
  safe-area padding, two `CTAButton`s. No script.
- `src/lib/landing.ts` — the list and the rules (§4).
- `src/pages/go/[slug].astro` — the route.

Changed:
- `src/components/SeoHead.astro` — `noindex` prop.
- `src/layouts/BaseLayout.astro` — passes `noindex` through.
- `src/components/Footer.astro` — `variant?: 'landing'` renders the
  address block and the legal list only.
- `src/components/EvolusLaurel.astro` — header comment lists the two
  `/go/` pages (the authorization text in CLAUDE.md is the source).
- `astro.config.mjs` — sitemap filter.
- `config/swa/production.json`, `config/swa/preview.json` — the `/go/*`
  header route.
- `.pa11yci.json` — eight URLs (25 → 33). `lighthouserc.json` — one
  URL, `/go/wrinkle-relaxers/index.html`, under the house row (the
  default matrix pattern already matches it).

Budgets: zero client JS (the FAQ is native `<details>`); one responsive
image inside the 240 KB image budget; document, font and stylesheet
budgets unchanged. The page shares the site's single stylesheet.

## 7. Compliance map (CLAUDE.md)

1. No server code: static route. ✓
2. Other providers: no film, no photo, no mention; the footer's practice
   name links through `PracticeLink` (the seventh exception's terms);
   booking links open `siteConfig.booking.url` (the tenth exception's
   terms). `lint:practice-link` and `lint:voice` run over the built pages.
3. Claims: every rendered string is already approved on its treatment
   page. Page-scoped overrides are kept off by construction (§4) or by
   rule (§8). `lint:claims` scans the new source files (they carry no
   treatment text). Notices and `DisclaimerBlock` render by the same
   flags and in the same order as `TreatmentLayout`.
4. Approval gate: the treatment files are untouched, so no flag resets;
   `check-approvals` is unaffected. The sign-off sheet gains a non-gated
   note (the /injector-training precedent) that Amy reviews the eight
   pages on the preview.
5. Privacy: no form, no script, no pixel, no third party. The noindex
   header is a response header, not a tracker. ✓
6. Accessibility: one H1, landmarks (`header`, `main`, `footer`), the
   sticky bar's buttons are the same focusable links; pa11y runs on all
   eight; reduced motion inherits the site's rules (no new motion).
7. Placeholders: none introduced.
8. Product cards: untouched inputs. ✓

## 8. Authorizations this spec needs from the operator (recorded in CLAUDE.md + DECISIONS when the branch opens)

- **EvolusLaurel** extended to `/go/wrinkle-relaxers` and
  `/go/dermal-fillers` (once per page; the component comment and the
  CLAUDE.md paragraph both gain the two routes). Decided 2026-10-12.
- **The laser booking answer** (§8.7 scoped exception) stays on
  `/services/laser-treatments` only; `/go/laser-treatments` omits that
  one FAQ item by rule. No extension.
- **"$265 for six weeks"** (peptide price lines): not extended, because
  `/go/peptide-therapy` is deferred. If that page is ever enabled, the
  extension is its own operator decision.
- Everything else page-scoped (the wrinkle-relaxers deck sentence, the
  weight-loss photo pairs, the hormone symptom language, every film and
  photo override) never reaches a landing page: the layout renders none
  of those fields.

## 9. Records

- BUILD_SPEC §6: one row, `/go/[slug]`, "ad landing pages — eight slugs
  enabled in `src/lib/landing.ts`; noindex; not in the sitemap"; §10: the
  noindex family; §13's script budget line unchanged (zero JS).
- CLAUDE.md constraint 3: the EvolusLaurel paragraph gains the two routes.
- DECISIONS: the landing-pages entry (decisions 1–6, the policy facts,
  the authorizations above, alternatives rejected).
- RUNBOOK "Everyday changes": adding or removing a landing page is a list
  edit plus the pa11y line.
- CLINICIAN-SIGN-OFF: non-gated note for the eight pages.
- CHANGELOG: when shipped.

## 10. Process and verification

1. Spec (this file) sent to the operator. In-browser mock of
   `/go/wrinkle-relaxers` (the live treatment page restyled in Playwright,
   JPEGs at 390 and 1280) for the operator's critique. No repo change.
2. Worktree `feat/landing-pages` off `phase-c`. Build the layout, the
   components, the route with the first slug, the plumbing (§3, §6), and
   the gate lists. `npm run verify` green. PR into `phase-c`; the preview
   is the review surface for the operator and for Amy.
3. After the first page is approved on the preview: the other seven
   slugs (a list edit plus the pa11y lines), the records (§9), verify, the
   same PR.
4. Acceptance on the preview: each `/go/` page serves 200 with
   `X-Robots-Tag: noindex, nofollow` and the meta tag; absent from
   `sitemap-0.xml`; the eight pa11y runs and the Lighthouse row green;
   `lint:voice`, `lint:claims`, `lint:practice-link` green; on a phone the
   sticky bar shows and hides nothing; the Book and Call links open the
   booking page and the dialer; the laser page shows no "Can I book a
   laser treatment directly?" item; the plaque renders once on the two
   injectable pages and nowhere else under `/go/`.
5. Merge into `phase-c` only on the operator's word; release to `main`
   by the two-stage route.

## 11. Alternatives rejected

- Pointing ads at the treatment pages with no new pages: accurate, cheap,
  and judged unsellable to the client (operator, 2026-10-12).
- A new frontmatter field for ad headlines: a schema change, twelve
  content edits, twelve flag resets and a sign-off round, for copy nobody
  has asked for yet. Deferred to a content round if Amy wants it.
- Per-page landing files written by hand: twelve copies of approved text
  to drift from their sources; the collection route makes drift
  impossible.
- `Disallow: /go/` in robots.txt: would hide the noindex tag from Google.
- A cross-canonical to the treatment page: contradicts noindex.
- All twelve pages: four cannot be ad destinations today (§1).

## 12. Deferred and open

- `weight-loss-glp-1`, `hormone-optimization`, `peptide-therapy`: enable
  only after the certification question is settled with Amy; the
  weight-loss page's retatrutide card would also have to stay off any ad
  page, which is a content decision for her. `regenerative`: not on
  Google under any route.
- Ad-tuned headlines: a later content round (twelve lines on a
  before-and-after sheet, the normal flag process).
- Measurement: unchanged; constraint 5 is the operator's to revisit.
- The Google Ads account, its campaigns and the call asset: the ads
  workstream, not this spec.

## 13. Addendum, 2026-10-13 — the four deferred lines enabled

Amy asked for landing pages for the remaining four lines, PRP included,
and will take the Google question herself (the operator, 2026-10-13).
Google's rules were re-read verbatim that day and are unchanged: PRP is
named on the cell-therapy prohibition (adspolicy answer 15596627); drug
names on a landing page need no certification, but keyword-targeting them
does (15595717); a business that prescribes or dispenses prescription
drugs may be treated as a prescription drug service (15598647);
Retatrutide is unapproved, which sits under the speculative-treatment
rule. The pages are built anyway: they also serve posts, texts and QR
codes, and they are noindex.

Enabled: `/go/regenerative`, `/go/weight-loss-glp-1`,
`/go/peptide-therapy`, `/go/hormone-optimization` — twelve pages, 37 in
the build. The mechanism of §3–§6 is unchanged. The content survey found
three page-scoped exceptions in fields the layout renders, settled by the
operator the same day:

1. **Peptides.** The "$265 for six weeks" lines on the GLOW and KLOW cards
   (§8) are extended to `/go/peptide-therapy`: the cards render as
   approved. CLAUDE.md constraint 3 and DECISIONS record the wider scope.
   Rejected: omitting the two cards by rule (a shorter menu than the
   treatment page shows); deferring the page again.
2. **Weight loss.** The Retatrutide card and its investigational notice
   render by the entry's flag, as on the treatment page. Rejected: a
   card-exclusion rule, which would raise the page's odds with Google at
   the cost of a page that no longer mirrors the approved one; Amy owns
   that trade.
3. **Regenerative.** The lead is the entry's `summary`, the operator-
   override sentence that is the visible lead of `/services/regenerative`,
   not the factual `schemaDescription` §4 would pick. A `lead` rule in
   `src/lib/landing.ts` does it, asserted at build (an entry with no
   `schemaDescription` cannot carry the rule). The page's meta description
   and OG text stay `seo.description`, which is factual, and the page
   emits no JSON-LD, so the override's never-restated terms hold.
   Rejected: the factual lead, the template's default.

Needing no decision: the hormone page's symptom vocabulary lives in the
MDX body only, which no landing page renders, so the linter's exact-path
exemption is not widened, and `/go/hormone-optimization` carries no FDA
box because the entry's flag is false (the clinician's direction);
`ctaType: consult` (regenerative, hormones) was already handled by the
layout and the sticky bar; `pricingDisplay: consult` is inert on both
layouts, so every price shows on both pages; the mg-keyed GLP-1 tiers are
global allowed strings. Flagged once, no action: the regenerative FAQ
answer "Can I book a regenerative treatment directly?" says yes and that
the procedure can follow the consultation at once — approved treatment
copy with no recorded exception, and consult-first, so it stays on both
pages. Gates: `.pa11yci.json` +4 (37 URLs); Lighthouse unchanged (the
house row matches `/go/`).
