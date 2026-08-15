# Mobile Aesthetics mark â€” SVG rebuild from the 300px reference render
# (F-437304_Mobile Aesthetics_J1_300x300.png). Geometry, palette, and
# type metrics are MEASURED from the reference; letterforms are Julius
# Sans One (OFL) outlined to paths, chosen by overlay comparison
# (Montserrat/Raleway/Josefin rejected as too narrow).
#
# Outputs:
#   mobile-aesthetics-mark.svg         â€” full mark (plate+frame+type+
#                                        chevrons+name/phone), viewBox
#                                        matches the 300px reference 1:1
#   mobile-aesthetics-mark-header.svg  â€” header lockup (type+chevrons
#                                        only; the noir header is the
#                                        plate)
import sys
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

REF = r'C:\Amy\Videos\Evolus\F-437304_Mobile Aesthetics_J1_300x300.png'
FONT = 'fonts/JuliusSansOne.ttf'
OUT_FULL = 'mobile-aesthetics-mark.svg'
OUT_HEADER = 'mobile-aesthetics-mark-header.svg'

im = Image.open(REF).convert('RGB')
px = im.load()

# ---------- diagnostics: type brightness profile + fine bboxes ----------
def line_metrics(y_lo, y_hi, thr):
    xs, rows = [], {}
    for y in range(y_lo, y_hi):
        vals = [px[x, y] for x in range(28, 268)
                if px[x, y][0] > thr and abs(px[x, y][0] - px[x, y][2]) < 45]
        if vals:
            rows[y] = sum(v[0] + v[1] + v[2] for v in vals) // (3 * len(vals))
            xs += [x for x in range(28, 268)
                   if px[x, y][0] > thr and abs(px[x, y][0] - px[x, y][2]) < 45]
    if not xs:
        return None
    return (min(xs), max(xs), min(rows), max(rows), rows)

print('--- line metrics (x0,x1,y0,y1 + per-row brightness) ---')
for name, lo, hi, thr in [('MOBILE', 36, 62, 70), ('AESTHETICS', 63, 95, 70),
                          ('PLLC', 95, 110, 45), ('AMY', 222, 244, 70),
                          ('PHONE', 244, 262, 70)]:
    m = line_metrics(lo, hi, thr)
    if m:
        x0, x1, y0, y1, rows = m
        prof = ' '.join(f'{y}:{b}' for y, b in sorted(rows.items()))
        print(f'{name}: x {x0}-{x1} y {y0}-{y1}  rows[{prof}]')
    else:
        print(f'{name}: none found')

# ---------- chevron least-squares fit ----------
pink = lambda c: c[0] > 120 and c[0] - c[1] > 50 and c[2] > c[1]
def pink_runs(y):
    out, start = [], None
    for x in range(24, 275):
        p = pink(px[x, y])
        if p and start is None:
            start = x
        if not p and start is not None:
            out.append((start, x - 1)); start = None
    if start is not None:
        out.append((start, 274))
    return out

top_edges = {k: [] for k in range(4)}   # (y, left_x) upper arms
bot_edges = {k: [] for k in range(4)}   # (y, left_x) lower arms
widths = []
for y in range(112, 206):
    rr = pink_runs(y)
    if len(rr) != 4:
        continue
    for k, (a, b) in enumerate(rr):
        widths.append(b - a + 1)
        if y <= 152:
            top_edges[k].append((y, a))
        elif y >= 165:
            bot_edges[k].append((y, a))

import statistics
W = statistics.median(widths)           # horizontal slab thickness
def fit(pts):                            # x = m*y + c
    n = len(pts)
    sy = sum(p[0] for p in pts); sx = sum(p[1] for p in pts)
    syy = sum(p[0] * p[0] for p in pts); sxy = sum(p[0] * p[1] for p in pts)
    m = (n * sxy - sy * sx) / (n * syy - sy * sy)
    c = (sx - m * sy) / n
    return m, c

slopes, apexes = [], []
for k in range(4):
    mt, ct = fit(top_edges[k])
    mb, cb = fit(bot_edges[k])
    y_apex = (cb - ct) / (mt - mb)      # inner-left vertex where edges meet
    x_apex = mt * y_apex + ct
    slopes.append((mt, -mb))
    apexes.append((x_apex, y_apex))
    print(f'ch{k+1}: slope +{mt:.3f}/-{-mb:.3f} inner apex ({x_apex:.1f},{y_apex:.1f})')
s = statistics.mean([a for ab in slopes for a in ab])
y_mid = statistics.mean(a[1] for a in apexes)
print(f'slab width {W}, mean slope {s:.3f}, apex row {y_mid:.1f}')

# band extents: first/last row with 4 pink runs
band_rows = [y for y in range(104, 214) if len(pink_runs(y)) == 4]
y0b, y1b = min(band_rows) - 1, max(band_rows) + 1
print(f'band y {y0b}..{y1b}')

# ---------- font machinery ----------
font = TTFont(FONT)
upem = font['head'].unitsPerEm
cmap = font.getBestCmap()
glyphset = font.getGlyphSet()

def glyph_bbox(name):
    bp = BoundsPen(glyphset)
    glyphset[name].draw(bp)
    return bp.bounds  # (xMin,yMin,xMax,yMax) or None

capH = glyph_bbox(cmap[ord('H')])[3]

def text_paths(text, cap_px, x0, x1, baseline, fill_ref):
    """Layout text bbox-to-bbox with uniform tracking so ink spans
    exactly x0..x1; returns list of SVG path elements."""
    scale = cap_px / capH
    glyphs = []
    for ch in text:
        if ch == ' ':
            glyphs.append((' ', None, capH * 0.52))
            continue
        gname = cmap[ord(ch)]
        bb = glyph_bbox(gname)
        glyphs.append((ch, gname, bb[2] - bb[0]))
    n_gaps = len(glyphs) - 1
    natural = sum(w for _, _, w in glyphs) * scale
    track = ((x1 - x0) - natural) / n_gaps
    out = []
    xx = x0
    for ch, gname, w in glyphs:
        if gname is not None:
            bb = glyph_bbox(gname)
            tr = Transform(scale, 0, 0, -scale, xx - bb[0] * scale, baseline)
            sp = SVGPathPen(glyphset)
            glyphset[gname].draw(TransformPen(sp, tr))
            d = sp.getCommands()
            out.append(f'<path d="{d}" fill="{fill_ref}" stroke="{fill_ref}" stroke-width="0.3"/>')
        xx += w * scale + track
    return out

# ---------- measured constants (from diagnostics above, frozen) ----------
# type: silver chrome = vertical brightness fade (MOBILE brighter than
# AESTHETICS; one gradient spanning both lines reproduces the ratio).
# No reflection exists in the reference â€” the faint band under
# AESTHETICS is PLLC itself (x 138-157, y 90-94, dim gray).
CHROME_TOP, CHROME_BOT = '#f4f2f3', '#9b989b'
PLATE = '#131313'
FRAME = '#fdfdfd'
# chevron foil: highlight sweeps ACROSS the band (per-chevron averages
# ch1 #fda6d8 / ch2 #fd78d4 / ch3 #e967b6 / ch4 #fc9ad6)
GRAD_STOPS = [(0, '#fdaedb'), (0.13, '#fda6d8'), (0.38, '#fd78d4'),
              (0.63, '#e967b6'), (0.88, '#fc9ad6'), (1, '#fdaad9')]

def chevron_path(x_apex_inner, y_top, y_bot, y_apex, slab, slope):
    """One '>' band. x_apex_inner = inner-left vertex at the apex row."""
    xa_in = x_apex_inner
    xa_out = x_apex_inner + slab
    xt_in = xa_in - slope * (y_apex - y_top)   # top row, left edge
    xb_in = xa_in - slope * (y_bot - y_apex)   # bottom row, left edge
    pts = [(xt_in, y_top), (xt_in + slab, y_top), (xa_out, y_apex),
           (xb_in + slab, y_bot), (xb_in, y_bot), (xa_in, y_apex)]
    d = 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in pts) + ' Z'
    return f'<path d="{d}" fill="url(#foil)"/>'

def defs(x_left, x_right, type_top, type_bot):
    stops = ''.join(
        f'<stop offset="{o:.2f}" stop-color="{c}"/>' for o, c in GRAD_STOPS)
    return f'''<defs>
    <linearGradient id="foil" gradientUnits="userSpaceOnUse" x1="{x_left}" y1="0" x2="{x_right}" y2="0">{stops}</linearGradient>
    <linearGradient id="chrome" gradientUnits="userSpaceOnUse" x1="0" y1="{type_top}" x2="0" y2="{type_bot}">
      <stop offset="0" stop-color="{CHROME_TOP}"/><stop offset="1" stop-color="{CHROME_BOT}"/>
    </linearGradient>
  </defs>'''

# chevron geometry (fit): regenerate all four from the fitted params
chev_elems = []
for k in range(4):
    xa, ya = apexes[k]
    chev_elems.append(chevron_path(xa, y0b, y1b, y_mid, W, s))

# ---------- FULL MARK (viewBox = the 300px reference frame) ----------
mobile = text_paths('MOBILE', 12.6, 99, 196, 55.6, 'url(#chrome)')
aesth  = text_paths('AESTHETICS', 13.8, 69, 226, 81.8, 'url(#chrome)')
pllc   = text_paths('PLLC', 4.8, 138, 157.5, 94.6, '#6e6b6d')
amy    = text_paths('AMY PALACIOS NP', 7.4, 85, 217, 238.8, 'url(#chrome)')
phone  = text_paths('704·579·7108', 7.8, 107, 195, 253.6, 'url(#chrome)')

full = f'''<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" role="img" aria-label="Mobile Aesthetics PLLC">
  {defs(24, 271, 43, 82)}
  <rect x="3" y="3" width="294" height="294" fill="{PLATE}"/>
  <rect x="21.5" y="17.5" width="252.5" height="252.5" fill="none" stroke="{FRAME}" stroke-width="3.5"/>
  {''.join(mobile)}
  {''.join(aesth)}
  {''.join(pllc)}
  {''.join(chev_elems)}
  {''.join(amy)}
  {''.join(phone)}
</svg>'''

# ---------- HEADER LOCKUP (type + chevrons; noir header is the plate) ----------
# viewBox tight: x 24..271, y from MOBILE top (43) to band bottom
lock = f'''<svg xmlns="http://www.w3.org/2000/svg" width="247" height="172" viewBox="24 40 247 172" role="img" aria-label="Mobile Aesthetics PLLC">
  {defs(24, 271, 43, 82)}
  {''.join(mobile)}
  {''.join(aesth)}
  {''.join(chev_elems)}
</svg>'''

with open(OUT_FULL, 'w') as f:
    f.write(full)
with open(OUT_HEADER, 'w') as f:
    f.write(lock)
print('wrote', OUT_FULL, len(full), 'bytes;', OUT_HEADER, len(lock), 'bytes')
