# Brand assets — Needle Girlie logo

## Canonical sources (the masters) — since 2026-09-15

The logo is the client's delivery of 2026-09-15: the same "Needle Girlie"
composition as before (the serif wordmark, the syringe standing in for the
second "l", the lips at the top right) re-rendered as glossy metallic pink
with a soft glow. Five files arrived on 2026-09-15; the client chose the
second ("b") for its metallic rendering, in the colour of the home hero's
"made personal." accent — so the master is "b", archived byte-identical,
and its colour is re-mapped by the derivation script (the operator's
override, below). DECISIONS 2026-09-15 and its five same-day addenda hold
the day's record (the other four files — two rejected for colour, one that
arrived on solid black and whose keyed derivatives blew the image budgets,
and the brand-hue export that briefly went live — are superseded).

| File | Facts | Role |
|---|---|---|
| `src/assets/brand/source/needle-girlie-logo-metallic-master.png` | the "b" delivery: 2172×724, RGBA — letterforms opaque (alpha 253), glow alpha 1–63, background 0; delivered lettering mid-tone `#f7809b` (OKLCH L 0.742, C 0.147, hue 7°, a coral pink); SHA-256 `b07abf1855883f08681808096cb44cfb12fedc73815ce90bfd5490aeb49b41ff` | **the master** — shapes and alpha ship exactly; colour re-mapped |

**Never redraw, restyle, trace, or AI-upscale the logo** (BUILD_SPEC §3) —
with one scoped override (operator, 2026-09-15, after the flag; DECISIONS
the fifth addendum): **the colour re-map to the "made personal." accent.**
The client's brief was "b, in the colour of 'made personal.'" — on the noir
hero that phrase is pale pink-300 `#f9a8d4` text over a neon-500 `#fe019a`
text-shadow. The script's `RECOLOR` step maps every pixel in OKLCH, shapes
and alpha untouched: opaque pixels (alpha ≥250) take a hue offset of
−21.3° (the lettering's circular-mean mid-tone hue 7.3° → 346°), a chroma
scale of ×0.745 (0.147 → 0.110), and a lightness curve L^0.653 (0.742 →
0.823, 0 and 1 fixed); soft pixels (the glow) take the neon's hue (354°)
and ×2.20 chroma, capped at 0.32, lightness kept. Proven on the committed
derivative: the alpha channel equals the master's crop exactly, and the
recoloured lettering's mid-tone measures `#f9a8d4` at L 0.823 / C 0.110 /
h 346. The mapping is deterministic; re-running the script reproduces it.
Setting `RECOLOR` to `null` ships "b" in its delivered colour. Everything
else stays crop-only: no resample of the wordmark, no vector version (a
redraw). For any future file: ask the creator for a transparent-background
PNG (RGBA) ≥2200px wide, never on solid black — the script CAN key black to
alpha (exact over #000), but the keyed glow encodes 2–3× heavier and broke
the Lighthouse image and LCP budgets when tried.

The master composites cleanly on the site's noir surfaces (the header,
footer, hero band, and 404 are pure #000) and acceptably on white, so no
per-surface variant is needed. Its alpha channel is load-bearing: the home
page's neon switch-on
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
| `src/assets/brand/needle-girlie-wordmark-metallic-alpha.png` | the wordmark: the recoloured master cropped to its alpha≥16 bounds (2100×554 at x 44, y 104) plus a 12px pad → **2124×578 at (32,92), aspect 3.675**. A cut at ≤6% alpha over noir is below perception, so the glow ends inside the image with no box edge. The script asserts ≥2080px wide (the styleguide sign's 2× tier at its 1040px cap) — no consumer's largest srcset tier is ever upscaled. |
| `public/favicon.ico` | 16/32/48 px PNG entries in an ICO container the script writes itself (no dependency): the **lips** (master rect 342×214 at (1830,136), recoloured like the wordmark) scaled to 84% of a black tile |
| `public/icons/apple-touch-icon.png` | the same tile at 180×180 |

The favicon glyph is the lips, not the syringe: the syringe column is
flanked by the "d" and "e" glow and the baseline streak, and at 16px it is a
~5px sliver. On the "b" master the lips isolate cleanly: the "i" dot's
opaque pixels end at x=1814 and the lips' tip begins at 1841; the lower lip
ends at y=347 and the final "e" begins at 352 with a clean row between, so
no lip pixel is lost. The script asserts the lower-left edge zones carry no
solid letter pixel (alpha ≥250).
`--glyph=syringe`, `--candidates=<dir>`, and `--measure` (prints the lips
neighbourhood) exist for placing and comparing.

**Hand-off kit for other teams** (`--kit=<dir>`, added 2026-09-15 for the
mobile app team): writes the master, the site's wordmark crop, a flattened
preview, the lips crop, opaque app-icon tiles at 1024/512/192/180/120/96/
72/48 (no alpha channel — store rules), and a README with the colour tokens,
verified contrast pairs, and the usage rules. Every image comes from the
code above, so the app and the site share one mark pixel for pixel. The
tiles above ~396px upscale the 333px lips crop (plain bicubic) and the
README says so — a store-listing icon wants the lips exported alone at
≥1000px by the creator. The kit is written OUTSIDE the repo
(`C:\Amy\needle-girlie-brand-kit-<date>\` + zip) and is not committed;
re-run the command to regenerate it after any master change.

`sharp` is reached through `createRequire`, as `export-logo.mjs` did: it is
an optional transitive dependency of `astro`, not a declared one. The script
is a one-off authoring tool whose outputs are committed; it is never a build
step.

## Consumers

| Consumer | Asset | How it is requested |
|---|---|---|
| `src/components/Header.astro` | wordmark | `<Picture formats={['avif']} fallbackFormat="webp" quality={50} width={600} widths={[440,600,660,720,900,1080,1200]}>` + `sizes="(max-width: 413px) 90vw, (max-width: 639px) 380px, (min-width: 1024px) 600px, (min-width: 773px) 340px, 44vw"` — AVIF first because WebP alpha made the phone tier too heavy for /mobile's LCP budget (DECISIONS 2026-09-15, the seventh addendum); a device fetches the tier its slot needs (the image budget is 245KB per page). Rendered width is the header's `--wordmark-w` custom property: phones (<640px, the stacked shell — the mark alone on its own row) `min(100vw - 2rem, 380px)`; 640–1023 `clamp(281px, 44vw, 340px)`; from 1024px `clamp(420px, 46vw, 600px)` — both the 600px desktop cap and the phone stack are the client's 2026-09-15 direction ("bigger than the Mobile Aesthetics badge"; "more pronounced on phones"): 358×98 at 390, 600×163 on desktop |
| `src/components/Footer.astro` | wordmark | `width={160} densities={[1,2]}` |
| `src/components/Hero.astro` (the styleguide sign) | wordmark | `width={1040} widths={[480,800,1200,2080]}` + `sizes`, capped at 1040px (the 2172px master covers the 2080 tier) |
| `src/layouts/BaseLayout.astro` | favicon.ico + apple-touch-icon | two `<link>`s |
| `src/components/GetTheApp.astro` (the footer's third column on every page; the styleguide gallery) | the app icon — `needle-girlie-app-icon-ios.png` (the "App icons" section below) | `<Picture formats={['avif']} fallbackFormat="webp" quality={50} width={128} densities={[1,2]}>` — 128px, left-aligned, 1rem above the coming-soon text; built tiers 6KB / 13KB AVIF (2026-09-16, co-founder request) |
| `main` only — the Under Construction placeholder (`src/pages/index.astro`) | wordmark | `width={780} widths={[480,800,1560]}` (hotfix PR, DECISIONS 2026-09-15) |

Two Astro facts to keep in mind when adding a consumer (Astro 5.18, verified
in `service.js`): `widths` above the source are clamped to it, but
`densities` are NOT — sharp will upscale — so every density tier must fit
inside the derivative's 2124px; and `widths` without an explicit `width`
makes the `<img src>` fallback the ORIGINAL-width encode, so always pass
`width`.

The header's nav popover offset below 1024px is derived from the wordmark's
aspect (`3.675` in `Header.astro`); a future asset with a different aspect
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

## App icons (the mobile team; the footer's coming-soon box)

Since 2026-09-16 (co-founder request, DECISIONS same date, the footer
entry) the package's `ios-1024-transparent.png` — the framed iOS icon —
is committed byte-identical as
`src/assets/brand/needle-girlie-app-icon-ios.png` (1024×1024 RGBA,
955,229 bytes, SHA-256
`645bc276de0fa1f68550138571f1312c61535c5d33e86ccc5c34788ad1cbef55` — the
same afternoon's composite: the cleaned iOS frame with the Android
delivery's art downscaled inside it, DECISIONS 2026-09-16 the icon
entry's second addendum; the morning's `bb1d8797…` and the frame
re-clean's `4480…` are superseded) and
rendered by `GetTheApp.astro` above the coming-soon text (the Consumers
row above). Its 1024px master is a downscale of the package's 1254px
clean file, per the package's own "downscale from the 1024s" rule; the
largest tier the site serves is 256px. A new icon from the creator goes
through the package's script first, then replaces this file.

The Needle Girlie app's launcher/store icons are a different artwork from
the wordmark (the creator's "girlie" script + syringe, framed on iOS),
prepared 2026-09-15/16 at the operator's request in the website mark's
colours: haze removed by a structure-based mask, the same OKLCH recolour
as above, the syringe slimmed 15% by a smooth horizontal warp, and — the
same afternoon, on the team's word — the iOS icon composed from its
frame (rebuilt from the ridges alone, a shorter glow) and the Android
delivery's art downscaled inside it, because the iOS delivery's lettering
is a softer render than the Android's (DECISIONS 2026-09-16, the icon
entry and its two addenda). Package: `C:\Amy\icons-clean\` (zip
`C:\Amy\needle-girlie-app-icons-2026-09-15.zip`) with its own README, the
script (`clean-icon.mjs`, which needs this repo's `sharp`), the exact
command lines, and store-ready files (opaque 1024 App Store icon, Android
adaptive layers, Play icon). It supersedes the brand kit's lips tiles for
app-icon use; the kit's tiles remain the website's favicon family.

## Still open

- OG share image (BUILD_SPEC §10 — Phase D): a 1200×630 card of the mark on
  black, wired as the sitewide `og:image`; and a JSON-LD `logo`. Both are
  derivable from the master with the same script when directed.
- The palette tokens were pixel-sampled from the retired HTML sources
  (BUILD_SPEC §5); their values are deliberately unchanged for the metallic
  mark (`src/styles/tokens.css` header note). Re-pinning is an operator
  decision, not a follow-up task.
