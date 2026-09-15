# Brand assets — Needle Girlie logo

## Canonical sources (the masters) — since 2026-09-15

The logo is the client's delivery of 2026-09-15: the same "Needle Girlie"
composition as before (the serif wordmark, the syringe standing in for the
second "l", the lips at the top right) re-rendered as glossy metallic pink
with a soft glow. The transparent delivery is archived byte-identical in this repo
(DECISIONS 2026-09-15; its first-cut predecessor and an opaque on-black
rendering were withdrawn the same day when the colours were corrected):

| File | Facts | Role |
|---|---|---|
| `src/assets/brand/source/needle-girlie-logo-metallic-master.png` | 2172×724, RGBA — letterforms opaque, glow alpha 1–63, background alpha 0; SHA-256 `c7315bfd15dfe674acfe3358e767bb9fc91a5a46bf22ec61133623008d1f44f1` (the colour-corrected delivery, same day — it superseded a first transparent file `b07abf18…9b41ff` whose colours Amy rejected) | **the master** — every variant is cropped from it |

**Never redraw, restyle, trace, or AI-upscale the logo** (BUILD_SPEC §3).
Variants are *crops* of the master (plus a black tile for the favicons) —
never a resample of the wordmark, never a colour or alpha edit. There is no
vector source; a vector version would be a redraw and is not produced.

The master composites cleanly on the site's noir surfaces (the header,
footer, hero band, and 404 are pure #000) AND on white — its letterforms
carry a dark keyline — so no per-surface variant is needed. Its real alpha
channel is load-bearing: the home page's neon switch-on
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
| `src/assets/brand/needle-girlie-wordmark-metallic-alpha.png` | the wordmark: the master cropped to its alpha≥16 bounds (2118×593 at x 35, y 94) plus a 12px pad → **2142×617 at (23,82), aspect 3.472**. A cut at ≤6% alpha over noir is below perception, so the glow ends inside the image with no box edge. The script asserts ≥2080px wide (the styleguide sign's 2× tier) — no consumer's largest srcset tier is ever upscaled. |
| `public/favicon.ico` | 16/32/48 px PNG entries in an ICO container the script writes itself (no dependency): the **lips** (master rect 352×218 at (1820,130)) scaled to 84% of a black tile |
| `public/icons/apple-touch-icon.png` | the same tile at 180×180 |

The favicon glyph is the lips, not the syringe: the syringe column is
flanked by the "d" and "e" glow and the baseline streak, and at 16px it is a
~5px sliver; the lips isolate cleanly (the "i" dot ends at x=1819, the final
"e" starts at y=348 — the script asserts the crop's left and bottom edges
carry no opaque pixel) and read at 16px. `--glyph=syringe` and
`--candidates=<dir>` exist for a side-by-side pick.

`sharp` is reached through `createRequire`, as `export-logo.mjs` did: it is
an optional transitive dependency of `astro`, not a declared one. The script
is a one-off authoring tool whose outputs are committed; it is never a build
step.

## Consumers

| Consumer | Asset | How it is requested |
|---|---|---|
| `src/components/Header.astro` | wordmark | `width={440} widths={[440,600,880]}` + `sizes` mirroring the two clamps — a phone fetches the tier its slot needs (the 2× file is ~72KB WebP; the image budget is 245KB per page). Rendered width is the header's `--wordmark-w` custom property: `clamp(130px, min(44vw, 100vw - 218px), 300px)` on phones (the cap keeps the mark clear of the Book button below 390px), `clamp(340px, 36vw, 440px)` from 1024px |
| `src/components/Footer.astro` | wordmark | `width={160} densities={[1,2]}` |
| `src/components/Hero.astro` (the styleguide sign) | wordmark | `width={1040} widths={[480,800,1200,2080]}` + `sizes` |
| `src/layouts/BaseLayout.astro` | favicon.ico + apple-touch-icon | two `<link>`s |
| `main` only — the Under Construction placeholder (`src/pages/index.astro`) | wordmark | `width={780} widths={[480,800,1560]}` (hotfix PR, DECISIONS 2026-09-15) |

Two Astro facts to keep in mind when adding a consumer (Astro 5.18, verified
in `service.js`): `widths` above the source are clamped to it, but
`densities` are NOT — sharp will upscale — so every density tier must fit
inside the derivative's 2142px; and `widths` without an explicit `width`
makes the `<img src>` fallback the ORIGINAL-width encode, so always pass
`width`.

The header's nav popover offset below 1024px is derived from the wordmark's
aspect (`3.472` in `Header.astro`); a future asset with a different aspect
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
