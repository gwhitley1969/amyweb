# Brand assets — Needle Girlie logo

## Canonical sources (the masters)

The logo was produced by Claude Design as self-contained HTML documents —
live Playfair Display text plus CSS/SVG shapes, i.e. **vector-based**. The
surviving originals are archived in this repo and are the source of truth
for every raster variant:

```
src/assets/brand/source/needle-girlie-logo-black-bg.html
src/assets/brand/source/needle-girlie-logo-white-bg.html
```

**Never redraw, restyle, trace, or AI-upscale the logo** (CLAUDE.md §3).
New variants are *exported* from these sources — same design, rendered at
whatever resolution is needed.

Wordmark typeface: **Playfair Display** (relevant to the Phase B design
system, which should harmonize with it).

## Exporting a variant

```
node scripts/export-logo.mjs <source.html> <out.png> [scale=4] [padPx=136]
```

The script renders the HTML in headless Chrome at the given device scale
(faithful export), then crops to the artwork keeping a background margin so
the baked-in glow fades out inside the image instead of ending in a visible
box edge. Cropping tighter than that margin will clip the glow — the
symptom is a faint rectangle around the chevrons, or dimmed art near edges.

## Current derivatives

| File | Size | Used by |
|---|---|---|
| `needle-girlie-logo-on-black-trimmed.png` | 1879×907 | home page (dark placeholder) |
| `needle-girlie-logo-on-white-trimmed.png` | 1848×878 | reserved for Phase B light pages |
| `needle-girlie-logo-on-black.png` / `-on-white.png` | 924×525 | legacy first-delivery PNGs; art only ~400px wide — do not use for display ≥ ~400 CSS px |

## Still needed for Phase B

- Favicon + OG-image derivatives (derive from the sources; BUILD_SPEC §3, §10).
- Brand palette tokens pixel-sampled from the sources (BUILD_SPEC §5) —
  sample the HTML-rendered exports, not the legacy low-res PNGs.
