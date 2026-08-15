# Post-launch redesign — the "$15,000 site" round (working doc)

> Opened 2026-08-14. Client feedback on the launched site: "looks like a
> $2,000 website, not a $15,000 one." The operator directed a major
> visual overhaul toward relaunch. This file is the round's working
> record — the yardstick, the settled decisions, the asset facts, and
> the open items. The *why* behind each decision lives in
> docs/DECISIONS.md (2026-08-14 entries onward). Production remains on
> the Under Construction placeholder throughout (takedown 2026-08-05;
> relaunch is two-step — docs/RUNBOOK.md).

## The yardstick (operator-confirmed diagnosis, 2026-08-14)

Calibration: **the bar sits above the med-spa category.** No competitor
reads $15k to the operator (Ever/Body ≈ $10k at best); the operator's
anchor reference is audiusa.com. Target: *a luxury-brand site that
happens to be a med-spa.* Thesis: **"Audi's cinema, Needle Girlie's
pink."** Seven gaps, each a test every design decision must move:

1. **Cinematic video** — video-led, not static (carousel closes this).
2. **Enormous type, few words** — bigger statements, less text per screen.
3. **One idea per screen** — air; fewer simultaneous plates.
4. **Dark gloss** — noir as a cinematic stage, not just a frame.
5. **Flawless assets only** — HARD RULE: nothing ships below its slot's
   delivery resolution (retina-grade); low-res photos were the fastest
   "$2k tell."
6. **Choreographed, restrained motion.**
7. **Mobile-first** — design at 390px; every review on Amy's phone first.

## Settled decisions

| Decision | Status | Record |
|---|---|---|
| **Stack: Astro stays** — no React migration; React islands remain available per-component | Settled | 2026-08-14 session; plan file |
| **Scope: EVOLVE the current design** — ombre canvas + plate system stay; new photos/video/type/arches layer on (full reset offered, declined) | Settled | flag-once satisfied |
| **Type: Playfair Display everywhere** — headings AND body, matching the logo's own face; body sizes/leading bumped for phones; DM Sans likely retires | Decided, **not yet built** | mobile-readability flagged and accepted |
| **Home hero: Amy's studio-counter portrait** (interim AI-assisted 1400w blend, disclosed; her full-res original drops in with zero code changes) | **Shipped** (PR #101) | DECISIONS 2026-08-14 |
| **Home video carousel** — J1 → studio reel → J2 on a cinematic noir stage; autoplay muted on visibility, crossfade rotation, WCAG 2.2.2 pause, reduced-motion = posters | **Shipped** (PR #101) | DECISIONS 2026-08-14 ×3 |
| **Media architecture: Blob `/media` origin recommended** (media hostname via the same Front Door, ~$1–2/mo) as the video program grows; in-repo public/media/ serves the current three films | Recommended, not built | cost door opened by operator |
| **Mobile Aesthetics badge in the header** — SVG vector rebuild (Julius Sans One outlines, measured geometry; lockup variant stays in the brand kit); FULL BADGE at 48–80px phones / 128–160px desktop; **links out to yourmobileaesthetics.com** (new tab — constraint-2 operator override, the one sanctioned outbound reference) | **Shipped** (PR #102, merged 2026-08-15) | F-437304 asset set; DECISIONS 2026-08-15 (four entries); CLAUDE.md constraint-2 exception |
| **Hybrid nav** — hamburger menu carries the page links at EVERY width (inline desktop nav retired); Book is the one styled button, always visible; centered-brand shell at all widths (fixed the Z Fold collision, which predated the badge) | **Shipped** (PR #102, merged 2026-08-15) | operator decision after options; DECISIONS 2026-08-15 |
| **Pink arches around pictures** — house frame motif, generalized from the existing arch geometry | Planned | operator directive |
| **Photo replacement sitewide** | Planned | operator directive |
| 17a + 17b videos → /services/biostimulators; 20 → /services/body-contouring | Parked ("not there yet") | same screening + release checks when directed |

## Carousel record (all three films cleared 2026-08-14)

- **Slides:** `commercial-j1.mp4` / `commercial-studio.mp4` /
  `commercial-j2.mp4` (public/media/), muted H.264 renditions of the
  operator's masters; captions mirror each film's on-screen text.
- **J1/J2** — Evolus co-op Jeuveau DTC commercials (piece code
  US-JUV-2600126), carried **as-is** with complete burned-in FDA safety
  information. NEVER trim or crop them (`object-fit: contain` is a
  compliance requirement, not a style choice).
- **Studio reel** — Amy's own published content, operator override
  (background posters, trays, unit boxes, promo cards enumerated in
  DECISIONS); both on-camera client releases confirmed on file.
- **Engineering:** video facade (BUILD_SPEC §9) — zero video elements
  and zero video bytes at page load; script is a static file
  (public/js/video-carousel.js) because the CSP refuses inline scripts
  (DECISIONS 2026-08-14, two entries). First client-side JS on the
  site (~3KB of the 30KiB budget; third-party stays 0).

## Open items

- **The operator's full change list** ("A LOT more") — in progress;
  gates the §5-style design plan for the rest of the round.
- **Carousel stage: noir vs pink-arch-on-ombre** — operator unsure
  about the black background; side-by-side previews offered.
- **Hero portrait original** — Amy hunts the full-res photo (camera
  roll / photographer / IG source); replaces the AI-assisted interim
  asset with zero code changes.
- **Amy's reactions** on the PR #101 preview: the enhanced rendering of
  her own likeness (disclosed), the carousel, the capital-A headline.
- **Sound for the films** — renditions are muted; tap-for-sound +
  audio-faithful captions is a recorded follow-up if directed.
- Carried from launch: counsel review of legal pages, manual
  keyboard/screen-reader a11y pass, laser pricing if supplied,
  Plausible analytics opt-in (~$9/mo, flagged).

## Working agreement for the round

- Every design decision is tested against the seven-gap yardstick.
- Evolve-scope: the ombre canvas and plate system are untouchable
  without new operator direction.
- Preview-first, always; reviews happen on Amy's phone before desktop.
- AI-enhanced imagery of Amy requires disclosure and her informed
  preview sign-off (hero precedent).
- Treatment-copy edits reset `clinicianApproved` (constraint 4); plan
  one consolidated re-approval round at the end, before relaunch.
