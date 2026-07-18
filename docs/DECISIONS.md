# Decision log (ADR-lite, append-only)

Format per CLAUDE.md: context → decision → alternatives rejected → consequences.

---

## 2026-07-07 — Governing docs stay in `.claude/`

CLAUDE.md's repo map shows `BUILD_SPEC.md` at the repo root, but both files
were supplied in `.claude/` where Claude Code loads them automatically.
**Decision:** keep them in `.claude/`, commit them there. Rejected: moving to
root (breaks the operator's established location for no functional gain).
Consequence: the repo-map entry is a known, documented deviation.

## 2026-07-07 — Content config at `src/content.config.ts`

BUILD_SPEC §3 names `src/content/config.ts`; Astro 5's content layer expects
`src/content.config.ts` (glob loaders, current canonical path).
**Decision:** use `src/content.config.ts`. Rejected: the legacy path (works
today, deprecated direction). Consequence: one-line spec deviation, documented.

## 2026-07-07 — a11y gate: pa11y-ci with the axe runner

BUILD_SPEC §12 allows @axe-core/cli or pa11y-ci. **Decision:** pa11y-ci —
one config file for multiple URLs, axe as the runner, CI-friendly output.
A small orchestrator (`scripts/test-a11y.mjs`) serves `dist/` via
`astro preview` so local and CI runs are identical. Rejected: @axe-core/cli
(no multi-URL config), a standalone static server dependency (astro preview
already ships with the project).

## 2026-07-07 — `verify` includes the Lighthouse budget check

CLAUDE.md's `verify` lists build/check/lint:claims/test:a11y; BUILD_SPEC §14
also includes Lighthouse budgets in verify. **Decision:** implement the
superset — `verify` = build → check → lint:claims → test:a11y → test:perf —
so both documents are satisfied and local runs match CI exactly. Consequence:
local runs need a Chrome/Edge (falls back to puppeteer's Chrome, which
pa11y-ci installs anyway).

## 2026-07-07 — Lighthouse skips only `is-crawlable`

Preview and local builds are deliberately `noindex` (BUILD_SPEC §4), which
fails Lighthouse's `is-crawlable` audit and would sink the SEO category below
budget on every PR. **Decision:** `skipAudits: ["is-crawlable"]` in
lighthouserc.json — skipped audits don't count toward the category score.
Production indexability is verified separately in the launch checklist
(§16). Rejected: lowering the SEO budget (weakens the gate for real issues);
auditing a production-stamped build in PRs (would need a second build and
a dummy FDID, muddying the lockdown guarantee).

## 2026-07-07 — Gate scripts ship with `--self-test`

§18 calls Phase A's linter/approvals "stubs", but a gate that always passes
proves nothing. **Decision:** both scripts are functional now and run a
self-test (known-bad samples must fail, known-clean must pass) before every
scan. Bad samples are assembled from string fragments at runtime because
banned phrasings (dosing etc.) may not exist verbatim in any committed file
(CLAUDE.md hard constraint 3). Consequence: a silently broken gate fails CI
instead of silently passing it.

## 2026-07-07 — Frontmatter gates use anchored regex, not a YAML parser

`check-approvals.mjs` and the linter's inverse checks only need boolean flags
(`clinicianApproved`, `draft`, `investigational`, `bioteDisclaimer`).
**Decision:** match them with anchored line regexes. Rejected: adding a YAML
dependency (violates no-new-deps default for 4 booleans); hand-writing a YAML
parser (fragile). Consequence: flags must sit on their own frontmatter line —
which the zod schema already guarantees in practice.

## 2026-07-07 — CI deploys the pre-verified `dist/` (`skip_app_build: true`)

**Decision:** the SWA deploy action uploads the exact artifact that passed
the gates; it never builds on its own. A build inside the action would bypass
`verify` and could ship an ungated artifact. Consequence: `PUBLIC_ENV` and
`FRONT_DOOR_ID` must be set at the workflow build step, not in SWA app
settings.

## 2026-07-07 — Production deploy job is armed by `FRONT_DOOR_ID`

Before the Azure infra exists, pushes to main would fail at the production
build (missing FDID) and turn the default branch permanently red.
**Decision:** the deploy job runs only when the `FRONT_DOOR_ID` repo variable
is set; the verify + approvals gates always run. Setting the variable after
Front Door provisioning "arms" production deploys. Rejected: a dummy FDID
default (would ship an origin lockdown that trusts a nonexistent Front Door —
or worse, mask a misconfiguration).

## 2026-07-07 — Region eastus2; infra names; OIDC purge identity

`{{AZURE_REGION}}` was unresolved when the operator asked for the backend to
be built. **Decision:** SWA in `eastus2` (closest SWA region to the Charlotte
market; SWA serves globally regardless — the region holds config only, and a
later move is a redeploy, not a migration). Names: `rg-needlegirlie-web`,
`stapp-needlegirlie`, `afd-needlegirlie` (endpoint `needlegirlie`); DNS stays
in the existing `rg-corp` zone. Cache purge uses an OIDC federated app
(`gh-amyweb-frontdoor-purge`) role-scoped to the Front Door profile only —
no publish-profile secrets, no broader access. Budget: $60/mo subscription
budget, alerts at 50%/80% actual and 100% forecast.

## 2026-07-07 — Interim placeholder restyled black + "Under construction"

Co-founder request via the operator: black background, construction-site
message, brand-pink caution tape (operator chose pink over hazard yellow).
**Decision:** restyle the Phase A placeholder only (BaseLayout body + home
page; black-background logo variant). Not a Phase B pre-decision — the §5
design process still runs; the black-background preference is recorded as a
Phase B design input.

## 2026-07-07 — www.needlegirl.com 301 via Front Door (not DNS alone)

Operator asked for www.needlegirl.com to "point to" needlegirlie.com. DNS
records can't issue certificates or redirects, so the hostname was added as
a Front Door custom domain (managed TLS, no added cost) with an edge rule:
301 straight to the canonical apex (skipping the www.needlegirlie.com hop).
Apex needlegirl.com deliberately left untouched pending operator decision.

**Update (same day):** operator decided apex needlegirl.com is covered too —
same Front Door custom domain + 301 pattern, alias A record at the zone apex.

## 2026-07-07 — Logo provenance: HTML sources are the masters; variants are exports

The logo was made by Claude Design; the operator recovered the original
HTML documents (vector: Playfair Display text + CSS/SVG). **Decision:**
archive them at `src/assets/brand/source/` as canonical masters; produce
every raster variant by rendering them in headless Chrome at high device
scale (`scripts/export-logo.mjs`), never by editing/tracing/upscaling
rasters. Replaced the ~400px-art legacy PNG derivative with 4x exports
(~1850px art). Rejected: AI upscaling and hand-rebuilt SVG (both redraw the
mark, violating CLAUDE.md §3 brand-fidelity intent). Consequence: crisp
rendering at all display sizes; the low-res first-delivery PNGs remain only
as historical artifacts.

## 2026-07-08 — Phase B design-system decisions (per approved design plan)

- **Playfair Display over Fraunces** (display face): it is the wordmark's
  actual typeface (from the canonical HTML source) — exact harmony beats
  the spec's default suggestion. Restricted to h1/h2/hero (≥39px);
  Figtree everywhere else. Fonts self-hosted via @fontsource-variable.
- **fontaine** (devDependency, build-time only) generates metric-adjusted
  fallback faces; the fallback families are referenced explicitly in the
  @theme font stacks because fontaine does not rewrite custom properties.
- **Noir stays #000000 by choice, not constraint:** the --transparent logo
  export from the vector source works (glow composites cleanly on any
  surface), so alpha assets removed the old baked-background limitation.
  True black keeps the neon-sign read.
- **Noir header sitewide**; header/page edge is a hard cut (never a seam).
- **Button fills are ink-pink only** — white-on-magenta measured 4.53:1,
  failing the 4.7:1 headroom rule from the design plan. Magenta remains
  for accents/hovers/edge rules (4.15:1 non-text).
- **JSON-LD pairing:** LocalBusiness typed [MedicalBusiness,
  HealthAndBeautyBusiness]; builders omit unresolved {{TOKEN}} fields.
- **Styleguide is preview-only** via getStaticPaths returning [] in
  production-stamped builds; /styleguide and /styleguide/treatment-demo
  added to the pa11y + Lighthouse URL lists (gates enumerate URLs).
- **Mobile nav: native Popover API** (0 JS; Esc/light-dismiss native;
  support floor Safari 17/2023 — unsupported browsers ignore the attribute
  and show the nav expanded).
- **{{BIOTE_FDA_DISCLAIMER}} proposed as a §17 registry addition** —
  BioteDisclaimer renders the token visibly until the operator supplies
  Biote's exact required wording.

## 2026-07-08 — Mobbin design-pattern review of the treatment template (Phase B addendum)

- **Context:** operator requested an external-pattern check of the treatment
  template before merging PR #2, via the Mobbin MCP (regulated telehealth
  — Hims/Hers; med-spa booking — Fresha; premium wellness — Function,
  Superpower; luxury retail).
- **Outcome — order validated:** the fixed compliance order matches what
  the most-lawyered treatment marketers converge on (disclosures adjacent
  to the products they qualify; consultation-first routing; factual tone).
  No structural change.
- **Adopted (operator-approved):** VisitSteps ("your visit, step by step",
  process-only copy, display-size Playfair counters), AtAGlance fact card
  (siteConfig facts only), FaqAccordion (native details/summary, 0 JS;
  editorial Q&A only — real copy is Phase C), TrustChips (credential and
  process facts), two-tone display-accent utility (pink-500 on white
  3.53:1, pink-300 on noir 11.58:1; blush banned at 3.23:1 — 0.03 above
  the headroom bar is too thin).
- **Rejected:** sticky desktop booking rail (breaks the single-column
  studio measure; duplicates existing CTAs) and mobile fixed bottom CTA
  bar (reads commercial; WCAG 2.2 focus-not-obscured burden). Revisit in
  Phase D with analytics evidence.
- **New standing rule:** compliance text (disclaimers/disclosures) is
  NEVER placed inside an accordion or any collapsed container — Hims
  collapses "important safety information"; we deliberately do not.
- **Gate strengthened:** lint:claims now scans src/components, src/layouts,
  src/lib, and src/styles in addition to content and pages (§8 applies to
  all text; component copy was previously unscanned). Scope, like the
  pattern list, only ever grows.

## 2026-07-08 — Voice rule: Amy, never "we" (operator)

- **Context:** operator review of the Phase B preview — the template read
  too much like the multi-provider location's site
  (yourmobileaesthetics.com). This site spotlights Amy and only Amy.
- **Decision:** first-person plural ("we", "our", "us", "let's") never
  appears in rendered site text. Copy is Amy-centric ("What Amy offers",
  "Visit Amy") or speaks to the visitor. Also reinforces hard
  constraint 2: a "we" implies a team; a team implies the location's
  other providers.
- **Enforcement:** new gate `lint:voice` (scripts/lint-voice.mjs) scans
  the BUILT dist HTML — rendered text, meta descriptions, and JSON-LD —
  so code comments never false-positive. Self-tested like lint:claims;
  wired into `npm run verify`. Lowercase-only "us" matching keeps the
  country abbreviation legal. Gate scope only ever grows.
- **Alternatives rejected:** source-scanning (comments false-positive);
  review-only enforcement (not durable).

## 2026-07-08 — Body font: Figtree → DM Sans (client)

- **Context:** Amy reviewed the styleguide and vetoed Figtree outright.
  Playfair Display stays — it is the wordmark's own face and was not
  questioned.
- **Decision:** DM Sans (variable, latin, @fontsource-variable/dm-sans)
  is the body/UI face — warm geometric, strong at small UI sizes, pairs
  cleanly with Playfair. Operator selected it from four staged candidates
  (Outfit, Manrope, Nunito Sans rejected without a comparison build).
  Figtree dependency removed; two-family cap holds; DM Sans is not
  preloaded (§13: display face only) and relies on swap + fontaine
  metric fallbacks, same as Figtree did.
- **Consequence:** BUILD_SPEC §5's "e.g., Figtree" example stands as
  written (it was illustrative); this entry records the concrete choice.

## 2026-07-08 — Design amendment: "turn on the sign, warm the studio" (client)

- **Context:** Amy's direction — the site should be fun, not clinical.
  Operator calibration chose two levers: motion & sparkle, more pink /
  less white. (Sassy microcopy and a kiss-mark motif were offered and
  not selected.)
- **Motion (amends "nothing animates"):** a fixed vocabulary of exactly
  three CSS-only moves — hero neon *ignites* once on load (2 brightness
  dips max, WCAG 2.3.1-safe; opacity floor 0.5 preserves LCP), the noir
  seam glow *breathes* (4s, subtle; neon-500 stays the only glow), and
  link chevrons *nudge* 3px on hover (amends the earlier "no hover
  nudge" rule). All stilled by the global reduced-motion override.
  Nothing else animates — the cap is the rule.
- **Color (inverts the light neutral hierarchy):** ambient light surface
  is now blush-50; cards and compliance blocks are white (--ng-card,
  surface-scoped) so disclosures read MORE conspicuous, not less.
  Display accent on light deepens pink-500 → magenta-600 (4.53:1 white /
  4.15:1 blush, large-text bar 3.2 — pink-500's 3.23 on blush was too
  thin). The "no white text on magenta fills" rule is untouched.
- **Consequences:** 0 KB JS holds; all contrast pairs recomputed and
  recorded in tokens.css; noir scopes --ng-card to transparent so dark
  modules keep their outline look.

## 2026-07-08 — Motion follow-up: the sign hums (client-verified miss)

- **Context:** operator and Amy could not see the motion on two devices.
  Root cause was design, not delivery (animation verified live via frame
  capture): a one-shot load animation races image download, tab focus,
  and attention — real reviewers missed a 2-second show.
- **Decision:** the hero sign gains a perpetual **neon hum** — a 3.2s
  glow pulse (2.7px↔25px drop-shadow, verified by computed-style
  sampling) that is visible whenever the visitor looks. Ignition dips
  deepened (floor 0.35, LCP-safe). The lockup IS the neon, so the hum
  shares the seam's glow sanction: the neon remains the only thing that
  glows. Reduced-motion stills everything, unchanged.
- **Lesson recorded:** lab-verified ≠ perceived; continuous motion for
  the signature moment, one-shot only as garnish.

## 2026-07-08 — Placeholder neon REVERTED (client)

- Shipped, seen live, rejected: the live marquee sat directly under the
  logo's own (much larger) baked-in chevron run — it read as a shrunken
  duplicate, not a marquee. Client called it; full revert to the prior
  placeholder (static trimmed lockup, no hum, no marquee).
- Lesson: the logo already contains the motif at hero scale — never
  place a second run adjacent to the lockup. The chase capability lives
  on in git history (commit 8c6a584) if a right home appears later.

## 2026-07-09 — Construction page: taped caricature window (Concept A)

- **Context:** the client supplied a commissioned caricature of Amy in
  the studio for the construction page. Three compositions were mocked
  with the real assets (browser mockups); the operator chose the
  "taped-off peek" — the caricature behind an arched, taped-off studio
  window. The operator saw the flag on the artwork's Mobile Aesthetics
  signage and explicitly accepted it (site-copy rules unchanged).
- **Decision:** new reusable `CaricatureWindow.astro` (arched frame,
  hairline pink border, STATIC neon halo scoped to noir, optional
  `taped` strips). Logo keeps its full 780px and regains the approved
  ignite+hum; caution tape moves off the heading onto the window; the
  story line "Amy's inside, getting the studio ready." replaces
  "Pardon the dust". Spec: docs/superpowers/specs/2026-07-09-*.
- **Alternatives rejected:** polaroid snapshot (least bold); noir/blush
  diptych (previewed Phase C best — offered as the recommendation, not
  chosen).
- **Consequences:** the arch becomes a reusable motif (untaped, light
  surfaces) for Phase C; the halo is static so nothing competes with the
  sign (adjacency lesson); 0 KB JS holds; ships via PR preview first.

## 2026-07-18 — Design pivot: serious glamour ("dim the neon, dress the studio") (client)

- **Context:** the operator reviewed four competitors (Moksha Aesthetics,
  Flawless Chattanooga, The Modern Aesthetic — Charlotte, The Perfect
  Dose) and re-directed the tone from "fun" to **serious and glamorous**;
  Amy agreed. The palette is unchanged — this re-voices the system, it
  does not rebrand. Supersedes the 2026-07-08 "fun, not clinical"
  amendment and the "warm the studio" surface inversion (both were
  client-approved; both are reversed by this client decision).
- **Decisions:**
  - **Surfaces:** noir shell + light interiors. Ambient light surface
    back to paper; blush demoted to card tint — pink is jewelry in
    bounded shapes, white space carries the luxury.
  - **Motion:** ignite/hum/breathe retired. New vocabulary: `ng-rise` /
    `ng-trace` (CSS scroll-driven reveal, `@supports`-guarded, scrubs
    with scroll and replays on re-entry — the "continuous beats one-shot"
    lesson holds; only the register changed) plus the static `.ng-aura`.
    Scroll-timeline animations ignore duration-based reduced-motion
    overrides, so the global block now also sets `animation: none` on
    them explicitly. Compliance components NEVER take a reveal (an
    opacity-0 initial state de-emphasizes compliance text).
  - **Type:** display weights 600→500 with tight tracking; new `eyebrow`,
    `display-0` (76px, home hero only, responsive), `display-italic`
    (adds the Playfair italic variable face — swap, not preloaded,
    perf-gated and droppable), `rule-hairline`, `rule-accent` utilities.
  - **Components:** CTAButton squared (pill retired); ChevronRun at
    hairline weight with a static seam aura; TrustChips pills → an
    editorial middot credential line; the new `--ng-hairline` token
    replaces five hand-rolled border mixes; GetTheApp dashed → solid.
  - **Construction page:** unchanged in production — `ng-ignite`/`ng-hum`
    keyframes fenced as LEGACY in global.css until Phase C sub-PR C8
    rebuilds index.astro (verified: the placeholder consumes nothing else
    the pivot touches).
- **Alternatives rejected:** all-dark site à la the Charlotte competitor
  (approved strategy is noir shell + light interiors); keeping the hum
  but slower (still reads fairground); new hexes (banned); JS-driven
  reveals (0 KB rule).
- **Consequences:** 0 KB JS holds; new derived contrast pairs computed
  2026-07-18 and recorded in tokens.css (card-hover 14.87 / 5.79 / 3.91;
  hairlines decorative-only); pa11y/Lighthouse audits should force
  reduced motion so revealed content is audited in its final state
  (wired in Phase C gates work); BUILD_SPEC §5's "medical-grade playful"
  paragraph and CLAUDE.md's "premium + playful" goal line now lag the
  executed direction — proposed amendment text delivered to the operator
  in the pivot PR (spec edits are operator-gated); this entry is the
  traceability bridge until it is applied.
