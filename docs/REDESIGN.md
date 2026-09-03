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
| **Media architecture: Blob media origin** — `media.needlegirlie.com` via the same Front Door (~$1–2/mo); the .mp4 films upload to Blob — the container holds eleven referenced objects as of 2026-08-26: the four carousel films, the ICON film, the two biostimulators reels, the body-contouring reel, the widescreen sounded /about team-film rendition (`girl-team-film-wide.mp4`, 2026-08-26), the /injector-training training reel (`training-reel.mp4`), and the regenerative PRP-visit reel (`prp-visit.mp4`) (the Evolysse film's object deleted 2026-08-21 after the film retired; the portrait team-film object `girl-team-film.mp4`, replaced 2026-08-26, is deleted once no open PR references it), repo sheds 53MB; captions stay in-repo (compliance audit trail, same-origin = no CORS); previews play production media by design; publish procedure in RUNBOOK "Publishing a film" | **Built** (2026-08-17, external-audit Finding 5; Git-LFS declined — CI bandwidth trap) | DECISIONS 2026-08-17 |
| **Mobile Aesthetics badge in the header** — SVG vector rebuild (Julius Sans One outlines, measured geometry; lockup variant stays in the brand kit); FULL BADGE at 48–80px phones / 128–160px desktop; **links out to yourmobileaesthetics.com** (new tab — constraint-2 operator override, the one sanctioned outbound reference) | **Shipped** (PR #102, merged 2026-08-15) | F-437304 asset set; DECISIONS 2026-08-15 (four entries); CLAUDE.md constraint-2 exception |
| **Hybrid nav** — hamburger menu carries the page links at EVERY width (inline desktop nav retired); Book is the one styled button, always visible; centered-brand shell at all widths (fixed the Z Fold collision, which predated the badge) | **Shipped** (PR #102, merged 2026-08-15) | operator decision after options; DECISIONS 2026-08-15 |
| **Pink arches around pictures** — house frame motif, generalized from the category-door arch into the shared `.ng-arch` recipe; every photo sitewide (Amy's direction 2026-08-17), exempting the hero backdrop, all film stages, the homepage Instagram post (Amy's named exception), and the lip style-guide diagram. 2026-08-18 evolutions (client direction, PR #126): the treatment pages' white paper mats + print tilts retired — every treatment photo now a bare arch on the pink canvas, matching /services; and the arch family gained its wide sibling, the segmental arch (`media-band--segmental`, curve over straight feet at 3:2), for landscape frames that must show full content | **Built** (2026-08-17; bare-arch + segmental 2026-08-18) | DECISIONS 2026-08-17 + 2026-08-18 |
| **Photo replacement sitewide** — page-by-page, operator + Amy pick per slot (picks in C:\Amy\New Pics; ~21 frames from the new professional shoot). Shipped: homepage doors (page 1) and the /services strip (page 2, three client releases recorded), both 2026-08-17; the /services photo-card menu (page 3 — Amy's own mockup, ALL TWELVE of her B-picks landed same day incl. the two operator-override frames; compact-tile grid after the operator's >50% shrink directive), 2026-08-18, PR #121, plus the same-week preview-feedback fix round (06 face-and-belt blur-fill composite; 10/11/12 re-graded brighter), PR #122; the wrinkle-relaxers treatment page (page 4 — Amy's picks 10/11/12: brow appointment under the neon, the hand-mirror male-client frame, and the Jeuveau-banner studio scene, whose band went three fit rounds on her feedback and landed as the full frame in the new segmental arch; third photo-override frame; page prepped by the Evolus-move PR #125, merged same day), 2026-08-18, PR #126; the dermal-fillers treatment page (page 5 — Amy's picks 14/15 replace the two Evolysse-box photos, 8K0A9591 joins "Lips, styled" to the right of its copy, the Evolysse film + heading retired at her direction — the first scoped compliance exception to come off the books — and, round 2 the same day, the "#1 provider" plate swapped for the Evolus Laurel plaque in the same spot with its §8.4 authorization widened to this page, plus air above the lip diagram), 2026-08-21; the skin-rejuvenation treatment page (page 6 — Amy's picks 19a/19b: Amy beside the PiXel8-RF cart replaces the interim docked-handpiece frame, the handpiece-in-hand menu-card frame reused beside "A longer view"; fourth pixel-override frame — the console readout, the first under the dosing bullet), 2026-08-21; the weight-loss treatment page (page 7 — the 23a InBody frame from behind replaces the weigh-in photo under the fourth photo override (the aftercare sign's text; 3:4 per-image aspect knob keeps head and feet), and a client-directed section of three client photo pairs — "They showed up for themselves" (round-2 copy the same day; the allowlist entry for the original heading withdrawn) — ships under operator override — the site's first before/after content, a §1/§8.3/§8.9 carve-out with all five releases + HIPAA authorizations on file; new `.pair-gallery` block, bare 12px frames, 30rem retina caplaser-treatments page (page 8 — Amy's picks 21a/21b/21d: beside the Versa Pro console replacing the below-resolution 2026-08-04 snapshot, seated with two applicators right of "Fine lines", and at the window with the Venus Epileve left of the new hair-removal section; fifth pixel-override frame — a second console readout; the same PR landed the priced menu from her flyers and the Epileve service), 2026-08-21; the skincare page (page 9, both photos — 28.jpg, the Skinbetter line-up above a spread of Amy's business cards, replaces the shelf photo beside "Individualized, with Amy" as a baked 4:5 crop at x=480 — the retina-correct route for a landscape source through the arch window; the two capped syringes in frame accepted as-is by the operator; flag reset — and, same day, 27.jpg replaces the "What it is" frame that cut Amy's head at the neck: the same held-out line-up with her chin visible, baked 4:5 at x=246, keeping sunbetter whole and AlphaRet readable), 2026-08-25; the iv-therapy page (page 10 — IV01/IV02, the client's picks: the wide studio frame beside "What a visit looks like" replaced by a client on her laptop mid-infusion with Amy at the IV pole — the recorded studio-wide alt defect retires with the asset — and a new row putting Amy tending a male client's IV arm left of "Individualized, with Amy", re-graded brighter on the operator's review [dim-ambient recipe, brightness 1.28]; Amy operator-identified in both frames, both client releases on file, NO overrides (the dermal-fillers class); flag reset), 2026-08-25; the regenerative page (the PRP media round — PRP01/PRP02/PRP.MOV, the client's picks: the blood-draw frame left of "Who they're generally for" (Amy's own arm, screening-notes only), the prepared-syringes frame right of "Individualized, with Amy" (seventh pixel-level override — legible packaging, crop/defocus declined), and Amy's own PRP-visit reel standalone before the visit steps on in-class autoplay (another provider injects on camera — the constraint-2 sixth exception, consent on file); flag reset), 2026-08-25; procedure in RUNBOOK "Replacing site photography" | **In progress** (started 2026-08-17) | operator directive; DECISIONS 2026-08-17, 2026-08-18 + 2026-08-21 |
| **Wrinkle-relaxers content round (2026-08-19)** — the Evolus Laurel ranking plaque ("The Top Evolus Injector in Charlotte." over the Top-50 display lockup, her arrows driving round 2), the page retitled "Neurotoxins - Wrinkle Relaxers" (menu-line wording extended to the page), "neurotoxin" page-wide (title, cards, FAQ, body — the §7 normalize rule superseded for this page only), and the VisitSteps numerals → MA chevron foil plates on every treatment page (her steps.png mockup) | **Merged** (PR #127, `8e9b942`, 2026-08-19; standing demo refreshed same day) | DECISIONS 2026-08-19 ×7; CLAUDE.md constraint-3 ranking exception; BUILD_SPEC §7/§8.4 |
| **Wrinkle-relaxers copy round (2026-08-23 → 24)** — client copy, three rounds on one PR. R1: the lead stops saying "creases"; the deck replaced with her wording naming the three areas. R2: "Not just for women" → "gender defined" (and the FAQ echo, so "gendered" is gone from the page) + "lines they'd rather not see"; "Individualized, with Amy" is her new paragraph closing "Your trust is well placed when you walk through the doors!", keeping "under clinician supervision" at the operator's direction. R3 (08-24): the deck's closing promise, flagged and rewritten on the 23rd, is **restored verbatim and extended** — the round's flag becomes an operator override. It trips no pattern, so nothing was allowlisted; the authorization is in DECISIONS + CLAUDE.md constraint 3 + BUILD_SPEC §8.3 only. Coupling recorded: the page's band photo carries the Jeuveau banner headline the deck now paraphrases, which retires that 2026-08-18 pixel override's stated premise **Round 4 (08-24), and the first to leave the page:** the "Personalized plan" step of "Your visit, step by step" now closes "Together with Amy, you decide what comes next." The sentence was pointed at on wrinkle-relaxers but lives in `VisitSteps.astro`, so it changed on **all twelve treatment pages** — surfaced before editing; operator chose sitewide over a page-scoped override. The dropped "if anything" was the only note in the four-step list allowing for no treatment; flagged, and resolved with **no override and no allowlist entry** (§8.7 holds — the sentence names Amy as co-decider). Approved flags deliberately left at 4 true / 8 false; CLINICIAN-SIGN-OFF carries the new words as a cross-cutting item since `check:approvals` cannot see a component edit. **Batch 2 (same day, four changes, one preview):** step 3 gains "Confidently"; two wrinkle-relaxers FAQ answers reworded (the gender pair deliberately left mismatched at the operator choice); and in `TreatmentLayout` the pricing line deleted and the consult router reworded — after which that card carries no form of the word "consultation" on any of the twelve pages. Compliant because §8.7 routing lives in `DisclaimerBlock` immediately below it, layout-injected and verified on all 12; a layout comment now records that so nobody softens the disclaimer to match the card. `pricingDisplay` left wired but inert — removing it is a twelve-file schema change and the operator call | **PR #143 open** (into `phase-c`; CI green, preview probed to convergence — awaiting Amy's review + the operator's word) | DECISIONS 2026-08-23 + 2026-08-24; CLAUDE.md constraint 3; BUILD_SPEC §8.3; compliance/README "Authorizations the registry does not hold" |
| **Dermal-fillers copy round (2026-08-26)** — client copy, two batches on one PR. Batch 1: the lead drops "gel" and takes her areas order ("lips, under-eye area, cheeks, jawline and chin" — body sentence synced, /services menu-card echo swept); the deck opens "Facial Balancing — …"; all three cards read "$650 (full-syringe) or $325 (half-syringe)". Batch 2: the "Placed in proportion" parenthetical becomes a spaced em-dash pair; "Individualized, with Amy" → **"Personalized, with Amy"** (this page only) over her new paragraph — "under clinician supervision" dropped at her direction (flagged once; the OPPOSITE of the wrinkle-relaxers call in the row above, both now on the record); "Lips, styled" closes "begins with a conversation."; "After weight loss" ends at "more visible." And **VisitSteps step 4 gains "to Amy" sitewide** (all 12 pages — surfaced first, operator chose sitewide, the steps-2/3 precedent; CLINICIAN-SIGN-OFF carries the cross-cutting item). No override, no allowlist entry, registry untouched; the flag was already false | **Merged** (PR #165 → `phase-c` `85b51ba`, 2026-08-26; both standing previews refreshed to convergence same day) | DECISIONS 2026-08-26 |
| **"Draft — pending clinician review" strip retired** — the DraftBanner component deleted sitewide; unapproved treatment pages render no visible marker (the client read it as final-site content). The approval gate is unchanged: flag + reset-on-edit + `check:approvals` in production; pending status lives in the flags and docs/CLINICIAN-SIGN-OFF.md (which now carries the grep). Precedent: the legal pages' counsel-review banner, 2026-08-04 | **Merged** (PR #128, `03ca83d`, 2026-08-21; demo refreshed `a88f776`) | operator direction; DECISIONS 2026-08-21; BUILD_SPEC §4/§7 passages still to update (classifier-blocked — operator) |
| **17a + 17b → /services/biostimulators** — Amy's two reels replace the studio portrait and play inside the media rows (`TreatmentVideo`, bare frame, sounded, click-to-play): the Radiesse-visit film (constraint-3 override: before/after cut + a unit-labeled carton; constraint-2 override: another provider on frame ~2s; client release + provider consent on file) and her Instagram reel (480p shipped as FINAL — retina-rule override, the round's first). Component fixes rode along: posters never upscale (/about's ICON poster was a 1280w upscale of a 960 source); `frame="bare"` narrows the 2026-08-18 "film mats stay" scope to the standalone player. Same-day review round (operator): the printed captions under both films removed, and both films AUTOPLAY MUTED on approach + loop while on screen (tap for sound; reduced motion = tap-to-play) via `TreatmentVideo autoplay="inview"` → the static `public/js/treatment-video.js` (~2KB — the third sanctioned script, first on a treatment page). **20 → body-contouring SHIPPED 2026-08-21** (Amy's Evolve reel replaces the session photo in the same row — the same pattern: bare frame, autoplay muted on approach; no client, no override, retina met at 576px; DECISIONS same date) | **Merged** (PR #131 → phase-c `b3afc12`, 2026-08-21; body-contouring film PR same day; both pages `clinicianApproved` reset — Amy's word on the demo) | DECISIONS 2026-08-21; CLAUDE.md constraints 2 + 3; BUILD_SPEC §5/§7.5/§8.3 |
| **Girl Team on /about** — a photo ADDITION (not a replacement): 29b full frame in the segmental arch, left of the milestones (`md:grid-cols-[5fr_6fr]`, DOM heading-first) — Amy with FOUR of the location's five other providers, releases confirmed on file; "Girl Team!" live on an opaque keystone plate straddling the arch crown (the site's FIRST text-over-photo, Phase C plate rule, Amy's casing kept); "Visit Mobile Aesthetics" below it — the SECOND sanctioned yourmobileaesthetics.com link (supersedes the badge row's "one sanctioned reference" above; own flag, own override) | **Shipped** (2026-08-25) | DECISIONS 2026-08-25; CLAUDE.md constraint-2 fourth exception; BUILD_SPEC §6 |
| **Evolus Laurel on /about** — the ranking plaque replaces the EvolusCallout recognition plate above the ICON film (the dermal-fillers 2026-08-21 swap repeated; client direction): page scope widened to three pages (operator authorization), the plate's "#1" sentence retired sitewide with its `allowedStrings` entry withdrawn (an authorization nothing uses is a loophole), the orphaned component deleted. Same PR, same day: the ICON film below the plaque autoplays muted in view, tap for sound — a scoped operator override of the 2026-08-21 narrated-manufacturer-film rule. Rides PR #153 | **Shipped** (2026-08-25) | DECISIONS 2026-08-25; CLAUDE.md constraint 3; BUILD_SPEC §8.4/§6/§7.4/§17 |
| **Team film on /about** — the carousel team film's SOUNDED rendition (`girl-team-film.mp4`: CRF 23 + the master's AAC copied, 6.86MB — both recipe deviations reasoned in DECISIONS) joins the Girl Team unit below the "Visit Mobile Aesthetics" button: autoplay muted in view, loop on screen, music one tap away — IN-CONTRACT (site-authored, no speech; the operator's confirmation is the record), unlike the ICON override; the constraint-2 SECOND exception widened to this placement (a third requires the operator); portrait 9:16 at the 18rem in-row film cap, bare frame, no printed caption; poster + master reused (dedup) — RE-RENDERED WIDESCREEN 2026-08-26, see the /about desktop-round row below (`girl-team-film-wide.mp4`, 16:9 center crop at full column width, own poster, cap retired, carousel-poster dedup ended). One operator passage open: the fourth exception's cross-reference sentence in CLAUDE.md (classifier-blocked) | **Shipped** (2026-08-25; widescreen 2026-08-26) | DECISIONS 2026-08-25 + 2026-08-26; CLAUDE.md constraint 2; BUILD_SPEC §6/§9/§13 |
| **/injector-training media round** — the dedicated training portrait (31.jpg → `amy-evolysse-cart.jpg`, the 2026-08-04 recorded upgrade path; sixth photo under pixel override — a second Jeuveau-banner frame, its own authorization) and Amy's training reel (`training-reel`, 810×1440 rendition, 7.59MB) standalone in the mat frame at a 24rem cap under the "Four courses" heading — carried as-is under operator override (burned-in curriculum cards, a legible per-vial quantity, injection b-roll with all five non-Amy releases confirmed, the on-screen practice-site URL as constraint-2 fifth exception), autoplay in-class (fourth opted-in page); LHCI 3× on the built page: media 0 / third-party 0 / total 198.9KB — the flagged budget carve-out proved unnecessary | **Shipped** (2026-08-25) | DECISIONS 2026-08-25 ×3; CLAUDE.md constraints 2+3 + script list; BUILD_SPEC §6/§8.1/§5/§13 |
| **/about milestones → MA chevron plates** — the "Two decades in the making." timeline's 01–04 Playfair numerals replaced by the VisitSteps chevron badge (operator direction, mockup chevrons02.png; supersedes the 2026-08-19 "milestones keep their numerals" scoping): plate + foil data hand-copied into about.astro under a dated provenance comment (own gradient-id namespace `about-foil-0…3`), the counter recipe's last live use retired, the display accent's light-canvas consumer count now zero (re-ink stays — tokens.css OMBRE CANVAS record updated); NO sr-only ordinal — deliberate asymmetry with VisitSteps' "Step N." (biography timeline; the headings carry the years) | **Shipped** (2026-08-26) | DECISIONS 2026-08-26; CLINICIAN-SIGN-OFF pending row + drift narrative |
| **/about desktop round: widescreen team film + centered Laurel** — the Girl Team film's vertical screen goes horizontal at operator direction: the film probed NATIVE portrait (every frame 1080 wide, ~17% full-bleed 9:16 — no letterboxed 16:9 inside), so the operator chose a true 16:9 center crop of the master after the trim flag, with a frame-pair checkpoint approved pre-upload (`girl-team-film-wide.mp4`, CRF 23 + AAC copied, 4.19MB, crop=1080:608:0:656 — a scoped override of RUNBOOK's no-crop rule); own poster from the new rendition (opener frame, operator-approved; the carousel keeps its portrait poster), new VTT (cues carried — audio identical; the burned-in overlay survives the crop), the 18rem cap retired (the film fills the unit column; the unit reads still → plate → button → film at one width). And the EvolusLaurel plaque centers on the band (`mx-auto max-w-3xl` hoist) — SECOND PASS same day, on seeing it rendered: the WHOLE Evolus unit centers, the two column divs merged back into one `mx-auto max-w-3xl`, "Inside Evolus" + its paragraph TEXT-centered (the operator's pick between block- and text-centering; the "Ready when you are" band is the page's precedent; the film's figcaption keeps its left seat — per-element classes, no wrapper text-center), fully superseding the 2026-08-18 left-aligned idiom; no column change ≤816px. Old portrait object deleted once no open PR references it | **Shipped** (2026-08-26) | DECISIONS 2026-08-26 ×3; CLAUDE.md constraint 2; RUNBOOK; BUILD_SPEC §6/§13 |
| **/about brand-ink round: black CTAs + placard, logo-pink lettering** — both "Book with Amy" buttons, the "Visit Mobile Aesthetics" anchor, and the "Girl Team!" keystone placard go noir chrome with lettering in the wordmark's own pink (operator direction; pink-500 #ec4899 pinned by pixel census + the canonical logo master — the whole word "Girlie" is literally that hex). The header Book button's shipped grammar (pink-500 on noir 5.95:1, cleared at body size on noir 2026-07-19; hover inverts, same symmetric pair) adopted page-scoped via one `.about-cta-brand` class in the is:global block — the sitewide `.cta` classes stand (12-page fan-out avoided); the Call button, all wording, events, the placard's keystone seat, opacity, and z-index unchanged; placard border hairline→pink-500 (the light hairline reads gray against noir). The page now runs one black-plate pink-ink motif: chevron plates, placard, CTAs | **Shipped** (2026-08-26) | DECISIONS 2026-08-26; tokens.css pair-consumer note |
| **Brand chip shared: home + training CTAs join /about's black buttons** — the 2026-08-26 page-scoped `.about-cta-brand` look hoisted to a shared `.cta--chip` + `emphasis="chip"` opt-in on CTAButton (identical declarations, same recorded 5.95:1 pair); new wearers at operator direction: the home "Follow Amy on Instagram" anchor and the /injector-training intro Call; /about's three brand CTAs re-seated on the shared class, rendering unchanged; **/services (menu + all 12 treatment pages) frozen at operator direction** — `.cta--outline`/`.cta--solid` byte-identical, zero chip in any built /services page; styleguide gains chip specimens. **Second pass, same day: the freeze narrowed at operator direction** — the router-card "Book with Amy" ("The right fit is just a conversation away.", all 12 treatment pages) and the laser-treatments mid-page book (the site's last light-canvas solid; style-only mdx edit, flag already pending) join the chip; the treatment closing bands and the /services menu page stay out | **Shipped** (2026-08-27, two passes) | DECISIONS 2026-08-27 ×2; tokens.css pair-consumer note updated |
| **/mobile — the party-and-van page** — a new standalone page (the /injector-training pattern; "Mobile" nav item after Visit): "Amy comes to you." over the van interior from her practice-site gallery (a 4:5 crop excluding the prep-workflow left third), "How a party works" in three items, the van film — Amy's own 2026-06-17 TikTok clip, saved through the platform's creator-enabled download under the operator's standing authorization, muted, in-view autoplay, at the 576px source's own 2× width — PREVIEW-ONLY under an open release flag for the seated guest (it replaced the studio group frame later the same day), a noir close + Call. Copy states only what her public posts establish; the unknowns are the questions sent with the preview. "Party" allowed by operator decision; the competitor brand name never appears. The Instagram party and van posts were catalogued by date for her originals, not pulled | **Merged into `phase-c`** 2026-09-02 (operator approval on the PR #177 preview; Amy's reaction pending on the standing demo) | DECISIONS 2026-09-02; BUILD_SPEC §6; CLINICIAN-SIGN-OFF non-gated section |
| **/mobile — the viewfinder film** — the friends section's film re-shot from Amy's own 1080×1920 clip, sent to the operator directly (a camcorder-viewfinder template burned in; the seated guest's release confirmed on file — no preview-only flag): content-named `van-viewfinder-treatment`, the 24rem-slot recipe (810×1440, 5.39MB), muted because the song is a commercial recording (the operator's listen — music only — is on the record; a sounded cut waits on a license), the wrapper's cap lifted from 18rem to the row's 24rem as the 2026-09-02 entry pre-authorized; the van film's poster and captions deleted, its Blob object deleted once unreferenced. The treatment-film phone-autoplay policy deferred to its own PR | **PR #181 open** (into `phase-c`) | DECISIONS 2026-09-03; BUILD_SPEC §6; CLINICIAN-SIGN-OFF non-gated section |

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

- **Amy's originals for /mobile** (2026-09-02; the film slot settled
  2026-09-03 with her own 1080 clip, its guest's release confirmed):
  the van exterior, the van reels of Jun 17 and Aug 11, the home visits
  of Jul 20 and May 16, the May 25 office party, the Apr 22–23
  Albemarle venue; the colleague's consent for the held van portrait; a
  music license if she wants the film's song on the site; and her
  answers to
  what the page leaves unsaid (which services travel, radius, minimum
  group, solo mobile visits, the van's name). Full list: DECISIONS
  2026-09-02 and the CLINICIAN-SIGN-OFF non-gated section.
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
  carries a short label (A–H on the non-service pages — H is /mobile, added 2026-09-03 — 01–12 on the
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
