# Changelog — needlegirlie.com

Human-readable record of what shipped, newest first. The *why* behind each
change lives in `docs/DECISIONS.md`; design specs live in
`docs/superpowers/specs/`. Commit hashes are the audit trail.

## Post-launch revision round (`phase-c`)

### 2026-09-03 — Home carousel autoplays on phones

- Reported from an Android phone: the film band did not autoplay. Two
  causes fixed. The band no longer sits out when the phone reports
  Reduce Motion (Android's "Remove animations", iOS Reduce Motion): the
  films are content with a pause control, so they play and only the
  crossfade drops to a cut (operator decision). And when a phone refuses
  script-started playback (iOS Low Power Mode, battery or data modes),
  the band now retries inside the person's first touch or key press —
  the first scroll counts — instead of giving up on the Play button. The
  built video also carries the muted and inline attributes Safari wants
  (DECISIONS 2026-09-03).

### 2026-09-03 — Home: scale, rhythm, and four new moves (on a preview for Amy)

- After the operator's design critique ("boring"), the home page's
  desktop composition steps up — phones are unchanged below 900px. The
  hero photo now bleeds toward the headline, which grows to the full
  display clamp over a one-sentence lead ("One clinician, every
  appointment. Amy Palacios, FNP, in medical aesthetics since 2017.");
  the copy stays on solid noir, never over the photo. The film band is
  composed: its heading (same words, two display lines) and controls sit
  beside the film, and Amy's own films open — studio → team → the two
  Jeuveau spots. Section openers step up to display sizes over
  one-sentence decks; the credentials line stays, compact. A new noir
  band — "Amy comes to you." beside the van interior — punctuates the
  ombre between the doors and the visit beat and gives /mobile its
  first door on the home page.
- The motion vocabulary gains four transform-only moves, zero JS: the
  hero still settles once from 1.04 to 1, full-bleed band photos drift
  against the scroll, rows of plates rise in sequence, and arched photos
  inside whole-card links (home doors, /services cards) grow to 1.03 on
  hover; the carousel's crossfade settles from .97 to 1 (never above, so
  the spots' safety screens stay complete). All rest under reduced
  motion. Three headline candidates go to Amy on the PR (DECISIONS
  2026-09-03).
- Later the same day the operator lifted the zero-JS rule **for this
  branch as a concept test** and asked for real movement. The home page
  gains a self-hosted GSAP + Lenis motion layer: the wordmark's neon
  flickers on, the headline rises word by word and "made personal."
  switches on like a tube, Amy's own studio reel (its three treatment
  passages, looped) plays slow and muted in the hero over her portrait,
  a four-chevron scroll cue pulses, the hero
  dissolves away on scroll, section openers rise word by word, the doors
  are dealt in sequence, photos rise into their arches, the van band
  parallaxes, and a faint neon light follows the cursor over noir. The
  choreography is off under reduced motion; the hero reel still plays
  there (the carousel's phone policy, below). The home page's script budget is raised from
  30KB to 80KB **on this branch only, for the home URL only** (a third
  gate row; the preview workflow runs the gates before deploying, so the
  lift had to reach the gate); every other page and budget is unchanged
  (DECISIONS 2026-09-03 addendum). First tweak on the operator's
  reaction: the hero film's three passages each rest on their last
  frame for 3.5 s before dissolving to the next, so the film no longer
  cuts every couple of seconds. Second tweak: the film runs two passes,
  then dissolves back to the portrait it started from and stays there.
  Third tweak: the film band's order goes back to the Aug 14 sequence,
  the Jeuveau commercial first (operator direction).

### 2026-09-02 — /mobile: "Amy comes to you." (new page, on a preview for Amy)

- The site gains its first description of the mobile side of the
  practice: a standalone page on the /injector-training pattern with a
  "Mobile" nav item after Visit. Hero ("Amy comes to you." over the van
  interior in the house arch, Call chip), "How a party works" in three
  items, "Bring the people you'd bring anyway." beside the studio group
  frame in the segmental arch, and a noir close ("Your place. Amy's
  care."). Every fact traces to Amy's own public posts and practice
  site; the unknowns (which services travel, how far, group minimums)
  are deliberately not written and go to Amy as questions with the
  preview link. "Party" is her own word, allowed by operator decision;
  the competitor brand name her captions pair with it appears nowhere.
- Both photos come from her practice site's gallery (operator-authorized
  download): the van interior as a 4:5 crop that leaves the frame's
  sharps container, syringe organizer, and vials outside the window, and
  the studio group frame preview-only under an open release flag (two
  identifiable clients — Amy confirms). Two more frames were held for
  releases. The van and party reels found on Instagram were catalogued
  by date for Amy's originals, not pulled (DECISIONS 2026-09-02).
- Later the same day: the studio group frame is replaced by the van
  film — Amy's own TikTok clip of 2026-06-17 (Amy treating a seated
  guest in the van), saved through the platform's creator-enabled
  download under the operator's standing authorization for her own
  posts, after a sanctioned-source search (archive, Vagaro, Google
  Business Profile, YouTube, Facebook, TikTok — DECISIONS 2026-09-02,
  the film entry). A muted 9-second loop with in-view autoplay in the
  bare frame, served at the 576px source's own 2× width (18rem) rather
  than under a retina override; preview-only under the open release
  flag for the guest. `studio-friends-session.jpg` deleted. The hero's
  tiers went to 480/660/1152 at q70 in the same round: the poster's
  21KB had pushed the page's LCP 55ms over its 2.5s budget, and the
  lighter hero tier brought it back to 2.26s (DECISIONS, the film
  entry's addendum).
- Gates: /mobile joins pa11y (needs-review cap authorized in the
  operator's words) and the Lighthouse set. BUILD_SPEC §6 gains the row;
  CLINICIAN-SIGN-OFF gains a non-gated review section.

### 2026-08-27 — chip second pass: treatment router cards + the laser mid-page button

- The freeze in the entry below narrowed the same day at operator
  direction: the "Book with Amy" in every treatment page's router
  card ("The right fit is just a conversation away." — all 12 pages)
  now wears the black brand chip, and /services/laser-treatments'
  mid-page pink "Book with Amy" reverses to it (black, logo-pink
  lettering; style only, no copy — the page's approval flag was
  already pending). The treatment closing bands and the /services
  menu page stay as they are. (DECISIONS 2026-08-27, second entry.)
- Record sweep, same day: with the router cards chipped, no outline
  CTA renders on the light canvas anymore — the ombre re-ink notes
  (tokens.css OMBRE CANVAS/COMPANION RE-INK, global.css, BUILD_SPEC
  §5) now say so, and the `--ng-link` re-ink stays as
  defense-in-depth (the 2026-08-26 display-accent precedent).

### 2026-08-27 — the brand chip goes shared: home + training buttons join /about's black CTAs

- The black brand chip (noir fill, logo-pink lettering — /about's
  2026-08-26 brand-ink look) is now the shared `.cta--chip` style on
  CTAButton with an `emphasis="chip"` opt-in, and two more buttons
  wear it at operator direction: home's "Follow Amy on Instagram"
  and /injector-training's intro "Call 704-579-7108". /about's three
  brand CTAs ride the shared class now (rendering unchanged). The
  /services menu page and all 12 treatment pages are frozen — no
  button changes there (operator scope). (DECISIONS 2026-08-27.)

### 2026-08-27 — /about credential line carries the full education

- The "2018 · Nurse practitioner" milestone now reads "The
  credentials read FNP, built on a BA, a BSN, and a Master of
  Nursing." (was "The credential reads FNP, BSN.") — Amy confirmed
  the full credential set to the operator 2026-08-27, and the
  operator directed the recognition. "Master of Nursing" spelled out
  pending her exact post-nominals (DECISIONS 2026-08-27).

### 2026-08-27 — /about milestone heading reworded

- The first "Two decades in the making." milestone now reads "The
  early years" (was "The bedside years") — operator direction; one
  heading, no other text. The heading was part of the Amy-confirmed
  2026-08-04 wording, so the change rides her pending presentation
  pass (DECISIONS 2026-08-27).

### 2026-08-26 — /about brand-ink round: black CTAs and plate, logo-pink lettering

- Both "Book with Amy" buttons, the "Visit Mobile Aesthetics" button,
  and the "Girl Team!" placard on /about now wear the Needle Girlie
  logo's own ink: black chrome with lettering in the wordmark's exact
  pink (`--ng-pink-500` #ec4899 — pinned by pixel census and the
  canonical logo master), the header Book button's shipped grammar
  with its recorded 5.95:1 pair. Hover inverts to a pink fill with
  black text. Page-scoped — every other page's buttons unchanged; the
  closing band's Call button and all wording, events, and the plate's
  keystone seat untouched. The page now carries one consistent
  black-plate, pink-ink motif (chevron plates, placard, CTAs).
  (DECISIONS 2026-08-26.)

### 2026-08-26 — /about desktop round: the team film goes widescreen; the Laurel centers

- The Girl Team film now plays on a horizontal screen. The film is
  natively vertical (probed: every frame 1080 wide, with full-bleed
  9:16 moments — not a widescreen picture in a tall frame), so at the
  operator's direction it was re-rendered as a true 16:9 center crop
  of the master (`girl-team-film-wide.mp4`, 4.19MB, music untouched)
  — a scoped, operator-approved exception to the no-crop rule, with
  frame-by-frame checkpoint approval pre-upload. Every head stays in
  frame in every beat; the neon and the "GiRL TEAM" overlay survive;
  the full-height beats lose lower legs. The film now fills the unit
  column — still → plate → button → film at one width — and the
  18rem portrait cap retired. New poster (the opener frame) and
  captions; the carousel's portrait rendition and poster unchanged.
- The Evolus Laurel plaque centers on the page band on desktops (it
  hugged the band's left edge — 160px vs 512px of pink at 1440); the
  "Inside Evolus" heading and ICON film keep their left rail. No
  change on phones. (DECISIONS 2026-08-26 ×2.)
- Second pass, same day: the WHOLE Evolus unit now centers — on
  seeing the centered plaque, the operator asked for the rest.
  "Inside Evolus" and its paragraph are text-centered (the operator's
  pick between block- and text-centering; the "Ready when you are"
  band is the page's own precedent), and the ICON film centers by
  filling the column. Classes only — every word unchanged
  (DECISIONS 2026-08-26).

### 2026-08-26 — Dermal fillers: the client copy round (two batches); step 4 names Amy

- /services/dermal-fillers, her wording throughout (PR #165). The lead
  drops "gel" and takes her areas sentence — "Injectable fillers for
  volume and contour. Common areas include the lips, under-eye area,
  cheeks, jawline and chin." (the body's matching sentence synced; the
  /services menu card drops "gel" too). The deck now opens "Facial
  Balancing — volume and contour in proportion — never more than the
  face asks for." All three product cards read "$650 (full-syringe) or
  $325 (half-syringe)".
- Body copy: the "Placed in proportion" parenthetical becomes a spaced
  em-dash pair; "Individualized, with Amy" is retitled "Personalized,
  with Amy" (this page only) over her new paragraph — "under clinician
  supervision" comes off at her direction (flagged once; the opposite
  of the wrinkle-relaxers 2026-08-23 call, both now on the record);
  "Lips, styled" closes "begins with a conversation."; "After weight
  loss" ends at "more visible."
- **Sitewide:** "Aftercare guidance" (step 4 of "Your visit, step by
  step") now reads "…a direct way to reach out **to Amy** if questions
  come up." — the sentence lives in the shared VisitSteps component,
  so it changed on all twelve treatment pages (surfaced first; the
  operator chose sitewide, the 2026-08-24 steps-2/3 precedent).
  CLINICIAN-SIGN-OFF carries it as a cross-cutting item.
- No banned pattern touched, no registry change; dermal-fillers'
  flag was already `false` — no reset. DECISIONS 2026-08-26.

### 2026-08-26 — /about milestones wear the chevron plates

- The "Two decades in the making." timeline's 01–04 numerals are
  replaced by the Mobile Aesthetics chevron plates — the same badge
  the treatment pages' "Your visit, step by step" list has worn since
  2026-08-19, now on /about at the operator's direction (reference
  screenshot chevrons02.png). Same plate, same size, its own gradient
  ids. Design-only: every heading and paragraph in the section is
  byte-identical, so no approval-flag implications (DECISIONS
  2026-08-26).

### 2026-08-26 — Text selection visible everywhere (the invisible-highlight fix)

- Highlighting text mid-page on the ombre canvas — surfaced by the
  text-review round on /services/dermal-fillers, where "Placed in
  proportion" sits exactly where the old fixed pink highlight crossed
  canvas-equal luminance (1.00:1, with selection letters matching the
  body text) — now paints a dark ink plate with light letters at every
  point of every light page. Noir bands (header, footer, CTA bands,
  the Laurel plaque) keep their pink highlight pixel-for-pixel.
  Selection and copy always worked mechanically; only the feedback was
  invisible. Colors only — no copy changes, no approval-flag resets
  (DECISIONS 2026-08-26).

### 2026-08-25 — Regenerative: the PRP media round (two photos + Amy's reel on autoplay)

- /services/regenerative grows from one photo to the full media rhythm.
  "Who they're generally for" gains a photo to its LEFT — the blood
  draw that starts a PRP visit (Amy's own arm, operator-identified;
  manufacturer tube labels only, no patient labels). "Individualized,
  with Amy" gains a photo to its RIGHT — the four prepared PRP
  syringes, shipped as-is under operator override for the legible
  packaging in frame (the seventh pixel-level override — DECISIONS
  2026-08-25). And Amy's own ~9s reel lands directly before "Your
  visit, step by step": Amy receiving her own PRP hairline treatment,
  autoplaying muted in view, looping, near-silent audio one tap away
  (no speech — the operator's confirmation is the record). One of the
  location's other providers injects on camera, face mostly out of
  frame, never named — the constraint-2 sixth scoped exception,
  consent on file. The autoplay script's fifth page.
- `clinicianApproved` reset on regenerative (approved content edited —
  constraint 4); Amy re-reviews on the preview.

### 2026-08-25 — IV therapy: the IV photos land (photo round page 10)

- /services/iv-therapy — the wide studio frame beside "What a visit
  looks like" (the page's one photo, and the carrier of the recorded
  "two clients" alt defect) gives way to the client's pick IV01: a
  client on her laptop mid-infusion while Amy prepares supplies at the
  IV pole (PNG master re-encoded JPEG q92; per-image top anchor keeps
  the hanging IV bag). A new media row puts her pick IV02 to the LEFT
  of "Individualized, with Amy": Amy tending a male client's arm for
  an IV infusion — re-graded brighter the same day at the operator's
  direction (the dim-ambient house recipe, brightness 1.28). Amy
  operator-identified in both frames; both pictured clients' releases
  confirmed on file; no overrides needed (DECISIONS 2026-08-25).
  `studio-wide.jpg` deleted (no other consumer) — its alt defect
  retires with it.
- `clinicianApproved` reset on iv-therapy (approved content edited —
  constraint 4); Amy re-reviews on the preview. Flags now read
  2 true / 10 false.

### 2026-08-25 — /injector-training: dedicated portrait + Amy's training reel

- The hero portrait is now the dedicated training photo (Amy holding
  Evolysse cartons before the Jeuveau banner) — the upgrade path
  recorded 2026-08-04 when the grey-seamless frame was reused. Ships
  under its own pixel-level claims override (banner marketing text and
  partial safety fine print legible in the served file — DECISIONS
  2026-08-25); the shared portrait stays on its two treatment pages.
- Amy's 19.8-second training reel lands directly under "Four courses,
  taught one-on-one.", before the course cards — her own film, the
  flyer set animated, carried as-is under operator override (the
  burned-in cards mirror the page's authorized card copy; all
  on-camera releases confirmed on file; the closing card's on-screen
  practice-site URL is a display-only constraint-2 exception).
  Autoplays muted in view (in-class — speech-free, [Music]-cue
  captions), loops, pauses off-screen, tap for sound; reduced motion
  keeps click-to-play. The autoplay script's fourth page. LHCI
  measured 3×: the strict house budgets hold — no carve-out.
### 2026-08-25 — The team film joins the Girl Team unit on /about

- The Mobile Aesthetics team film — the ~14s film the home carousel
  plays — now also plays on /about, directly below the "Visit Mobile
  Aesthetics" button, in a new SOUNDED rendition (`girl-team-film.mp4`):
  autoplay muted as it scrolls into view, looping on screen, the music
  one tap away on the native controls (no speech or narration — the
  operator's confirmation is the record, so the autoplay opt-in is
  in-contract, unlike the ICON film's override). The constraint-2
  team-film exception widens to this placement (DECISIONS 2026-08-25);
  the five providers' releases, confirmed 2026-08-17, cover the film.
  Portrait 9:16 at the treatment pages' 18rem in-row film width, bare
  frame, no printed caption. The Girl Team unit now runs still → plate
  → button → film; /about is structural, so no approval flag moves.

### 2026-08-25 — The ICON film autoplays on /about

- The Evolus ICON film now autoplays muted when scrolled into view,
  loops while on screen, and pauses off-screen — tap for sound (the
  caption's "sound on" is the nudge); reduced motion keeps
  click-to-play. This is a scoped operator override of the 2026-08-21
  rule that narrated manufacturer films never autoplay (flagged, and
  the client chose autoplay — DECISIONS 2026-08-25). /about gains the
  ~2KB autoplay script, its third page. Rides PR #153.

### 2026-08-25 — The Evolus Laurel replaces the recognition plate on /about

- The EvolusLaurel ranking plaque (the wrinkle-relaxers banner) now
  renders on /about above the ICON film, in the retired EvolusCallout
  plate's exact spot — the dermal-fillers swap repeated at the
  client's direction. The ranking sentences' page scope widens to
  /about (operator authorization; CLAUDE.md constraint 3, BUILD_SPEC
  §8.4). The plate's sentence thereby retires sitewide: its
  `allowedStrings` entry withdrawn (operator choice — an authorization
  nothing uses is a loophole), the ranking vocabulary banned
  everywhere again, and the orphaned EvolusCallout component deleted
  (DECISIONS 2026-08-25). Rides PR #153 for one combined /about
  review.

### 2026-08-25 — Girl Team on /about

- /about's milestones section becomes a photo-left grid: Amy with four
  of the location's five other providers, full frame in the segmental
  arch, "Girl Team!" on an opaque keystone plate straddling the arch
  crown — the site's first text-over-photo — and below it "Visit
  Mobile Aesthetics", the second sanctioned outbound link to
  yourmobileaesthetics.com (the header badge, 2026-08-15, was the
  first; older "one sanctioned reference" notes below are superseded).
  All three parts ship under the fourth constraint-2 scoped operator
  override, direct from Amy; the four pictured providers' releases
  confirmed on file (DECISIONS 2026-08-25). /about is not treatment
  content — no `clinicianApproved` flag involved.

### 2026-08-25 — Skincare: the products-and-cards frame replaces the shelf photo

- /services/skincare — the shelf photo beside "Individualized, with Amy"
  gives way to 28.jpg: the Skinbetter Science line-up standing above a
  spread of Amy's business cards (photo round page 9). Committed as a
  baked 4:5 crop (854×1067 window at x=480) so the landscape frame meets
  the retina rule through the arch window; no 4:5 window holds all seven
  products, so the outer two crop out (the full-frame segmental option
  was offered and declined). Two capped syringes among the cards ship
  as-is at the operator's word — a screening-note acceptance, not an
  override (DECISIONS 2026-08-25). `skinbetter-shelf.jpg` deleted (no
  other consumer).
- `clinicianApproved` reset on skincare (approved content edited —
  constraint 4); Amy re-reviews on the preview. Flags now read
  3 true / 9 false.
- Same day, the first photo too: the "What it is" frame (which cut
  Amy's head off at the neck) gives way to 27.jpg from the same shoot —
  the same held-out product line-up with **her chin visible**, as a
  baked 4:5 crop (1108×1385 at x=246) that keeps both franchises the
  copy names: sunbetter whole, AlphaRet readable at the edge.
  `skinbetter-lineup.jpg` deleted (no other consumer). Flag already
  false; Amy reviews both new photos on one preview.

### 2026-08-25 — The storefront QR joins the Skinbetter callout

- The noir storefront plate on /services/skincare now carries a QR
  code — the register-and-shop handoff from Amy's counter card,
  regenerated as a crisp 4.5KB SVG encoding the operator-supplied
  skinbetter.com registration URL (her practice partner id attached).
  White tile, black modules, caption inside; the shop button beside it
  remains the click path, so the QR is never the only route. Verified
  three ways: the committed SVG and the rendered page's screenshot
  both decode to the exact URL, and the operator scan-tested it live.
  Zero JS; first QR on the site (DECISIONS 2026-08-25).

### 2026-08-24 — Treatment pages: step 3, two FAQ answers, and the consult router

- **"Your visit, step by step", step 3** now reads "**Confidently** book your
  appointment when you are ready. Every visit includes time for questions
  before anything begins." Sitewide, like step 2.
- **wrinkle-relaxers FAQ** — "Do men get neurotoxin treatments?" answers "Yes.
  Expression lines **are not gender based**…" The body copy under "Not just for
  women" **deliberately keeps** "aren't gender defined": the operator was shown
  the mismatch and chose the FAQ alone, reversing the matched-pair call made
  for this wording on 2026-08-23. The page says it two ways on purpose — do not
  sync them.
- **wrinkle-relaxers FAQ** — "Do I need a consultation before booking?" now
  answers "No. A consultation is never required; however, one is free upon
  request." Drops "Book directly, or ask to talk it through first." "Free upon
  request" now matches TrustChips' operator-confirmed wording exactly.
- **The treatment layout's consult router**, on all twelve pages: the pricing
  line "Pricing is individual and discussed during your consultation." is
  **deleted**, the heading is now "The right fit is just a conversation away.",
  and the subline is "Every plan is personalized, decided between you and Amy."
  ("personal" corrected to "personalized" the same day, before merge)
- **Read this before touching the disclaimer.** The router card now contains no
  form of the word "consultation" — and that is still compliant, because
  BUILD_SPEC §8.7 routing is carried by `DisclaimerBlock` directly below it,
  which is layout-injected and cannot be opted out of. Verified present on all
  12 built pages. **The disclaimer is the routing; the card is not.** A comment
  in the layout says so, and warns against softening the disclaimer to match
  the card's new tone.
- `pricingDisplay` is now **inert** — no enum value renders anything, though 10
  of 12 files still set `consult`. The field, schema enum, Props entry and
  `[slug].astro` pass-through were all left in place so restoring the line is a
  one-liner; removing them is a twelve-file schema change and the operator's
  call. The unused destructure was dropped to keep `astro check` at 0 hints.
- Recorded as a trend, not a defect: today's edits moved the pages consistently
  toward less talk-first and optionality language. Each is individually
  compliant, none trips a pattern, and the §8.7 gate is intact — noted so the
  next such trim is judged against where the pages now stand.
- Batched at the operator's direction — five changes, one preview for Amy.
  Registry, CLAUDE.md and BUILD_SPEC all untouched. `npm run verify` green.

### 2026-08-24 — "Your visit, step by step": the "Personalized plan" step

- The second step now closes **"Together with Amy, you decide what comes
  next."** (client wording, verbatim). It replaces "Together you decide what,
  if anything, comes next."
- **This one is not page-scoped.** The sentence was pointed at on
  /services/wrinkle-relaxers but lives in `src/components/VisitSteps.astro`,
  which `TreatmentLayout` renders on **all twelve treatment pages** and the
  styleguide. Surfaced before editing; the operator chose the sitewide change
  over a page-scoped override that would have needed a prop, a layout
  pass-through, and a schema field.
- Flagged once: the dropped "if anything" was the only note in the four-step
  sequence allowing for no treatment, where steps 3 and 4 are a treatment
  visit and aftercare. Drift, not a rule break — §8.7 still holds, since the
  sentence names Amy as co-decider and suitability still routes to her. **The
  operator chose the verbatim wording and it resolved with no override and no
  allowlist entry** (DECISIONS same date); `banned-patterns.json` untouched.
- Naming Amy is a small gain — the outgoing sentence's bare "Together" never
  said with whom. The idiom is not retired sitewide: dermal-fillers keeps its
  own "what, if anything, to place" line.
- `clinicianApproved` untouched at the operator's direction — flags stay 4
  true / 8 false, and `check:approvals` cannot see a component edit anyway.
  CLINICIAN-SIGN-OFF carries the new step text as a cross-cutting item so Amy
  reviews words that changed on four pages she has already approved.
- Verified: the new sentence renders exactly once on all 13 pages that carry
  the component; the outgoing string returns zero.

### 2026-08-24 — Wrinkle relaxers: the deck reverts to the client's own wording

- **This reverses one bullet of the 2026-08-23 entry below.** The deck card
  on `/services/wrinkle-relaxers` now carries her original sentence, restored
  verbatim and extended to say where the areas sit: "A light, deliberate hand
  for those lines repeated expressions leave behind. Wave good-bye to your
  crow's feet, "11's" between your eyes and forehead frown lines!"
- Yesterday's compliant rewrite of that second half is gone. The promise verb
  was flagged once, on 2026-08-23, in full; **the operator overrode after the
  flag and after seeing the page rendered.** It ships as directed.
- Because the sentence trips no pattern in the compliance registry — verified
  again, `lint:claims` green — there is still **no allowlist entry**. The
  authorization lives in `docs/DECISIONS.md` (2026-08-24) and nowhere else,
  the same shape as the EvolusLaurel ranking sentences. A green linter does
  not authorize this wording.
- Reported to the operator before building, and recorded in the decision:
  the page's band photo ships under a 2026-08-18 pixel override whose premise
  is that the site's own copy never repeats the Jeuveau banner's headline.
  The banner reads "KISS YOUR 11s GOODBYE"; the deck now paraphrases it a
  screen above. The operator directed the change with that in hand.
- Scope is one field on one page. Verified in the built output: one
  occurrence sitewide, and absent from `<meta>` and every JSON-LD block.
  `clinicianApproved` was already false (2026-08-18) — no flag moved; flags
  still read 4 true / 8 false. Amy's sign-off row is extended so she reviews
  this text, not yesterday's.
- **CLAUDE.md updated at the operator's direction.** Constraint 3's
  outcome-promise exception list now enumerates this deck sentence, with its
  page scope, its never-restate-anywhere-else clause, and a pointer to the
  band photo's own override — so the next session finds the authorization in
  the governing doc and not only in the decision log. The banned-pattern
  registry is untouched and `lint:claims` stays green; no gate changed.
- **Documentation swept before merge.** BUILD_SPEC §8.3's exception list gains
  the same entry (it is that list's first exception for first-party marketing
  prose). `compliance/README.md` gets a factual correction — it described the
  2026-08-18 pixel overrides as covering text "the site's own copy could not
  say", which this change made false for the wrinkle-relaxers frame — plus a
  new section, **"Authorizations the registry does not hold"**, because
  auditing `allowedStrings` no longer tells you everything that ships under
  override. RUNBOOK step 1 carries both lessons as pointers; REDESIGN gets a
  tracker row. PHASE-C deliberately untouched (it routes post-launch work to
  REDESIGN by its own header).

### 2026-08-23 — Wrinkle relaxers: new lead, deck, and body copy

- Client direction for the two blocks that open
  `/services/wrinkle-relaxers`. The lead sentence stops saying "creases" —
  it now reads "Prescription injectable treatments that soften dynamic
  lines: the ones that come from repeated expression."
- The deck card is replaced with her new wording, which names the three
  areas: "A light, deliberate hand for those lines repeated expressions
  leave behind — crow's feet, "11's", and frown lines."
- Her draft closed that sentence with a promise verb aimed at the reader.
  Flagged as an outcome claim, with the note that it trips **no** pattern
  in the compliance registry — the linter would have passed it, so this
  was judgment, not a gate catch. **The operator chose the compliant
  rewrite over an override**, the first flag of the round to resolve that
  way: her opening clause and all three named areas survive verbatim, only
  the promise goes, and no new allowlist entry or exception record exists
  to maintain (DECISIONS same date).
- The second "creases", in "What they are", stays by the operator's
  choice — out of the scope he set. `clinicianApproved` was already false
  (2026-08-18), so no flag moved; flags still read 4 true / 8 false.
- **Round 2, same day and same PR** — three more copy changes on the
  page. "Not just for women" now opens "Expression lines aren't gender
  defined…" (her wording, unhyphenated as dictated) and its second
  sentence ends "lines they'd rather not see" (was "rather soften").
  The FAQ carried a near-verbatim echo of that first sentence and
  changed with it at the operator's direction, so "gendered" is gone
  from the page entirely.
- "Individualized, with Amy" takes her replacement paragraph, closing
  "Your trust is well placed when you walk through the doors!" Her draft
  had also dropped "under clinician supervision" — flagged, because
  BUILD_SPEC §7 names it in the copy pattern, and **the operator chose to
  keep the clause**. (No gate requires it, and three of twelve pages
  carry no supervision language at all, so dropping it would have been
  defensible — this was a judgment call, recorded in DECISIONS.)
- "Rather not see" was flagged once and ships as directed: it leans
  toward absence where "soften" mirrors the product labeling, but it
  describes the client's wish rather than a result. No registry change,
  no allowlist entry, no override anywhere in either round.

### 2026-08-23 — `/services` intro: the third service category is now "Wellness"

- Client direction. The lead paragraph's second sentence listed three
  service categories and ended the third as a trailing "all things …
  oriented" modifier. It now reads "From Facial Balancing to Weight Loss &
  Body Contouring to Wellness, Amy has your best self in mind." — three
  parallel categories instead of two plus a modifier.
- "Wellness" is already how `/about` groups the same work, and it is clean
  against every banned category, so `compliance/banned-patterns.json` is
  untouched.
- The allowlisted fragment "Amy has your best self in mind" is unchanged
  and still in use, so its authorization stands. The source lines were
  rewrapped to keep it whole on one line — the linter strips allowed
  strings per line, so a wrapped copy would trip `superiority`.
- The in-page comment's "verbatim" claim was amended in the same commit;
  no treatment content changed, so no `clinicianApproved` flag moved.

### 2026-08-22 — Peptide therapy: the "Delivered, and always supervised" section is gone

- Amy flagged the section on `/services/peptide-therapy`. It is deleted
  rather than reworded: both of its facts already lived elsewhere on the
  page — how peptides are given is in the FAQ almost verbatim, and
  supervision was stated in five other places. The page said "supervised"
  **seven** times; it now says it once, in the SEO description.
- The section's one unique fact moves to where the rest of the site keeps
  it. "What it is" now reads "The ones Amy offers are prescription
  treatments, given in a clinical setting, usually as a small injection" —
  the pattern `wrinkle-relaxers` and `weight-loss-glp-1` already use, and
  narrower than the blanket sentence it replaces.
- Gone with it: "never something you sort out on your own", a line written
  at gray-market peptide sellers that landed on the reader instead.
- The lead paragraph under the H1 loses the word too ("each offered within
  a plan built around you"), and the FAQ asks "Who gives the treatment?"
  instead of "Who supervises peptide treatments?" — same answer, minus the
  implication that Amy watches while somebody else injects.
- The closing line joins the house sentence six other treatment pages
  already use: "plans and gives every peptide treatment herself". The deck
  and the SEO description are unchanged.
- `clinicianApproved` reset on peptide-therapy (approved content edited —
  constraint 4); Amy re-reviews the copy on the preview.

### 2026-08-21 — Laser treatments: the priced menu and Venus Epileve laser hair removal

- `/services/laser-treatments` gains its menu: every product card now
  carries prices transcribed from Amy's two Mobile Aesthetics pricing
  flyers (view-only sources — only names, areas, and prices transfer;
  the flyers' marketing copy never enters the repo). Item names are
  flyer-verbatim at the operator's direction; series prices ship with
  their counts as units of sale (the body-contouring "course of six"
  form). `{{VENUS_VERSA_MENU}}` is resolved.
- A fourth service joins the line: **Venus Epileve laser hair removal**
  — a new product card (four area tiers, single and series of six), a
  new "Laser hair removal" section with the full area menu and the
  women's and men's packages, and its own "Book with Amy" button (it
  books directly; the three Versa Pro applications stay
  consult-first). Summary, deck, SEO title/description, the first FAQ
  ("Is this actually a laser?" — now "Partly"), and the /services
  menu-card summary follow.
- Photo round page 8: Amy's picks 21a (beside the Versa Pro console —
  replaces the below-resolution 2026-08-04 console snapshot, now
  retired), 21b (seated with two applicators, right of "Fine lines"),
  and 21d (at the window with the Epileve, left of the new section).
  The Epileve frame ships under operator override after the compliance
  flag: the device console's settings readout is legible in the served
  source (fifth pixel-level override — CLAUDE.md constraint 3,
  BUILD_SPEC §7.12/§8.1, DECISIONS 2026-08-21).
- `clinicianApproved` reset on laser-treatments (approved content
  edited — constraint 4); Amy re-reviews prices and photos on the
  preview.
- Round 2, same PR (operator preview review): the hair-removal prices
  now render as a **price sheet** — a new zero-JS `PriceSheet`
  component laying out Amy's guide exactly as printed: three columns
  (single · full series of six · full series at ~15% off), three groups,
  all thirty prices; a ledger on desktop, labeled price strips on
  phones. The Epileve card slims to two lines and points to the sheet.
  Round 3: a three-level type ladder (title → ink-pink group heading →
  indented, lighter item names) so packages read as children of their
  heading, not peers.
- Copy: the "name Amy uses on her menu" clause removed from "What they
  are" and the first FAQ answer (it implied she coined the category
  name); the physics statements stand.

### 2026-08-21 — Weight loss: the InBody frame from behind; a "Before and After" section

- /services/weight-loss-glp-1 — the weigh-in photo beside
  "Individualized, with Amy" gives way to the same InBody client seen
  from behind (operator pick 23a, derived upright from the EXIF-rotated
  master; the arch runs 3:4 for this frame so head and feet both
  stay). The aftercare wall sign's text is legible in the served file —
  shipped as-is under operator override after the compliance flag (the
  fourth photo override; DECISIONS same date).
- A new section, "They showed up for themselves", closes the body:
  three client-supplied side-by-side photo pairs in bare 12px frames
  at a 30rem cap, under an intro that carries the clients' consent and
  every-plan-is-individual in copy and routes to a consultation — the
  site's first before/after content, under operator override after the
  compliance flag (BUILD_SPEC §1, §8.3, §8.9 and the lint:claims gate
  were each flagged). Releases and HIPAA marketing authorizations for
  all five pictured people confirmed on file. (Round 2, same day: the
  original "Before and After" heading and its "results vary" line were
  replaced at the operator's direction; the allowlist entry briefly
  authorized for that heading was withdrawn.)
- `clinicianApproved` reset on weight-loss (approved content edited —
  constraint 4); Amy re-reviews on the preview.
  `supervised-weigh-in.jpg` deleted (no other consumer).

### 2026-08-21 — Body contouring: Amy's Evolve reel replaces the session photo

- /services/body-contouring — the Reel-screenshot photo beside "What a
  session is like" (449px, below the retina rule) is gone; Amy's own
  Evolve reel plays there (`evolve-reel.mp4`, 576×1024, 17s, sounded):
  Amy alone in the treatment chair with the applicators under her neon,
  a collage edit. Same row shape — film left, copy right — in the bare
  frame, autoplaying muted on approach and looping in view, sound one
  tap away on the native controls (operator direction). Served from
  the media origin with in-repo captions (`[Music]` cues). No client,
  no release, no burned-in text, no override needed; the 576px source
  meets the retina rule for the slot (DECISIONS same date).
- `clinicianApproved` reset on body-contouring (approved content
  edited — constraint 4); Amy re-reviews on the preview.
  `evolve-session.jpg` deleted (no other consumer).

### 2026-08-21 — Skin rejuvenation: Amy's PiXel8-RF photos land

- Photo round page 6: "How PiXel8-RF works" now shows Amy beside the
  PiXel8-RF cart under the studio neon (her pick 19a, anchored top so
  the neon stays whole); "A longer view" gains a photo to the right of
  its copy — the handpiece in Amy's hand (pick 19b — the /services
  menu-card frame, reused rather than duplicated). The interim
  docked-handpiece photo is retired. Both rows now serve the sitewide
  retina widths.
- The cart photo ships under operator override after the compliance
  flag: the device console's settings readout is legible in the served
  source (recorded in CLAUDE.md constraint 3, BUILD_SPEC §7.10/§8.1,
  DECISIONS 2026-08-21).
- `clinicianApproved` reset on skin-rejuvenation (approved content
  edited — constraint 4); Amy re-reviews on the preview.

### 2026-08-21 — biostimulators: Amy's two reels replace the studio portrait

- `/services/biostimulators` — the studio portrait beside "A longer
  view of structure" is gone; Amy's Radiesse-visit reel plays there
  (`radiesse-visit.mp4`, 1080×1920, 29s, sounded), and her Instagram
  reel (`amy-reel.mp4`, 480×854, 9s, sounded) now sits to the right of
  "Individualized, with Amy" in a new flipped media row. Both films
  are click-to-play `TreatmentVideo` players inside the rows — the
  first portrait films on the site's treatment pages — served from
  the media origin with in-repo captions (`[Music]` cues; no speech).
  Client direction; every flag and override in DECISIONS same date
  (constraint-3 + constraint-2 overrides on the visit film, a
  retina-rule override on the 480p reel, releases/consent on file).
  `clinicianApproved` reset to false — the page joins the
  pre-relaunch re-approval. `amy-studio-portrait.jpg` deleted (no
  other consumer).
- `TreatmentVideo` — posters are no longer requested above their
  source width (Astro upscales on request; /about's ICON poster was
  shipping as a 1280w blow-up of a 960 source — now a true 960w), and
  a `frame="bare"` variant for films inside media rows (no paper mat;
  the arch's hairline + 12px foot corners on the video). The
  standalone player keeps its mat. `TreatmentLayout` gains the
  in-row film sizing rule (2fr column, 18rem cap, centered).
  (DECISIONS same date; RUNBOOK "Adding or replacing a homepage
  commercial" gains the treatment-film paragraph.)
- Same day, operator preview review: the printed captions under both
  films ("From Amy's own reel — sound on." / "From Amy's Instagram —
  sound on.") removed — the `caption` prop is omitted; the films'
  accessible names and caption tracks are unchanged (DECISIONS
  addendum).
- Same review: both films now **autoplay muted on approach** and loop
  while on screen (pause off-screen; the native controls are the
  tap-for-sound and the pause; reduced-motion users keep
  click-to-play). `TreatmentVideo` gains `autoplay="inview"`, backed by
  the static `public/js/treatment-video.js` (~2KB) — the third
  sanctioned client-side script and the first on a treatment page
  (DECISIONS addendum; CLAUDE.md locked decisions; BUILD_SPEC §9/§13).

### 2026-08-21 — Dermal fillers: the Evolysse film retires; Amy's photos land

- /services/dermal-fillers no longer carries the Evolysse film or its
  "The Evolysse film" heading (client direction); the film's as-is
  compliance exception retires with it — the first scoped exception to
  come off the books (CLAUDE.md constraint 3 / BUILD_SPEC §7.4, §8.3
  amended). The poster, the captions file, and the two outgoing photos
  were orphaned and removed; the Blob rendition is an operator follow-up.
- Photo round page 5: "Placed in proportion" now shows Amy holding a hand
  mirror for a laughing client (her pick 14 — the repo's existing
  mirror-moment frame, reused); "Individualized, with Amy" shows a client
  with the Revanesse Lips+ hand mirror under the neon (pick 15, anchored
  top so the neon stays whole); "Lips, styled" gains a photo to the right
  of its copy — a fine syringe at a reclined client's upper lip
  (8K0A9591). Both new client releases confirmed on file; the third was
  already on record (DECISIONS 2026-08-21).
- `clinicianApproved` reset on dermal-fillers (approved content edited —
  constraint 4); Amy re-reviews on the preview.
- Round 2 (operator preview review, same day): the lip style-guide
  diagram gains 2.5rem of air below the new "Lips, styled" photo (the
  chart sat flush against the arch), and the black "#1 provider" plate
  gives way to the Evolus Laurel ranking plaque — "The Top Evolus
  Injector in Charlotte." over the Top-50 lockup — in the very same
  spot (operator's placement choice over the wrinkle-relaxers layout
  slot). The plaque's page scope widens to dermal-fillers at the
  operator's direction; the "#1" sentence now renders on /about only
  (DECISIONS 2026-08-21, round 2).
- Follow-up, same day (operator direction): the orphaned
  `evolysse-film.mp4` was deleted from the media origin and its edge
  path purged — the film is gone from storage as well as the site.

### 2026-08-21 — the "Draft — pending clinician review" strip retires

- Treatment pages with `clinicianApproved: false` no longer render the
  DraftBanner strip above the header; the component is deleted (git
  history keeps it), the layout and styleguide stop rendering it, and
  the flag no longer reaches markup at all. Operator direction: the
  client read the strip on /services/wrinkle-relaxers (unapproved
  since the 2026-08-18 Evolus-plate move) as final-site content.
  Nothing about the gate changes — `check:approvals` still fails the
  production deploy on any unapproved page, and pending status lives
  in the flag + docs/CLINICIAN-SIGN-OFF.md (DECISIONS same date; the
  legal pages' counsel-review banner came off the same way,
  2026-08-04).

### 2026-08-19 — the Evolus Laurel: ranking plaque on wrinkle-relaxers

- /services/wrinkle-relaxers gains a noir laurel plaque between the
  deck card and the product cards: "The Top Evolus Injector in
  Charlotte." (display Playfair with the sanctioned breathing shimmer
  on the key phrase) over "And among the Top 50 in the United
  States.", crowned by a fine-stroke laurel drawn at build time —
  zero images, zero client JS. Client direction; operator-verified
  with Evolus; wording pinned bare (attribution kicker declined,
  consistent with 2026-07-21). The sentences trip no linter pattern,
  so the authorization is recorded in CLAUDE.md constraint 3 /
  BUILD_SPEC §8.4 rather than the allowlist (photo-override
  precedent; DECISIONS same date). Placement rides a new
  frontmatter-gated layout slot (`evolusLaurel` — operator-approved
  schema change).
- Round 2 same day (client arrows on the preview: the last line and
  the "50" don't stand out): the sentence renders as a stacked
  lockup — "Top 50" jumps to the statement's own display scale with
  the synchronized shimmer, framed by the 13px caps. Same words,
  same order; typography only (DECISIONS addendum same date).
- Page title becomes "Neurotoxins - Wrinkle Relaxers" (client
  wording, verbatim incl. the hyphen — the 2026-08-18 menu line
  extended to the page). Fans out to H1, breadcrumbs, and JSON-LD;
  seo.title keeps the search phrasing (DECISIONS same date).
- The page now says "neurotoxin" throughout — card leads, both FAQ
  strings, and the body intro (client wording, same pass; the §7
  normalize rule is superseded page-wide here and stands everywhere
  else — DECISIONS same date).
- "Your visit, step by step" numerals become Mobile Aesthetics
  chevron plates (client mockup, same day) — the four-chevron foil
  block from the committed header mark on small noir plates,
  decorative with sr-only step numbers for parity. Fans out to all
  12 treatment pages + the styleguide (DECISIONS same date).

### 2026-08-18 — Wrinkle-relaxers photo round; bare arches on every treatment page

- All three /services/wrinkle-relaxers photos replaced with Amy's
  picks (screening, releases, and the Jeuveau-banner pixel override —
  the third photo exception — recorded in DECISIONS same date). The
  band went three rounds the same day on client feedback (blur-fill
  composite → 9:8 re-cut → final): it now ships as the FULL 3:2 frame
  in a new **segmental arch** — the wide sibling of the house Roman
  arch (curve over straight feet) — because the people span wider
  than any 9:8 window: everyone visible, the window filled exactly,
  no crop, no fill (DECISIONS ×3 same date; BUILD_SPEC §5 records
  the arch family's new member). Retires the recorded fine-gauge
  double-crop defect early.
- The treatment pages' white paper mat and print tilt retired
  sitewide (client direction: pink behind the arches, like
  /services) — one shared-CSS change, all 12 pages, zero flag
  resets.

### 2026-08-18 — Evolus recognition plate + ICON film move to /about

- The black "Charlotte's #1 Evolus provider" plate, the "Inside
  Evolus" section, and the ICON film moved from
  /services/wrinkle-relaxers to /about (client direction — supersedes
  the 2026-07-21 "About stays ranking-free" placement; DECISIONS same
  date). Copy is byte-identical; every page-scope compliance record
  amended in the same PR; dermal-fillers keeps its own plate.
  First approved-content MDX edit of the round: the wrinkle-relaxers
  `clinicianApproved` flag reset in the removal commit (constraint 4).

### 2026-08-18 — /services intro copy (client wording)

- The lead paragraph's second and third sentences are now the
  client's own copy, verbatim ("From Facial Balancing … your journey
  now with Amy's expertise as your guide!"). The first sentence
  ("Every service below is planned and performed by Amy Palacios,
  FNP.") stays. The sentence "Amy has your best self in mind"
  contains a superiority-class banned word and ships under an
  operator allowlist override (sixth authorization — DECISIONS same
  date; two compliant rephrases were offered and declined).
- Second round, same day: "BOOK" in that copy is now bold and links
  to the Vagaro booking page — CTAButton's link mechanics mirrored
  (same siteConfig URL, declarative book_click attribute, new-tab
  with the screen-reader note).

### 2026-08-18 — Menu line 01 retitled

- "Wrinkle Relaxers" → "Neurotoxins - Wrinkle Relaxers" on the
  /services menu (client wording, verbatim). The treatment page's
  own title is unchanged.

### 2026-08-18 — Menu-card photo fixes (round 3)

- Body Contouring's card now shows Amy's face — the crop anchor
  flipped from belt-priority to the maximum-face window (the 9:16
  selfie can't hold face and belt in one 4:5 arch; the belt leaves
  the frame — DECISIONS same date). Peptide Therapy's photo was
  re-graded lighter from the master (the source's matte grade read
  dark in its row); same asset name, zero code change.
- Same round, on the PR preview: IV Therapy and Hormone
  Optimization's photos re-graded brighter from their masters too
  (stronger lift — dim ambient scenes); same asset names, zero code
  change. Recipes in DECISIONS.
- Round 4: Body Contouring's card now shows face AND belt — the
  asset became a blur-fill contain composite (the full 9:16 selfie
  inside the 4:5 arch, soft-blurred bars of the same frame filling
  the sides). Recipe in DECISIONS.

### 2026-08-18 — The last two picks land (same PR)

- Skin Rejuvenation's card now carries the client's own B5 pick (Amy
  holding the PiXel8-RF handpiece) and Weight Loss carries her
  replacement B9 frame (client on the InBody scale — release
  confirmed on file; ships under an operator override for the
  legible competitor-brand aftercare sign in frame, DECISIONS same
  date). All twelve menu cards now show her picks; no interim slots
  remain.

### 2026-08-18 — /services photo-card menu (rev 2: compact tiles, same PR)

- Operator preview review: the buttons were huge. The menu is now a
  compact tile grid — 2-across on phones (summary hidden there;
  tile = arch + numeral + title + "More information ›"), one 4-card
  row per group on desktop. Phone page height −58%, per-card area
  −77%. Image srcset re-derived per delivery band (new 880px tier
  for 2-across tablets; honest image-width `sizes`), and the LHCI
  carve-out TIGHTENED from 640/940KB to 384/512KB (measured 298/317).

### 2026-08-18 — /services photo-card menu

- Every service line's menu card now carries the client's own photo
  in the house arch above the numeral/title/summary — her mockup,
  built by merging the homepage door anatomy into the existing card
  (whole card still one link; three category groups and the 01–12
  numbering unchanged). Ten of twelve photos are her per-line picks
  (screened frame-level, releases confirmed — DECISIONS 2026-08-18,
  incl. the slot-12 operator override); two slots carry the line's
  own page photo until her remaining picks land.
- Perf gate: /services + /styleguide (which demos the grid) get a
  scoped image/total budget carve-out via assertMatrix — measured,
  flagged, operator-approved full-retina tier; all other pages keep
  the original budgets (DECISIONS same date).

### 2026-08-17 — Doc-accuracy sweep after the audit round

- Reference docs that didn't ride today's PRs caught up with what
  shipped: BUILD_SPEC §14 records the relaunch guard + branch
  protection, §15 gains `storage.bicep` + the immutable budget
  start-date, §17's analytics row reflects the Plausible prep;
  CLAUDE.md's JS-budget bullet names its second (dark) consumer and
  the repo map names the storage module; OPERATOR-SETUP documents
  branch protection and the media origin; compliance/README notes the
  films now live in Blob with screening before upload; a stale
  "preview password" comment in the config generator (wrong since
  2026-07-21) and the unpinned budget date in main.bicep's deploy
  example are corrected.

### 2026-08-17 — Zero-hint check (audit housekeeping)

- `npm run check` now reports 0 errors / 0 warnings / **0 hints**:
  explicit `is:inline` on the two JSON-LD data blocks, and the two
  Node gate-scripts' `require` locals renamed out of TypeScript's
  global-shadowing false positive (both were genuinely in use).
  External-audit Finding 7's last in-repo item.

### 2026-08-17 — Relaunch readiness: the audit's paper trail

- The external architecture review is committed
  (docs/AUDIT-2026-08-17-external-review.md) with every finding's
  disposition recorded in DECISIONS. New docs/RELAUNCH.md holds the
  complete ready-to-execute relaunch dossier; REDESIGN gains the
  "Round close" scaffold (operator decision: dark until the round
  completes; three slots — frozen list, date, seven-gap checks — set
  the definition of done). CLINICIAN-SIGN-OFF now separates copy
  approval (the flag gate, unchanged) from presentation approval
  (dated, per-round — a relaunch hard gate), with the redesign
  round's visual drift enumerated for Amy's pending pass.

### 2026-08-17 — Cookieless analytics wired, shipped dark

- Plausible is fully prepped behind a config flag and ships DARK —
  the built site is byte-identical until the operator flips
  `siteConfig.analytics` at relaunch. One flip does everything in the
  same build: self-hosted tracker (script-src stays 'self'), privacy
  page swaps its analytics bullet (keeping its own "updated first"
  promise), and the generated CSP admits the event endpoint only when
  the page actually ships the script. External-audit Finding 6;
  procedure in RUNBOOK "Turning on analytics".

### 2026-08-17 — Films move to their own media origin

- The six .mp4 films now serve from `media.needlegirlie.com` — Blob
  storage behind the same Front Door (new Bicep: storage account,
  custom domain, media route). The repo sheds 53MB: renditions are
  uploaded, not committed. Captions (.vtt) deliberately stay in the
  repo — they are compliance-screened text and keep their git audit
  trail. Previews play the same films production does, by design.
  External-audit Finding 5; operator decision to build now. The
  audit's Git-LFS suggestion was declined (CI bandwidth trap —
  DECISIONS has the rationale).

### 2026-08-17 — Relaunch guard: the takedown's git landmine gets a tripwire

- New CI workflow (`relaunch-guard.yml`, required on both branches)
  mechanically enforces what the RUNBOOK could only say in prose:
  merging `main` into `phase-c` now fails a check (the takedown
  revert would delete the launched site), and a naive one-step
  `phase-c` → `main` merge fails a check (simulated 2026-08-17: it
  silently drops ~48 files — all twelve treatment pages included —
  with no conflict and a passing build). First item from the
  2026-08-17 external architecture review (Finding 1); the relaunch
  PR retires the workflow.

### 2026-08-17 — The footer names the studio

- The footer's left block now shows "Mobile Aesthetics" between the
  brand line and the street address — the same factual studio line
  the Visit Amy card gained earlier today, now in the sitewide
  footer.

### 2026-08-17 — The /services strip wears Amy's new photography

- All three strip photos replaced with Amy's picks from the new
  professional shoot (photo round page 2): Amy at a client's brow in
  window light; the fine-syringe moment at a reclined client's lower
  face; Amy showing treatment products to a male client. All three
  client releases confirmed on file (DECISIONS 2026-08-17). The
  outgoing frames had no other pages left using them and were
  retired.

### 2026-08-17 — Every photo wears the arch

- Amy's direction: the light-pink arch frame from the homepage
  category doors now frames every picture on the site — the /services
  strip, both /about photos (the studio print arches inside its white
  matte), the /injector-training portrait, and all seventeen
  treatment-page photos. One shared recipe (`.ng-arch`); the
  treatment pages arch by stylesheet alone, so no treatment content
  changed and no clinician approvals reset.
- Stays as it was, by design: the hero backdrop, the film carousel
  and treatment film players (the Evolus films' on-screen safety
  information ships complete and uncropped), the Instagram post at
  the bottom of the homepage (Amy's named exception), and the lip
  style-guide diagram. DECISIONS 2026-08-17.

### 2026-08-17 — The Visit Amy card names the studio

- The location card (home, /visit) now shows "Mobile Aesthetics" on
  its own line between the brand line and the street address — the
  factual name of the studio Amy practices in.
- Same PR: the accessibility gate now audits pages in their settled
  (reduced-motion) state, so contrast verdicts no longer depend on
  where a scroll entrance animation happens to freeze — the card's
  one added line had exposed that flake class. DECISIONS 2026-08-17.

### 2026-08-17 — The homepage doors wear Amy's new photography

- All three category-door photos replaced with Amy's picks from the
  new professional shoot (the sitewide photo-replacement round's first
  page): Injectables — Amy treating a client under the studio neon
  (client release confirmed on file, DECISIONS 2026-08-17); Skin &
  Body — the three skinbetter products held to camera; Wellness — Amy
  in the lavender suit. The outgoing photos remain on /services and
  two treatment pages until those pages get their own picks.

### 2026-08-17 — The team joins the carousel

- The home carousel now plays four films: the Mobile Aesthetics
  "Girl team" film — Amy and her practice's team under the studio
  neon — follows the second Jeuveau commercial. Operator override
  recorded (the film shows the location's other providers; releases
  confirmed on file — DECISIONS 2026-08-17); captions mirror the
  burned-in text; the film plays at normal speed.
- The four progress bars slim down on phones so the row fits every
  screen the site supports, including fold covers.
- The section head is now "Mobile Aesthetics. On screen." (was "The
  studio. On screen.") — with the team film aboard, the carousel
  speaks for the whole practice.

### 2026-08-15 — The whole site speaks in the logo's face

- Body text now uses Playfair Display — the Needle Girlie logo's own
  font — everywhere: paragraphs, headings, nav labels, the Book
  button, eyebrows, captions (Amy's direction). DM Sans is retired and
  its font files no longer ship; the site is a one-family design.
- Body reading size grew to 17px with more line air (1.65) — the
  small-screen readability adjustment accepted when Playfair-everywhere
  was decided. Pages get lighter (~55KB less font weight) and body
  text now benefits from the font preload that previously served only
  headings. DECISIONS 2026-08-15.

### 2026-08-15 — Mobile Aesthetics joins the header

- The practice mark now sits far left in the header beside the Needle
  Girlie wordmark — rebuilt as a vector (SVG) from the practice's own
  300px render: silver letterspaced type over the four pink foil
  chevrons, razor-sharp at every screen density. On phones the row
  re-balances (the NG wordmark now scales with the viewport so mark +
  wordmark + menu fit a 360px screen); the mobile menu re-anchored to
  match.
- Two variants live in the repo: the full badge (plate, frame, name
  and phone — for print/social) and the header lockup that shipped
  (type + chevrons; the noir header is the plate). Amy picks from a
  side-by-side; the lockup is the recommendation. DECISIONS 2026-08-15.
- Operator review, same day: the mark enlarged (~25% — 52px phones,
  104px desktop) and the chrome lettering brightened past the
  reference's dim fade, which read too sheer at header scale. The
  generator records the override; the NG wordmark clamp re-budgeted so
  360px screens still fit.
- Second operator review, same day: the lockup read as the logo's
  bottom being cut off (nothing was clipped — the lockup omits the
  name/phone block by design). Operator picked the FULL BADGE for the
  header: the complete tile at 56px/112px. The lockup stays in the
  brand kit. DECISIONS 2026-08-15 (second entry).
- Third operator pass: on phones the Needle Girlie wordmark now
  centers itself in the row's free space between the badge and the
  menu button (auto margins — the tightest 360px rows have no slack
  and are unchanged). Desktop untouched.
- The badge now links to Amy's practice site
  (yourmobileaesthetics.com, new tab) — operator override of hard
  constraint 2 after the compliance flag (the destination names the
  location's other providers). The one sanctioned outbound reference;
  CLAUDE.md carries the scoped exception. DECISIONS 2026-08-15.
- Desktop badge scale (operator/Amy): 112px read "awkwardly small"
  beside the wordmark block — the badge now runs 128–160px on desktop
  (every line of the logo legible, header grows to ~208px there).
  Phone/tablet sizing untouched — it lives in a separate rule.
- Hybrid nav (operator decision after options): the hamburger menu now
  carries the page links at every width — the inline desktop nav
  retires — and Book becomes the one styled button in the header,
  always visible beside the menu. Phones get a visible Book for the
  first time. DECISIONS 2026-08-15 (third entry).
- Foldable/tablet fix (operator's Z Fold 7 screenshot): the desktop
  header switched on at 640px but only ever fit above ~1000px — on a
  Fold the nav links drew across the wordmark (a defect that predates
  the badge work). The mobile shell now runs through 1023px; from
  1024px the inline nav returns with the brand scaling fluidly
  (wordmark 340→440px, badge 88→112px) so the row fits at every width.

### 2026-08-15 — The studio reel slows to half speed

- Carousel slide 2 — Amy's own studio reel — now plays at 0.5× (it was
  cut fast; tuned across three same-day reviews: 0.8 and 0.65 both
  still read too fast). Slowed at the player, so the video file itself
  is untouched and the number is easy to tune; the rate is re-asserted
  at playback start so every browser honors it. The two Evolus films
  are unchanged and still play exactly as produced.

### 2026-08-15 — Carousel head: "The studio. On screen."

- The carousel's heading "Watch Amy's latest." is retired (operator +
  Amy). The line they loved — "The studio, on screen" — was the small
  label above it; it is now the big heading itself, and the small
  label is gone: one line on the cinematic stage.

### 2026-08-14 — Carousel revived (the CSP inline-script lesson); "Medical Aesthetics," capitalized

- The operator reported the shipped carousel played nothing. Root
  cause: the site's CSP (script-src 'self', no unsafe-inline — by
  design) silently refuses inline scripts, and Astro had inlined the
  sub-4KB carousel script into the page; every local check passed
  because local test servers don't send the SWA headers. Fixed in two
  rounds: a global assetsInlineLimit:0 made the script external but
  un-inlined every page's CSS and pushed wrinkle-relaxers past its
  2500ms LCP budget (CI caught it — three runs within 5ms); the final
  scoped fix moves the logic to public/js/video-carousel.js referenced
  by a literal script tag, restoring CSS inlining everywhere. The
  local screenshot harness now applies the generated SWA headers so a
  policy-killed script can never pass again. No gate, budget, or CSP
  changed. DECISIONS 2026-08-14 (two entries).
- Client copy direction: the home H1 now reads "Medical Aesthetics,"
  (capital A) per Amy.

### 2026-08-14 — The homepage plays Amy's commercials

- New cinematic video stage directly below the hero: three films
  crossfade on full-bleed noir — two Evolus co-op Jeuveau commercials
  (carried as-is, FDA safety screens intact and never cropped) around
  Amy's own studio reel (operator override; both client releases
  confirmed). Autoplay muted once the stage scrolls into view, rotating
  on end; thin progress bars double as jump buttons; a single quiet
  toggle is the WCAG pause control; reduced-motion users get posters
  and play-on-request. The "Audi treatment" the operator asked for —
  no player chrome anywhere.
- Engineering: video facade (BUILD_SPEC §9) — the page loads zero
  video elements and zero video bytes; the script builds each player
  on demand. The first cut without the facade failed verify on real
  numbers (TBT 335ms), and the facade fixed it with **no gate or
  budget change**. First client-side JS on the site (~3KB of the 30KiB
  budget; third-party still 0). Renditions ~23MB total in
  public/media/, muted (sound + richer captions are a recorded
  follow-up); captions mirror each film's on-screen text. DECISIONS
  2026-08-14.

### 2026-08-14 — Home hero: Amy's studio-counter portrait

- The home hero photo is now the studio-counter portrait Amy picked —
  the same frame she chose for the construction window (2026-08-05),
  now on the site's front door: Amy alone on the counter beneath her
  own neon, syringes in hand. The old hero (Amy treating a client)
  retires with its client-release dependency; `amy-at-work.jpg` is
  deleted (git history keeps it). Crop anchor and the neon-bloom
  overlay retuned for the new composition.
- The only source is a 642px social-size save, so the committed asset
  is an **interim AI-assisted enhancement** (Real-ESRGAN ×4 blended
  55/45 with a plain upscale at 1400w — the raw AI output was rejected
  for waxy facial rendering; the blend passed face, embroidery, neon,
  and hands inspection with no invented text). Disclosed to Amy for
  her informed sign-off on the preview; when her full-resolution
  original surfaces it re-encodes over the same filename, zero code
  changes. Full vet re-run: no clients, no legible product or unit
  text, all visible branding her own. Verify green (pa11y 24/24,
  Lighthouse 21 runs / 7 URLs). DECISIONS 2026-08-14.

## Launch (`main`)

### 2026-08-05 — The placeholder loses the caricature (Amy's direction)

- Amy dislikes the caricature; the live Under Construction page's
  arched window now holds her real studio portrait (operator-supplied
  frame → `studio-counter-portrait.jpg`, zoom-vetted — no legible
  product text; every visible brand mark is her own). Preview-first
  honored on PR #99 (the marquee lesson, applied to its own page);
  merged `4655609a`, production redeployed and live-verified the same
  evening. The caricature is retired sitewide at her word (asset kept
  in-repo, rendered nowhere). Relaunch wrinkle recorded in the RUNBOOK:
  the revert-of-the-revert may conflict on `index.astro` — take the
  launch-tree side. DECISIONS 2026-08-05 (photo entry).

### 2026-08-05 — Production taken offline (launch merge reverted)

- Hours after launch, at operator direction, production rolled back to
  the Under Construction placeholder pending a client review round:
  revert commit `e57a4448` restores the pre-launch tree byte-for-byte
  (RUNBOOK rollback path; local verify green, full Production pipeline
  green, edge purged). Nothing is lost — `phase-c`, every approval, and
  the §16 record are untouched, and the twelve treatment URLs degrade
  to the branded 404. Relaunch is deliberately two-step: revert the
  revert, then merge `phase-c` (RUNBOOK, "Relaunching after the
  takedown"). Full-site demo preview for review: PR #97's environment.
  DECISIONS 2026-08-05 (takedown entry).

### 2026-08-05 — needlegirlie.com is live

- Amy signed off all twelve treatment pages plus /injector-training on
  the stable preview; the operator's own flip commit (ad8fbde, PR #93)
  is the §16 written sign-off log. PR #5 merged `phase-c` into `main`;
  the Production pipeline ran green (verify → check:approvals → Front
  Door-locked build → SWA deploy → cache purge) and every §16 live
  check passed: apex serving, www → apex, HTTP → HTTPS, origin
  lockdown (platform 404s direct SWA hits — security intact), five OG
  properties, branded edge 404, draft banners gone, link-outs
  reachable, live Lighthouse 1.00 across all categories (LCP 1.75 s).
  Standing post-launch items: counsel review of legal pages, the
  manual keyboard/screen-reader a11y pass, laser pricing if supplied,
  photo upgrades, Plausible as a deliberate opt-in.
- Merging PR #5 also tore down the `…-5…` stable-preview environment
  (by design — close-preview runs on PR close). Draft **PR #95**
  ("Next release", `phase-c` → `main`) was opened as the replacement
  standing PR, so the stable preview mechanism survives launch; the
  RUNBOOK's "Where `phase-c` is visible" section now describes the
  standing-PR pattern generically. The executed sign-off doc carries
  an EXECUTED banner and stays as the template for re-approvals.

## Phase C — pages & content drafts (`phase-c`)

### 2026-08-04 — /injector-training: Private Injector Training

- The site gains its one professional-audience page: four hands-on,
  one-on-one courses for licensed medical professionals (Neurotoxin /
  Dermal Filler / PDO Thread Lift $5,000, Radiesse $7,500; three
  hours each, product included), flyer-sourced, phone/Instagram
  routed, with a fifth "Training" nav item. Curriculum topics publish
  flyer-verbatim under the fifth allowedStrings authorization (the
  operator's call after the compliance flag, li-wrapped so the
  linter's exactness self-test stays sound); pa11y (with the
  operator-authorized cap) and LHCI cover the new URL; Radiesse joins
  the terms trademark list. Amy reviews the page via a non-gated
  section in docs/CLINICIAN-SIGN-OFF.md. DECISIONS 2026-08-04.

### 2026-08-04 — clinician sign-off package

- `docs/CLINICIAN-SIGN-OFF.md`: the page-by-page checklist Amy reviews
  against the stable preview, the operator-only flag-flip procedure
  (constraint 4 — the flip is never the assistant's), the sign-off
  commit template that becomes the §16 written log, and the post-flip
  launch sequence (PR #5 merge → production pipeline → §16 mechanics).

### 2026-08-04 — legal pages take launch form; analytics resolved as none

- The legal trio's "Draft — pending counsel review" banners come off at
  the operator's recorded acceptance; "Effective August 4, 2026." goes
  on. Privacy gains hosting-log, health-information, children, and
  changes sections; terms gain acceptable use, limitation of liability,
  trademark attribution, severability, changes, and contact; the
  disclaimer gains reading-is-not-a-substitute, manufacturer-materials,
  and contact sections — all in the claims-safe lexicon. Counsel review
  is a standing post-launch item.
- {{ANALYTICS_PROVIDER}} resolves as NONE at launch (operator delegated
  the call): Front Door edge reports carry traffic visibility at zero
  script and zero cost; Plausible stays the recorded future default.
  DECISIONS 2026-08-04 (two entries).

### 2026-08-04 — the home page ships (C8)

- needlegirlie.com's front door is the real site now: index.astro
  renders ConceptHome (the client-approved Neon Editorial — noir hero,
  Meet-Amy, three category doors, visit card, framed IG post, noir
  close). All three C8 prerequisites closed on the operator's word:
  hero client's release confirmed, Amy's IG-caption sign-off,
  media-scope resolved as per-item approvals. Construction placeholder
  and its legacy keyframes retired; production SEO strings in; the
  home URL joins the ombre pa11y cap list (operator-authorized).
  DECISIONS 2026-08-04.

### 2026-08-04 — hours are not listed on the website (Amy's decision)

- The `{{HOURS}}` token closes as will-not-list: the siteConfig field,
  LocationCard's hide-until-resolved hours line, and the JSON-LD
  `openingHours` property are removed outright. Rendered output is
  unchanged — the line never rendered while the token was open. The
  parking note is now the only open /visit input. DECISIONS 2026-08-04.

### 2026-08-04 — treatment photos approved on preview

- Amy approved the PR #85 preview (all four new photos and the
  Venus Versa Pro rename); merged to `phase-c` (4104feb). The rename
  flag from the same-day entry resolves. Still open by design: the
  laser-pricing question and the twelve `clinicianApproved` flags.
  DECISIONS 2026-08-04.

### 2026-08-04 — every treatment page now has a photo; Versa Pro named

- The four photo-less treatment pages each gain one operator-supplied
  frame: the Venus Versa Pro console (laser-treatments — page copy
  renamed from "Venus Versa" on the photographic evidence), an Evolve
  session from Amy's own Reel with its efficacy caption cropped out
  (body-contouring), Amy's grey-seamless portrait (hormone-optimization),
  and the docked PiXel8-RF handpiece (skin-rejuvenation). Two supplied
  frames were rejected on compliance grounds (a settings screen showing
  needle-depth parameters; the Biote symptom brochure). All four pages
  stay `clinicianApproved: false` for Amy's review. DECISIONS 2026-08-04.

### 2026-08-04 — /about profile approved on preview

- Amy approved the rebuilt /about on the PR #83 preview; merged to
  `phase-c` (a2ec2e1). The standing 2026-07-19 career-facts wording
  flag RESOLVES with the approval, and the neon-signage brand call is
  accepted (still reversible on her word). The about.astro header
  comment updated to match; rendered output byte-identical. DECISIONS
  2026-08-04.

### 2026-08-03 — /about becomes a magazine profile

- The thinnest structural page grows from ~120 body words to a
  five-beat profile: expanded hero prose (the keep-list lead and the
  family portrait untouched, per Amy), a Playfair-numeral milestones
  timeline replacing the facts card (BSN and Biote re-homed into it —
  nothing dropped), a "The name on the wall" studio section, booking
  prose, and TrustChips joining the closing band to match /services.
- New photo: Amy beneath her own Mobile Aesthetics neon (8K0A9862 →
  `studio-neon-portrait.jpg`, byte-identical) as a white-matte tilted
  print. The 2026-07-21 crop flag is superseded on the record — sole
  ownership plus the prp-treatment neon precedent; a brand call the
  operator may reverse. DECISIONS 2026-08-03.
- Every new sentence traces to recorded facts; no naming-origin story
  invented; About stays Evolus-ranking-free. Amy's standing wording
  confirmation rides the PR preview. Measured: images ~102 KB of the
  240 KB budget, built-page em dashes 3 → 4, LCP element unchanged.

### 2026-08-01 — Hormone lab draw priced

- The third hormone-optimization card completes: **Hormone lab draw
  $125**, operator-supplied (carried whole-dollar per the sitewide
  format). Flat price, no registry change; `pricingDisplay: consult`
  stays — true on this page, since the pellet plan follows from labs.
  `clinicianApproved` still false. DECISIONS 2026-08-01.

### 2026-08-01 — Peptide cards: the client's definitions land (near-verbatim override)

- All nine "What Amy offers" cards on /services/peptide-therapy step up
  from identity-only lines to the client's supplied definitions — the
  benefit-language override recorded 2026-07-21 as "available if
  directed later," now directed. Near-verbatim: four phrases the build
  gate physically blocks stayed out — "anti-aging" twice and "tissue
  healing" (banned regexes), and Sermorelin's "libido" (symptom
  vocabulary whose inverse check would force the Biote FDA disclaimer
  onto the page). Everything else ships word-for-word; BPC-157/TB-500
  was not among the supplied definitions and is unchanged; prices
  untouched.
- Two body passages that advertised the page's own restraint ("the
  opposite of the hype: names and facts, no promises") were trimmed
  for coherence — deletions only, since copy promising "no promises"
  cannot sit above benefit cards. IV-therapy's Glutathione card keeps
  its identity-only wording (recorded divergence; the price-pairing
  rule is unaffected). §7.2 amended. `clinicianApproved` still false.
  DECISIONS 2026-08-01.
- Same-day follow-up: **MOTS-c gains its price** — $125,
  operator-supplied (normalized from "$125.00" to the sitewide
  whole-dollar format). The last unpriced peptide on the page closes;
  flat price, no registry change.

### 2026-08-01 — Weight-loss "What it is" reworded (client copy, verbatim)

- The section now reads as Amy dictated (one grammar fix,
  operator-directed: "anchors"): "GLP-1 therapy
  (Semaglutide, Tirzepatide, and Retatrutide) anchors the program, and
  Phentermine is also offered where it fits a plan. Every one of these
  is a prescription medication, and every one belongs inside a
  supervised plan, never on its own." Retatrutide joins the GLP-1
  parenthetical (the FAQ already groups the three by receptor family);
  the old opening sentence comes off; the kept earned dash before
  "never on its own" becomes her comma — one more off the census. The
  investigational disclosure line and inverse checks are untouched.
  `clinicianApproved` still false. DECISIONS 2026-08-01.

### 2026-08-01 — Regenerative: PRP and PRP-with-Microneedling get real definitions

- The last legacy bullet list on a treatment page becomes productDetails
  cards: PRP (tagged "Hair") and PRP with Microneedling (tagged "Skin"),
  each carrying the client's own definition sentence verbatim — PRP "for
  stimulating hair growth", the pairing "to boost collagen, smooth
  scars, and improve skin tone". Shipped as a recorded operator override
  of §7.6's no-outcome-claims rule after the flag (hedged house-style
  variants were offered and declined); both sentences pass every
  automated gate — the override is judgment-level, not mechanical.
- PRP's hair-growth use is new to the page and recorded as
  operator-confirmed fact ("that's how Amy uses PRP"); "Who they're
  generally for" now mentions hair alongside skin texture and tone.
  `clinicianApproved` stays false; Amy reviews on the
  preview. DECISIONS 2026-08-01.
- Same-day follow-up (evening): **both cards gain prices** — PRP $600,
  PRP with Microneedling $900, operator-supplied and carried bare per
  the PiXel8 precedent. The keep-pricing-to-the-consult stance
  resolves the operator-supplies-figures way, as biostimulators and
  skin-rejuvenation did; `pricingDisplay: consult` stays, matching
  both price-bearing consult-routed siblings. Flat prices, no
  registry change.

### 2026-07-30 — The Evolus plate lands on dermal-fillers too

- Client direction, later the same day: "Evolysse comes from Evolus,"
  comes off and the shared `EvolusCallout` plate renders above "The
  Evolysse film" — both authorized pages now carry the ranking
  sentence the same way, once each, as the standalone noir display
  plate. Page scope and single-use rule unchanged. DECISIONS
  2026-07-30.

### 2026-07-30 — Wrinkle-relaxers: per-unit prices only, and the Evolus plate

- Client direction, two changes on the same page (PR #73). The three
  product cards narrow to per-unit pricing — Jeuveau and Xeomin
  "$10 per unit", Daxxify "$12 per unit"; the $400/$500 flat halves
  come off. Those strings are exact-match `allowedStrings` entries, so
  the compliance registry and the page's `priceLines` changed together
  in one commit — a narrowing, not an expansion, with the client's
  directive as the recorded registry authorization. The linter
  self-test regenerated from the new strings and passed.
- "Jeuveau comes from Evolus," comes off, and the ranking sentence
  becomes a **static noir display plate**: new `EvolusCallout` renders
  "Amy is Charlotte's #1 Evolus provider!" in pink-500 Playfair on
  black (the recorded 5.95:1 pair), centered, under "What they are".
  Deliberately not a scrolling marquee, and no shimmer — the moving
  glow stays capped at its two sanctioned homes. The exact allowlisted
  string is byte-intact on one source line; the component header
  carries the editing rules, including the story of its own first
  draft failing the claims gate (a naked ranking token in a comment —
  the linter scans comments by design). Dermal-fillers kept its prose
  version for a few hours — see the entry above. DECISIONS 2026-07-30 ×2.

### 2026-07-30 — Concept hero byline reworded (client copy, verbatim)

- The `/styleguide/concept` hero byline now reads: "The dedicated
  practice of Amy Palacios, FNP (AKA Needle Girlie) and owner of
  Mobile Aesthetics, clinician-led aesthetics since 2017." —
  client-dictated wording, shipped verbatim on PR #72. "Owner of
  Mobile Aesthetics" is the recorded sole-ownership fact (DECISIONS
  2026-07-23) already rendered on the skincare page; constraint 2
  is not engaged. This also retired the byline's kept em dash.

### 2026-07-30 — "Temporary" comes off the neuromodulator copy

- Client direction: Amy sets duration expectations directly in
  consultation and doesn't want the hedge on the site. The words
  appeared in exactly six places, all neuromodulator copy (five on
  wrinkle-relaxers, one card summary) — all now read without the
  adverb ("used to smooth moderate to severe frown lines").
- Flagged before execution and proceeded with the flag visible: the
  adverb mirrored the products' label wording, so its removal is a
  recorded deviation from the authorized indication-style phrasing
  (DECISIONS 2026-07-30; §7.3 amended to match). Deliberately
  unchanged: Phentermine's "short-term use" and the Daxxify/Evolysse
  "labeled for results lasting up to…" facts.
- `clinicianApproved` untouched; Amy reviews on the preview.

### 2026-07-29 — The em dashes go on a budget

- The rendered site carried **313 em dashes in 12,373 words** — 25.3
  per 1,000, several times editorial density and the single most
  recognizable AI-writing fingerprint. Client-approved thinning pass:
  structural dashes stay (labels, bylines, card names, film titles);
  rhetorical dashes drop to at most one per paragraph, never two in a
  sentence, resolved by five punctuation moves (split, comma pair,
  colon, parentheses, or keep one that earns it). **Punctuation-only:
  no word, fact, price, or claim changed.**
- Result, measured by rerunning the census on the built output:
  **313 → 71 visible** (5.9 per 1,000); meta descriptions 36 → 6; the
  remaining alt-text dashes are the header logo's label. What remains
  is almost entirely the keep-list — the footer and LocationCard
  "Needle Girlie — Amy Palacios, FNP" lockups, draft banners (which
  come down at approval anyway), product-variant card names, the
  Evolus film titles, and roughly ten deliberately kept earned dashes.
- Three items ship deliberately unchanged as Amy's call: the
  Retatrutide disclosure line (her own directed wording), the
  "Book — or ask first" step heading, and the video captions'
  "— sound on." Her word takes the site lower with three small edits.
- Compliance rails held: no `allowedStrings` entry contains an em dash
  (verified before editing), the Biote FDA disclaimer is untouched,
  and "Charlotte's #1 Evolus provider" is byte-identical — only the
  connector before it changed. One content commit per treatment file
  (the clinician audit trail); approval flags untouched (all twelve
  were already `false`). DECISIONS 2026-07-29.

### 2026-07-27 — The service-line cards are raised

- Client direction: the twelve `/services` cards read as flat. They now
  sit on the page as raised plates — a two-layer shadow, a 1px lit top
  facet, a further rise on hover and keyboard focus, and a settle when
  pressed. The three concept-home category doors get the same treatment,
  since they are the same anatomy and become the C8 home.
- **The flatness was arithmetic, not taste.** The ombre canvas ramps
  blush to brand pink and the card fill sits between those two values,
  so plate and canvas cross equal luminance at 19.6% of the document.
  The dead zone is a band from roughly 8% to 32% where the plate holds
  under 1.2:1 against the page and bottoms at **1.001:1** — invisible.
  The hairline border dies with it (1.12:1 against the canvas there).
  Because the menu starts near the top of that band, the flattest cards
  were the Injectables group: the first four anyone sees.
- **Elevation now means "this is clickable."** Only whole-card links get
  it. Static boxes stay flat — deck, router card, location card, product
  cards, and every compliance block, because a raised medical disclaimer
  implies a press target that is not there. This deliberately narrows the
  2026-07-22 "every box matches the /services boxes" direction.
- Built from the shadow the site already uses on its framed photo prints
  rather than a new elevation scale, and shared as one `.ng-lift` class
  instead of a third hand-copy of the card anatomy. An ink-pink-tinted
  shadow was measured and rejected: it holds 1.79:1 at the top of the
  ramp but collapses to 1.24:1 at depth, washing out the same way
  ink-pink text does on this canvas.
- Colors, contrast pairs, corners, copy, and layout are all untouched;
  zero JS; no gate config changed. Verify green (a11y 23/23, Lighthouse
  across 6 URLs), and pa11y run direct with warnings surfaced confirms
  **zero needs-review items touch the raised plates** — the per-URL cap
  is doing no new work. Stylesheet 6,220 bytes gzipped against 16,384.
- Also corrected in passing: the `tokens.css` note placing the luminance
  crossing at "~30% down" is now the computed 19.6%; the same script
  reproduces every recorded pair in that file exactly. DECISIONS
  2026-07-27.

### 2026-07-27 — PHASE-C corrected: no page is currently clinician-approved

- `PHASE-C.md`'s treatment checklist still read "`clinicianApproved:
  false` on all of them except dermal-fillers — approved 2026-07-21",
  and its dermal-fillers entry still led with "CLINICIAN-APPROVED".
  Both predate the 2026-07-25 caption sweep, which edited approved
  content and therefore reset the flag in the same commit (constraint
  4) — correctly, and recorded in that date's DECISIONS entry, this
  CHANGELOG, and PHASE-C's own status block at the top of the file.
  Only the checklist body lagged.
- Verified against the content files rather than the prose: all twelve
  `src/content/treatments/*.mdx` carry `clinicianApproved: false`. The
  count of pages through the gate is **zero**, and a production deploy
  would correctly fail `check:approvals` today.
- Why it mattered: a future session reading the checklist would believe
  a page had shipped approved, and might edit it without expecting the
  constraint-4 reset — or, worse, treat the flag as already handled.
  Documentation-only; no code, no gates, no flags touched.

- `ce8edbe` (PR #66) — the operator-supplied PRP frame lands on
  `/services/regenerative` as one full-column framed plate, placed
  immediately after "What they are": definition first, then the
  treatment itself. `src/assets/photos/prp-treatment.jpg`.
- New `.media-band--tall` layout variant — a 9:8 display contract for
  vertically composed sources. The band's default 16:9 is a landscape
  contract; applied to a standing clinician over a reclined client it
  crops her head off and deletes the room. Available to any future
  page with a portrait source.
- **Scale, not the zigzag print.** At 108 body words this was by some
  distance the thinnest treatment page, and it had no image. With one
  photo to spend, the 18rem tilted print reads as decoration rather
  than as the page's anchor — that print is a snapshot gesture for
  pages carrying three or four images. Straight, not tilted.
- Crop chosen by rendering five ratios: 16:9 decapitates Amy, 5:4 cuts
  the client mid-collar, 1:1 keeps a dead band of shirt. The CSS
  `aspect-ratio` matches the server-side crop exactly, so no unseen
  pixels ship — same division of labour as the `fine-gauge` band.
- Source re-encoded PNG → JPEG at q92 (948 kB → 123 kB) because Astro
  re-encodes every variant; shipped variants are 16/27/38 kB webp
  against a 245,760-byte page image budget.
- `clinicianApproved` stays `false` — the page keeps its draft banner
  and cannot reach production. DECISIONS 2026-07-26.
- Two operator calls left open in the PR: the 895 px source renders at
  ~1.24× on a 2× desktop display (a higher-resolution original would
  sharpen it), and the "MobileAesthetics" neon wordmark was kept
  deliberately — a sign-free crop was rendered and is materially
  worse, since the neon is the photo's entire colour story.

### 2026-07-26 — Documentation-only PRs skip the preview pipeline

- `pr-preview.yml` gains `paths-ignore: ['docs/**', '**/*.md',
  '.gitignore']`. A docs-only PR goes from ~5.5 minutes to zero; the
  suite is fixed-cost (pa11y over 23 URLs, Lighthouse 3× over 6) and
  none of it reads markdown.
- **Not a weakened gate.** `paths-ignore` skips only when *every*
  changed file matches, so any PR touching source still runs the full
  suite — bundling code with a README does not sneak it past. No gate,
  threshold, budget, or banned-pattern list changed.
- `production.yml` deliberately untouched: it carries the
  clinician-approval gate and the Front Door cache purge.
- Trade-off accepted: docs-only PRs get no preview environment. Their
  build output is byte-identical, verified repeatedly this week.
  Operator-authorized; DECISIONS 2026-07-26.

### 2026-07-25 — Operational docs corrected: previews have no password

- Preview password protection was removed 2026-07-21, but the docs that
  tell a human what to *do* were never updated. Corrected in RUNBOOK
  (everyday-changes step 2, the "Preview password" section),
  OPERATOR-SETUP (the portal instruction to set one), PHASE-C §4, and
  BUILD_SPEC §18's Phase A exit criteria — which contradicted §14 and
  line 102 of the same document.
- **The one that mattered:** RUNBOOK's Bicep command still passed
  `--parameters previewPassword=<current-or-new>`, and that parameter no
  longer exists in `infra/main.bicep` (only `location`,
  `dnsZoneResourceGroup`, `budgetContactEmails`, `budgetStartDate`). The
  documented infrastructure command would have failed — and it is the
  disaster-recovery path, so it would have failed at the worst moment.
- RUNBOOK gained a "Where `phase-c` is visible" section: `pr-preview.yml`
  triggers on `pull_request` only, so pushes to `phase-c` deploy purely
  because PR #5 is open and each push is a `synchronize` event on it.
  If PR #5 ever closes, `phase-c` silently stops deploying with no failing
  run to point at.
- Historical mentions in DECISIONS, earlier CHANGELOG entries, and the
  dated design spec were left alone — they describe what was true then.

### 2026-07-25 — Repo hygiene: local tooling and root reference images ignored

- `.agents/` (taste-skill marketplace mirror) and `skills-lock.json` now
  ignored alongside `.claude/skills/` — Xtend-AI's agent scaffolding is
  not the client's project code.
- The root debug-image rule extends from `/*.png` to `/*.jpg`/`/*.jpeg`,
  guarding `pink_ombre.jpg` (reference-only) against `git add .`. Patterns
  are root-anchored; `src/assets` stays fully tracked, verified with
  `git ls-files --cached -i --exclude-standard` (empty). `8b40f26`.
  DECISIONS 2026-07-25.

### 2026-07-25 — Hours placeholder no longer printed

- `LocationCard` showed "Hours: {{HOURS}}" on /visit, the styleguide,
  and the home candidate. The line now renders only once real hours
  exist — the same approach the footer already uses for social links —
  so nothing looks broken while the fact is outstanding, and the line
  returns on its own when the hours are supplied. /visit's copy no
  longer promises hours either. Structured data was never affected.
  DECISIONS 2026-07-25.

### 2026-07-25 — Concept home rebuilt (preview route)

- The home-page concept at `/styleguide/concept` is rebuilt on client
  direction: the hero photo is bright and clear (the cinema grade is
  retired from this page), the site-wide ombre now runs through every
  middle section instead of opaque paper/blush paint, and the
  duplicated 12-card services menu is replaced by three arch-framed
  **category doors** (Injectables · Skin & Body · Wellness) that route
  to /services. Adds the location strip (LocationCard) and the §6
  "Meet Amy" credentials block; keeps the framed Instagram post at its
  client-set size.
- Two photos leave the page on compliance grounds: the prep-tray
  detail frame (branded vial + syringes tray — the 2026-07-23 rubric
  applied retroactively) and the mirror frame (contradictory release
  entries in the log). The studio's neon sign stays visible in the
  hero at the operator's direction — it is Amy's own signage, and a
  trial crop that removed it also clipped her head. The italic font
  face is retired (font budget + swap-CLS discipline).
- Still the preview route only — the C8 flip to `/` is a separate PR
  after Amy approves, and it carries three prerequisites: the hero
  client's release on the record, Amy's sign-off on the Instagram post
  caption, and {{MEDIA_SCOPE}}. DECISIONS 2026-07-25.

### 2026-07-25 — Treatment media recomposition

- Client-approved follow-up to the taste audit ("Amy loves it"): all
  thirteen decorative polaroid captions retired across seven treatment
  pages (video attribution captions stay), and wrinkle-relaxers' third
  photo row became a full-width framed print — scale variation instead
  of a third zigzag (new `.media-band` layout variant; the only 3-run
  on the site). Copy and alt text untouched. dermal-fillers'
  `clinicianApproved` reset to false in its own commit (constraint 4 —
  captions-only diff for Amy's re-review). Operator passed on the
  featured-card activation the same day: the /services menu stays
  all-equal by recorded client preference. DECISIONS 2026-07-25.

### 2026-07-25 — Taste-audit polish quintet

- Five small adoptions from the read-only taste-skill audit
  (operator-approved; the full adopt/discuss/reject record is
  DECISIONS 2026-07-25): the conversion-band credential line no
  longer wraps to a stray leading middot; odd-count product-card sets
  close the empty cell (last card spans the row); the nav marks the
  current page (aria-current + quiet pink underline); headings, leads,
  and prose gain text-wrap orphan control; CTAs get a 1px pressed
  state. CSS plus one aria attribute — no content, no gates, no
  approval flags.

### 2026-07-23 — /about portrait: Amy's family

- The /about portrait is now Amy's formal family portrait
  (client-requested; the frame includes minors, so the swap was
  flagged and shipped only on Amy's on-record consent covering
  everyone pictured — DECISIONS 2026-07-23). Neutral asset filename;
  alt text names no one but Amy; same framed treatment, crop anchored
  to the group. The practice photo stays in the repo (ConceptHome
  uses it) if she ever wants it back.

### 2026-07-23 — Ombre canvas site-wide; accents invert to ink

- Amy approved the /services trial and directed the ombre onto the
  whole site: the ramp (blush `#fdf2f8` → brand pink `#ec4899` at 80%
  of each page) now styles every light-surface body automatically; the
  construction home and /404 stay noir. The trial `ombre` flag is
  deleted.
- Site-wide re-ink addition: links and outline CTAs (`--ng-link`) join
  eyebrows, accent rules, and focus rings in switching to ink on ombre
  pages — canvas-level pink fails mid-ramp; links stay distinguishable
  by underline or border. In boxes this lifts the 2026-07-22 4.60
  in-box exception to 11.80. Noir bands keep their pink-300 family.
- White photo/video mattes kept as framed prints on the pink canvas —
  flagged for client review on the preview. BUILD_SPEC §5 amended:
  pink is now the atmosphere, the jewelry inverts to ink. A11y: every
  ombre page's pa11y entry carries the per-URL needs-review cap
  (21 of 23 URLs, operator-gated). DECISIONS 2026-07-23.

### 2026-07-23 — Footer credit: Created by Xtend-AI

- Every page's footer closes with a small credit line under the © row:
  "Created by: Xtend-AI", linking to xtend-ai.com (client direction).
  One edit in `Footer.astro`; text-xs, existing footer-link treatment,
  new-tab convention matching the social links. No analytics event.
- The under-construction home page has no footer component, so it gets
  the same credit pinned to the bottom of its full-height layout —
  every built page now carries it.

### 2026-07-23 — Ombre canvas trial on /services

- The white page background becomes an ombre (client direction,
  matched to the client's reference image): blush `#fdf2f8` at the top
  sweeping to full brand pink `#ec4899`, reaching depth just above the
  noir CTA band. Trial-scoped to /services via a BaseLayout `ombre`
  flag; every other page is untouched. Site-wide rollout is phase 2,
  after the client approves the trial.
- Canvas-level openers (eyebrows + accent rules) and the focus ring
  switch to ink on ombre pages via new `--ng-kicker` /
  `--ng-rule-accent` tokens — ink-pink and magenta wash out mid-ramp;
  noir bands keep their own scoped colors, pixel-identical.
- The a11y gate cannot compute contrast over gradients and fails such
  text outright; no smooth ombre is fully axe-auditable (a pseudo-layer
  re-engineering failed worse). Operator decision by explicit
  instruction: the /services entry in `.pa11yci.json` caps axe's
  needs-review class to warnings — that URL only; true violations
  still fail at zero tolerance everywhere. The hand-computed
  worst-case pairs recorded in tokens.css (all passing, floor 4.88:1)
  are the required review. Full story: DECISIONS 2026-07-23.

### 2026-07-23 — Skincare: the twelfth line's storefront opens

- **/services/skincare** rebuilt around six routine-step cards
  (Cleanse → Protect) plus complete-line copy: Amy can supply any
  product in the Skinbetter Science line, so the page frames the
  routine, not a catalog — only the AlphaRet and sunbetter franchises
  are named, as examples. No pricing; prices live in the storefront —
  plus two photos from the pro shoot. (DECISIONS same date.)
- "Shop Skinbetter Science" is live: `{{SKINBETTER_URL}}` resolved to
  the practice storefront, decoded from Amy's own counter-card QR and
  verified in-browser (DECISIONS same date). Ships
  `clinicianApproved: false` behind the DraftBanner.
- A branded storefront callout (noir plate, "Amy's custom Skinbetter
  storefront") lands mid-page after a competitor comparison confirmed
  link parity but a presentational gap (DECISIONS same date).

### 2026-07-23 — Studio strip: three photos join /services

- Three vetted frames of Amy at work now sit between the intro and the
  menu: a forehead injectable moment (client-picked frame), a
  lip-filler close-up, and the male client's wrinkle-relaxer moment —
  all three pictured clients are release-cleared subjects (operator
  confirmed same-shoot coverage). About-portrait treatment: hairline
  frame, 4/5 crop, light-wash grade. Lazy-loaded responsive images;
  alt text factual.
- Full C:\Amy\pics survey behind the pick (all ~55 unvetted frames,
  compliance rubric); exclusions and the full audit in DECISIONS
  2026-07-23.

### 2026-07-23 — /services redesigned as a categorized editorial menu

- Client direction after a competitor comparison: the twelve service
  cards now render as a treatment menu — three labelled groups
  (Injectables · Skin & Body · Wellness), cards two-across with
  oversized Playfair index numerals 01–12, Playfair titles, and a
  "More information ›" microline; hover draws a 2px ink-pink rule across
  the card top on top of the existing plate-deepen + ring.
- Display order changed: injectables lead, and array order is now the
  numbering order. Direction and grouping were client-picked from
  previewed alternatives (arch vitrine, noir band, flat grid —
  DECISIONS 2026-07-23).
- Card pinks, edges, and every recorded contrast pair unchanged; +197
  bytes CSS; JS stays zero.

### 2026-07-22 — Every box now matches the /services card pink

- Client direction: all boxes on every page wear the /services resting
  pink `#f4cae2` — one token repoint (`--ng-card` → `--ng-card-rest`)
  recolors product cards, the deck and router cards, the medical
  disclaimer block, the investigational notice, the location card, and
  the about-page facts box.
- Every box edge rule moved magenta-600 → ink-pink (margin-thin on the
  new pink), matching the /services cards; the disclaimer's pink-300 top
  rule (near-invisible on the new pink) moved with them.
- In-box pink links/tags hold 4.60:1 — WCAG AA passes; the house 4.7
  link-headroom bar carries an operator-accepted in-box exception
  (DECISIONS same date). Ambient blush bands and noir boxes unchanged.

### 2026-07-22 — Laser Treatments: the twelfth line

- New page **/services/laser-treatments** — Venus Versa, three
  applications on product cards (NanoFractional RF resurfacing, IPL
  photo-rejuvenation, Multi-Polar RF + PEMF), all appearance-hedged, no
  pricing: the line is consult-routed and the open menu is tracked as
  `{{VENUS_VERSA_MENU}}`. Ships `clinicianApproved: false` behind the
  DraftBanner.
- **/services now reads "Twelve lines. One expert clinician."** — the
  count bump plus the operator's wording choice ("expert" is new,
  flagged once). The meta description follows and gains "laser
  treatments".
- The grid card sits ninth, closing the device row (skin rejuvenation,
  body contouring, laser); enum, §6/§7.12/§17, trackers, and the pa11y
  URL set grew to twelve. The manufacturer's marketing name for the
  third application is a banned angle and never appears in the repo.

### 2026-07-22 — Compliance docs brought in line with the code

Documentation-only sweep after the disclaimer work. No behaviour changes.

- **`compliance/README.md` misdescribed the linter's scope.** It said every
  string in `src/content/**` and `src/pages/**` is scanned; `SCAN_DIRS` is
  actually **six** directories including `src/components` and `src/layouts`.
  A pre-existing error, and precisely the one that makes the Biote disclaimer
  problem confusing — the README implied a disclosure component was exempt,
  when scanning it is exactly why hardcoding the FDA sentence failed. Now
  lists all six and calls out the components/layouts case explicitly.
- **`compliance/README.md` documented no allowlist at all**, despite
  `allowedStrings` holding nine entries and being the only sanctioned route
  for publishing something a category would catch. Added: exact-match
  semantics and digit-boundary guards, operator-gating, the three
  marketing entries versus the fourth regulator-required one, and the
  **per-line stripping hazard** — a re-wrapped sentence matches nothing and
  trips every banned term inside it.
- **`compliance/README.md` overstated the Biote inverse check.** It claimed
  the flag "makes the treatment layout inject the FDA disclaimer" — true only
  since 2026-07-22; before that the flag was enforced while its payload was
  an unresolved token. Now dated, with a note on what the flag does **not**
  unlock: disease names, and condition names the treatment is positioned as
  being *for*. The linter cannot enforce that second half — "menopause" and
  "Low T" trip no pattern — so it is flagged as editorial judgment. **A green
  `lint:claims` is a floor, not a verdict.**
- **`.claude/CLAUDE.md` enumerated only three scoped exceptions.** The FDA
  disclaimer is a fourth and necessarily contains all four verbs constraint 3
  bans, so the governing document contradicted what shipped. Added, with both
  editing rules and an explicit restatement that the verbs stay banned
  everywhere outside that one exact sentence.
- **Correction:** the IV Therapy entries called `studio-wide.jpg` a
  "previously unused in-repo asset". It is imported by `ConceptHome.astro`
  for the styleguide concept demo; it was unused *by any treatment page*.
  Reasoning unaffected — no new asset was added either way.

### 2026-07-22 — /services cards recolored to Amy's picks

- The service-line cards now rest on a client-picked lighter pink
  (`#f4cae2`) and **deepen** to `#efb1d5` when highlighted, with a 2px
  ring on all four sides replacing the old left-edge thickening. Exact
  hexes supplied by the operator; the shade roles were reversed at
  client direction after the first preview round.
- The highlight ring + title letters settled on ink-pink (`#b01366`,
  3.81:1 — passes AA) after three client trials the same day: hot
  pink `#ff4f8b` and the logo-lips neon `#fe019a` both failed the
  WCAG bars, plum `#a83b71` passed but lost on looks. magenta-600 is
  ruled out — it fails the non-text bar on the highlight pink. All
  measured pairs live in the `tokens.css` header table.
- Scoped to `.treatment-card` (/services + styleguide); the shared
  `--ng-card` blush blocks elsewhere are unchanged. No content, gate,
  or config changes.

### 2026-07-22 — Hormone Optimization built; the FDA disclaimer now renders

- **Fixed a live defect.** `/services/hormone-optimization` shipped
  `bioteDisclaimer: true` while `BioteDisclaimer.astro` rendered the
  literal string `{{BIOTE_FDA_DISCLAIMER}}` — braces visible — directly
  above symptom-awareness copy. The one disclosure BUILD_SPEC §7.8 makes
  mandatory was never actually shown. Resolved with Biote's own printed
  brochure wording.
- **The compliance gate had been blocking the compliance text.** The
  disclaimer names the four verbs the `disease-claims` category bans, so
  hardcoding it failed `lint:claims` three times over. Fixed the
  sanctioned way — the exact sentence is now in `allowedStrings`
  (**fourth authorization**, and the first for text a regulator requires
  rather than copy the client wants). **No pattern was modified; the list
  only grew.**
- Proved exact before trusting it: the exact sentence passes; "illness"
  for "disease" fails; a shortened variant fails; the verbs reused as
  real copy fail; and a **line-wrapped** disclaimer fails. Stripping is
  per line, so the sentence must stay on one source line — recorded in
  the component header alongside a second rule never to restate those
  verbs elsewhere in that file.
- **Page rebuilt** from Amy's Vagaro menu (`Hormones/Biote` = lab draw,
  Pellets) plus the operator-supplied Biote source, treated view-only and
  never committed. Three cards — **Pellets — Women $450**, **Pellets —
  Men $750**, **Hormone lab draw** (no price) — and six sections
  including **parallel "For women" and "For men" sections**, per operator
  decision. That pairing is a restructure, not an append: "Who it's
  generally for" had carried hot flashes and night sweats, so it *was*
  the women's section unnamed, which made "For men" read as an appendix
  to a female default. It is now a universal frame, with the gendered
  vocabulary moved into the two sections beneath it.
- **"Menopause" is deliberately absent**, as "Low T" already was. Neither
  is a banned pattern and neither is a disease, so the linter permits
  both — but naming a condition the pellets are *for* contradicts the
  disclaimer two paragraphs above, and the rule has to apply evenly to
  both sections.
- Symptom-awareness vocabulary is in play here **and nowhere else on the
  site**. Disease names — heart disease, diabetes, osteoporosis, anxiety,
  depression, PTSD, bone density, cognition, prostate — stay banned
  regardless of the disclaimer, as does Biote's entire post-procedure
  timeline (intervals, procedures per year, lab cadence: protocol
  material). Also excluded: quantified efficacy, "world's #1", 85 years,
  4 million insertions, all three testimonials, the outcome lists, and
  the DIM supplement.
- `pricingDisplay` stays `consult` — unlike IV Therapy, that line is true
  here. No imagery: §7.8 keeps Biote text-only pending
  `{{BIOTE_PERMISSION}}`.
- BUILD_SPEC §17 records `{{BIOTE_FDA_DISCLAIMER}}` **RESOLVED**; §7.8
  gains the scope note. Ships `clinicianApproved: false`.

### 2026-07-22 — IV Therapy & Vitamin Support built on the live menu

- The placeholder becomes a real page. Scope taken from Amy's Vagaro
  booking menu — the IV category carries exactly three services (NAD,
  Immunity boost, Myers cocktail) — plus the two vitamin shots named in
  BUILD_SPEC §7.7. Five product cards, grouped by the `tag` field into
  **IV infusion** (3) and **Shot** (2).
- Prices shown only where verified: **Myers' Cocktail $125**,
  **Immunity IV $125**, **NAD IV $200** (operator-supplied; NAD
  corroborated by Amy's own handwritten annotation), **Glutathione $25
  per shot** carried over unchanged from the shipped peptide-therapy
  page. **Vitamin B12 carries no price line** rather than an invented
  one. Immunity IV's ingredients (vitamin C, vitamin B12, B-complex,
  zinc sulfate, glutathione) are named as composition only — §7.7's
  rule against extending the product name into immune benefits stands.
- Card copy states what each substance **is**, not what it does. The
  operator-supplied `scans/peptides` cards are constraint-8 internal
  product cards (reconstitution, dosing, duration) whose Glutathione
  "Uses" text runs into chemotherapy / Alzheimer's / Parkinson's
  language — the exact content §7.7 bans by name. Excluded in full,
  along with the company site's benefit copy ("Immune and recovery
  boost", "Cellular repair and mental clarity", "Detox and skin
  brightening"). **The quoted half passes lint:claims cleanly** — a
  judgment exclusion, not a gate catch (DECISIONS 2026-07-22).
- `pricingDisplay` **consult → none**: the `consult` value injects
  "Pricing is individual and discussed during your consultation",
  which contradicts a book-direct page showing three fixed prices.
  Already in the schema enum and shipped on skincare.mdx.
- `ctaType` stays **`book`** per the §6 route table — one of only two
  book-routed treatment pages. Adds `studio-wide.jpg` (already in-repo;
  not previously used on any treatment page — corrected 2026-07-22 from
  "previously unused", which overstated it) in a media row.
- `banned-patterns.json` untouched — all three price strings are plain
  dollar amounts, so no allowlist entry was needed.
- Ships `clinicianApproved: false` behind the DraftBanner.

### 2026-07-22 — Body Contouring built on Evolve

- The placeholder becomes a real page, scoped from Amy's live Vagaro
  menu: the **Evolve** category carries one service, "Tighten and
  tone" — InMode's Tite (RF → skin) and Tone (EMS → muscle), not Trim
  (→ adipose). Competitor copy supplied with the request ("destroy
  fat… surgery-like results") was rejected on accuracy first — it
  advertises a service Amy doesn't offer — and BUILD_SPEC §7.11
  second. No override sought (DECISIONS 2026-07-22).
- Two product cards for the two ways Evolve is sold: a course of six
  ($1,500) and a single session ($275). Count-keyed prices, so no
  banned pattern matches and `banned-patterns.json` is untouched — no
  allowlist entry needed.
- Body carries the two-energy mechanism in manufacturer-factual terms,
  plus placement areas (abdomen, flanks, thighs, arms, buttocks) and
  ~30–60 minute sessions — the first session length stated on the
  site. Six logistics-only FAQ items; suitability routes to consult.
- First treatment page to ship **without imagery**: nothing in the
  photo library depicts Evolve or the room, and body imagery here
  reads as a before/after implication. `ctaType: consult` per the §6
  route table; clinicianApproved stays false.

### 2026-07-22 — Skin Rejuvenation rebuilt around PiXel8-RF

- Product cards arrive: PiXel8-RF microneedling (Rohrer Aesthetics,
  FDA-cleared, 4 MHz RF — bare $1,500 per operator decision) and
  medical-grade chemical peels (Starting at $180). Mechanism-design
  copy, appearance-hedged indication areas, expanded FAQ, and a
  biostimulators cross-link. The peel section is a deliberate
  compliant placeholder — `{{CHEMICAL_PEELS_MENU}}` (BUILD_SPEC §17)
  tracks the missing menu. No photo yet; clinicianApproved stays
  false. (DECISIONS 2026-07-22.)

### 2026-07-21 — Wrinkle Relaxers gains the Evolus ICON film

- The page's second Evolus artifact: the ICON HQ-event recap (87s,
  H.264 transcode of the operator's HEVC source, click-to-play,
  captioned from the film's own burned-in text with speaker labels)
  under a new "Inside Evolus" section pairing with the #1-provider
  line. Published as-is by operator override — the flag covered the
  comparative-efficacy segment, named third-party providers, and
  absent safety information (DECISIONS 2026-07-21). Reused
  TreatmentVideo unchanged. clinicianApproved stays false.

### 2026-07-21 — Dermal Fillers: first clinician approval

- Amy reviewed and approved /services/dermal-fillers on the stable
  preview; `clinicianApproved: true` — the flag edit made by the
  operator personally (hard constraint 4). First page to clear the
  clinician gate; its draft banner comes down. Also: BUILD_SPEC §7
  briefs 3/4 and the §6 About row now cross-reference the resolved
  Evolus-sentence placement (documentation-completeness sweep).
  (DECISIONS 2026-07-21.)

### 2026-07-21 — BUILD_SPEC §7.5 clarified: Radiesse is a biostimulator

- Encoded the filler-vs-biostimulator resolution into the spec brief: Radiesse
  lives on the Biostimulators page, not Dermal Fillers (operator-confirmed via
  radiesse.com). Keeps the recurring confusion from resurfacing. (DECISIONS
  2026-07-21.)

### 2026-07-21 — "Charlotte's #1 Evolus provider" published ({{EVOLUS_CLAIM}} resolved)

- The Evolus ranking sentence — long tracked by the placeholder registry
  and already public on the practice's own site — now appears on the
  Wrinkle Relaxers (Jeuveau) and Dermal Fillers (Evolysse) pages, via
  the third operator-authorized allowlist entry (the first
  superiority-class string; the operator added the registry line
  personally). The linter self-test's exactness proof generalized to
  any-category in the same change; naked "#1"/"best" remain banned
  everywhere else, probe-verified (DECISIONS 2026-07-21).
- Also in this change: the dermal-fillers lip style guide swapped to the
  operator's text-free version (names only) — the baked-in "We add
  volume…" and "will suit everyone" exposure from the original as-is
  decision is retired (DECISIONS 2026-07-21).

### 2026-07-21 — Biostimulators: distinct clinician photo + Radiesse biostimulator label

- Media-row photo swapped off the shared `amy-palacios-fnp.jpg` (also on GLP-1)
  to a new `amy-studio-portrait.jpg` — a solo pink-scrubs portrait cropped from
  8K0A9750 with the product/prep table removed (the shoot has no clean solo
  frame; ~74 pics screened first-hand).
- Radiesse's product card now reads "an injectable biostimulator" — operator
  confirmed via radiesse.com; "first and only" / "FDA approved" from the source
  banner were not imported (superiority / banned). (DECISIONS 2026-07-21.)

### 2026-07-21 — Preview passwords removed (previews public + noindexed)

- SWA preview password protection is off (operator direction — the auth
  cookie looped in Chrome and blocked reviews; applied immediately via
  ARM, verified). The basicAuth resource and previewPassword parameter
  leave the Bicep so an infra redeploy cannot silently re-enable it, and
  preview builds now send `X-Robots-Tag: noindex, nofollow` so
  unapproved drafts never index. Amy's review links now open directly
  (DECISIONS 2026-07-21).

### 2026-07-21 — Dermal Fillers rebuilt: film, cards, prices, lip styles

- /services/dermal-fillers now carries the Evolus-produced Evolysse film
  (the site's first video — self-hosted MP4, click-to-play, captioned),
  product cards for Evolysse Smooth, Evolysse Form, and the Revanesse
  family (Versa+ & Lips+) with real pricing — "$650 or $325
  (half-syringe)", which trips no banned pattern, so no compliance
  carve-out was needed — two vetted studio photos of Amy with the
  Evolysse packaging, the client-supplied lip style guide, an "After
  weight loss" cross-link to the GLP-1 page, and an expanded FAQ.
  Operator overrides for the manufacturer film and the style-guide
  graphic: DECISIONS 2026-07-21.
- New TreatmentVideo component (zero JS, native controls, required
  captions track); `/media/*` cache route added to both SWA templates.
- `clinicianApproved: false` — awaiting Amy's sign-off.

### 2026-07-21 — Biostimulators page (Radiesse + PDO Threads, prices, consult-first)

- The placeholder Biostimulators page is now Amy's real two-treatment menu:
  **Radiesse** (injectable calcium hydroxylapatite, $900 per syringe) and **PDO
  Threads** (dissolvable polydioxanone, the VSoft Lift line, $350 for 10
  threads), built to the treatment template — per-product cards with one factual
  class line, the collagen-stimulation mechanism the category is named for, and a
  logistics-only FAQ.
- Compliance: both source brochures (Merz Radiesse; VSoft Lift) are drafted only
  as factual category identity + mechanism per BUILD_SPEC §7.5 — every
  FIRMS/TIGHTENS/REVERSES, "23x more collagen," 78%/98% stat, "reverses signs of
  aging," "strongest/best," and before/after was dropped. Prices are flat
  (non-mg, non-unit), so no banned-patterns allowlist entry was needed.
- CTA is **consult**, per BUILD_SPEC §6; `clinicianApproved: false` (Amy's gate).
  Media-row reuses the existing studio portrait. All gates green (claims, voice,
  a11y 22/22, Lighthouse). (DECISIONS 2026-07-21.)

### 2026-07-21 — Treatment pages gain a Call button

- Every treatment page's closing band now pairs its primary button with
  "Call 704-579-7108" (reusing the existing CTAButton call variant),
  matching the /services, /about, and /visit bands. Prompted by the
  peptide-therapy review; applied in the shared TreatmentLayout so all ten
  pages stay consistent (DECISIONS 2026-07-21).

### 2026-07-21 — Peptide Therapy page (real menu, prices, direct booking)

- The placeholder Peptides page is now Amy's real nine-peptide menu,
  resolving `{{PEPTIDES_PUBLIC_LIST}}`: BPC-157/TB-500, GHK-Cu, GLOW,
  Glutathione, Ipamorelin, MOTS-c, NAD+, Sermorelin, Tesamorelin. Built to
  the GLP-1 template — per-product cards with one factual biochemical-class
  line and a flat price, direct Vagaro booking, and a logistics-only FAQ.
- Compliance: the product sheet's Uses column (anti-aging, healing, recovery,
  blood-sugar, disease names, "FDA-approved for visceral fat") is
  non-publishable, so each peptide is described by class only — GHK-Cu is
  "a copper-binding peptide," Ipamorelin "a growth-hormone-releasing peptide"
  — with everything else routed to consultation, the same reduction the GLP-1
  page made. Dosing, reconstitution, and the cycling schedules stay off the
  site. Prices are flat (not mg-keyed), so no compliance-registry change was
  needed. No page disclosure (operator choice; recorded exposure).
  `clinicianApproved` stays false.
- Photo: a cropped pink-scrubs solo clinician portrait (8K0A9734 above the
  counter — no products, signage, or clients). NAD+ now shows $200
  (operator-provided); MOTS-c stays unpriced (DECISIONS 2026-07-21).
- Enriched within the compliance rules (operator direction): a fuller "what a
  peptide is" passage, a factual families framing, richer per-card identity
  lines, a "delivered and supervised" section, and an expanded logistics FAQ —
  all with zero benefit/efficacy claims. The sheet's marketing "Uses" stay off
  the site; suitability still routes to consultation (DECISIONS 2026-07-21).

### 2026-07-21 — Wrinkle Relaxers rebuilt: cards, prices, photography

- The neuromodulators page now carries per-product cards — Jeuveau,
  Xeomin, and Daxxify with manufacturer and formulation facts, and the
  product sheet's per-unit pricing verbatim (operator override; the
  compliance registry gained per-unit dosing patterns and the two exact
  price strings in the same change). Three released studio frames land
  as framed-print media rows, including the new "Not just for women"
  section. The grid card now says "Wrinkle Relaxers", matching the page
  (naming flag resolved). FAQ and SEO description name all three
  brands. Content awaits Amy's sign-off (clinicianApproved: false).

### 2026-07-21 — /services closing band: duplicate button fixed

- The /services closing band paired the `book` and `consult` CTA
  variants — distinct offers until the direct-booking change made them
  identical (same label, same Vagaro destination), leaving two "Book
  with Amy" buttons side by side. Operator caught it on the preview.
  The second button is now the Call button, matching the About and
  Visit closing bands.

### 2026-07-21 — /book retired

- The booking-explainer page is deleted (operator decision, following
  the sitewide direct-booking change that left it unlinked). It never
  served in production, so there is no redirect debt. Its photo — the
  one frame carrying both open photo flags — leaves the site with it;
  the gate URL lists synced (pa11y 22, Lighthouse 6). Free-consultation
  and phone messaging already live elsewhere (DECISIONS 2026-07-21).

### 2026-07-21 — "Book with Amy" means Vagaro, everywhere

- The weight-loss page's CTA now opens Amy's Vagaro page (operator
  direction — the line was consult-routed by design; the
  consultation-first copy changed with it in the same commit). On the
  operator's follow-up, the /book double-hop retired sitewide: every
  "Book with Amy" button — router cards, consult-routed closing bands,
  /about, /services — books directly. The /book page stays built as
  the how-booking-works explainer, no longer wired to any button.
  Free-and-optional consultation language stays; suitability still
  routes to consultation (DECISIONS 2026-07-21).

### 2026-07-21 — Retatrutide disclosure: one calm line

- The weight-loss page said "investigational and not FDA-approved" four
  times (bolded notice, product card, FAQ, body copy); at Amy's
  direction — after the compliance flag that the statement itself
  cannot come off while Retatrutide is advertised with prices — the
  operator chose consolidation: a single matter-of-fact sentence in the
  adjacent notice, supplied from the content file via the new
  `investigationalNote` field (DECISIONS 2026-07-21).
  `clinicianApproved` unchanged.

### 2026-07-20 — GLP-1 price tiers reformatted

- The five authorized price tiers on the weight-loss page now read
  "20mg vial: $675" style instead of "20mg @ $675" (client direction).
  Registry allowlist and page changed together; same tiers, same
  prices (DECISIONS 2026-07-20).

### 2026-07-20 — Trust-chip credential corrected

- The credential line at conversion points now reads "Licensed family
  nurse practitioner" (was missing "family" — Amy's direction, matching
  her FNP credential as stated everywhere else on the site).

### 2026-07-20 — All conversion buttons say "Book with Amy"

- The "Request a consultation" label is retired (operator directive):
  every conversion button sitewide now reads "Book with Amy." Consult-
  variant buttons keep their `/book` destination and outline style;
  prose keeps the consultation language (DECISIONS 2026-07-20).

### 2026-07-20 — Amy's portrait joins the weight-loss page

- A second framed print on the GLP-1 page: Amy's solo portrait in her
  embroidered scrubs, mirrored against the weigh-in photo (new
  `.media-row--flip` layout variant — opposite tilt, "Your clinician"
  caption). The operator's first-choice frame (a neuromodulator prep
  tray) was flagged as non-compliant for this page; the portrait came
  out of a full pro-shoot survey instead (DECISIONS 2026-07-20).
  `clinicianApproved` unchanged.

### 2026-07-20 — Editorial deck replaces the fact card on service pages

- The Provider/Location/Appointments fact card is gone from all eleven
  treatment pages (operator direction; /book keeps its copy, where
  booking facts belong). In its place: a per-treatment editorial
  statement card — one short display line in the blush card anatomy
  (DECISIONS 2026-07-20). Eleven new deck lines ship for Amy's review;
  `clinicianApproved` unchanged.

### 2026-07-20 — GLP-1 product cards with pricing

- The weight-loss page now carries per-product cards built from the
  operator-vetted facts in the client's product sheet: receptor-class
  descriptions (single / dual / triple agonist), an Investigational tag
  on Retatrutide, and the five mg-keyed price tiers the client directed —
  an operator-authorized override of the mg ban, scoped to exact
  allowlist strings in the compliance registry (DECISIONS 2026-07-20).
  A new FAQ explains how the three GLP-1 medications differ. Dosing,
  reconstitution, and tolerability claims from the sheet stay off the
  site. `clinicianApproved` remains false.
- Later the same day: the redundant "Investigational" badge came off
  the Retatrutide card (operator-directed; DECISIONS 2026-07-20). The
  mandatory disclosures — adjacent notice, in-card sentence, FAQ — are
  unchanged. The Phentermine card now notes short-term use — the
  compliant no-mechanism wording, operator-chosen after the
  appetite-language flag.
- The weight-loss page gains an inline client weigh-in photo
  (operator-supplied; signed release confirmed on file — DECISIONS
  2026-07-20). Aftercare signage cropped out; neutral filename and alt
  text; responsive + lazy via astro:assets.
- The photo's presentation was reworked the same day (operator asked
  for smaller + less bland): a framed-print figure — paper mat,
  hairline border, soft shadow, slight tilt, eyebrow caption — in a
  two-column editorial row beside the "Individualized, with Amy" copy,
  echoing the concept page's framed-post motif. Pure CSS, zero JS.

### 2026-07-19 — Vagaro service alignment

- The services catalog now matches Amy's live Vagaro menu (operator
  scans + four operator decisions; DECISIONS 2026-07-19). The
  neuromodulator list is resolved — Jeuveau, Xeomin, Daxxify. Weight
  loss adds Phentermine and Retatrutide (the latter behind the
  investigational notice, which can now name its compound). Two new
  consult-routed lines: Skin Rejuvenation (Pixel8 RF microneedling +
  medical-grade chemical peels) and Body Contouring (Evolve). The
  Regenerative page trims to PRP and PRP-with-microneedling pending
  Amy's confirmation of the rest. Hormone Optimization gains the
  lab-draw-first and pellet-delivery process facts. /services now reads
  "Eleven lines. One clinician." Vagaro's mg tiers and pricing
  granularity stay off the site by hard constraint. All touched pages
  remain `clinicianApproved: false`.

### 2026-07-19 — Header credential line

- "Amy Palacios, FNP" now sits beneath the wordmark on every page —
  uppercase tracked, brand pink-500 (new verified small-text-on-noir
  contrast pair, 5.95:1; DECISIONS 2026-07-19). The header grows to fit;
  the mobile nav popover clearance moved down to match.

### 2026-07-19 — The perf gate grows up: deterministic budgets + median-of-3

- Three phantom TBT failures on zero-JS pages exposed the real defect: a
  variable lab metric asserted as a single sample on shared CI runners.
  New three-layer design (operator-approved; DECISIONS 2026-07-19):
  byte-exact resource budgets as the primary tripwires (including
  **third-party requests = 0** — the privacy architecture is now
  CI-enforced), Lighthouse metrics asserted on the median of 3 runs with
  every threshold unchanged, and a pre-agreed escalation rule.
- Verify wall time +~2 minutes; a probe test proved the budgets bite.

### 2026-07-19 — C7: the legal drafts

- `/privacy`, `/terms`, `/medical-disclaimer` through a new LegalLayout
  — every page carries a visible "Draft — pending counsel review"
  banner (DraftBanner gained a label prop; the clinician default is
  unchanged). Claims-safe lexicon throughout; third-person voice. The
  footer's legal links now resolve.
- Gates: all three join pa11y (21 URLs total).

### 2026-07-19 — C6: /about — Amy's page, with real facts

- `/about` — founder-forward: "Amy Palacios, FNP", career facts
  resolved from an operator-supplied public listing (two decades of
  nursing, aesthetics since 2017, NP since 2018 — Amy's wording
  confirmation flagged), blush credentials card, studio portrait,
  consult CTA, noir band. Evolus mention omitted pending
  `{{EVOLUS_CLAIM}}`; the multi-provider location gets one factual
  line, nothing more.
- Gates: `/about` joins pa11y and Lighthouse. Header's About link now
  resolves — the nav is fully live.

### 2026-07-19 — C5: the /services index

- `/services` — editorial opener ("Nine lines. One clinician."), the
  full nine-line grid (no featured picks until Amy chooses), noir
  closing band. The header's Services link now resolves sitewide.
- Gates: `/services` joins pa11y and Lighthouse.

### 2026-07-19 — C4: treatment drafts, batch 2 — all nine lines drafted

- The remaining five treatment pages, all `clinicianApproved: false`
  with visible DraftBanners: weight-loss-glp-1 (Retatrutide omitted
  entirely pending counsel), peptide-therapy (visible
  `{{PEPTIDES_PUBLIC_LIST}}` token), iv-therapy (book CTA; Immunity IV
  named, never extended), hormone-optimization (`bioteDisclaimer: true`
  — the visible `{{BIOTE_FDA_DISCLAIMER}}` token renders adjacent to
  the symptom-awareness copy), and skincare (shop CTA; visible
  `{{SKINBETTER_URL}}` token). One `content:` commit per file.
- Gates: five URLs join pa11y (16 total); hormone-optimization joins
  Lighthouse.

### 2026-07-19 — C3: treatment drafts, batch 1

- First four treatment pages drafted from their §7 briefs, all
  `clinicianApproved: false` with visible DraftBanners:
  wrinkle-relaxers and dermal-fillers (book CTA), biostimulators and
  regenerative (consult CTA). One `content:` commit per file — the
  clinician audit trail.
- `{{NEUROMOD_LIST}}` renders as a visible token on wrinkle-relaxers
  until the operator confirms the product list.
- TreatmentLayout sets MDX body prose on the type scale.
- Gates: four URLs join pa11y; wrinkle-relaxers joins Lighthouse.

### 2026-07-19 — C2: the treatment-page machinery

- `/services/{slug}` collection route: every file in
  `src/content/treatments/` now renders through TreatmentLayout with its
  compliance order fixed; `draft: true` entries never build.
- Treatments schema gains `faq` (editorial Q&A only, clinician-gated —
  operator-approved schema change, flagged in the C2 PR).
- Structured data: treatment pages emit Service + BreadcrumbList JSON-LD
  through a new BaseLayout `jsonLd` prop.
- CTAButton gains the `shop` variant for the Skinbetter storefront
  link-out (visible `{{SKINBETTER_URL}}` token until resolved).

### 2026-07-19 — C1: booking, visiting, and a branded 404

- `/book` — single-purpose conversion page: the Vagaro handoff explained,
  "Book with Amy" + call CTAs, free-consultation-on-request routing, and
  the at-a-glance fact card. No closing band by design — every path off
  the page is book, call, or ask.
- `/visit` — "Visit Amy": address, visible `{{HOURS}}` placeholder,
  get-directions link-out (maps are never embedded), closing noir
  book/call band. Parking note waits on operator wording.
- `/404` — dressed in the brand: noir with full site chrome, editorial
  headline, routes to home and booking (a services link lands with
  `/services` in C5).
- Gates: `/book` and `/visit` join the pa11y URL list; `/book` joins the
  Lighthouse set.

## Design system — "serious glamour" pivot (`feat/glamour-pivot`)

### 2026-07-18 — The studio dresses up

- Sitewide tonal pivot from "medical-grade playful" to **serious and
  glamorous** (client direction after competitor review; palette
  unchanged — DECISIONS 2026-07-18). Ships preview-first; production
  continues to serve only the untouched construction placeholder.
- Motion: the ignite flicker and perpetual neon hum are retired. New
  vocabulary: content **rises** into place on scroll (pure CSS
  scroll-driven animation, replays on re-entry), accent rules **trace**
  in under section openers, and the sign holds a **static aura** —
  nothing pulses. Reduced-motion stills everything (including the
  scroll-driven moves, which need an explicit `animation: none`).
- Surfaces: white/paper ambient returns; blush becomes the card tint;
  new hairline border token across cards, header, footer, FAQ, and
  visit steps.
- Type: display weights soften to 500 with tight tracking; new eyebrow
  labels and a 76px display-0 for the future home hero. (A Playfair
  italic accent was trialed and removed the same day — its perf gate
  fired on CI; DECISIONS 2026-07-18 update.)
- Components: squared CTA buttons (pill retired), hairline chevron runs
  with a static seam aura, middot-separated trust line (pills retired),
  solid-border Get-the-App card.
- Styleguide: live rise/trace demo at the top, swatches now parsed from
  tokens.css at build time (they can no longer drift), new type/utility
  sections, and glam demo copy.
- Construction page (`/`): pixel-identical — its two keyframes are
  fenced as legacy in global.css until the real home page replaces it.
- Still 0 KB client JavaScript; all new derived color pairs
  contrast-verified and recorded in tokens.css.
- **Concept refinements (same day):** Amy's own Instagram post joins the
  concept home as a framed print ("In her own words") with a follow
  link, sized so its caption reads; the header "Book" goes straight to
  Vagaro (the /book page stays a Phase C consultation-routing target);
  the visit section's CTA becomes "Book with Amy" and every concept
  book button now opens the live Vagaro page; the mirror-moment arch
  brightens to a light wash (the cinema grade stays noir-only) and a
  stray band overlay that was darkening the top of the page is
  re-anchored.
- **Booking + socials live; "Book with Amy" (same day):** the booking
  button reads "Book with Amy" and now points at the operator-supplied
  Vagaro page; the footer carries Facebook, Instagram, and Yelp marks.
  The Vagaro handle and Yelp listing are the location's (not
  Amy-specific) — flagged in DECISIONS for the launch checklist.
- **Chevrons retired; address live (same day):** the chevron-run motif
  is removed from the UI at the client's direction (it remains inside
  the logo artwork); the eyebrow + accent-rule opener is the signature
  element now. The practice address resolved into siteConfig — footer,
  location card, and structured data now carry the full NAP.
- **Concept round (same day):** photography-led "After Dark" home
  concept at /styleguide/concept (client: "much better"). Hero promise
  confirmed. Business-fact correction: consultations are optional and
  free — "Consultation-first" retired across TrustChips, VisitSteps,
  AtAGlance, and the demo FAQ. Header wordmark up to 440px with the
  chevron run as its flourish.
- **Client review round (same day):** the sign breathes again at a
  luxury tempo (5.6s aura swell), the big noir accent phrases shimmer
  with a soft neon halo (a clip-text satin sheen was trialed and
  re-engineered — transparent fills fail the axe gate), solid CTAs
  switch to brand-pink fills with ink text (4.88:1 verified), the header
  wordmark and nav scale up, and the noir hairline brightens to true
  brand pink. "Nothing pulses" became "the glow that moves lives in two
  places: the sign and the accent phrase."

## Construction page (`/` — src/pages/index.astro)

The public placeholder while the full site is built (Phases A–B complete
and in production; Phase C — pages & content — pending).

### 2026-07-09 — Amy's caricature joins the page (PR #3, `1a6a0c9`)

- New arched "studio window" below the logo holding the commissioned
  caricature of Amy, with two caution-tape strips strapped across its
  lower third — the construction story becomes literal: you're peeking
  into a studio that's being finished, and Amy's inside.
- Story line **"Amy's inside, getting the studio ready."** (pink, lead
  size) replaces "Pardon the dust…".
- The caution tape moved off the "Under construction" heading onto the
  window; the heading now stands alone in tracked uppercase.
- The logo — unchanged at its full 780px — regained the
  styleguide-approved motion: a one-time ignite flicker on load, then
  the perpetual neon hum. Both are stilled for reduced-motion users.
- New **reusable component** `src/components/CaricatureWindow.astro`
  (props: `image`, `alt`, `taped`, `class`). The tape strips are
  optional so Phase C can reuse the arch untaped on light surfaces
  (e.g. an About-page portrait). The window's neon halo is static and
  noir-scoped — the sign remains the only animated glow (adjacency
  rule, DECISIONS 2026-07-08).
- Asset `src/assets/brand/amy-caricature.png` (1065×1477) via
  `astro:assets`: 1.9 MB source → 29–127 KB delivered per breakpoint.
  The logo remains the LCP; still 0 KB client JS.
- The artwork shows Mobile Aesthetics signage; the operator reviewed
  the flag and accepted it (site-copy rules under hard constraint 2
  are unchanged).
- Process: three concepts mocked with the real assets → operator chose
  the "taped-off peek" → built on `feat/construction-caricature` →
  reviewed on the password-protected PR preview → merged on explicit go.
- Spec: `docs/superpowers/specs/2026-07-09-caricature-construction-page-design.md`
  · Decision: `docs/DECISIONS.md` 2026-07-09 entry.

### 2026-07-08 — Neon marquee experiment, reverted same day (`8c6a584` → `fbbceaa`)

- A humming lockup + chasing chevron marquee shipped straight to
  production on verbal approval and was rejected on sight: the marquee
  sat directly under the logo's own baked-in chevron run and read as a
  shrunken duplicate. Full revert restored the static placeholder.
- Produced the standing process rule: **visual changes go through a
  preview URL first; production moves only on explicit go after the
  operator/Amy have seen it.** (DECISIONS 2026-07-08.)

### 2026-07-08 — Amy-singular voice (`7d93623`)

- Placeholder copy rewritten with no first-person plural ("Pardon the
  dust — the full Needle Girlie experience is being built."). The site
  speaks as Amy, never "we" — enforced sitewide by the `lint:voice`
  gate from this date onward.

### 2026-07-07 — Placeholder built out (Phase A)

- `ba822d3` — black theme, caution-tape banner, "Under construction".
- `047e239`, `53ebf36` — logo enlarged per client ("it's got to be
  big"); glow-preserving crop.
- `6cd89ae`, `96962e1` — phone number added (`{{PHONE}}` resolved:
  704-579-7108); wording set to "Call for an appointment" (booking
  language convention).
- `06f6936` — hi-res logo re-rendered from the canonical HTML design
  source.

### Current state (after PR #3)

Composition, top to bottom, all centered on noir: humming logo (780px
max) → taped caricature window (520px max) → "Under construction" →
"Amy's inside, getting the studio ready." → "The dedicated home of Amy
Palacios, FNP — medical aesthetics in Harrisburg, NC." → phone link.
All gates green (claims, voice, a11y 4/4, Lighthouse budgets); zero
client-side JavaScript.
