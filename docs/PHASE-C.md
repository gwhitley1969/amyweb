# Phase C — Pages & content drafts (working checklist)

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
      `{{AMY_BIO}}`), ServiceLineGrid (9 lines; featured variant per Amy's
      pick), location strip (NAP + directions link-out), Get-the-App slot
      (flag stays off), closing noir CTA band. Two seams max (design rule).
- [ ] `/services` — index: short factual intro per line → 9 detail links.
- [ ] `/about` — Amy's story + credentials from `{{AMY_BIO}}`; factual
      note that she practices within a multi-provider location (hard
      constraint 2 — nothing more); Evolus relationship only per
      `{{EVOLUS_CLAIM}}`. Candidate design: founder split-card (Mobbin
      parking lot, Kalstore pattern). CTA: Request a consultation.
- [ ] `/book` — Vagaro handoff explanation + button (`{{VAGARO_URL}}`,
      new tab, noopener), phone fallback. CTA language: "appointment".
- [ ] `/visit` — `{{ADDRESS_DISPLAY}}`, `{{HOURS}}`, parking note,
      Get-directions link-out (never an embedded map).
- [ ] `/privacy`, `/terms`, `/medical-disclaimer` — legal DRAFTS, clearly
      marked "draft pending counsel review". (Footer already links these
      routes.)
- [ ] `/404` — branded (currently minimal), routes home/book. (§18 puts
      404 polish in Phase D; create the branded version whenever cheap.)

Treatment pages — 9 content files in `src/content/treatments/` rendered
through TreatmentLayout (schema already in `src/content.config.ts`;
`clinicianApproved: false` on ALL of them, DraftBanner visible):

- [ ] `weight-loss-glp-1` — Semaglutide, Tirzepatide (+ Retatrutide ONLY
      per `{{RETATRUTIDE_COUNSEL}}`; if published: `investigational: true`,
      factual naming, zero benefit language). ctaType: consult.
- [ ] `peptide-therapy` — publish only `{{PEPTIDES_PUBLIC_LIST}}`. No
      recovery/healing/anti-aging/performance claims. ctaType: consult.
- [ ] `wrinkle-relaxers` — `{{NEUROMOD_LIST}}`; treatment areas factually
      (forehead, frown lines, crow's feet). ctaType: book/consult.
- [ ] `dermal-fillers` — Revanesse Versa, Evolus Evolysse; areas factually
      (lips, cheeks, jawline, chin, under-eyes). ctaType: book/consult.
- [ ] `biostimulators` — PDO Threads, Radiesse; category described
      factually, no lifting-results promises. ctaType: consult.
- [ ] `regenerative` — PRP & PRF, PDRN, Illuma/VAMP/Rejuran; what they
      are, no healing/repair outcomes. ctaType: consult.
- [ ] `iv-therapy` — Myers' Cocktail, Immunity IV, vitamin shots,
      Glutathione, B12, NAD IV. **Glutathione: no disease claims in any
      form; "Immunity IV" is a product name — never extend it into immune
      benefits.** ctaType: book.
- [ ] `hormone-optimization` — Biote BHRT; symptom-awareness framing ONLY
      with `bioteDisclaimer: true` (layout injects `{{BIOTE_FDA_DISCLAIMER}}`);
      text-only re: Biote branding until `{{BIOTE_PERMISSION}}`.
      ctaType: consult.
- [ ] `skincare` — Skinbetter Science overview + storefront link-out
      (`{{SKINBETTER_URL}}`, new tab). ctaType: shop.

Copy pattern for every treatment page (§7): *what it is → who it's
generally for (factual) → individualized under clinician supervision →
CTA*. Optional per-page FAQ items may be drafted (FaqAccordion is built);
they ride the same clinician-approval gate as the rest of the page.

## 2. Integrations to wire (§9 — all outbound, tokens until resolved)

- [ ] Vagaro booking CTA target (`{{VAGARO_URL}}`; per-service deep links
      if `{{VAGARO_SERVICE_LINKS}}` provided)
- [ ] Skinbetter storefront link-out
- [ ] Social links in footer (`{{SOCIAL_LINKS}}`)
- [ ] Directions link-outs (LocationCard exists — reuse)
- [ ] Get-the-App remains `enabled: false` (no store badges before real
      links — badge guidelines)
- [ ] `data-event` attributes on all outbound CTAs (already the CTAButton
      pattern; the analytics script itself is Phase D)

## 3. SEO in Phase C (foundation only — hardening is Phase D)

- [ ] Unique per-page `<title>` (pattern:
      `{Treatment} in Harrisburg & Charlotte, NC | Needle Girlie`) and
      claim-clean meta description via SeoHead (exists)
- [ ] Wire `service()` + `breadcrumbList()` JSON-LD builders
      (`src/lib/schema.ts` — already built, unused) into TreatmentLayout
- [ ] Local-intent mention (Harrisburg/Charlotte) once or twice per
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
