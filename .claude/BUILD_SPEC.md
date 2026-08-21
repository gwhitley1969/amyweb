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
99.95% SLA). Deployment size limit ~500 MB. The escape valve for heavy
media — a dedicated Blob origin behind the same Front Door — was
**BUILT 2026-08-17** (operator decision, external-audit Finding 5):
films serve as `media.needlegirlie.com/<file>.mp4` (route `media` →
storage container `media`, Bicep in `infra/storage.bicep` +
`infra/frontdoor.bicep`; publish procedure in docs/RUNBOOK.md
"Publishing a film"). The stable hostname is deliberate: PR previews
play exactly what production plays. WebVTT captions stay in-repo
(public/media/, same-origin — compliance audit trail; no CORS needed),
and `media-src` in both CSP templates admits the media host.

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
    *Consequence, learned 2026-08-14 (DECISIONS): Astro inlines component
    scripts under 4KB into the HTML, which this CSP silently kills on the
    host while header-less local servers pass them. Site scripts therefore
    live as static files in `public/js/`, referenced by literal
    `is:inline src` tags; local testing of built pages must apply the
    generated SWA headers. Never fix via `assetsInlineLimit: 0` — it
    un-inlines page CSS and regresses LCP budgets.*
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
docs/DECISIONS.md; supersedes "medical-grade playful." Surface amendment
2026-07-23, client-approved: the light interiors wear the **ombre
canvas**.) The brand is bold, pink, and composed — luxury-editorial
carried by a licensed clinician's credibility and her own photography. A
noir shell (header / hero / CTA bands / footer) with light editorial
interiors; oversized Playfair display; uppercase tracked eyebrow labels.
The light ambient surface is the site-wide ombre canvas (2026-07-23,
client direction from her own reference image): each page ramps
blush-50 at the top to brand pink-500 at 80% of the document — pink is
now the atmosphere, so the functional accents invert to ink: eyebrows,
accent rules, links (underline/border-distinguished), outline CTAs, and
focus rings are ink-900 on the canvas; noir surfaces keep their pink-300
family. The ramp may never exceed pink-500 (the deepest surface holding
the recorded ink-900 pair, 4.88 — tokens.css OMBRE CANVAS governs).
Noir-bodied pages (/404 — the construction home was the other until it
retired at C8, 2026-08-04) stay flat black. Brand-pink
CTA fills under ink text, hairline rules, a static neon aura on the
sign, and a soft shimmer on the noir accent phrase carry on unchanged.
Photography wears a house grade — cinema-noir on dark bands, a light
wash on light bands. Since 2026-08-17 every photo also wears the arch
frame (`.ng-arch`, global.css — the category-door window generalized
sitewide at the client's direction; DECISIONS 2026-08-17), with four
standing exemptions: the home hero backdrop, all film stages and
posters (the Evolus films' burned-in safety information ships complete
and uncropped; since 2026-08-21 Amy's own site-authored films may wear
the arch's 12px foot corners + hairline via `TreatmentVideo`'s bare
frame when they sit inside a media row — never the arch, and
manufacturer stages stay unmasked), the homepage Instagram post (the
client's named exception), and the lip style-guide diagram. The arch family has one
wide sibling (2026-08-18, DECISIONS same date): the segmental arch —
curve pinned to the top third over straight feet — for a landscape
frame that must show its full content (first use: the
wrinkle-relaxers band, at the client's "everyone visible" direction). Motion is scroll-driven
and sparse; nothing pulses except the sign's slow breath. Since 2026-08-14 the noir shell includes
the home's cinematic video stage — four films crossfading
chromeless on full-bleed noir (the operator's "Audi treatment";
DECISIONS 2026-08-14; the fourth film joined 2026-08-17; the
stage-surface question, noir vs
arch-on-ombre, is an open client call — docs/REDESIGN.md). Playfulness is retired from
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
| `--ng-magenta-600` | `#D6127D`-range (sample logo) | Deep brand magenta — large accents, display-accent text on light (service-card edge/ring role retired 2026-07-22 — fails non-text contrast on the client card pinks) |
| `--ng-pink-300` | `#F9A8D4`-range | Tints, chevrons, decorative |
| `--ng-blush-50` | `#FDF2F8`-range | Ombre canvas start (site-wide, 2026-07-23) + soft ambient bands (ConceptHome) |
| `--ng-ink-900` | near-black w/ warm cast (e.g. `#221820`) | Body text |
| `--ng-ink-pink` | darkened magenta achieving **≥ 4.5:1 on white** (e.g. `#B00A67`-range — verify) | Links, small-text accents, button text pairings |

**Contrast rules (hard):** brand hot pinks fail WCAG AA on white at body sizes.
Body-size pink text uses `--ng-ink-pink` only. Buttons: white text on
`--ng-magenta-600`/`--ng-ink-pink` fills, verified ≥ 4.5:1. Every token pair
used for text is contrast-verified before use; record the verified pairs in
`src/styles/tokens.css` comments.

**Service-card state pair (client-picked, 2026-07-22 — final after a
four-round preview iteration, DECISIONS same date):** the /services
cards rest on `--ng-card-rest: #f4cae2` and deepen to
`--ng-card-hover: #efb1d5` when highlighted; the highlight draws a 2px
`--ng-ink-pink` ring on all four sides and colors the title the same
(3.81:1 on the highlight pink — every pair in the tokens.css header
table). Client-trialed and rejected for the ring/title role: `#ff4f8b`
(2.13:1) and the logo-lips neon `#fe019a` (2.10:1) — both fail WCAG —
and plum `#a83b71` (passes, declined on looks). These exact hexes are
client decisions: do not re-derive them from the palette ramp.

**Site-wide boxes (client direction, 2026-07-22, later the same day):**
every box on every page wears the service-card resting pink —
`--ng-card` points at `--ng-card-rest` `#f4cae2` (product cards, deck,
router card, disclaimer block, investigational notice, location card,
about facts). All box edge rules moved magenta-600 → ink-pink
(magenta is 3.11:1 on the card pink, margin-thin against the 3.0
non-text bar; the disclaimer's pink-300 top rule was 1.24:1). In-box
links/tags were ink-pink at 4.60:1 under an operator-accepted
exception to the house 4.7 link-headroom bar (chosen over a darker
in-box pink after the flag, DECISIONS same date) — since the
2026-07-23 site-wide ombre re-inked `--ng-link` to ink-900 on every
light page, in-box links render ink at 11.80:1 and the exception is
dormant (it applies again only if a non-ombre light surface returns).
Blush-50's ambient-band role (ConceptHome) continues; since
2026-07-23 it is also the site-wide ombre canvas start. Noir boxes
stay transparent-outlined.

**Editorial menu cards (client direction, 2026-07-23; photo cards
2026-08-18; compact tiles same day, rev 2):** the services grid
renders as a categorized treatment menu — three groups (Injectables ·
Skin & Body · Wellness, 4/4/4 in `serviceLines` array order, which is
also the 01–12 numbering order), each opened by the section-opener
signature. Grid density (operator scale correction after the first
preview read huge): 2-across compact tiles on phones, one 4-card row
per group from `lg` up. Card anatomy: the client's per-line photo in
the house arch (her mockup, 2026-08-18 — the door anatomy's 4:5
server crop, decorative `alt=""` to the labeled link; photo map +
screening pointer in ServiceLineGrid; srcset [400/640/880] capped at
each photo's crop width so sharp never upscales — 880 serves the
640–1023 two-across band's DPR2 tablets, and `sizes` describes the
IMAGE width), then the Playfair index numeral (ink-pink, 4.60:1 on
the resting pink, decorative `aria-hidden`), Playfair title and
summary (the summary was sans until the 2026-08-15 one-family move —
§5 Typography; on phones the summary is HIDDEN — operator decision —
so the tile is arch + numeral + title + microline, and it returns
from 640px), and a "More information ›" microline pinned to the card
foot (client wording, 2026-07-23) — the microline is ink-900, not
ink-pink (contrast on the hover plate), compacted on the photo tiles
with a phone step that stacks two composed lines only at the 344px
Z Fold cover. All type measures compact ONLY under the `--photo`
variant; text-only cards keep the editorial anatomy. Hover adds a
2px ink-pink rule drawing across the card top (the traced-rule
signature at card scale). The state pair, the ring, and every recorded
contrast pair above are unchanged. Perf: the 12-card photo menu gets
a scoped LHCI budget carve-out on /services + /styleguide only
(assertMatrix, image 384KB / total 512KB — tightened same day from
the initial 640/940 when the compact tiles halved the picks;
measured 298/317KB — DECISIONS 2026-08-18); all other pages keep
the §13 budgets.

**Raised plates (client direction, 2026-07-27):** the menu cards are
elevated, not flat — a two-layer ink-900 shadow with a 1px lit top
facet, rising on hover/focus and settling on press (`.ng-lift`,
global.css). The reason is arithmetic, not taste: the card fill sits
between the ombre canvas endpoints, so plate and canvas cross equal
luminance at 19.6% of the document and bottom at **1.001:1** across an
8–32% band — a band containing the Injectables group, the first cards
seen (tokens.css ELEVATION + OMBRE CANVAS). **Elevation is scoped to
whole-card LINKS only** — the twelve cards and the concept-home
category doors — so it reads as affordance; static boxes and every
compliance block stay flat, because a raised disclaimer implies a
press target that does not exist. This deliberately narrows the
2026-07-22 "every box matches the /services boxes" direction. Derived
from the house framed-print shadow, **never its tilt**. Plates keep
square corners; the 2px radius stays the controls'. An ink-pink-tinted
shadow is banned for this role (1.24:1 at ramp depth). Colors, the
state pair, the ring, and every recorded contrast pair remain
unchanged.

### Typography

**One family — Playfair Display** (variable, upright, self-hosted
@fontsource, WOFF2, `font-display: swap`, latin weight preloaded): the
wordmark's own face carries display AND body/UI, so the site speaks in
the logo's voice everywhere. *(As amended 2026-08-15 — Amy's direction;
DECISIONS same date. Supersedes the original serif-display +
humanist-sans split and the 2026-07-08 DM Sans body choice; DM Sans is
retired. If small tracked-caps microcopy ever shimmers on low-DPI
screens, the fix is weight via the variable axis (400–900), never a
second family.)*

- **Display:** Playfair Display at scale, weight 500, tight tracking.
  Used with restraint: headings and the hero.
- **Body/UI:** Playfair Display, weight 400, 17px base (1.0625rem),
  line-height 1.65 — the readability bump that shipped with the
  single-family move.
- The type scale keeps its deliberate 1.25 ratio; generous line-height
  for body (≥ 1.6), tight and confident for display.

### Component inventory (build in Phase B)

Header/nav (as built, redesign round 2026-08-15: a dual-brand header —
the Mobile Aesthetics badge far left, an SVG vector rebuild of the
practice mark that links out to yourmobileaesthetics.com in a new tab
under the constraint-2 scoped exception; the NG wordmark + credential
centered in the row's slack, home link; a persistent outlined Book CTA
and the popover menu button on the right. HYBRID NAV: the zero-JS
Popover-API menu carries Services/About/Visit/Training at EVERY width —
there is no inline desktop nav — and Book never hides. Brand scales
fluidly: badge 48–80px / wordmark clamp to 300px below 1024px; badge
128–160px / wordmark to 440px above. The one-breakpoint mobile shell
fixed the Z Fold-class collision, DECISIONS 2026-08-15), Footer (NAP, social, legal
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
| `/` | Home | Hero (brand thesis — see below; since 2026-08-14 the hero photo is Amy's studio-counter portrait); **video carousel** directly below the hero (2026-08-14, fourth film added 2026-08-17: four films on a cinematic noir stage — autoplay muted on visibility, crossfade rotation, WCAG 2.2.2 pause, facade-loaded; DECISIONS both dates); "Meet Amy" trust block (FNP, since 2017, Biote-certified); **three category doors** routing to /services (amended 2026-07-25: the home ROUTES, it does not reprint the 12-card menu — DECISIONS same date); location strip; Get-the-App slot — satisfied by the sitewide footer block, not a home section | Book an appointment |
| `/services` | Services index | Short factual intro per line, linking to the 12 detail pages | Per-line → detail |
| `/services/weight-loss-glp-1` | Weight Loss & GLP-1 Therapy | §7 brief | Book / Consult (2026-07-21, operator — was consult-routed) |
| `/services/peptide-therapy` | Peptide Therapy | §7 brief — public list is `{{PEPTIDES_PUBLIC_LIST}}` | Request a consultation |
| `/services/wrinkle-relaxers` | Neurotoxins - Wrinkle Relaxers (client wording 2026-08-19; seo.title keeps the search phrasing) | §7 brief | Book / Consult |
| `/services/dermal-fillers` | Dermal Fillers | §7 brief | Book / Consult |
| `/services/biostimulators` | Biostimulators | §7 brief | Request a consultation |
| `/services/regenerative` | Regenerative Treatments | §7 brief | Request a consultation |
| `/services/skin-rejuvenation` | Skin Rejuvenation | §7 brief (added 2026-07-19, Vagaro alignment) | Request a consultation |
| `/services/body-contouring` | Body Contouring | §7 brief (added 2026-07-19, Vagaro alignment) | Request a consultation |
| `/services/laser-treatments` | Laser Treatments | §7 brief (added 2026-07-22, Venus Versa; renamed Venus Versa Pro 2026-08-04; priced + Venus Epileve laser hair removal added 2026-08-21) | Request a consultation (hair removal: Book with Amy) |
| `/services/iv-therapy` | IV Therapy & Vitamin Support | §7 brief | Book an appointment |
| `/services/hormone-optimization` | Hormone Optimization (Biote) | §7 brief — FDA disclaimer required | Request a consultation |
| `/services/skincare` | Skincare (Skinbetter Science) | Overview + storefront link-out | Shop (link-out) |
| `/about` | About / Credentials | Amy's story + credentials (facts from `{{AMY_BIO}}`); factual note that she practices within a multi-provider location; the Evolus recognition plate + the ICON film (moved from wrinkle-relaxers at the client's direction 2026-08-18, superseding the 2026-07-21 ranking-free placement — the resolved `{{EVOLUS_CLAIM}}` sentence now renders on /about only — dermal-fillers swapped it for the EvolusLaurel plaque 2026-08-21, §8.4) | Request a consultation |
| `/injector-training` | Private Injector Training | Professional-audience page (added 2026-08-04, operator-directed; DECISIONS same date): four hands-on, one-on-one courses for licensed medical professionals, prices flyer-verbatim (three at $5,000, Radiesse $7,500; three hours each, product included); curriculum topics under the fifth `allowedStrings` authorization (§8.1); outside the treatments collection and the clinician flag gate — Amy reviews via the sign-off doc's non-gated section; "Training" nav item | Call (phone/Instagram routed — neither booking nor consultation language) |
| `/book` | RETIRED (2026-07-21, operator) | Was the Vagaro-handoff explainer; every "Book with Amy" now opens Vagaro directly, so the page was deleted before ever serving in production | — |
| `/visit` | Visit Us | Address (hours are NOT listed — Amy's decision 2026-08-04, `{{HOURS}}` CLOSED; no page copy may promise or imply hours), parking note, "Get directions" link-out (no map iframe) | Directions / Book |
| `/privacy`, `/terms`, `/medical-disclaimer` | Legal | Provider-drafted, launch form effective 2026-08-04 (draft markers removed at operator acceptance — DECISIONS same date; counsel review post-launch) | — |
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
  line: enum(12 lines),
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
- **Scope note (2026-08-17, external-audit Finding 3):** the flag attests
  to file COPY. CSS-level presentation changes (typeface, the arch
  motif's display crops, frames, spacing) do not reset flags **by
  design** — visual passes deliberately avoid MDX so they don't reset
  twelve flags at once (the arch selector-mirror precedent). Rendered
  presentation therefore carries its own separate, manual record:
  docs/CLINICIAN-SIGN-OFF.md "Two kinds of approval", whose dated
  presentation entries are a relaunch hard gate (docs/RELAUNCH.md).

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
   *(Amended 2026-08-01, operator: the nine productDetails card sentences
   ship the client's supplied definitions near-verbatim under a recorded
   override of this brief's no-benefit-claims rule — DECISIONS 2026-08-01.
   Scope: those card sentences as shipped, nothing further; new or edited
   copy reverts to the rule. The gate-blocked vocabulary stayed out —
   anti-aging, healing, and libido; no pattern, allowlist, or inverse
   check was touched.)*
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
   "neuromodulator" *(superseded PAGE-WIDE at the client's direction,
   2026-08-18 menu line / 2026-08-19 the rest: this page now says
   "neurotoxin" throughout — title, card leads, body intro, FAQ. The
   normalize rule stands for every other page — DECISIONS both
   dates)*. The §8.4 Evolus ranking sentence (the standalone
   EvolusCallout noir plate) and the Evolus ICON event film shipped on
   this page 2026-07-21 → 2026-08-18, then moved to /about at the
   client's direction (DECISIONS 2026-08-18; exception terms
   unchanged). Since 2026-08-19 the page carries the EvolusLaurel
   ranking plaque instead — two new ranking sentences under §8.4's
   second scoped exception (operator authorization, DECISIONS same
   date), rendered between the deck and the product cards by the
   frontmatter-gated layout slot. *(Amended 2026-07-30, client
   direction after the compliance flag: the words "temporary" /
   "temporarily" do not appear in rendered site copy — Amy sets
   duration expectations directly in consultation. The indication-style
   phrasing above renders without the adverb; the hedged Daxxify label
   fact and Phentermine's "short-term use" wording are unchanged.
   DECISIONS 2026-07-30.)*
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
   stay out — render "prescription". The lip style-guide graphic
   (text-free version since 2026-07-21) ships under the DECISIONS
   2026-07-21 override; the Evolus-produced Evolysse film that shipped
   beside it under the same date's as-is override was REMOVED from the
   page at the client's direction 2026-08-21 (DECISIONS same date) — the
   page carries no video, and its photography is Amy's round-5 picks
   (two hand-mirror frames and the lip-injection detail beside "Lips,
   styled"). The §8.4 Evolus ranking sentence
   was authorized on this page 2026-07-21 → 2026-08-21 (the standalone
   EvolusCallout noir plate since 2026-07-30); at the client's direction
   2026-08-21 that plate gave way to the EvolusLaurel ranking plaque,
   rendered in-body in the plate's exact spot under "What they are"
   (operator placement choice; §8.4's second scoped exception widened
   to this page — DECISIONS same date). The "#1" sentence now renders
   on /about only.
5. **Biostimulators** — collagen-stimulating treatments: PDO Threads,
   Radiesse. Factual description of category; no "lifting results" promises.
   Radiesse is a **biostimulator, not a dermal filler**, for this catalog —
   it lives on this page, not Dermal Fillers (operator-confirmed 2026-07-21
   via radiesse.com, which markets it as "the first and only injectable
   biostimulator"). That superlative and "FDA-approved" stay off-site (§8);
   PDO threads are the VSoft Lift line. Media (2026-08-21, DECISIONS
   same date): two of Amy's own reels play in the page's media rows
   via `TreatmentVideo` (`frame="bare"`, sounded, `autoplay="inview"` —
   muted on approach, tap for sound; no printed caption) — the
   Radiesse-visit film beside "A longer view of structure" and her
   Instagram reel beside "Individualized, with Amy" — each under its
   recorded operator overrides (§8.3 exception list; CLAUDE.md
   constraints 2 and 3). The page carries no photographs.
6. **Regenerative Treatments** — PRP, and PRP with microneedling
   (trimmed to the live Vagaro menu, operator decision 2026-07-19; PRF,
   PDRN, Illuma, VAMP, and Rejuran return only if Amy confirms them as
   current offerings). Describe what the treatments are; no
   healing/repair outcome claims. *(Amended 2026-08-01, operator: PRP on
   its own is used for stimulating hair growth — operator-confirmed
   fact — and PRP with microneedling is the skin-focused pairing. The
   two productDetails definition sentences ship verbatim as client
   wording under a recorded override of this brief's no-outcome-claims
   rule, scoped to those two exact sentences; anything further reverts
   to the rule — DECISIONS 2026-08-01.)*
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
   *(Updated 2026-07-22 — `{{BIOTE_FDA_DISCLAIMER}}` RESOLVED §17. The
   disclaimer had been rendering as a visible placeholder token, so the
   symptom-awareness permission was never actually usable; it is now.
   The permission covers the linter's symptom vocabulary — fatigue, low
   energy, night sweats, hot flashes, brain fog, libido, mood swings,
   trouble sleeping, poor sleep, weight gain. It does **not** extend to
   disease names: heart disease, diabetes, osteoporosis, anxiety,
   depression, PTSD, cognition and bone-density claims stay banned here
   exactly as everywhere else, disclaimer or not. Biote's post-procedure
   timeline — insertion intervals, procedures per year, lab cadence — is
   frequency/protocol material and never appears on the site.)*
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
    (dosing-class — one pixel-scoped carve-out, operator override after
    the compliance flag, DECISIONS 2026-08-21: the page's cart photo
    `amy-pixel8-cart.jpg` shows the console readout, a suggested depth
    range included, and ships as-is; no value is ever restated in text;
    the page's other photo is the handpiece-in-hand menu-card frame,
    reused), no session counts or scheduling intervals
    (protocol-class), no results timelines or downtime promises, no PIH
    claims, no "first and only"/MHz comparisons (superiority), no
    third-party med-spa names from the brochure. Factual device/procedure
    descriptions only; no resurfacing/anti-aging outcome claims; consult
    routing.
11. **Body Contouring** *(added 2026-07-19, Vagaro alignment)* — Evolve,
    a non-invasive device-based treatment; describe by intended design
    (skin tightening, muscle toning) only — never as outcomes. No
    body-fat or measurement language of any kind. Consult routing.
    Page visual since 2026-08-21: Amy's own Evolve reel — a
    site-authored film in the session row (bare frame, autoplay-muted
    opt-in; screening record DECISIONS same date) — which replaced the
    2026-08-04 Reel-screenshot photo.
12. **Laser Treatments** *(added 2026-07-22, from the operator-supplied
    Venus Versa brochures — a constraint-8-class view-only source, never
    committed)* — **Venus Versa Pro** (Venus Concept), a device platform
    *(named "Venus Versa" until 2026-08-04; the Pro naming rests on the
    operator's photo of Amy's own console and Amy's approval on the
    PR #85 preview — DECISIONS 2026-08-04)*.
    The line title "Laser Treatments" is the operator's naming choice
    (2026-07-22, chosen after the accuracy flag: the applicators are
    intense pulsed light and radiofrequency, not laser — body copy
    states the physics factually as the mitigation). Three
    applications, all appearance-hedged, mechanism as design intent:
    **NanoFractional RF resurfacing** (appearance of wrinkles, enlarged
    pores, uneven texture, scarring; "designed for all skin types and
    tones" permitted as a manufacturer design fact — never "safe and
    effective"); **IPL photo-rejuvenation** (appearance of sun damage,
    brown spots, small capillaries, redness; applicators stated as
    FDA-cleared — the accurate device term, no indication lists);
    **Multi-Polar RF + PEMF** (appearance of facial fine lines and
    wrinkles; FDA-cleared applicator). Line-specific exclusions: the
    manufacturer's marketing name for the third application (a banned
    angle) never appears anywhere in the repo; no session counts or
    scheduling intervals (protocol-class — a series price keyed by its
    count is a unit of sale, the §7.11 reading, operator decision
    2026-08-21); no downtime or results-timeline promises; no
    "lesions"/Fitzpatrick indication detail; no pin counts or
    device-spec figures; no brochure before/after cases or their named
    med-spas; no blanket platform-clearance claim. **Pricing (2026-08-21,
    resolving `{{VENUS_VERSA_MENU}}`):** transcribed from the two
    operator-supplied Mobile Aesthetics pricing flyers (`Laser_Hair.jpg`,
    `Venus_Versa_Pro.jpg` — constraint-8-class view-only sources, never
    committed; their marketing copy never transfers) as `priceLines` on
    the product cards: per area/applicator, single and series. **Menu
    item names are flyer-verbatim under operator override** (DECISIONS
    2026-08-21): "Isolated Lesion (up to 3)", "Under Eye & Brow Lift",
    "Eye Laxity", and the minute-keyed fine-line items are admitted as
    menu item names only — the exclusions above otherwise stand, and
    the manufacturer-name rule stands. The three Versa Pro applications
    stay consult-routed.
    **Venus Epileve laser hair removal** *(added 2026-08-21 — the
    line's fourth service and its one true laser; operator-confirmed as
    offered)*: a laser hair-removal device, described by that fact alone
    (no wavelength, spec, or mechanism copy); priced by area — small /
    medium / large / extra-large tiers with their flyer area lists, plus
    women's and men's packages — single treatment and series of six
    (unit of sale; all three guide columns shown — single, full series
    of six, full series at ~15% off — in the `PriceSheet` ledger, round 2
    of 2026-08-21). Bookable directly: the section carries its own Book CTA
    (operator decision 2026-08-21); the page-level CTA stays consult.
    Pixel-level carve-out, operator override after the compliance flag
    (DECISIONS 2026-08-21): the page's Epileve photo
    `amy-epileve-window.jpg` shows the device console's settings
    readout legibly and ships as-is; no value is ever restated in text.

## 8. Content compliance rulebook (governs every string in the repo)

**Never, anywhere** (page copy, meta, alt text, JSON-LD, OG, microcopy):

1. Dosing in any form: doses, units, mg/mcg quantities, reconstitution,
   frequency, duration protocols, titration. *Scoped exceptions
   (operator overrides after the compliance flags — DECISIONS
   2026-07-20 and 2026-07-21): the exact price strings enumerated in
   `compliance/banned-patterns.json` `allowedStrings` — mg-keyed GLP-1
   vial tiers and per-unit neuromodulator prices — may appear as
   product pricing. Fifth authorization (DECISIONS 2026-08-04): the
   four Private Injector Training curriculum-topic strings, enumerated
   in exact `<li>`-wrapped source form, on /injector-training only —
   course-topic titles containing no quantities, flyer-verbatim at the
   operator's direction over the recommended paraphrase. Pixel-level
   (operator override after the flag — DECISIONS 2026-08-21):
   `amy-pixel8-cart.jpg` on /services/skin-rejuvenation only, whose
   PiXel8-RF console readout — settings values and a suggested
   needle-depth range — is legible in the served source; no value is
   ever restated in text. And `amy-epileve-window.jpg` on
   /services/laser-treatments only (DECISIONS 2026-08-21), whose Venus
   Epileve console readout — fluence, pulse-duration, and speed values
   with units — is legible in the served source; same terms. Nothing
   else.*
2. Disease claims: treat / cure / prevent / diagnose; disease names in benefit
   context (Alzheimer's, Parkinson's, cancer/chemotherapy, diabetes, etc.).
3. Efficacy/outcome promises: guarantees, specific results, numbers,
   before/after implications, "powerful results", "proven results".
   *Scoped exception (operator override — DECISIONS 2026-07-21): the
   Evolus ICON event film on /about (moved from wrinkle-relaxers at the
   client's direction 2026-08-18, exception terms unchanged; carried
   as-is; its
   comparative-efficacy remarks are the manufacturer's own and its
   captions transcribe the event speech faithfully). And, site-authored
   (DECISIONS 2026-08-21): Amy's Radiesse-visit reel on
   /services/biostimulators, whose cut reads as a before/after sequence
   and whose carton shot shows a per-vial unit quantity — carried as-is
   under operator override, client release on file (her Instagram reel
   on the same page carries no claims content). Nothing else — the
   Evolus-produced Evolysse film on /services/dermal-fillers carried the
   same as-is exception from 2026-07-21 until 2026-08-21, when the client
   removed it from the site; that exception is RETIRED (DECISIONS
   2026-08-21).*
4. Unsubstantiated superiority: "#1", "best", "top-rated" — banned.
   *Scoped exception ({{EVOLUS_CLAIM}} resolved 2026-07-21, operator
   override after the flag — DECISIONS): the exact sentence
   "Charlotte's #1 Evolus provider", enumerated in `allowedStrings`,
   published unattributed at the operator's direction on the /about
   page only (moved off wrinkle-relaxers at the client's direction
   2026-08-18; replaced by the Laurel plaque on dermal-fillers
   2026-08-21). Basis: operator's
   confirmation that the designation comes from Evolus + the same claim
   live on the practice's own site; the recommended Evolus rep email
   remains the outstanding substantiation upgrade. Second scoped
   exception (operator authorization 2026-08-19 — DECISIONS same
   date): the two ranking sentences rendered by the EvolusLaurel
   plaque on /services/wrinkle-relaxers (layout slot) and, since
   2026-08-21 at the operator's direction, /services/dermal-fillers
   (in-body, the retired "#1" plate's spot — DECISIONS same date),
   nowhere else — "The Top Evolus
   Injector in Charlotte." and "And among the Top 50 in the United
   States." — published unattributed at the operator's direction
   (the attribution kicker was offered and declined, consistent with
   2026-07-21). Basis: the operator's verification with Evolus,
   which covers both the Charlotte designation and the national
   standing. Neither sentence contains a token the superiority
   patterns can see, so the authorization is recorded here and in
   CLAUDE.md constraint 3 rather than in `allowedStrings` (the
   photo-override precedent); the ranking never appears in meta
   descriptions, OG tags, alt text, or JSON-LD. Nothing else.*
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
- **Products → Skinbetter storefront:** connect.skinbetter.com/MobileAesthetics
  (resolved `{{SKINBETTER_URL}}` — the practice storefront carrying her
  businessPartner id, verified in-browser 2026-07-23). New tab, tracked
  (`skinbetter_click`).
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
- **Home video carousel (2026-08-14, DECISIONS same date):** four
  self-hosted films on the media origin (`media.needlegirlie.com`,
  §2 — in `public/media/` until 2026-08-17) — two Evolus co-op Jeuveau
  spots carried AS-IS with complete FDA safety information (never
  trimmed or cropped; `object-fit: contain` is a compliance
  requirement) around Amy's own studio reel (operator override; client
  releases confirmed), plus the Mobile Aesthetics team film as film 4
  (2026-08-17: constraint-2 operator override after the compliance
  flag; team releases confirmed on file; no claims content — DECISIONS
  same date). Facade-loaded per the pattern above: zero video
  elements and zero video bytes until the stage scrolls into view;
  muted renditions; captions mirror each film's on-screen text
  (public/media/*.vtt — outside lint scope, controlled by the per-film
  override entries); reduced-motion serves posters + play-on-request.
  Treatment-page films (`TreatmentVideo`) are click-to-play with sound
  by default; the `autoplay="inview"` opt-in (2026-08-21, the two
  biostimulators reels — operator direction, DECISIONS same date) plays
  a film MUTED and looping while ~a third of it is on screen via the
  static `public/js/treatment-video.js` (~2KB; reduced motion =
  click-to-play; the native controls are the pause and the
  tap-for-sound). Opt in only for Amy's own speech-free films — never a
  manufacturer film or one with narration.
  Amy's reel plays at 0.5× via per-slide `data-rate`/playbackRate
  (operator/Amy tuning 2026-08-15 — DECISIONS same date; the master
  file is untouched, captions track media time). Rates are for Amy's
  own films ONLY — the manufacturer films always play at 1×; their
  presentation is part of the carried-as-is posture.
  Add/replace procedure: docs/RUNBOOK.md ("Adding or replacing a
  homepage commercial" + "Publishing a film"). The Blob media origin
  (§2) is BUILT — films upload to Blob, captions ship by PR.

## 10. SEO specification

- Consistent **NAP** site-wide: Needle Girlie / Amy Palacios, FNP —
  **Mobile Aesthetics** (the studio's name, on its own line between the
  brand line and the address since 2026-08-17 — footer and location
  card; the constraint-2-permitted factual note) —
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

- **Cookieless, consent-banner-free.** `{{ANALYTICS_PROVIDER}}` resolved
  NONE at launch (2026-08-04); **Plausible chosen and fully prepped
  2026-08-17** (operator decision, external-audit Finding 6 — billing
  sits with the client per the engagement's pass-through model, ~$9/mo).
  The wiring ships DARK: the tracker is **self-hosted**
  (`public/js/plausible.js` — the static-script rule; `script-src`
  stays `'self'`), BaseLayout emits it only when `siteConfig.analytics`
  is enabled, the privacy page swaps its analytics bullet in the same
  build, and `generate-swa-config.mjs` admits `plausible.io` in
  `connect-src` only when the built page actually shipped the script.
  The flip is the operator's act at relaunch — procedure in
  docs/RUNBOOK.md "Turning on analytics". Abstraction stands:
  `src/lib/analytics.ts` (`track(event, props?)`) so the vendor can
  change without touching components; nothing calls `track()` yet
  (zero client-side component code) — pageviews are the v1 signal.
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
  checklist. Since 2026-08-17 the audit Chrome runs
  `--force-prefers-reduced-motion` — contrast is judged on each
  element's settled colors, not a scroll-animation mid-state
  (DECISIONS 2026-08-17; the flake class is documented in
  docs/RUNBOOK.md Troubleshooting).

## 13. Performance budget (CI-enforced via Lighthouse CI)

- LCP < 2.5 s, CLS < 0.1, INP < 200 ms on emulated mid-tier mobile.
- Total JS ≤ 30 KB (target ~0); no client framework hydration. *(First
  consumer, 2026-08-14: the home carousel's ~3KB static script
  (public/js/video-carousel.js) — the budget and the no-hydration rule
  are unchanged; DECISIONS same date. Third consumer, 2026-08-21: the
  treatment-film autoplay-in-view script, public/js/treatment-video.js,
  ~2KB, rendered only on pages whose films opt in — today
  /services/biostimulators alone; the second consumer is the dark
  Plausible tracker, §11.)*
- Hero image: optimized, `fetchpriority="high"`, explicit dimensions;
  everything below fold lazy.
- Fonts: 1 family (Playfair Display — since 2026-08-15), subsetted
  WOFF2, preloaded latin weight, swap.
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

**Relaunch guard (takedown-era, 2026-08-17 — external-audit Finding
1; RETIRES in the relaunch PR):** `relaunch-guard.yml` runs two jobs
with NO paths filter, both **required status checks** (the repo's
first branch protection): `takedown-revert-guard` (PRs into `phase-c`
+ pushes to it — fails if the takedown revert is reachable) and
`gutted-merge-guard` (PRs into `main` — fails if a phase-c-derived
merge drops any phase-c file). Never mark `verify-and-deploy`
required: its docs paths-ignore means docs-only PRs would wait
forever on a check that never reports. Full rationale: DECISIONS
2026-08-17; procedure: docs/RUNBOOK.md "Relaunching after the
takedown".

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
  (client is billed directly by Microsoft; alerts protect her). The
  budget `startDate` is IMMUTABLE after creation — every re-deploy
  passes the live budget's own anchor, `2026-07-01` (learned
  2026-08-17; the RUNBOOK's deploy command pins it).
- `storage.bicep` (added 2026-08-17, §2 media origin) — LRS storage
  account, container `media` with anonymous blob-read; serves the
  .mp4 films as `media.needlegirlie.com` via the Front Door `media`
  route (`frontdoor.bicep`) + `media` CNAME/TXT (`dns.bicep`).
- No APIM. No WAF policy unless instructed (`{{WAF_DECISION}}`). Nothing for
  Phase 3 (Container Apps, Postgres, OpenAI) — not now.

## 16. Definition of done (launch checklist)

> **LAUNCHED 2026-08-05** — operator sign-off commit ad8fbde (PR #93)
> → launch merge PR #5 (`aae51ba`) → Production run 30981190812 green
> (verify + approvals + locked build + deploy + purge). Boxes record
> launch-day verification; the one left open is a standing post-launch
> item. DECISIONS 2026-08-05.

- [x] All §6 pages built; every treatment page `clinicianApproved: true`
      (Amy's written sign-off logged by the operator — commit ad8fbde,
      2026-08-05, all twelve plus the non-gated /injector-training).
- [x] Legal pages present and marked as reviewed by counsel (operator confirms).
      *(AMENDED 2026-08-04 — operator accepted launching with
      provider-drafted pages; DraftBanners removed, effective dates set,
      counsel review moved post-launch. DECISIONS same date.)*
- [x] `npm run verify` green; approvals check green (both in Production
      run 30981190812, 2026-08-05).
- [x] Lighthouse budgets met on Home + a treatment page (mobile).
      *(Launch-day live spot-run on needlegirlie.com: 1.00 across all
      four categories, LCP 1749 ms, CLS 0.0062; CI medians across 7
      URLs green in the same run.)*
- [ ] Manual a11y pass done (keyboard + screen reader spot-check).
      *(STANDING POST-LAUNCH ITEM — automated axe is 24/24 green;
      the human keyboard + screen-reader pass remains open.)*
- [x] All outbound handoffs verified to **Amy's** destinations (Vagaro URL is
      hers, not the shared location's; Skinbetter partner link correct).
      Ownership clause satisfied 2026-07-23 — Mobile Aesthetics is Amy's own
      practice (sole owner; DECISIONS 2026-07-23); link reachability is
      still verified at launch. *(2026-08-05: Skinbetter 200; Vagaro
      serves browsers but 403s non-browser clients (bot protection) —
      it is Amy's live booking page.)*
- [x] Analytics events verified firing in the provider dashboard.
      *(AMENDED 2026-08-04 — resolved as none-at-launch; the line is
      satisfied by the recorded no-provider decision, DECISIONS same
      date. Front Door edge reports carry traffic visibility.)*
- [x] Front Door lockdown verified: SWA default hostname returns 403 direct;
      site serves only via needlegirlie.com; www → apex 301; HTTP → HTTPS.
      *(Observed 2026-08-05: the platform answers direct default-hostname
      hits with **404** and zero site content rather than the documented
      403 — the config is the documented forwardingGateway form and the
      security property holds; www → apex 301 and HTTP → HTTPS 307
      verified live.)*
- [x] OG/Twitter cards render correctly; sitemap submitted-ready; previews
      noindexed, production indexable. *(2026-08-05: five og: properties
      live; production has zero noindex.)*
- [x] 404 page works at the edge (2026-08-05: branded, 404 status).
- [x] Runbook written: deploy, roll back, purge cache, edit content, the
      approval workflow, and the preview-link process for Amy's reviews
      (previews are public + noindexed since 2026-07-21).
      *(docs/RUNBOOK.md; the approval workflow lives in
      docs/CLINICIAN-SIGN-OFF.md, now executed.)*

## 17. Placeholder registry

Use these tokens verbatim in code/content. Never invent values for them.

| Token | What it is | Status |
|---|---|---|
| `{{VAGARO_URL}}` | Amy's own Vagaro booking URL (NOT the shared location handle) | RESOLVED 2026-07-18 (siteConfig) — supplied handle is the shared location's; §9 flag stands, revisit at §16 |
| `{{VAGARO_SERVICE_LINKS}}` | Optional per-service deep links | Operator to supply |
| `{{SKINBETTER_URL}}` | Amy's partner storefront URL | Resolved 2026-07-23: connect.skinbetter.com/MobileAesthetics (QR decode, verified; DECISIONS 2026-07-23) |
| `{{PHONE}}` / `{{HOURS}}` / `{{ADDRESS_DISPLAY}}` | NAP details as displayed | PHONE resolved 2026-07-07; ADDRESS resolved 2026-07-18; **HOURS CLOSED 2026-08-04 — Amy's decision: hours are not listed on the website, anywhere. Not a pending value: the siteConfig field, the LocationCard line, and the JSON-LD openingHours property were all removed (DECISIONS 2026-08-04). Listing hours later is a deliberate re-add, not a token resolve.** |
| `{{SOCIAL_LINKS}}` | Verified handles (IG, FB, YouTube, Yelp, TikTok) | RESOLVED 2026-07-18 (FB/IG/Yelp only; Yelp is the location's — flagged) |
| `{{AMY_BIO}}` | Approved bio facts & credentials | RESOLVED 2026-07-19 (operator-supplied listing; Amy's wording confirmation pending — DECISIONS) |
| `{{PEPTIDES_PUBLIC_LIST}}` | Which peptides appear publicly | RESOLVED 2026-07-21 (operator — Amy's nine-item injectable menu: BPC-157/TB-500, GHK-Cu, GLOW, Glutathione, Ipamorelin, MOTS-c, NAD+, Sermorelin, Tesamorelin; DECISIONS 2026-07-21. Registry status flip operator-authorized 2026-08-01) |
| `{{NEUROMOD_LIST}}` | Confirmed neuromodulator products | RESOLVED 2026-07-19 (live Vagaro menu, operator-confirmed: Jeuveau, Xeomin, Daxxify) |
| `{{PRICING_DISPLAY_MODE}}` | none / consult / startingAt (default: consult) | Open decision |
| `{{CHEMICAL_PEELS_MENU}}` | Peel menu from Amy (brands, tiers, per-peel pricing beyond the $180 start) | Open — page carries a compliant placeholder (2026-07-22) |
| `{{VENUS_VERSA_MENU}}` | Laser-treatments menu from Amy (which Venus Versa applications are priced, and how) | **Resolved 2026-08-21** — the two Mobile Aesthetics pricing flyers (view-only); all four cards priced, Epileve laser hair removal added (§7.12) |
| `{{EVOLUS_CLAIM}}` | "#1 Evolus provider" substantiation outcome | RESOLVED 2026-07-21 (operator override — exact sentence in `allowedStrings`, two Evolus product pages; §8.4) |
| `{{BIOTE_FDA_DISCLAIMER}}` | Biote's exact required FDA wording, rendered by `BioteDisclaimer` | RESOLVED 2026-07-22 (operator-authorized — Biote's own printed brochure wording; exact sentence in `allowedStrings`, fourth authorization. Had been shipping as a *visible placeholder token* on the hormone page; §7.8) |
| `{{BIOTE_PERMISSION}}` | Biote logo/co-marketing permission | Open decision |
| `{{RETATRUTIDE_COUNSEL}}` | Attorney-approved investigational wording | Open decision |
| `{{MEDIA_SCOPE}}` | How much photo/video goes on-site | RESOLVED 2026-08-04 — closed as the practice already in force: every photo/film ships on a per-item operator approval, recorded in DECISIONS (no blanket scope; C8 prerequisite (c) satisfied) |
| `{{ANALYTICS_PROVIDER}}` | Plausible (default) or alternative | RESOLVED in two steps: NONE at launch (2026-08-04, operator-delegated); **Plausible chosen 2026-08-17** (operator, external-audit Finding 6) and fully prepped SHIPS-DARK — the relaunch-day flip is a two-value `siteConfig.analytics` edit (~$9/mo starts then; procedure RUNBOOK "Turning on analytics"; §11 has the design) |
| `{{FRONT_DOOR_ID}}` | X-Azure-FDID GUID after FD provisioning | After infra |
| `{{AZURE_REGION}}` | Deployment region | Operator to supply |
| `{{WAF_DECISION}}` | Front Door WAF at launch: yes/no | Open decision |
| `{{GBP_STATUS}}` | Google Business Profile ownership | Operator handles |

## 18. Build phases (work in this order; plan → approve → build each)

- **Phase A — Scaffold & pipeline:** Astro scaffold, Tailwind v4, repo
  structure, SWA config generation (both variants), GitHub Actions (preview +
  production skeleton), compliance linter + approvals check stubs wired into
  `verify`, optional Bicep. Exit: a "hello, Needle Girlie" page deploys to a
  preview environment and to production behind Front Door. (Previews were
  password-protected when Phase A closed; protection was removed
  2026-07-21 — §14, DECISIONS.)
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
