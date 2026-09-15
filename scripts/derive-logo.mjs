#!/usr/bin/env node
/**
 * Derive every committed logo variant from the raster master (see
 * docs/BRAND-ASSETS.md, "Deriving a variant"). The master is the client's
 * raster delivery (2026-09-15: the creator's transparent-background export).
 * A master delivered on solid black without alpha is keyed to alpha below
 * first (that path shipped for a few hours the same day; its derivatives
 * were too heavy for the image budgets — DECISIONS). Every output is a CROP
 * (plus a black tile for the favicons) — never a resample of the wordmark
 * itself, never a colour edit: the logo is not redrawn, restyled, traced,
 * or upscaled (BUILD_SPEC §3).
 *
 * Usage:
 *   node scripts/derive-logo.mjs [--glyph=lips|syringe] [--candidates=<dir>]
 *
 * Writes:
 *   src/assets/brand/needle-girlie-wordmark-metallic-alpha.png  the wordmark
 *     (the master cropped to its alpha>=16 bounds + PAD; asserted >= MIN_WIDTH
 *     so no consumer's largest srcset tier is ever upscaled)
 *   public/favicon.ico                                            16/32/48 PNG-in-ICO
 *   public/icons/apple-touch-icon.png                             180x180
 *   --candidates=<dir>: both glyph tiles at 16/32/180 for a side-by-side pick.
 *
 * sharp is reached through createRequire exactly as export-logo.mjs did: it is
 * an optional transitive of astro, not a declared dependency (DECISIONS
 * 2026-09-15). A one-off authoring tool; its outputs are committed.
 */
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const nodeRequire = createRequire(import.meta.url);
const sharp = nodeRequire('sharp');

const MASTER = 'src/assets/brand/source/needle-girlie-logo-metallic-master.png';
const WORDMARK_OUT = 'src/assets/brand/needle-girlie-wordmark-metallic-alpha.png';
const ICO_OUT = 'public/favicon.ico';
const APPLE_OUT = 'public/icons/apple-touch-icon.png';

/** Wordmark crop: keep everything the eye can see. Alpha 16/255 over noir is
 * RGB ~(16,6,10) — below perception — so the cut leaves no box edge. */
const ALPHA_FLOOR = 16;
const PAD = 12;
/** The styleguide sign's largest srcset tier (2x of its 1040px cap). */
const MIN_WIDTH = 2080;

/** Favicon glyph crops (master pixel coordinates), measured 2026-09-15 on
 * the creator's transparent export (2172x724, the fourth file of the day):
 * the "i" dot's solid pixels end at x=1836 and the lips' tip begins at
 * 1841; under the lips the lower lip's edge runs 15-24px above the top of
 * the final "e" except at the far right, where the lip reaches y=338 while
 * the "e" begins at 331 — so the cut at y=331 keeps the "e" out at the cost
 * of ≤8px off the lower lip's right-bottom edge (~3% of the tile, invisible
 * at 16-180px). The rect starts at y=66 to keep the sparkle above the lips.
 * The syringe column is flanked by the "d" and "e" and is a sliver, ~5px
 * wide at 16px — kept as the alternative only. */
const GLYPHS = {
  lips: { left: 1839, top: 66, width: 333, height: 265 },
  syringe: { left: 850, top: 80, width: 160, height: 500 },
};
/** "Solid" for the edge assertions: alpha 250 is a letter body, not a glow
 * halo (for a keyed master it means a source luma of ~125). */
const SOLID = 250;
/** The glyph fills this fraction of the tile's longer side. */
const TILE_FILL = 0.84;

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : dflt;
};
const glyph = opt('glyph', 'lips');
const candidatesDir = opt('candidates', '');
if (!GLYPHS[glyph]) {
  console.error(`unknown glyph "${glyph}" — one of ${Object.keys(GLYPHS).join('|')}`);
  process.exit(1);
}

const master = sharp(resolve(MASTER));
const { width: W, height: H, hasAlpha } = await master.metadata();
const raw = await master.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const C = raw.info.channels;
let data = raw.data;

/** A delivery on solid black (no alpha channel) is keyed to alpha here —
 * the 2026-09-15 third delivery. Luminance key with a solid core:
 * alpha = min(1, KEY_GAIN · max(R,G,B)/255), colour un-premultiplied
 * (RGB · 255 / alpha). Compositing the result over #000 gives back the
 * delivered pixels exactly (±1 from rounding), and every surface the mark
 * sits on is pure #000, so this is a derivation, not a restyle. KEY_GAIN 2
 * makes the letterforms fully opaque (their dark shading would otherwise
 * be translucent) while the glow keeps its soft falloff; a pixel's
 * on-black appearance is the same at any gain ≥ 1. */
const KEY_GAIN = 2;
if (!hasAlpha) {
  const keyed = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = Math.min(255, Math.round((KEY_GAIN * Math.max(r, g, b) * 255) / 255));
    if (a === 0) {
      keyed[i] = keyed[i + 1] = keyed[i + 2] = keyed[i + 3] = 0;
      continue;
    }
    keyed[i] = Math.min(255, Math.round((r * 255) / a));
    keyed[i + 1] = Math.min(255, Math.round((g * 255) / a));
    keyed[i + 2] = Math.min(255, Math.round((b * 255) / a));
    keyed[i + 3] = a;
  }
  data = keyed;
  console.log(`keyed: the master has no alpha channel — black keyed to alpha (gain ${KEY_GAIN})`);
}
/** Every extract below reads from this RGBA buffer (the master itself when
 * it was delivered with alpha, the keyed copy otherwise). */
const src = () => sharp(data, { raw: { width: W, height: H, channels: 4 } });
const alphaAt = (x, y) => data[(y * W + x) * C + 3];

if (args.includes('--measure')) {
  // Print the lips neighbourhood so the glyph rectangle can be placed:
  // per column, the opaque rows near the "i" dot; per row, the opaque
  // columns under the lips (the final "e" begins where they widen left).
  const r = { left: Math.round(W * 0.8), right: W - 1, top: Math.round(H * 0.1), bottom: Math.round(H * 0.55) };
  const cols = [];
  for (let x = r.left; x <= r.right; x += 4) {
    const ys = [];
    for (let y = r.top; y <= r.bottom; y++) if (alphaAt(x, y) >= 128) ys.push(y);
    cols.push(`${x}:${ys.length ? ys[0] + '..' + ys[ys.length - 1] : '-'}`);
  }
  console.log('cols', cols.join(' '));
  const rows = [];
  for (let y = r.top; y <= r.bottom; y += 4) {
    const xs = [];
    for (let x = r.left; x <= r.right; x++) if (alphaAt(x, y) >= 128) xs.push(x);
    rows.push(`${y}:${xs.length ? xs[0] + '..' + xs[xs.length - 1] : '-'}`);
  }
  console.log('rows', rows.join(' '));
  process.exit(0);
}

/** Bounding box of pixels with alpha >= floor. */
function bbox(floor) {
  let minx = W;
  let maxx = -1;
  let miny = H;
  let maxy = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (alphaAt(x, y) >= floor) {
        if (x < minx) minx = x;
        if (x > maxx) maxx = x;
        if (y < miny) miny = y;
        if (y > maxy) maxy = y;
      }
    }
  }
  return { left: minx, top: miny, width: maxx - minx + 1, height: maxy - miny + 1 };
}

// ---- 1. The wordmark: crop to the visible art + pad -------------------------
const art = bbox(ALPHA_FLOOR);
const crop = {
  left: Math.max(0, art.left - PAD),
  top: Math.max(0, art.top - PAD),
};
crop.width = Math.min(W - crop.left, art.width + 2 * PAD);
crop.height = Math.min(H - crop.top, art.height + 2 * PAD);
if (crop.width < MIN_WIDTH) {
  console.error(`wordmark crop is ${crop.width}px wide — below the ${MIN_WIDTH}px floor`);
  process.exit(1);
}
await src().extract(crop).png().toFile(resolve(WORDMARK_OUT));
console.log(
  `wordmark: alpha>=${ALPHA_FLOOR} art ${art.width}x${art.height} at (${art.left},${art.top}); ` +
    `crop ${crop.width}x${crop.height} at (${crop.left},${crop.top}) [pad ${PAD}] ` +
    `aspect ${(crop.width / crop.height).toFixed(3)} -> ${WORDMARK_OUT}`,
);

// ---- 2. The favicon glyph: a crop on a black tile ---------------------------
/** A letter crossing the crop boundary leaves opaque pixels on the edge.
 * The lips' neighbours are the "i" dot (left of the crop, in its LOWER
 * half — the lips' own left tip is in the upper half) and the final "e"
 * (below the crop, under its LEFT part — the lower lip's tip is under the
 * right part). Assert those two edge zones carry no opaque pixel. */
function assertCleanEdges(rect) {
  const edge = 2;
  for (let y = rect.top + Math.floor(rect.height / 2); y < rect.top + rect.height; y++) {
    for (let x = rect.left; x < rect.left + edge; x++) {
      if (alphaAt(x, y) >= SOLID) throw new Error(`glyph crop: solid pixel on the lower left edge at (${x},${y})`);
    }
  }
  for (let y = rect.top + rect.height - edge; y < rect.top + rect.height; y++) {
    for (let x = rect.left; x < rect.left + Math.floor(rect.width * 0.4); x++) {
      if (alphaAt(x, y) >= SOLID) throw new Error(`glyph crop: solid pixel on the lower left bottom edge at (${x},${y})`);
    }
  }
}

async function tile(rect, size) {
  const longest = Math.max(rect.width, rect.height);
  const scale = (size * TILE_FILL) / longest;
  const gw = Math.max(1, Math.round(rect.width * scale));
  const gh = Math.max(1, Math.round(rect.height * scale));
  const glyphBuf = await src()
    .extract(rect)
    .resize({ width: gw, height: gh, fit: 'fill', kernel: 'lanczos3' })
    .png()
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  })
    .composite([{ input: glyphBuf, left: Math.round((size - gw) / 2), top: Math.round((size - gh) / 2) }])
    .png()
    .toBuffer();
}

/** ICO container: ICONDIR (6 bytes) + ICONDIRENTRY (16 bytes each) + PNG
 * payloads. PNG-compressed entries are valid since Windows Vista and in
 * every browser. */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, buf } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += buf.length;
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.buf)]);
}

const rect = GLYPHS[glyph];
assertCleanEdges(rect);
const icoSizes = [16, 32, 48];
const pngs = [];
for (const size of icoSizes) pngs.push({ size, buf: await tile(rect, size) });
await mkdir(dirname(resolve(ICO_OUT)), { recursive: true });
await writeFile(resolve(ICO_OUT), ico(pngs));
await mkdir(dirname(resolve(APPLE_OUT)), { recursive: true });
await writeFile(resolve(APPLE_OUT), await tile(rect, 180));
console.log(
  `favicons: glyph "${glyph}" ${rect.width}x${rect.height} at (${rect.left},${rect.top}) -> ` +
    `${ICO_OUT} (${icoSizes.join('/')}), ${APPLE_OUT} (180)`,
);

if (candidatesDir) {
  await mkdir(resolve(candidatesDir), { recursive: true });
  for (const [name, r] of Object.entries(GLYPHS)) {
    for (const size of [16, 32, 180]) {
      await writeFile(resolve(candidatesDir, `${name}-${size}.png`), await tile(r, size));
    }
  }
  console.log(`candidates: both glyphs at 16/32/180 -> ${candidatesDir}`);
}

// ---- 3. Hand-off kit (--kit=<dir>): the same files for other teams -----------
/** The mobile app team's brand kit (2026-09-15, operator request): the
 * master, the site's wordmark crop, icon tiles from the same lips crop at
 * app-store sizes, a flattened preview, and a README with the colour tokens
 * and the rules. Every image is produced by the code above — nothing is
 * hand-made — so the app and the site provably share one mark. */
const kitDir = opt('kit', '');
if (kitDir) {
  const { copyFile, readFile } = await import('node:fs/promises');
  const { createHash } = await import('node:crypto');
  await mkdir(resolve(kitDir), { recursive: true });
  const sha = async (p) => createHash('sha256').update(await readFile(resolve(p))).digest('hex');
  await copyFile(resolve(MASTER), resolve(kitDir, 'needle-girlie-logo-master-transparent.png'));
  await copyFile(resolve(WORDMARK_OUT), resolve(kitDir, 'needle-girlie-wordmark-transparent.png'));
  await src()
    .extract(crop)
    .flatten({ background: { r: 0, g: 0, b: 0 } })
    .png()
    .toFile(resolve(kitDir, 'needle-girlie-wordmark-on-black-preview.png'));
  /** App-store icons must carry no alpha channel (Apple rejects them), so
   * the kit's tiles are flattened to opaque RGB — they are black tiles
   * anyway. Above ~396px the tile scales the 333px lips crop UP (plain
   * bicubic, no AI); the README says so. */
  const NATIVE_TILE = Math.floor(GLYPHS.lips.width / TILE_FILL);
  for (const size of [1024, 512, 192, 180, 120, 96, 72, 48]) {
    const buf = await sharp(await tile(GLYPHS.lips, size)).removeAlpha().png().toBuffer();
    await writeFile(resolve(kitDir, `needle-girlie-icon-lips-${size}.png`), buf);
  }
  await src()
    .extract(GLYPHS.lips)
    .png()
    .toFile(resolve(kitDir, 'needle-girlie-lips-transparent.png'));
  const readme = `# Needle Girlie brand kit — logo (exported ${new Date().toISOString().slice(0, 10)})

Produced by needlegirlie.com's \`scripts/derive-logo.mjs\` from the client's
master file. Every image here is a crop of that master (plus a black tile for
the icons) — the same crops the website ships — so the app and the site share
one mark, pixel for pixel.

## Files

| File | What it is | Use |
|---|---|---|
| needle-girlie-logo-master-transparent.png | the master: ${W}×${H}, RGBA (transparent background) — SHA-256 ${await sha(MASTER)} | the source for any crop you need; never recolour, redraw, trace, or upscale it |
| needle-girlie-wordmark-transparent.png | the wordmark crop the site uses: ${crop.width}×${crop.height}, aspect ${(crop.width / crop.height).toFixed(3)} (art + 12px of glow margin) | headers, splash screens, about screens — on a black surface |
| needle-girlie-wordmark-on-black-preview.png | the same crop flattened onto #000 | for looking at, not for shipping |
| needle-girlie-lips-transparent.png | the lips crop (${GLYPHS.lips.width}×${GLYPHS.lips.height}) the icons are made from | if you need the lips alone |
| needle-girlie-icon-lips-{1024,512,192,180,120,96,72,48}.png | square app-icon tiles: the lips on an opaque black tile (no alpha channel — store rules), filling ${Math.round(TILE_FILL * 100)}% of the side | 180 = iOS home screen; 192 = Android launcher; the rest as needed. The website's favicon and apple-touch-icon are these same tiles at 16/32/48/180. **Caution:** the lips crop is ${GLYPHS.lips.width}px wide, so tiles above ${NATIVE_TILE}px are plain bicubic UPSCALES (1024 = ${(1024 / NATIVE_TILE).toFixed(1)}×) and will look soft on a store listing. For the 1024 App Store / Play icon, ask the logo creator for the lips exported alone at ≥1000px wide, on transparent, same colour — do not ship the upscaled tile as the final listing icon. |

## Colour (the site's tokens — the mark's own pink is the first one)

| Token | Hex | Role |
|---|---|---|
| Brand pink | #ec4899 | the wordmark's pink (the lettering's mid-tone measures hue 332°, this token is 330°); display text, buttons on black |
| Neon | #fe019a | the glow only — never text |
| Deep magenta | #d6337e | accents, rules — never behind white text |
| Pale pink | #f9a8d4 | tints; body text on black |
| Blush | #fdf2f8 | light canvas start |
| Ink pink | #b01366 | links and button fills on light surfaces (4.5:1 on white) |
| Ink | #221820 | body text on light |
| Noir | #000000 | the surface the mark lives on — pure black, by design |

Contrast pairs verified for the site (WCAG 2.x): white on #000 21:1; #f9a8d4 on #000 11.6:1;
#ec4899 on #000 5.95:1 (body text on black only — it FAILS on white at body sizes, 3.5:1);
#b01366 on white 6.7:1. Brand pinks fail on white at body sizes: use ink pink for text on light.

## Rules

- The mark sits on pure black. It composites acceptably on white, but that is not the brand's surface.
- Never recolour, restyle, redraw, trace, or AI-upscale the logo; never add effects to it (it carries its own glow).
- Crop from the master; do not resample the wordmark file up. The master is 2172px wide — 2× retina holds up to ~1086 CSS/pt wide.
- Keep the glow: crop with margin (the wordmark file already has it). A tight crop leaves a visible box edge.
- Need another size or crop? Ask the website team to run the script; do not rebuild by hand.
- Typeface: the lettering is Playfair Display (the site's one text face). Use Playfair Display for anything set next to the mark.
`;
  await writeFile(resolve(kitDir, 'README.md'), readme);
  console.log(`kit: master, wordmark, preview, lips, 8 icon tiles, README -> ${kitDir}`);
}
