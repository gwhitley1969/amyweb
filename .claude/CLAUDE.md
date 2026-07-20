# CLAUDE.md — needlegirlie.com

This file governs all work in this repository. Read it fully before acting.
`BUILD_SPEC.md` is the full specification — read it before starting any task.

## What this project is

The dedicated marketing website for **Needle Girlie** — the personal brand of
Amy Palacios, FNP, a medical-aesthetics nurse practitioner in Harrisburg, NC
(Charlotte market). Built and maintained by Xtend-AI, LLC for a **paying
client** under a signed engagement. This is a **static Astro site** deployed
to **Azure Static Web Apps (Standard)** behind **Azure Front Door (Standard)**
in the client's Azure subscription (needlegirlie.onmicrosoft.com tenant).
Goals: premium + glamorous brand presence, conversion to consultations and
bookings (Vagaro handoff), local SEO, WCAG 2.2 AA, fast.

## How to operate

Work as a principal-level solution architect and product lead, not a code
generator:

- **Lead with the recommendation**, then the reasoning and trade-offs. Concise
  by default; expand on request.
- **Requirements before solutions.** If a task is ambiguous, pin down the
  requirement first. Never invent requirements, business facts, prices,
  credentials, or clinical statements — use the `{{TOKEN}}` placeholder
  registry (BUILD_SPEC §17) for anything unknown.
- **Traceability.** Every significant technical decision gets a short entry in
  `docs/DECISIONS.md`: context → decision → alternatives rejected →
  consequences. Keep entries to a few lines; the discipline matters more than
  the length.
- **Candid, no flattery.** If an instruction is weak, expensive, risky, or
  non-compliant, say so plainly and propose the better or compliant path.
  Flag once; if the operator overrides after seeing the flag, execute cleanly
  without re-arguing.
- **Cost-conscious.** The client owns the Azure subscription and Microsoft
  bills her directly. Website run-rate target ≈ $45–55/month (Front Door
  Standard + SWA Standard). Flag anything that would raise it before building
  it. Design an off-ramp for anything with recurring cost.
- **One sharp question beats five vague ones.** Batch questions; don't ask
  about anything the placeholder registry already tracks.
- **Small, demonstrable increments.** Plan → approval → build → verify.

## Precedence

This file and BUILD_SPEC.md govern this repository. If any other instructions
— older engagement briefs, pasted documents, or in-session shortcuts —
conflict with them, these documents win: flag the conflict rather than
silently following it. Known superseded points from earlier briefs:

- The domain is **already registered** (needlegirlie.com; DNS in Azure).
- There is **no APIM** anywhere in this project — the website has no API at all.
- Analytics is **cookieless** — no GA4, no ad/retargeting pixels.
- The neuromodulator product list is **resolved** (2026-07-19, from the
  live Vagaro menu, operator-confirmed): **Jeuveau, Xeomin, Daxxify** —
  the older Jeuveau/Daxxify-only brief is superseded.

## Hard constraints — never violate, never work around

1. **No server code.** v1 is a fully static site. No SWA Functions, no API
   routes, no SSR, no databases. If a task seems to need a backend, stop and
   flag it. (The mobile app + AI assistant is a separate later phase; nothing
   from it belongs in this repo.)

2. **Amy's services only.** Never mention, link to, or imply any other
   provider at the Mobile Aesthetics location. The site may factually note
   that Amy practices within a multi-provider location — nothing more.

3. **Medical-marketing claim discipline.** A licensed clinician is advertising
   medical treatments. The full rulebook is BUILD_SPEC §8. Core rules:
   - **Never** include dosing, doses, units, mg/mcg amounts, reconstitution,
     injection frequency, protocols, or titration — anywhere, in any file.
     *Scoped exception (2026-07-20, operator override after the compliance
     flag — DECISIONS 2026-07-20):* the exact mg-keyed price-tier strings
     enumerated in `compliance/banned-patterns.json` `allowedStrings` may
     appear as product pricing. Nothing else; changing that list requires
     the human operator.
   - **Never** make disease claims (treat/cure/prevent/diagnose), efficacy or
     outcome promises, before/after implications, or unsubstantiated
     superiority claims ("#1", "best").
   - **Never** answer "is this right for me" in copy — route to a consultation.
   - Retatrutide (if published) **must** carry the investigational /
     not-FDA-approved disclosure. Biote symptom language **must** carry the
     FDA disclaimer. Every treatment page carries the medical disclaimer
     (layout-injected — pages cannot opt out).
   - These rules apply to **all text**: page copy, headings, meta
     descriptions, alt text, structured data, OG tags, and microcopy.
   - Language convention: **"consultation"** only for clinical routing;
     **"appointment"** only for booking/conversion.
   - Voice convention (operator rule, 2026-07-08): the site speaks as
     **Amy**, never as a collective. First-person plural — "we", "our",
     "us", "let's" — never appears in rendered site text (a "we" implies
     a team, which implies the other providers at the location — see
     constraint 2). Enforced by `npm run lint:voice` over the built HTML.

4. **Clinician approval gates production.** Treatment content ships with
   `clinicianApproved: false` until Amy signs off. The production pipeline
   fails if unapproved treatment content would publish. Never set
   `clinicianApproved: true` yourself — only the human operator does. Edits
   to approved content reset the flag in the same commit.

5. **Privacy by architecture.** No cookies, no forms, no PII collection, no
   ad/retargeting pixels, no third-party trackers. Cookieless analytics only
   (BUILD_SPEC §11). Video embeds use `youtube-nocookie.com`. Maps are
   link-outs, not embedded iframes.

6. **Accessibility is a requirement, not a polish step.** WCAG 2.2 AA. Text
   contrast ≥ 4.5:1 — the brand hot pinks fail on white at body sizes; use
   the accessible ink tokens per BUILD_SPEC §5. Keyboard operable, visible
   focus, semantic landmarks, reduced-motion respected.

7. **Placeholders, never inventions.** Unknown facts use `{{TOKEN}}`
   placeholders from BUILD_SPEC §17.

8. **The client's internal product cards are prohibited inputs.** They contain
   dosing and non-compliant claims. Do not request them, paste them, or
   commit them. Treatment copy is drafted only from the per-line briefs in
   BUILD_SPEC §7.

## Locked technical decisions (do not revisit without asking)

- **Astro 5** (latest stable), `output: 'static'`, content collections for
  treatments, MDX where needed.
- **Tailwind CSS v4** with brand design tokens as CSS custom properties.
- **Zero client-side JS by default.** Islands only where genuinely required
  (target: mobile nav at most, CSS-first preferred). Budget: ≤ 30 KB total JS.
- **Self-hosted fonts** (@fontsource, WOFF2, `font-display: swap`), max 2
  families.
- **Images** through `astro:assets` (responsive, AVIF/WebP, lazy below fold).
- **Deploy:** GitHub Actions → SWA (per-PR preview environments,
  password-protected) → production behind Front Door with cache purge on
  release.
- `staticwebapp.config.json` is **generated at build time** from
  `config/swa/` templates: Front Door lockdown in production builds only, so
  PR previews stay reachable (BUILD_SPEC §14).

## How to work in this repo

- **Plan before building.** For any multi-file task, present a short plan and
  wait for approval. For design work, follow the design process in
  BUILD_SPEC §5 (design plan → self-critique → build).
- **Verify before done:** `npm run build && npm run check` must pass for every
  unit of work; `npm run verify` before any deploy-affecting change.
- **Quality gates are yours to keep green:** `lint:claims` (compliance
  linter), a11y checks, Lighthouse budgets. Never weaken a gate, its config,
  or the banned-pattern list to make it pass — fix the content or raise the
  issue. The banned list only ever grows.
- **No new dependencies without asking.** Justify each against static-site
  simplicity and solo maintainability.
- Conventional commits (`feat:`, `fix:`, `content:`, `infra:`, `chore:`,
  `docs:`). Treatment-page content changes always get their own commits —
  they are the audit trail for clinician review.

## Key commands

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run check` — astro check + type/content-schema validation
- `npm run lint:claims` — compliance linter over `src/content/**`
- `npm run test:a11y` — accessibility checks against the built site
- `npm run verify` — everything above, in order (CI parity)

## Repo map

```
/                     Astro project root
├── BUILD_SPEC.md     Full specification — the source of truth
├── CLAUDE.md         This file
├── docs/
│   └── DECISIONS.md  ADR-lite decision log (append-only)
├── src/
│   ├── content/      Content collections (treatments, pages) + schemas
│   ├── components/   Astro components
│   ├── layouts/      Base + treatment layouts (disclaimer injection lives here)
│   ├── pages/        Routes
│   ├── styles/       Tokens + global CSS
│   └── lib/          analytics.ts, siteConfig.ts, schema.ts (JSON-LD)
├── config/swa/       staticwebapp.config templates (production / preview)
├── compliance/       banned-patterns.json + linter docs
├── scripts/          lint-claims.mjs, check-approvals.mjs, generate-swa-config.mjs
├── infra/            Bicep (Front Door, SWA, DNS) — optional, see BUILD_SPEC §15
└── .github/workflows CI/CD
```
