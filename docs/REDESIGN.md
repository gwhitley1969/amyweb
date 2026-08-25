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
| **Type: Playfair Display everywhere** — headings AND body, matching the logo's own face; body bumped to 17px/1.65; **DM Sans retired** (scope answer 2026-08-15: Playfair takes the small UI text too — weight is the legibility knob, never a second family) | **Shipped** (PR #103, merged 2026-08-15) | mobile-readability flagged and accepted; DECISIONS 2026-08-15 |
| **Home hero: Amy's studio-counter portrait** (interim AI-assisted 1400w blend, disclosed; her full-res original drops in with zero code changes) | **Shipped** (PR #101) | DECISIONS 2026-08-14 |
| **Home video carousel** — J1 → studio reel → J2 on a cinematic noir stage; autoplay muted on visibility, crossfade rotation, WCAG 2.2.2 pause, reduced-motion = posters | **Shipped** (PR #101) | DECISIONS 2026-08-14 ×3 |
| **Media architecture: Blob media origin** — `media.needlegirlie.com` via the same Front Door (~$1–2/mo); the .mp4 films upload to Blob — the container holds eight referenced objects as of 2026-08-21: the four carousel films, the ICON film, the two biostimulators reels, and the body-contouring reel (the Evolysse film's object deleted 2026-08-21 after the film retired), repo sheds 53MB; captions stay in-repo (compliance audit trail, same-origin = no CORS); previews play production media by design; publish procedure in RUNBOOK "Publishing a film" | **Built** (2026-08-17, external-audit Finding 5; Git-LFS declined — CI bandwidth trap) | DECISIONS 2026-08-17 |
| **Mobile Aesthetics badge in the header** — SVG vector rebuild (Julius Sans One outlines, measured geometry; lockup variant stays in the brand kit); FULL BADGE at 48–80px phones / 128–160px desktop; **links out to yourmobileaesthetics.com** (new tab — constraint-2 operator override, the one sanctioned outbound reference) | **Shipped** (PR #102, merged 2026-08-15) | F-437304 asset set; DECISIONS 2026-08-15 (four entries); CLAUDE.md constraint-2 exception |
| **Hybrid nav** — hamburger menu carries the page links at EVERY width (inline desktop nav retired); Book is the one styled button, always visible; centered-brand shell at all widths (fixed the Z Fold collision, which predated the badge) | **Shipped** (PR #102, merged 2026-08-15) | operator decision after options; DECISIONS 2026-08-15 |
| **Pink arches around pictures** — house frame motif, generalized from the category-door arch into the shared `.ng-arch` recipe; every photo sitewide (Amy's direction 2026-08-17), exempting the hero backdrop, all film stages, the homepage Instagram post (Amy's named exception), and the lip style-guide diagram. 2026-08-18 evolutions (client direction, PR #126): the treatment pages' white paper mats + print tilts retired — every treatment photo now a bare arch on the pink canvas, matching /services; and the arch family gained its wide sibling, the segmental arch (`media-band--segmental`, curve over straight feet at 3:2), for landscape frames that must show full content | **Built** (2026-08-17; bare-arch + segmental 2026-08-18) | DECISIONS 2026-08-17 + 2026-08-18 |
| **Photo replacement sitewide** — page-by-page, operator + Amy pick per slot (picks in C:\Amy\New Pics; ~21 frames from the new professional shoot). Shipped: homepage doors (page 1) and the /services strip (page 2, three client releases recorded), both 2026-08-17; the /services photo-card menu (page 3 — Amy's own mockup, ALL TWELVE of her B-picks landed same day incl. the two operator-override frames; compact-tile grid after the operator's >50% shrink directive), 2026-08-18, PR #121, plus the same-week preview-feedback fix round (06 face-and-belt blur-fill composite; 10/11/12 re-graded brighter), PR #122; the wrinkle-relaxers treatment page (page 4 — Amy's picks 10/11/12: brow appointment under the neon, the hand-mirror male-client frame, and the Jeuveau-banner studio scene, whose band went three fit rounds on her feedback and landed as the full frame in the new segmental arch; third photo-override frame; page prepped by the Evolus-move PR #125, merged same day), 2026-08-18, PR #126; the dermal-fillers treatment page (page 5 — Amy's picks 14/15 replace the two Evolysse-box photos, 8K0A9591 joins "Lips, styled" to the right of its copy, the Evolysse film + heading retired at her direction — the first scoped compliance exception to come off the books — and, round 2 the same day, the "#1 provider" plate swapped for the Evolus Laurel plaque in the same spot with its §8.4 authorization widened to this page, plus air above the lip diagram), 2026-08-21; the skin-rejuvenation treatment page (page 6 — Amy's picks 19a/19b: Amy beside the PiXel8-RF cart replaces the interim docked-handpiece frame, the handpiece-in-hand menu-card frame reused beside "A longer view"; fourth pixel-override frame — the console readout, the first under the dosing bullet), 2026-08-21; the weight-loss treatment page (page 7 — the 23a InBody frame from behind replaces the weigh-in photo under the fourth photo override (the aftercare sign's text; 3:4 per-image aspect knob keeps head and feet), and a client-directed section of three client photo pairs — "They showed up for themselves" (round-2 copy the same day; the allowlist entry for the original heading withdrawn) — ships under operator override — the site's first before/after content, a §1/§8.3/§8.9 carve-out with all five releases + HIPAA authorizations on file; new `.pair-gallery` block, bare 12px frames, 30rem retina caplaser-treatments page (page 8 — Amy's picks 21a/21b/21d: beside the Versa Pro console replacing the below-resolution 2026-08-04 snapshot, seated with two applicators right of "Fine lines", and at the window with the Venus Epileve left of the new hair-removal section; fifth pixel-override frame — a second console readout; the same PR landed the priced menu from her flyers and the Epileve service), 2026-08-21; the skincare page (page 9, both photos — 28.jpg, the Skinbetter line-up above a spread of Amy's business cards, replaces the shelf photo beside "Individualized, with Amy" as a baked 4:5 crop at x=480 — the retina-correct route for a landscape source through the arch window; the two capped syringes in frame accepted as-is by the operator; flag reset — and, same day, 27.jpg replaces the "What it is" frame that cut Amy's head at the neck: the same held-out line-up with her chin visible, baked 4:5 at x=246, keeping sunbetter whole and AlphaRet readable), 2026-08-25; procedure in RUNBOOK "Replacing site photography" | **In progress** (started 2026-08-17) | operator directive; DECISIONS 2026-08-17, 2026-08-18 + 2026-08-21 |
| **Wrinkle-relaxers content round (2026-08-19)** — the Evolus Laurel ranking plaque ("The Top Evolus Injector in Charlotte." over the Top-50 display lockup, her arrows driving round 2), the page retitled "Neurotoxins - Wrinkle Relaxers" (menu-line wording extended to the page), "neurotoxin" page-wide (title, cards, FAQ, body — the §7 normalize rule superseded for this page only), and the VisitSteps numerals → MA chevron foil plates on every treatment page (her steps.png mockup) | **Merged** (PR #127, `8e9b942`, 2026-08-19; standing demo refreshed same day) | DECISIONS 2026-08-19 ×7; CLAUDE.md constraint-3 ranking exception; BUILD_SPEC §7/§8.4 |
| **Wrinkle-relaxers copy round (2026-08-23 → 24)** — client copy, three rounds on one PR. R1: the lead stops saying "creases"; the deck replaced with her wording naming the three areas. R2: "Not just for women" → "gender defined" (and the FAQ echo, so "gendered" is gone from the page) + "lines they'd rather not see"; "Individualized, with Amy" is her new paragraph closing "Your trust is well placed when you walk through the doors!", keeping "under clinician supervision" at the operator's direction. R3 (08-24): the deck's closing promise, flagged and rewritten on the 23rd, is **restored verbatim and extended** — the round's flag becomes an operator override. It trips no pattern, so nothing was allowlisted; the authorization is in DECISIONS + CLAUDE.md constraint 3 + BUILD_SPEC §8.3 only. Coupling recorded: the page's band photo carries the Jeuveau banner headline the deck now paraphrases, which retires that 2026-08-18 pixel override's stated premise **Round 4 (08-24), and the first to leave the page:** the "Personalized plan" step of "Your visit, step by step" now closes "Together with Amy, you decide what comes next." The sentence was pointed at on wrinkle-relaxers but lives in `VisitSteps.astro`, so it changed on **all twelve treatment pages** — surfaced before editing; operator chose sitewide over a page-scoped override. The dropped "if anything" was the only note in the four-step list allowing for no treatment; flagged, and resolved with **no override and no allowlist entry** (§8.7 holds — the sentence names Amy as co-decider). Approved flags deliberately left at 4 true / 8 false; CLINICIAN-SIGN-OFF carries the new words as a cross-cutting item since `check:approvals` cannot see a component edit. **Batch 2 (same day, four changes, one preview):** step 3 gains "Confidently"; two wrinkle-relaxers FAQ answers reworded (the gender pair deliberately left mismatched at the operator choice); and in `TreatmentLayout` the pricing line deleted and the consult router reworded — after which that card carries no form of the word "consultation" on any of the twelve pages. Compliant because §8.7 routing lives in `DisclaimerBlock` immediately below it, layout-injected and verified on all 12; a layout comment now records that so nobody softens the disclaimer to match the card. `pricingDisplay` left wired but inert — removing it is a twelve-file schema change and the operator call | **PR #143 open** (into `phase-c`; CI green, preview probed to convergence — awaiting Amy's review + the operator's word) | DECISIONS 2026-08-23 + 2026-08-24; CLAUDE.md constraint 3; BUILD_SPEC §8.3; compliance/README "Authorizations the registry does not hold" |
| **"Draft — pending clinician review" strip retired** — the DraftBanner component deleted sitewide; unapproved treatment pages render no visible marker (the client read it as final-site content). The approval gate is unchanged: flag + reset-on-edit + `check:approvals` in production; pending status lives in the flags and docs/CLINICIAN-SIGN-OFF.md (which now carries the grep). Precedent: the legal pages' counsel-review banner, 2026-08-04 | **Merged** (PR #128, `03ca83d`, 2026-08-21; demo refreshed `a88f776`) | operator direction; DECISIONS 2026-08-21; BUILD_SPEC §4/§7 passages still to update (classifier-blocked — operator) |
| **17a + 17b → /services/biostimulators** — Amy's two reels replace the studio portrait and play inside the media rows (`TreatmentVideo`, bare frame, sounded, click-to-play): the Radiesse-visit film (constraint-3 override: before/after cut + a unit-labeled carton; constraint-2 override: another provider on frame ~2s; client release + provider consent on file) and her Instagram reel (480p shipped as FINAL — retina-rule override, the round's first). Component fixes rode along: posters never upscale (/about's ICON poster was a 1280w upscale of a 960 source); `frame="bare"` narrows the 2026-08-18 "film mats stay" scope to the standalone player. Same-day review round (operator): the printed captions under both films removed, and both films AUTOPLAY MUTED on approach + loop while on screen (tap for sound; reduced motion = tap-to-play) via `TreatmentVideo autoplay="inview"` → the static `public/js/treatment-video.js` (~2KB — the third sanctioned script, first on a treatment page). **20 → body-contouring SHIPPED 2026-08-21** (Amy's Evolve reel replaces the session photo in the same row — the same pattern: bare frame, autoplay muted on approach; no client, no override, retina met at 576px; DECISIONS same date) | **Merged** (PR #131 → phase-c `b3afc12`, 2026-08-21; body-contouring film PR same day; both pages `clinicianApproved` reset — Amy's word on the demo) | DECISIONS 2026-08-21; CLAUDE.md constraints 2 + 3; BUILD_SPEC §5/§7.5/§8.3 |
| **Girl Team on /about** — a photo ADDITION (not a replacement): 29b full frame in the segmental arch, left of the milestones (`md:grid-cols-[5fr_6fr]`, DOM heading-first) — Amy with FOUR of the location's five other providers, releases confirmed on file; "Girl Team!" live on an opaque keystone plate straddling the arch crown (the site's FIRST text-over-photo, Phase C plate rule, Amy's casing kept); "Visit Mobile Aesthetics" below it — the SECOND sanctioned yourmobileaesthetics.com link (supersedes the badge row's "one sanctioned reference" above; own flag, own override) | **Shipped** (2026-08-25) | DECISIONS 2026-08-25; CLAUDE.md constraint-2 fourth exception; BUILD_SPEC §6 |
| **Evolus Laurel on /about** — the ranking plaque replaces the EvolusCallout recognition plate above the ICON film (the dermal-fillers 2026-08-21 swap repeated; client direction): page scope widened to three pages (operator authorization), the plate's "#1" sentence retired sitewide with its `allowedStrings` entry withdrawn (an authorization nothing uses is a loophole), the orphaned component deleted. Same PR, same day: the ICON film below the plaque autoplays muted in view, tap for sound — a scoped operator override of the 2026-08-21 narrated-manufacturer-film rule. Rides PR #153 | **Shipped** (2026-08-25) | DECISIONS 2026-08-25; CLAUDE.md constraint 3; BUILD_SPEC §8.4/§6/§7.4/§17 |
| **Team film on /about** — the carousel team film's SOUNDED rendition (`girl-team-film.mp4`: CRF 23 + the master's AAC copied, 6.86MB — both recipe deviations reasoned in DECISIONS) joins the Girl Team unit below the "Visit Mobile Aesthetics" button: autoplay muted in view, loop on screen, music one tap away — IN-CONTRACT (site-authored, no speech; the operator's confirmation is the record), unlike the ICON override; the constraint-2 SECOND exception widened to this placement (a third requires the operator); portrait 9:16 at the 18rem in-row film cap, bare frame, no printed caption; poster + master reused (dedup). One operator passage open: the fourth exception's cross-reference sentence in CLAUDE.md (classifier-blocked) | **Shipped** (2026-08-25) | DECISIONS 2026-08-25; CLAUDE.md constraint 2; BUILD_SPEC §6/§9/§13 |

## Carousel record (J1/studio/J2 cleared 2026-08-14; team film 2026-08-17)

- **2026-08-17 — the team film joins as film 4 (operator assignment):**
  `commercial-team.mp4` — the Mobile Aesthetics "Girl team" film, six
  women (Amy center) under the MA neon. Hard-constraint-2 flag raised
  (features the location's other five providers) → **operator
  override**, releases for the five confirmed on file; CLAUDE.md
  second constraint-2 scoped exception + DECISIONS entry ride the PR.
  No claims content (no constraint-3 exception needed). Plays at 1×;
  progress bars slim to 48px under 600px so four bars + toggle fit
  390px phones and the 344px fold cover. Same day (operator): the
  section head renamed "Mobile Aesthetics. On screen." (was "The
  studio. On screen.") — the carousel speaks for the whole practice.

- **2026-08-15 refinements (operator + Amy; PRs #104/#105 merged same day):** the
  section head is the single Playfair line "The studio. On screen." —
  the loved phrase promoted from the old eyebrow, eyebrow deleted
  (PR #104); the studio reel plays at **0.5×** via per-slide
  data-rate/playbackRate, tuned 0.8 → 0.65 → 0.5 across three same-day
  reviews, rate re-asserted at playback start for Safari/iOS
  (PR #105). 0.5 is the floor (engines clamp below) — if the reel
  still reads fast someday, the lever is re-editing the reel, not the
  rate. The Evolus films always play at 1× (carried as-is).

- **Slides:** `commercial-j1.mp4` / `commercial-studio.mp4` /
  `commercial-j2.mp4` / `commercial-team.mp4` (public/media/), muted
  H.264 renditions of the operator's masters; captions mirror each
  film's on-screen text.
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
- **Amy's reactions**, remaining: the hero's enhanced rendering of her
  own likeness (disclosed) and the capital-A headline. (The carousel
  reactions arrived 2026-08-15 and shipped: head copy + reel tempo.)
- **Sound for the films** — the CAROUSEL renditions are muted;
  tap-for-sound + audio-faithful captions is a recorded follow-up if
  directed. (Treatment-page films keep their audio and play on click
  — the biostimulators reels joined that class 2026-08-21.)
- ~~**Blob cleanup** — `evolysse-film.mp4` on media.needlegirlie.com~~
  DONE 2026-08-21 (operator direction): blob deleted, edge path purged,
  404 verified at the media origin; neighbours unaffected (DECISIONS
  same date).
- Carried from launch: counsel review of legal pages, manual
  keyboard/screen-reader a11y pass (laser pricing landed 2026-08-21).
  (Plausible: decided and PREPPED 2026-08-17 — ships dark; the flip
  is a relaunch-day config edit, RUNBOOK "Turning on analytics".)
- **Review tags are OPEN on a side branch** (2026-08-22): every page
  carries a short label (A–G on the non-service pages, 01–12 on the
  treatment pages, 13 on /injector-training) so a review pair can refer
  to pages by tag. They live ONLY on `review/page-numbers` (**PR #149**
  since 2026-08-25 — the original #138 was closed and reopened that day,
  so the preview environment is `…-149…`, not `…-138…`; probing the old
  number returns a dead environment), marked DO NOT MERGE, and its
  preview; `phase-c` and the standing client demo never carry them.
  **To remove: close PR #149 and delete the branch** — nothing on
  `phase-c` needs cleaning up. The full record, the temporary off
  switch, and a by-hand removal procedure (if the branch is ever
  merged) are in that branch's `docs/REVIEW-TAGS.md`; the decision is
  DECISIONS 2026-08-22. Strike this line when the PR is closed.

## Round close (scaffold added 2026-08-17 — external-audit Finding 2)

Operator decision 2026-08-17: **production stays dark until this
round completes.** The round completes when the three slots below are
filled and satisfied — the operator fills them, nobody else. Anything
raised after the freeze is recorded as change-order or retainer
scope, never silently absorbed (fixed-fee discipline).

1. **Frozen change list** (dated when frozen): _pending — the
   operator's "A LOT more" list, frozen as of ____._
2. **Relaunch target date:** _pending._
3. **The seven gaps as pass/fail acceptance checks** (fill with
   Amy/operator verdicts, not vibes): cinematic video ☐ · enormous
   type, few words ☐ · one idea per screen ☐ · noir as cinematic
   stage ☐ · flawless assets only ☐ · choreographed restrained
   motion ☐ · mobile-first ☐.

When all three are filled: execute **docs/RELAUNCH.md** (the
preconditions there — copy approval, presentation approval, analytics
flip — are hard gates).

## Working agreement for the round

- Every design decision is tested against the seven-gap yardstick.
- Evolve-scope: the ombre canvas and plate system are untouchable
  without new operator direction.
- Preview-first, always; reviews happen on Amy's phone before desktop.
- AI-enhanced imagery of Amy requires disclosure and her informed
  preview sign-off (hero precedent).
- Treatment-copy edits reset `clinicianApproved` (constraint 4); plan
  one consolidated re-approval round at the end, before relaunch.
