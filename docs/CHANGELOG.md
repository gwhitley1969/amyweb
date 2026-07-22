# Changelog — needlegirlie.com

Human-readable record of what shipped, newest first. The *why* behind each
change lives in `docs/DECISIONS.md`; design specs live in
`docs/superpowers/specs/`. Commit hashes are the audit trail.

## Phase C — pages & content drafts (`phase-c`)

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
