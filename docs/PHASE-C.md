# Phase C — Pages & content drafts (working checklist)

> **STATUS UPDATE 2026-07-21:** the weight-loss page's Retatrutide
> disclosure consolidated to a single calm notice line (Amy's
> direction after the compliance flag; new `investigationalNote`
> schema field — DECISIONS 2026-07-21). Same day: the page switched
> to direct booking — ctaType: book, consultation-first copy aligned
> (operator direction; BUILD_SPEC §6/§7 amended — DECISIONS
> 2026-07-21). Everything else below stands.

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
> - **C8 (real home from ConceptHome.astro; deletes the legacy keyframe
>   fence) is gated on operator + Amy approving the concept on the
>   stable preview.** Open flag from C5: the services-grid card says
>   "Neuromodulators", its page says "Wrinkle Relaxers" — operator picks
>   which name wins.
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
| `{{BIOTE_FDA_DISCLAIMER}}` (Biote's exact required wording) | hormone-optimization page | Operator |
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
      `{{AMY_BIO}}`), ServiceLineGrid (11 lines since PR #16; featured
      variant per Amy's pick), location strip (NAP + directions link-out), Get-the-App slot
      (flag stays off), closing noir CTA band. Two seams max (design rule).
- [x] `/services` — index: short factual intro per line → 11 detail
      links (9 at C5; grew with PR #16).
- [x] `/about` — Amy's story + credentials from `{{AMY_BIO}}`; factual
      note that she practices within a multi-provider location (hard
      constraint 2 — nothing more); Evolus relationship only per
      `{{EVOLUS_CLAIM}}`. Candidate design: founder split-card (Mobbin
      parking lot, Kalstore pattern). CTA: consult-routed (label is
      "Book with Amy" sitewide since 2026-07-20).
- [x] `/book` — Vagaro handoff explanation + button (`{{VAGARO_URL}}`,
      new tab, noopener), phone fallback. CTA language: "appointment".
- [x] `/visit` — `{{ADDRESS_DISPLAY}}`, `{{HOURS}}`, parking note,
      Get-directions link-out (never an embedded map).
- [x] `/privacy`, `/terms`, `/medical-disclaimer` — legal DRAFTS, clearly
      marked "draft pending counsel review". (Footer already links these
      routes.)
- [x] `/404` — branded (currently minimal), routes home/book. (§18 puts
      404 polish in Phase D; create the branded version whenever cheap.)

Treatment pages — 9 content files in `src/content/treatments/` rendered
through TreatmentLayout (schema already in `src/content.config.ts`;
`clinicianApproved: false` on ALL of them, DraftBanner visible):

- [x] `weight-loss-glp-1` — Semaglutide, Tirzepatide (+ Retatrutide ONLY
      per `{{RETATRUTIDE_COUNSEL}}`; if published: `investigational: true`,
      factual naming, zero benefit language). ctaType: consult.
- [x] `peptide-therapy` — publish only `{{PEPTIDES_PUBLIC_LIST}}`. No
      recovery/healing/anti-aging/performance claims. ctaType: consult.
- [x] `wrinkle-relaxers` — `{{NEUROMOD_LIST}}`; treatment areas factually
      (forehead, frown lines, crow's feet). ctaType: book/consult.
- [x] `dermal-fillers` — Revanesse Versa, Evolus Evolysse; areas factually
      (lips, cheeks, jawline, chin, under-eyes). ctaType: book/consult.
- [x] `biostimulators` — PDO Threads, Radiesse; category described
      factually, no lifting-results promises. ctaType: consult.
- [x] `regenerative` — PRP & PRF, PDRN, Illuma/VAMP/Rejuran; what they
      are, no healing/repair outcomes. ctaType: consult.
- [x] `iv-therapy` — Myers' Cocktail, Immunity IV, vitamin shots,
      Glutathione, B12, NAD IV. **Glutathione: no disease claims in any
      form; "Immunity IV" is a product name — never extend it into immune
      benefits.** ctaType: book.
- [x] `hormone-optimization` — Biote BHRT; symptom-awareness framing ONLY
      with `bioteDisclaimer: true` (layout injects `{{BIOTE_FDA_DISCLAIMER}}`);
      text-only re: Biote branding until `{{BIOTE_PERMISSION}}`.
      ctaType: consult.
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

Every §6 page exists and renders through the design system; all 9
treatment drafts complete against their §7 briefs with correct flags;
legal drafts marked; integrations wired (tokens visible where unresolved);
gates green; preview reviewed by operator + Amy. Production deploy will
still (correctly) FAIL on `check:approvals` until the operator flips
approvals — that is Phase E's exit, not Phase C's.

## Out of scope (later phases)

Phase D: analytics events live, OG images, full SEO/a11y/perf hardening
passes. Phase E: placeholder resolution sweep, approval flips after Amy's
sign-off, §16 launch checklist, WAF decision, runbook handoff.
