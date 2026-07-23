# Skincare page (Skinbetter Science) — design spec

**Date:** 2026-07-23 · **Branch:** `feat/skincare-page` (worktree off `phase-c`)
**Route:** `/services/skincare` — the twelfth and final service line to get a
real page. BUILD_SPEC §6 route table: "Overview + storefront link-out";
§7 brief 9: "medical-grade skincare available through Amy's partner
storefront; shop link-out (`{{SKINBETTER_URL}}`)."

## Context

The stub `src/content/treatments/skincare.mdx` exists (`ctaType: shop`,
`pricingDisplay: none`, no photos, no product cards). The `shop` CTA variant
in `CTAButton.astro` and the `skinbetter_click` analytics event are already
built; the button renders the visible `{{SKINBETTER_URL}}` token until
`siteConfig.skinbetterUrl` resolves.

Facts established 2026-07-23 (operator session):

- The QR code on Amy's Skinbetter counter card (`C:\Amy\pics\20260623_175534.jpg`)
  decodes to `https://skinbetter.pro//MobileAesthetics?k=signup`, which
  301-redirects to the canonical `https://connect.skinbetter.com/MobileAesthetics`
  (verified live). `?k=signup` is the register-now variant; the bare
  storefront URL serves both registration and returning shoppers.
- **Operator decision:** use the canonical URL, without `?k=signup`.
- **Operator fact:** Amy is the **sole owner of Mobile Aesthetics** — the
  storefront (and the Vagaro/Yelp handles) are her own business's assets.
  The §16 launch-checklist item "hers, not the shared location's" is
  therefore **satisfied by fact**, not deferred. (Ownership ≠ sole provider:
  CLAUDE.md constraint 2 and the no-"we" voice rule stand unchanged.)
- **Operator decision:** page depth = product showcase — feature what Amy
  actually stocks (verified against her studio photos), not the full
  Skinbetter catalog.
- Photo survey (2026-07-20, recorded in project memory): 8K0A9881 and
  8K0A9922 are the Skinbetter product frames, reserved for this page.

## Design

### 1. Storefront wiring (the only non-content code change)

`src/lib/siteConfig.ts`:

```ts
skinbetterUrl: 'https://connect.skinbetter.com/MobileAesthetics',
```

with a comment recording provenance (decoded from Amy's own counter-card QR;
`skinbetter.pro/MobileAesthetics` 301s here; Mobile Aesthetics is Amy's own
practice — sole owner, operator 2026-07-23). No component changes: the CTA
and its `data-event` light up on their own, and `CTAButton`'s external-link
handling (new tab, `rel="noopener"`, SR note) already applies.

**Comment corrections riding along:** the existing comments above
`vagaroUrl` and the Yelp social link describe them as "the shared location's
handle, not Amy-specific." Factually stale as of the sole-owner fact — both
comments get a one-line correction in this PR. No URL changes.

### 2. Content model — `skincare.mdx` frontmatter

Existing shape kept: `ctaType: shop`, `pricingDisplay: none`,
`clinicianApproved: false` (hard constraint 4 — only the operator flips it),
`draft: false`. No schema changes; `productDetails` already exists.

`productDetails` gains nine cards — the products verified in Amy's photos,
every name checked against skinbetter.com / authorized-retailer listings.
**No `priceLines` anywhere on this page** — prices live in the storefront.

Descriptor rule (the §8 rail for this page): each `detail` is one factual
sentence saying what the product *is* — form, key technology, intended-use
category, "designed for the appearance of…" — never what it *achieves*.
No efficacy, outcome, comparison, or superiority language; no ingredient
percentages. Draft descriptors (final wording gates on `lint:claims`):

| # | Product | Tag | Draft descriptor |
|---|---------|-----|------------------|
| 1 | Refining Foam | Cleanse | A gentle foaming cleanser for daily use. |
| 2 | Mystro Active Balance Serum | Serum | A daily serum built on a botanically derived active blend. |
| 3 | Alto Advanced Defense and Repair Serum | Serum | A serum formulated with a broad blend of antioxidants. |
| 4 | Even Tone Correcting Serum | Serum | A serum designed for the appearance of uneven tone and discoloration. |
| 5 | AlphaRet Overnight Cream | Renew | An overnight cream built on AlphaRet, Skinbetter's patented retinoid-plus-AHA technology. |
| 6 | Trio Rebalancing Moisture Treatment | Moisturize | A moisturizer that pairs three approaches to hydration in one formula. |
| 7 | InterFuse Treatment Cream — Face & Neck | Moisturize | A peptide and hyaluronic-acid cream for face and neck, using the InterFuse delivery technology. |
| 8 | InterFuse Treatment Cream — Eye | Eye | The eye-area treatment cream from the same InterFuse line. |
| 9 | sunbetter TONE SMART SPF 75 Sunscreen Lotion | Protect | A mineral, broad-spectrum SPF 75 sunscreen lotion with a sheer tint. |

The `products` array is aligned with whatever the peptides page (the
9-product precedent) does relative to `productDetails` — checked at
implementation, including any `schema.ts` JSON-LD consumption (§8 applies to
structured data too).

### 3. Page copy (body sections, house voice — Amy, never "we")

- **What it is** — Skinbetter Science: physician-dispensed skincare sold
  only through authorized practices. Amy stocks it in the studio and offers
  it online through her practice storefront.
- **What Amy stocks** — one-paragraph lead-in, then the product cards.
- **How buying works** — two routes stated factually: pick products up at an
  appointment, or shop online — register once through the storefront link,
  orders ship to you, and the purchase is with Amy's practice. Includes the
  brand-handoff bridge: the storefront runs under **Mobile Aesthetics,
  Amy's own practice** (precedent: hormone page's "the practice is her
  own"), so the name change after the click is explained before it happens.
- **Which products suit your skin** — deliberately *not* answered in copy
  (§8.7); routed to a conversation with Amy at any appointment or a free
  consultation. "Consultation" = clinical routing; "appointment" = booking
  (§6 language convention).
- **Individualized, with Amy** — the house closer.

FAQ (editorial Q&A only, §7): the stub's two entries, the second one kept
as the suitability router; the first ("Where do skincare purchases happen?")
updated for register-once/ships-direct; plus one new entry — "Why does the
storefront say Mobile Aesthetics?" answered with the sole-owner fact in
Amy-voice ("Mobile Aesthetics is Amy's own practice — the storefront runs
under the practice name; purchases there are with Amy.").

SEO block kept, description refreshed to mention the storefront. Claim
rules apply to title/description/OG/alt as to any string.

### 4. Photos

Both pro frames copied to `src/assets/photos/` and rendered via
`astro:assets` `<Image>` in MDX (wrinkle-relaxers pattern, `.body-figure`
/ media-row styles from TreatmentLayout):

- `skinbetter-lineup.jpg` (from 8K0A9881) — Amy in the pink blazer holding
  six products toward the camera; the page's lead image. Alt text factual,
  e.g. "Six Skinbetter Science products held out toward the camera."
- `skinbetter-shelf.jpg` (from 8K0A9922) — the studio retail shelf;
  mid-page beside "What Amy stocks." Alt e.g. "Skinbetter Science products
  on a shelf in Amy's studio."

Zoom-vet both at full resolution before commit (house method): confirm no
legible hazardous micro-print, no other-provider material, no client
presence. (Amy-solo frames need no release — PR #35 precedent.) No text
overlays on photos, so the axe photo-page rules aren't triggered. The QR
photo itself is **not** used — its information (the URL) is extracted, and
a QR on a webpage is redundant with the button.

CI CLS trap (project memory): keep swap-sensitive text out of the initial
viewport interplay — the lead image placement follows the existing
treatment-page pattern, which already passes the Lighthouse budgets.

### 5. Docs & registry updates (same PR)

- **DECISIONS.md** — one entry: QR decode provenance → canonical URL;
  operator decision to use it; sole-owner fact recorded; §16 checklist item
  "Skinbetter partner link correct — hers" marked satisfied; `?k=signup`
  dropped (reason: bare URL serves both flows).
- **BUILD_SPEC §17** — `{{SKINBETTER_URL}}` row → resolved 2026-07-23,
  operator-supplied via QR decode.
- **BUILD_SPEC §9** — the "partner storefront with her businessPartner id"
  note aligned to the actual URL form (practice-slug storefront).
- **CHANGELOG.md** — page entry per house convention.

### 6. Conventions

Site-wide title-case "Skinbetter Science" in prose (matches stub,
serviceLines, CTA label); official casing preserved inside product names
(AlphaRet, sunbetter TONE SMART SPF 75, InterFuse). `serviceLines.ts`
skincare summary already correct — untouched.

### 7. Out of scope

- No schema changes, no new dependencies, no new components.
- No pricing anywhere on the page (`pricingDisplay: none` stays).
- No QR code reproduction on the site.
- No Retatrutide/Biote-class disclosures — none apply; the layout-injected
  medical disclaimer covers the page like every treatment page.
- No changes to constraint 2, the voice rule, or CLAUDE.md — the sole-owner
  fact is recorded in DECISIONS, not used to relax any rule.

## Error handling / edge cases

- If the storefront URL ever 404s (practice slug changes), the CTA is a
  single point of failure — the DECISIONS entry names the canonical URL and
  the QR-card source so it can be re-derived. No runtime check is possible
  on a static site; the §16 launch checklist re-verifies the link.
- `lint:claims` may flag descriptor drafts — fix the content, never the
  gate (CLAUDE.md). No allowlist changes are anticipated: nothing on this
  page is price-keyed or claim-adjacent by design.

## Verification (before PR)

1. `npm run build && npm run check` — every unit of work.
2. `npm run verify` — CI parity (claims, voice, a11y, budgets) before the
   deploy-affecting PR. Note: the pa11y list (23 URLs after PR #50) should
   already include `/services/skincare` since the stub route exists —
   confirm, and add to any gate list where it's absent.
3. Rendered-output review: built HTML grepped for banned-pattern
   near-misses (ASCII-only substrings — smartypants curls apostrophes),
   CTA href + `data-event="skinbetter_click"` verified in `dist/`, both
   images emitted as AVIF/WebP with dimensions.
4. Content changes in their own `content:` commit (clinician audit trail);
   config/docs in separate commits. PR → `phase-c`, preview link only after
   the deploy run completes (project memory rule).

Page ships preview-visible, production-gated (`clinicianApproved: false`)
until Amy approves — same as every treatment line.
