# Changelog — needlegirlie.com

Human-readable record of what shipped, newest first. The *why* behind each
change lives in `docs/DECISIONS.md`; design specs live in
`docs/superpowers/specs/`. Commit hashes are the audit trail.

## Phase C — pages & content drafts (`phase-c`)

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
