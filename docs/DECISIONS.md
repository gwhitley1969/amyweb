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

## 2026-07-18 — Phase C runs on a long-lived `phase-c` integration branch (C0)

- **Context:** the pivot (PR #4) is merged and production-deployed; Phase C
  now accumulates nine `clinicianApproved: false` treatment drafts, which
  by design make `main` undeployable (check:approvals runs on every main
  push) — but the construction placeholder must stay hotfixable in
  production throughout the phase.
- **Decision:** all Phase C work lands on `phase-c` via sub-PRs; ONE
  persistent DRAFT PR (`phase-c` → `main`) provides a single stable
  password-protected preview URL for operator/Amy review, redeploying on
  every merge into the branch. Verified: pr-preview.yml has no
  base-branch filter (sub-PRs get their own ephemeral previews);
  check:approvals runs only on main pushes.
- **Rules:** the persistent PR stays DRAFT and merges only in Phase E,
  after the operator flips approvals following Amy's written sign-off;
  merge `main` → `phase-c` promptly after any main change; keep few
  sub-PRs open (SWA caps staging environments at 10).
- **Alternatives rejected:** treatment files as `draft: true` on main
  (excluded from builds — previews could never show them); accepting a
  red main (blocks placeholder hotfixes).

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
    `display-0` (76px, home hero only, responsive), `rule-hairline`,
    `rule-accent` utilities. A Playfair italic accent was built
    perf-gated and its gate FIRED — see the same-day update below.
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

- **Update (same day) — client review round: "too conservative, too
  clinical; needs a WOW":** operator + Amy reviewed the first preview.
  Verdict: the register was right but over-stilled, the header too small,
  and ink-pink read "burgundy" against the logo's hot pink. Changes, all
  contrast-verified: the sign **breathes again** at a luxury tempo
  (`ng-bloom`, 5.6s aura swell — the retired 3.2s hum was carnival; this
  is the same life, slower and deeper); the noir **accent phrase shimmers**
  with a soft neon halo (`ng-shimmer`, ≥39px only, text-shadow only so the
  computed text color/contrast is untouched — a background-clip satin
  sheen was trialed first and REPLACED because transparent fill colors
  fail the axe gate; the gate stays, the effect got re-engineered);
  **solid CTAs go brand pink** — pink-500 fill with ink-900 text
  (4.88:1, clears the 4.7 headroom bar; supersedes "fills are ink-pink
  only"; the white-text-on-pink/magenta ban is unchanged); header
  wordmark 280→336 with larger nav; the noir hairline brightens to
  pink-500@55% (pink-300@30% composited to a muddy wine — the "burgundy"
  they saw). "Nothing pulses" is replaced by: the glow that moves lives
  in exactly two places — the sign and the accent phrase. Small-text pink
  remains ink-pink by contrast law — brand pink now arrives via fills,
  the hairline, the shimmer, and the sign.

- **Update (same day) — concept validated; business-fact correction
  (operator):** the photography-led "After Dark" concept mock landed
  ("much better"). Three client directions executed: (1) **the hero
  promise "Medical aesthetics, made personal." is CONFIRMED** (resolves
  the pending reconfirmation from the Phase C operator-input list);
  (2) **consultations are optional and FREE — Amy does not require
  them.** The "Consultation-first" framing was factually wrong and is
  retired sitewide: TrustChips chip → "Free consultation upon request"
  (operator's wording), VisitSteps step 1 → "Book — or ask first",
  AtAGlance new-clients row → "Book directly — free consultation on
  request", styleguide demo FAQ answer corrected, concept pull-section
  → "Your plan, your pace." The §8.7 rule is untouched: suitability
  questions still always route to a consultation — routing is a
  compliance requirement, not a booking prerequisite. "Consultations
  are free" is treated as operator-confirmed business fact.
  (3) Header brand block enlarged again (wordmark 336→440) and the
  chevron run joins it as a flourish under the wordmark — no motif
  duplication: the wordmark asset, unlike the lockup, has no baked-in
  chevrons (adjacency lesson).

- **Update (same day) — book CTA label: "Book with Amy" (client):** the
  solid booking button reads "Book with Amy" sitewide (Amy-singular
  conversion language; the §6 appointment/consultation convention still
  governs prose). The consult button stays "Request a consultation" —
  §8.7 requires suitability contexts to route through consultation
  language; flagged to the operator rather than changed.

- **Update (same day) — {{VAGARO_URL}} + {{SOCIAL_LINKS}} supplied
  (operator), with a standing §9 flag:** booking now points at
  vagaro.com/mobileaestheticshealthandbeautyassociates and the footer
  carries monochrome Facebook / Instagram / Yelp marks (inline SVG,
  aria-labeled, 44px targets). **FLAG, raised once per CLAUDE.md:**
  BUILD_SPEC §9 requires "Amy's OWN booking link, not the shared
  location handle" and "Amy's own handles only" — the Vagaro handle and
  the Yelp listing are the multi-provider location's, not Amy-specific;
  the operator supplied them knowingly ("Vagaro is where the bookings
  take place"). Facebook and Instagram are Amy's own accounts. Both
  shared-location links resurface at the §16 launch checklist; each is
  a one-line swap in siteConfig if Amy-specific pages appear.

- **Update (same day) — chevron motif retired from the UI (client);
  {{ADDRESS_DISPLAY}} resolved:** the client removed the chevron run
  entirely ("we just don't like them") after seeing the full-width
  header band. ChevronRun.astro deleted (git history keeps it, marquee
  precedent); treatment H1 underline → rule-accent; the noir CTA band
  seam removed; styleguide section removed; the small `›` button
  punctuation (chev-nudge) is NOT the motif and stays pending client
  word. The chevron motif now lives only inside the logo artwork
  (never redrawn). The section-opener signature (eyebrow + rule-accent
  + ng-trace) is THE signature element going forward. Separately the
  operator supplied the display address (4350 Main Street, Suite 224,
  Harrisburg, NC 28075) — siteConfig updated; footer NAP, LocationCard,
  and LocalBusiness JSON-LD unlock automatically.

- **Update (same day) — spec amendments APPLIED (operator authorization):**
  the operator authorized the governing-doc edits: BUILD_SPEC §1 goal and
  §5 brand-direction paragraph now read "serious glamour" (updated to the
  photography-led direction as executed, not the pre-photography draft
  from the PR body); §5's signature-motif paragraph reflects the chevron
  retirement and the eyebrow + accent-rule opener; CLAUDE.md's goal line
  reads "premium + glamorous". The traceability bridge is closed — spec
  and executed direction now agree.

- **Update (same day) — concept refinement rounds (client):** a run of
  operator-directed refinements after the concept validated:
  - **"In her own words" section:** Amy's own Instagram post
    (operator-supplied clean version → src/assets/photos/amy-ig-post.jpg)
    framed as a white-matted, hairline-bordered print with a slight tilt,
    beside an editorial block linking her Instagram — the compliance-safe
    founder-voice equivalent of competitors' testimonials. Enlarged to a
    34rem cap on client request so the baked-in caption reads. STANDING
    FLAG: the caption text is invisible to lint:claims/lint:voice (pixels)
    — it rides on being Amy's own published post; her sign-off gates it.
  - **Header "Book" → Vagaro direct:** the nav item pointed at the
    not-yet-built /book page (404 on preview). Now an external booking
    link (new tab, noopener, book_click) — the med-spa conversion
    pattern; the Phase C /book page keeps its consultation-routing role
    without the nav depending on it.
  - **Visit-section CTA → "Book with Amy":** soft routing, not
    §8.7-mandated consultation routing (that stays on treatment pages).
    Mock-era href="#" overrides removed — every concept book button now
    opens the live Vagaro page.
  - **Arch brightening + a real bug:** the mirror-moment arch swaps the
    cinema-noir multiply grade for a 10% magenta wash + brightness lift
    (the full grade read "like sunglasses" on the blush band — client).
    Diagnosis also found .nc-band::before had lost its positioned
    ancestor in the band restructure and was blend-darkening the top of
    the page — re-anchored as .nc-band__media::before. Grade rule going
    forward: the cinema grade belongs to noir sections; photos on light
    bands wear a light wash.

- **Update (same day) — italic accent dropped by its own perf gate:** on
  CI, the italic face (swap, no fontaine italic metric fallback) raced
  the Lighthouse trace and produced an intermittent CLS failure on
  /styleguide — the exact failure mode the "droppable if Lighthouse
  dips" gate anticipated. Removed (BaseLayout import, `display-italic`
  utility, both usages). Revisit in Phase D only with a proper italic
  fallback (fontaine italic override or a preloaded italic subset).
  A separate single-run TBT blip (205 ms vs 200 on the zero-JS
  placeholder) did not reproduce — noted as Lighthouse single-run
  variance to watch; the budget is unchanged.

## 2026-07-19 — C2: treatment-page infrastructure; the schema gains `faq`

- **Context:** Phase C needs the collection route and integration wiring in
  place before the nine §7 content drafts land (C3/C4).
- **Decision:** `src/pages/services/[slug].astro` renders the treatments
  collection through TreatmentLayout (fixed compliance order untouched —
  it lives in the layout, not the route). BaseLayout gains a `jsonLd`
  prop; the route builds `service()` + `breadcrumbList()` (§10 builders,
  previously unused) and passes them down. CTAButton gains the `shop`
  variant (`skinbetter_click`; `{{SKINBETTER_URL}}` renders as a visible
  dead link on draft-gated pages until the operator resolves it). The
  treatments schema gains `faq` — editorial Q&A only (process, logistics,
  credentials; suitability questions answer "decided in a consultation");
  compliance text never rides an accordion; the field is gated by the same
  clinician approval as the page. Schema changes are operator-gated:
  flagged in the C2 PR body; the operator's merge is the approval.
- **Alternatives rejected:** building JSON-LD inside TreatmentLayout (the
  route owns the canonical URL; the layout stays presentational);
  FAQPage JSON-LD now (Phase D per §10).
- **Consequences:** `draft: true` entries are excluded from the build
  entirely; unapproved entries build with a visible DraftBanner and
  `check:approvals` keeps them out of production (unchanged).

## 2026-07-19 — C6: /about built; `{{AMY_BIO}}` resolved from an operator-supplied source

- **Context:** the About page was blocked on bio facts. Mid-build, the
  operator supplied a screenshot of Amy's public provider-directory
  listing (Amy About.jpg) and directed its use.
- **Decision:** career facts extracted and used: two decades of nursing
  (much of it critical care), medical aesthetics since 2017, nurse
  practitioner since 2018, credentials NP/BSN (site standard remains
  "Amy Palacios, FNP"). The Evolus context of the source page is NOT
  used ({{EVOLUS_CLAIM}} still open); the listing's informal service
  shorthand ("Tox", laser, microneedling) is not carried onto the site
  — §6 governs the service list. The multi-provider location gets its
  one factual line, nothing more (constraint 2). Portrait: the
  mirror-moment frame, riding the same open client-release flag as the
  concept (preview-only).
- **Consequences:** Amy's confirmation of the career-facts wording is
  flagged for review on the preview; {{AMY_BIO}} is no longer rendered
  as a token.

## 2026-07-19 — Perf gate rearchitected: deterministic budgets + median-of-3 (operator-approved)

- **Context:** three CI failures were phantom TBT readings (205/1027/709 ms)
  on zero-JS pages — one URL failing while six siblings in the same job
  passed, identical code passing on rerun. Local measurement: TBT = 0 ms on
  every page. Defect: asserting an inherently variable lab metric as a
  single-sample binary gate on shared runners. Larger runners are an
  org-plan feature (repo is personal); self-hosted fails cost/simplicity.
- **Decision — three layers (plan-mode approved by operator):**
  1. *Deterministic invariants* (new, byte-exact, cannot flake) in
     lighthouserc: third-party requests = 0 (CI-enforces hard constraint 5),
     script ≤ 30 KiB (unchanged), total ≤ 350 KiB, image ≤ 240 KiB,
     font ≤ 120 KiB / ≤ 4 requests, stylesheet ≤ 16 KiB, document ≤ 16 KiB.
     Measured 2026-07-19 transfer-size maxima across the 7 gated URLs:
     total 211,993 (/about) · image 124,997 (3 req) · font 75,946 (2 req,
     the two-family discipline visible in data) · css 8,117 · doc 7,941 ·
     script 0 · third-party 0. Headroom ~40–100%, sized so C8's photo-led
     home fits without touching budgets. Budgets only tighten without
     operator approval; loosening is operator-gated.
  2. *Statistical metrics treated statistically:* numberOfRuns 3 with
     aggregationMethod "median" set EXPLICITLY on every assertion — the
     LHCI default is "optimistic" (best-of-N), which would silently weaken
     the gate. All thresholds unchanged (4× categories ≥ 0.95, LCP ≤ 2500,
     CLS ≤ 0.1, TBT ≤ 200).
  3. *Escalation rule (pre-agreed, not executed):* if a metric assertion
     fails while all Layer-1 budgets pass and an identical-code rerun
     passes, that is a proven phantom → retire the TBT stand-in (script
     budget already guards JS deterministically), executed only after
     flagging the operator with the evidence. §13's INP < 200 ms remains a
     field commitment (CrUX / Phase D analytics — the only place INP is
     measurable). Note: §13 delegates lab budgets to this config; TBT's
     number was never spec text.
- **Alternatives rejected:** naive numberOfRuns:3 (silent optimistic
  default = weakening); dropping TBT today (do it on evidence via the
  rule, not preemptively); paid larger runners (unavailable +
  cost); self-hosted runner (ops burden, workstation fragility);
  skipAudits on TBT (score-computation hack — actual patchwork).
- **Consequences:** verify wall time +~2 min (measured 347 s / 349 s
  locally, both green; probe test confirmed budgets bite). A deliberate
  regression now fails on exact bytes before it ever reaches a
  statistical metric.

## 2026-07-19 — Same-day decisions from C1/C5/C7 not previously logged

- **C1, /404 surface:** body-level noir kept (BaseLayout `surface` prop)
  — the per-section-noir rule protects light sections from dark link
  tokens, and the 404 has none. The plan's Services link on the 404 was
  deferred to C5 so it never shipped dead; it should be added now that
  /services exists (small follow-up, C8 window).
- **C1→ /book portrait (operator picks, three rounds):** concept-hero
  frame → gloves detail (8K0A1120) → **final: 8K0A1011** (Amy + client
  beneath the neon, top-anchored crop keeping the sign whole). Carries
  BOTH open photo flags (client release + neon signage) — preview-only,
  same standing as the concept. Alt text names no location branding.
- **C5, open naming flag:** the services-grid card reads "Neuromodulators"
  (§6 title in serviceLines.ts); the page it opens reads "Wrinkle
  Relaxers" (§7 consumer name). Operator picks which name wins; one-line
  change either way.
- **C7, legal drafts in the safe lexicon:** the genre's standard
  boilerplate ("not intended to diagnose/treat/cure/prevent",
  "guarantee") is banned by our own claims linter by design. Drafts use:
  as-is/without-warranties, no-provider-relationship, 911 lines, and the
  DisclaimerBlock's vetted framing expanded. DraftBanner gained a
  `label` prop ("Draft — pending counsel review"); the clinician default
  is untouched. A North Carolina governing-law clause awaits counsel.
- **Docs sync (this entry's commit):** §17 registry statuses updated
  (VAGARO_URL/PHONE/ADDRESS/SOCIAL_LINKS/AMY_BIO marked resolved with
  dates and standing flags); PHASE-C.md checklist ticked through C7 with
  a 2026-07-19 status block; RUNBOOK gained the phantom-metric
  troubleshooting entry and the new ~6-minute verify expectation.

## 2026-07-19 — Header credential line under the wordmark

Operator directed: "Amy Palacios, FNP" beneath the Needle Girlie wordmark,
in the brand pinks, header grows to fit. **Decision:** a `.site-brand`
lockup — wordmark plus an uppercase tracked credential line in DM Sans
(the header's existing nav grammar; Playfair stays display-only per the
global.css contract) colored **pink-500**. New verified contrast entry in
tokens.css: pink-500 on noir 5.95:1 also clears the 4.5:1 body-text bar —
small pink-500 text is now legal on NOIR only (the light-surface ban is
untouched). Mobile popover clearance moved 7rem → 8.5rem for the taller
block. Rejected: pink-300 (passes easily at 11.58:1 but reads pastel —
the operator asked for the logo's pinks, and the wordmark letters are the
pink-500/magenta family); Playfair for the line (violates the
display-only rule); enlarging the wordmark itself (already sized up twice
by client direction — the ask was an addition, not another scale-up).
Consequence: every page's header carries the clinician's name and
credential — supports the "Amy, the clinician" positioning sitewide.

## 2026-07-19 — Vagaro service alignment (menu-driven content update)

Operator supplied scans of the live Vagaro booking menu (C:\Amy\scans\
Vagaro) and directed the site's services toward consistency with it.
**Decisions (operator-selected):** (1) `{{NEUROMOD_LIST}}` resolved to
**Jeuveau, Xeomin, Daxxify** — each has its own Vagaro category; settles
the old two-vs-three source conflict. (2) Weight loss broadens to
**Semaglutide, Tirzepatide, Phentermine, Retatrutide**; Retatrutide
ships behind `investigational: true` with the notice now naming it via
the new optional `investigationalProduct` schema field (route
pass-through added — the notice previously could not name a compound).
Phentermine is named, never described by mechanism (appetite-language
ban). (3) Two new consult-routed lines: **Skin Rejuvenation** (Pixel8
RF microneedling + medical-grade chemical peels) and **Body Contouring**
(Evolve, described by intended design only — tightening/toning, no
outcome or body-fat language). SERVICE_LINES enum → 11; §6/§7 briefs
added; /services headline and pa11y URL set updated. (4) **Regenerative
trimmed** to the Vagaro menu: PRP and PRP-with-microneedling; PRF,
PDRN, Illuma, VAMP, Rejuran come off until Amy confirms them.
**Deliberately excluded from the site:** Vagaro's per-medication mg
tiers (dosing — hard constraint 3), per-med pricing notes, and
half-syringe pricing granularity. **Rejected:** one page per Vagaro
category (twelve flat pages — index sprawl); folding peels into
Skincare (that line is a shop link-out, not a procedure page).
**Consequences:** all touched pages remain `clinicianApproved: false`
awaiting Amy's sign-off round; the peptide list (`{{PEPTIDES_PUBLIC_
LIST}}`) stays open — Vagaro shows no peptide category; the C5
Neuromodulators-vs-Wrinkle-Relaxers naming flag is unchanged.

## 2026-07-20 — GLP-1 product cards + mg-tier pricing (operator override)

Operator supplied the client's product sheet (GLP-1 tab) and directed its
use on the weight-loss page. The sheet is a hard-constraint-8-class
internal document — read view-only, never committed; its Reconstitution
and Dosing columns are prohibited content, its Duration wording ("well
tolerated for …") is a safety claim, and its Uses wording contains
lint-banned angles — so the publishable facts reduce to receptor classes
and prices. **Build decision:** a reusable `productDetails` schema field
+ `ProductDetailCards` component upgrades the "What Amy offers" list in
the same slot of the fixed compliance order; the later Peptides work
reuses it. **Override decision:** the client directed publication of the
five mg-keyed price tiers. Flagged in full before execution: mg amounts
are hard constraint 3, and FDA's 2026 enforcement wave (≈80 warning
letters through June 2026, incl. letters to clinics advertising
retatrutide by quantity and price) cites exactly this pattern. The
operator confirmed the override ("Full mg tiers") and separately chose
equal card billing for Retatrutide. **Mechanism:** an `allowedStrings`
registry entry stripped before category scans — exact strings only,
boundary-guarded (a longer quantity containing a tier string still
fails), covered by the linter self-test, changeable only by the
operator. **Rejected:** loosening the mg regex (a context exception
would admit unenumerated quantities); "from $X" prices with a Vagaro
menu link-out (operator declined after the flag). **Consequences:**
documented, client-accepted regulatory exposure rides with the page;
any new tier requires an operator-visible registry edit;
`{{RETATRUTIDE_COUNSEL}}` now also covers the priced Retatrutide card;
`clinicianApproved` stays false pending Amy's sign-off.

## 2026-07-20 — Retatrutide card badge removed (operator-directed)

The "Investigational" tag badge on the Retatrutide product card comes
off at the operator's direction (relayed same-day, after PR #18). The
badge was a redundant visual reinforcement, not the disclosure itself:
the mandatory architecture is unchanged — the adjacent
InvestigationalNotice naming Retatrutide, the card's own
"Investigational and not FDA-approved" detail sentence, and the FAQ
wording all remain, and the lint inverse checks still enforce them.
Flagged at execution: anything beyond the badge (the notice or the
disclosure wording) is hard constraint 3 and not removable.
Same day: the operator asked for Phentermine described as appetite
suppression for short-term weight loss; flagged against brief 1's
no-mechanism rule and the appetite-language ban, and the operator chose
the compliant variant — "for short-term use in a supervised
weight-management plan" — over an override. The rule stands.

## 2026-07-20 — Client weigh-in photo on the weight-loss page

Operator supplied a client photo (weigh-in on the studio's InBody
body-composition scale) and directed its use on the weight-loss page.
**Publication basis:** operator confirmed a signed release covering
website marketing use is on file — recorded here; publication was
blocked on that confirmation. **Compliance handling:** the
procedure-aftercare sign in frame ("results take 10-14 days" —
claim-adjacent text baked into an image) is cropped out; the neon
reflection in the mirror was inspected at full resolution and is
illegible (no shared-location naming — hard constraint 2 clear); the
shipped filename (supervised-weigh-in.jpg) and alt text avoid the
client's name. **Build:** inline `figure` in the MDX body via
astro:assets (responsive widths, lazy, dimensions set — no CLS); no
layout hero capability added. The weight-loss page is outside the
Lighthouse URL set, so image budgets are unaffected; pa11y covers the
page.

## 2026-07-20 — AtAGlance retired from treatment pages; editorial deck replaces it

Operator: no one likes the fact card (Provider / Location /
Appointments / New clients) on the service pages — remove it and put
something better there. Decision: the card comes off TreatmentLayout
only; /book keeps its copy (provider/phone facts are contextually right
on a booking page), so AtAGlance.astro survives. In its place an
optional `deck` frontmatter field renders a blush statement card — one
short, claims-clean Playfair display line per treatment, in the same
card anatomy family (blush, hairline, magenta edge; ink-900 on blush
15.77:1). Upright face only — no italic font file is added, so the
Layer-1 font byte budget is untouched. All eleven pages populated in
one pass; §8 applies to deck strings and the lines rode lint:claims,
lint:voice, and the full verify (Lighthouse CLS median held on both
tracked treatment pages). Rejected: an on-page table of contents
(bureaucratic for short pages); third-party embeds (privacy
architecture); deleting the component (/book uses it). Consequence:
eleven new copy lines await Amy's sign-off like all treatment content
(clinicianApproved unchanged, false).

## 2026-07-20 — Second weight-loss photo: Amy's portrait, not the requested frame

Operator asked for 8K0A9740.jpg on the GLP-1 page. Viewed first-hand,
that frame is a neuromodulator prep tray — site-labeled pre-drawn
syringes, unit-marked toxin boxes, Evolus campaign brochures, location
branding on the tray. Flagged as unusable there: it implies the wrong
treatment on a weight-loss page, photographs a dosing workflow (the
image form of banned content), and republishes third-party marketing.
Operator accepted the flag and chose a survey of the full pro-shoot
set instead (subagent pre-screen, every candidate re-verified
first-hand). No weight-loss-specific frame exists in the set; the
operator selected 8K0A0206 — the first Amy-solo portrait we have
(embroidered scrubs, seamless backdrop; no client release needed, no
products, no signage; the embroidery "Amy Palacios NP / Mobile
Aesthetics" was verified at full resolution and is factual identity,
clear of hard constraint 2). **Build:** new `.media-row--flip` layout
variant (copy-first DOM, figure right, opposite tilt) so successive
prints lean toward each other; the portrait wraps "Who it's generally
for," captioned "Your clinician." Rejected: 8K0A9862 (vial in hand —
injectable ambiguity on a weight-loss page, label unverified);
mirror-moment frames (client release unconfirmed, facial-treatment
read). Noted for later: 8K0A9881/9922 are Skincare-page-ready product
frames.

## 2026-07-20 — One conversion label: "Book with Amy" replaces "Request a consultation"

Operator directive: every button that said "Request a consultation"
now says "Book with Amy." Implemented as a label-only change to
CTAButton's consult variant — the button still points at `/book`, the
outline style still distinguishes it from the solid Vagaro button, and
the §6 language convention still governs prose (router cards, FAQs,
and pricing lines keep saying "consultation," so clinical routing
survives in copy). Known trade-off, flagged and accepted: on
direct-booking treatment pages the router card and the closing band
now both read "Book with Amy" with different destinations (/book vs
Vagaro); both funnel to booking, and the external one announces its
new tab. BUILD_SPEC §6 amended to record that the route table's
"Request a consultation" cells describe routing intent, not the label.

## 2026-07-20 — Price-tier strings reformatted: "@" → "vial:"

Client direction via the operator: the five authorized GLP-1 price
tiers now read "20mg vial: $675" (etc.) instead of "20mg @ $675." A
like-for-like swap of the enumerated allowlist strings — same five
tiers, same prices, no expansion — executed as one operation across
`compliance/banned-patterns.json` `allowedStrings` and the page's
`priceLines` (the registry and the rendered text must always change
together; the operator's directive is the required registry
authorization, noted in the registry's own comment). The linter
self-test derives its cases from the registry, so the gate stays
self-proving: each new string passes, every longer-quantity variant
("120mg vial: $675") still fails dosing. "vial" matches no banned
pattern outside the stripped strings.

## 2026-07-21 — Retatrutide disclosure consolidated to one calm line (client direction, scoped)

Amy directed (via the operator) that ALL "investigational / not
FDA-approved" references come off the weight-loss page — she covers
this in consultation and finds it too alarming on the page. Flagged
before execution: the page advertises Retatrutide by name **with
prices**, and advertising an unapproved compound with no disclosure is
the exact pattern in FDA's 2026 warning-letter wave — removal while
the product stays advertised is misleading advertising, and the
linter's inverse checks (non-removable gates) fail it by design. Two
compliant paths offered: remove Retatrutide from the page entirely
(recommended — matches "she covers it in consultation"), or keep it
and collapse the four repetitions (bolded notice, card sentence, FAQ
clause, body sentence) to a single matter-of-fact line. **Operator
chose consolidation.** Mechanism: new optional `investigationalNote`
schema field — the page supplies the calm sentence, rendered inside
the adjacent InvestigationalNotice; the wording lives in the content
file so lint:claims keeps enforcing the statement on the page that
advertises the compound and the clinician audit trail carries the
exact sentence. The component's bolded default remains the fallback
for any future investigational page. **Rejected:** full removal with
the product still advertised (declined as unbuildable — deceptive and
gate-breaking); hiding the statement in non-rendered text (hollow
gate pass). **Consequences:** the disclosure now appears exactly once
(verified in built HTML, phrase unsplit); {{RETATRUTIDE_COUNSEL}}
still governs final wording; clinicianApproved stays false.

## 2026-07-21 — Weight-loss page books directly (operator)

The operator saw "Book with Amy" on the weight-loss preview routing to
/book and directed it link Amy's Vagaro page. Not a bug — the line was
consult-routed by §6/§7 design — so this is a routing change, executed
with the copy aligned in the same content commit: ctaType → book (the
closing band now opens Vagaro in a new tab, matching wrinkle-relaxers
and dermal-fillers), the FAQ answer flips from "starts with a
consultation" to "book anytime — free consultation available first,"
the body drops "consultation-routed by design," and the meta
description follows. Kept: suitability language still routes to
consultation (§8.7), and Retatrutide stays consultation-introduced via
the disclosure line. BUILD_SPEC §6 route table + §7 brief 1 amended on
the operator's directive. Rejected: overriding the consult button's
href only on this page (forks the variant's meaning sitewide).
clinicianApproved stays false; Amy reviews the new copy with the rest.

**Update (same session) — the /book double-hop retired sitewide:**
shown the first cut, the operator rejected the surviving pattern
("Book with Amy" on the router card → /book → click "Book with Amy"
again to reach Vagaro) outright. Decision: one label, one destination
— the consult variant's default href is now the Vagaro URL (outline
emphasis kept, book_click event added, new-tab affordances automatic).
This supersedes the two-destination trade-off accepted with the
2026-07-20 label unification; the operator's reaction proved the flag
right. Consequence: the /book page has no inbound links (header Book
went Vagaro-direct 2026-07-18) — kept built as the how-booking-works /
phone explainer and stays in the pa11y/Lighthouse URL sets; retiring
it is the operator's call, flagged for the Phase E launch checklist.
Prose consultation routing (§8.7) is untouched.

## 2026-07-21 — /book retired (operator)

The flag above resolved same-day: asked whether any use remained, the
recommendation was deletion — the only surviving purpose (cushioning
the brand handoff to the Vagaro page, which carries the location's
name, not Needle Girlie's) is a one-line microcopy job, not a page,
and the operator declined even that. Deleted now rather than at Phase
E because the page never served in production and nothing links to it
— no bookmarks, no search entries, no redirect debt; that stays true
only while it stays unshipped. Removed: src/pages/book.astro and its
photo under-the-neon.jpg (used nowhere else — conveniently the one
frame carrying BOTH open photo flags, client release + neon signage,
now off the site entirely); the /book URLs came out of the pa11y and
Lighthouse lists (syncing the enumerated sets to the sitemap, not
weakening — a kept entry would fail on 404). Kept: AtAGlance.astro
(styleguide demo still renders it). BUILD_SPEC §6 route table row
marked retired. Consequences: pa11y audits 22 URLs, Lighthouse 6; the
free-consultation and phone messaging live on in trust chips, FAQs,
and call CTAs.

## 2026-07-21 — Peptide Therapy page built; `{{PEPTIDES_PUBLIC_LIST}}` resolved (operator)

Operator directed the Peptides page be built from the client product
sheet (Peptides tab), using the weight-loss-glp-1 page as the template.
`{{PEPTIDES_PUBLIC_LIST}}` **resolved** to Amy's nine-item injectable-peptide
menu: BPC-157/TB-500, GHK-Cu, GLOW (a GHK-Cu/BPC-157/TB-500 blend),
Glutathione, Ipamorelin, MOTS-c, NAD+, Sermorelin, Tesamorelin.

**Core decision — compliance reduction.** The sheet's Uses column is almost
entirely non-publishable: anti-aging, anti-inflammatory, healing, recovery,
blood-sugar, "prevents muscle loss," and Glutathione's chemotherapy/
Alzheimer's/Parkinson's/neuroprotective claims all hit the claims linter or
the §7 peptide brief ("no recovery/healing/anti-aging/performance claims"),
and Tesamorelin's "only FDA-approved drug for visceral fat" hits both the
fda-approved and superiority patterns. Reconstitution and Dosing are excluded
by the operator; Duration is a cycling protocol (hard constraint 3) and is
also excluded despite being nominally offered. So — exactly as the GLP-1 page
did with its own sheet (DECISIONS 2026-07-20) — publishable facts reduce to
**product name + factual biochemical class + price + route-to-consultation**
(e.g. GHK-Cu = "a copper-binding peptide"; Ipamorelin = a growth-hormone-
releasing peptide; Sermorelin/Tesamorelin = growth-hormone-releasing hormone
analog). Class descriptors are factual identity only, mirroring GLP-1's
accepted receptor-class framing; verified clean against every linter category.
Rendered through the existing `productDetails` / `ProductDetailCards`
machinery — no schema or component change.

**Operator decisions (full GLP-1 parity).** (1) Show the flat per-product
prices — and unlike the GLP-1 mg tiers these are not mg-keyed, so they trip no
dosing pattern and need **no `banned-patterns.json` allowlist entry**. (2)
`ctaType: book` — the closing band opens Vagaro directly. (3) **No page-level
non-FDA-approved disclosure.** Flagged before execution — most listed peptides
are compounded and not FDA-approved, and advertising them by name with prices
is the same FDA warning-letter pattern flagged for priced Retatrutide — and
the operator declined a disclosure. Verified this breaks no gate: no linter
inverse check requires a disclosure absent an `investigational` flag or biote
symptom language, and neither is present. Recorded as operator-accepted
regulatory exposure. NAD+ price omitted (the sheet's only NAD+ price is the IV
price, which belongs to /iv-therapy); Glutathione and NAD+ appear on both
pages (different delivery), kept on both.

**Rejected:** publishing the Uses benefits (non-compliant, unbuildable — the
inverse checks and category scans would fail it); a disclosure (operator
declined); editing `banned-patterns.json` (flat prices need no carve-out).
**Consequences:** `{{PEPTIDES_PUBLIC_LIST}}` resolved (BUILD_SPEC §17 status
flip is operator-gated — flagged, not edited here); `clinicianApproved` stays
false pending Amy's sign-off. Page photo is the reused solo portrait (8K0A0206)
as a safe placeholder — the one peptide-specific solo frame (8K0A9862, gloved
clinician presenting a vial) needs a crop to remove legible "Mobile Aesthetics"
neon, flagged for the operator's pick on the preview.

**Update (2026-07-21) — photo chosen; NAD+ priced.** Operator ruled out the
reused 0206 portrait (already on the weight-loss page). Photo is now a cropped
**8K0A9734** — a pink-scrubs solo clinician portrait, cropped above the counter
to drop the product boxes / syringe tray / marketing brochures; no client, no
signage, no dosing workflow (sharp crop, top 56%). Rejected en route: 8K0A0069
(Amy holding a "Mobile Aesthetics" location sign beside Evolysse filler boxes —
constraint 2 + third-party marketing + wrong treatment). NAD+ now shows
**$200** (operator-provided — the sheet listed only an "IV NAD" price, so it was
initially omitted); MOTS-c stays unpriced pending a price.

**Update (2026-07-21) — enriched within compliance (operator, Option A).** After
the operator flagged the page as too thin (the compliance reduction had left it
sparse), enriched it with **zero added exposure**: a fuller factual "what a
peptide is" passage, a families framing (copper peptides / growth-hormone-
releasing peptides / a synthetic blend / compounds the body makes on its own),
richer per-card identity lines, a "Delivered, and always supervised" section
(route of administration + prescription + supervision — no dosing/frequency),
and an expanded logistics FAQ (how peptides are given, how Amy decides). Cards
reordered to match the families. Still **no benefit or efficacy claims** — the
sheet's Uses column stays off, and suitability still routes to consultation. The
operator declined the Option-B benefit-language override for now; it remains
available (same posture as the GLP-1 pricing override) if directed later.

## 2026-07-21 — Treatment closing bands gain the Call button (operator)

The operator noted, reviewing peptide-therapy, that its closing band lacked
the "Call 704-579-7108" button that /services carries. That band lives in
**TreatmentLayout** (shared), so the fix adds `<CTAButton variant="call" />`
beside the primary book/consult/shop button there — bringing **all ten
treatment pages** in line with the /services, /about, and /visit closing bands
(book + call), rather than scoping one page. The call variant already existed
(tel: link, outline style, `call_click` event) — no new component, no schema
change. **Rejected:** a per-page frontmatter flag (an operator-gated schema
change for a worse, inconsistent result — one treatment page with a call
button, nine without). **Consequence:** every treatment page's noir band now
offers its primary CTA plus Call; only the mdx changed per page is untouched
(the change is layout-level).

## 2026-07-21 — Neuromodulator product cards + per-unit pricing override

Context: the operator directed a rebuild of /services/wrinkle-relaxers
from the client's product sheet (Neuromodulators tab: Jeuveau, Xeomin,
Daxxify) plus released studio photography. Per-unit pricing touches
hard constraint 3 ("units" is enumerated in the dosing ban), so the
flag was raised; the operator chose verbatim sheet pricing ("$400 or
$10 / unit", "$500 or $12 / unit") over the compliant alternatives
(starting-at prices; consult-only). Mechanism mirrors the mg-tier
override: two exact strings in `allowedStrings`, and the dosing
category GREW two per-unit patterns ("/ unit", "per unit") in the same
change — the carve-out opens only after the ban widens, and the linter
self-test proves both. Also decided: Daxxify duration ships only as
the hedged label fact (not a promise); "Wrinkle Relaxers" naming wins
(C5 flag closed — grid card updated to match the page); releases
confirmed for all three photo subjects (8K0A9550/9591 female client,
9637 male client, 9397 alternate — unused for now). Rejected:
publishing "FDA-approved" (lint-banned; renders as "prescription");
frame 9542 (legible Jeuveau campaign banner); frames 9734/9742
(product-box and prep-tray scenes). Consequences: documented,
client-accepted exposure on quantity-keyed pricing, consistent with
the GLP-1 decision; any new tier requires an operator-visible registry
edit; the operator's merge of this PR is the written override
approval.

## 2026-07-21 — Biostimulators page: factual category, prices shown, consult-first

Context: built /services/biostimulators from `C:\Amy\scans\Radiesse\Radiesse.md`
(Merz brochure, $900/syringe) and `C:\Amy\scans\VSoft\VSoft.md` (VSoft Lift PDO
threads), plus the operator's PDO price ($350 for 10 threads). Both brochures are
saturated with §8 violations — Radiesse's FIRMS/TIGHTENS/REVERSES, "23x more
collagen," 78%/98% stats, "reverses signs of aging," "lasts 2 years"; VSoft's
"strongest"/"best," "Amazing Results" before/afters, "FDA-cleared" as a selling
point. **Decision:** publish only factual category identity + mechanism per
BUILD_SPEC §7.5 ("collagen-stimulating treatments … no 'lifting results'
promises") — each product a name + one factual class line (Radiesse = injectable
calcium hydroxylapatite; PDO Threads = dissolvable polydioxanone, VSoft Lift line)
+ the collagen-stimulation mechanism the category is named for, then route to
consult. **Prices shown** (operator-confirmed): "$900 per syringe", "$350 for 10
threads" — flat, non-mg, non-unit strings that pass the dosing regex untouched, so
no `banned-patterns.json` allowlist entry is needed (unlike the GLP-1 mg-tiers and
the neuromodulator per-unit prices). First consultation-first page to show
per-product prices (siblings Regenerative / Skin Rejuvenation keep pricing to the
consult); operator provided the figures and confirmed display. **CTA:** `consult`,
not `book` — mandated by BUILD_SPEC §6 (line 210, "Request a consultation") and
appropriate for injectable/thread procedures. **Rejected:** any FIRMS/TIGHTENS/
REVERSES, stat, or before/after language (§8); "FDA-cleared" reassurance
(regulatory status as a selling point); the word "permanent" even negated (the
outcome-promises regex has no negative lookbehind, so "not permanent" fails —
longevity routes to the consult instead); a separate "thread lift" product (VSoft
Lift read as the PDO-thread brand Amy uses — one line, $350/10). **Consequences:**
`clinicianApproved: false` until Amy signs off; Radiesse sits on Biostimulators
per §7.5, not Dermal Fillers (the concurrent session's page — Revanesse Versa /
Evolysse per §7.4), though Radiesse is FDA-*indicated* as a filler — flagged so it
is not double-listed.
