# Changelog — needlegirlie.com

Human-readable record of what shipped, newest first. The *why* behind each
change lives in `docs/DECISIONS.md`; design specs live in
`docs/superpowers/specs/`. Commit hashes are the audit trail.

## Phase C — pages & content drafts (`phase-c`)

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
