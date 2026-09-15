# Brand assets — Needle Girlie logo

## Canonical sources (the masters) — since 2026-09-15

The logo is the client's delivery of 2026-09-15: the same "Needle Girlie"
composition as before (the serif wordmark, the syringe standing in for the
second "l", the lips at the top right) re-rendered as glossy metallic pink
with a soft glow. The third delivery of the day is archived byte-identical
in this repo (DECISIONS 2026-09-15 and its two same-day addenda; two
earlier files, both transparent-background, were withdrawn for their colour
before anything merged):

| File | Facts | Role |
|---|---|---|
| `src/assets/brand/source/needle-girlie-logo-metallic-master.png` | 1983×793, 24-bit RGB on solid #000 — NO alpha channel; SHA-256 `fb703588db00d33c17dab7527fe5aaba772515a41145c73149dccd596ab8f0f0` (the third delivery; it superseded `c7315bfd…1f44f1` and `b07abf18…9b41ff`, both RGBA and both rejected for colour) | **the master** — `derive-logo.mjs` keys the black to alpha, then every variant is a crop |

**Never redraw, restyle, trace, or AI-upscale the logo** (BUILD_SPEC §3).
Variants are *crops* of the master (plus a black tile for the favicons) —
never a resample of the wordmark, never a colour edit. Because this master
was delivered on solid black, the script first keys the black to alpha: a
luminance key with a solid core — alpha = min(1, 2·max(R,G,B)/255), colour
un-premultiplied — which composited over #000 gives back the delivered
pixels exactly (proven on the committed derivative: max channel difference
1, from rounding). Every surface the mark sits on is pure #000, so on the
site the keyed mark IS the delivered mark; on any other surface the
letterforms stay opaque and the glow keeps its soft falloff. A master
delivered with alpha bypasses the step. There is no vector source; a vector
version would be a redraw and is not produced.

The keyed master composites cleanly on the site's noir surfaces (the
header, footer, hero band, and 404 are pure #000) and acceptably on white,
so no per-surface variant is needed. The alpha channel is load-bearing:
the home page's neon switch-on
(`public/js/home-motion.js`) and the styleguide sign's aura
(`src/styles/global.css`) apply `drop-shadow()` to the image's silhouette,
which must be the letterforms, not a rectangle.

Wordmark typeface: the lettering reads as the same Playfair Display
letterforms as the 2026-07 mark (the new render is evidently built on the
old composition) — since 2026-08-15 Playfair Display is also the site's ONE
text face (Amy's direction; DECISIONS same date). With a raster master the
face is no longer verifiable from a vector source; the decision stands on
visual continuity (DECISIONS 2026-09-15).

## Deriving a variant

```
node scripts/derive-logo.mjs [--glyph=lips|syringe] [--candidates=<dir>]
```

One deterministic run writes every committed derivative from the master:

| Output | What it is |
|---|---|
| `src/assets/brand/needle-girlie-wordmark-metallic-alpha.png` | the wordmark: the keyed master cropped to its alpha≥16 bounds (1963×596 at x 20, y 82) plus a 12px pad → **1975×620 at (8,70), aspect 3.185**. A cut at ≤6% alpha over noir is below perception, so the glow ends inside the image with no box edge. The script asserts ≥1920px wide (the styleguide sign's 2× tier at its 960px cap) — no consumer's largest srcset tier is ever upscaled. |
| `public/favicon.ico` | 16/32/48 px PNG entries in an ICO container the script writes itself (no dependency): the **lips** (master rect 313×237 at (1670,95)) scaled to 84% of a black tile |
| `public/icons/apple-touch-icon.png` | the same tile at 180×180 |

The favicon glyph is the lips, not the syringe: the syringe column is
flanked by the "d" and "e" glow and the baseline streak, and at 16px it is a
~5px sliver. The lips isolate almost cleanly: the "i" dot ends at x=1652
and the lips' tip begins at 1680, but the lower lip's lowest point (y=336,
at x≈1810) sits level with the top of the final "e" (y=332, x 1685–1820),
so the cut at y=332 keeps the "e" out at the cost of the lip's bottom five
rows — ~2% of the tile, invisible at 16–180px. The script asserts the
lower-left edge zones carry no solid letter pixel (alpha ≥250, i.e. source
luma ≥125 — a letter body, not the keyed glow halo). `--glyph=syringe`,
`--candidates=<dir>`, and `--measure` (prints the lips neighbourhood)
exist for placing and comparing.

`sharp` is reached through `createRequire`, as `export-logo.mjs` did: it is
an optional transitive dependency of `astro`, not a declared one. The script
is a one-off authoring tool whose outputs are committed; it is never a build
step.

## Consumers

| Consumer | Asset | How it is requested |
|---|---|---|
| `src/components/Header.astro` | wordmark | `width={440} widths={[440,600,880]}` + `sizes` mirroring the two clamps — a phone fetches the tier its slot needs (the 2× file is ~72KB WebP; the image budget is 245KB per page). Rendered width is the header's `--wordmark-w` custom property: `clamp(130px, min(44vw, 100vw - 218px), 300px)` on phones (the cap keeps the mark clear of the Book button below 390px), `clamp(340px, 36vw, 440px)` from 1024px |
| `src/components/Footer.astro` | wordmark | `width={160} densities={[1,2]}` |
| `src/components/Hero.astro` (the styleguide sign) | wordmark | `width={960} widths={[480,800,1200,1920]}` + `sizes`, capped at 960px (the 1983px master's 2× limit; the old 1879px lockup allowed 1040) |
| `src/layouts/BaseLayout.astro` | favicon.ico + apple-touch-icon | two `<link>`s |
| `main` only — the Under Construction placeholder (`src/pages/index.astro`) | wordmark | `width={780} widths={[480,800,1560]}` (hotfix PR, DECISIONS 2026-09-15) |

Two Astro facts to keep in mind when adding a consumer (Astro 5.18, verified
in `service.js`): `widths` above the source are clamped to it, but
`densities` are NOT — sharp will upscale — so every density tier must fit
inside the derivative's 1975px; and `widths` without an explicit `width`
makes the `<img src>` fallback the ORIGINAL-width encode, so always pass
`width`.

The header's nav popover offset below 1024px is derived from the wordmark's
aspect (`3.185` in `Header.astro`); a future asset with a different aspect
changes that one number.

## Retired 2026-09-15 (dormant — kept, not deleted; operator decision)

The 2026-07 mark: Claude Design HTML documents (live Playfair Display text +
CSS/SVG) exported to PNG by `scripts/export-logo.mjs` (headless Chrome +
sharp). Nothing renders them; git history and this table are their record.

| File | Was |
|---|---|
| `src/assets/brand/source/needle-girlie-logo-black-bg.html` / `-white-bg.html` | the vector masters (DECISIONS 2026-07-07) |
| `needle-girlie-wordmark-alpha.png` (1604×342) | the header/footer wordmark until 2026-09-15 |
| `needle-girlie-lockup-alpha.png` (1879×908) | the chevron lockup — the styleguide sign until 2026-09-15 |
| `needle-girlie-logo-on-black-trimmed.png` / `-on-white-trimmed.png` | the placeholder-home logo (retired from `main` by the 2026-09-15 hotfix) / a reserved light-surface variant |
| `needle-girlie-logo-on-black.png` / `-on-white.png` (924×525) | the first-delivery PNGs |
| `scripts/export-logo.mjs` | the HTML→PNG exporter (`--transparent` flag) |

The chevron run that lived inside the old lockup artwork is gone with it —
the motif is retired everywhere (it left the UI 2026-07-18).

## Still open

- OG share image (BUILD_SPEC §10 — Phase D): a 1200×630 card of the mark on
  black, wired as the sitewide `og:image`; and a JSON-LD `logo`. Both are
  derivable from the master with the same script when directed.
- The palette tokens were pixel-sampled from the retired HTML sources
  (BUILD_SPEC §5); their values are deliberately unchanged for the metallic
  mark (`src/styles/tokens.css` header note). Re-pinning is an operator
  decision, not a follow-up task.
