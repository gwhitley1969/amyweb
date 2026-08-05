# Phase C — Pages & content drafts (working checklist)

> **STATUS UPDATE 2026-08-05 — LAUNCHED.** **needlegirlie.com is
> live.** Amy approved all twelve treatment pages plus
> /injector-training on the stable preview; the operator flipped the
> flags with their own commands in-session (sign-off commit ad8fbde,
> PR #93 — the §16 written log). PR #5 (`phase-c` → `main`) merged as
> the launch merge; the Production pipeline ran green end to end
> (verify → check:approvals → Front Door-locked build → SWA deploy →
> cache purge). §16 live checks all pass — apex serves the site,
> redirects and lockdown hold (platform answers 404, not 403, on
> direct SWA hits — security property intact), draft banners gone,
> live Lighthouse 1.00/1.00/1.00/1.00. Phase C is COMPLETE and
> DELIVERED. `phase-c` remains the integration branch for post-launch
> work (counsel review, manual a11y pass, laser pricing, photo
> upgrades, Plausible opt-in). DECISIONS 2026-08-05.

> **STATUS UPDATE 2026-08-04 (training):** **/injector-training
> shipped — the site's one professional-audience page.** Private
> Injector Training: four one-on-one courses for licensed medical
> professionals, flyer-sourced prices (three at $5,000, Radiesse at
> $7,500), a fifth "Training" nav item, phone/Instagram routing. The
> four curriculum topics publish flyer-verbatim under the FIFTH
> allowedStrings authorization (operator override after the flag,
> li-wrapped so the linter's exactness self-test stays sound). Not
> flag-gated — the page sits outside the treatments collection; Amy
> reviews it via the sign-off doc's new non-gated section. pa11y now
> runs 24 URLs, LHCI 7. DECISIONS 2026-08-04.

> **STATUS UPDATE 2026-08-04 (C8):** **THE HOME PAGE SHIPPED.**
> index.astro now renders ConceptHome (the Neon Editorial the client
> approved); the construction placeholder and its legacy
> ng-ignite/ng-hum keyframes are retired. All three C8 prerequisites
> closed on the operator's word (2026-08-04, recorded in DECISIONS):
> hero client's release confirmed on the record; Amy signed off the IG
> post caption; {{MEDIA_SCOPE}} closed as per-item operator approval,
> the practice all along. `/` became an ombre URL — its per-URL pa11y
> needs-review cap was operator-authorized in their own words.
> Production SEO strings replaced the concept-mock title/description
> (component-level, so /styleguide/concept mirrors them). Phase C page
> checklist is now COMPLETE; launch blockers remaining are the twelve
> clinicianApproved flags and the §16 mechanics.

> **STATUS UPDATE 2026-08-04 (hours):** **hours will not be listed on
> the website — Amy's decision closes `{{HOURS}}`** (PR #88). Not a
> pending value anymore: the siteConfig field, LocationCard's
> hide-until-resolved line, and the JSON-LD `openingHours` property are
> removed, so listing hours later is a deliberate re-add. Rendered
> output unchanged (the line never rendered). The 2026-07-25 "hide
> until resolved" mechanism below is history; the parking note is the
> only /visit input still open. DECISIONS 2026-08-04.

> **STATUS UPDATE 2026-08-04 (photos):** **every treatment page now
> carries a photo; Venus Versa renamed Versa Pro** (PR #85, approved
> by Amy on the preview — PR #86 records it). The completeness audit
> found four photo-less pages; the operator supplied the frames:
> laser-treatments gets the Venus Versa Pro console (the photo is the
> factual basis for the rename across summary/FAQ/SEO/body),
> body-contouring gets an Evolve session from Amy's own Reel (the
> burned-in efficacy caption cropped out; §8 covers text inside
> images), hormone-optimization closes with the grey-seamless portrait
> (reuses `amy-palacios-fnp.jpg` — SHA-identical to the operator's
> pick, now on both wellness pages), skin-rejuvenation gets the docked
> PiXel8-RF handpiece (superseding the 2026-07-22 "no PiXel8 assets
> exist" note below). Two supplied frames REJECTED on compliance
> grounds: the PiXel8 settings screen (power/timing and a suggested
> needle depth in mm) and the Biote symptom brochure. Three sources
> are ~450 px — native-max srcset widths, higher-res originals are the
> upgrade path. Laser pricing stays consult-routed
> (`{{VENUS_VERSA_MENU}}` open); `clinicianApproved` still `false` on
> all twelve. DECISIONS 2026-08-04 (two entries).

> **STATUS UPDATE 2026-08-03→04:** **/about rebuilt as a magazine
> profile, approved by Amy** (PRs #83/#84). Five beats — expanded hero
> (family portrait and the keep-list lead byte-identical), a
> Playfair-numeral milestones timeline replacing the facts card, "The
> name on the wall" with the studio-neon portrait (8K0A9862
> published), booking prose, TrustChips on the closing band. Amy's
> approval on the preview resolved the standing 2026-07-19
> career-facts wording flag and accepted the legible neon as a
> reversible brand call. Structural page — no clinicianApproved
> mechanics. DECISIONS 2026-08-03 / 2026-08-04.

> **STATUS UPDATE 2026-08-01 (later):** **peptide cards carry the
> client's definitions** — all nine "What Amy offers" cards step up
> from identity-only lines to the client's supplied wording,
> near-verbatim, under the benefit-language override recorded
> 2026-07-21 as available-if-directed-later (§7.2 amended). Four
> gate-blocked phrases stayed out: "anti-aging" ×2 and "tissue
> healing" (banned regexes) and "libido" (the Biote symptom check).
> Two body passages promising "no promises" trimmed for coherence.
> IV-therapy's Glutathione keeps identity-only wording (recorded
> divergence). `clinicianApproved` still `false` on all twelve.
> DECISIONS 2026-08-01.

> **STATUS UPDATE 2026-08-01:** **regenerative gets its definitions** —
> the last legacy `products` bullet list on a treatment page becomes
> productDetails cards: PRP (tagged Hair) and PRP with Microneedling
> (tagged Skin), the client's definition sentences verbatim under a
> recorded operator override of §7.6's no-outcome-claims rule (hedged
> variants offered and declined; both sentences pass every automated
> gate, so the override is judgment-level). PRP's hair-growth use is
> recorded as operator-confirmed fact and "Who they're generally for"
> now mentions hair. Card prices added the same evening (PRP $600,
> PRP with Microneedling $900 — operator-supplied; pricingDisplay
> stays consult per the biostimulators pattern).
> `clinicianApproved` still `false` on all twelve. DECISIONS 2026-08-01.

> **STATUS UPDATE 2026-07-30 (latest):** **copy texture and
> client-directed wrinkle-relaxers changes** (PRs #72–#73, both
> Amy-approved on preview). The em-dash thinning pass took the
> rendered site from **313 to 71** visible em dashes (25.3 → 5.9 per
> 1,000 words) under a standing rule — structural dashes stay,
> rhetorical dashes budget to one per paragraph — with three items
> deliberately left as Amy's call (the Retatrutide line,
> "Book — or ask first", the "— sound on." captions). Same window,
> client-directed: the concept hero byline reworded verbatim (AKA
> Needle Girlie / owner of Mobile Aesthetics); "temporary/temporarily"
> removed from all six occurrences (all neuromodulator copy — flagged,
> proceeded, §7.3 amended); the three neuromodulator cards narrowed to
> per-unit-only prices (registry + page in one commit); and the Evolus
> ranking sentence now renders as a static noir display plate
> (`EvolusCallout`) on wrinkle-relaxers — and, later the same day on
> Amy's direction, on dermal-fillers too, so both authorized pages
> carry it identically (PR #75). `clinicianApproved` still `false` on
> all twelve. DECISIONS 2026-07-29 and 2026-07-30.

> **STATUS UPDATE 2026-07-27:** **the /services cards are
> raised** (PR #69) — client direction after "they look flat", and the
> flatness turned out to be arithmetic rather than taste: the card fill
> sits BETWEEN the ombre endpoints, so plate and canvas cross equal
> luminance at 19.6% of the document and bottom at **1.001:1** across an
> 8–32% band — a band that contains the Injectables group, the first
> four cards anyone sees. New shared `.ng-lift` (two-layer shadow + a
> 1px lit top facet, a rise on hover/focus, a settle on press), worn
> **only by whole-card links**: the twelve cards and the three
> concept-home category doors. Static boxes stay flat — elevation now
> means "this is clickable", and compliance blocks must never look
> pressable, which deliberately narrows the 2026-07-22 "every box
> matches the /services boxes" direction. An ink-pink shadow was
> measured and rejected (1.24:1 at depth). Amy approved on the stable
> preview; plates stay radius 0 while `.cta` keeps its 2px (operator,
> same day, recorded in the `.ng-lift` header so it is not "tidied"
> later). Also corrected in passing: tokens.css put the luminance
> crossing at "~30% down" — now the computed 19.6%. Colors, contrast
> pairs, copy, and layout untouched; `clinicianApproved` still `false`
> on all twelve. **The BUILD_SPEC §5 amendment recording the elevation
> — the "Raised plates" paragraph — was APPLIED the same day on the
> operator's direct authorization (PR #70).** DECISIONS 2026-07-27.

> **STATUS UPDATE 2026-07-26:** **regenerative gets its PRP plate**
> (PR #66) — the page that carried the least copy in the set (108 body
> words) and no image now opens on a full-column framed plate after
> "What they are". New `.media-band--tall` variant (9:8 display
> contract for vertically composed sources; the band's 16:9 default
> crops a standing clinician's head off). Deliberately scale rather
> than the 18rem tilted print: that print is a snapshot gesture for
> pages carrying three or four photos. `clinicianApproved` stays
> `false` — **Amy's sign-off is the remaining gate on this page.** Two
> operator calls open: the 895 px source is soft at 2× on desktop, and
> the "MobileAesthetics" neon wordmark was kept (the sign-free crop is
> materially worse). DECISIONS 2026-07-26.

> **STATUS UPDATE 2026-07-25 (latest):** **Concept home rebuilt** —
> bright hero (cinema grade retired; the studio neon stays visible per
> operator direction — Amy's own signage), the ombre canvas through
> every middle section, and three category DOORS replacing the
> duplicated 12-card menu; location strip + Meet-Amy block added; two
> photos removed on compliance grounds; italic face retired. Preview
> route only. **C8 flip prerequisites: hero client's release on the
> record, Amy's IG-caption sign-off, {{MEDIA_SCOPE}}.** DECISIONS
> 2026-07-25.

> **STATUS UPDATE 2026-07-25 (later):** **Treatment media recomposed**
> — decorative polaroid captions retired sitewide (13 across 7 pages;
> video attribution captions stay), wrinkle-relaxers' third photo row
> is now a full-width band (`.media-band`). dermal-fillers approval
> RESET (captions-only diff; Amy re-reviews to re-flip). Featured-card
> activation: operator passed — menu stays all-equal. DECISIONS
> 2026-07-25.

> **STATUS UPDATE 2026-07-25:** **Taste-audit polish shipped** — five
> operator-approved adoptions from the read-only taste-skill audit:
> trailing trust-chip middots (the wrap bug), odd-count product-card
> row fill, nav current-page marker (aria-current + pink underline),
> text-wrap orphan control on headings/leads/prose, CTA pressed
> state. Discuss-list items await client/Amy votes; audit report +
> rejected-rule record: DECISIONS 2026-07-25.

> **STATUS UPDATE 2026-07-23 (latest of the day):** **/about portrait
> is now Amy's family** — client-requested swap, shipped on Amy's
> on-record consent covering everyone pictured incl. the minors
> (flagged first; DECISIONS 2026-07-23). Alt text names only Amy.

> **STATUS UPDATE 2026-07-23 (newest):** **The ombre canvas is
> site-wide** — Amy approved the /services trial and directed the
> rollout: every light-surface page now ramps blush → brand pink; the
> construction home and /404 stay noir. Links and outline CTAs join
> the ink re-ink (underline/border-distinguished); in-box links rise
> 4.60 → 11.80. White photo/video mattes kept as framed prints,
> pending client review on the preview. BUILD_SPEC §5 surface
> language amended. Full record: DECISIONS 2026-07-23.

> **STATUS UPDATE 2026-07-23 (latest):** **/services trials the ombre
> canvas** — the white page background becomes a vertical ramp, blush
> `#fdf2f8` to brand pink `#ec4899` (client direction, matched to the
> client's reference image; client picked from four built ramps).
> Trial-scoped via a BaseLayout `ombre` flag; openers/focus ring
> re-ink to ink-900 on ombre pages via new `--ng-kicker` /
> `--ng-rule-accent` tokens. A11y: /services' pa11y entry caps axe's
> cannot-determine-over-gradient class to warnings (operator-approved
> exception, that URL only); hand-computed pairs recorded in
> tokens.css. Site-wide rollout = phase 2, after client approval of
> the trial. DECISIONS 2026-07-23.

> **STATUS UPDATE 2026-07-23 (later):** **/services gains the studio
> strip** — three vetted photos of Amy at work (forehead injectable
> moment, lip-filler close-up, male-client treatment) between the
> intro and the menu; all three pictured clients are release-cleared
> subjects (operator confirmed same-shoot release coverage). Full
> photo survey + exclusions in DECISIONS 2026-07-23.

> **STATUS UPDATE 2026-07-23:** **/services redesigned as a categorized
> editorial menu** (client direction after a competitor comparison):
> three labelled groups — Injectables · Skin & Body · Wellness — cards
> two-across with Playfair index numerals 01–12, Playfair titles, and a
> "More information ›" microline; hover draws an ink-pink rule across the
> card top. Injectables now lead the page (array order = numbering
> order). Pinks and contrast pairs unchanged; +197 bytes CSS, zero JS.
> Direction picked from previewed alternatives — DECISIONS 2026-07-23.

> **STATUS UPDATE 2026-07-22:** **Laser Treatments added — the catalog
> is now twelve lines.** Built from the operator-supplied Venus Versa
> brochures (constraint-8-class, view-only): three applications —
> NanoFractional RF resurfacing, IPL photo-rejuvenation, Multi-Polar
> RF + PEMF — all appearance-hedged, no pricing (menu tracked as
> `{{VENUS_VERSA_MENU}}`, consult-routed). Two operator overrides after
> flags: the /services H1 is now **"Twelve lines. One expert
> clinician."** (adds "expert" to the established pattern), and the
> line is titled **"Laser Treatments"** although the applicators are
> IPL + RF, not laser — the body copy states the physics factually as
> the mitigation. The manufacturer's marketing name for the third
> application is a banned angle and never appears in the repo. Enum,
> grid, and pa11y URL set grew to 12. `clinicianApproved: false` —
> DECISIONS 2026-07-22.

> **STATUS UPDATE 2026-07-22:** **Hormone Optimization built — and the
> FDA disclaimer now actually renders.** The page shipped
> `bioteDisclaimer: true` while `BioteDisclaimer.astro` output the
> literal string `{{BIOTE_FDA_DISCLAIMER}}`, braces visible, directly
> above symptom copy: the one disclosure §7.8 makes mandatory was never
> shown. Resolved with Biote's own brochure wording. **That sentence
> names the four verbs `disease-claims` bans, so hardcoding it failed
> `lint:claims` — the gate was blocking the compliance text.** Fixed via
> the sanctioned route: exact sentence added to `allowedStrings`
> (**fourth authorization**, and the first for text a regulator requires
> rather than copy the client wants); **no pattern was modified**.
> Proved exact — "illness" for "disease" fails, a shortened variant
> fails, the verbs as real copy fail, and a line-wrapped disclaimer
> fails (stripping is per line, so the sentence must stay on one source
> line). Page: three cards (Pellets — Women $450, Pellets — Men $750,
> lab draw unpriced), seven sections including **parallel For women /
> For men** sections ("Who it's generally for" was restructured into a
> universal frame — it had been carrying the female symptoms, making the
> men's section read as an appendix). **"Menopause" is excluded exactly
> as "Low T" is**: neither trips a pattern, but naming a condition the
> pellets are *for* contradicts the disclaimer above it. No imagery
> (§7.8 text-only pending `{{BIOTE_PERMISSION}}`).
> `clinicianApproved: false` — DECISIONS 2026-07-22.

> **STATUS UPDATE 2026-07-22:** **IV Therapy & Vitamin Support built.**
> Scope taken from Amy's live Vagaro menu (IV category = **NAD,
> Immunity boost, Myers cocktail**) plus the two vitamin shots named in
> §7.7. **Five cards** grouped by `tag` into IV infusion (3) and Shot
> (2). Prices shown only where verified — **Myers' $125**, **Immunity
> IV $125**, **NAD IV $200**, **Glutathione $25 per shot** (carried
> unchanged from peptide-therapy); **only Vitamin B12 carries no price
> line**, rather than an invented one. The operator-supplied `scans/peptides` cards are
> **constraint-8 internal product cards** (reconstitution, dosing,
> duration) whose Glutathione "Uses" text runs into chemotherapy /
> Alzheimer's / Parkinson's language — §7.7's named absolute — so card
> copy states what each substance **is**, never what it does. **The
> quoted half passes `lint:claims` cleanly**: this was a judgment
> exclusion, not a gate catch. `pricingDisplay` **consult → none** (the
> `consult` line contradicts a book-direct page with fixed prices);
> `ctaType` stays **`book`** per the §6 route table. Adds
> `studio-wide.jpg`. `clinicianApproved: false` — DECISIONS 2026-07-22.

> **STATUS UPDATE 2026-07-22:** **Body Contouring built on Evolve.**
> Scoped from Amy's live Vagaro menu, which lists the category
> **Evolve** with one service beneath it: **"Tighten and tone"** —
> InMode's Tite (bipolar RF → skin) and Tone (EMS → muscle), **not**
> Trim (RF + vacuum → adipose). Competitor copy supplied with the
> request ("destroy fat… surgery-like results") was rejected on
> **accuracy first** — it advertises a service Amy does not offer —
> and BUILD_SPEC §7.11 second; **no override sought**. Two cards for
> the two ways it sells: a course of six ($1,500) and a single session
> ($275) — count-keyed, so `banned-patterns.json` was untouched.
> Placement areas and ~30–60 min sessions named per operator decision
> (the first session length stated on the site). Ships **without
> imagery** (operator decision — nothing in the library depicts Evolve
> or the room, and body imagery here reads as a before/after
> implication). `clinicianApproved: false` — DECISIONS 2026-07-22.

> **STATUS UPDATE 2026-07-22:** **Skin Rejuvenation rebuilt** to the
> card standard — PiXel8-RF (Rohrer, FDA-cleared, 4 MHz RF
> microneedling; bare $1,500 per operator decision) + medical-grade
> chemical peels (Starting at $180) as a **compliant placeholder**:
> the peel menu is tracked open as `{{CHEMICAL_PEELS_MENU}}` (§17) and
> the section deepens when Amy supplies it. No photo yet (operator
> decision — no PiXel8 assets exist). Prose-only page, no media, no
> gate changes; both price strings pass lint:claims untouched.
> `clinicianApproved: false` — DECISIONS 2026-07-22.

> **STATUS UPDATE 2026-07-21:** the weight-loss page's Retatrutide
> disclosure consolidated to a single calm notice line (Amy's
> direction after the compliance flag; new `investigationalNote`
> schema field — DECISIONS 2026-07-21). Same day: the page switched
> to direct booking — ctaType: book, consultation-first copy aligned —
> and the operator then retired the /book double-hop SITEWIDE: every
> "Book with Amy" button opens Vagaro directly — and **/book is
> RETIRED** (deleted before ever serving in production; gate lists
> synced to 22 pa11y / 6 Lighthouse URLs; its checklist entry below is
> historical). Operator direction; BUILD_SPEC §6/§7 amended —
> DECISIONS 2026-07-21. Everything else below stands.

> **STATUS UPDATE 2026-07-20 (evening) — polish increments merged to
> `phase-c` (PRs #19–#25), all deployed to the stable preview:**
>
> - **Retatrutide badge off / Phentermine wording / client weigh-in
>   photo** (PR #19) and the **framed-print media-row** presentation
>   (PR #20) — DECISIONS 2026-07-20.
> - **Editorial deck card replaces AtAGlance** on all eleven treatment
>   pages (PR #21): optional `deck` frontmatter renders a blush
>   statement card; /book keeps the fact card by design.
> - **Amy's portrait on the weight-loss page** (PR #22): first
>   Amy-solo frame (8K0A0206) as a mirrored framed print
>   (`.media-row--flip`, reusable). The operator-requested tray frame
>   (8K0A9740) was rejected as non-compliant; full pro-shoot survey
>   recorded in DECISIONS. Skinbetter frames 8K0A9881/9922 noted for
>   the Skincare page.
> - **All conversion buttons now read "Book with Amy"** (PR #23,
>   operator directive) — consult variant keeps `/book` + outline;
>   §6 convention still governs prose (BUILD_SPEC §6 amended).
> - **Trust-chip credential corrected** to "Licensed family nurse
>   practitioner" (PR #24, Amy's direction).
> - **Price tiers reformatted** to "20mg vial: $675" style (PR #25,
>   client direction) — like-for-like swap of the five registry
>   allowlist strings; gate self-test unchanged in mechanism.
> - Everything treatment-facing remains `clinicianApproved: false`
>   pending Amy's sign-off. **C8 still gated** on operator + Amy
>   approving the concept home on the stable preview.

> **STATUS UPDATE 2026-07-19 — C0–C7 MERGED; only C8 remains:**
>
> - Built, verified, and merged to `phase-c` (PRs #6–#12): `/book` (with
>   the operator-picked 8K0A1011 portrait), `/visit`, branded `/404`,
>   the treatment machinery (collection route, `faq` schema field —
>   operator-approved, JSON-LD, shop CTA), **all nine treatment drafts**
>   (every one `clinicianApproved: false` with a visible DraftBanner),
>   `/services`, `/about`, and the legal trio (counsel-review banners).
> - **`{{AMY_BIO}}` RESOLVED** (operator-supplied provider-directory
>   listing; Amy's wording confirmation pending on the preview).
> - **Perf gate rearchitected** (PR #13, operator-approved): byte-exact
>   resource budgets (third-party = 0 now CI-enforced) + median-of-3
>   metrics + escalation rule — DECISIONS 2026-07-19.
> - **Vagaro service alignment merged** (PR #16, 2026-07-19): the catalog
>   is now **eleven lines** — skin-rejuvenation and body-contouring added
>   from the live Vagaro menu; `{{NEUROMOD_LIST}}` RESOLVED (Jeuveau,
>   Xeomin, Daxxify); weight loss broadened (Retatrutide behind the
>   named investigational notice); regenerative trimmed to PRP /
>   PRP-with-microneedling pending Amy's confirmation of the rest.
> - **GLP-1 product cards merged** (2026-07-20): the weight-loss page
>   carries per-product cards (receptor-class facts + the five mg-keyed
>   price tiers — operator override of the mg ban, scoped to exact
>   registry allowlist strings; DECISIONS 2026-07-20). `productDetails`
>   + `ProductDetailCards` are reusable for the pending Peptides work.
> - **Wrinkle Relaxers rebuilt (2026-07-21):** per-product cards
>   (Jeuveau / Xeomin / Daxxify) with the sheet's per-unit pricing
>   verbatim (second scoped constraint-3 override — DECISIONS
>   2026-07-21), three released studio frames as media rows, and the
>   C5 naming flag RESOLVED: operator picked "Wrinkle Relaxers"; the
>   grid card now matches the page.
> - **C8 (real home from ConceptHome.astro; deletes the legacy keyframe
>   fence) is gated on operator + Amy approving the concept on the
>   stable preview.** The concept was REBUILT 2026-07-25 (PR #62) to the
>   version under review. Three hard prerequisites before the flip, all
>   operator/Amy inputs: (1) the hero client's release confirmed on the
>   record for THAT frame — the log never covers it — or a frame swap;
>   (2) Amy's sign-off on the Instagram post caption (its baked-in text
>   is invisible to both linters; the slot takes any post she prefers);
>   (3) `{{MEDIA_SCOPE}}`. The flip PR also owns: rebuilding
>   `index.astro`, deleting the `ng-ignite`/`ng-hum` fence with its only
>   consumer, retiring the concept route, syncing both gate URL lists,
>   and adding the per-URL needs-review cap to `/` in `.pa11yci.json`
>   (an operator-gated change — it must be asked for explicitly).
> - Still open from §0: `{{HOURS}}`, parking note, `{{SKINBETTER_URL}}`,
>   `{{PEPTIDES_PUBLIC_LIST}}`, featured service lines,
>   Biote/Retatrutide/Evolus/media items, photo flags (releases, neon,
>   Evolus scrubs), Amy's caption + bio-wording sign-offs.
>   (`{{NEUROMOD_LIST}}` came off this list 2026-07-19 — PR #16.)

> **STATUS UPDATE 2026-07-18 (read before executing this checklist —
> several items below are superseded; DECISIONS.md 2026-07-18 governs):**
>
> - The **"serious glamour" pivot + photography-led concept** (PR #4,
>   `/styleguide/concept`) supersede this file's home-page sketch: the
>   real home page is built from the concept, not the "two seams"
>   composition below. AMENDED 2026-07-25 (PR #62): the concept itself
>   was rebuilt — the cinema-graded hero is now a BRIGHT hero, the
>   middle sections are transparent so the ombre canvas carries them,
>   and the duplicated 12-card menu became three category doors. The
>   framed Instagram post and the noir closing bookend remain.
> - **The chevron motif is retired from the UI** — ignore every "seam" /
>   "ChevronRun" reference below; the section-opener signature is
>   eyebrow + rule-accent.
> - **Consultations are optional and free** (operator) — the
>   "consultation-first" framing below is retired; suitability routing
>   to consultation (§8.7) is unchanged.
> - **Book CTAs read "Book with Amy"**; the header "Book" links straight
>   to Vagaro; /book remains the consultation-routing page.
> - **Resolved from the §0 table:** `{{VAGARO_URL}}`,
>   `{{ADDRESS_DISPLAY}}`, `{{SOCIAL_LINKS}}` (FB/IG/Yelp — §9
>   shared-location flag recorded), and the hero promise ("Medical
>   aesthetics, made personal." — confirmed). Still open: `{{HOURS}}`,
>   `{{AMY_BIO}}`, `{{SKINBETTER_URL}}`, `{{PEPTIDES_PUBLIC_LIST}}`,
>   `{{NEUROMOD_LIST}}`, Biote/Retatrutide/Evolus/media items, featured
>   service lines.
> - **New a11y build rules for photo-led pages** (from the concept
>   build): text over photos needs opaque plates; no pseudo-element or
>   SVG-text decorations near audited text; noir is declared per
>   section, never on body; the claims linter scans code comments.
>
> BUILD_SPEC §18: "all §6 pages; treatment copy drafted from §7 briefs (all
> `clinicianApproved: false`, DraftBanners visible); legal-page drafts;
> integrations wired with placeholders."
>
> Entry state: Phase A + B merged and in production (2026-07-08). Design
> system, TreatmentLayout with fixed compliance order, all gates
> (`lint:claims`, `lint:voice`, approvals, a11y, Lighthouse) live.
> Process rule from Phase B: **visual changes ship to a preview first;
> production moves only after the operator/Amy have seen them.**

## 0. Operator inputs — needed before or during Phase C

Batched per CLAUDE.md ("one sharp question beats five vague ones"). Copy
can be drafted with tokens in place, but pages cannot leave draft without
these. From the §17 registry:

| Token / decision | Blocks | Who |
|---|---|---|
| `{{VAGARO_URL}}` (Amy's OWN link, not the shared location handle) | /book, every book CTA | Operator |
| `{{ADDRESS_DISPLAY}}`, ~~`{{HOURS}}`~~ | /visit, footer NAP, JSON-LD | Operator — **HOURS CLOSED 2026-08-04: Amy does not list hours on the site (field/line/JSON-LD property removed)** |
| `{{AMY_BIO}}` (approved bio facts & credentials) | /about, Meet-Amy block | Operator + Amy |
| `{{SOCIAL_LINKS}}` (verified handles) | footer, JSON-LD sameAs | Operator |
| `{{SKINBETTER_URL}}` (partner storefront) | /services/skincare | Operator |
| `{{PEPTIDES_PUBLIC_LIST}}` (candidates: Glow Stack, GHK-Cu, NAD) | peptide-therapy page | Operator + Amy |
| `{{NEUROMOD_LIST}}` (confirm: Jeuveau, Daxxify — sources disagree) | wrinkle-relaxers page | Operator + Amy |
| `{{PRICING_DISPLAY_MODE}}` (default 'consult') | all treatment pages | Operator |
| ~~`{{BIOTE_FDA_DISCLAIMER}}` (Biote's exact required wording)~~ | ~~hormone-optimization page~~ | **RESOLVED 2026-07-22** — Biote's own brochure wording; exact sentence in `allowedStrings` (fourth authorization) |
| `{{BIOTE_PERMISSION}}` (logo/co-marketing) | text-only until resolved | Operator |
| `{{RETATRUTIDE_COUNSEL}}` (attorney wording) | publishing Retatrutide at all | Operator + counsel |
| `{{EVOLUS_CLAIM}}` (substantiation) | /about Evolus mention; "#1" stays banned until resolved | Operator |
| `{{VAGARO_SERVICE_LINKS}}` (optional deep links) | nicer per-page CTAs | Operator |
| `{{MEDIA_SCOPE}}` (photos/video on site?) | page imagery decisions | Operator + Amy |
| Hero promise line — confirm **"Medical aesthetics, made personal."** | / (home) | Amy |
| Featured service lines (which 2–3 lead the home grid) | / (home) | Amy (business decision) |

## 1. Pages to build (§6 sitemap)

Structural pages (no clinician gate, but claim + voice rules apply to
every string):

- [x] `/` — Home: **SHIPPED 2026-08-04 (C8 flip)** — index.astro renders
      ConceptHome (the client-approved Neon Editorial): noir hero (Amy
      mid-treatment, release operator-confirmed), canvas Meet-Amy,
      three category doors (the 2026-07-25 amendment replaced the
      ServiceLineGrid reprint — the home ROUTES), visit + LocationCard,
      framed IG post (caption Amy-signed), noir close. Construction
      placeholder + legacy keyframes retired.
- [x] `/services` — index: short factual intro per line → 12 detail
      links (9 at C5; grew with PR #16, +laser 2026-07-22). Card colors client-picked
      2026-07-22: rest `#f4cae2`, highlight `#efb1d5` + ink-pink
      ring/titles (DECISIONS same date). RAISED 2026-07-27 (`.ng-lift`)
      — colors and every contrast pair unchanged; corners stay square.
- [x] `/about` — Amy's story + credentials from `{{AMY_BIO}}`; factual
      note that she practices within a multi-provider location (hard
      constraint 2 — nothing more); Evolus relationship only per
      `{{EVOLUS_CLAIM}}`. Candidate design: founder split-card (Mobbin
      parking lot, Kalstore pattern). CTA: consult-routed (label is
      "Book with Amy" sitewide since 2026-07-20).
- [x] `/book` — built in C1, RETIRED 2026-07-21 (operator): every
      "Book with Amy" opens Vagaro directly, so the handoff explainer
      page was deleted before production ever served it.
- [x] `/visit` — `{{ADDRESS_DISPLAY}}`, parking note,
      Get-directions link-out (never an embedded map). `{{HOURS}}`
      CLOSED 2026-08-04: hours are not listed on the site — Amy.
- [x] `/privacy`, `/terms`, `/medical-disclaimer` — legal DRAFTS, clearly
      marked "draft pending counsel review". (Footer already links these
      routes.)
- [x] `/404` — branded (currently minimal), routes home/book. (§18 puts
      404 polish in Phase D; create the branded version whenever cheap.)

Treatment pages — 12 content files in `src/content/treatments/` rendered
through TreatmentLayout (schema already in `src/content.config.ts`;
`clinicianApproved: false` on ALL TWELVE as of 2026-07-25, with the
DraftBanner visible on each until it flips — dermal-fillers was approved
2026-07-21 and RESET by the caption sweep four days later, so no page is
currently through the clinician gate):

- [x] `weight-loss-glp-1` — Semaglutide, Tirzepatide (+ Retatrutide ONLY
      per `{{RETATRUTIDE_COUNSEL}}`; if published: `investigational: true`,
      factual naming, zero benefit language). ctaType: consult.
- [x] `peptide-therapy` — publish only `{{PEPTIDES_PUBLIC_LIST}}`
      (resolved 2026-07-21: the nine-item menu). Card definitions
      upgraded 2026-08-01 to the client's wording near-verbatim under
      a recorded override of the no-benefit-claims rule; gate-blocked
      vocabulary (anti-aging, healing, libido) excluded — DECISIONS
      2026-08-01. ctaType: book (since 2026-07-21).
- [x] `wrinkle-relaxers` — `{{NEUROMOD_LIST}}`; treatment areas factually
      (forehead, frown lines, crow's feet). ctaType: book/consult.
- [x] `dermal-fillers` — approved 2026-07-21 (the first page ever
      through the gate), then RESET to `clinicianApproved: false` on
      2026-07-25 when the caption sweep edited approved content
      (constraint 4). Amy re-reviews a captions-only diff to re-flip.
      Rebuilt 2026-07-21: Evolysse Smooth/Form and
      Revanesse (Versa+ & Lips+) cards with syringe pricing, the Evolus
      film (the site's first video, operator-overridden as-is), lip style
      guide, weight-loss cross-link. ctaType: book.
- [x] `biostimulators` — PDO Threads, Radiesse; category described
      factually, no lifting-results promises. ctaType: consult.
- [x] `regenerative` — PRP and PRP with microneedling (trimmed to the
      live Vagaro menu 2026-07-19; PRF/PDRN/Illuma/VAMP/Rejuran return
      only if Amy confirms them). Definition cards added 2026-08-01 —
      PRP (Hair, "for stimulating hair growth") and PRP with
      Microneedling (Skin), client wording verbatim under a recorded
      §7.6 override; prices added the same evening (PRP $600, PRP
      with Microneedling $900 — operator-supplied, bare per the
      PiXel8 precedent). ctaType: consult.
- [x] `skin-rejuvenation` *(added 2026-07-19, Vagaro alignment)* —
      PiXel8-RF microneedling + medical-grade chemical peels. Factual
      device/procedure descriptions only; no resurfacing/anti-aging
      outcome claims. Peel menu tracked open as
      `{{CHEMICAL_PEELS_MENU}}`. ctaType: consult.
- [x] `body-contouring` *(added 2026-07-19, Vagaro alignment)* — Evolve,
      scoped to **tighten and tone** per Amy's Vagaro menu (InMode Tite +
      Tone; **not** Trim). Describe by intended design only — never as
      outcomes, and **no body-fat or measurement language of any kind**
      (§7.11). ctaType: consult.
- [x] `laser-treatments` *(added 2026-07-22, Venus Versa; renamed
      **Venus Versa Pro** 2026-08-04 on the operator's console photo,
      Amy-approved)* — three
      applications, appearance-hedged, mechanism as design intent:
      NanoFractional RF resurfacing, IPL photo-rejuvenation
      (FDA-cleared stated as the accurate device term, no indication
      lists), Multi-Polar RF + PEMF. The manufacturer's marketing name
      for the third application is a banned angle — never in the repo.
      No session counts or intervals, no downtime/results promises, no
      prices (menu tracked as `{{VENUS_VERSA_MENU}}`). The line title
      is the operator's naming choice (the applicators are IPL + RF,
      not laser — physics stated factually in copy, §7.12).
      ctaType: consult.
- [x] `iv-therapy` — Myers' Cocktail, Immunity IV, vitamin shots,
      Glutathione, B12, NAD IV. **Glutathione: no disease claims in any
      form; "Immunity IV" is a product name — never extend it into immune
      benefits.** ctaType: book. Built 2026-07-22 from the live Vagaro
      menu: five cards tagged **IV infusion** / **Shot**; identity-only
      copy (what each substance *is*, never what it does); prices only
      where verified (Myers' $125, Immunity IV $125, NAD IV $200,
      Glutathione $25 per shot — **only B12 left blank**, still open).
      Immunity IV's ingredients are named as composition only; the
      product-name rule above is unaffected. `pricingDisplay: none`,
      since the `consult` line contradicts a book-direct page with fixed
      prices. Glutathione and NAD prices are **duplicated in
      `peptide-therapy.mdx` and must move together**.
- [x] `hormone-optimization` — Biote BHRT; symptom-awareness framing ONLY
      with `bioteDisclaimer: true` (layout injects `{{BIOTE_FDA_DISCLAIMER}}`);
      text-only re: Biote branding until `{{BIOTE_PERMISSION}}`.
      ctaType: consult. Built 2026-07-22 from the Vagaro menu
      (Hormones/Biote = lab draw, Pellets) plus the operator-supplied
      Biote source. **The disclaimer had been rendering as a visible
      `{{BIOTE_FDA_DISCLAIMER}}` placeholder** — resolved in the same PR,
      which is what made the symptom-awareness permission usable at all.
      Three cards: Pellets — Women $450, Pellets — Men $750, Hormone lab
      draw ($125 — operator-supplied 2026-08-01; previously unpriced).
      **Parallel For women / For men sections** per
      operator decision — "Who it's generally for" was restructured into
      a universal frame rather than having a women's section appended
      under it. Symptom vocabulary is in play here **and nowhere else**;
      disease names and Biote's post-procedure interval material stay out
      regardless of the disclaimer, and **condition names are out too**
      ("menopause" and "Low T" both trip no pattern, but naming what the
      pellets are *for* contradicts the disclaimer above them).
- [x] `skincare` — Skinbetter Science overview + storefront link-out
      (`{{SKINBETTER_URL}}`, new tab). ctaType: shop.

Copy pattern for every treatment page (§7): *what it is → who it's
generally for (factual) → individualized under clinician supervision →
CTA*. Optional per-page FAQ items may be drafted (FaqAccordion is built);
they ride the same clinician-approval gate as the rest of the page.

## 2. Integrations to wire (§9 — all outbound, tokens until resolved)

- [x] Vagaro booking CTA target (`{{VAGARO_URL}}`; per-service deep links
      if `{{VAGARO_SERVICE_LINKS}}` provided)
- [x] Skinbetter storefront link-out (wired; token renders until resolved)
- [x] Social links in footer (`{{SOCIAL_LINKS}}`)
- [x] Directions link-outs (LocationCard exists — reuse)
- [x] Get-the-App remains `enabled: false` (no store badges before real
      links — badge guidelines)
- [x] `data-event` attributes on all outbound CTAs (already the CTAButton
      pattern; the analytics script itself is Phase D)

## 3. SEO in Phase C (foundation only — hardening is Phase D)

- [x] Unique per-page `<title>` (pattern:
      `{Treatment} in Harrisburg & Charlotte, NC | Needle Girlie`) and
      claim-clean meta description via SeoHead (exists)
- [x] Wire `service()` + `breadcrumbList()` JSON-LD builders
      (`src/lib/schema.ts` — already built, unused) into TreatmentLayout
- [x] Local-intent mention (Harrisburg/Charlotte) once or twice per
      treatment page — natural, no stuffing
- [ ] Deferred to Phase D: OG images, FAQPage JSON-LD, robots.txt polish,
      analytics script

## 4. Gates & process (every increment)

- Work on a feature branch → PR → preview (public + noindexed; share once the
  deploy completes) → operator + Amy review → merge on explicit approval.
  **No straight-to-production.**
- Treatment-page content changes get their OWN commits (clinician audit
  trail); one content file per commit.
- Add each new page to `.pa11yci.json` and `lighthouserc.json` as it's
  created (the gates enumerate URLs — they do not discover pages).
- `npm run verify` green per unit of work; `lint:voice` guards the
  Amy-singular voice; never set `clinicianApproved: true` (operator only).
- Previews are blanket-noindexed (SeoHead) — §7's draft-noindex
  requirement is already satisfied.

## 5. Definition of done for Phase C

Every §6 page exists and renders through the design system; all 12
treatment drafts complete against their §7 briefs with correct flags;
legal drafts marked; integrations wired (tokens visible where unresolved);
gates green; preview reviewed by operator + Amy. Production deploy will
still (correctly) FAIL on `check:approvals` until the operator flips
approvals — that is Phase E's exit, not Phase C's.

## Out of scope (later phases)

Phase D: analytics events live, OG images, full SEO/a11y/perf hardening
passes. Phase E: placeholder resolution sweep, approval flips after Amy's
sign-off, §16 launch checklist, WAF decision, runbook handoff.
