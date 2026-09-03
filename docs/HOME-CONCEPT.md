# The home concept branch — what is on `feat/home-scale-rhythm` (PR #179)

> Branch-scoped working record, written 2026-09-03 at the operator's
> request. It lives ONLY on this branch (the `docs/REVIEW-TAGS.md`
> precedent): if the concept is adopted, its decisions become standing
> ones with their own CLAUDE.md lines and this file is folded into
> REDESIGN.md; if not, the branch closes and this file goes with it.
> The *why* of every step is in `docs/DECISIONS.md` (the 2026-09-03
> entries and addenda); this is the map. Nothing here is merged into
> `phase-c`; production stays dark; the standing demos (#97, #149) are
> untouched.

## In one paragraph

The operator called the site boring. A page-by-page critique against
audiusa.com and five med-spa sites found the gap to be scale, rhythm,
and asset quality rather than animation; an in-browser mock of the
home's first screens was approved and built as a CSS-only round (Tier
1 composition + Tier 2 transform-only moves). On the preview the
operator lifted the zero-JS rule **for this branch as a concept test**
and asked for real movement: the page gained a self-hosted GSAP +
Lenis choreography ("the neon comes on") and Amy's own studio reel in
the hero. The preview workflow gates before it deploys, so the lift
had to reach the gate as a home-only script row. Three tweaks
followed on the operator's reaction (the reel holds on each scene,
runs two passes and ends on the portrait; the film band's order went
back to Jeuveau first). A phone report ("the carousel doesn't
autoplay") was fixed on its own branch into `phase-c` (PR #180) and
merged here; the hero reel takes the same policy.

## Previews

| What | Where |
|---|---|
| This branch (PR #179 into `phase-c`) | https://polite-flower-0a41b770f-179.eastus2.7.azurestaticapps.net |
| The carousel phone fix alone (PR #180 into `phase-c`) | https://polite-flower-0a41b770f-180.eastus2.7.azurestaticapps.net |
| Standing client demo (#97) and review preview (#149) | untouched by this branch |

## The commits, oldest first

| Commit | Time | What |
|---|---|---|
| `e119b87` | 09:30 | **design: home — scale, rhythm, and four new moves** (the critique's Tier 1 + 2; CSS only) |
| `288e710` | 11:53 | **concept: the neon comes on** — GSAP + Lenis choreography, the studio reel in the hero (zero-JS lifted for this branch) |
| `d6be1bd` | 12:03 | **gate(branch): home-only script budget 80KB** so the concept can preview |
| `f68c12a` | 13:21 | **concept: the hero film rests on each passage** before dissolving (tweak 1) |
| `81ea49c` | 13:27 | **concept: the hero film runs two passes, then rests on the portrait** (tweak 2) |
| `e2fc986` | 13:35 | **design: carousel order back to the Aug 14 sequence, Jeuveau first** (tweak 3) |
| `ee384b8` | 14:51 | **fix: carousel autoplays on phones** — authored on `fix/carousel-phone-autoplay` (PR #180 into `phase-c`) |
| `1179506` | 14:55 | Merge of that fix into this branch |
| `f9cce30` | 14:58 | **concept: the hero reel takes the carousel's phone policy** |

Twenty files against `phase-c`; the substance is in `ConceptHome.astro`,
`VideoCarousel.astro`, `global.css`, `public/js/home-motion.js`,
`public/js/video-carousel.js`, `lighthouserc.json`, and the docs.

## What the home page does now, by area

### 1. The hero

- **Composition (≥900px).** The portrait bleeds toward the copy: the
  media box runs from 44% of the width to the right edge and is masked
  in over its first 30%; the copy column caps at `min(40rem, 43vw)`
  with a 4vw left pad, so every glyph sits on solid noir — measured at
  900/1024/1280/1440/1920; the Phase C text-over-photo rule holds
  without an exception. Headline `clamp(2.75rem, 7.2vw, 7.25rem)`. The
  lead is one sentence: *"One clinician, every appointment. Amy
  Palacios, FNP, in medical aesthetics since 2017."* Below 900px the
  hero is the phase-c stack.
- **The reel.** A film facade: the portrait `<Image>` is what ships
  and paints (it is the LCP element); 2.5s after `load`, `home-motion`
  attaches Amy's studio reel — the carousel's muted rendition at the
  recorded 0.5× — and fades it in over the portrait. `data-ranges`
  trims it to its three treatment passages (seconds of the master:
  `10.4–11.72`, `2.5–3.25`, `6.15–6.78`); each passage plays, **rests
  on its last frame for 3.5s** (`data-hold`), and dissolves into the
  next (0.6s out, 1.1s in). After **two passes** (`data-plays`) the
  film dissolves out over the portrait it faded in from, the portrait
  settles (1.04 → 1 over 3s), and the element is removed. Measured
  timeline: portrait → reel in at ~3s → ~17.5s a pass → back to the
  portrait at ~40s. Off-screen time does not count (the film pauses
  when the hero leaves the viewport); it never replays until reload.
- **The neon comes on (choreography).** The wordmark flickers on and
  settles into its breath; the headline rises word by word (blur →
  sharp); "made personal." switches on like a tube (the CSS shimmer
  is held off during the flicker, then released); lead, CTAs, chips,
  and a four-chevron scroll cue follow (the MA mark, pointing down,
  pulsing in sequence — CSS). Leaving the hero, the copy lifts away
  and the media swells (scrubbed).

### 2. The film band ("Mobile Aesthetics. On screen.")

- **Composed at ≥900px:** the heading (recorded wording, two display-1
  lines) and the controls sit in a left column beside the film — CSS
  grid areas, DOM order unchanged, so phones keep the stack.
- **Order:** J1 → studio → J2 → team, the recorded 2026-08-14 sequence.
  (The round put Amy's films first for a few hours; the operator
  reversed it: "I want the Jeuveau commercial to play first.")
- **Crossfade settle:** inactive slides rest at scale .97 and ease to
  1 — never above 1, so the Jeuveau spots' safety screens are never
  cropped.
- **Phones (PR #180, merged here):** the films autoplay under
  `prefers-reduced-motion` too (operator decision — content with a
  pause control; only the crossfade stands down); a refused `play()`
  retries inside the first touch or key press (a touch-scroll's
  `touchend` counts); the built `<video>` carries `muted`,
  `playsinline`, `webkit-playsinline` attributes beside the properties.

### 3. Openers, decks, doors

- "Your plan, your pace." at `md:display-0`, "What Amy offers" at
  `md:display-1`, "Unhurried, explained…" at `md:display-2` (display-0
  is no longer "home hero only"). One-sentence decks; the §6
  credentials stay as a compact line under the intro deck.
- Choreography: every section opener rises word by word as it enters;
  decks settle; the three doors are dealt one after another; photos
  rise into their arches and settle; arched photos in whole-card links
  grow 3% on hover (CSS — this reaches the twelve /services cards too).

### 4. The van band

A new noir section between the doors and the visit beat: the van
interior (`van-treatment-interior.jpg`, the /mobile hero's screened
crop — no people, no packaging) bleeds from the left edge across
`min(60%, 48rem)` (2× of the 1536px source); *"Amy comes to you."* +
one sentence + "How a party works ›" sits on noir to its right. It
gives /mobile its first door on the home page. Full-bleed backdrop →
the fifth arch exemption. The photo drifts against the scroll (CSS
`ng-drift`; GSAP parallax under the concept). *Rejected first pick,
on the record: Amy holding her neon sign — at band size the Evolysse
carton on the table reads, and Amy retired Evolysse content
2026-08-21.*

### 5. The motion layer (files)

| File | Bytes | Role |
|---|---|---|
| `public/js/vendor/gsap.min.js` | 72,927 | GSAP 3.15.0 core (GSAP standard license — free since 3.13) |
| `public/js/vendor/ScrollTrigger.min.js` | 44,575 | scroll choreography |
| `public/js/vendor/SplitText.min.js` | 7,732 | word splitting (`aria: "auto"` — headings keep their text for assistive tech) |
| `public/js/vendor/lenis.min.js` | 18,722 | Lenis 1.3.26 (MIT) — weighted scroll, pointer devices only, anchors kept |
| `public/js/motion-flag.js` | 743 | sync, in the head: sets `html.motion` before first paint; self-cancels in 4s if the choreography never reports in |
| `public/js/home-motion.js` | ~15.5K | the choreography, the reel facade, the cursor light |
| `public/js/video-carousel.js` | 6,331 | the film band (phase-c file; the #180 fix) |

All static same-origin files: `script-src 'self'` is untouched. GSAP
and Lenis are also devDependencies, so the copies are reproducible.
`BaseLayout.astro` gained a `head` slot; `ConceptHome.astro` feeds the
six tags through it (nothing else uses the slot).

**Under `prefers-reduced-motion`:** the flag is never set, every
decorative move is guarded off, the CSS reveals/settle/drift are off
— but the **films play** (the operator's 2026-09-03 decision: films
are content): the hero reel over the portrait with its own dissolves
and holds, and the carousel. **If any script fails:** the flag
self-cancels and the page is the CSS-only home from commit `e119b87`.

### 6. Tier 2, the CSS moves (in `global.css`, independent of the engines)

`ng-settle` (hero still 1.04 → 1 over 14s), `ng-drift` (band photo
±24px on the scroll timeline), `ng-rise-2/-3` (staggered rise for a
row), hover-scale (`.ng-lift:hover .ng-arch img` → 1.03), and the
carousel's slide settle. Under the concept flag the GSAP versions run
and these stand down, so nothing animates twice.

### 7. Phones

Below 900px the composition is the phase-c stack plus the van band.
Lenis and the cursor light are pointer-only. The reel plays in the
hero (portrait, so it fits) and ends on the portrait like desktop.
The film band autoplays on phones per #180. Measured on a 390px
emulation at a throttled 6 Mbps: the band starts within half a second
of scrolling into view even with the reel downloading.

## The rules this branch lifts, and how each reverts

| Rule | Where it lives | What this branch does | If the concept closes |
|---|---|---|---|
| Zero client-side JS by default; ≤30KB total script | CLAUDE.md locked decisions; BUILD_SPEC §9/§13; `lighthouserc.json` | The home page carries ~150KB raw / ~66KB gzipped of script. `lighthouserc.json` has a **third assertMatrix row for the home URL alone** with the script budget at 81,920 B; every other budget and page keeps the house row | Delete the third row and restore the first row's pattern (`d6be1bd`); delete `public/js/vendor/`, `home-motion.js`, `motion-flag.js`; remove the head-slot block from `ConceptHome.astro`; drop the two devDependencies |
| "Never apply reveals to the hero, page H1s, or the lockup" | `global.css` motion header | The headline's word-by-word rise and the wordmark's switch-on are the concept's opening | Goes with the concept |
| Motion vocabulary is a closed list | `global.css` motion header; BUILD_SPEC §5 | +4 transform-only CSS moves (Tier 2, standing if merged) and the GSAP choreography (concept) | Tier 2 is the operator's call per tier; the choreography goes with the concept |
| Arch on every photo | REDESIGN settled decisions | Fifth exemption: the van band's full-bleed backdrop (Tier 1) | Tier 1 is the operator's call |
| Carousel: nothing autoplays under reduced motion | `VideoCarousel.astro` contract (2026-08-14) | Films autoplay; only the crossfade stands down — **this one is PR #180 into `phase-c`, not branch-scoped** | Stands if #180 merges |
| Carousel slide order | DECISIONS 2026-08-14 | Briefly Amy's films first; restored the same day | Nothing to revert |

## The knobs (one number each)

| Knob | Where | Now | Effect |
|---|---|---|---|
| `data-rate` | hero media, `ConceptHome.astro` | `0.5` | reel tempo (0.5 is the engines' floor) |
| `data-ranges` | same | `10.4-11.72,2.5-3.25,6.15-6.78` | the three passages, seconds of the master |
| `data-hold` | same | `3.5` | seconds each passage rests on its last frame |
| `data-plays` | same | `2` | passes before the film ends on the portrait (`0` = loop forever) |
| attach delay | `home-motion.js` | 2,500 ms after `load` | keeps the reel out of the Lighthouse trace |
| dissolves | `home-motion.js` | 0.6s out / 1.1s in; final 1.8s out | joins between passages; the ending |
| Lenis `lerp` | `home-motion.js` | `0.09` | scroll weight (higher = snappier) |
| hero settle | `global.css` / `home-motion.js` | 14s / 2.4s | the still's one-shot scale |
| slide order | `VideoCarousel.astro` slides array | J1 → studio → J2 → team | the band |

## What is pending

- **Amy's review** on the #179 preview, phone first: the reel in the
  hero and its two-pass ending, the van band, the display sizes, the
  new lead and intro deck wording, and her pick among three headline
  candidates — keep "Medical Aesthetics, made personal." / "One
  clinician. Every appointment." / "Every appointment is with Amy."
- **Others' feedback** — the operator is collecting it before more
  tweaks.
- **Tier 3 assets (Amy):** a 16:9 hero film or her full-res hero
  original; 16:9 Jeuveau renditions from Evolus; a re-grade or
  re-shoot of the four /services snapshot cards.
- **Deferred to their own rounds:** the treatment pages' "one big
  picture" (after PR #143); display-size openers on the other pages;
  whether `treatment-video.js` takes the same reduced-motion policy;
  lower-bitrate phone renditions (the films are 6.3–7.9MB each —
  heavy, but measured not to be the phone blocker).

## How to look at it

- **Desktop:** reload, sound off, stay on the hero for ~40 seconds
  (the reel runs twice and ends on the portrait), then scroll.
- **Phone:** the same; the smooth scroll and cursor light are off
  there by design.
- **Reduce Motion on (phone or OS):** the choreography is off, the
  reel and the film band still play.
- **A phone that refuses autoplay** (Low Power Mode, data saver):
  the films start on the first scroll or tap.

## How it was verified

`npm run verify` on every commit: build + `astro check` 0/0/0,
lint:claims and lint:voice, pa11y 25/25, Lighthouse CI 8 URLs × 3.
Home strict row on the concept build: perf 0.99, LCP ~2.07s, CLS 0,
TBT ≤15ms, total 306KB, image 187KB, script ~66KB (the branch-only
row), media 0, third-party 0. Phone behaviours verified with
Playwright at 390px: reduced-motion emulation, a `play()` stub that
refuses until a gesture, a synthetic touch-scroll, the reel's window
cadence and its two-pass ending. What cannot be verified from here: a
real iPhone or Android — the reporting phone is the confirmation.

## If the concept is adopted

Record standing decisions in DECISIONS and CLAUDE.md for: the home
page's script exception and its budget row; GSAP/Lenis as sanctioned
self-hosted dependencies; the hero H1 exception; the films-are-content
reduced-motion policy (already standing via #180 if merged); the two
new opted-in autoplay players (the hero reel joins the list). Then
fold this file into REDESIGN.md and delete it.

## Records index

DECISIONS 2026-09-03: the critique/Tier 1+2 entry with its addenda
(concept layer, gate row, three tweaks, hero policy) and the carousel
autoplay entry. CHANGELOG 2026-09-03 (two sections). REDESIGN settled
row + deferred items. BUILD_SPEC §5 motion sentence. CLAUDE.md carousel
consumer line (#180). CLINICIAN-SIGN-OFF presentation row. PR #179
comments (gate numbers per commit); PR #180 body and comment.
