#!/usr/bin/env node
/**
 * Derive every committed logo variant from the raster master (see
 * docs/BRAND-ASSETS.md, "Deriving a variant"). The master is the client's
 * transparent-background PNG (2026-09-15). Every output is a CROP (plus a
 * black tile for the favicons) — never a resample of the wordmark itself,
 * never a colour or alpha edit: the logo is not redrawn, restyled, traced,
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
 * the colour-corrected master: the "i" dot's opaque pixels end at x=1819
 * and the lips' begin at x=1820; the lips end at y=347 and the final "e"
 * begins at y=348. The lips sit alone at the top right; the syringe
 * column is flanked by the "d" and "e" and is a 155x510 sliver, ~5px wide
 * at 16px — kept as the alternative only. */
const GLYPHS = {
  lips: { left: 1820, top: 130, width: 352, height: 218 },
  syringe: { left: 820, top: 95, width: 156, height: 510 },
};
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
const { width: W, height: H } = await master.metadata();
const { data, info } = await master.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const C = info.channels;
const alphaAt = (x, y) => data[(y * W + x) * C + 3];

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
await sharp(resolve(MASTER)).extract(crop).png().toFile(resolve(WORDMARK_OUT));
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
      if (alphaAt(x, y) >= 128) throw new Error(`glyph crop: opaque pixel on the lower left edge at (${x},${y})`);
    }
  }
  for (let y = rect.top + rect.height - edge; y < rect.top + rect.height; y++) {
    for (let x = rect.left; x < rect.left + Math.floor(rect.width * 0.4); x++) {
      if (alphaAt(x, y) >= 128) throw new Error(`glyph crop: opaque pixel on the lower left bottom edge at (${x},${y})`);
    }
  }
}

async function tile(rect, size) {
  const longest = Math.max(rect.width, rect.height);
  const scale = (size * TILE_FILL) / longest;
  const gw = Math.max(1, Math.round(rect.width * scale));
  const gh = Math.max(1, Math.round(rect.height * scale));
  const glyphBuf = await sharp(resolve(MASTER))
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
