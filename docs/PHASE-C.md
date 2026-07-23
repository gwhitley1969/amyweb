# Phase C — Pages & content drafts (working checklist)

> **STATUS UPDATE 2026-07-23:** **/services redesigned as a categorized
> editorial menu** (client direction after a competitor comparison):
> three labelled groups — Injectables · Skin & Body · Wellness — cards
> two-across with Playfair index numerals 01–12, Playfair titles, and a
> "See the line ›" microline; hover draws an ink-pink rule across the
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
>   stable preview.**
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
>   real home page is built from the concept (cinema hero, editorial
>   sections, framed Instagram post, framed noir closing), not the
>   "two seams" composition below.
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
| `{{ADDRESS_DISPLAY}}`, `{{HOURS}}` | /visit, footer NAP, JSON-LD | Operator |
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

- [ ] `/` — Home: Hero (lockup + confirmed promise + Book CTA), "Meet Amy"
      trust block (FNP, since 2017, Biote-certified — facts from
      `{{AMY_BIO}}`), ServiceLineGrid (12 lines — 11 since PR #16,
      +laser 2026-07-22; featured variant per Amy's pick), location
      strip (NAP + directions link-out), Get-the-App slot
      (flag stays off), closing noir CTA band. Two seams max (design rule).
- [x] `/services` — index: short factual intro per line → 12 detail
      links (9 at C5; grew with PR #16, +laser 2026-07-22). Card colors client-picked
      2026-07-22: rest `#f4cae2`, highlight `#efb1d5` + ink-pink
      ring/titles (DECISIONS same date).
- [x] `/about` — Amy's story + credentials from `{{AMY_BIO}}`; factual
      note that she practices within a multi-provider location (hard
      constraint 2 — nothing more); Evolus relationship only per
      `{{EVOLUS_CLAIM}}`. Candidate design: founder split-card (Mobbin
      parking lot, Kalstore pattern). CTA: consult-routed (label is
      "Book with Amy" sitewide since 2026-07-20).
- [x] `/book` — built in C1, RETIRED 2026-07-21 (operator): every
      "Book with Amy" opens Vagaro directly, so the handoff explainer
      page was deleted before production ever served it.
- [x] `/visit` — `{{ADDRESS_DISPLAY}}`, `{{HOURS}}`, parking note,
      Get-directions link-out (never an embedded map).
- [x] `/privacy`, `/terms`, `/medical-disclaimer` — legal DRAFTS, clearly
      marked "draft pending counsel review". (Footer already links these
      routes.)
- [x] `/404` — branded (currently minimal), routes home/book. (§18 puts
      404 polish in Phase D; create the branded version whenever cheap.)

Treatment pages — 12 content files in `src/content/treatments/` rendered
through TreatmentLayout (schema already in `src/content.config.ts`;
`clinicianApproved: false` on all of them except dermal-fillers —
approved 2026-07-21 — with the DraftBanner visible until each flips):

- [x] `weight-loss-glp-1` — Semaglutide, Tirzepatide (+ Retatrutide ONLY
      per `{{RETATRUTIDE_COUNSEL}}`; if published: `investigational: true`,
      factual naming, zero benefit language). ctaType: consult.
- [x] `peptide-therapy` — publish only `{{PEPTIDES_PUBLIC_LIST}}`. No
      recovery/healing/anti-aging/performance claims. ctaType: consult.
- [x] `wrinkle-relaxers` — `{{NEUROMOD_LIST}}`; treatment areas factually
      (forehead, frown lines, crow's feet). ctaType: book/consult.
- [x] `dermal-fillers` — CLINICIAN-APPROVED 2026-07-21 (first page
      through the gate). Rebuilt 2026-07-21: Evolysse Smooth/Form and
      Revanesse (Versa+ & Lips+) cards with syringe pricing, the Evolus
      film (the site's first video, operator-overridden as-is), lip style
      guide, weight-loss cross-link. ctaType: book.
- [x] `biostimulators` — PDO Threads, Radiesse; category described
      factually, no lifting-results promises. ctaType: consult.
- [x] `regenerative` — PRP & PRF, PDRN, Illuma/VAMP/Rejuran; what they
      are, no healing/repair outcomes. ctaType: consult.
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
- [x] `laser-treatments` *(added 2026-07-22, Venus Versa)* — three
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
      draw (no price). **Parallel For women / For men sections** per
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

- Work on a feature branch → PR → password-protected preview → operator +
  Amy review → merge on explicit approval. **No straight-to-production.**
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
