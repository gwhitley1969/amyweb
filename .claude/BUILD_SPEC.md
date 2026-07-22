# BUILD_SPEC.md — needlegirlie.com (Website v1)

**Client:** Amy Palacios, FNP — brand: **Needle Girlie** (needlegirlie.com)
**Provider:** Xtend-AI, LLC (solo architect/developer, working through Claude Code)
**Governs:** the Phase 2 Website build under the Needle Girlie Website SOW.
**Companion:** `CLAUDE.md` (repo constitution — its hard constraints always apply).

---

## 1. Overview & goals

Amy Palacios has run her aesthetics practice since 2017. Her services currently
share a website with other independent providers at the same location — some
offering overlapping treatments with their own booking links. This site gives
her brand, **Needle Girlie**, its own dedicated home so there is zero confusion
about who a visitor is booking with.

The site must:

1. Look **premium and glamorous** — "serious glamour": luxury-editorial
   presence carried by a licensed clinician's credibility. Never
   clinical-sterile, never cheap-cute. (Amended 2026-07-18 per client
   direction — see docs/DECISIONS.md.)
2. **Convert** — every page routes cleanly to booking an appointment (Vagaro
   handoff) or requesting a consultation.
3. **Be found** — local SEO for treatment searches near Charlotte / Harrisburg, NC.
4. **Be fast** — Core Web Vitals "good" on mobile; this audience is mobile-first.
5. **Be accessible** — WCAG 2.2 AA as a legal-risk control, not a nice-to-have.
6. **Stay compliant** — every word factual; the claim rulebook in §8 governs all copy.
7. **Be maintainable by one person** — provider-managed content in Git; no CMS in v1.

Explicitly **not** in v1: any backend/server code, the AI assistant (Phase 3,
mobile app), user accounts, e-commerce/payments, before/after galleries,
testimonials, contact forms, any other provider's services.

## 2. Architecture

```
Visitor (mobile-first)
   │
   ▼
Azure Front Door (Standard) ── client's subscription (needlegirlie tenant)
   │  custom domains: needlegirlie.com (canonical) + www (301 → apex)
   │  managed TLS · HTTPS redirect · edge cache · compression
   │  [Phase 3 will add /api/* → Container Apps — NOT built now]
   ▼
Azure Static Web Apps (Standard) — origin, locked to Front Door in production
   │  (allowedIpRanges: AzureFrontDoor.Backend + required X-Azure-FDID header)
   ▲
GitHub Actions ── build → quality gates → deploy → purge Front Door cache
   ▲
GitHub repo ── Astro 5 static site, content in Markdown/MDX
```

Facts already true: DNS for needlegirlie.com is hosted in Azure DNS in the
client's subscription (`needlegirlie.onmicrosoft.com` tenant). The domain is
registered. `needlegirl.com` is owned but is **not** used in v1 (there will be a redirect in DNS on Azure, where www.needlegirl.com will point to www.needlegirlie.com).

Canonicalization: **apex `needlegirlie.com` is canonical**; `www` 301-redirects
to apex at Front Door (Azure DNS alias record supports apex → Front Door).
All HTTP → HTTPS at the edge.

SWA notes: Standard tier (per-PR preview environments — public since
2026-07-21 at operator direction, noindexed via preview.json header;
99.95% SLA). Deployment size limit ~500 MB — if
the media library decision (`{{MEDIA_SCOPE}}`) brings heavy assets on-site,
a dedicated Blob `/media/*` origin behind the same Front Door is the escape
valve; do not build it until instructed.

## 3. Repo structure

As mapped in CLAUDE.md. Additional conventions:

- `src/content/treatments/` — one MDX file per treatment line (9 files), schema in §7.
- `src/content/config.ts` — zod schemas; treat schema changes as reviewed changes.
- `public/` — favicon set, logo assets, robots.txt (generated), official store
  badges (Phase 4 asset — placeholder only for now).
- Brand logo source files are provided by the operator (white-background and
  black-background PNGs). Derive favicon/OG variants from them; never redraw
  or restyle the logo.

## 4. Technical configuration requirements

### Astro

- Astro 5.x, `output: 'static'`, `site: 'https://needlegirlie.com'`.
- Integrations: `@astrojs/sitemap`, `@astrojs/mdx`, Tailwind v4 (Vite plugin).
- `trailingSlash: 'never'` (pick once, keep canonical URLs consistent).
- View Transitions optional; only if it costs no JS budget and respects
  `prefers-reduced-motion`.

### staticwebapp.config.json — generated, two variants

`scripts/generate-swa-config.mjs` writes the config into the build output from
templates in `config/swa/`:

- **production.json** — includes the Front Door lockdown:
  - `networking.allowedIpRanges: ["AzureFrontDoor.Backend"]`
  - `forwardingGateway.requiredHeaders["X-Azure-FDID"] = {{FRONT_DOOR_ID}}`
  - `forwardingGateway.allowedForwardedHosts = ["needlegirlie.com", "www.needlegirlie.com"]`
- **preview.json** — **no** lockdown (PR previews must stay reachable);
  previews are PUBLIC (password protection removed at operator direction,
  DECISIONS 2026-07-21 — the auth cookie looped in Chrome and blocked
  reviews) and carry `X-Robots-Tag: noindex, nofollow` so unapproved
  drafts never index. Share preview links with Amy directly.

Both variants set:

- `globalHeaders`:
  - `Content-Security-Policy` — strict; `default-src 'self'`; allow the
    analytics script origin (§11), `frame-src https://www.youtube-nocookie.com`
    (only if video embeds ship in v1); no `unsafe-inline` scripts (Astro
    inline styles may require `style-src 'unsafe-inline'` — minimize).
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` — deny camera, microphone, geolocation, interest-cohort.
- Cache headers: `/_astro/*` → `Cache-Control: public, max-age=31536000, immutable`;
  HTML → short max-age (rely on Front Door purge on deploy).
- Custom 404 page (branded, helpful, routes to Home / Book).

Preview builds additionally set `<meta name="robots" content="noindex, nofollow">`
site-wide via `PUBLIC_ENV !== 'production'`.

## 5. Design system & design process

### Process (mandatory, before any UI code)

Work in two passes. First produce a **design plan**: 4–6 named palette hex
values, the two typefaces and their roles, a one-paragraph layout concept per
key template (Home, Treatment page), and **one signature element** the site
will be remembered by. Then **self-critique the plan**: if any part of it is
what you'd produce for any generic med-spa or any generic "premium" site,
revise it and say what changed. Only then build, following the plan exactly.
Avoid the templated AI looks (cream + serif + terracotta; near-black + acid
accent; broadsheet hairlines) — none of them fit this brand anyway.

### Brand direction

**Serious glamour.** (Amended 2026-07-18 per client direction — see
docs/DECISIONS.md; supersedes "medical-grade playful.") The brand is bold,
pink, and composed — luxury-editorial carried by a licensed clinician's
credibility and her own photography. A noir shell (header / hero / CTA
bands / footer) with light editorial interiors; generous white space;
oversized Playfair display; uppercase tracked eyebrow labels. Pink is
jewelry, not atmosphere: brand-pink CTA fills under ink text, hairline
rules, a static neon aura on the sign, and a soft shimmer on the noir
accent phrase. Photography wears a house grade — cinema-noir on dark
bands, a light wash on light bands. Motion is scroll-driven and sparse;
nothing pulses except the sign's slow breath. Playfulness is retired from
the design language; personality lives in the type, the photography, and
Amy's singular voice.

**Signature elements:** the section opener — an eyebrow label over a short
magenta accent rule that traces in — and the sign's static aura. The
logo's chevron run remains inside the logo artwork only; the motif is
retired from UI chrome (client, 2026-07-18 — see docs/DECISIONS.md).

### Color tokens (provisional — verify by pixel-sampling the logo PNGs)

| Token | Provisional value | Role |
|---|---|---|
| `--ng-pink-500` | `#EC4899`-range (sample logo) | Brand hot pink — display text ≥ 24px bold, graphics, motifs only |
| `--ng-magenta-600` | `#D6127D`-range (sample logo) | Deep brand magenta — large accents, hover states |
| `--ng-pink-300` | `#F9A8D4`-range | Tints, chevrons, decorative |
| `--ng-blush-50` | `#FDF2F8`-range | Soft section backgrounds |
| `--ng-ink-900` | near-black w/ warm cast (e.g. `#221820`) | Body text |
| `--ng-ink-pink` | darkened magenta achieving **≥ 4.5:1 on white** (e.g. `#B00A67`-range — verify) | Links, small-text accents, button text pairings |

**Contrast rules (hard):** brand hot pinks fail WCAG AA on white at body sizes.
Body-size pink text uses `--ng-ink-pink` only. Buttons: white text on
`--ng-magenta-600`/`--ng-ink-pink` fills, verified ≥ 4.5:1. Every token pair
used for text is contrast-verified before use; record the verified pairs in
`src/styles/tokens.css` comments.

### Typography

Two families, self-hosted (@fontsource), WOFF2, `font-display: swap`, preload
the display face's primary weight.

- **Display:** a characterful serif or soft-serif with personality that
  harmonizes with the logo's serif wordmark and the playful-premium brief —
  **Fraunces** (variable) is the recommended default; justify any substitute
  in the design plan. Used with restraint: headings and the hero.
- **Body/UI:** a clean, warm humanist sans (e.g., Figtree or Nunito Sans).
- Set a deliberate type scale (e.g., 1.25 ratio), generous line-height for
  body (≥ 1.6), tight and confident for display.

### Component inventory (build in Phase B)

Header/nav (CSS-first mobile menu if achievable), Footer (NAP, social, legal
links, Get-the-App slot), Hero, TreatmentCard, ServiceLineGrid, CTAButton
(variants: book / consult / call), DisclaimerBlock, InvestigationalNotice,
BioteDisclaimer, LocationCard (address, hours, directions link-out),
GetTheApp (feature-flagged, §9), DraftBanner (§7), SEO head component,
JSON-LD component (§10), Breadcrumbs (treatment pages), FAQ block (optional,
only with approved content).

Quality floor without announcing it: responsive to 360px, visible keyboard
focus on every interactive element, `prefers-reduced-motion` respected, no
layout shift from fonts or images.

## 6. Sitemap & page specs

| Route | Page | Purpose / key content | Primary CTA |
|---|---|---|---|
| `/` | Home | Hero (brand thesis — see below); "Meet Amy" trust block (FNP, since 2017, Biote-certified); service-line overview cards (11); location strip; Get-the-App slot (coming-soon) | Book an appointment |
| `/services` | Services index | Short factual intro per line, linking to the 11 detail pages | Per-line → detail |
| `/services/weight-loss-glp-1` | Weight Loss & GLP-1 Therapy | §7 brief | Book / Consult (2026-07-21, operator — was consult-routed) |
| `/services/peptide-therapy` | Peptide Therapy | §7 brief — public list is `{{PEPTIDES_PUBLIC_LIST}}` | Request a consultation |
| `/services/wrinkle-relaxers` | Wrinkle Relaxers | §7 brief | Book / Consult |
| `/services/dermal-fillers` | Dermal Fillers | §7 brief | Book / Consult |
| `/services/biostimulators` | Biostimulators | §7 brief | Request a consultation |
| `/services/regenerative` | Regenerative Treatments | §7 brief | Request a consultation |
| `/services/skin-rejuvenation` | Skin Rejuvenation | §7 brief (added 2026-07-19, Vagaro alignment) | Request a consultation |
| `/services/body-contouring` | Body Contouring | §7 brief (added 2026-07-19, Vagaro alignment) | Request a consultation |
| `/services/iv-therapy` | IV Therapy & Vitamin Support | §7 brief | Book an appointment |
| `/services/hormone-optimization` | Hormone Optimization (Biote) | §7 brief — FDA disclaimer required | Request a consultation |
| `/services/skincare` | Skincare (Skinbetter Science) | Overview + storefront link-out | Shop (link-out) |
| `/about` | About / Credentials | Amy's story + credentials (facts from `{{AMY_BIO}}`); factual note that she practices within a multi-provider location; Evolus relationship factual only — About stays ranking-free (operator placement decision 2026-07-21; the resolved `{{EVOLUS_CLAIM}}` sentence lives on the two Evolus product pages, §8.4) | Request a consultation |
| `/book` | RETIRED (2026-07-21, operator) | Was the Vagaro-handoff explainer; every "Book with Amy" now opens Vagaro directly, so the page was deleted before ever serving in production | — |
| `/visit` | Visit Us | Address, hours (`{{HOURS}}`), parking note, "Get directions" link-out (no map iframe) | Directions / Book |
| `/privacy`, `/terms`, `/medical-disclaimer` | Legal | Provider-drafted for attorney review; clearly marked drafts until counsel approves | — |
| `/404` | Not found | Branded, routes home/book | — |

Language conventions (site-wide, hard rule): **"consultation"** is used only
for clinical-routing contexts ("is this right for me → request a
consultation"); **"appointment"** is used for booking/conversion contexts
("book an appointment"). Do not mix them.

CTA label amendment (operator, 2026-07-20): every conversion button is
labeled **"Book with Amy"**, including consult-routed ones. The table's
"Request a consultation" cells describe routing intent in prose, not
button behavior; consult-variant buttons pointed at `/book` until the
2026-07-21 routing amendment below.

Routing amendment (operator, 2026-07-21): a button reading "Book with
Amy" always opens the Vagaro booking page directly. The weight-loss
line flipped first (operator direction after seeing the consult-routed
button on the preview); the operator then retired the `/book`
double-hop sitewide — the consult variant keeps its outline emphasis
but books directly. The `/book` page, left with no inbound links, was
then retired the same day (operator decision, microcopy cushion
declined) — deleted before ever serving in production, its URL removed
from the pa11y/Lighthouse gate lists. Suitability language in prose
still routes to consultation, and Retatrutide remains
consultation-introduced in copy (§7 brief 1).

Home hero: open with the most characteristic thing in this brand's world — the
Needle Girlie identity itself (wordmark energy, the chevron/syringe motif, a
confident one-line promise about *her* care), not a generic stock-spa hero.
No claims in the hero (no outcomes, no "#1" until substantiated).

## 7. Content model & workflow

### Collection schema (`treatments`)

```ts
{
  title: string,
  line: enum(11 lines),
  summary: string,            // 1–2 sentences, factual
  deck?: string,              // editorial standfirst card (2026-07-20, replaced AtAGlance); §8 applies
  products: string[],         // named products only, from this spec
  ctaType: 'book' | 'consult' | 'shop',
  investigational: boolean,   // true → InvestigationalNotice REQUIRED (layout enforces)
  investigationalProduct?: string, // names the compound in the notice (2026-07-19)
  bioteDisclaimer: boolean,   // true → BioteDisclaimer REQUIRED (layout enforces)
  pricingDisplay: 'none' | 'consult' | 'startingAt',   // default 'consult' — see {{PRICING_DISPLAY_MODE}}
  clinicianApproved: boolean, // default false — ONLY the human operator flips this
  draft: boolean,             // true → excluded from build entirely
  seo: { title, description } // claim rulebook applies here too
}
```

### Approval workflow (compliance as code)

- Treatment layout **always** injects `DisclaimerBlock`; schema flags inject
  `InvestigationalNotice` / `BioteDisclaimer`. Pages cannot opt out.
- Any page with `clinicianApproved: false` renders a visible **DraftBanner**
  ("Draft — pending clinician review") and `noindex` in preview environments.
- `scripts/check-approvals.mjs` runs in the **production** deploy job and
  **fails the deploy** if any non-draft treatment page has
  `clinicianApproved: false`.
- Claude Code never sets `clinicianApproved: true`. Content edits to approved
  pages reset the flag to `false` in the same commit (re-approval required).

### Per-line content briefs (draft only from these; the rulebook in §8 governs)

All copy pattern: *what it is → who it's generally for, in general factual
terms → individualized under clinician supervision → CTA*. No mechanisms-of-
action hype, no outcomes, no dosing, ever.

1. **Weight Loss & GLP-1 Therapy** — prescription medications offered in
   a medically supervised weight-management program: **Semaglutide**,
   **Tirzepatide**, **Phentermine**, and **Retatrutide** (menu confirmed
   against the live Vagaro listing, operator decision 2026-07-19).
   Authorized product facts (2026-07-20, vetted from the client's product
   sheet — the sheet itself is a hard-constraint-8-class document:
   view-only, never committed or quoted): receptor-class descriptions
   (Semaglutide first-generation single agonist; Tirzepatide dual
   agonist, GLP-1 + GIP; Retatrutide triple agonist, GLP-1 + GIP +
   glucagon) and the mg-keyed price tiers enumerated in
   `compliance/banned-patterns.json` `allowedStrings` (operator override
   2026-07-20 — supersedes the earlier "mg tiers never appear" note for
   those EXACT strings only; every other quantity stays banned). The
   sheet's reconstitution and dosing columns are prohibited content; its
   duration/tolerability wording is a safety claim — banned; its Uses
   wording contains banned angles — receptor-class facts only.
   Retatrutide is **investigational (not FDA-approved)** — if published,
   `investigational: true`, factual naming only, no benefit claims of any
   kind, consultation-introduced in copy (the disclosure line routes it
   to consultation; the page-level CTA may book directly — operator
   routing amendment 2026-07-21); final wording subject to attorney
   review (`{{RETATRUTIDE_COUNSEL}}`). Phentermine: factual naming only — never
   describe its mechanism (the appetite-language ban applies). Banned
   angles: weight-loss numbers, "powerful results",
   blood-sugar/hypoglycemia claims, appetite mechanics as promises.
2. **Peptide Therapy** — publish only `{{PEPTIDES_PUBLIC_LIST}}` (candidates
   from the current public site: Glow Stack, GHK-Cu, NAD). Factual
   descriptions of what each is; **no** recovery, healing, anti-inflammatory,
   anti-aging-outcome, or performance claims; no off-label positioning.
3. **Neuromodulators ("wrinkle relaxers")** — prescription injectable
   treatments for temporary softening of dynamic lines: **Jeuveau**,
   **Xeomin**, **Daxxify** (`{{NEUROMOD_LIST}}` RESOLVED 2026-07-19 from
   the live Vagaro menu — each has its own booking category). Common
   treatment areas may be listed factually (forehead, frown lines,
   crow's feet). Authorized product facts (2026-07-21, vetted from the
   client's product sheet, Neuromodulators tab — same
   hard-constraint-8-class source rules as brief 1): manufacturer names
   (Evolus / Merz / Revance), indication-style phrasing ("used to
   temporarily smooth moderate to severe frown lines / facial
   wrinkles"), public formulation facts (Jeuveau developed specifically
   for aesthetics; Xeomin purified down to the bare active protein;
   Daxxify peptide-stabilized), Daxxify's duration ONLY as the hedged
   label fact ("labeled for results lasting up to six months — how
   long it holds varies person to person"), and the two per-unit price
   strings enumerated in `allowedStrings` (operator override
   2026-07-21). The sheet's "FDA-approved" phrasing stays banned —
   render it as "prescription"; "neurotoxin" normalizes to
   "neuromodulator". The §8.4 Evolus ranking sentence is authorized on
   this page (once, Jeuveau context — DECISIONS 2026-07-21), and the
   Evolus ICON event film ships here under the §8.3/§8.4 override
   (as-is; DECISIONS 2026-07-21).
4. **Dermal Fillers** — injectable gel fillers for volume/contour:
   Evolysse Smooth & Form (Evolus) and Revanesse Versa+ & Lips+
   (Prollenium); common areas factually (lips, cheeks, jawline, chin,
   under-eyes). Authorized facts (2026-07-21, from the operator's filler
   briefs in C:\Amy\scans\Fillers — constraint-8-class, view-only, never
   committed): hyaluronic-acid gels; Evolysse cold-temperature
   processing designed to preserve the HA molecule (never claim
   "first"); Smooth softens and smooths lines, Form is designed to lift
   and support; Revanesse formulated with lidocaine — Versa+ for facial
   lines and folds, Lips+ for lip augmentation; adults 22 and older;
   Evolysse duration ONLY as the hedged label fact ("labeled for results
   lasting up to a year — how long it holds varies person to person");
   price string "$650 or $325 (half-syringe)" (trips no banned pattern —
   published with no allowlist entry). Brochure dosing tables, trial
   statistics, testimonials, award claims, and "FDA-approved" phrasing
   stay out — render "prescription". The Evolus film and the lip
   style-guide graphic (text-free version since 2026-07-21) ship under
   the DECISIONS 2026-07-21 overrides. The §8.4 Evolus ranking sentence
   is authorized on this page (once, Evolysse context).
5. **Biostimulators** — collagen-stimulating treatments: PDO Threads,
   Radiesse. Factual description of category; no "lifting results" promises.
   Radiesse is a **biostimulator, not a dermal filler**, for this catalog —
   it lives on this page, not Dermal Fillers (operator-confirmed 2026-07-21
   via radiesse.com, which markets it as "the first and only injectable
   biostimulator"). That superlative and "FDA-approved" stay off-site (§8);
   PDO threads are the VSoft Lift line.
6. **Regenerative Treatments** — PRP, and PRP with microneedling
   (trimmed to the live Vagaro menu, operator decision 2026-07-19; PRF,
   PDRN, Illuma, VAMP, and Rejuran return only if Amy confirms them as
   current offerings). Describe what the treatments are; no
   healing/repair outcome claims.
7. **IV Therapy & Vitamin Support** — Myers' Cocktail, Immunity IV, vitamin
   shots, Glutathione, B12, NAD IV. **Glutathione: absolutely no disease
   claims** (no neuroprotective / Alzheimer's / Parkinson's / chemotherapy
   language in any form). "Immunity IV" is a product name; do not extend it
   into immune-benefit claims.
8. **Hormone Optimization (Biote)** — Amy is a Biote-certified provider
   offering bioidentical hormone replacement therapy. Symptom-awareness
   framing (fatigue, sleep, mood, etc.) is permitted **only** with the FDA
   disclaimer Biote itself uses, rendered via `BioteDisclaimer`. Logo /
   co-marketing usage pending `{{BIOTE_PERMISSION}}` — text-only until then.
9. **Skincare (Skinbetter Science)** — medical-grade skincare available
   through Amy's partner storefront; shop link-out (`{{SKINBETTER_URL}}`).
10. **Skin Rejuvenation** *(added 2026-07-19, Vagaro alignment; expanded
    2026-07-22 from the operator-supplied Rohrer brief — a constraint-8-class
    view-only source, never committed)* — **PiXel8-RF** (Rohrer Aesthetics):
    an FDA-cleared device pairing fine microneedles with 4 MHz
    radiofrequency energy; mechanism stated as design ("designed to prompt
    the skin's own collagen and elastin production"); indication areas
    appearance-hedged (appearance of skin laxity/crepiness, uneven tone and
    texture, acne scarring, stretch marks; face, neck, and body); "designed
    for all skin types and tones" permitted as a manufacturer design fact
    (never "safe and effective"). Price shows as bare **$1,500** (operator
    decision 2026-07-22 — no per-treatment/per-series basis; explained at
    consultation). **Medical-grade chemical peels** (clinician-applied
    exfoliating solutions) — **starting at $180**; the peel section is a
    compliant placeholder until `{{CHEMICAL_PEELS_MENU}}` resolves.
    Line-specific exclusions: no needle depths/pin counts/tip specs
    (dosing-class), no session counts or scheduling intervals
    (protocol-class), no results timelines or downtime promises, no PIH
    claims, no "first and only"/MHz comparisons (superiority), no
    third-party med-spa names from the brochure. Factual device/procedure
    descriptions only; no resurfacing/anti-aging outcome claims; consult
    routing.
11. **Body Contouring** *(added 2026-07-19, Vagaro alignment)* — Evolve,
    a non-invasive device-based treatment; describe by intended design
    (skin tightening, muscle toning) only — never as outcomes. No
    body-fat or measurement language of any kind. Consult routing.

## 8. Content compliance rulebook (governs every string in the repo)

**Never, anywhere** (page copy, meta, alt text, JSON-LD, OG, microcopy):

1. Dosing in any form: doses, units, mg/mcg quantities, reconstitution,
   frequency, duration protocols, titration. *Scoped exceptions
   (operator overrides after the compliance flags — DECISIONS
   2026-07-20 and 2026-07-21): the exact price strings enumerated in
   `compliance/banned-patterns.json` `allowedStrings` — mg-keyed GLP-1
   vial tiers and per-unit neuromodulator prices — may appear as
   product pricing; nothing else.*
2. Disease claims: treat / cure / prevent / diagnose; disease names in benefit
   context (Alzheimer's, Parkinson's, cancer/chemotherapy, diabetes, etc.).
3. Efficacy/outcome promises: guarantees, specific results, numbers,
   before/after implications, "powerful results", "proven results".
   *Scoped exceptions (operator overrides — DECISIONS 2026-07-21): the
   Evolus-produced Evolysse film on /services/dermal-fillers (carried
   as-is, manufacturer safety information intact) and the Evolus ICON
   event film on /services/wrinkle-relaxers (carried as-is; its
   comparative-efficacy remarks are the manufacturer's own and its
   captions transcribe the event speech faithfully). Nothing else.*
4. Unsubstantiated superiority: "#1", "best", "top-rated" — banned.
   *Scoped exception ({{EVOLUS_CLAIM}} resolved 2026-07-21, operator
   override after the flag — DECISIONS): the exact sentence
   "Charlotte's #1 Evolus provider", enumerated in `allowedStrings`,
   published unattributed at the operator's direction on the
   wrinkle-relaxers and dermal-fillers pages only. Basis: operator's
   confirmation that the designation comes from Evolus + the same claim
   live on the practice's own site; the recommended Evolus rep email
   remains the outstanding substantiation upgrade. Nothing else.*
5. Off-label promotion (e.g., positioning any product for an unapproved use).
6. Presenting investigational compounds as approved, safe, or effective.
7. Medical advice or suitability answers — "is this right for me" always
   routes to a consultation.
8. Credential inflation: Amy is an **FNP** (nurse practitioner). Never imply
   physician status; state credentials exactly.
9. Testimonials, reviews, or before/after content (deferred by SOW).

**Always:** factual "what it is / who it's generally for" framing;
DisclaimerBlock on every treatment page; consultation routing as the clinical
fallback; the consultation/appointment language convention (§6).

**Enforcement — `scripts/lint-claims.mjs`:** scans `src/content/**` and
`src/pages/**` against `compliance/banned-patterns.json` (regex classes for
dosing vocabulary, disease names, guarantee language, superiority claims,
banned product angles). Inverse checks: `investigational: true` files must
contain the investigational disclosure string; `bioteDisclaimer: true` files
must not contain symptom lists unless the disclaimer component is present.
Runs in `npm run verify` and CI. The banned list only ever grows; loosening it
requires the human operator. The registry's `allowedStrings` entry
(2026-07-20 override) strips its exact strings from a line before the
categories run — boundary-guarded and self-tested so any quantity beyond
the enumerated strings still fails; the entry changes only by operator
action.

## 9. Integrations (all outbound; no data exchange)

- **Booking → Vagaro:** `{{VAGARO_URL}}` — must be **Amy's own** booking link,
  not the shared location handle. New tab, `rel="noopener"`, tracked
  (`book_click`). Service-level deep links if available (`{{VAGARO_SERVICE_LINKS}}`).
- **Products → Skinbetter storefront:** `{{SKINBETTER_URL}}` (partner
  storefront with her businessPartner id). New tab, tracked (`skinbetter_click`).
- **Phone:** `tel:` links with `{{PHONE}}`, tracked (`call_click`).
- **Social:** `{{SOCIAL_LINKS}}` (Instagram, Facebook, YouTube, Yelp, TikTok —
  Amy's own handles only).
- **Directions:** Google Maps **link-out** (no iframe) to the practice
  address, tracked (`directions_click`).
- **Get the App (feature-flagged):** `siteConfig.appLinks.enabled = false` in
  v1. Coming-soon state shows a text treatment ("The Needle Girlie app is
  coming to the App Store and Google Play") — **do not display official store
  badges until the links are live** (badge guidelines prohibit non-functional
  or modified badges). At activation (later phase): official Apple/Google
  badge artwork, real URLs, `app_badge_click` events per store. Module
  appears on Home and in the footer.
- **Video (only if `{{MEDIA_SCOPE}}` includes it):** `youtube-nocookie.com`
  embeds, lazy-loaded facade pattern (thumbnail + click-to-load) to protect
  CWV and privacy.

## 10. SEO specification

- Consistent **NAP** site-wide: Needle Girlie / Amy Palacios, FNP —
  `{{ADDRESS_DISPLAY}}` (4350 Main Street, Suite 224, Harrisburg, NC 28075) /
  `{{PHONE}}`.
- **JSON-LD** via a single `schema.ts` source: sitewide `LocalBusiness`
  (subtype `MedicalBusiness`/`HealthAndBeautyBusiness` — pick one pairing and
  keep it stable) with NAP, geo, hours, sameAs (social); per-treatment-page
  `Service` (factual name + description only — the rulebook applies to schema
  text); `FAQPage` only where real approved FAQs exist; `BreadcrumbList` on
  treatment pages.
- Per-page unique `<title>` (pattern: `{Treatment} in Harrisburg & Charlotte, NC | Needle Girlie`)
  and meta description (claim-clean), canonical URLs, Open Graph + Twitter
  cards with a branded OG image (generate from the logo assets).
- `sitemap.xml` (@astrojs/sitemap), `robots.txt` (allow all in production;
  previews are noindexed via meta).
- Semantic heading hierarchy; one `h1` per page; descriptive internal link text.
- Local intent: each treatment page naturally references the Charlotte /
  Harrisburg service area once or twice — no keyword stuffing.
- Google Business Profile is out of repo scope (`{{GBP_STATUS}}` — operator
  handles); the site just keeps NAP consistent with it.

## 11. Analytics specification

- **Cookieless, consent-banner-free.** Default: **Plausible** script
  (`{{ANALYTICS_PROVIDER}}` — operator confirms; billing sits with the client
  per the engagement's pass-through model). Abstract behind
  `src/lib/analytics.ts` (`track(event, props?)`) so the vendor can change
  without touching components. If the provider is unconfirmed at build time,
  ship the abstraction with a no-op stub and a config flag.
- **Events:** `book_click`, `call_click`, `skinbetter_click`,
  `directions_click`, `app_badge_click` (later), plus per-treatment page
  views (automatic).
- **Prohibited:** GA4 by default, Meta/TikTok pixels, any retargeting or
  ad pixels, fingerprinting, session recording. Especially prohibited on
  treatment pages (health-adjacent audience).

## 12. Accessibility specification (WCAG 2.2 AA)

- Semantic landmarks (`header/nav/main/footer`), skip-to-content link,
  logical heading order.
- Contrast ≥ 4.5:1 body text, ≥ 3:1 large text/UI components — enforced via
  the token pairs in §5; no exceptions for brand pink.
- Full keyboard operability incl. mobile nav; visible focus (custom focus
  style consistent with brand, never `outline: none` without replacement);
  target size ≥ 24×24 CSS px (2.2 criterion).
- Meaningful alt text (decorative images `alt=""`); motifs/chevrons are
  decorative.
- `prefers-reduced-motion` disables all non-essential animation.
- Announce external links pattern (icon + visually-hidden "opens in new tab").
- **Testing:** `npm run test:a11y` runs axe (via @axe-core/cli or pa11y-ci)
  against the built site's key templates; manual keyboard + screen-reader
  spot-check on Home, one treatment page, Book — recorded in the launch
  checklist.

## 13. Performance budget (CI-enforced via Lighthouse CI)

- LCP < 2.5 s, CLS < 0.1, INP < 200 ms on emulated mid-tier mobile.
- Total JS ≤ 30 KB (target ~0); no client framework hydration.
- Hero image: optimized, `fetchpriority="high"`, explicit dimensions;
  everything below fold lazy.
- Fonts: 2 families, subsetted WOFF2, preloaded display weight, swap.
- Lighthouse scores ≥ 95 Performance / ≥ 95 Accessibility / ≥ 95 SEO /
  ≥ 95 Best Practices on Home and one treatment page (budgets in
  `lighthouserc` config; PRs fail below budget).

## 14. CI/CD (GitHub Actions)

**PR workflow:** checkout → `npm ci` → `npm run verify` (build, check,
lint:claims, test:a11y, Lighthouse budgets) → deploy preview to SWA
(Azure/static-web-apps-deploy, `preview.json` SWA config, `PUBLIC_ENV=preview`)
→ comment preview URL. PR close → tear down preview environment.

**Production workflow (main):** same gates **plus** `check-approvals.mjs` →
deploy to SWA production (`production.json` config, `PUBLIC_ENV=production`)
→ `azure/login` (OIDC federated credential, SP scoped to the Front Door
profile only) → `az afd endpoint purge --content-paths '/*'`.

Secrets: SWA deployment token; OIDC client/tenant/subscription IDs. No
secrets in the repo, ever. `{{FRONT_DOOR_ID}}` (the FDID GUID) is a repo
variable injected into the production SWA config at build.

## 15. Infrastructure (Bicep, `/infra` — optional but preferred)

Provisioned in the **client's** subscription (needlegirlie tenant). The
operator may provision manually; if asked to write Bicep, produce:

- `frontdoor.bicep` — Front Door **Standard** profile + endpoint; origin group
  → SWA default hostname (certificate-name-check on); route `/*` → SWA with
  caching + compression; custom domains apex + www with managed TLS; rule set:
  HTTP→HTTPS redirect, www→apex 301.
- `swa.bicep` — Static Web App **Standard**, region `{{AZURE_REGION}}`.
- `dns.bicep` — apex **alias A record** → Front Door endpoint; `www` CNAME;
  domain-validation TXT records. (Zone already exists — reference, don't recreate.)
- `budget.bicep` — subscription/resource-group budget with alert thresholds
  (client is billed directly by Microsoft; alerts protect her).
- No APIM. No WAF policy unless instructed (`{{WAF_DECISION}}`). Nothing for
  Phase 3 (Container Apps, Postgres, OpenAI) — not now.

## 16. Definition of done (launch checklist)

- [ ] All §6 pages built; every treatment page `clinicianApproved: true`
      (Amy's written sign-off logged by the operator).
- [ ] Legal pages present and marked as reviewed by counsel (operator confirms).
- [ ] `npm run verify` green; approvals check green.
- [ ] Lighthouse budgets met on Home + a treatment page (mobile).
- [ ] Manual a11y pass done (keyboard + screen reader spot-check).
- [ ] All outbound handoffs verified to **Amy's** destinations (Vagaro URL is
      hers, not the shared location's; Skinbetter partner link correct).
- [ ] Analytics events verified firing in the provider dashboard.
- [ ] Front Door lockdown verified: SWA default hostname returns 403 direct;
      site serves only via needlegirlie.com; www → apex 301; HTTP → HTTPS.
- [ ] OG/Twitter cards render correctly; sitemap submitted-ready; previews
      noindexed, production indexable.
- [ ] 404 page works at the edge.
- [ ] Runbook written: deploy, roll back, purge cache, edit content, the
      approval workflow, and the preview-link process for Amy's reviews
      (previews are public + noindexed since 2026-07-21).

## 17. Placeholder registry

Use these tokens verbatim in code/content. Never invent values for them.

| Token | What it is | Status |
|---|---|---|
| `{{VAGARO_URL}}` | Amy's own Vagaro booking URL (NOT the shared location handle) | RESOLVED 2026-07-18 (siteConfig) — supplied handle is the shared location's; §9 flag stands, revisit at §16 |
| `{{VAGARO_SERVICE_LINKS}}` | Optional per-service deep links | Operator to supply |
| `{{SKINBETTER_URL}}` | Amy's partner storefront URL | Operator to supply |
| `{{PHONE}}` / `{{HOURS}}` / `{{ADDRESS_DISPLAY}}` | NAP details as displayed | PHONE resolved 2026-07-07; ADDRESS resolved 2026-07-18; HOURS still open |
| `{{SOCIAL_LINKS}}` | Verified handles (IG, FB, YouTube, Yelp, TikTok) | RESOLVED 2026-07-18 (FB/IG/Yelp only; Yelp is the location's — flagged) |
| `{{AMY_BIO}}` | Approved bio facts & credentials | RESOLVED 2026-07-19 (operator-supplied listing; Amy's wording confirmation pending — DECISIONS) |
| `{{PEPTIDES_PUBLIC_LIST}}` | Which peptides appear publicly | Open decision |
| `{{NEUROMOD_LIST}}` | Confirmed neuromodulator products | RESOLVED 2026-07-19 (live Vagaro menu, operator-confirmed: Jeuveau, Xeomin, Daxxify) |
| `{{PRICING_DISPLAY_MODE}}` | none / consult / startingAt (default: consult) | Open decision |
| `{{CHEMICAL_PEELS_MENU}}` | Peel menu from Amy (brands, tiers, per-peel pricing beyond the $180 start) | Open — page carries a compliant placeholder (2026-07-22) |
| `{{EVOLUS_CLAIM}}` | "#1 Evolus provider" substantiation outcome | RESOLVED 2026-07-21 (operator override — exact sentence in `allowedStrings`, two Evolus product pages; §8.4) |
| `{{BIOTE_PERMISSION}}` | Biote logo/co-marketing permission | Open decision |
| `{{RETATRUTIDE_COUNSEL}}` | Attorney-approved investigational wording | Open decision |
| `{{MEDIA_SCOPE}}` | How much photo/video goes on-site | Open decision |
| `{{ANALYTICS_PROVIDER}}` | Plausible (default) or alternative | Open decision |
| `{{FRONT_DOOR_ID}}` | X-Azure-FDID GUID after FD provisioning | After infra |
| `{{AZURE_REGION}}` | Deployment region | Operator to supply |
| `{{WAF_DECISION}}` | Front Door WAF at launch: yes/no | Open decision |
| `{{GBP_STATUS}}` | Google Business Profile ownership | Operator handles |

## 18. Build phases (work in this order; plan → approve → build each)

- **Phase A — Scaffold & pipeline:** Astro scaffold, Tailwind v4, repo
  structure, SWA config generation (both variants), GitHub Actions (preview +
  production skeleton), compliance linter + approvals check stubs wired into
  `verify`, optional Bicep. Exit: a "hello, Needle Girlie" page deploys to a
  password-protected preview and to production behind Front Door.
- **Phase B — Design system:** design plan (per §5 process, present for
  approval) → tokens, typography, component inventory, base layouts with
  disclaimer injection.
- **Phase C — Pages & content drafts:** all §6 pages; treatment copy drafted
  from §7 briefs (all `clinicianApproved: false`, DraftBanners visible);
  legal-page drafts; integrations wired with placeholders.
- **Phase D — Hardening:** SEO (JSON-LD, meta, sitemap), analytics events,
  a11y pass + fixes, performance to budget, 404, OG images.
- **Phase E — Launch readiness:** placeholder resolution, approvals flipped by
  operator after Amy's sign-off, §16 checklist executed, runbook delivered.
