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

## 2026-07-21 — Dermal Fillers rebuild: Evolus film override + supplied lip style guide

Context: the operator directed a rebuild of /services/dermal-fillers
from the supplied filler briefs (Evolysse Smooth/Form; Revanesse
Versa+/Lips+ — constraint-8-class, view-only) and two client-supplied
assets: the Evolus-produced co-branded film ("Mobile EVOLYSSE OPTION
3_2_1", on-screen piece code US-EVY-2600017)
and the lip style-guide graphic. The film contains a before/after
segment (hard-constraint-3 territory), Mobile Aesthetics co-branding
with the location's phone number (704-368-3759 — not Amy's line) and a
QR code to a location-branded Evolus microsite, plus a "Nurse
Practicioner" typo on Amy's title card; the graphic bakes in "We add
volume…" (voice rule) and "will suit everyone" (suitability). All
flags were shown. Operator chose: publish the film as-is and ship the
graphic as-is. Rejected: skipping the video; trimming the segment
(editing a manufacturer's regulated piece); rebuilding the graphic as
native HTML cards. Also decided: Revanesse renders as one family card
(Versa+ & Lips+ — matches the "Versa lips or face" Vagaro booking);
Evolysse duration ships only as the hedged label fact (Daxxify
pattern). The filler price string ("$650 or $325 (half-syringe)")
trips no banned pattern — the first quantity-keyed price published
with NO registry change. Captions: the film has narration, so the
WebVTT transcript was machine-drafted (scratchpad-local Whisper, no
repo dependency) with two flagged corrections ("evalese"→"Evolysse",
"Soft and"→"Soften"); the operator verifies the transcript against
the video pre-merge. Captions render manufacturer speech (including
"doctor" phrasing) that the src/ gates do not scan — accepted under
the same override. Consequences: the page carries manufacturer video
content the text gates cannot scan (documented, client-accepted); the
poster frame inherits the approved co-branding; the location's number
appears inside the film while every site CTA still routes to Amy's own
booking and phone; the operator's merge of this PR is the written
override approval.

## 2026-07-21 — Self-hosted video: static MP4 under /media/

Context: the Evolysse film needed a home; constraint 5 permits
youtube-nocookie embeds, but a third-party player means iframes and
external requests for a 30-second asset on a zero-tracker site.
Decision: self-host — lossless remux of the client's H.264/AAC .mov to
a faststart MP4 (8.6 MB) in public/media/, rendered by the new
TreatmentVideo component: click-to-play `<video controls
preload="none">`, astro:assets poster, required WebVTT captions track
(axe video-caption), zero client-side JS, no autoplay. `/media/*`
gains a 24-hour cache route in BOTH SWA templates (the global default
is 5 minutes). Rejected: YouTube nocookie (third-party surface,
off-brand chrome); hashing the video through the asset pipeline
(public/ passthrough is simpler; Front Door purge covers releases).
Consequences: the repo gains its largest binary (8.6 MB, well under
all limits); zero run-rate impact; the page stays out of the LHCI URL
set (deliberate — adding it offered to the operator as a pure
tightening).

## 2026-07-21 — Biostimulators: solo clinician photo + Radiesse biostimulator identity

Follow-up to the biostimulators build (PR #34, merged). Two operator-driven
changes. **(1) Photo swap:** the media-row reused `amy-palacios-fnp.jpg`
(8K0A0206), already on the GLP-1 page; the operator asked for a distinct frame.
The shoot has no clean solo portrait — every solo frame carries the
"MobileAesthetics" neon sign, a held product box, or a prep tray (all ~74 pics
re-screened first-hand) — so a new asset `amy-studio-portrait.jpg` was cropped
from 8K0A9750 (Amy alone, chin on hands, pink scrubs), keeping only the region
above the table and removing the Evolysse/Jeuveau boxes, vials, and pen tray.
Same manufacture-a-clean-frame technique used for the peptides photo (8K0A9734).
**(2) Radiesse = biostimulator, made explicit:** the operator confirmed via
radiesse.com that Radiesse is "the first and only injectable biostimulator" and
"RADIESSE … are biostimulators", settling the filler-vs-biostimulator question
and confirming the §7.5 placement here (not on Dermal Fillers, which shipped
Evolysse + Revanesse, no Radiesse). The product card now reads "An injectable
biostimulator …". **Rejected from the source banner:** "first and only"
(superiority, §8.4) and "FDA approved" (banned regex) — only the factual
"injectable biostimulator" identity was taken. Consequence: `clinicianApproved:
false` stays; nothing else on the page changed.

## 2026-07-21 — Preview passwords removed; previews are public + noindexed

Context: the SWA Standard basicAuth cookie looped constantly in Chrome
for Windows (stale-cookie re-prompt with the correct password), and each
per-PR hostname needed its own login; the operator lost review time to
it repeatedly and directed removal ("get rid of the passwords"). Flag
shown: preview URLs are guessable and carry unapproved draft
medical-marketing content. Decision (operator, after the flag): disable
password protection entirely — applied immediately via ARM
(basicAuth/default → SpecifiedEnvironments, no environments; both live
previews verified serving 200 with no gate), with the repo synced in
the same day: the basicAuth resource and previewPassword parameter
removed from infra Bicep (redeploying infra must NOT silently re-enable
it), and preview.json gains `X-Robots-Tag: noindex, nofollow` so drafts
never enter search indexes (also closes the §16 "previews noindexed"
checklist item). Rejected: Entra-based staging auth (more login friction
than the password, for a solo reviewer); leaving Bicep as-was (silent
re-enable drift). Consequences: anyone with a preview link can view
drafts (client-accepted); the clinician-approval gate remains the
production safeguard; re-enabling is one ARM PUT if ever wanted.

## 2026-07-21 — BUILD_SPEC §7.5 amended: Radiesse classified as a biostimulator

Context: the filler-vs-biostimulator question recurred (Radiesse is FDA-indicated
as a dermal filler but is a collagen biostimulator by mechanism); the resolution
lived only in the biostimulators-page entry above. Decision (operator-approved):
amend §7.5 to state Radiesse is a biostimulator, not a filler, for this catalog —
it belongs on /services/biostimulators, not /services/dermal-fillers — citing
radiesse.com's own "injectable biostimulator" positioning. Consequence: the spec
now settles placement so the confusion can't resurface; the marketing superlatives
("first and only", "FDA-approved") stay off-site per §8. Docs-only change.

## 2026-07-21 — {{EVOLUS_CLAIM}} resolved: "Charlotte's #1 Evolus provider" (third allowlist authorization)

Context: the operator reported Amy is the #1 Evolus injector in the
Charlotte market; verification found the exact sentence "she is
Charlotte's #1 Evolus provider" live and unattributed on the practice's
own site (yourmobileaesthetics.com homepage). This is the claim the
placeholder registry had been holding open. The flag was given in full:
an unattributed "#1" is the most scrutinized claim class in medical
advertising; the recommended path was a two-line substantiation email
from the Evolus rep plus attributed wording ("Recognized by Evolus
as…"). Operator chose: proceed now on the operator's confirmation that
the designation comes from Evolus, wording matching the company site
verbatim (attributed version declined), placement on wrinkle-relaxers +
dermal-fillers (About offered and declined). Mechanism: the exact
sentence became the EIGHTH allowedStrings entry — the first non-price,
superiority-class string — and the linter self-test's exactness proof
generalized from dosing-only to any-category (a superiority string's
near-miss variant trips superiority, not dosing); deliberate-failure
probes confirmed naked "#1", the digit-prefixed variant, and an
extended "best injector" sentence all still fail while the exact
sentence passes. Notably, the registry line itself was added by the
operator's own hand (assistant tooling declined the allowlist edit; the
operator made the change directly — the registry's operator-only rule,
made literal). Consequences: documented, client-accepted exposure on an
unattributed superiority claim, consistent with the company site's
existing public claim; the Evolus rep email remains the recommended
substantiation upgrade and would also unlock attributed wording; both
touched pages remain clinicianApproved: false; the operator's merge of
this PR is the written override approval.

## 2026-07-21 — Lip style guide swapped for the text-free version

Context: the operator supplied Lip_Styles_no_text.png — the same
six-style graphic with every baked-in description removed; only the
style names remain (large, legible at mobile sizes). Decision
(operator-directed): replace the original as-is graphic on
/services/dermal-fillers. Consequence: the exposure recorded in the
earlier style-guide decision — the baked "We add volume…" voice-rule
conflict and the "will suit everyone" suitability claim — is RETIRED;
the image now carries no sentence-level text at all, and the FAQ item
listing the six styles remains the descriptive text alternative. The
as-is override for the Evolus film is unaffected.

## 2026-07-21 — First clinician approval: Dermal Fillers

Context: Amy reviewed /services/dermal-fillers on the stable preview
(post-PR #38 state: film, cards, syringe pricing, Evolus ranking
sentence, text-free style guide) and approved the content; the operator
relayed the approval and confirmed its scope via AskUserQuestion
(dermal-fillers only — not the home-page concept, not other pages).
Decision: clinicianApproved flips true for this one page — the flag
edit made by the operator's own hand per hard constraint 4. The first
page to clear the clinician gate; its draft banner comes down and the
production approvals check will pass it. Consequence: any future edit
to the page's content resets the flag in the same commit (constraint
4); the remaining ten treatment pages stay clinicianApproved: false.

## 2026-07-21 — Evolus ICON event film on Wrinkle Relaxers (as-is override)

Context: the operator directed adding evolus02.mov — Evolus's "ICON, an
Evolus HQ Experience" event recap (87s, Instagram-watermarked, Amy
among the attendees) — to /services/wrinkle-relaxers. The flag was
stronger than the Evolysse film's: the piece contains the CMO's spoken
comparative-efficacy segment ("Compared to Botox… we saw a statistical
difference of superiority", with Nuceiva-vs-Vistabel charts), three
named third-party providers with practices (a cosmetic surgeon, an RN,
an APRN), Evolus corporate speakers, and NO safety information — an
event recap, not a DTC ad. Recommended path (rep-cleared cut) and skip
were both offered; the operator chose publish as-is — the fourth
override, recorded here; the operator's merge of this PR is the written
approval. Mechanics: HEVC source required a real H.264 transcode (CRF
20, faststart, audio copied) — the first non-lossless video conversion;
captions were built from the film's own burned-in caption text (Whisper
degraded badly on the music-and-crowd mix; the burned-in captions are
the authoritative transcript and mirror the manufacturer's own wording,
including the comparative remarks) with speaker labels for
accessibility. CLAUDE.md constraint 3 and BUILD_SPEC §8.3/§8.4/§7.3
carry the extended exception. Consequences: documented, client-accepted
exposure on comparative-efficacy and third-party-provider content the
text gates cannot scan; the reusable TreatmentVideo component carried
the whole feature with zero component changes; wrinkle-relaxers remains
clinicianApproved: false (Amy's gate still ahead of production).

## 2026-07-22 — Body Contouring built on Evolve, scoped to tighten-and-tone

Context: the operator commissioned the Body Contouring page and supplied
Evolve pricing ($1,500 / six sessions, $275 / one) plus competitor copy
from a third-party med-spa site — "destroy fat, treat cellulite,
increase muscle strength & tone… real surgery-like results after only a
few treatments" — and open permission to research the device on the web.
Amy's live Vagaro menu (`scans/Vagaro/Chemical peel - Evolve.png`)
settled the scope: the category **Evolve** carries exactly one service,
**"Tighten and tone."** InMode's platform splits into Tite (bipolar RF →
skin), Tone (EMS → muscle) and Trim (RF + vacuum → adipose); Amy sells
Tite + Tone. Decision: the page describes only what she sells. The
competitor copy was rejected on **accuracy first** — it advertises Trim,
a service she does not offer — and on BUILD_SPEC §7.11 second ("describe
by intended design … never as outcomes. No body-fat or measurement
language of any kind"). No override was sought, and none should be: the
four prior as-is overrides all covered *manufacturer-produced* assets,
whereas this is an unsubstantiated third party's marketing prose.
Publishable substrate is InMode's own mechanism wording (uniform heating
to the skin and the layer beneath it; EMS prompting involuntary muscle
contractions), which carries no outcome claim and passes every category.
Alternatives rejected: a Trim-inclusive page (misrepresents the
practice); an operator override to carry the competitor claims (would
advertise a service Amy cannot deliver — a worse exposure than the
compliance one). Pricing: shown, per operator direction. Both strings
are **count-keyed, not mg- or unit-keyed**, so no pattern in the
registry matches and **no `allowedStrings` entry was added** — the same
shape as the shipped "$350 for 10 threads"; `compliance/banned-patterns.json`
is untouched. A "course of six" is treated as a **unit of sale**, not a
prescribed regimen: it carries no frequency and no interval, unlike the
biostimulator Duration column (2 months on / 1 month off) excluded
earlier as a cycling protocol. Two further operator calls: placement
areas (abdomen, flanks, thighs, arms, buttocks) and session length
(~30–60 minutes) are named — the **first session length stated anywhere
on the site**, admitted as a scheduling fact rather than a duration
protocol; and the page **ships without imagery**, because a photo screen
of `C:\Amy\pics` found nothing depicting Evolve or the treatment room
(the shoot is entirely facial/injectable/skincare; the one wide frame is
the multi-provider group shot, constraint 2), and body imagery on a
body-contouring page reads as a before/after implication. Deliberately
**not** written: "no downtime" — unbanned by regex and arguably
procedural, but still a promise about the patient's experience; the page
says "nothing is injected and nothing is cut" instead. Consequences: the
page is the first treatment page with no media row, so the deck card,
two product cards, a two-energy list and a six-item FAQ carry the visual
weight; `ctaType` stays `consult` per the §6 route table;
clinicianApproved stays false. A §7.11 spec note recording the
Tite+Tone scope is proposed separately (operator-gated), on the model of
the §7.5 Radiesse clarification, to stop a future session
re-introducing fat framing.

## 2026-07-22 — Skin Rejuvenation rebuild: PiXel8-RF + chemical-peels placeholder

Context: the operator supplied a Rohrer Aesthetics PiXel8-RF brief
(C:\Amy\scans\Pixel8 — constraint-8-class, view-only) and two prices
(PiXel8-RF $1,500; chemical peels starting at $180), with peel details
incomplete. Decision: rebuild /services/skin-rejuvenation to the
biostimulators standard now — product cards, mechanism-design copy
("designed to prompt the skin's own collagen and elastin"),
appearance-hedged indication areas, FDA-cleared stated as the accurate
device term — with the peel section written as a compliant placeholder
tracked by the new {{CHEMICAL_PEELS_MENU}} registry token. Operator
decisions via AskUserQuestion: price shows as bare $1,500 (basis
explained at consultation); no photo for now (no PiXel8 assets exist;
amy-at-work/pink-gloves-detail remain available). Alternatives
rejected: waiting for the complete peel menu (blocks a finished line
indefinitely); showing a price basis the operator hadn't confirmed.
Excluded per §8: needle depths/pin counts, session schedules, results
timelines, downtime promises, PIH claims, "first and only 4 MHz"
superiority, brochure before/after cases and their named med-spas.
Both price strings pass lint:claims untouched — no allowlist change.
Consequences: page ships clinicianApproved: false behind the
DraftBanner; peels deepen when the token resolves; brochure scans
never enter the repo.

## 2026-07-22 — IV Therapy built on the live menu; source cards rejected

Context: the placeholder needed a real page. The operator supplied
pricing (Myers' $125, NAD IV $200) and pointed at two source folders —
`scans/Vagaro` and `scans/peptides` — quoting the Glutathione "Uses"
line as intended copy. Decision: scope taken from Amy's Vagaro booking
menu (IV category = NAD, Immunity boost, Myers cocktail) plus the two
shots named in §7.7; five cards grouped by the `tag` field into IV
infusions and shots. Card copy states what each substance **is**, never
what it does. The `scans/peptides` cards are constraint-8 internal
product cards (reconstitution, dosing, duration) whose Glutathione
"Uses" sentence continues into chemotherapy / Alzheimer's / Parkinson's
language — the exact content §7.7 bans by name — and whose NAD+ card
reads "Chronic fatigue reduction". Handled like the Rohrer brief behind
§7.10: read to identify, never committed; the single nugget taken was
corroboration, Amy's handwritten "IV NAD $200". Alternatives rejected:
carrying the quoted half of the "Uses" line (it passes lint:claims
cleanly — "liver support", "detoxification", "antioxidant", "oxidative
stress" trip nothing — so this is a judgment exclusion, not a gate
catch, and §7.7 is written as an absolute for Glutathione); the company
site's copy ("Immune and recovery boost", "Cellular repair and mental
clarity", "Detox and skin brightening"), all outcome claims and the
first an explicit §7.7 violation; inventing a price for Vitamin B12 (it
carries no price line instead); a sixth "vitamin shots" card
duplicating the two cards that already are shots. Operator decisions
via AskUserQuestion: $125 is the Myers' Cocktail with those five as its
ingredients (not six separate items — corroborated by Vagaro listing
only three IVs); identity-plus-ingredients card depth; silence on
unverified prices; Glutathione and NAD+ carried on **both** this page
and peptide-therapy with identical price strings. Also: `pricingDisplay`
consult → none, because the `consult` value injects "Pricing is
individual and discussed during your consultation" — contradictory on a
book-direct page showing four fixed prices; `none` is already in the
schema enum and shipped on skincare.mdx, so this is an accuracy fix,
not a gate change. `ctaType` stays `book` per the §6 route table.
Naming: the page uses the §7.7 name **"Immunity IV"**, not Vagaro's
booking label "Immunity boost" — the latter reads as a benefit though
it trips no pattern (wrong word order; "immunity" ≠ "immune").
Imagery: `studio-wide.jpg`, already in-repo and not previously used on
any treatment page — Amy is the only provider in frame and no location
signage is legible, and an infusion page is the one place the room
itself is the story. *(Correction 2026-07-22: this entry and the
matching CHANGELOG line originally called the file "previously unused
in-repo", which overstated it — `ConceptHome.astro` imports it for the
`/styleguide/concept` demo. The reasoning is unaffected; no new asset
was added either way.)* Consequences: page
ships clinicianApproved: false behind the DraftBanner; Glutathione and
NAD prices now live in two files and must move together; the Vitamin B12
price remains the one open blank (registry token proposed, not added —
BUILD_SPEC edits are operator-gated). Correction the same day, before
merge: the operator supplied Immunity IV's price ($125) and contents
(vitamin C, vitamin B12, B-complex, zinc sulfate, glutathione), so that
card moved from blank to priced. Ingredients are named as composition
only and carry no immune framing — §7.7's product-name rule is
unaffected. Note glutathione now appears twice on the page: as an
ingredient of the Immunity IV, and as a standalone shot.

## 2026-07-22 — The FDA disclaimer the compliance gate was blocking

Context: /services/hormone-optimization shipped `bioteDisclaimer: true`
while `BioteDisclaimer.astro` rendered the literal string
`{{BIOTE_FDA_DISCLAIMER}}` — braces visible — immediately above
symptom-awareness copy. The one disclosure §7.8 makes mandatory had
never actually been shown. The operator supplied Biote's printed
patient materials, which carry the exact wording. Decision: resolve the
token with Biote's own sentence, and enumerate that sentence verbatim in
`compliance/banned-patterns.json` `allowedStrings`. The problem is that
the disclaimer's force comes from naming the four verbs the
`disease-claims` category exists to ban, so hardcoding it failed
lint:claims three times over — the gate was blocking the compliance
text. Alternatives rejected: loosening or adding a lookbehind to the
`disease-claims` patterns (CLAUDE.md forbids weakening a gate, and the
patterns are correct — it is the exception that is unusual); moving the
component outside SCAN_DIRS (hiding text from the linter to make it
pass is the same sin wearing a different hat); leaving the token in
place and dropping symptom language instead (would have silently
narrowed a permission §7.8 grants, and left a broken placeholder on a
live page). This is the **fourth** allowlist authorization and the first
different in kind: entries one through three permit copy the client
wants to publish; this one permits text a regulator effectively
requires. No pattern was modified — the list only grew. Exactness proved
before trusting it: the exact sentence passes, "illness" for "disease"
fails, a shortened variant fails, the verbs reused as real marketing
copy fail, and a line-wrapped disclaimer fails. That last case is a real
hazard rather than a hypothetical — `lint-claims.mjs` strips allowed
strings and applies patterns per line, so a 150-character sentence
wrapped by an editor or a formatter matches nothing and trips every verb
in it. Both editing rules (one line; never restate the verbs elsewhere
in the file) are recorded in the component header, because the next
person to touch it will not have this context. Consequences: the
symptom-awareness permission is usable for the first time; §17 records
the token RESOLVED; the stripping is global across scanned lines, which
is harmless only because nothing else contains that exact sentence.

## 2026-07-22 — Hormone Optimization built on the Biote pellet line

Context: the page was a placeholder — 2 FAQ items, no cards, no prices.
Decision: scope from Amy's Vagaro menu (`Hormones/Biote` = Hormone lab
draw, Pellets; the category's IV item belongs to the IV page), drafted
from the operator-supplied Biote transcription — manufacturer patient
marketing, treated view-only and never committed, the same handling as
the Rohrer brief behind §7.10. Operator decisions via AskUserQuestion:
resolve the disclaimer and take the full symptom framing; **two separate
pellet cards** (Women $450, Men $750) rather than one card with two
price lines, accepting the orphan card in the two-column grid; and a
**dedicated men's section**. On that last point I had warned the men's
section would be thin, and corrected upward before building: the
linter's symptom vocabulary — low energy, poor sleep, libido — is
exactly what `bioteDisclaimer: true` unlocks, so the section stands on
permitted language rather than scraps. **Revised the same day, before
merge, at the operator's direction:** a matching *For women* section was
added, and this was a restructure rather than an append. "Who it's
generally for" had carried hot flashes and night sweats — the
specifically female symptoms — so it *was* the women's section in all
but name, which is precisely why "For men" read as an appendix to a
female default. That section is now a genuinely universal frame holding
the "a pattern is a reason for a conversation, not a conclusion"
caveat, with the gendered vocabulary moved down into two parallel
sections. Women first, matching card order. **"Menopause" and
"perimenopause" are deliberately absent** — neither is a banned pattern
and neither is a disease, so the linter would allow both, but naming a
condition the pellets are *for* contradicts the disclaimer rendering two
paragraphs above it. The deciding argument was evenness: "Low T" was
already excluded from the men's section on the same reasoning, and the
page cannot police male condition-naming while waving through the
female equivalent. "Weight gain" was also left out despite sitting on
the permitted symptom list — in a hormone section it implies a
weight-loss outcome by association, and that line has its own page.
Women's pellets are deliberately
**not** described as estrogen: the source says pellets contain
testosterone or estrogen and are patient-specific, and women's plans may
include testosterone, so naming one would be an invention (constraint 7).
Alternatives rejected: the entire post-procedure timeline — insertion
intervals, procedures per year, lab cadence — which is frequency and
protocol material banned by constraint 3 and is aftercare for existing
patients rather than marketing; "precision dosing" and the proprietary
platform wording (the concept survives as "measured from your labs", the
word does not); every disease name in the source (heart disease,
diabetes, osteoporosis, anxiety, depression, PTSD, bone density,
cognition, prostate) — **the disclaimer unlocks symptom framing, never
disease claims**, and that is the sharpest line on the page; quantified
efficacy (8.3% bone mass per year, 2–3% testosterone yearly, 10%
decline); superiority ("world's #1 trusted hormone optimization
company", 85 years, 4 million insertions); all three testimonials; the
marketed outcome lists; the DIM SGS+ supplement, a structure/function
claim for a product not on Amy's menu; and "takes less than a minute and
is unnoticeable" as a comfort promise — available if the operator wants
it, omitted by default on the same reasoning as "no downtime" on Body
Contouring. `pricingDisplay` stays `consult`, unlike IV Therapy: here
the layout's "pricing is individual" line is true, since the prices are
per-insertion and the plan follows from labs. No imagery — §7.8 keeps
Biote branding text-only pending `{{BIOTE_PERMISSION}}`, and no in-repo
photo depicts pellet care (`pink-gloves-detail.jpg` carries legible
"Mobile Aesthetics" tray branding, the constraint-2 reason
`amy-at-work.jpg` was rejected for IV Therapy). Consequences: page ships
clinicianApproved: false behind the DraftBanner; the men's price makes
the line explicitly non-gendered for the first time on the site.

## 2026-07-22 — /services cards recolored to client-picked pinks; edge rule moves to ink-pink

Context: Amy reviewed /services and directed new card-state colors,
relayed by the operator as exact hexes (third iteration of the picks;
lighten-on-highlight confirmed via question after the pair inverted the
original darken direction): #efb1d5 at rest, #f4cae2 highlighted, and a
darker color on all four sides when highlighted. Decision: new semantic
tokens --ng-card-rest/--ng-card-hover carry the two hexes, scoped to
.treatment-card only; the highlight state adds a 2px ink-pink ring
(1px border-color flip + 1px inset shadow — no layout shift); the
signature left edge rule and the ring move magenta-600 → ink-pink
because magenta-600 fails the 3.0:1 non-text bar on the rest pink
(2.57:1; 3.11:1 on the highlight pink is margin-thin). All new pairs
computed with the house WCAG script (sanity pair 17.22 reproduced) and
recorded in the tokens.css header. Alternatives rejected: repointing the
shared --ng-card token (nine other consumers — would restyle
disclaimers, product cards, the location card sitewide); keeping the
magenta-600 edge (fails the non-text bar on the new rest background).
Consequences: /services cards are now a deeper brand pink than the
blush-50 blocks elsewhere (extendable on request); the 2026-07-18
card-hover #fde9f4 derived pairs are retired with the value; no gate,
linter, or content changes — clinicianApproved flags untouched.

## 2026-07-22 — Services-card colors settled: reversed shades, ink-pink highlight accent

Context: the recolor iterated four rounds on the PR #47 preview in one
day. Round 1 (deeper #efb1d5 at rest, lighter #f4cae2 highlight,
ink-pink ring) was reversed at client direction — rest is now the
lighter #f4cae2, highlight deepens to #efb1d5. For the highlight ring +
title letters the client trialed hot pink #ff4f8b (2.13:1 — fails the
3:1 WCAG bars, flagged), plum #a83b71 (4.08:1 — passes, declined on
looks), and the logo-lips neon #fe019a = --ng-neon-500 (2.10:1 — fails,
plus the token's never-as-text rule, flagged), then chose to return to
ink-pink (#b01366, 3.81:1 on the highlight bg — passes AA). Decision:
ship the reversed shades with the ink-pink ring + title letters — fully
compliant, no override needed. Alternatives rejected: the three trial
colors (two fail WCAG, one declined); magenta-600 (2.57:1 non-text on
#efb1d5). Consequences: every shipped pair is recorded in the tokens.css
header table; the trial history lives there too so the failing colors
are not re-tried; no gate or content changes.

## 2026-07-22 — Compliance documentation reconciled with the linter

Context: after resolving {{BIOTE_FDA_DISCLAIMER}} the operator asked for a
documentation check. Auditing rather than answering from memory turned up
three gaps, one of which predates this session's work. Decision: fix all
three in a docs-only change. (1) `compliance/README.md` stated the linter
scans `src/content/**` and `src/pages/**`; `SCAN_DIRS` is six directories
including `src/components` and `src/layouts`. That error is directly
implicated in the disclaimer problem — a reader would conclude a disclosure
component is exempt from the banned patterns, which is the opposite of the
truth and the whole reason hardcoding the FDA sentence failed the gate. (2)
The same file documented no allowlist whatsoever, though `allowedStrings`
now holds nine entries and is the only sanctioned route for publishing text
a category would otherwise catch; the per-line stripping hazard was recorded
nowhere a maintainer would look. (3) `.claude/CLAUDE.md` enumerates the
scoped exceptions to hard constraint 3 and listed only three, so the
governing document contradicted what had shipped — a future session could
reasonably have read the disclaimer entry as unauthorized and removed it.
Alternatives rejected: leaving CLAUDE.md alone on the grounds that it is
operator-governed (the operator authorized the exception; the file is the
record of such authorizations, and leaving it stale is the riskier act);
documenting the allowlist only in DECISIONS (nobody reads a 1400-line log
before editing a component). Also corrected a claim of my own: the IV
Therapy entries described `studio-wide.jpg` as "previously unused in-repo"
when `ConceptHome.astro` imports it for the styleguide demo — it was unused
by any *treatment page*. The reasoning it supported is unaffected.
Consequences: the README now states plainly that a green `lint:claims` is a
floor and not a verdict, since the judgment exclusions accumulating in this
phase — the Glutathione "Uses" text, "menopause", "Low T", "no downtime" —
are all things the regex permits and the rulebook does not.

## 2026-07-22 — Laser Treatments: twelfth line from the Venus Versa brochures

Context: the operator supplied three Venus Versa patient brochures
(C:\Amy\scans\Venus Versa — constraint-8-class, view-only) and asked for a
twelfth service line plus a /services heading change. AskUserQuestion
settled scope: all three applications (NanoFractional RF resurfacing, IPL
photo-rejuvenation, Multi-Polar RF + PEMF), no pricing — consult-routed,
the open menu tracked as the new {{VENUS_VERSA_MENU}} token. Decision:
build /services/laser-treatments to the device-line standard — three
product cards, mechanism as design intent, appearance-hedged areas,
FDA-cleared stated only where the brochures state it (the IPL applicators
and the fine-line applicator; the resurfacing section stays
clearance-silent). Two operator overrides, each flagged once then executed
cleanly: (1) the /services H1 becomes "Twelve lines. One expert
clinician." — "expert" is new wording, a step toward self-description the
heading had avoided; (2) the line is titled "Laser Treatments" although
the platform's applicators are IPL and radiofrequency, not laser — the
flag offered "Laser & Light"; the mitigation is that the summary, the
opening section, and the first FAQ state the physics factually.
Alternatives rejected: waiting for pricing (blocks the line on an open
menu); folding the applications into Skin Rejuvenation (§7.10 is scoped to
PiXel8-RF + peels, and the operator asked for a twelfth box). Excluded per
§8: the manufacturer's marketing name for the third application (a banned
angle, kept out of the repo entirely — recorded only here), session counts
and scheduling intervals, downtime and results-timeline promises,
"lesions"/Fitzpatrick indication detail, device-spec figures, and the
brochure before/after cases with their named med-spas. Consequences: the
SERVICE_LINES enum, the grid, §6/§7.12/§17, and the pa11y URL set grow to
twelve; the page ships clinicianApproved: false behind the DraftBanner;
the cross-link section routes the PiXel8-RF overlap to consultation;
brochure scans never enter the repo.

## 2026-07-22 — Every box wears the /services card pink

Context: after approving the /services card recolor, the client directed
that all boxes on every page match the /services boxes. Decision: repoint
the shared `--ng-card` token at `--ng-card-rest` (#f4cae2) — one token
change recolors all eight light-surface consumers (product cards, deck,
router card, disclaimer block, investigational notice, location card,
about facts, styleguide demos) — and move every box edge rule from
magenta-600 to ink-pink, matching the /services cards exactly: computed
first-hand (sanity pairs reproduced 15.77/4.15), magenta-600 is 3.11:1 on
the card pink (margin-thin vs the 3.0 non-text bar) and the disclaimer's
pink-300 top rule drops to 1.24:1 (near-invisible), so both retire from
box roles. In-box ink-pink links/tags (product tags, location-card phone/
directions links, outline CTA labels) hold 4.60:1 — passes the WCAG AA
4.5 hard bar but sits under the house 4.7 link-headroom bar; flagged with
a computed alternative (#a91162, 4.89:1) and the operator chose to keep
ink-pink everywhere — a documented in-box-links-only exception; the 4.7
bar is unchanged elsewhere. Alternatives rejected: recoloring per
component (eight edits that can drift; the token exists precisely for
this); the darker in-box pink (operator preferred uniformity).
Deliberately unchanged: the ConceptHome blush band (an ambient section,
not a box — blush-50 stays for bands), noir boxes (transparent-outlined
by design), the H1 accent rule and photo washes (magenta on white/photo,
not on boxes). Consequences: ink-900 box text holds 11.80:1 everywhere;
body text and non-text bars pass with margin; tokens.css header gains the
SITE-WIDE BOXES block; axe/Pa11y re-verified over the built site.

## 2026-07-23 — /services becomes a categorized editorial menu

Context: the client compared /services to a competitor page
(themodernaesthetic.co/services) and asked for a redesign of the "plain
pink boxes." Analysis showed the competitor's perceived elegance comes
from order — grouped categories, a repeated per-item anchor, tracked
caps — not from richer boxes. Decision (client-picked from three
previewed directions): the **Editorial Menu** — the twelve cards render
in three labelled groups (Injectables · Skin & Body · Wellness, 4/4/4),
two-across, each card carrying an oversized Playfair index numeral
(01–12), a Playfair title, the sans summary, and a "More information ›"
microline pinned to the card foot; hover adds a 2px ink-pink rule that
draws across the card top (the ng-trace signature at card scale) on top
of the existing plate-deepen + ring. Group openers reuse the
section-opener signature (eyebrow + traced accent rule). Alternatives
rejected: an arch-vitrine card (the brand arch as a jewel case — more
ornamental, monotony risk at ×12) and a noir-band grid (departs the
"noir shell, light interiors" rule and hides the client-picked card
pinks) — both offered with previews; a flat unnumbered restyle (loses
the taxonomy that carries the elegance). Consequences: `serviceLines`
array order is now the display + numbering order and injectables lead
the page (Weight Loss led before — client accepted the reorder); the
microline is ink-900 because 13px ink-pink fails the 4.5 body bar on
the hover plate (3.81:1); every contrast pair was already recorded in
the tokens.css card tables — no new pairs; built CSS grew 197 bytes,
JS stayed zero; ConceptHome and the styleguide inherit the grouped menu
via the shared grid.

## 2026-07-23 — Card fill reconfirmed: the pink plates stay

Context: with the editorial menu on the PR #52 preview, the client
still found the competitor's page more elegant. Diagnosis flagged: the
competitor's elegance is air — color as jewelry, not atmosphere (the
§5 principle) — and the filled pink plates are the remaining gap. Two
lighter fills were prototyped against the real build and shown beside
the current plates as screenshots (a blush #fdf2f8 wash deepening to
the plate pink on hover, and white "air" cards with hairline frames —
the recommended option). Decision: the client chose to keep the pink
plates as built; executed without re-arguing (flag-once rule).
Consequences: PR #52 ships visually unchanged; the site-wide box pink
stays fully consistent; the durable next elegance lever is per-line
photography — a client asset conversation, its own step.

## 2026-07-23 — Skincare page: storefront URL decoded from Amy's own QR card

Context: the twelfth line's conversion path needed `{{SKINBETTER_URL}}`
("operator to supply"). It arrived indirectly: the QR on Amy's Skinbetter
counter card (C:\Amy\pics\20260623_175534.jpg) decodes — scratchpad jsqr,
never committed — to skinbetter.pro//MobileAesthetics?k=signup, which
301s to connect.skinbetter.com/MobileAesthetics. Both variants verified
in-browser: the bare URL lands on the skinbetter.com shop, ?k=signup on a
create-account form; both carry the practice's businessPartner_id (§9's
"businessPartner id" confirmed live). Decision: wire the canonical bare
URL — a Shop button lands on the shop, attribution is identical, and the
card's signup-first flow suits in-studio acquisition rather than a
website CTA. The operator also established that Amy is the sole owner of
Mobile Aesthetics, which settles the §16 checklist item ("hers, not the
shared location's") by fact and retires the 2026-07-18 Vagaro/Yelp
shared-location flags (comments corrected; URLs unchanged; constraint 2
and the voice rule unaffected — sole owner ≠ sole provider).
Alternatives rejected: the ?k=signup URL (form-first landing punishes
cold traffic); reproducing the QR image on the page (redundant with the
button). Consequences: siteConfig.skinbetterUrl is live and the
skinbetter_click event is armed; §9/§16/§17 updated; the page ships
clinicianApproved: false behind the DraftBanner like every treatment
line.

## 2026-07-23 — Skincare page: routine-step cards replace the product catalog

Context: the page shipped as a nine-product showcase, verified against
Amy's studio photos. The operator then corrected the premise: Amy is an
authorized Skinbetter Science provider who can sell any product in the
line (many categories, many products, inventory that churns), so
enumerating specific products misstates the offer and rots — a static
page should never mirror a live catalog. Decision: six routine-step
cards (Cleanse · Correct · Renew · Moisturize · Eye · Protect — the
step vocabulary already present as the old cards' tags), body copy
stating the complete line is available through the storefront, and
exactly two franchise names permitted as illustrative examples
(AlphaRet, sunbetter) in body copy only, never on cards. No other
product names, no enumeration, no hardcoded category count, on any
rendered surface (copy, FAQ, SEO meta, JSON-LD, alt text). The
`products:` frontmatter list was removed outright. Alternatives
rejected: ~15 brand-category cards (taxonomy churns with the brand,
overcrowds the grid, recreates the enumeration one level up); pure
editorial with no cards (loses the "What Amy offers" card slot and
visual parity with every other treatment page). Consequences: zero
code/schema changes; the layout's products bullet-list fallback is now
unreachable on this page; the storefront is the only catalog; the page
still ships clinicianApproved: false behind the DraftBanner.

## 2026-07-23 — Skincare: branded storefront callout (competitor comparison)

Context: the operator reviewed a competitor also partnered with
Skinbetter (glowwithharmonia.com/skincare/#sk-lines). Their block links
skinbetter.pro//HarmoniaWellnessandAesthetics, which 301s to
connect.skinbetter.com/HarmoniaWellnessandAesthetics — the same
provider-storefront system Amy's page already links canonically, so
functional parity already existed (Amy's link skips their redirect
hop). The gap was presentational: their block gives the partnership a
branded visual moment. Decision: add StorefrontCallout.astro to
/services/skincare — a noir-surfaced plate after "How buying works"
(eyebrow "Skinbetter Science · Authorized provider", statement "Amy's
custom Skinbetter storefront — the complete line, shipped to your
door.", CTAButton shop variant). "Custom … storefront" is Skinbetter's
own counter-card phrasing. Text-only branding; the Skinbetter logo
waits on partner brand assets from Amy (open follow-up). Alternatives
rejected: no change (the partnership had no visual moment on the page);
importing the competitor's copy ("clinically proven", "award-winning" —
fails §8 claim rules); switching to the skinbetter.pro vanity URL
(redirect hop; canonical already wired, DECISIONS same date, above).
Consequences: two shop CTAs on the page (mid-page handoff + closing
band), both firing skinbetter_click; zero new JS; noir stays
per-section per the a11y rulebook.
## 2026-07-23 — Studio strip: three photos join /services

Context: the client asked for photos from C:\Amy\pics on /services —
frames of Amy performing services, none already used elsewhere. All
~55 unvetted frames were surveyed (two parallel reviewers, per-frame
rubric: subjects, scene, every legible word/brand, crop-ability), the
finalists re-verified first-hand. Decision (client-approved): a
three-frame "studio strip" between the lead and the Injectables group
— 8K0A9415 → forehead-treatment.jpg (forehead injectable moment;
the client picked this frame over the initially proposed 8K0A9539
brow assessment), 8K0A9595 → lip-filler-detail.jpg (lip filler
close-up, no legible text in frame), 8K0A9695 →
male-client-treatment.jpg (male client wrinkle-relaxer moment). All
three pictured clients are release-cleared subjects: two are already
live on wrinkle-relaxers, and the third is the subject of the
explicitly release-cleared 8K0A9397 (same session, verified
first-hand by outfit match); the operator confirmed the on-file
releases cover additional same-shoot frames, and the 9415 swap was
the client's own direction.
Frames wear the About-portrait treatment: hairline border, 4/5 crop,
light-wash grade + magenta multiply (§5). Excluded with reasons: the
five-woman team portraits (picturing five providers implies a team —
constraint 2, same principle as the "we" ban); every Jeuveau-banner /
product-box / vial-central frame (pharma marketing or packaging in
frame — 9575, 9483/93/9503, 9596/97, 9602, 9613, 9663, 1072, 1120,
9381, 9749, 9881, 9922); all frames of the two unreleased clients
(0xxx/1xxx sessions); 8K0A9862 (Amy under her neon — offered as a
swap, client kept the working trio; its held vial was zoom-vetted at
full res: fine print illegible, so it remains available for later
use). Consequences: /services gains ~90–180 KB of lazy-loaded
responsive images (LH image budget re-verified); alt text is factual
and claims-clean; no text overlays, so the opaque-plate rules are
untouched; three more C:\Amy\pics frames are now committed under
neutral filenames.

## 2026-07-23 — Ombre page canvas: the white body becomes a blush-to-brand-pink ramp (/services trial)

Context: the client finds the white page background bland and asked for
an "ombre" — a vertical pink gradient, light at the top, darker toward
the bottom — trialed on /services, then site-wide once the look is
agreed. This reverses the 2026-07-18 "serious glamour" surface line
("ambient light surface back to paper … white space carries the
luxury"), which itself reversed the 2026-07-08 "warm the studio" blush
inversion. Flagged per the flag-once rule; the operator approved the
plan with the flag visible — that approval is the recorded override,
and the paper-ambient line of the 2026-07-18 decision is SUPERSEDED for
ombre-flagged pages (the rest of that decision — noir shell, bounded
pink boxes, motion vocabulary — stands).
Decision (client-picked from screenshots of four built ramps): the
ramp matches the client's supplied reference image (pink_ombre.jpg,
repo root of the operator's tree — reference only, never committed):
blush-50 #fdf2f8 at the top sweeping to brand pink-500 #ec4899, full
depth reached at 80% of the document so the whole sweep is visible
above the noir CTA band. Mechanism: BaseLayout `ombre` prop ->
html[data-ombre] -> longhand background override on the body (solid
start color + gradient, no-repeat); the base body rule, --ng-surface,
and every noir band are untouched.
Three pastel ramps (white->blush; blush->55% card-rest #f9e2ef;
blush->75% #f7d7e9) were built, shot, and offered first; the client's
reference showed the intent was far bolder, and the client confirmed
the pink-500 build ("Ship D").
Contrast system (tokens.css OMBRE CANVAS block): the end stop is
pink-500 EXACTLY — the deepest surface with a recorded ink-900 body
pair (4.88, the BRAND-PINK FILLS pair); neon-500 fails it and never
renders as a light surface. Companion re-inks on ombre bodies, via new
--ng-kicker / --ng-rule-accent tokens (defaults preserve the old look
everywhere else): eyebrows, accent rules, and the focus ring switch to
ink-900 (ink-pink falls to 2.33 and magenta-600 to ~1.9 mid-ramp).
Canvas-level ink-pink links are legal only in the top ~15% of an ombre
page (breadcrumbs on blush, 6.14 + underline). Noir scopes gained
explicit --ng-kicker/--ng-rule-accent (pink-300) so the CTA band and
footer are pixel-identical.
The a11y gate: axe cannot compute a contrast ratio against a gradient
backdrop and files such text as needs-review, which this gate counts
as a hard failure — the first build confirmed it first-hand, failing
even the 15.77:1 H1. A satin-sheen-style re-engineering (solid color
on <html>, ramp on a body::before layer) was tried and failed WORSE:
axe flags a background-bearing pseudo on an ancestor for every text
element on the page, including the solid-noir header and footer. No
smooth full-page ombre is fully axe-auditable — the only compliant
alternatives were plates under all canvas text (not the reference
look) or dropping the ombre. Decision (operator, 2026-07-23, by
explicit in-session instruction after the flag and options): the
/services entry in .pa11yci.json becomes a per-URL object with
levelCapWhenNeedsReview: "warning" — axe's cannot-determine class is
non-fatal on that one URL; true violations still fail at zero
tolerance on all 23 URLs including /services, and the other 22 URLs
are untouched. The recorded OMBRE CANVAS pairs in tokens.css (worst
case ink-900 on pink-500, 4.88, passing) are the human review those
needs-review items require. Every future ombre page (phase 2) needs
its own visible per-URL entry — an auditable list, not a blanket
change.
Alternatives rejected: gradient inside --ng-surface (leaks into every
noir .surface element); page-scoped section background (ramp would
stop at the noir band; phase 2 would touch every page);
background-attachment: fixed (viewport-relative — the brief is
darker-as-you-scroll); neon-500 end stop (text + brand rules above).
Consequences: /services reorders nothing — only the canvas changes;
cards read as light plates on deep pink below ~40% of the ramp and
lean on hairline + content at the canvas-equal crossing (~30%);
site-wide rollout (phase 2, after client approval on the trial) is a
selector flip plus a client decision on the white mattes
(TreatmentVideo, .media-figure, ConceptHome .nc-post/.nc-blush).
ProductDetailCards in-card eyebrow tags will flip to ink-900 on ombre
pages when phase 2 lands — surface with the client then.

## 2026-07-23 — Ombre canvas goes site-wide; functional accents invert to ink

Context: Amy approved the /services ombre trial on the stable preview
the day it merged (PR #55) and directed the ombre onto the rest of the
site. Phase 2 executes the rollout recorded in the trial decision.
Decision: the ramp is now styled off the surface itself —
body:not([data-surface='noir']) in global.css — so every light page
wears it and noir bodies (construction home, /404) stay flat black.
The trial `ombre` prop and html[data-ombre] hook are deleted (no
per-page opt-out; the surface IS the design). Site-wide addition to
the companion re-inks: --ng-link -> ink-900 on ombre bodies, because
canvas-level ink-pink fails mid-ramp (2.33) and light pages carry
canvas-level links and outline CTAs below the safe zone (breadcrumbs
everywhere, the about-page consult CTA, legal-body links, FAQ
markers). Links stay distinguishable by underline (prose, breadcrumbs)
or border (outline CTAs) — never color alone. Consequence inside
boxes: plated links/tags flip ink-pink 4.60 -> ink-900 11.80, lifting
the 2026-07-22 in-box exception on ombre pages; the house 4.7 bar is
met with headroom again. Noir scopes keep pink-300. The display accent
re-inks as well — its only light-canvas consumer is the VisitSteps
numerals, which sit mid-ramp where magenta washes to ~2:1 (caught on
the rollout screenshots, fixed before the PR).
Deliberately unchanged, for review on the preview: the white mattes
(TreatmentVideo paper mat, TreatmentLayout .media-figure, ConceptHome
.nc-post) now read as framed prints on the pink canvas — kept as the
strongest default; ConceptHome .nc-blush ambient bands (concept page
only) will read lighter than the mid-ramp canvas around them — noted,
concept is not a public page. Solid CTA fills (pink-500 + ink text)
appear only in noir bands on real pages, so fill-vs-canvas blending at
depth does not arise outside styleguide demos.
A11y (same mechanism as the trial, operator-gated): every ombre page's
pa11y entry gains levelCapWhenNeedsReview: "warning" — 21 of 23 URLs,
each visibly listed; the noir-bodied two keep full needs-review
enforcement. Real violations fail at zero tolerance everywhere.
BUILD_SPEC §5 brand direction amended: "pink is jewelry" becomes "pink
is the atmosphere; the jewelry inverts to ink" — white space retired
as the luxury signal on light surfaces, superseding the 2026-07-18
language for good.

## 2026-07-23 — /about portrait becomes Amy's family (consent-gated swap)

Context: Amy asked (via the operator) to replace the /about portrait —
previously the release-cleared "Amy with a client" mirror-moment frame
— with 8K0A0893.jpg, her formal family portrait. That frame was
categorically excluded during the 2026-07-23 photo survey because it
pictures her family INCLUDING AT LEAST TWO MINORS, and publishing
children on a public marketing site is permanent (public previews,
indexed production, caches/archives beyond retraction).
Decision: flagged per the flag-once rule with those specifics; the
operator confirmed on the record that Amy consents for everyone
pictured, including the minors. Published as
src/assets/photos/family-portrait.jpg (neutral filename). Alt text
deliberately names no one but Amy ("Amy Palacios, FNP, with her
family."). The crop anchor moved 12% -> 38% (group faces sit
mid-frame, unlike the single-subject shot). mirror-moment.jpg remains
in the repo (ConceptHome still uses it). The survey exclusion for
8K0A0893 is lifted for THIS use only — any other placement of the
family, or any frame of the children alone, needs its own operator
confirmation. Consequences: /about's message shifts from
practice-forward to person-forward (client's deliberate choice; the
practice photo remains available if she reverses); /about is
LH-gated, so the eager/high-priority portrait swap is re-verified
through the full suite.

## 2026-07-25 — Taste audit: five polish adoptions, eight skill rules rejected

Context: the operator installed the third-party taste-skill pack
(Leonxlnx/taste-skill) and asked for a read-only audit of the live
site against it before changing anything. Three pages audited
first-hand (/services, /services/wrinkle-relaxers, /about, desktop +
mobile screenshots of the live deploy) plus the full component/style
source. Verdict delivered as a report artifact: the fundamentals the
skill polices already pass — the locked constraints (zero JS, real
photography, verified contrast pairs) eliminated the slop class
wholesale — so findings concentrated in rhythm and finish.
Decision (operator: "let's adopt the five items"): (1) trust-chip
middots now TRAIL each chip (::after on non-last) so a wrapped
credential line never starts with a stray dot — the audit's one real
bug, visible on every conversion band; (2) odd-count
ProductDetailCards sets: the last card spans the full row at ≥640px,
closing the orphan-beside-empty-cell hole; (3) nav current-page
marker — aria-current ("page" on exact match, "true" on /services
subpages) plus a persistent pink-500 underline, text color untouched
so contrast pairs are unaffected; (4) orphan control — text-wrap:
balance joins display-1/2 and heading-2/3/4 (display-0 had it),
pretty on lead and prose paragraphs (progressive hints); (5) CTA
pressed state — a 1px :active translate. Motion-vocabulary note: the
pressed state is recorded as a STATE style (hover's sibling), not an
addition to the sanctioned motion moves; it carries no transition, so
reduced-motion behavior is unchanged.
Eight skill rules rejected on the record, each colliding with a
locked decision, the compliance rulebook, or the brand: serif swap
(Playfair is the brand face and the skill's own luxury exception),
dark mode (single-theme by design), JS motion choreography (zero-JS
lock), icon libraries (no-new-deps), gradient noise/grain (would
break the ombre's auditable contrast math), accent desaturation (the
brand IS hot pink), invented "organic" data (compliance-prohibited),
and noir-band removal (the brand's bookends). Six discuss-list items
(featured-card pick, MORE INFORMATION microline repetition, page-name
eyebrows, zigzag variation, polaroid captions, em-dash thinning) are
parked for client/Amy votes — none actioned.
Consequences: five files touched (TrustChips, ProductDetailCards,
Header, CTAButton, global.css) — CSS plus one aria attribute; zero
content edits, zero gate-config edits, approval flags untouched.

## 2026-07-25 — Featured-card activation: operator passes

Context: the taste audit's highest-value discuss item — activate the
dormant featuredSlugs prop so one or two /services menu cards render
double-wide (the pick has been an open business decision since the
editorial menu shipped, PR #52).
Decision (operator, 2026-07-25: "we're going to pass"): the menu stays
all-equal. The prop remains in ServiceLineGrid, dormant — no code
change, no removal; a future client pick can still activate it.
Consequences: the twelve-equal-cards composition is now a recorded
client preference, not an open question; do not re-pitch it unless the
client raises it.

## 2026-07-25 — Treatment media recomposition: captions retired, the zigzag capped

Context: two taste-audit discuss items, operator-agreed in discussion
and client-approved from the before/after artifact ("Amy loves it"):
decorative polaroid captions labeled what the eye already sees (the
"decoration pretending to be documentation" tell), and
wrinkle-relaxers ran three identical alternating media rows
back-to-back — the only 3-run on the site (verified per page during
the sweep; every other page has one or two rows).
Decision, two moves: (1) wrinkle-relaxers' third media moment became a
full-width band — new .media-band variant in TreatmentLayout (matte
inherited from .media-figure, no tilt — the tilt is the small-print
gesture; 16:9 crop via aspect-ratio, astro:assets intrinsic sizes keep
CLS at zero) — scale variation closes the sequence instead of a third
zigzag. (2) ALL thirteen decorative photo figcaptions retired across
the seven treatment files that had them (wrinkle-relaxers 3,
dermal-fillers 3 incl. the lip-guide label, skincare 2, weight-loss 2,
biostimulators 1, iv-therapy 1, peptide-therapy 1). KEPT: the
TreatmentVideo captions (functional — manufacturer attribution +
sound-on cue on films carried under operator overrides), and the
lip-guide figure's full-width layout (informational graphic — the
16:9 band crop must NEVER apply to it; cropping cuts content). Alt
text untouched everywhere; copy untouched everywhere; the figcaption
CSS rule stays in TreatmentLayout (harmless, and a future functional
caption may need it).
Compliance mechanics: dermal-fillers was the one clinicianApproved
page — its caption edits reset the flag to false in the same commit
(constraint 4), on the operator's informed instruction (the reset was
flagged in the audit report and the sweep discussion before the "sweep
the rest" direction). Amy re-reviews a captions-only diff to re-flip.
Each page's edit is its own content commit (audit trail).
Consequences: pages 2–12 lose 13 uppercase tracked micro-labels
(the audit's heaviest-density tell thins measurably); the
wrinkle-relaxers page — the LH-gated treatment representative —
re-verified green through the full suite with the band's larger
image derivatives inside budget.

## 2026-07-25 — Concept home rebuilt: bright hero, ombre canvas, category doors

Context: the concept home (/styleguide/concept) is the approved
direction for the production home (C8), but it predated the ombre
canvas, the editorial menu, the studio photography, and the taste
audit. The client raised three faults, all reproduced first-hand:
the hero photo was over-filtered (grayscale 30% + brightness 0.96 +
a 160° noir→magenta multiply); the SERVICES section rendered the
whole 12-card ServiceLineGrid — /services duplicated verbatim; and
every section painted an opaque background (3× noir, 2× paper, 2×
blush), so the site-wide ombre never showed and the page "looked
like it doesn't belong to the site."
Decision (client direction + operator picks via AskUserQuestion):
rebuild in the CONCEPT SLOT ONLY — the C8 flip to / is a separate
later PR after Amy approves — as six beats: noir hero, canvas
intro/Meet-Amy, category doors, visit + location, the framed IG
post, noir closing.
1. HERO GRADE: the cinema grade is retired from this page. The photo
   now wears the site's light wash (grayscale 10% / contrast 1.03 /
   brightness 1.08) plus a 12% magenta unifier — the same strength
   family as the /services studio strip — and the neon bloom drops
   38% → 24%. The full-bleed duotone multiply is gone.
2. HERO NEON — flagged, then OPERATOR-CLEARED: the brighter grade
   made the studio's neon script legible again (the dark grade had
   been hiding it; the original code comment flagged it for operator
   review). An asset-level crop was built and measured first —
   candidates at 10/12/14/16% off the top, 16% being the minimum that
   erased every letterform — but at the desktop window's aspect that
   crop also cut the top of Amy's head. Shown to the operator, who
   directed (2026-07-25): keep the sign, fix the head. Rationale
   holds independently — Amy is the SOLE OWNER of Mobile Aesthetics
   (2026-07-23), so it is her own signage; constraint 2 governs OTHER
   providers and is not engaged. The hero therefore ships FULL FRAME,
   uncropped, at object-position 50% 22% (both hero windows are wider
   than the 2:3 source, so cover trims vertically; 22% keeps sign,
   head, and treatment moment in frame at both breakpoints). Do not
   reintroduce a top crop — the component comment says so too.
3. SERVICES → DOORS: three arch-framed photo plates (Injectables,
   Skin & Body, Wellness — the exact /services menu groups), each
   naming its four lines factually and linking to /services, with an
   "Explore all twelve lines ›" close. The home now ROUTES instead of
   duplicating; the arch geometry (the caricature-window motif)
   survives the mirror-figure removal by becoming the door frame.
4. OMBRE: every middle section is transparent — the ramp IS the
   surface. The .nc-blush and .surface paint is deleted; only the
   hero and closing bands re-scope noir. Canvas text rides the
   existing ink re-inks, so no new contrast pairs were needed.
5. PHOTO DISQUALIFICATION (compliance, found in the re-vet):
   pink-gloves-detail.jpg — the concept's full-bleed detail band —
   is OFF the page and unused site-wide. At full frame it shows a
   partially legible branded vial over a tray of prepared syringes
   labeled "Mobile Aesthetics": the prep-tray/vial-central class the
   2026-07-23 rubric excludes (the reason 8K0A9740 was rejected).
   It predates that rubric; the rubric is applied retroactively.
   mirror-moment.jpg also leaves the page — its release status has
   contradictory log entries (2026-07-20 "release unconfirmed" vs
   2026-07-23 "release-cleared") and this page is a production
   candidate.
6. ITALIC FACE RETIRED: the wght-italic import is deleted and the
   accent phrase is upright display-accent. Measured rationale: the
   two fetched latin faces are ≈75.3KB of the 120KB font budget;
   the italic latin file adds ≈38.8KB (≈114KB, near-zero headroom)
   and revives the italic-swap CLS risk — unacceptable for a page
   heading to the / gates.
7. Closing band drops its background photo for the standard sitewide
   noir anatomy, which frees studio-wide.jpg for the Wellness door.
§6 deviation recorded: the "Get-the-App slot" is satisfied by the
sitewide footer's GetTheApp block rather than a home section.
Measured, not gated (this route is not LH-gated): the worst-case
image total — every lazy image fetched, LH-mobile srcset picks — is
199,236 bytes against the 245,760 budget (46KB headroom), and fonts
return to two fetched faces. The C8 flip will prove them for real.
Alternatives rejected: keeping the 12-card grid (the duplication the
client flagged); an editorial two-column index of all twelve names
(no visual punch on the site's first page); shrinking the IG post
(the 34rem size is a recorded client pick — the baked caption must
read comfortably).
Consequences / open C8 prerequisites: (a) the hero client's release
is not confirmed for THIS frame anywhere in the log — confirm on the
record or swap the frame; (b) Amy's sign-off on the IG post caption
(its baked-in text is invisible to lint:claims and lint:voice, which
cannot read pixels — the slot is post-agnostic if she prefers
another); (c) {{MEDIA_SCOPE}} closure.

## 2026-07-25 — Unresolved hours are hidden, not printed

Context: LocationCard printed "Hours: {{HOURS}}" wherever it rendered
(/visit, the styleguide demo, and now the home candidate). On a page
that is about to become the site's front door, a visible placeholder
reads as a broken site rather than as a tracked open input. Operator
direction after seeing it on the rebuilt concept: remove it.
Decision: the hours line renders ONLY when {{HOURS}} resolves — the
same isResolved idiom already used for Footer social links and for
JSON-LD in schema.ts, rather than deleting the feature. The token
stays in siteConfig and BUILD_SPEC §17, so it remains a tracked open
input, and the line reappears by itself the moment real hours land.
/visit's copy stopped promising hours in the same change (lead:
"Directions and contact are below"; card heading "Location & hours"
-> "Location"), with a comment telling the next editor to restore
both when the hours arrive.
Verified: {{HOURS}} now appears in ZERO built HTML files (full dist
sweep). Structured data was never affected — schema.ts's pruned()
already dropped openingHours while unresolved, checked first-hand
rather than assumed.
Consequence: the visible-placeholder convention is now explicitly
scoped — tokens stay visible in DRAFT treatment copy (where they
prompt the clinician), but chrome-level facts (hours, social) hide
until resolved. Nothing about the "never invent facts" rule changes:
no hours are stated anywhere.

## 2026-07-25 — Local agent tooling and root reference images are ignored

Context: `.agents/` (an eleven-skill mirror of the Leonxlnx/taste-skill
marketplace) and `skills-lock.json` sat untracked in the repo root, and
the root image guard covered only `/*.png` — leaving `pink_ombre.jpg`,
the client's colour-study reference, one `git add .` away from being
committed into the client's repository.
Decision: both tooling artifacts join the existing "local tooling"
ignore block beside `.claude/skills/`, and the root debug-image rule
extends from `/*.png` to `/*.jpg` and `/*.jpeg`.
Alternatives rejected: committing the skill mirror (Xtend-AI's agent
scaffolding is not the client's project code, and the lockfile pins
content hashes that mean nothing to her); leaving the jpg gap and
relying on care alone.
Verified: `git ls-files --cached -i --exclude-standard` returns empty
— no already-tracked file became ignored, and `src/assets` is
untouched because every pattern is root-anchored.
Consequence: **the `/*.jpg` rule is not overbroad — it is the guard on
`pink_ombre.jpg`. Do not "tidy" it away.** Note also that gitignore
only governs untracked files: had the reference image ever been
committed, this rule would do nothing and removal would need
`git rm --cached` plus history surgery.

## 2026-07-26 — Documentation-only PRs skip the preview pipeline

Context: every commit ran the full gate suite — build, astro check,
claims lint, voice lint, pa11y over 23 URLs, Lighthouse 3x over 6 URLs
— at a fixed ~5.5 minutes regardless of the diff. A one-line
`.gitignore` edit cost exactly what a 460-line component rewrite cost.
Four consecutive documentation changes (#59, #63, #64, plus the
gitignore chore) spent roughly 25 minutes proving that markdown does
not affect Lighthouse. Operator raised it directly ("why is this
taking so long?") and authorized the fix in their own words.
Decision: `pr-preview.yml` gains `paths-ignore: ['docs/**', '**/*.md',
'.gitignore']` on its `pull_request` trigger.
Explicitly NOT a weakened gate — the distinction that made this
acceptable: `paths-ignore` skips only when EVERY changed file matches
the list. A PR touching any source file still runs the complete suite,
and bundling a code change with a README does not sneak it past. No
gate, threshold, budget, or banned-pattern list was altered; the set
of files each gate scans is unchanged. `production.yml` is
deliberately untouched — it carries the clinician-approval gate and
the Front Door cache purge, and its `push: [main]` trigger is rare
enough that the saving would not pay for the risk.
Alternatives rejected: keeping the run but conditionally skipping the
slow gates (more config surface, more places for a condition to be
subtly wrong, and a run that reports green having checked nothing —
precisely the confusion the skipped-job teardown run caused an hour
earlier); doing nothing (the cost recurs on every docs PR, and this
repo produces documentation PRs by design).
Consequence: documentation-only PRs get no preview environment, which
is acceptable because their build output is byte-identical — verified
repeatedly this week, most recently on #63. One behaviour to watch:
PR #5 (`phase-c` -> `main`) is the standing integration PR and its
diff contains hundreds of source files, so pushes to `phase-c` are
expected to keep deploying the stable preview. If GitHub instead
evaluates only the pushed commits, a docs-only push to `phase-c` would
skip that deploy — harmless either way, since the output cannot
change. Confirm on the first docs-only push after this lands.

## 2026-07-26 — The regenerative line gets one plate, not a zigzag print

Context: the operator supplied `prp01.png` (895x1017, a vertical phone
frame) of Amy injecting PRP at a client's brow, under the studio's
neon script. `/services/regenerative` was by some distance the
thinnest treatment page in the set — 108 body words against 225 for
the next thinnest, three short sections, a two-item product list, and
no image. Four other pages also ship without photos
(body-contouring, laser-treatments, skin-rejuvenation,
hormone-optimization), but all carry three times the copy; this one
had nothing holding the page down.
Decision: the photo lands as a single full-column framed plate placed
immediately after "What they are", and the treatment layout gains a
`media-band--tall` variant to hold it.
Placement: definition first, then the treatment itself. The reader is
told what PRP is in five lines, then shown it. The alternative — the
`media-band` closer beside "Individualized, with Amy", matching
wrinkle-relaxers — was rejected because it leaves the top two thirds
of a thin page with nothing to look at, and this page has exactly one
image to spend.
Scale: the house `media-row` print (18rem, tilted) was rejected as the
wrong instrument. It is a snapshot gesture for pages carrying two or
three images; on a page carrying one, it reads as decoration rather
than as the page's anchor. Straight, not tilted — the layout already
records that the tilt belongs to the small print.
Crop: 9:8, server-side, 895x796 from the top of the frame, committed
as `src/assets/photos/prp-treatment.jpg`. Five ratios were rendered
and compared. The band's default 16:9 contract crops Amy's head off
and deletes the neon entirely; 5:4 cuts the client mid-collar; 1:1
keeps a dead band of shirt at the bottom. 9:8 is the widest frame that
holds the whole composition. The CSS `aspect-ratio` matches the
server-side crop exactly, so `object-fit` is inert and remains only as
the degrade path — same division of labour as the `fine-gauge` band
(2026-07-25), for the same image-budget reason.
Source re-encoded PNG -> JPEG at q92 (948 kB -> 123 kB) because Astro
re-encodes every variant; a thrifty source would compound artifacts
through a second lossy pass. Shipped variants are 16/27/38 kB webp,
against a 245,760-byte page image budget.
The neon script reads "MobileAesthetics" — the location, not another
provider, and the same name already embroidered on Amy's scrubs in
three published photos. Kept deliberately: a sign-free crop was
rendered and is materially worse, since the neon is the photo's entire
colour story and without it the upper third is a grey wall. Flagged to
the operator as a brand call they may reverse; the swap is a crop
offset, not a re-shoot.
Consequence: one new layout variant, available to any future page with
a vertically-composed source. The supplied frame is 895 px wide, so
the plate renders at ~1.24x on a 2x desktop display — visually fine at
1x and on phones, mildly soft on a retina desktop. A higher-resolution
original would sharpen it with no code change.

## 2026-07-27 — Whole-card links are raised; the flat-plate rule is reversed

Context: the client reported the twelve /services cards read as flat —
the same visual level as the page — and asked for raised, almost 3-D,
button-like plates. Investigating rather than styling to taste found a
measurable cause. The ombre canvas ramps blush-50 to pink-500 across
80% of the document and the card fill #f4cae2 sits BETWEEN those two
values, so plate and canvas cross equal luminance and the figure/ground
relationship inverts. Computed with the house method (validated by
reproducing 17.22 / 15.77 / 11.80 / 9.77 / 4.88 exactly before any new
figure was trusted): the crossing is at **19.6% of the document**, the
dead zone is a **band** running roughly 8%–32% where plate-vs-canvas
stays under 1.2:1, and it bottoms at **1.001:1** — the plate is
arithmetically invisible there. The hairline does not rescue it: 14%
ink over the card fill is 1.31:1 against its own plate and **1.12:1
against the canvas** at the crossing, so the border dies with it. The
card sequence begins near the top of that band, which is why the
flattest cards are the Injectables group — the first four seen, and the
group the client chose to lead the page.

Decision: elevation, scoped to **whole-card links only** — the twelve
`.treatment-card`s and the three concept-home `.nc-door`s (a hand-copy
of the same anatomy, and the C8 home). Character: a lit-edge key cap —
two-layer shadow, a 1px paper facet on the top edge, a further rise on
hover/focus, and a settle on `:active`. This **reverses** the recorded
2026-07-23 rule carried in both component headers ("flat brand-pink
plate … NO drop shadow", "No scale/shadow transforms"); those comments
are rewritten rather than left contradicting the code. Operator picked
scope and character from options after the diagnosis.

Static boxes stay flat, and this is the load-bearing half of the
decision: elevation now MEANS "this is clickable". The router card was
checked specifically and correctly keeps none (it wraps a CTAButton
rather than being a link). Compliance blocks especially must never look
pressable — a raised medical disclaimer implies a press target that
does not exist. This narrows the 2026-07-22 "every box matches the
/services boxes" direction, on affordance grounds, with the operator's
agreement.

Mechanism: one shared `.ng-lift` in global.css beside `.chev-nudge`,
not per-component CSS — the duplication had already happened once
(`.nc-door` is a hand-copy), and a third copy was the likely next step.
Three shadow tokens in tokens.css carried like `--ng-aura-glow`: shadow
colours, never text, no contrast bar. The lift is derived from the
existing house framed-print shadow (TreatmentLayout `.media-figure` /
TreatmentVideo) so the menu joins the site's material language instead
of importing a foreign elevation scale — **the print's shadow, never
its tilt**, the tilt being the small-print gesture (2026-07-25).

Alternatives rejected: a 3-tier sm/md/lg elevation scale (every
framework ships one; this site has exactly one shadow idiom and should
end with exactly two — print and lift); **an ink-pink-tinted shadow,
rejected on measurement rather than taste** — 1.79:1 at the top of the
ramp but 1.24:1 at depth, washing out exactly as ink-pink text does on
this canvas, which is why --ng-link re-inked to ink-900 in the first
place; raising every box sitewide (would make compliance blocks read as
buttons); raising /services only (the doors were built to mirror the
card language, so C8 would ship a flat home beside a raised menu).

Two divergences from the 2026-07-25 CTA pressed state, both forced
rather than chosen, recorded so they are not read as drift. (1) The lift
uses `transform`, not the independent `translate` the CTA uses:
`ng-rise` animates `translate` with `both` fill and is applied to every
card AND every door, so its forwards fill would permanently override a
hover `translate:` — it works in dev and silently dies once the element
scrolls past. (2) It transitions, where the CTA press deliberately does
not, because the card already transitioned its hover properties at
150ms. `.ng-lift` also took ownership of the plate's whole state
transition including background and border: `transition` is a single
property, so leaving it declared in both the component and the utility
would have raced the cascade on source order.

Verified, not assumed: full `npm run verify` green — a11y 23/23,
Lighthouse assertions passing across 6 URLs / 18 runs. Because
`levelCapWhenNeedsReview` hides needs-review items behind a "0 errors"
line, pa11y was additionally run direct with warnings surfaced on
/services and /styleguide/concept: **zero items touch the raised
plates** on either URL, and no card or door text appears at all, so axe
still resolves their contrast against the solid plate fill. The 8 and
10 items each URL does report are the pre-existing canvas-level
gradient class the per-URL cap exists for (breadcrumbs, H1, leads,
group eyebrows). Stylesheet measured 6,220 bytes gzipped against the
16,384 budget. Along the way this also corrected the tokens.css note
that put the crossing at "~30% down"; the same script reproduces every
recorded pair in that file exactly, so the note was the thing that was
off. Descriptive comment, not a gate.

Consequences: `.ng-lift` is available to any future whole-card link,
and is documented light-surfaces-only — nothing wears it on noir today,
so no noir scope is defined, and adding one is the prerequisite for a
raised noir card. Left open for the preview: the three `.strip-frame`
studio photos above the menu keep a hairline and no shadow and may now
read as recessed; and the facet strength (65% paper, 1.28:1 against the
card fill, depth-independent) is a tuning knob. No content files
touched, no approval flags, no gate config.

**Spec amendment APPLIED same day (operator authorization).** The §5
"Editorial menu cards" paragraph enumerated the card anatomy and, after
PR #69, omitted the plate's most visible property — not wrong, since it
never claimed the cards were flat, but incomplete. It was proposed
rather than edited in the first pass, per the operator-gating
convention on BUILD_SPEC and CLAUDE.md; the operator then authorized it
directly ("you have permission from me to update it"), and a new
**Raised plates** paragraph was added to §5 carrying the measured
reason, the whole-card-links scope, the square-corner rule, and the
ink-pink ban. The convention is unchanged and worked as intended: the
governing document moved on a recorded authorization rather than on
assistant judgment.

**Shape resolved same day (operator).** Raised plates keep radius 0;
`.cta`'s 2px stays the controls' alone. Offered as a one-line change
either way and declined: at card scale 2px is imperceptible, and a
plate is a printed object (the source of its shadow) while a button is
a control. Recorded in the `.ng-lift` header precisely because the two
now resemble each other enough to invite unifying them — the rule
exists to stop a future session doing that as tidying. The client
approved the raised cards on the first preview ("we really like the
change"), so the elevation itself needs no further round.

## 2026-07-29 — Em-dash thinning: rhetorical dashes go on a budget

Context: reviewing the site for "AI slop" tells, the one place the
scent genuinely lingered was prose rhythm — above all the em dash, the
most recognizable AI-writing fingerprint in circulation. A census over
the BUILT output (same rendered-text extraction as lint:voice, so code
comments never count) measured **313 visible em dashes in 12,373
rendered words — 25.3 per 1,000**, against an editorial norm of
roughly 2–4. Every treatment page ran 20–34 per 1,000; the twelve
decks leaned on the same "X — Y" construction; "— free, as always —"
recurred on five pages. The full census and worked example were
delivered as a review artifact and the client approved the pass.

Decision — the rule, now standing for all future copy: **structural
dashes stay; rhetorical dashes go on a budget.** Labels, bylines, card
names, and film titles keep their dashes (that use is typographic
convention). In running copy: at most one em dash per paragraph, never
two in one sentence, kept only where the pause genuinely earns its
drama. Every rewrite is one of five moves, strongest first: split into
two sentences; comma pair (for the "— x —" double-dash asides, the
most machine-flavored pattern); colon (definitions and lists);
parentheses (pure glosses like BHRT, PRP); or keep the one that earns
it. **Punctuation-level only — no words, facts, prices, or claims
changed** (the only word-level effects are dropped connectives a split
makes redundant and commas inside "free, as always").

Verified before editing, not after: no `allowedStrings` entry contains
an em dash, so the pass could not collide with the compliance
registry; where copy ran a dash INTO the protected Evolus sentence,
only the connector changed and "Charlotte's #1 Evolus provider" is
byte-identical on one line. The Biote FDA disclaimer is untouched. The
hedged duration facts (Daxxify, Evolysse) keep every word — their dash
became a period. The Glutathione identity line moved to parentheses in
both files that carry it verbatim (peptide-therapy, iv-therapy — the
pair that must move together).

Three items ship deliberately UNCHANGED as Amy's call, offered in the
proposal and not yet answered: the Retatrutide `investigationalNote`
(her own directed wording, 2026-07-21 — changes only on her word), the
"Book — or ask first" step heading, and the video captions'
"— sound on." Roughly ten earned dashes were kept on merits (the
/about thesis line "every appointment — Amy herself", dermal-fillers'
deck, laser's "or whether the honest answer is neither", weight-loss's
"never on its own", peptide's "never something you sort out on your
own", skincare's "and this one won't try", iv-therapy's deck,
hormone's "persistently off", wrinkle-relaxers' "Not just for women"
restructure, and the concept hero byline, which matches the kept
construction-home byline).

Result, measured by rerunning the census on the rebuilt output:
**313 → 71 visible (5.9 per 1,000)**; meta descriptions 36 → 6 (the
six that remain are the two byline-class meta strings ×3 renderings);
alt text 24 → 20 (the header logo's "Needle Girlie — home" label).
The residue is dominated by labels — footer and LocationCard lockups
on every page, fifteen draft banners that come down at approval — plus
the twelve unchanged "Book — or ask first" headings awaiting Amy.

Alternatives rejected: zero-dash zealotry (the budget exists because
some dashes are typography, not tells); rewriting sentences freely for
rhythm (would put new claims in front of the compliance gates and
reset nothing-yet-approved copy Amy has already seen in one form); a
lint gate enforcing the budget now (flagged as an optional follow-up —
the rule should survive one review cycle before it becomes CI).

Consequences: future copy is written to the budget rather than
re-thinned later; the census script (session scratchpad, never
committed) is the measuring stick and reruns in one command; one
content commit per treatment file preserves the clinician audit
trail; `clinicianApproved` untouched — all twelve pages were already
`false`, so no resets were triggered and Amy reviews the punctuation
with everything else on the stable preview.

## 2026-07-30 — "Temporary/temporarily" removed from neuromodulator copy (client direction, flagged)

Context: Amy directed (via the operator) that "temporary" and
"temporarily" come off the website — she has duration conversations
directly with clients and does not want the hedge in the copy. A
sitewide census found the words in exactly six places, all
neuromodulator copy: five in wrinkle-relaxers.mdx (summary, Jeuveau
and Xeomin details, the formulation FAQ, the "What they are" body) and
the wrinkle-relaxers card summary in serviceLines.ts. Nothing else on
the site used them.

Flagged once before execution: the adverb was doing compliance work.
"Used to temporarily smooth moderate to severe frown lines" is the
indication-style phrasing authorized from the product sheet (DECISIONS
2026-07-21) precisely because it mirrors the products' label wording,
and §7.3's brief defined the line as "temporary softening." Removing
the word converts label-mirroring statements into unhedged efficacy
statements — no lint pattern fires and the copy stays factual, but the
risk profile ticks up (duration overpromise by omission) and the copy
now deviates from the authorized phrasing. The client proceeded with
the flag visible; this entry is the recorded override, and the
operator's merge of the PR is the written approval.

Decision: drop the adverb in all six places with minimal grammar
repair ("that soften dynamic lines", "used to smooth moderate to
severe…"). §7.3 amended with a dated note so brief and copy agree.
Deliberately UNCHANGED, scoped in the flag and awaiting explicit word
if wanted: Phentermine's "short-term use" (the compliance-chosen
alternative to the appetite-language override, 2026-07-20) and the
Daxxify/Evolysse "labeled for results lasting up to…" hedged label
facts (different words, same honesty job, tied to the priced cards —
the Daxxify FAQ sentence keeps its "labeled for" frame).

Consequences: the neuromodulator page now states what the treatments
do without a duration qualifier; expectation-setting moves wholly into
Amy's consultation, which is her stated practice. clinicianApproved
untouched (the page was already false); Amy reviews on the preview
like everything else.

## 2026-07-30 — Neuromodulator prices narrow to per-unit only (registry + page in one commit)

Context: the client directed the flat-dollar halves off the three
neuromodulator price cards — Jeuveau and Xeomin now show "$10 per
unit", Daxxify "$12 per unit" (was "$400 or $10 / unit" / "$500 or
$12 / unit"). Those exact strings are enumerated allowedStrings
entries (2026-07-21 per-unit override), and per-unit language is
banned everywhere outside them, so the registry and the page's
priceLines changed together in one commit — the same operation as the
2026-07-20 "@ → vial:" reformat, with the client's directive as the
recorded registry authorization (noted in the registry's own
comment). This is a NARROWING: same per-unit figures, prices removed,
nothing added; the linter self-test derives its cases from the
registry, so the exactness proof carries over automatically ("$11 per
unit" or any other unit-keyed string still fails dosing). The
documented per-unit exposure recorded 2026-07-21 is unchanged in kind
and reduced in surface. clinicianApproved untouched; ships on the
open PR #73 preview for Amy's review with the temporary-wording
change.

## 2026-07-30 — The Evolus ranking sentence becomes a noir display plate

Context: client direction — drop "Jeuveau comes from Evolus," and
render "Amy is Charlotte's #1 Evolus provider!" as a bold black box
with pink letters under "What they are" on wrinkle-relaxers. Decision:
a new EvolusCallout.astro — a STATIC noir plate (deliberately not a
scrolling marquee; that experiment was rejected on sight 2026-07-08
and motion stays within the sanctioned vocabulary), Playfair display
at ~39px in pink-500 on noir (the recorded 5.95:1 pair), centered, no
shimmer (the moving glow stays capped at the sign and the hero accent
phrase). The exact allowedStrings entry "Charlotte's #1 Evolus
provider" is byte-intact on one source line with a straight apostrophe
— the component header carries both editing rules. Same page, same
single use; the 2026-07-21 authorization's terms are unchanged, but
the claim's PROMINENCE rises from body prose to display scale —
noted to the operator at execution as Amy's call on her own authorized
claim. Dermal-fillers keeps its prose version ("Evolysse comes from
Evolus, and Amy is…") — unchanged unless directed. clinicianApproved
untouched; ships on the PR #73 preview.

## 2026-07-30 — Concept hero byline reworded to the client's exact sentence

Context: reviewing the PR #72 preview, the client dictated a
replacement for the concept hero byline, shipped verbatim: "The
dedicated practice of Amy Palacios, FNP (AKA Needle Girlie) and owner
of Mobile Aesthetics, clinician-led aesthetics since 2017." Decision:
executed as dictated on the same PR. "Owner of Mobile Aesthetics" is
the recorded sole-ownership fact (2026-07-23) already rendered on the
skincare page, so constraint 2 is not engaged; no banned patterns; the
voice rule holds. One grammar note was offered once ("and owner of"
attaches to "the practice of" rather than to Amy) and the client's
wording stood. Recorded here belatedly in the 2026-07-30 docs sweep —
the change had shipped with only a commit message and PR comment as
its record, which is what this entry corrects.

## 2026-07-30 — The Evolus plate lands on dermal-fillers too (client direction)

Context: the plate decision earlier today left dermal-fillers with its
prose version "unchanged unless directed"; Amy directed it. Decision:
same treatment exactly — "Evolysse comes from Evolus," comes off and
EvolusCallout renders above "The Evolysse film", so both authorized
pages now carry the sentence the same way: once, as the standalone
noir display plate, byte-intact on one source line in the shared
component. The 2026-07-21 authorization's page scope (these two pages
only) and single-use rule are unchanged; the component's header
already covered this placement. clinicianApproved untouched.

## 2026-08-01 — Regenerative definitions: verbatim client wording (operator override); hair indication recorded

Context: the operator judged the regenerative page's PRP explanation
poor and PRP-with-microneedling unexplained, and supplied exact
definition sentences for both — PRP: "a medical treatment that uses a
high concentration of your own blood platelets for stimulating hair
growth." (with the operator-supplied fact "that's how Amy uses PRP" —
hair, a new indication for a page previously framed skin-only); PRP
with microneedling: "combines tiny skin punctures with your own
blood's platelet-rich plasma to boost collagen, smooth scars, and
improve skin tone." The page was the last of the twelve still on the
legacy `products` bullet list rather than productDetails cards.

Decision: the two-string list becomes two productDetails cards (the
house pattern, eleven-page precedent), tags "Hair" / "Skin", no
priceLines (regenerative keeps pricing to the consult — 2026-07-21;
`pricingDisplay: consult` unchanged), and the definition sentences
ship **verbatim as the client wrote them**. Flagged once before
execution: both sentences pass lint:claims (verified against every
registry pattern — no regex covers "hair growth", "boost", "smooth
scars", or "improve") and lint:voice, but §7.6 says "no healing/repair
outcome claims" and every shipped definition card states outcomes as
design intent ("designed to stimulate the skin's own collagen",
"designed to improve the appearance of … scarring") — these are the
site's first bare-indicative outcome sentences. Hedged house-style
variants were drafted and offered (AskUserQuestion, with previews);
the operator chose verbatim with the flag visible. This entry is the
recorded override; the operator's merge of the PR is the written
approval. "Who they're generally for" gains the hair mention in the
same commit so the body matches the cards' scope.

Alternatives rejected: the hedged variants (offered, declined); a mix
(PRP verbatim, microneedling hedged — offered, declined); prices on
the cards (none supplied, and the 2026-07-21 decision stands); adding
any allowlist entry (nothing to allowlist — the sentences trip no
pattern, which is exactly why this is a judgment-level override, not
a gate mechanism).

Consequences: documented, client-accepted exposure on unhedged
outcome phrasing, scoped to these two exact card sentences — any
further outcome copy on this page reverts to the §7.6 rule. §7.6
amended with the dated note (operator authorization = the approved
plan for this change, per the §7.3/§5 amendment precedent). The hair
indication is now on the record as operator-confirmed fact.
clinicianApproved stays false; Amy reviews the new cards on the
preview like everything else.

**Update (same day, evening) — the cards gain prices.** The operator
supplied PRP $600.00 and PRP-with-Microneedling $900.00; carried bare
and whole-dollar ("$600" / "$900") per the PiXel8 bare-price and
sitewide formatting precedents, with no per-session basis invented.
This resolves the no-prices stance the operator-supplies-figures way,
exactly as biostimulators and skin-rejuvenation did (2026-07-21 /
2026-07-22). `pricingDisplay: consult` stays — the pattern on both
price-bearing consult-routed siblings. Flat prices, no registry
change; own content commit.

## 2026-08-01 — Weight-loss "What it is" reworded to the client's sentence (verbatim)

Context: Amy directed (via the operator) a replacement for the
weight-loss page's "What it is" paragraph, dictated wording. Decision:
shipped verbatim. Three deltas from the prior copy, all assessed
before executing: (1) Retatrutide moves inside the GLP-1 parenthetical
rather than trailing as "on the menu as well" — factually defensible
(a GLP-1-family triple agonist) and consistent with the FAQ's
receptor-family framing; the linter inverse checks are unaffected
(`investigational: true` and the 2026-07-21 disclosure line both
stay). (2) The opening "This is a medically supervised
weight-management program…" sentence comes off; no gate requires it,
and the supervised framing survives in her own second sentence, the
summary, the deck, and the SEO description. (3) The kept earned em
dash before "never on its own" (2026-07-29 keep-list) becomes her
comma — a further reduction in the direction the client already
approved. One grammar note offered once, per the concept-byline
precedent: "GLP-1 therapy … anchor" takes a singular verb; the
operator directed the correction before the PR, so the page ships
"anchors" — the one word changed from the dictated sentence.
"Every one of these is a prescription medication" is carried
copy, not new (it was already on the page with Retatrutide in scope).
clinicianApproved untouched (already false); Amy reviews on the
preview.

## 2026-08-01 — Peptide card definitions: the benefit-language override, executed near-verbatim

Context: the operator supplied a screenshot of client-written peptide
definitions (peptide02.png, repo root — covered by the root /*.png
ignore rule, treated view-only like every client source document) and
directed they replace the identity-only card lines on
/services/peptide-therapy. This is the moment the 2026-07-21 peptide
entry anticipated: "The operator declined the Option-B
benefit-language override for now; it remains available (same posture
as the GLP-1 pricing override) if directed later." It was directed.

Flagged once, in full, before execution. Two tiers. (1) Four phrases
cannot build at all: "anti-aging" (GHK-Cu, Ipamorelin) and "tissue
healing" (Ipamorelin) hit banned regexes, and "libido" (Sermorelin)
trips the symptom-vocabulary inverse check, which reads raw file text
(no allowlist stripping) and would demand bioteDisclaimer: true —
injecting the Biote FDA disclaimer onto a peptides page. No pattern,
allowlist, or inverse check was touched; the gate stands. (2) The
rest is benefit language the §7.2 brief bans (lean muscle mass and
fat loss, exercise recovery, joint repair, insulin sensitivity,
"reduce excess deep belly fat", "protects cells / clears toxins /
supports immune system", "mimics the effects of exercise") — all
regex-clean, all judgment-level. Named specifically in the flag:
Tesamorelin's belly-fat sentence is off-label-promotion-shaped
(§8.5), and Glutathione's line is the same content excluded on the
IV page under §7.7's recorded absolute. The page also already carries
the recorded no-disclosure exposure for compounded peptides; benefit
claims stack on it.

Decision (operator, from three options with previews): NEAR-VERBATIM —
every supplied sentence ships word-for-word except the four blocked
phrases, which were dropped with minimal grammar repair. Also: "known
as secretagogues" normalized to "known as a secretagogue" and NAD+'s
"an essential" capitalized (card-initial); BPC-157/TB-500 kept its
existing line (not among the supplied definitions); all prices
untouched. Coherence trims in the body, deletions only: "Where the
internet reaches for sweeping claims, her approach is deliberately
plain" and "Amy's starting point is the opposite of the hype: names
and facts, no promises" came out — a page cannot promise "no
promises" above benefit cards. Glutathione now reads differently here
than on iv-therapy (which keeps identity-only wording per §7.7's
absolute): recorded divergence, deliberate; the two pages' PRICE
pairing rule is unaffected.

Alternatives rejected: compliant redraft of all eight (offered with
previews; declined); verbatim-plus-operator-edits-the-registry
(offered accurately, including that libido remains unshippable that
way; declined); touching any gate mechanism (never on the table).

Consequences: documented, client-accepted exposure on benefit claims
for compounded peptides, scoped to the nine card sentences as shipped
— §7.2 carries the dated amendment; anything further reverts to the
rule. The operator's merge of this PR is the written override
approval. clinicianApproved stays false; Amy reviews on the preview.

**Update (same day) — MOTS-c priced.** The operator supplied the
MOTS-c price ($125.00), carried as "$125" per the sitewide
whole-dollar price format — the same normalization precedent as every
flat peptide price. No registry change (flat price); its own content
commit. The page's last unpriced card closes.

**Update (same day) — the PR #79 preview environment failed and was
recreated.** The freshly created `-79` staging environment served the
Succeeded deployment unevenly for 30+ minutes: routes oscillated
200↔404 in bursts (SWA's platform 404, not the branded /404),
including on cache-busted URLs — which exonerated the workstation's
Canopy cache — and the operator saw an unstyled page (HTML from a
healthy replica, hashed CSS 404ing). The artifact was never suspect
(CI pa11y 23/23 requires CSS; Lighthouse passed; deploy reported
Succeeded). A full workflow re-run did NOT fix it: redeploys refresh
content, not the serving pool. Closing and reopening PR #79 (teardown
+ recreation under the same hostname) replaced the pool and the
environment held green across four spaced verification passes (all
routes, plain + busted, content markers, CSS). RUNBOOK gains the
troubleshooting entry. No code, content, gate, or config change was
made for this — infrastructure transient, resolved operationally.

## 2026-08-01 — Hormone lab draw priced (operator-supplied)

The operator supplied the Hormone lab draw price ($125.00), carried as
"$125" per the sitewide whole-dollar format. The 2026-07-22 build had
deliberately left the card unpriced rather than invent a figure; the
open blank closes the operator-supplies-figures way. Flat price, no
registry change; `pricingDisplay: consult` unchanged (true on this
page — the pellet plan follows from labs). Own content commit;
clinicianApproved stays false.

*(Ordering note, 2026-08-01: this entry was first appended at the
wrong anchor — mid-file, before the weight-loss and peptide entries —
and was moved here the same day to restore the log's chronological
order. Content unchanged.)*

## 2026-08-03 — /about rebuilt as a magazine profile; 8K0A9862 published

Context: the operator asked for a creative upgrade of the thinnest
structural page (~120 body words, a facts card, the family portrait, the
closing band) and settled three decisions via question round: on-record
facts only (an interview round with Amy was offered as the biggest
lever and declined; a hidden pull-quote slot likewise), imagery =
family portrait (stays, Amy's request) plus 8K0A9862, and full
magazine-profile scope (picked over moderate and polish-only).

Decision — five beats. (1) Hero kept structurally: eyebrow, H1, lead,
portrait figure, and consult CTA byte-identical — the lead is the
2026-07-29 em-dash keep-list line and the measured LCP element — with
the two bio paragraphs expanded to three (the bedside years; the
2017/2018 arc; the ownership paragraph carrying the page's single
shared-location line, constraint 2). (2) The `.about-facts` dl is
RETIRED and its four facts re-homed — career and dates into hero prose
and the timeline, BSN into step 03, Biote into step 04; nothing
dropped. The milestones section is an `ol` wearing the VisitSteps
Playfair-counter recipe hand-copied as `.about-milestones` (importing
the component would import its hard-coded visit copy; the recipe is
the reusable part), with `aria-labelledby` preserving the named region
the dl's aria-label provided. (3) "The name on the wall": a two-column
copy-first section carrying the sole-ownership fact, the AKA fact, the
BUILD_SPEC §1 zero-confusion purpose, and the twelve-line breadth with
an Explore-all-twelve link; the new print sits beside it. (4) "Booked
your way." h3 prose on the recorded free-consultation-upon-request
fact. (5) The closing band gains TrustChips, matching the /services
and concept-home bands (/visit's band also lacks it — flagged as an
optional follow-up, not taken here).

Photo: 8K0A9862 → `src/assets/photos/studio-neon-portrait.jpg`,
byte-identical (408,756 B, 1211×1600), as a white-matte tilted print
(+1.5deg flip tilt, the `.media-figure` recipe hand-copied as
`.about-print`), lazy, widths 360/520/760 with flat `sizes="18rem"`
(the print caps at min(18rem, 100%) at every viewport — a viewport
term would over-fetch), no figcaption (captions retired 2026-07-25),
alt text omitting the held vial. The frame's record is a three-entry
chain and this entry is the reconciliation: rejected for weight-loss
2026-07-20 (injectable ambiguity on THAT page — page-specific, not a
site ban); "needs a crop to remove legible Mobile Aesthetics neon"
2026-07-21 (peptides) — SUPERSEDED by the sole-ownership fact
(2026-07-23) and by the prp-treatment precedent that deliberately
published legible "MobileAesthetics" neon as a brand call the operator
may reverse; zoom-vetted 2026-07-23 ("fine print illegible … available
for later use"). The operator's in-session imagery pick is the use
authorization; Amy-solo frame, no client release needed.

Fact trace for every new sentence: two decades of nursing / critical
care, 2017, 2018, FNP/BSN, Biote-certified (C6 listing, 2026-07-19);
sole owner of Mobile Aesthetics (2026-07-23); AKA Needle Girlie
(client-dictated byline, 2026-07-30); free consultation upon request
(2026-07-18); the zero-confusion purpose (BUILD_SPEC §1); twelve lines
(§6). No naming-origin story was invented (constraint 7); About stays
Evolus-ranking-free (2026-07-21 placement decision).

Alternatives rejected: interviewing Amy for new material (declined by
the operator); the caricature in its arch window (offered, not
picked); reusing an existing solo portrait (cross-page repeats were
ruled out once before, peptides 2026-07-21); a Person JSON-LD node
(§10 does not enumerate the type — Phase D); keeping the facts card
beside the timeline (the same facts twice).

Consequences: measured envelope before → after — images 81,954 B →
~102 KB of 245,760 (the lazy print may or may not fetch per LH run,
±~20 KB across the median-of-3; harmless at ~41% utilization); doc
4,454 B → ~6 KB of 16,384 transfer (TrustChips CSS inlines into the
page document); LCP element stays the hero lead; em dashes on the
built page 3 → 4 (the one new dash: "reads Mobile Aesthetics — Amy's
own practice"). The standing 2026-07-19 flag on Amy's career-facts
WORDING is restated in the PR — this rebuild rewrites that wording,
and her preview review is the resolution path. /about is a structural
page: no clinicianApproved mechanics apply.

## 2026-08-04 — Amy approved /about on the preview; the 2026-07-19 wording flag resolves

Context: the operator relayed Amy's approval of the rebuilt /about on
the PR #83 preview and directed the merge (a2ec2e1). Decision: merged
as approved, and recorded here because the approval settles two open
items. (1) The standing 2026-07-19 C6 flag — Amy's confirmation of
the career-facts wording, pending on the preview — is RESOLVED: the
wording she approved is the magazine-profile prose that superseded
the C6 paragraphs, reviewed on the very surface the flag named. The
about.astro header comment is updated in this change so the source no
longer reads "still pending." (2) The neon brand call recorded
2026-08-03 (legible "MobileAesthetics" script, published uncropped)
is ACCEPTED with the same approval; it remains reversible on her
word, one file. /about is a structural page — no clinicianApproved
mechanics; the twelve treatment pages' flags are untouched.
Consequences: docs plus one source comment; rendered output is
byte-identical.

## 2026-08-04 — Photos land on the four bare treatment pages; Venus Versa becomes Versa Pro

Context: a completeness audit (operator-requested) found every treatment
page explains its service and 10 of 12 show prices, but four pages had
zero photos: laser-treatments (also the only page with no dollar figure —
consult-routed, intentional pending an Amy conversation), body-contouring,
hormone-optimization, skin-rejuvenation. A full triage of C:\Amy\pics
(~86 stills, all four HEICs, both unnamed Reels probed at 1080p with
ffmpeg) found NO honest device imagery — the professional shoot is
entirely injectables work. The operator supplied four new frames instead
and confirmed the contouring device is Evolve.

Decision: one photo per page, each riding its page's own content commit.
venus-versa-pro.jpg (operator photo of Amy's console — the photographic
basis for renaming "Venus Versa" → "Venus Versa Pro" across the page);
evolve-session.jpg (screenshot of Amy's own public Reel, burned-in
efficacy caption "Imagine burning calories while you sleep…" CROPPED OUT
— §8 covers text inside images; pod labels verified illegible at 4×);
the existing amy-palacios-fnp.jpg (SHA-256-verified identical to source
frame 8K0A0206 — Astro's content hashing surfaced the match; the asset
already serves the weight-loss page and is now REUSED, not duplicated,
so the portrait appears on two wellness pages — house reuse precedent:
studio-wide, forehead-treatment) on hormone-optimization's closing beat;
pixel8-rf.jpg (docked handpiece, device wordmarks only).

Alternatives rejected: pixel8-rf02.png — the settings touchscreen shows
power/timing and "Suggested Depth 1.5mm–1.8mm", treatment parameters that
never publish (constraint 3). The Biote brochure flat-lay — its legible
symptom list would publish Biote marketing language outside the
controlled BioteDisclaimer rendering. The injectables-shoot frames —
blocked on client releases, and several flat-lays show "JEUVEAU …
100 UNITS VIAL" (a unit amount): permanently off the site. IMG_8422
(peptide vials on a legible dosing/reconstitution sheet) is a
prohibited input (constraint 8) and must never be committed.

Consequences: all twelve treatment pages now carry at least one photo.
The supplied PNGs are ~450 px wide — soft on high-DPI phones; native-max
widths only (no upscaling), higher-res originals are the upgrade path.
All four pages remain clinicianApproved: false; the Versa Pro rename is
flagged for Amy's preview review. Laser pricing stays consult-only until
Amy says otherwise.

## 2026-08-04 — Amy approved the treatment photos and the Versa Pro naming

Context: the operator relayed Amy's approval of the PR #85 preview and
directed the merge (4104feb). Decision: merged as approved, recorded
because the approval settles the open flag from the same-day entry —
the "Venus Versa" → "Venus Versa Pro" rename, made on photographic
evidence, is now Amy-confirmed on the surface it renders on. Still
open, unchanged by this approval: the laser-pricing question (publish
strings vs consult-only intentional — awaiting Amy's word through the
operator), the higher-res upgrade path for the three ~450 px frames,
and the twelve clinicianApproved flags, which are the operator's
formal sign-off mechanism and remain false. Consequences: docs only;
rendered output untouched.

## 2026-08-04 — Hours are not listed on the website ({{HOURS}} closed)

Context: {{HOURS}} was the last open NAP token; since 2026-07-25 the
LocationCard hid the hours line until the token resolved, awaiting the
operator's value. The operator relayed Amy's decision: hours will not
be listed on the website. Decision: close the token as WILL-NOT-LIST
rather than leave it pending — the siteConfig `hours` field, the
LocationCard conditional line, and the JSON-LD `openingHours` property
are removed outright, so listing hours later is a deliberate re-add,
never an accidental resolve. /visit copy already promised nothing.
Alternatives rejected: keeping the dormant hide-until-resolved
machinery (misrepresents a settled decision as a pending input).
Consequences: rendered output unchanged (the line never rendered);
BUILD_SPEC §6/§17 and the PHASE-C tables record the closure; the
parking note stays open as the only /visit input still pending.

## 2026-08-04 — C8: the home page ships (construction placeholder retired)

Context: the operator directed launch readiness and picked the concept
page as the home; the three recorded C8 prerequisites (2026-07-25) were
put to the operator as a question round. Decision: all three closed on
the operator's answers, 2026-08-04 — (a) the hero client's release is
CONFIRMED on the record (the blonde tattooed-shoulder client in
amy-at-work.jpg; this entry is that record); (b) Amy SIGNED OFF the IG
post caption (baked pixels are invisible to both linters — her sign-off
is the control); (c) {{MEDIA_SCOPE}} closed as per-item operator
approval, the practice in force all along. index.astro now renders
ConceptHome; the component's concept-mock title/description became the
production SEO strings (so /styleguide/concept mirrors them); the
legacy ng-ignite/ng-hum keyframe fence was deleted (no consumers
remain); the construction page's brand assets stay in src/assets/brand.
Gate change, operator-authorized in their own words ("I authorize the
pa11y cap for /"): the home URL joins the 21 ombre URLs carrying the
per-URL levelCapWhenNeedsReview cap. Alternatives rejected: launching
with the construction home (a public site whose front door hides the
twelve service pages defeats the launch); swapping the hero to a
solo-Amy frame (unnecessary once the release was confirmed).
Consequences: / is measured by the existing LHCI entry for real now
(the 2026-07-25 worst-case measurement had 46KB image headroom); the
caricature/logo assets are dormant, not deleted; Phase C's page
checklist is complete.

## 2026-08-04 — Legal pages take launch form; counsel review moves post-launch

Context: launch readiness. The legal trio shipped as visibly marked
drafts ("Draft — pending counsel review" banner + undated draft line),
with counsel review gating the final form (§16). The operator directed
a "passable" upgrade and, after the flag that provider-drafted pages
are not a counsel substitute, ACCEPTED launching without counsel
review ("Remove banners — I accept", 2026-08-04). Decision: all three
pages upgraded against current medical-website norms (research
recorded in the PR): privacy gains hosting-log honesty, a
no-health-information section, children's and changes sections; terms
gain acceptable use, a claims-safe limitation of liability,
manufacturer-trademark attribution, severability, changes, and
contact; the disclaimer gains reading-is-not-a-substitute,
manufacturer-materials, and contact sections. DraftBanner comes off
LegalLayout; "Effective August 4, 2026." replaces the draft line. The
claims-safe lexicon holds throughout (no disease verbs, no outcome
language — machine-checked by lint:claims/lint:voice). Alternatives
rejected: keeping visible draft banners at launch (operator declined);
importing standard boilerplate verbatim (its vocabulary is lint-banned
by design). Consequences: §16's counsel line is amended on the record;
counsel review is a standing post-launch item — if counsel requires
changes, the banner mechanism is one import away.

## 2026-08-04 — No client-side analytics at launch ({{ANALYTICS_PROVIDER}} resolved)

Context: §16 requires analytics events verified in a provider
dashboard; the token was open and the operator delegated the decision
("I'm at your mercy"). Decision: NONE at launch. Rationale: constraint
5 rules out cookie-based tools; Front Door's built-in edge reports
already give traffic visibility at zero script, zero cookies, zero
added cost, zero perf-budget impact; the site's event hooks
(analytics.ts + data-event attributes) are already vendor-neutral, so
adding a provider later is an afternoon. Plausible (~$9/mo, a
~20% run-rate increase — cost flagged) remains the recorded future
default for conversion dashboards (outbound Vagaro clicks are
invisible to edge metrics). The privacy page's "currently runs no
analytics" line stays true, and it updates first if that changes.
Alternatives rejected: Plausible at launch (recurring cost before any
traffic exists to justify it); Application Insights JS (cookies +
script weight — constraint 5); self-hosting (server ops burden against
the static-simplicity principle). Consequences: siteConfig records
provider "none"; §16's analytics line is satisfied by the recorded
no-provider decision; launch-day traffic is visible in the Azure
portal's Front Door reports.

## 2026-08-04 — /injector-training: the professional-audience page (fifth allowlist authorization)

Context: Amy offers Private Injector Training — four hands-on,
one-on-one courses for licensed medical professionals (Neurotoxin,
Dermal Filler, and PDO Thread Lift at $5,000; Radiesse at $7,500;
three hours each, product included) — advertised on her Instagram but
absent from the site. The operator supplied six flyer screenshots as
source (reference only, never committed: the trainee/model frames
carry no releases, and the flyer text burns banned vocabulary into
pixels). Decision: a standalone src/pages page at /injector-training,
outside the treatments collection — it is not client treatment
content, so the clinicianApproved gate does not apply; Amy reviews it
via a non-gated section added to docs/CLINICIAN-SIGN-OFF.md.
lint:claims covers src/pages, so the page stays fully
compliance-linted. A fifth "Training" nav item (operator placement
decision); phone/Instagram contact routing (training is neither an
"appointment" nor a "consultation", and "Book with Amy" stays
Vagaro-only). Curriculum topics publish flyer-verbatim under the FIFTH
allowedStrings authorization — the operator's decision after the
compliance flag; the recommended paraphrase was declined. The four
strings are enumerated in exact <li>-wrapped source form because the
first string opens with its banned word and the self-test's
digit-prefix near-miss proof needs the word boundary the closing
angle bracket provides; the wrap also binds each exception to one
exact attribute-less source line. The pa11y needs-review cap for the
URL was operator-authorized in the operator's own words the same day.
Experience wording uses the site's Amy-confirmed "in medical
aesthetics since 2017", not the flyer's narrower line — one set of
facts sitewide. Alternatives rejected: a treatments-collection entry
(wrong frame: patient-facing disclaimer, consult routing, and the
"Twelve lines" identity); paraphrased topic titles (recommended,
declined); bare-text allowlist strings (fails the self-test's
exactness proof). Consequences: allowedStrings grows by four
marketing-copy entries scoped to this page; CLAUDE.md constraint 3 and
§8.1 record the exception; pa11y runs 24 URLs and LHCI 7; Radiesse
joins the terms trademark list; a dedicated Amy-solo training photo is
the recorded upgrade path for the reused portrait.

## 2026-08-05 — LAUNCH: needlegirlie.com live

Context: Amy approved everything on the stable preview — the twelve
flag-gated treatment pages and the non-gated /injector-training — and
the operator directed the launch. Decision and mechanics: per hard
constraint 4 the flip stayed the operator's own act — the assistant
declined to flip on instruction, prepared the branch, and the operator
ran the sed flip and authored the sign-off commit (ad8fbde) with their
own in-session commands; that commit is the §16 written log. Sequence:
PR #93 (approval, CI green) → phase-c; PR #5 marked ready from draft
and merged (aae51ba) → main; Production run 30981190812 green end to
end — verify, check:approvals (first-ever pass, by design), Front
Door-locked build, SWA deploy, cache purge. §16 live checks all pass;
two findings recorded: (1) Azure answers direct default-hostname hits
with 404 + zero site content rather than the documented 403 — the
forwardingGateway config is the documented form, the origin-lockdown
security property holds, no action; (2) Vagaro 403s non-browser
clients (bot protection) — reachability verified as her live booking
page, browsers unaffected. Live Lighthouse on the apex: 1.00 across
all four categories, LCP 1749 ms, CLS 0.0062. Consequences: Phase C is
delivered; phase-c continues as the integration branch; standing
post-launch items — counsel review of the legal pages, the manual
keyboard/screen-reader a11y pass (§16's one open box), laser pricing
if Amy supplies it, higher-res photo upgrades, Plausible analytics as
a deliberate opt-in with its ~$9/mo cost flagged.

## 2026-08-05 — Production taken offline: launch merge reverted (operator direction)

Context: hours after launch, the operator directed that production be
taken offline pending a client review round, ahead of a scheduled
client meeting — production should serve the pre-launch Under
Construction placeholder, with every launched byte preserved for
revision and fast relaunch. Decision: the RUNBOOK rollback path —
`git revert -m 1 aae51ba` (revert commit `e57a4448`, authored in an
isolated worktree; local `npm run verify` green before the push; tree
verified hash-identical to pre-launch `906992b2` before pushing). The
Production pipeline re-verified, redeployed, and purged the edge.
`phase-c`, all PRs, the sign-off commit (ad8fbde), and every
`clinicianApproved` flag are untouched — the approvals remain valid;
nothing content-wise changed. Alternatives rejected: unsetting
FRONT_DOOR_ID (stops future deploys but leaves the launched site
serving); disabling Front Door/SWA (serves platform errors, not the
branded placeholder and branded 404); force-pushing main (prohibited;
destroys the audit trail). Consequences: (1) **relaunch is two-step —
revert commit `e57a4448` must itself be reverted on main BEFORE
merging phase-c**; a plain phase-c merge alone yields a broken hybrid,
because main's history already contains the phase-c commits (RUNBOOK,
"Relaunching after the takedown"). (2) The "merge main → phase-c
promptly" rule is SUSPENDED while the revert is main's tip — merging
main into phase-c (including PR #95's "Update branch" button) would
delete the site from the integration branch. (3) PR #95's merge ref is
conflicted by design, so the standing preview cannot deploy during the
takedown — interim previews come from sub-PRs into phase-c; **PR #97**
(comment-only, never merges) is the standing full-site demo. (4) The
twelve treatment URLs serve the branded 404 and age out of indexes
naturally; `/` stays indexable exactly as it was all July — no SEO
action.

## 2026-08-05 — Construction photo: Amy's studio portrait replaces the caricature (client direction)

Context: Amy dislikes the commissioned caricature on the live Under
Construction page; the operator promised her its removal and supplied
the replacement frame (needlegirlie.png — Amy seated on the studio
counter beneath her own neon, fine-gauge syringes in hand). Decision:
the placeholder's arched taped window now renders the photograph,
committed as `src/assets/photos/studio-counter-portrait.jpg` (PNG
re-encoded JPEG q92 per the prp-treatment precedent, 564 KB → 76 KB;
full frame, no crop — its 0.72 portrait ratio matches the caricature's
window contract, so CaricatureWindow needed no change). Compliance vet
at 4× zoom before use: the syringes carry no legible labels or unit
text; the mirror engraving, neon script, and scrub embroidery are Amy's
own branding (sole-owner precedent); no clients pictured. Preview-first
honored on its own page's precedent (the 2026-07-08 marquee lesson):
PR #99's preview probed three passes, the operator approved on sight
("ship it"), merge `4655609a` → Production run 31053064808 green →
live-verified (photo serving, zero caricature references).
Alternatives rejected: committing the 564 KB PNG as-is (Astro
re-encodes every variant — the double-lossy concern); cropping out the
under-counter equipment (changes the window ratio; the labels are
illegible at ship size anyway). Consequences: (1) **the caricature is
retired at Amy's word — never render it again without her explicit
direction** (the asset stays in `src/assets/brand/` as history;
CaricatureWindow remains a generic arched-frame component). (2) The
relaunch revert-of-the-revert can now CONFLICT on
`src/pages/index.astro` and the new asset, since main has moved past
the takedown revert — resolve by taking the launch-tree side; the
placeholder retires again at relaunch anyway (RUNBOOK amended). (3) The
642 px source renders ~1.24× at the 520 px display cap on 2× screens —
a higher-resolution original is the upgrade path, no code change.

## 2026-08-14 — Home hero: Amy's studio-counter portrait (interim AI-assisted asset)

Context: opening the post-launch revision round, Amy directed the home
hero photo change — amy-at-work.jpg (Amy treating a client) comes off;
needlegirlie.png, the studio-counter portrait she picked for the
construction window (DECISIONS 2026-08-05), takes the hero. Full-frame
vet reconfirmed the 2026-08-05 findings for the new use: Amy alone (the
2026-08-04 hero client-release dependency retires), scrubs embroidery
and neon are her own branding, syringes capped with no legible unit
text. Problem: the only source is 642×893 (social-save size) against
the hero's 1400px delivery — the exact soft-photo class the operator's
"$15k" gap analysis names as the fastest cheap tell. No original found
(C:\Amy\pics swept; the four HEICs are unrelated screen photos); the
operator asked what could be done. Decision: an interim AI-assisted
asset — Real-ESRGAN ncnn-vulkan v0.2.5.0 (realesrgan-x4plus) ×4,
blended 55/45 with a lanczos upscale at 1400w, encoded q92 JPEG
(1400×1947, 213 KB) as needlegirlie-hero.jpg. Raw ESRGAN output was
REJECTED on inspection: waxy, repainted facial rendering —
unacceptable on the clinician's own face. The blend passed crop
inspection at face, embroidery, neon, and hands (no invented
letterforms, no anatomy faults). Disclosure is part of the decision:
the asset synthesizes some detail on Amy's likeness, she is told so,
and her preview sign-off is the informed control. Mechanics: crop
anchor 22% → 20% and the neon bloom 68% 12% → 86% 30% (the sign sits
right of Amy in this frame); both frame-specific comment blocks
rewritten; amy-at-work.jpg deleted (sole consumer; git history keeps
it). Alternatives rejected: shipping the 642 stretch (visibly soft at
hero scale); raw ESRGAN (above); reusing main's 76 KB
studio-counter-portrait.jpg (encoded for the placeholder's 520px
window, not this slot). Scope: the HERO only — the Injectables door
tile (a treatment moment) stays until directed. Standing upgrade path:
Amy's full-resolution original (camera roll / photographer / IG
source) re-encodes over the same filename with zero code changes.
Verified: full gate suite green — pa11y 24/24, Lighthouse 21 runs
across 7 URLs, both ConceptHome routes (/ and /styleguide/concept)
covered; home is structural, no clinicianApproved mechanics.

## 2026-08-14 — The homepage video carousel ships (cinematic noir stage)

Context: the operator opened the session directing a homepage carousel
of three commercials and, after the reference round anchored the bar at
Audi's video treatment ("very cool and smooth. It's luxurious"),
directed that presentation grammar explicitly. Decision — a new
VideoCarousel.astro renders directly below the hero as a full-bleed
noir stage: slides CROSSFADE (no scroll strip, no player chrome), thin
progress bars fill as each film plays and double as jump buttons, and
one understated toggle is the WCAG 2.2.2 pause/stop control.
prefers-reduced-motion autoplays nothing and strips the fades. Films
render object-fit:contain, never cropped.

Lineup and clearances (operator, same day): slide 1
F-437304_Mobile Aesthetics_J1.mp4 and slide 3 _J2.mp4 — Evolus co-op
Jeuveau DTC commercials (piece code US-JUV-2600126) carried AS-IS with
their complete burned-in FDA Important Safety Information; the
manufacturer-film override class (Evolysse/ICON precedent), and the ISI
screens are never trimmed or cropped. Slide 2
Commercial 2/c3a99b1d…MOV — Amy's own published reel, shipped as-is
under operator override with the flags shown (background "BOTOX
JOURNEY"/"LIP FILLER JOURNEY" posters, prepared-syringe trays,
100-UNITS Jeuveau boxes, "GET $40 OFF" promo cards, the "POV: Age
gracefully together" caption); BOTH on-camera client releases confirmed
on file by the operator (2026-08-14 — that confirmation is the release
record). Captions mirror each film's on-screen text verbatim (VTT files
in public/media/, outside lint:claims scope like the ICON captions —
manufacturer/owner language carried under the same overrides; tracks
attach with each built video for the axe video-caption rule, not
`default` since the text is burned into the pixels).

Mechanics: web renditions transcoded H.264 CRF 23 faststart, AUDIO
STRIPPED (~7.5–7.9MB each, ~23MB total) — the carousel is muted
autoplay; restoring sound (tap-for-sound + audio-faithful captions) is
a recorded follow-up if directed. Files live in-repo under
public/media/ per the existing precedent; the Blob media origin remains
the recommended home when the video program grows (2026-08-14 entry in
the planning record). Posters are compressed stills served through
astro:assets.

Performance: the first cut rendered three parser-instantiated <video>
elements and FAILED verify — TBT 335ms median / performance 0.89 on `/`
(style/layout 1.4–2.3s under throttle; script evaluation was 39–65ms,
exonerating the JS). Fixed with the facade pattern BUILD_SPEC §9
already prescribes: the server renders posters only and the script
builds each <video> on demand (active + one warmed), gated behind an
IntersectionObserver so no video element or byte exists in the load
trace. Consequence worth recording: the anticipated operator-gated
Lighthouse budget revision for a video homepage proved UNNECESSARY —
no gate, budget, or config changed.

This is also the first client-side JavaScript on the site (~3KB bundled
against the 30KiB budget; third-party stays 0). The CLAUDE.md "zero
client JS by default" lock now needs its amendment — PROPOSED, not
edited: governing-doc changes stay operator-gated; this entry is the
traceability bridge until the operator authorizes the wording.
clinicianApproved untouched (home is structural); Amy reviews the
carousel on the PR #101 preview.

## 2026-08-14 — Carousel shipped inert on the preview: the CSP inline-script gap

Context: the operator reported none of the carousel videos played on
the PR #101 preview. Root cause, confirmed in the built output: Astro
inlines component scripts smaller than Vite's 4KB assetsInlineLimit
directly into the HTML, and the site's own CSP (script-src 'self', no
unsafe-inline — BUILD_SPEC §4, both SWA variants) silently refuses
inline scripts. The facade's ~3KB script was therefore dead on the real
host: posters rendered, no video was ever built. Every local check had
passed because the local test servers (screenshot harness, pa11y,
Lighthouse) serve dist without the SWA headers — the CSP was never in
the test path. Decision: (1) astro.config.mjs sets
vite.build.assetsInlineLimit: 0 with a comment carrying this story —
every component script now emits as a hashed same-origin file the CSP
permits; (2) the screenshot harness now applies the generated SWA
globalHeaders (CSP included) to every response, so a policy-blocked
script fails the check the way it fails the host. Alternatives
rejected: adding unsafe-inline or a script hash to the CSP (weakens or
complicates the policy for no benefit; the external file is the
CSP-native answer). Also in the same round, client copy direction: the
home H1 reads "Medical Aesthetics," (capital A) per Amy. Verified
first-hand: zero inline script content in built HTML; carousel builds
and plays under the real headers at both breakpoints.

## 2026-08-14 — CSP fix scoped: static script file, global externalization reverted

Context: the first CSP fix (vite assetsInlineLimit: 0) made the
carousel work but FAILED CI on a page untouched all day —
wrinkle-relaxers LCP 2563/2570/2572ms vs the 2500 cap, three runs
within ±5ms (a real regression, not variance). Cause: Astro's
inlineStylesheets 'auto' shares that same threshold, so zeroing it
un-inlined every page's small CSS and added a render-blocking request
sitewide; the heaviest page tipped over. Decision: revert the config;
the carousel logic moves to public/js/video-carousel.js (plain JS,
same-origin, CSP-clean by construction) referenced via a literal
script tag — externalization scoped to exactly the one script, CSS
inlining restored everywhere. Verified first-hand: no inline script
bodies in built HTML, the static reference present, inline styles back
in the built treatment pages, carousel plays under the generated SWA
headers at both breakpoints. The memory/harness lessons from the
previous entry stand; the prescribed fix pattern is updated.

## 2026-08-14 — Documentation sweep: the redesign round gets its working doc; governing docs reconciled

Context: the operator directed a documentation update in their own
words ("Let's update all pertinent documentation... if we even need to
create NEW documentation let's do that") — which is also the operator
authorization the governing-doc amendments require. Executed:
(1) NEW docs/REDESIGN.md — the working record of the "$15,000" round
(the seven-gap yardstick, settled decisions with shipped/planned
status, the carousel clearance record, open items, working agreement);
PHASE-C.md gains a pointer and is marked historical. (2) RUNBOOK gains
the add-a-commercial procedure (compliance screen first, encode recipe,
posters, captions, slides) and the CSP inline-script troubleshooting
entry. (3) CHANGELOG gains the carousel-revival/capital-A entry.
(4) BUILD_SPEC amendments: §4 CSP consequence (static scripts in
public/js/, test under generated headers, never assetsInlineLimit:0);
§5 the cinematic video stage joins the noir shell (stage-surface
question noted open); §6 home row adds the carousel and the new hero;
§9 the home-carousel bullet; §13 the first-JS-consumer note (budget
unchanged). (5) CLAUDE.md: the constraint-3 film exception list gains
the three home-carousel films (the clearances recorded earlier today),
and the zero-JS locked decision records its first sanctioned consumer.
(6) compliance/README: the allowlist count corrected (five
authorizations — the injector-training entries were missing, the same
class of lag the 2026-07-22 reconciliation fixed), and a new "media
text" section states plainly that pixel text and public/media VTT files
are outside SCAN_DIRS with per-item screening + DECISIONS entries as
the control. Docs-only; no gate, config, or content changes; the
paths-ignore rule means this PR push runs no CI, by design.

## 2026-08-15 — Mobile Aesthetics mark joins the header (vector rebuild)

Context: redesign requirement #6 — the operator directs the Mobile
Aesthetics logo into the far-left header beside the NG wordmark and
asks for a format recommendation on the 300px PNG (the only true logo
render in the F-437304 set; the 776x700 file is a photo cutout, parked
as a content asset). Decision: rebuild as SVG — the mark is pure
geometry. Recipe (all measured from the reference): plate #131313,
white frame; chrome type in a #f4f2f3→#9b989b vertical fade;
letterforms Julius Sans One (OFL) outlined to paths — no font shipped,
the two-family budget untouched — chosen by overlay comparison
(Montserrat/Raleway/Josefin rejected as too narrow); four chevrons
(slab 18, slope 0.928, pitch 61) under one foil gradient sweeping
ACROSS the band (#fda6d8→#fd78d4→#e967b6→#fc9ad6 — per-chevron
sampling showed the highlight travels horizontally, not vertically).
Generator + font record committed at
src/assets/brand/source/mobile-aesthetics/. Two variants: the full
badge (plate + frame + name/phone — print/social use and Amy's
comparison) and the header lockup that ships (type + chevrons only:
the noir header IS the plate; the name/phone line dropped — under
10px it is illegible smudge). Header integration: a left group wraps
mark + brand link; mark 42px/88px tall (mobile/desktop); the mobile
NG wordmark becomes clamp(180px,53vw,220px) so mark + wordmark +
menu toggle fit 360px screens (visible wordmark shrink on phones —
flagged); popover top re-tuned 8.5rem→6.75rem (measured 9px
clearance). The mark is a plain img, alt "Mobile Aesthetics PLLC",
NOT inside the home link — link semantics stay the wordmark's.
Constraint 2 not engaged: MA is Amy's sole-owner PLLC (DECISIONS
2026-07-23). Alternatives rejected: shipping the 300px PNG (soft on
high-DPI, dead end for reuse); the HTML-master→PNG pipeline (kept as
fallback, unneeded — the SVG matched on first overlay). Open item:
Amy's side-by-side pick (A badge vs B lockup); B is live on the
preview as the recommendation.

## 2026-08-15 — Operator picks the full badge for the header

Context: on the preview, the operator read the header lockup as the
logo's bottom being "cut off" — measurement showed nothing clipped
(chevrons complete and symmetric; the header hairline touches
nothing), but the lockup by design omits the badge's name/phone block
and frame, and to eyes that know the full logo the omission reads as
truncation. Decision (operator, given the three options with the
legibility cost stated): the header carries the FULL BADGE — plate,
frame, type, chevrons, name and phone — at 56px (phones) / 112px
(desktop); the square tile is narrower than the lockup was, so the
mobile wordmark clamp relaxes to clamp(170px,52vw,215px). The
name/phone line is ~5px at header scale — carried as silhouette
completeness, not readable text; the badge itself is the legible
record wherever it renders larger. Alternatives rejected: extending
the lockup with the bottom lines (recommended — same tiny-text cost
without the frame's finish, operator preferred the literal complete
logo); keeping the lockup (the truncated read would persist). The
lockup SVG stays in the repo as the brand-kit variant.

## 2026-08-15 — Hybrid nav: hamburger at every width, Book as the persistent CTA

Context: after the foldable fix, the operator asked whether desktop
should drop the five inline nav items for the hamburger. Recommendation
delivered: not hamburger-only (hidden navigation measurably suppresses
engagement, and this site's one commercial job is the Book conversion)
— but a hybrid captures the luxury minimalism without burying the money
button. Operator directed the hybrid. Decision: the menu button carries
Services/About/Visit/Training at EVERY width — the inline desktop nav
retires — and Book leaves the menu to become the one styled button in
the header, visible beside the menu at all widths (outlined pink-500 on
noir, 5.95:1; hover inverts to pink fill with noir text, 5.9:1; the
established booking-language convention). Consequences: mobile gains a
visible Book for the first time (it previously lived only inside the
popover); the centered-brand shell becomes the layout at every width;
the tightest phones cede ~7% wordmark width and the badge starts at
48px to make room. The popover gains a ≥1024px anchor (the menu now
exists at desktop). Alternatives rejected: hamburger-only (buries the
primary conversion); keep-as-is (operator wanted the minimal look).

## 2026-08-15 — The header badge links out to yourmobileaesthetics.com (constraint-2 override)

Context: the operator directed making the MA badge a tap/click link to
https://yourmobileaesthetics.com. The destination was screened first
(fetched 2026-08-15): it is Amy's own practice site, but it prominently
names five other providers at the location (Dareen Elkurd, Nadia Cecil,
Kaitlyn Jones, Martu Tamba, Kelly Formato — microblading, spray
tanning, teeth whitening, massage) — squarely inside hard constraint
2's "never link to any other provider." The flag was presented with a
secondary funnel note (a persistent header exit ramp; partially
mitigated — MA bookings also route to Vagaro). Decision: OPERATOR
OVERRIDE — link it. Implementation: the badge img wraps in an anchor
to `siteConfig.mobileAestheticsUrl` (new config entry), target=_blank
rel=noopener, sr-only new-tab notice (the Book-link convention),
`data-event="ma_site_click"` (added to the AnalyticsEvent union;
track() remains a provider-neutral no-op). CLAUDE.md constraint 2
gains the scoped exception in the same commit — the one sanctioned
outbound reference; the other providers remain unnamed in all site
text. Alternatives rejected: not linking (operator wants the tap
path); linking to a hypothetical Amy-only page on the MA site (none
exists). The home link stays the wordmark's alone.

## 2026-08-15 — Docs reconciled with the header increment (operator-directed sweep)

Context: operator directed a documentation pass covering the day's
header work (PR #102: SVG badge rebuild → brightened chrome →
enlargement → full-badge pick → phone centering → foldable fix →
hybrid nav → menu-icon size → desktop badge scale → outbound badge
link). The per-decision records already existed (four DECISIONS
entries, CHANGELOG, CLAUDE.md constraint-2 exception); this sweep
reconciles the derived docs: (1) BUILD_SPEC component inventory now
describes the as-built dual-brand hybrid-nav header (the old
"CSS-first mobile menu if achievable" line was three designs stale);
(2) REDESIGN.md settled-decisions table — the MA-badge row moves to
Built with the link-out recorded, and the hybrid nav gets its own row;
(3) compliance/README's "what the linter cannot see" section gains
outbound-link destination screening, with the badge link as the
recorded precedent. Docs-only commit; no gates or content affected.

## 2026-08-15 — One family: Playfair Display takes the body (Amy)

Context: Amy directed that the body text use the same font as the
Needle Girlie logo. The logo's face was verified from the committed
master (src/assets/brand/source/needle-girlie-logo-black-bg.html):
Playfair Display, weight 600, upright — already the site's display
face. Scope question put to the operator (small tracked-caps UI —
nav, Book CTA, eyebrows, captions): answer was Playfair EVERYWHERE;
DM Sans retires entirely. Decision: repoint --font-body to the
Playfair stack (both role tokens kept, one family serving both);
remove the @fontsource-variable/dm-sans dependency; bump body to
17px/1.65 (the mobile-readability adjustment accepted with the
2026-08-14 Playfair-everywhere decision). BUILD_SPEC §5/§13 amended
in the same commit (this supersedes the serif+sans split and the
2026-07-08 DM Sans entry). Consequences: font payload drops ~55KB per
page (Playfair latin+latin-ext 59,544 B vs the 122,880 B budget); the
swap-CLS posture improves — body text now uses the woff2 that was
already preloaded for headings, which DM Sans never was; fontaine's
Georgia metric-fallback pair is unchanged. Alternatives rejected:
keeping a sans for tiny UI microcopy (a second voice Amy didn't ask
for); collapsing to one token (loses the role knob). Legibility
escape hatch recorded: if small caps shimmer on low-DPI screens,
thicken weight via the variable axis (400–900) — never a second
family.

## 2026-08-15 — The studio reel slows at the player (0.8 → 0.65 → 0.5), not a re-encode

Context: operator + Amy — carousel slide 2 (Amy's own studio reel)
"plays incredibly fast"; slow it a little. Decision: per-slide
playbackRate at the player (data-rate="0.8" on the slide,
defaultPlaybackRate+playbackRate set when the facade builds the
video, re-asserted at loadedmetadata/play because some engines
reset the rate when playback starts), NOT an ffmpeg re-encode.
First pass shipped 0.8; operator review same day: still too fast —
retuned to 0.65, then to 0.5 (third review:
still too fast — the knob working as designed; 0.5 is also the
practical floor, engines clamp below it). Why: the master rendition stays
untouched; the number is a preview-tunable knob; VTT captions and the
progress fill key off media time so they stay in sync at any rate;
browsers that ignore the property play at 1× (exactly the old
behavior); the 60fps master still renders ~48fps of motion at 0.8× —
smooth without interpolation and its artifact risk. Compliance
scoping: the rate applies ONLY to Amy's own site-authored reel — the
two Evolus films' presentation is carried as-is (their never-alter
rule is untouched; they stay at 1× and the slide type marks rate as
Amy's-films-only). Alternatives rejected: re-encode with setpts
(bakes the tempo, slower iteration, second copy to version);
minterpolate slow-mo (artifact risk, not asked for).

## 2026-08-15 — Review surface: one combined preview when increments stack

Context: three increments were open at once as separate PRs
(#103 fonts, #104 carousel heading, #105 reel tempo), each with its
own isolated preview. On the reel preview the operator reported the
old carousel heading had "come back" — it hadn't; that preview simply
never contained the other PR's change. Per-PR isolation reads as
regressions to reviewers. Decision: while multiple increments are
open, maintain a DO-NOT-MERGE combined-preview PR (branch merging all
open feature branches) as THE review link; the individual PRs remain
the merge gates and the audit trail. PR #106 was the first (closed
after the merges). Consequences: docs files (CHANGELOG anchor,
DECISIONS end-of-file) collide across parallel PRs — resolutions keep
both records; whichever PR merges last absorbs the conflict pass.
Alternatives rejected: explaining the isolation each round (it failed
in practice); merging increments without Amy's per-change word
(violates the approval workflow).

## 2026-08-17 — The Mobile Aesthetics team film joins the carousel (constraint-2 override)

Context: operator assignment — add team.MOV as the carousel's fourth
film. Frame-level screen (contact sheet + full-res frames + embroidery
zoom): the Mobile Aesthetics "Girl team" film — six women (Amy center)
in MA uniform polos under the MA neon, stylized black-and-white studio
segments, a CapCut film-strip montage effect carried as-is (its
CAPCUT/PX border micro-text is decorative edge chrome). No products,
no clients, no clinical or claims content. Amy's embroidered
"Amy Palacios NP" is plausibly legible; the other five names do not
resolve at the source's own 1080px — nobody else is legibly named,
but the film unmistakably features the location's other five
providers. Flag raised: hard constraint 2 (site never implies other
providers; compliant path = yourmobileaesthetics.com). Decision:
OPERATOR OVERRIDE 2026-08-17 — add as film 4; releases/consent for
the five team members confirmed on file (operator, same date — the
studio-reel release pattern). CLAUDE.md gains the second constraint-2
scoped exception in the same commit; the film needs NO constraint-3
exception (zero claims content), and the constraint-3 enumeration was
re-worded to stay visibly scoped to the original three films.
Mechanics: rendition per RUNBOOK (muted H.264, 6.3MB @ 3.8Mbps),
poster from the rendition's opening neon shot, VTT mirrors the
burned-in "Girl team" overlay (0–2s), label "Girl team — Mobile
Aesthetics", plays at 1× (produced edit; the rate knob stays
Amy's-films-only). Four 64px progress bars + the toggle overflow a
390px phone by 2px (and the 344px fold cover by 48px), so bars drop
to 48px under 600px — the 48×32 button clears the 24px WCAG target.
Alternatives rejected: hosting the film only on
yourmobileaesthetics.com (the recommended compliant path — operator
chose the override after the flag); trimming the CapCut chrome
(re-editing Amy's produced piece for no compliance need).

## 2026-08-17 — Homepage door photos: Amy's picks, screened (photo round, page 1)

Context: the sitewide photo-replacement pass opened today (operator +
Amy select per-slot; picks arrive in C:\Amy\New Pics). First page:
the home category doors. Amy's picks — Injectables: her pick "2"
(Amy treating a reclined client under the Mobile Aesthetics neon;
lilac embroidered scrubs, gold-tone instrument, no legible product
text); Skin & Body: pick "3" (three skinbetter products held to
camera — sunbetter SPF, Mystro serum, AlphaRet cream; manufacturer
label text photographed as-is, the shipped skinbetter-lineup class;
no identifiable person); Wellness: pick "4" (Amy solo, lavender
suit). Screens: no dosing/claims content anywhere; the one flag was
the identifiable client in pick 2 — RELEASE CONFIRMED ON FILE
(operator, 2026-08-17 — weigh-in-photo pattern, the confirmation is
the record). Decision: ship all three via the door slots' existing
640×800 smart-crop pipeline (crops verified by eye: faces + neon,
products, and figure all land well; no anchor overrides). Sources are
1067×1600+ from the professional shoot — above the slot's delivery
resolution (retina rule holds). The outgoing assets
(forehead-treatment, skinbetter-lineup, studio-wide) STAY in the
repo — /services and two treatment MDX pages render them; deleting
or re-picking those pages happens when the round reaches them (and
treatment MDX edits reset clinicianApproved, so they are deliberately
untouched today). Alternatives rejected: reusing one asset name per
slot (slot-named files couple assets to placements; content-named
files stay reusable).

## 2026-08-17 — The a11y gate audits the settled state (reduced-motion Chrome)

Context: adding one text line to the location card failed /visit's
pa11y run — the noir band's Book CTA at a 2.6:1-effective contrast.
Root cause measured first-hand: `ng-rise` entrance blocks animate on
`animation-timeline: view()`, so in a static headless audit each
block freezes at whatever entry progress the page height dictates
(the CTA's wrapper measured opacity 0.931 at pa11y's 1280×1024
viewport; the baseline page, one line shorter, measured ≈1 and
passed). Any copy change above any animated block re-rolled every
page's contrast verdict. Decision (operator-approved gate-config
edit, chosen over the flag): pa11y's Chrome now launches with
`--force-prefers-reduced-motion`; the site's reduced-motion CSS sets
`animation: none` on the entrance classes, so every element audits
at its final colors, deterministically — a real, shipped user mode
(the one WCAG's motion guidance mandates). Alternatives rejected:
removing ng-rise from the affected band (leaves the sitewide
dice-roll through the photo round); scrolling before audit (view()
timelines map scroll position — there is no settled mid-page state
to reach). Consequences: contrast verdicts no longer depend on page
height; animated mid-states go unaudited — acceptable, they are
transient by construction and the compliance rule already bans
entrance animation on compliance text. A failure now means the
element's FINAL colors fail.

## 2026-08-17 — The arch motif goes sitewide (every photo, named exemptions)

Context: Amy directs (via operator) that all pictures throughout the
site wear the light-pink arches from the homepage category doors —
except the pic at the bottom of the homepage. Scope pinned by operator
answers (2026-08-17): the HERO stays exempt (a full-bleed backdrop,
not a framed picture); ALL FILM STAGES stay exempt — the carousel
posters/stage and both treatment-page film players (an arch mask
visually clips film corners, and the Evolus commercials' burned-in
safety information ships complete and uncropped — flagged, exemption
chosen); the bottom pic is the framed Instagram post (.nc-post keeps
its square matte). Also exempt: lip-style-guide.png (a labeled
diagram — an arch or crop would cut its labels) and brand marks.

Decision: one shared `.ng-arch` utility in global.css — the door
recipe verbatim (999px 999px 12px 12px radius, 1px magenta-600
hairline, overflow hidden). The doors, /services strip, /about
portrait, and /injector-training portrait consume it by class;
treatment bodies get a documented selector mirror in TreatmentLayout
(`.media-figure img:not([src*="lip-style-guide"])`) because adding
classes in MDX would reset clinicianApproved — the rollout touches
ZERO treatment content. Matted prints keep matte/tilt/shadow; the img
arches inside them (a matted arch print). Geometry: all 35 in-use
assets measured first; the arch reads as architecture only on
portrait boxes (CSS scales overflowing radii uniformly — landscape
boxes render a squat half-ellipse), so treatment figures take a 4:5
display crop (CSS-only — identical derivatives served, zero byte
change) and the full-width bands move 16:9 → 9:8, the widest arch
that keeps straight feet. fine-gauge-detail's baked 16:9 derivative
now displays through the 9:8 window (center slice, verified by eye);
recorded upgrade path: a server-side re-crop at the consolidated
re-approval round.

Alternatives rejected: arch at source ratio (landscape sources read
as a bug, not a motif); per-image MDX recrops (twelve
clinicianApproved resets for a visual change); propagating the doors'
pink plate along with the arch (the plate is door-card anatomy, not
the frame).

Consequences: every photo frame now derives from one declaration plus
one documented mirror; the three hand-copied square-frame recipes
lost their border/overflow lines but keep their washes and crops.
studio-wide's alt still describes the full frame ("two clients")
while the 4:5 window fully shows one — a presentational crop; the alt
stays (alt edits are MDX edits). CaricatureWindow (the orphaned
16px-foot arch variant) is untouched.

## 2026-08-17 — /services strip: photo round page 2 (screening + release record)

Context: operator + Amy assign the strip's three frames by number from
the professional shoot in C:\Amy\New Pics: left = 6, middle = 7,
right = 8 (all 1067x1600, above the slot's 760w delivery — retina
rule holds; dedup-hashed against the repo, no duplicates). Screened
frame-level: 6 — Amy at a seated client's brow in window light, no
legible text or products; 7 — Amy guiding a fine syringe at a
reclined client's lower face, decorative "DREAM LAUGH DANCE" wall
print in background (benign), no legible product text; 8 — Amy
(embroidery = her own name, factual-identity precedent) showing two
product boxes to a male client — box labels and the background
banner fragment are ILLEGIBLE at source resolution, so no claim is
conveyed; the arch's 4:5 window crops most of the banner anyway
(verified by eye). All three pictured clients are identifiable —
RELEASES CONFIRMED ON FILE for website use (operator, 2026-08-17 —
the confirmation is the record, weigh-in-photo pattern). Decision:
ship as content-named assets (treatment-window-light,
lower-face-appointment, male-client-products — never slot-named);
alts rewritten factual-generic (the frames do not self-identify a
treatment line, and alts never invent one). The outgoing assets
(forehead-treatment, lip-filler-detail, male-client-treatment)
became zero-reference after the swap — deleted (PR #101 orphan
precedent; git history preserves the frames). Crops verified in the
arch at 390/1280 (50% 20% anchor holds every face).

## 2026-08-17 — Relaunch guard: required checks against the takedown topology (external-audit Finding 1)

Context: an external principal-architect review (fresh clone, no
session context — docs/AUDIT-2026-08-17-external-review.md) triaged
seven findings; Finding 1 is the only High item needing no operator
decision. The takedown revert `e57a4448` changed main's tree, not
its history, so git believes main already contains the launched
site. Both failure modes were reproduced first-hand in a throwaway
clone before building anything (the audit's own §0 rule): merging
main into phase-c applies the takedown deletions to phase-c; the
naive phase-c → main merge silently drops ~48 files — all twelve
treatment MDX pages, both treatment films, every photo — with zero
conflicts on them and a passing Astro build. The RUNBOOK's two-step
procedure verified correct: 166 files, zero missing vs phase-c, one
extra (`studio-counter-portrait.jpg`, the placeholder orphan slated
for deletion in the relaunch PR).

Decision: `.github/workflows/relaunch-guard.yml` with two jobs, both
becoming required status checks (branch protection created for the
first time on both branches — neither had any): `takedown-revert-
guard` on PRs into phase-c and pushes to phase-c (fails if the
revert is reachable — the push trigger makes an "Update branch"
slip on PR #95 loudly red immediately); `gutted-merge-guard` on PRs
into main, beyond the audit's ask (fails if a phase-c-derived merge
ref is missing any file from origin/phase-c's current tree — this
one guards the actual catastrophe, and stays quiet for legitimate
deletions because those are already gone from phase-c's tree at run
time). No paths filter on purpose: a path-filtered required check
never reports and deadlocks merges — only the guard jobs are marked
required, never `verify-and-deploy`, whose paths-ignore would do
exactly that to docs-only PRs. The relaunch PR retires the workflow
(post-relaunch the revert is a harmless ancestor everywhere).

Alternatives rejected: prose-only RUNBOOK warnings (they existed and
the hazard remained one button-press away); detecting a future
revert-of-revert instead of retiring the guard (its SHA is unknowable
now); requiring `verify-and-deploy` too (docs-only PR deadlock).

Consequences: the landmine stays defused for the whole extended dark
period (operator decision same day: stay dark until the redesign
round completes). GitHub settings now carry branch protection — a
new place where repo behavior is configured outside the tree.

## 2026-08-17 — Media origin built: films move to Blob behind Front Door (external-audit Finding 5)

Context: audit Finding 5 named four problems with self-hosted video —
the client-facing SOW says video hosting costs $0 and is embedded
(now false), egress scales with marketing success unmodeled, every
re-encode grows git history forever (no LFS rule), and media is
coupled to code (swapping a film = commit + build + deploy + purge).
Operator decision same day (AskUserQuestion): build the Blob origin
NOW, before relaunch. The audit's companion suggestion — a Git LFS
rule for *.mp4 — was REJECTED with the flag raised: GitHub's free LFS
bandwidth (1GB/mo) dies in days against ~53MB × this repo's CI
cadence, and default actions/checkout (lfs:false) would silently
deploy pointer files as videos. Blob migration makes LFS moot: no
future .mp4 enters the repo at all.

Decision: storage account (`stngmedia…`, Standard_LRS, anonymous
blob-read on container `media` only) + `media.needlegirlie.com`
custom domain on the EXISTING afd-needlegirlie profile, route
`media` (originPath /media, IgnoreQueryString, no compression) bound
only to that hostname — all in Bicep (infra/storage.bicep +
frontdoor.bicep + dns.bicep additions), applied via the documented
sub-level deployment after a what-if drift check (result: template
still matches live — every Modify was reference-resolution noise,
omitted service defaults, or the budget startDate the RUNBOOK's own
command sets). Design refinement over the plan: **only the .mp4
files move; the .vtt captions STAY in public/media/** — captions are
compliance-screened text whose git audit trail matters, and keeping
them same-origin eliminates the whole CORS surface (same-origin
tracks need no CORS; cross-origin video plays fine without it), so
zero JS changes and no crossorigin attributes. The stable hostname
is deliberate: previews play exactly what production plays
(REDESIGN's recorded rationale). Code paths: siteConfig.mediaBase;
VideoCarousel data-file goes absolute; TreatmentVideo REWRITES its
"/media/…" prop internally because that prop lives in treatment MDX
and any MDX edit resets clinicianApproved (constraint 4 — the arch
motif's component-layer-mirror precedent; zero flags reset). CSP
media-src gains the host in both templates; the SWA /media/* cache
route stays (it now serves only captions).

Alternatives rejected: Git LFS (above); moving .vtt to Blob with
ACAO * (loses the captions' git trail for zero gain); keeping mp4 in
repo with LFS-less growth (the audit's status quo); a separate AFD
profile for media (double the fixed cost for nothing).

Consequences: repo tree −53MB going forward (history unchanged — the
no-rewrite stance stands); film publishing is an upload + PR for the
caption (RUNBOOK "Publishing a film"); replacing a film in place
needs an edge purge (max-age=86400) — the procedure prefers new
filenames; local dev and previews need internet to play films; Azure
run-rate +~$1–2/mo at today's traffic (production is dark, so the
metered lines start near zero: LRS storage of 53MB is fractions of a
cent; egress is the line that scales — a viewer who watches the whole
carousel pulls ~30MB, so cost tracks marketing success and is now a
NAMED budget line instead of an invisible one; re-verify unit rates
against the operator's Cost Management view before quoting the client
a figure — the audit's caution). The SOW video-hosting narrative
update is the operator's document — flagged, with drafting offered.

## 2026-08-17 — Plausible prepped and gated dark (external-audit Finding 6)

Context: audit Finding 6 — no analytics means no way to answer "did
the redesign work" at relaunch or retainer-renewal; the audit's own
correction stands: a true before/after is unobtainable (the site was
live for hours), so the prize is a forward baseline from relaunch
day. Operator decision (AskUserQuestion 2026-08-17): Plausible at
relaunch (~$9/mo, client pass-through), prepped now so the flip is a
config edit on launch day, not a build. Cookieless satisfies hard
constraint 5; GA4 remains prohibited (BUILD_SPEC §11).

Decision: the whole integration ships DARK behind
siteConfig.analytics (enabled:false / provider:'none'; the fields
carry widened types so the flip isn't a type error). Three pieces
flip together in one build, so no state can lie: (1) BaseLayout
emits the tracker only when enabled; (2) the privacy page's
analytics bullet is a build-time conditional — its launch wording
promises "this page will be updated first," and the conditional
keeps that promise atomically; (3) generate-swa-config.mjs sniffs
the BUILT dist/index.html for the script tag and widens the CSP only
when the page actually shipped it — the header cannot drift from the
code, and the dark-state artifact is byte-identical to before. The
tracker is SELF-HOSTED (public/js/plausible.js, vendor file with
provenance header, fetched 2026-08-17, 2,841 bytes upstream): the
site's own rule says scripts are static files in public/js/, and
self-hosting keeps script-src at 'self' — only the /api/event POST
leaves the origin (connect-src). track() in analytics.ts is wired to
window.plausible (the script exposes it, queue included) but has no
callers — zero client-side component code exists; pageviews are the
v1 signal and the first custom event is a normal PR later.

Alternatives rejected: the hosted script tag from plausible.io
(would widen script-src to a third-party CDN and drew the SRI
concern — SRI is incompatible with their versionless endpoint;
self-hosting removes the whole surface at the cost of a documented
manual re-fetch on vendor updates); a JSON side-channel for the CSP
flag (the dist sniff cannot drift; a second flag can); flipping now
(operator: relaunch waits for the round — a dark-period baseline of
zero visitors is worthless and the fee starts with the flip).

Consequences: launch-day analytics = account + two-value siteConfig
edit + normal verify/PR (RUNBOOK "Turning on analytics"); the / perf
gate re-measures with ~3.6KB more JS at flip (ample headroom, read
the numbers); privacy wording, CSP, and script can never disagree.

## 2026-08-17 — External-audit close: verification record, the four operator answers, and the relaunch dossier (Findings 2, 3, 4, 7)

Context: an external principal-architect review of a fresh clone
(docs/AUDIT-2026-08-17-external-review.md, committed with this entry)
delivered seven triaged findings. Per its §0 rule every claim was
re-verified first-hand before any action: all git topology numbers
reproduced exactly against origin/main; the naive-merge hazard
reproduced in a throwaway clone (~48 silent deletions incl. all
twelve treatment MDX pages — WORSE than the audit's framing, which
counted files; ours counted what they were); the RUNBOOK two-step
verified correct. Two facts the auditor could not see: local main
was stale, and NEITHER branch had protection — "required status
check" therefore included a first-ever branch-protection change.

The four operator decisions (AskUserQuestion, 2026-08-17):
1. **Relaunch (Finding 2): stay dark until the round completes.** No
   date yet. REDESIGN.md gains the "Round close" scaffold — three
   operator-filled slots (frozen list, date, the seven gaps as
   pass/fail checks) — and docs/RELAUNCH.md now holds the complete
   ready-to-execute relaunch dossier so the date is the only missing
   input. Post-freeze asks are change-order/retainer scope.
2. **Assistant (Finding 4): NOT in relaunch scope — BUILD_SPEC §3
   stands.** The fork (a scope decision recorded outside this repo
   had floated a text-only assistant into website launch) is closed:
   no server code enters this architecture in this round; the
   assistant remains a later, separately-planned increment. This
   entry is the in-repo record the audit asked for. Zero build.
3. **Analytics (Finding 6): Plausible at relaunch** — built same day
   (own entry above).
4. **Media origin (Finding 5): build now** — built same day (own
   entry above); LFS declined.

Finding 3 (approval gate attests to copy, not presentation):
CLINICIAN-SIGN-OFF.md now splits **copy approval** (flag-gated,
unchanged — the gate's logic was correct all along) from
**presentation approval** (per-round, dated, manual record with the
2026-08-05 launch pass logged and the redesign round pending);
BUILD_SPEC §7 records that CSS-level presentation changes skip the
flags BY DESIGN; the presentation date is a relaunch hard gate; the
studio-wide alt mismatch is queued into the flag-resetting
re-approval pass. Finding 7 housekeeping: the orphan placeholder
photo deletes in the relaunch PR (it lives on main only); the four
astro-check hints are a separate small source PR; the stale
Claude-Project snapshots are an operator action outside this repo.

Consequences: every audit finding now has a recorded disposition —
built (1, 5, 6), operator-decided and recorded (2, 4), record-split
(3), scheduled (7). "Relaunch" now HAS a definition of done — the
audit's named blocking ambiguity — in REDESIGN "Round close" +
RELAUNCH.md preconditions.

## 2026-08-18 — /services becomes a photo-card menu: Amy's own mockup, her per-line picks, and a scoped perf-budget carve-out

Context: client direction via the operator (mockup `button01.png`):
every service line on /services becomes a linked "button" — her photo
in the house arch, numeral + title + summary + "More information ›"
below, the whole card one link. Chosen build: merge the two existing
patterns rather than invent a third — the homepage door's arch/plate/
lift/link-overlay anatomy joins TreatmentCard as an optional `photo`
prop (backward compatible; photo-less cards render as before). The
photos are the client's own per-line picks (B1…B12 in her picks
folder, slot = menu number). Operator decisions: keep the three
category groups (2026-07-23 direction stands); keep the 3-photo
strip; photos are her picks, not the repo's existing frames.

Screening record (frame-level, per the RUNBOOK photo procedure; the
operator's confirmations are the record):
- Releases for every identifiable client CONFIRMED on file — slots
  01 (brow/temple injection), 04 (device treatment, reclined
  client), 07 (laser, eye shields), 11 (IV drip under the neon).
- Slot 06 is Amy herself (Evolve-belt chair selfie) — confirmed, no
  release needed. 9:16 selfie vs 4:5 arch: the crop anchors on the
  belt (the treatment story); face-included crops cut at the chin.
- Slot 11 had two candidate files; the operator picked the portrait
  neon frame. The unused landscape frame (second provider in frame)
  was never committed.
- **Slot 12 — operator override after the compliance flag.** The
  frame shows Amy beside the Biote banner whose outcome-promise
  lines and symptom poster are legible at source and partially
  legible at card size, on a page that carries no Biote disclaimer.
  Flag raised in full; operator chose SHIP AS-IS. CLAUDE.md
  constraint-3 gains the scoped exception (this photo, this page);
  extending it requires the human operator.
- Package labels elsewhere (Evolysse/Jeuveau boxes slot 02,
  RADIESSE+ box incl. its pack-size marking slot 03, skinbetter
  bottles slot 08, saline bag slot 11) are trade dress as sold,
  illegible at served size — the strip frame-8 precedent; the
  pack-size marking is package contents, not dosing.
- Partial banner fragment in slot 01 illegible at served size.
- Slots 05 and 09 await the client's remaining picks and carry the
  line's own page photo in the interim (PiXel8-RF product shot;
  supervised weigh-in). Swapping a pick in is a one-line map edit in
  ServiceLineGrid (RUNBOOK "Replacing site photography").

Assets committed content-named (never slot-named): temple-injection,
amy-holding-neon, radiesse-syringes, device-facial-session,
evolve-belt-selfie, laser-eye-shields (PNG master converted to JPEG
q92, prp precedent), skinbetter-trio-forward, lavender-suit-stool,
iv-drip-neon, biote-banner-scale. Hash-checked against existing
assets (skinbetter-in-hand and amy-lavender-suit are DIFFERENT
frames from the same sets — no dupes). Masters stay outside the
repo. Crop anchors are sharp gravity/strategy tokens (the door
pipeline's knob; percentages are CSS, sharp rejects them) —
'attention' for most, 'bottom' for the two whose story sits at the
frame's foot (04, 06) and the interim 09, 'top' for 12, 'centre'
for 08/11; every crop eyeballed on element screenshots.

Perf budget (operator-approved after the flag, measured numbers):
LH's mobile emulation fetches every lazy card on its full-page
scroll, so the 12-card menu measures 568KB of images on /services
(588KB on /styleguide, which demos the grid) against the 240KB
budget — unreachable at any credible fidelity (even 640px-capped
derivatives measure ~390KB). Operator chose FULL RETINA (1000px
derivatives where the source has the pixels; srcset capped at each
photo's 4:5-crop width so sharp never upscales — the retina rule's
silent failure mode). lighthouserc.json's assertions became an
assertMatrix: /services + /styleguide alone get image 640KB / total
940KB; every other URL keeps the original budgets, which remain the
default for new pages. Real visitors still fetch cards only as they
scroll; the initial-viewport payload is unchanged (H1 stays LCP).

Alternatives rejected: new bespoke card component (two patterns
already encode the anatomy); slot-named assets (house rule); CSS
percentage crops served at full frame (bytes + no server crop);
2-across mobile grid (cramped Playfair titles read down-market;
mockup scale is 1-across); weakening the global budgets (the
carve-out is scoped to exactly the two menu URLs).

Consequences: /services is the photo menu the client mocked; the
grid comment carries the screening pointer; the presentation-drift
list in CLINICIAN-SIGN-OFF gains this change (pending presentation
approval covers it); two interim slots swap on her word; zero
treatment MDX touched — no clinicianApproved resets.

## 2026-08-18 — Photo-menu rev 2: compact tiles (operator preview review) and the carve-out tightens

Context: the operator reviewed PR #121's preview — right idea, but
the mockup-literal scale made huge buttons, not mobile-friendly;
directive: shrink by over 50%. Measured: phone cards were 1-across,
~343px wide × ~720px tall (~247k px²; menu ≈ 8,600px of scroll).

Decision: density, not a nudge — the grid goes 2-across on phones
(gap-3) and 4-across from lg (one row per category group); type
compacts under the `--photo` variant only (numeral/title clamps
down, summary 0.875rem, microline 0.6875rem → 0.625rem on phones
with tracking cut from the editorial 0.18em); on phones the summary
is HIDDEN (operator decision) — tile = arch + numeral + title +
"More information ›"; it returns from 640px where 2-across cards run
350–480px wide. Measured result: phone page 10,481px → 4,356px
(58% shorter; per-card area −77%), desktop 7,691px → 3,728px.
Microline honesty note: single-line proven from ~375px; at the 344px
Z Fold cover Playfair's wide caps stack it onto two composed lines —
accepted rather than shrinking below 10px.

Image recipe re-derived per delivery band: widths [400, 640, 880] —
880 exists because the 640–1023 two-across band needs up to ~878px
on DPR2 tablets (with 640 alone they'd get 0.73×, a real retina-rule
break caught in plan review); `sizes` now describes the IMAGE width
(35vw phones), not the card — the shipped 44vw over-fetched. B4/B6/
pixel8-rf stay source-bound below their band ideal (crop-cap logic).

Consequence for the same-day carve-out: LH-CI now picks 400w cards,
so /services measures 298KB and /styleguide 317KB of images — the
assertMatrix carve-out TIGHTENED from 640/940KB to 384/512KB
(budgets only move down without a flag; the tighter numbers are the
new ceiling for both URLs). Photos, anchors, screening, releases,
the slot-12 override, groups, numbering, and the strip all stand
unchanged from the entry above.

## 2026-08-18 — Slots 05 and 09 get their real picks; the menu's interim slots close

Context: the operator flagged slot 05 serving the interim photo —
the client's B5 pick was in the picks folder (missed in the first
sweep). Screened: Amy solo holding the PiXel8-RF handpiece,
device/maker name legible (the device is named in the line's own
copy — product-labeling precedent), blurred device screen and neon
behind, no client, no release needed. Committed content-named
(`pixel8-in-hand.jpg`). Slot 09 went through two frames the same
morning: her first B9 (HEIC) was screened and staged (client on the
InBody scale, sign fragment illegible — frame-8 class; the client's
website-use release CONFIRMED on file, operator word = the record),
then the operator directed a replacement frame (B9.jpeg — same
client, different session, EXIF-rotated master normalized upright
and committed at the shoot-file class, 1200×1600 JPEG q92,
`inbody-weigh-in.jpg`). **The replacement frame ships under operator
override after the compliance flag:** its aftercare wall sign titles
a competitor neuromodulator brand in large type, legible at served
card sizes — a brand the site's own copy never names (the menu is
Jeuveau/Xeomin/Daxxify) and whose pixels previously shipped only
under the studio-reel override. Flag raised with a crop-out
alternative; operator chose SHIP AS-IS → CLAUDE.md's constraint-3
scoped-exception list grows to two menu-card photos. The sign's
small caption lines (incl. its results-timing line) stay illegible
at every served size. All twelve menu slots now carry the client's
own picks; the interim photos (`pixel8-rf.jpg`,
`supervised-weigh-in.jpg`) remain in the repo for their
treatment-page uses.

## 2026-08-18 — Menu-card photo fixes, round 3: 06 shows the face, 10 lightens

Context: operator preview feedback on the merged menu (PR #121):
card 06 Body Contouring cut off Amy's head (the shipped 'bottom'
anchor deliberately framed the Evolve belt — the map comment said
the client judges on the preview, and she did), and card 10 Peptide
Therapy (`lavender-suit-stool.jpg`) read quite dark (the source
carries a muted, underexposed matte grade).

Decision, card 06: anchor 'bottom' → 'top' — the maximum-face
window. Geometry measured first: the 720×1280 selfie's face spans
the top ~29% of the frame and the belt the bottom ~30%; the 4:5
cover window is 720×900 (slidable y∈[0,380]), so NO window holds
both. 'top' shows head, torso, and the treatment chair; the belt
hardware leaves the frame — accepted consequence, stated in the
approved plan. Showing both takes a different frame (a map-line
swap when Amy supplies one). Eyeballed on the element shot: both
eyes clear the arch dome; only right-side hair clips (normal
arch-portrait reading). Alternatives rejected: mid-window
compromise crops (the dome clips an eye and the forehead goes);
a narrower face-centered extract (drops the belt anyway AND the
srcset below the retina bar).

Decision, card 10: server-side re-grade, baked into the asset —
re-derived from the master B10.jpg (1067×1600, single generation),
sharp `.modulate({ brightness: 1.18, saturation: 1.05 })
.linear(1.05, 0)`, JPEG q92, committed under the same content name
(zero code change). Chosen from four candidates by side-by-side
eyeball, then checked against row neighbors 09/11 on element shots:
no longer the dark outlier, not washed. CSS-filter alternative
rejected — the menu cards have no filter hook and a one-card
mechanism is special-casing; the house pattern bakes grades
server-side. Screening unchanged for both frames (no new legible
content; the 06 crop moves the belt labels out of frame entirely).
Measured after: /services 290KB, /styleguide 309KB of LH-mobile
images — inside the 384KB carve-out, no budget movement.

Same day, on the operator's preview review of this PR: cards 11
(`iv-drip-neon.jpg`) and 12 (`biote-banner-scale.jpg`) called too
dark as well — both re-graded from their masters (B11.jpg /
B12.jpg, single generation), sharp
`.modulate({ brightness: 1.28, saturation: 1.05 })` (the dim
ambient scenes took a stronger straight lift than card 10's mix),
JPEG q92, same content names. Eyeballed on element shots: the 11
neon still reads, the 12 banner whites keep texture; the Wellness
row is tonally coherent. Screening posture unchanged: the 11 bag
labels stay illegible at served sizes; the 12 banner was already
legible and ships under its recorded constraint-3 override — the
lift changes exposure, not what the frame discloses. Re-measured:
/services 294KB, /styleguide 313KB — inside the carve-out.

Card 06, round 4 (operator: face AND belt must both show; "you may
need to shrink the pic"): cropping is geometrically dead (see
above), so the committed asset became a pre-composed 4:5 blur-fill
contain — the full 9:16 frame at NATIVE 720×1280 inside a 1024×1280
canvas (zero foreground resampling; 1024 restores the 880 srcset
tier), side bars a blurred blowup of the same frame (sharp: cover
1024×1280 → blur 60 → brightness 1.1 / saturation 1.1; composite
gravity centre; q92). The bars read as soft brand-pink and blend
into the card plate; centring also moved the face clear of the arch
dome. Anchor token → 'centre' (identity crop — source aspect now
equals the arch's). Screening: the belt labels render smaller than
any prior crop (illegible), the mirrored FIGS tag returns to frame
(carried as-is per the original screening), blurred bars are
unrecognizable content. Measured: /services 296KB, /styleguide
315KB — inside the carve-out.

## 2026-08-18 — /services intro copy verbatim; sixth allowlist authorization ("best")

**Context:** Client-directed copy change (via the operator): the /services
lead keeps its first sentence and replaces the next two with her wording —
"From Facial Balancing to Weight Loss & Body Contouring to all things
Peptides oriented, Amy has your best self in mind. Start by browsing her
service menus below, select where you want to begin, hit "BOOK" and start
your journey now with Amy's expertise as your guide!" The word "best" is a
hard-banned superiority pattern (`\bbest\b`), so the copy cannot pass
lint:claims as written.

**Decision (operator override after the compliance flag, 2026-08-18):**
ship verbatim. The exact fragment "Amy has your best self in mind" joins
`allowedStrings` — the sixth authorization, second superiority-class entry
(Evolus ranking sentence precedent). Bare-fragment form: the banned word
sits mid-fragment with space boundaries, so the self-test's digit-prefix
near-miss proof holds without source-wrapping (the li-wrap trick is only
needed for string-initial banned words). Editing rules as ever: the
fragment lives on ONE source line (per-line, case-sensitive stripping) and
"best" stays banned everywhere outside it. Scope: the /services intro lead
only (policy scope, recorded in CLAUDE.md constraint 3).

**Alternatives rejected:** two compliant rephrases offered and declined —
"your most confident self in mind" (recommended) and "your goals in mind".

**Consequences:** the registry, page copy, CLAUDE.md exception record, and
this entry change together in one commit (price-tier precedent). One
verbatim-fidelity note, flagged once and kept: the site's booking buttons
read "Book with Amy", not "BOOK" — the client's quoted label is a
near-match; a one-word alignment is available if she wants it. "Facial
Balancing" is not a menu-line title (it names the filler/balancing work) —
illustrative client phrasing, carried as-is.

## 2026-08-18 — Evolus recognition plate + ICON film move to /about

**Context:** Client direction (via the operator, 2026-08-18): on
/services/wrinkle-relaxers, the black EvolusCallout plate, the "Inside
Evolus" section, and the ICON film all move to /about — prep for that
page's photo round. Two standing records were in the way: the 2026-07-21
operator placement decision "About stays ranking-free," and the
page-scoped exception records (CLAUDE.md constraint 3, BUILD_SPEC §6/§7/§8,
the component's own header) that authorized the ranking sentence on
wrinkle-relaxers + dermal-fillers and the ICON film on wrinkle-relaxers.

**Decision:** Move all three as a unit, byte-identical copy (intro
paragraph, film label, caption). The client's direction supersedes the
2026-07-21 placement decision; every page-scope record is amended in the
same PR — ranking sentence now dermal-fillers + about, ICON film now
/about, exception TERMS unchanged (as-is carriage, comparative-efficacy
remarks and named third-party providers operator-accepted, captions
faithful). `compliance/banned-patterns.json` is untouched: the allowlist
strips globally and its third-authorization comment records no page scope.
On /about the pair sits between the milestones timeline and "The name on
the wall," in a left-aligned max-w-3xl column — the same 48rem width both
components shipped in inside the treatment body.

**Alternatives rejected:** copying (rather than moving) the callout so
wrinkle-relaxers keeps it — the direction was "moved"; consolidating the
dermal-fillers instance too — not asked; the request names only
wrinkle-relaxers, so dermal-fillers keeps its own plate.

**Consequences:** first approved-content MDX edit of the redesign round —
wrinkle-relaxers `clinicianApproved` reset true → false in the removal
commit (constraint 4; `check:approvals` gates only the production
pipeline, which stays dark; the consolidated pre-relaunch re-approval
restores it). The sign-off doc's wrinkle-relaxers row loses the two items
and the presentation-drift list gains the move. /about (LHCI default
budgets) now carries the ICON poster; wrinkle-relaxers gets lighter —
both measured in verify.

## 2026-08-18 — wrinkle-relaxers photo round; bare arches sitewide; Jeuveau-banner override

**Context:** Client direction (via the operator, 2026-08-18): replace the
three wrinkle-relaxers photos with her picks — 10.jpg ("Who they're
generally for"), 11.jpg ("Not just for women"), 12.jpg (the band) from
C:\Amy\New Pics — and make the white space around the arches pink like
/services. The white was the treatment layout's paper mat (background +
padding + hairline + shadow + ±1.5deg tilt); the arch rollout
(2026-08-17) had predicted exactly this follow-up.

**Screening record (frame-level):** 10 = Amy in a pink blazer injecting
at a reclined client's brow under the MA neon (her own signage; no
product text). 11 = male client with an MA-branded hand mirror, Amy in
her embroidered scrubs; tray vials/labels illegible at served size.
12 = Amy (operator-confirmed it is her — hot-pink scrubs, face in
profile) with two clients and a large, LEGIBLE Jeuveau banner: "KISS
YOUR 11s GOODBYE", the indication line (including "TEMPORARY", copy
vocabulary dropped 2026-07-30), "Jeuveau YouSeeMe!". Flag raised in
full → **operator override: ship as-is** — the third photo
pixel-override (biote-banner-scale precedent); CLAUDE.md constraint 3
amended in this PR. **Releases for all four pictured clients confirmed
on file** (operator, 2026-08-18 — the confirmation is the record). All
three assets hash-unique vs the repo.

**Decisions:** (1) Assets content-named: blazer-brow-injection.jpg,
hand-mirror-male-client.jpg, jeuveau-banner-studio.jpg; masters stay
outside the repo; outgoing frames (brow-appointment,
male-client-appointment, fine-gauge-detail) deleted — no other
consumers; git history keeps them. (2) The band asset is a
pre-composed 9:8 blur-fill contain composite (card-06 house pattern,
RUNBOOK): the three people span x≈150–1560 of the 1600-wide 3:2
master and the widest 9:8 cover window is 1200 — no crop holds every
face. Recipe: 1600×1422 canvas = the frame resized fill + blur(28) +
brightness 0.96 as self-fill, full frame composited centered, jpeg
q92 (sharp). It matches the layout's 9:8 band window exactly, retiring
the recorded fine-gauge 16:9-into-9:8 double-crop defect early, and
its 1440 tier meets the desktop slot's DPR2 demand exactly. (3) Mat
removal scope = ALL treatment pages (operator choice): one shared-CSS
change, zero MDX edits elsewhere, zero flag resets; /about's matted
print and the film players' mats stay. Tilts retired with the mat —
bare arches sit straight, like /services. (4) One per-image crop
override (the arch rollout's recorded knob): the blazer frame anchors
top (50% 0%) so the 4:5 window keeps the neon script whole; the
default 30% anchor sliced it mid-stroke.

**Alternatives rejected:** any 9:8 cover crop of 12 (guillotines a
face — geometry above); keeping the mats only off wrinkle-relaxers
(visibly inconsistent between treatment pages; needs a page-scoped
hack).

**Consequences:** wrinkle-relaxers clinicianApproved stays false (reset
in the Evolus-move commit; this stacks on that branch). The band's
LH-mobile pick stays the 1080 tier but 9:8 carries ~1.6× the pixels of
the old 16:9 — offset by the ICON poster the page just lost; measured
in verify. Presentation drift (bare arches, 12 pages) added to the
sign-off doc for Amy's pending pass.

## 2026-08-18 — band re-cut + compact arch (client feedback on the composite)

**Context:** Client feedback on the PR #126 preview: the blur-fill band
read as not-fitting — "put it in a smaller arch so that it fits
correctly; if we need to shrink it, let's do it." Geometry recap: the
master's four people span ~1410px of 1600 and the widest 9:8 window is
1200px, so any arch the photo FILLS must omit someone.

**Decision:** jeuveau-banner-studio.jpg re-derived from the master as
an exact 9:8 window — extract x=490, y=45, 1110×987, jpeg q92 (sharp)
— omitting the left-hand client cleanly (no sliver of her or her
chair; eyeballed against x=510/530 candidates; releases unchanged, hers
now unused for this frame). The banner, Amy, and the male client fill
the arch sharp, edge-to-edge; the blur-fill composite is superseded.
The Jeuveau banner renders LARGER than in the composite — same frame,
same page, same operator override (legibility was the enumerated flag;
the fine print stays illegible at served sizes, eyeball-checked on the
1080 derivative). Presentation: new `media-band--compact` layout
variant (34rem centered) used by this page — the "smaller arch," and
retina math besides: 1110 native px ≈ 1.02× DPR2 in the 34rem slot,
where the full 45rem slot would be 0.77×, below the retina rule.
Tiers [720, 1080]; alt updated ("two clients" → "a client").

**Alternatives rejected:** a 4:5 row-scale arch of Amy + the client
(loses the banner the frame is visibly for); keeping the composite at
reduced width (blur bars are the complaint, size doesn't cure them).

## 2026-08-18 — the segmental arch: band round 3 ("we need to see everyone")

**Context:** Second client feedback on the band: the 9:8 re-cut hid the
left-hand client — "we can't see the other person; we need to see
everyone in the picture." With the earlier feedback that the blur-fill
contain "doesn't fit," every Roman-arch treatment of this 3:2 frame is
now exhausted: the people span wider than the widest 9:8 window
(proven), a cover crop loses a person, a contain leaves fill.

**Decision:** The arch changes shape, not the photo: a designed
SEGMENTAL arch — architecture's wide sibling of the Roman arch — at
the frame's own 3:2. `media-band--segmental`
(border-radius 50%/34% elliptical dome over straight feet, same
magenta hairline and 12px foot corners) with the FULL master frame
recommitted as the asset (1600×1067, as shot). Everyone visible, the
window filled exactly, no fabricated pixels. This is distinct from the
2026-08-17 rejected "16:9 lens": that failure was the accidental
full-height ellipse with no straight feet; the pinned vertical radius
keeps the feet, which is what makes it read as architecture. The band
returns to full column width — 1600 native px covers the 45rem slot's
DPR2 demand with margin (the retina motive for the 34rem compact
variant dies with it; `--compact` retired unmerged, superseded within
the same PR). BUILD_SPEC §5 amended: the arch family gains the
segmental sibling for landscape frames that must show full content.
Banner legibility: between the composite's and the re-cut's — the
standing override covers it. Alt returns to "two clients."

**Alternatives rejected:** outpainting the master upward to 9:8
(fabricating the studio's architecture; no quality-reliable local
tool); a straight rectangular exemption (abandons the client's own
arch motif when a shape in the family satisfies everything).

## 2026-08-19 — the Evolus Laurel: ranking plaque on wrinkle-relaxers

**Context:** Client direction (via operator): an attention-grabbing
banner on /services/wrinkle-relaxers saying Amy is "The Top Evolus
Injector in Charlotte"; the operator has verified the designation
with Evolus, and the same verification covers her Top-50 standing in
the US. This is a NEW object with NEW wording — it does not reopen
the 2026-08-18 move of the "#1 provider" plate to /about, which
stands ("Injector" vs "provider" reflects Evolus's designation per
the operator). Ranking presence is now three pages, each recorded.

**Decision:** A noir laurel plaque (`EvolusLaurel.astro`) rendered by
TreatmentLayout between the deck card and the product cards — the
credential lands before the pitch, and the blush→noir surface snap is
the attention mechanism. Composition: a build-time-generated
fine-stroke laurel (Bezier-sampled leaf pairs, decorative SVG, no SVG
text per the axe rule), the statement at a 39px-floor display clamp
with the key phrase carrying the sanctioned ng-shimmer (the "noir
display-accent phrases >=39px" rule — no motion-vocabulary change
needed), an ng-trace rule-accent, and the Top-50 line as a tracked
eyebrow. Whole plaque rises in with ng-rise; reduced motion serves
the static plaque. Placement required a frontmatter-gated layout
slot: verified first-hand that the MDX body renders BELOW the product
cards, so an in-body banner could not sit high. Schema gains
`evolusLaurel: z.boolean().default(false)` (operator-approved schema
change, plan approval 2026-08-19 — productDetails precedent); the
fixed compliance order in TreatmentLayout gains the optional plaque
between deck and intro.

**Compliance record:** Operator wording decision (AskUserQuestion):
bare claim + the Top-50 line, NO "Recognized by Evolus" kicker —
consistent with 2026-07-21, where attributed wording was also
declined. Exact sentences: "The Top Evolus Injector in Charlotte."
and "And among the Top 50 in the United States." Verified first-hand
against compliance/banned-patterns.json: neither sentence trips any
category (bare "top" is not "top-rated"; "Top 50" carries no unit),
so there is NO allowedStrings entry and NO banned-pattern change —
a bare "top" pattern would false-positive ordinary copy, against the
registry's own precision principle. Like the photo pixel-overrides,
the claim is invisible to the linter, which is exactly why the
authorization is recorded in CLAUDE.md constraint 3 and BUILD_SPEC
§8.4 instead. The ranking appears ONLY in the plaque — never in meta
descriptions, OG tags, alt text, or JSON-LD. clinicianApproved on
wrinkle-relaxers is already false (2026-08-18 reset) and stays false;
the plaque copy rides the consolidated pre-relaunch re-approval.

**Alternatives rejected:** reusing the EvolusCallout noir-plate style
(the client moved that exact object off this page the day before —
regressive); a scrolling marquee (rejected on sight 2026-07-08); a
foil background-clip sheen (trialed sitewide earlier and failed the
axe gate — transparent fills are unauditable; ng-shimmer is the
surviving engineered effect); full-bleed band (requires splitting the
fixed-order article DOM); in-MDX placement (sits below the product
cards — not an attention position).

## 2026-08-19 — Laurel round 2: the Top-50 lockup

**Context:** Client review of the PR #127 preview (screenshot with
two arrows): the plaque reads well but the last line — and the "50"
specifically — doesn't stand out. Measured cause: the stat line was
13px tracked eyebrow caps, and Playfair's oldstyle figures drop the
numeral below the caps line, making the one number that matters the
weakest glyph on the plaque.

**Decision:** The sentence becomes a stacked award lockup — "AND
AMONG THE" (13px caps) / "Top 50" (display Playfair at the
statement's own 39→49px clamp, display-accent + ng-shimmer) / "IN
THE UNITED STATES." (13px caps). SAME WORDS, SAME ORDER — one
paragraph, three block spans; typography only, the pinned wording is
untouched (and with no allowlist entry there is no one-source-line
requirement — the no-allowlist path's benefit). The plaque now has
two breathing accent phrases — the two "Top" rank phrases — sharing
one keyframe cycle so they glow in sync; if that reads busy on
preview, dropping either to static is a one-line change (the
recorded knob). Display scale also retires the oldstyle-figure droop.

**Alternatives rejected:** merely enlarging the whole caps line (the
complaint is hierarchy, not legibility — a louder caption is still a
caption); putting "50" inside the laurel bowl as a crest numeral
(duplicates the fact and leaves the sentence quiet — arrow 1 pointed
at the line itself); lining figures via font-feature-settings (fixes
the droop, ignores the standout ask).

## 2026-08-19 — page title: "Neurotoxins - Wrinkle Relaxers"

**Context:** Client direction (via operator): the wrinkle-relaxers
page heading changes from "Wrinkle Relaxers" to "Neurotoxins -
Wrinkle Relaxers" — extending the 2026-08-18 menu-line wording
(serviceLines.ts, PR #123, verbatim incl. the hyphen) to the page
itself. Menu card and page H1 now match exactly.

**Decision:** The MDX `title` changes; it fans out automatically to
the H1, the page breadcrumb, and the JSON-LD service + breadcrumb
names ([slug].astro — verified consumers). `seo.title` keeps
"Wrinkle Relaxers in Harrisburg & Charlotte, NC" deliberately: the
search phrasing outperforms the clinical term, and the client's
direction named the on-page heading. The §7 editorial normalize rule
("neurotoxin" → "neuromodulator") is superseded for TITLE strings by
the client's verbatim wording (the 2026-08-18 menu precedent); body
copy still says "neuromodulator". "Neurotoxin" trips no banned
pattern (verified — the rule was editorial, never a linter category).
clinicianApproved already false; stays false; rides PR #127.

## 2026-08-19 — card leads: "A prescription neurotoxin…"

**Context:** Client direction (via operator), same review pass as the
title change: the three wrinkle-relaxers product-card descriptions
open with "A prescription neurotoxin…" instead of "…neuromodulator…".

**Decision:** The three `productDetails.detail` strings change —
nothing else. This further supersedes the §7 editorial normalize rule
("neurotoxin" → "neuromodulator", 2026-07-21) for this page's card
leads; BUILD_SPEC §7 amended in place. "Neurotoxin" trips no banned
pattern (the rule was editorial, never a linter category). SCOPE
NOTE, surfaced to the operator: the page body ("prescription
neuromodulators…") and two FAQ answers still say "neuromodulator" —
left as-is pending direction, so the page currently mixes terms.
clinicianApproved already false; stays false; rides PR #127.

## 2026-08-19 — FAQ question joins the neurotoxin wording

**Context:** Client direction (via operator), same review pass: the
FAQ question "Do men get neuromodulator treatments?" becomes "Do men
get neurotoxin treatments?".

**Decision:** The one FAQ `q` string changes. The mixed-terms note
narrows: "neuromodulator" now remains only in the page body ("What
they are") and the first FAQ answer ("All three are prescription
neuromodulators…") — still surfaced for direction. Rides PR #127;
clinicianApproved unchanged (false).

## 2026-08-19 — wrinkle-relaxers goes neurotoxin page-wide

**Context:** Client direction (via operator) closing the same review
pass: the two remaining "neuromodulator" strings — the body intro and
the first FAQ answer — flip too, "so everything matches."

**Decision:** The page now says "neurotoxin" throughout (verified:
zero "neuromodulator" left in the file). The §7 normalize rule is
superseded PAGE-WIDE for wrinkle-relaxers (BUILD_SPEC §7 note
updated); it stands for every other page. The mixed-terms caveat in
the sign-off row retires. Rides PR #127; clinicianApproved unchanged
(false).

## 2026-08-19 — VisitSteps: MA chevron plates replace the numerals

**Context:** Client direction (via operator, mockup steps.png in the
repo root): the "Your visit, step by step" numerals (01–04) become
the Mobile Aesthetics chevron block on small noir plates — the same
four-chevron badge on every step, per the mockup.

**Decision:** One-file component change. The chevron paths and the
foil gradient are copied VERBATIM from the committed header mark
(src/assets/brand/mobile-aesthetics-mark-header.svg — brand fidelity;
MA is Amy's own PLLC, constraint 2 not engaged, DECISIONS
2026-07-23). Badges are decorative inline SVG (aria-hidden, no SVG
text; gradient ids indexed ma-foil-0…3 so no page carries duplicate
ids). Non-visual parity: the retired CSS counter was announced by
screen readers, so each step heading opens with an sr-only "Step N."
Fan-out: all 12 treatment pages + the styleguide (pa11y re-audits
all of them in verify). The /about milestones keep their numerals
(career timeline — different object; tokens.css comment updated to
name them as the display accent's remaining light-canvas consumer).

**Alternatives rejected:** a progressive 1–4 chevron count per step
(the mockup is explicit — the block is the brand mark, not a
counter); reusing the whole header-mark SVG asset as an <img> (pulls
the chrome wordmark and the plate frame along; the badge needs the
chevrons alone at exact gradient fidelity).

## 2026-08-21 — the DraftBanner retires; the approval gate stays

**Context:** Operator direction: remove the "Draft — pending
clinician review" strip above the header on /services/wrinkle-relaxers
— the client read it as something that would be on the finished site.
The strip was truthful: that page has been `clinicianApproved: false`
since the 2026-08-18 Evolus-plate move (constraint 4), and it was the
only unapproved page at the time. The banner was always a preview-only
marker — the production deploy fails via scripts/check-approvals.mjs
before an unapproved page could publish.

**Decision:** Retire the visible marker sitewide, not per page. The
DraftBanner component is deleted (git history keeps it); TreatmentLayout
and the styleguide stop rendering it; the `clinicianApproved` prop
leaves the layout and the treatment route, so the flag never reaches
markup. NOTHING about the gate changes: the schema flag, the
reset-on-edit rule, and `check:approvals` in production.yml are
untouched, and docs/CLINICIAN-SIGN-OFF.md remains the human record
(it now carries the grep that lists pending pages, since the rendered
page no longer tells you). Precedent: the legal pages' counsel-review
banner came off the same way at the operator's acceptance
(2026-08-04). BUILD_SPEC §7 and §4 record the retirement.

**Alternatives rejected:** hiding the strip only on wrinkle-relaxers
(a per-page exception to a sitewide mechanism — the next reset would
reproduce the confusion); setting `clinicianApproved: true` to make
the banner go away (constraint 4 — never mine to set, and it would
falsify the record); keeping an sr-only or HTML-comment marker (still
announced or still misread, and it protects nothing the gate doesn't).

**Consequence, stated plainly:** previews no longer show which pages
await Amy's sign-off. The consolidated pre-relaunch re-approval round
must therefore work from docs/CLINICIAN-SIGN-OFF.md and the flags, not
from what the preview displays.

## 2026-08-21 — dermal-fillers: the Evolysse film retires; photo round page 5

**Context:** Client direction (via the operator, 2026-08-21) for
/services/dermal-fillers: remove the Evolysse film and its heading;
replace the two Evolysse-box photos with her picks 14 and 15 (C:\Amy\New
Pics); add 8K0A9591 (C:\Amy\pics) to the right of "Lips, styled". Built
in an isolated worktree off phase-c (three sessions share the main tree
today).

**The film — first retirement of a scoped compliance exception.** The
Evolus-produced Evolysse film shipped 2026-07-21 under an as-is operator
override (before/after segment, location co-branding and phone,
manufacturer narration) recorded in CLAUDE.md constraint 3 and BUILD_SPEC
§7.4/§8.3. It now renders nowhere on the site, so the exception is marked
RETIRED in those documents in this PR (governing-doc edits authorized by
the operator's approval of the plan — the 2026-08-18 Evolus-move
precedent). TreatmentVideo stays (the ICON film on /about uses it).
Orphans removed with zero references remaining: evolysse-film-poster.jpg,
public/media/evolysse-film.vtt, and the two box photos below. The .mp4
rendition lives in Blob (media.needlegirlie.com/evolysse-film.mp4) and is
now unreferenced; deleting it is the operator's `az storage blob delete`
(RUNBOOK), recommended left in place until relaunch in case the film
returns (storage cost is nil).

**Screening + release record (frame-level, RUNBOOK procedure):**
- 14.jpg is the SAME BYTES as the repo's `mirror-moment.jpg` (sha256
  145f1092…; committed 2026-07-18, zero consumers since the 2026-07-25
  concept rebuild) — reused, not duplicated (dedup rule). Amy holds a
  black hand mirror reading "MOBILEAESTHETICS" (her own branding,
  sole-owner precedent) for a laughing client in a floral dress; no
  products, no claims text. Its release log was contradictory
  (2026-07-20 "unconfirmed" → 2026-07-23 "cleared" → 2026-07-25 flagged):
  RESOLVED — **release CONFIRMED on file by the operator, 2026-08-21**
  (the confirmation is the record). Replaces evolysse-duo.jpg in "Placed
  in proportion".
- 15.jpg → `revanesse-mirror-client.jpg` (1067×1600, byte copy). A seated
  client studies her face in a "REVANESSE LIPS+" hand mirror under the MA
  neon; Amy in black scrubs, embroidery = her own name; no claims text —
  the mirror names a product the page's own copy names. **Release
  CONFIRMED on file by the operator, 2026-08-21.** Replaces
  evolysse-boxes.jpg in "Individualized, with Amy". Crop: the 4:5 arch
  trims 266px of a 2:3 source and the default 30% anchor takes 80px off
  the top — the neon spans y≈55–215 and would be sliced mid-stroke, so
  TreatmentLayout gains the per-image top anchor (the 2026-08-18 blazer
  knob); it sheds only feet.
- 8K0A9591.jpg → `lip-injection-detail.jpg` (1067×1600, byte copy) — the
  same bytes as the retired `fine-gauge-detail.jpg` (wrinkle-relaxers
  until 2026-08-18; deleted as an orphan, git history keeps it), now
  content-named for what it shows: pink-gloved hands guiding a fine
  syringe at a reclined client's upper lip; no text, no products. Release
  on record: DECISIONS 2026-07-21 ("8K0A9550/9591 female client"). New
  third media row — "Lips, styled" copy left, photo right
  (`media-row--flip`); the lip style-guide diagram stays full-width
  below.

**Decision:** ship all three as directed — one content commit (MDX +
assets + orphan removals), the layout knob and the docs sweep as their
own commits. `clinicianApproved` true → false in the content commit
(constraint 4 — Amy's 2026-08-05 approval covered the film and the box
photos); since PR #128 no banner renders either way, and check:approvals
still gates the (dark) production pipeline. The consolidated pre-relaunch
re-approval restores the flag.

**Noted, not blocking:** two hand-mirror "reaction" frames now sit in
consecutive rows — a compositional echo, and a mirror moment reads as a
results beat; no text, no pairing, no before/after, and the class already
ran on /about in July. They are Amy's picks. And the page now runs three
alternating rows (flip / normal / flip) before the diagram — the
2026-07-25 rule capped wrinkle-relaxers' identical 3-run with a band;
here the full-width style guide directly below is the scale break, and
"to the right of that" was explicit direction.

**Alternatives rejected:** committing 14.jpg under a new name (a byte
duplicate of mirror-moment.jpg — the dedup rule); baking 15's top-anchor
crop into the asset (works, but the house knob for figures is the CSS
anchor and it keeps the full frame reusable); deleting the Blob object
in this PR (an infra action, the operator's, and reversible only by
re-upload).

**Consequences:** dermal-fillers is photo round page 5; the page carries
no video; the sign-off doc's dermal-fillers row and presentation-drift
list are updated; REDESIGN's photo row gains the page; the Evolysse-film
exception text in CLAUDE.md / BUILD_SPEC reads as retired, so a future
session does not re-add the film on the strength of a stale
authorization.

## 2026-08-21 — dermal-fillers round 2: air above the lip diagram; the Laurel plaque replaces the "#1" plate

**Context:** Operator review of the PR #130 preview, two items. (1) The
new "Lips, styled" photo sat almost on top of the lip style-guide
diagram. (2) Direction: copy wrinkle-relaxers' Evolus Laurel banner onto
dermal-fillers in place of the black "Amy is Charlotte's #1 Evolus
provider!" plate. Placement put to the operator (AskUserQuestion): the
plaque lands EXACTLY where the plate was — in-body under "What they
are", after the product cards — not in the layout slot wrinkle-relaxers
uses (parity was recommended; position continuity chosen).

**Decision (1):** the diagram figure takes `margin-top: 2.5rem` via its
existing inline style — the page's row/heading rhythm. Cause: a media
row is as tall as its taller cell (the photo), so the figure that
follows started flush against the arch.

**Decision (2):** `<EvolusLaurel />` is imported into the MDX body and
replaces `<EvolusCallout />`; frontmatter `evolusLaurel` stays false.
Scope record: the Laurel's §8.4 second exception — "wrinkle-relaxers
only" — WIDENS to dermal-fillers at the operator's explicit direction
(CLAUDE.md constraint 3 names widening the page scope as the human
operator's call; this is that call). Substantiation is unchanged and
page-independent (the operator's verification with Evolus). Same exact
sentences, once per page, still absent from meta/OG/alt/JSON-LD. The
allowlisted "#1" sentence now renders on /about ONLY (EvolusCallout's
remaining consumer); the allowlist entry itself is untouched (it strips
globally and records no page scope). Sitewide ranking placements stay at
three (the "#1" plate came off this page as the Laurel went on).

In-body rendering exposed one real defect, fixed in the component before
it shipped: `.treatment-body p { max-width: 65ch }` would box the 17px
stat paragraph to ~530px and shove the centered Top-50 lockup left of
the plaque's axis (the statement line escapes only because 65ch at 39px
exceeds the column). Both plaque paragraphs now set `max-width: none`
(scoped, wins on specificity; no effect in the layout slot). Code
comments in src/ name the plate as "EvolusCallout", never by the ranking
token — lint:claims scans comments (the 2026-07-30 lesson).

**Alternatives rejected:** the layout slot (recommended for parity with
wrinkle-relaxers; the operator chose position continuity); a
TreatmentLayout `:not()` carve-out for the body paragraph rule (the
component owning its own resets travels with it); keeping both plates
(the direction was replace).

**Consequences:** CLAUDE.md constraint 3, BUILD_SPEC §6/§7.4/§8.4, and
both component headers carry the new scopes; the sign-off row and
REDESIGN row follow; clinicianApproved is already false on this branch.

## 2026-08-21 — evolysse-film.mp4 deleted from the media origin (operator direction)

**Context:** After PR #130 retired the Evolysse film from
/services/dermal-fillers, the rendition in Blob
(media.needlegirlie.com/evolysse-film.mp4, 8,984,202 bytes, uploaded
2026-08-17) was unreferenced — recorded as an operator cleanup item.
The operator directed its removal the same morning.

**Checks before deleting:** `git grep` on origin/phase-c outside docs —
zero references; the only remaining TreatmentVideo consumer is the ICON
film on /about; the container inventory was read first (eight blobs,
including the biostimulators round's two fresh uploads, which were left
alone).

**Decision:** `az storage blob delete` on container `media` of
`stngmediag2g4stj5m2gts` (auth-mode key, RUNBOOK procedure), then
`az afd endpoint purge --content-paths '/evolysse-film.mp4'` on
endpoint `needlegirlie` so the day-long edge cache (max-age=86400)
does not keep serving a deleted object; the edge verified 404 on
repeated probes while neighbouring films still answered 206. No
Bicep change — blob contents are data, not infrastructure.

**Workstation note:** the first purge attempt from Git Bash failed with
"Invalid ContentPath C:/Program Files/Git/evolysse-film.mp4" — MSYS
rewrites a leading-slash argument into a Windows path. Issue AFD purges
(and any `/path` argument to az) from PowerShell, or set
`MSYS_NO_PATHCONV=1`.

**Consequences:** the film exists only in the operator's archive
(C:\Amy\Videos master) and git history (the .vtt); re-adding it is an
upload + PR + a fresh DECISIONS entry, never a revert. REDESIGN's open
item closes; the media-origin row no longer counts it.

## 2026-08-21 — Biostimulators: Amy's two reels replace the studio portrait (17a + 17b)

**Context.** Client direction (via operator, 2026-08-21): on
/services/biostimulators the photo beside "A longer view of structure"
(`amy-studio-portrait.jpg`, the 2026-07-21 770×680 crop — the page's
only photo, below the retina rule at every slot) is replaced by the
film `17a.mp4`, and a second film, `17b.mp4`, is added to the right of
"Individualized, with Amy" (text-only until now). This executes the
REDESIGN row parked 2026-08-14 ("17a + 17b → biostimulators; not there
yet"); `20.mp4` → body-contouring stays parked.

**Sources, probed first-hand.** `C:\Amy\New Pics\17a.mp4` ≡
`C:\Amy\Videos\17a\v12044gd…mp4` (SHA-256): a TikTok/CapCut edit,
1080×1920 HEVC Main yuv420p, 30fps, 29.4s, 5.1MB, stereo AAC.
`17b.mp4` ≡ `C:\Amy\Videos\17b\v12044gd…mp4`: a TikTok download,
480×854 H.264, 30fps, 9.0s, 471KB, AAC. Both portrait 9:16 — the first
portrait films given to `TreatmentVideo` (its two posters to date were
landscape).

**Frame-level screen** (contact sheets at 0.5s cadence + full-res
grabs; no burned-in text in either film beyond 17b's Instagram
sticker):
- **17a** — 0–3s Amy and a client posed in the studio hallway; 3–12s
  close-ups of the client's neck (lax skin, pre-treatment); 12–15s a
  product carton: six RADIESSE+ (lidocaine) boxes, two "Accessory Kit"
  boxes, and a Xeomin box whose "100 units/vial" line is legible (a
  neuromodulator carton on a biostimulator film); 15–26s the client
  reclined in the chair after treatment; at 24–26s a SECOND PERSON
  (dark hair, black top, face out of frame) stands behind the chair
  while an arm with a bracelet reaches toward the client's face — Amy
  wears pink scrubs in this film, so the figure is not her; 26–29s the
  posed shot again. Audio: silent open, then a quiet track (ffmpeg
  volumedetect mean −30.0 dB, peak −14.6 dB).
- **17b** — Amy's own selfie reel (lips-forward, no client); the
  Instagram icon + `@MOBILEAESTHETICSNP704` micro-text top-right
  throughout, then a dark "follow" end-card (logo + handle) from ~4.5s
  to the end — half the film. MA is Amy's own PLLC (constraint 2 not
  engaged by the handle). No claims content. TikTok `aigc_info` label
  type 0 — not AI-labeled, so the AI-imagery disclosure rule is not
  engaged. Audio: a steady track (mean −15.3 dB, peak −1.1 dB).

**Flags raised (all shown to the operator before any decision):**
1. 17a's cut is a visual before/after sequence (constraint 3 —
   BUILD_SPEC §8.3, and §8.9 defers before/after content by SOW; this
   page's own 2026-07-21 build entry rejected before/after LANGUAGE
   once already) and its carton shot carries an on-screen unit
   quantity (§8.1). Pixels are invisible to lint:claims. The film is
   site-authored (Amy's own published reel) — no manufacturer
   "carried as-is" shield, but also editable: trimming 3–15s was
   offered as the compliant path.
2. 17a's on-camera client is identifiable — a website-use release is
   required.
3. 17a's second on-frame person (24–26s) — constraint 2 (never imply
   another provider at the location) is separate from constraint 3.
4. 17b is 480px wide — below the redesign's retina hard rule for
   every slot (the row slot is ≈275px desktop / 288px phone: DPR2
   wants ~550–576px, a 3× phone ~864px).
5. Audio: both carry AAC tracks; I cannot transcribe on this
   workstation (Whisper is not installed — the 2026-07-21 run was a
   throwaway scratchpad install).

**Operator decisions (AskUserQuestion, 2026-08-21 — flag-once
satisfied; executed cleanly):**
1. **17a ships AS-IS — operator override after the flag. The
   on-camera client's release for needlegirlie.com use is CONFIRMED
   ON FILE (operator, 2026-08-21 — the confirmation is the record,
   studio-reel pattern).** Trim and hold were declined.
2. **The second on-frame person IS one of the location's other
   providers — OPERATOR OVERRIDE, the third constraint-2 scoped
   exception** (team-film precedent 2026-08-17): face out of frame,
   nobody named or legibly identifiable; **their consent for
   needlegirlie.com use is CONFIRMED ON FILE (operator, 2026-08-21 —
   the confirmation is the record).** Consequence for wording: the
   film never shows who performs the treatment (no injection shot;
   the reaching arm may be this provider's), so every label, caption,
   and comment describes only what the pixels self-identify — Amy, a
   client, the studio, the Radiesse cartons — and never attributes
   the hands-on treatment to anyone. The page's "performs every
   treatment herself" line stays as copy, unillustrated.
3. **17b ships at 480p as FINAL — retina-rule override** (no upgrade
   asset expected). Recorded here and in REDESIGN, not CLAUDE.md — a
   design rule, not a claim rule.
4. **Audio kept (music only).** "Music bed, no speech" is the
   operator's confirmation (2026-08-21) and that confirmation is the
   record; a scratchpad Whisper install was offered and declined. The
   captions therefore take the sounded-film form — faithful to the
   audio, bounded `[Music]` cues (the ICON precedent; a film-long cue
   would paint "[Music]" over the whole play) plus 17b's on-screen
   handle — not the carousel's muted-mirror form. §8 and the voice
   rule still govern that text; no gate reads .vtt, so the cues were
   hand-checked.
5. **Branch off phase-c now** (`content/biostimulators-films`), in a
   worktree beside the concurrent dermal-fillers session's; conflicts
   with PR #130 (which retires the Evolysse film and touches the same
   append-only records) are mechanical and resolved by whichever
   merges second.

**Design decisions.**
- **Films sit IN the media rows.** The `TreatmentVideo` figure is the
  row's grid child, so the 2fr column (~17.2rem) is what constrains a
  9:16 film — the player is aspect-agnostic (the poster's intrinsic
  size sets the box). A new layout rule (`.media-row .video-figure`:
  margin-top 0, centered, `min(18rem, 100%)`) mirrors `.media-figure`
  so films and arches share one rhythm on phones (~288×510). Row 1:
  film left, "A longer view of structure" right (as the photo was).
  Row 2: "Individualized, with Amy" wrapped in a flipped row — copy
  left, film right. Page rhythm: film · text · film.
- **The bare film frame narrows 2026-08-18 (3).** That entry kept
  "the film players' mats" when the treatment photos went bare — it
  was written when the players were standalone blocks. A film INSIDE
  a bare-arch row is a context it never saw, and a white mat there
  would re-import the print look the client asked to retire. So
  `TreatmentVideo` gains `frame="bare"` (no mat; the arch family's
  magenta hairline + 12px foot corners on the video, never the arch),
  used only inside rows; the standalone player (/about's ICON film)
  keeps its recorded mat by default. The film-stage arch exemption is
  qualified accordingly in BUILD_SPEC §5, global.css, and the
  component: manufacturer film stages stay unmasked; site-authored
  films may wear the foot corners.
- **Posters never upscale.** The component requested every poster at
  width 1280 and Astro's sharp service upscales on request — /about's
  ICON poster (960 source) was shipping as a 1280×725 derivative.
  Clamped to `min(1280, source width)`; /about's poster becomes a
  true 960w (a pure tightening on an LHCI-gated page), 17a's a 1080w,
  17b's a 480w.
- **Recipes.** 17a: `ffmpeg -c:v libx264 -crf 20 -preset medium
  -pix_fmt yuv420p -c:a copy -movflags +faststart` (the ICON recipe;
  7.54MB, 2.05 Mbps). 17b: lossless remux `-map 0:v -map 0:a -c copy
  -movflags +faststart` (471KB; video stream first). Posters from the
  renditions at 0.5s (`-q:v 2`): `radiesse-visit-poster.jpg` 1080×1920
  (Amy + the client posed — never a neck close-up as the resting
  frame), `amy-reel-poster.jpg` 480×854. Blob names:
  `radiesse-visit.mp4`, `amy-reel.mp4` (content-named; new names, no
  purge). Captions `public/media/radiesse-visit.vtt`, `amy-reel.vtt`.
- **Constraint 4:** `biostimulators.mdx` was `clinicianApproved: true`
  — the MDX edit resets it to `false` in the same commit (this page's
  first reset of the round; it joins the consolidated pre-relaunch
  re-approval). `amy-studio-portrait.jpg` had no other consumer and is
  deleted (git history keeps it).

**Alternatives rejected:** trimming 17a (the recommended compliant
path for both the sequence and the second provider — operator chose
the overrides after the flags); waiting for a 1080p original of 17b
(the operator closed it as final at 480p); removing the film mat
component-wide (would reverse 2026-08-18 (3) for /about without
direction); a VideoObject / JSON-LD entry for the films (never — §8
scope discipline); a video-play analytics event (it would be the
first client-side component code on a treatment page).

**Consequences:** the page has no photographs left — two click-to-play
films carry its visual weight; posters are fetched at page load (the
`poster` attribute is not lazy) on a page outside the LHCI set; films
stream from Blob only on play (egress pennies). 17b ends on its dark
Instagram follow card (no `loop`) — trimming it to ~4.5s is a one-flag
follow-up if Amy dislikes it. Observation, no change: the film's
handle (@mobileaestheticsnp704) differs from the footer's `sameAs`
Instagram link (amypalaciosnp.mobileaesthetics).

**Addendum (same day, operator preview review):** the printed captions under both films ("From Amy's own reel — sound on." / "From Amy's Instagram — sound on.") came off — the provenance line read as noise to the client. The `caption` prop is simply omitted; the `aria-label` still names each film for assistive tech and the captions TRACK (the .vtt) is untouched. The page-scoped rule stands: no printed caption under a site-authored film unless directed.

**Addendum 2 (same day, operator direction): autoplay on approach.** Both films now autoplay MUTED and loop while ~a third of the player is on screen, pausing off-screen; the native controls are the tap-for-sound and the pause (WCAG 2.2.2); prefers-reduced-motion keeps click-to-play with sound. Mechanism: `TreatmentVideo` opt-in prop `autoplay="inview"` → `data-autoplay` + `loop` on the element and one static script, `public/js/treatment-video.js` (~2KB, IntersectionObserver threshold 0.35 with a 200px root margin; a user pause is never resumed over; a user unmute is remembered, falling back to muted if the browser refuses). Served as a static file because the CSP is `script-src 'self'` (the carousel's recorded lesson); a module URL evaluates once per document, so two players share one run. This is the THIRD sanctioned client-side script and the first on a treatment page — operator-directed, like the carousel; budget impact ~2KB (2,153 B with its comment header) of the 30KB cap; /services/biostimulators is not LHCI-gated, and every other page is byte-identical (the script renders only where the prop is set). Scope rule recorded in the component: opt in only for Amy's own speech-free films — never a manufacturer film or one with narration (the /about ICON film stays click-to-play). Browsers allow autoplay only muted, which is why "tap for sound" is the design, not a choice. Rejected: hiding the controls while autoplaying (no unmute/pause without custom chrome and a self-built 2.2.2 control); play-once (17b would rest on its dark follow card; the operator chose loop-in-view).

## 2026-08-21 — skin-rejuvenation: photo round page 6; the console-readout override

**Context:** Client direction via the operator (2026-08-21): on
/services/skin-rejuvenation, the docked-handpiece photo beside "How
PiXel8-RF works" gives way to her pick 19a, and "A longer view" gains
her pick 19b to the right of its copy. Nothing else on the page
changes. One of three concurrent sessions that day; the work was
isolated in the dermal-fillers worktree on its own branch.

**Screening (RUNBOOK "Replacing site photography"):**
- 19a (1007×1600, new to the repo → `amy-pixel8-cart.jpg`): Amy alone,
  white vest, beside the Rohrer PiXel8-RF cart under the Mobile
  Aesthetics neon; a "Cryo" chiller below. Legible words: the neon
  (her branding), "PiXel8-RF" / "ROHRER AESTHETICS" (named in the
  page's own copy), "Cryo" (a device name) — and the console's settings
  readout: power level, time, and delay values and "Suggested Depth
  1.0mm–1.2mm". No release needed (Amy alone).
- 19b (1067×1600): SHA-256-identical to `pixel8-in-hand.jpg`, the
  /services menu-card frame screened 2026-08-18 — REUSED, not
  duplicated (house dedup rule). Re-screened for the treatment-page
  context: the screen behind the handpiece is out of focus (no readable
  values); the cartridge collar carries small engraved dial graduations
  — bare numerals without units, ≈10px at full resolution, an engraved
  scale rather than a setting. No release needed.

**The flag, and the override.** The 19a readout is the class this log
rejected outright on 2026-08-04 (`pixel8-rf02.png` — "treatment
parameters that never publish, constraint 3"), and BUILD_SPEC §7.10
lists needle depths as dosing-class on this line. It matters more than
at menu-card size because astro:assets serves the source-resolution
file as the `<img src>` (verified in dist/ on dermal-fillers: a 1067px
derivative beside the 340/540/680 srcset) and the repository is public
— whatever is legible in the master is served. Flag raised with three
paths: (1) RECOMMENDED — defocus the screen face server-side, a single
sharp generation from the master with the recipe recorded here (the 06
composite precedent); (2) ship as-is under operator override; (3) a
different frame. **The operator chose (2): ship as-is.** Per the house
rule the flag is raised once and the override executed cleanly; this
entry is the record. Scope: this frame, this page; the 2026-08-04
rejection is superseded for this frame only; no value from the readout
is ever restated in text (copy, alt, comments, meta, JSON-LD) — the
dosing rule itself is unchanged. Recorded in CLAUDE.md constraint 3
(dosing sub-bullet — the fourth pixel-level override and the first
under that bullet; the three 2026-08-18 overrides sit under the claims
bullet) and BUILD_SPEC §7.10 / §8.1.

**Decision (the rest):**
- Row 1 keeps its structure (figure left); `src` swaps, alt rewritten
  to what the pixels show; `widths` move from the page's old
  `[340, 452]` to the sitewide `[340, 540, 680]` — the 18rem arch is
  576px at DPR 2, so 452 under-delivered (retina rule).
- "A longer view" becomes `media-row media-row--flip` (copy first,
  figure second = photo right — the dermal-fillers "Lips, styled"
  pattern) with the same widths contract.
- Crop: 19a's 4:5 window is 1259 of 1600px (341 trimmed). Measured
  from the master: neon rows 67–160, head top ≈199, feet ≈1350–1377.
  The default 30% anchor trims 102px off the top and slices the neon
  mid-letter; the layout's per-image top anchor (blazer / Revanesse
  precedent) keeps neon, head, and console whole and crops at mid-shin
  (shins + the chiller's casters shed). The arch dome clips the neon's
  right tail — inherent, as on the Revanesse frame. 19b sits at the
  default anchor; its soft-focus partial face at the right edge is
  clipped a little by the dome (background, acceptable). Both
  eyeballed at 390 and 1280 on the built page.
- `pixel8-rf.jpg` (the 2026-08-04 interim frame) had no other
  consumer → removed; git history keeps it.
- `clinicianApproved` true → false — approved content edited
  (constraint 4); Amy re-reviews on the PR preview; the flag returns in
  the consolidated pre-relaunch round.

**Alternatives rejected:** the defocus bake (recommended; operator
declined — the client's frame ships untouched); cropping the console
out (it is the device's face — the frame is visibly for it); keeping
`[340, 452]` (below delivery resolution).

**Consequences:** the dosing bullet carries a pixel-scoped exception
for the first time; the CLAUDE.md wording fixes frame and page, so any
future frame showing a console readout is a fresh flag, not a
precedent. PR #131 (biostimulators) touches the same layout, CSS, and
governing docs — whichever lands second resolves keep-both.

## 2026-08-21 — body-contouring: Amy's Evolve reel replaces the session photo (20)

**Context:** Client direction via the operator (2026-08-21): on
/services/body-contouring the photo beside "What a session is like"
(`evolve-session.jpg` — the 2026-08-04 screenshot of a Reel, 449×565,
the page's only photo and below the retina rule at the slot) is
replaced by `C:\Amy\New Pics\20.mp4`, parked for this page since
2026-08-14 (REDESIGN films row). Operator direction on playback:
autoplay — muted on approach, with the sound available on the native
controls (the biostimulators pattern). Nothing else on the page changes.

**Source, probed first-hand.** A TikTok download: 576×1024 HEVC Main
yuv420p, 30fps, 17.37s, 719KB; stereo HE-AAC 44.1kHz; `aigc_label_type
0` (not AI-labeled, so the AI-imagery disclosure rule is not engaged).
A CapCut-style collage edit.

**Frame-level screen** (contact sheet at 0.5s cadence + full-res grabs
at 0/3/6/9/12/15/17s): Amy alone throughout — in the treatment chair
holding two Evolve applicators at her waist under her Mobile Aesthetics
neon; the open applicator case (six pods in foam); close-ups of her
hands on the applicator tray (one pod lit); tiled/rotated panels of
the same scene; a mirrored beat at ~15s. No client and no second
person — no release, constraint 2 not engaged. Legible text: the neon
only (her branding); a device part label with a QR code passes at ~12s
(a model-label fragment, not a claim). No burned-in caption — the
retired photo's source Reel carried an efficacy caption, this film
does not. No body-fat, measurement, or outcome content (§7.11's line
rule): equipment and setup only. **No override of any kind is
required** — the first film of the round to ship without one.

**Audio.** A steady music-class track (ffmpeg volumedetect mean
−26.6dB, peak −8.0dB; no silent windows); not transcribable on this
workstation (no Whisper). The plan stated the assumption — a music bed
with no speech, the same edit class as the 2026-08-21 Instagram reel —
and the operator approved the plan with the autoplay direction; that
approval is the record. Captions therefore take the sounded-film form:
bounded `[Music]` cues (0–4s, 7–11s, 13–17s) under a NOTE block; no
burned-in text to mirror. If speech is ever identified on the track,
the captions need a faithful transcript and the autoplay opt-in is
withdrawn (TreatmentVideo's prop contract).

**Retina rule:** the row slot is ~275px desktop / 288px phone; the
576px source is 2.0–2.1× — meets the rule (the 2026-08-21 480p reel
needed an override; this one does not).

**Decision.**
- Rendition `evolve-reel.mp4` (content-named): the ICON/17a recipe —
  `ffmpeg -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a copy
  -movflags +faststart` → H.264 High, 576×1024, 3.54MB (1.63Mbps;
  the collage edit is motion-heavy), moov before mdat. Poster
  `evolve-reel-poster.jpg` from the rendition at 0.5s (`-q:v 2`,
  576×1024 — the clean opening frame: Amy, the applicators, the neon).
  Captions `public/media/evolve-reel.vtt`.
- The existing `media-row` keeps its shape — film left, "What a
  session is like" right. `TreatmentVideo frame="bare"
  autoplay="inview"`; no printed caption (the 2026-08-21 review rule);
  label describes only what the pixels self-identify.
- Uploaded to the media origin AFTER this entry was committed (the
  written rule); new filename, so no purge. Verified 206 / video/mp4 /
  Accept-Ranges before the PR opened.
- `evolve-session.jpg` had no other consumer → removed (the /services
  card uses `evolve-belt-selfie.jpg`, untouched).
- `clinicianApproved` true → false — approved content edited
  (constraint 4); Amy re-reviews on the PR preview; the flag returns in
  the consolidated pre-relaunch round.

**Alternatives rejected:** keeping the 449px photo (below delivery
resolution, and the client asked for the film); click-to-play (the
operator asked for autoplay); stripping the audio (loses the
tap-for-sound the operator wants); a VideoObject / JSON-LD entry
(never — §8 scope discipline).

**Consequences:** three treatment pages now carry Amy's own films with
one shared ~2KB static script; the page has no photographs left. The
poster is fetched at page load (the `poster` attribute is not lazy) on
a page outside the LHCI set; the film streams from Blob only on play
(egress pennies). RELAUNCH's launch-day probes gain the film and the
autoplay check on this page. No CLAUDE.md change — nothing here is an
exception.

## 2026-08-21 — weight-loss: the 23a weigh-in frame and the "Before and After" section (two operator overrides)

**Context:** Client direction via the operator (2026-08-21) on
/services/weight-loss-glp-1: (1) replace the photo left of
"Individualized, with Amy" (`supervised-weigh-in.jpg`, the page's only
consumer) with `C:\Amy\New Pics\23a.jpeg`; (2) add a new section
"Before and After" after that row, holding `glp1.png`, `glp2.png`,
`glp3.png`. The page was `clinicianApproved: true` (2026-08-05) → reset
in the content commit (constraint 4). Work isolated in the dermal-fillers
worktree on its own branch.

**What was verified first-hand.** 23a: 5712×4284 iPhone JPEG, EXIF
orientation 6 → upright 4284×5712 (3:4); new to the repo. The same
grey-haired client as the outgoing frame, from behind on the InBody
scale, no face. The aftercare wall sign beside her is fully legible:
the competitor neuromodulator brand title in large type (the very sign
behind the 2026-08-18 menu-card override) and its aftercare lines,
including "RESULTS TAKE 10-14 DAYS" — a results-timeline line. Because
astro:assets serves the source-resolution derivative as the `<img src>`,
the committed 1200px file keeps all of it legible. glp1 1290×1167,
glp2 990×766, glp3 964×905 — phone-screenshot PNGs, each a side-by-side
pair of personal photos of identifiable private people: a couple; two
women; one woman. No text or numbers in any of them.

**Flag 1 — the section (raised once, four points):** BUILD_SPEC §1
lists before/after galleries as explicitly NOT in v1 and §8.9 defers
before/after content by the SOW (a scope/contract matter as much as a
compliance one); §8.3 and CLAUDE.md constraint 3 ban before/after
implications outright, §7.1 bans weight-loss numbers on this line, and
this log's 2026-07-22 body-contouring entry refused even body imagery
for reading as before/after; `lint:claims` bans the literal phrase, so
the heading itself fails the gate and the only sanctioned route is an
operator-authorized `allowedStrings` entry (a gate-config change);
the pictured people are identifiable (faces, tattoos; companions in two
pairs), so each needs a written website-use release AND a HIPAA
marketing authorization; a weight-loss before/after gallery on a page
selling compounded GLP-1 vials beside an investigational product is the
content class FDA/FTC warning letters have targeted; and the images are
964–1290px, below the retina rule for a full-width slot. Recommended
path: ship the photo swap now and hold the section for counsel review
and the releases. **Operator decision: build it now under override.**
Two further confirmations were then obtained and are the record:
**(a) all five pictured people's website-use releases and HIPAA
marketing authorizations are on file (operator, 2026-08-21); (b) the
operator explicitly authorized the allowlist entry.** The SOW deferral
is the operator's document to amend; flagged, not drafted here.

**Flag 2 — the 23a sign:** the competitor-brand title (the 2026-08-18
precedent) now joined by a legible results-timing line; a crop that
removes the sign loses her head or her feet. Recommended a server-side
defocus of the sign region; **operator decision: ship as-is** — the
fourth photo-level override under the claims bullet. Release: the
InBody client's, confirmed on file 2026-08-18 (same person; the
operator did not correct the stated assumption).

**Decision — the gate.** `allowedStrings` gains the exact h2 source
line `## Before and After` (seventh authorization). Heading-wrapped for
the same mechanical reason as the fifth: the banned word is
string-initial, and the self-test's digit-prefix near-miss proof
(`1## Before and After` must still trip) needs the non-word `#`
boundary; the wrap also binds the exception to one attribute-less h2
source line. The `outcome-promises` pattern is untouched; the phrase
stays banned everywhere else in `src/` — alts, comments, identifiers,
and layout comments all say "pair" / "side by side" (verified by grep:
the heading line is the phrase's only occurrence). The self-test passed
with the entry in place.

**Decision — the page.**
- 23a re-derived from the master (the B9 precedent): sharp `.rotate()`
  (EXIF-normalize) → 1200×1600 (3:4 exact, no crop) → JPEG q92 →
  `inbody-weigh-in-rear.jpg`. Alt describes the scene only — no readout,
  no numbers. The 4:5 arch window would shed head or feet (head at
  ~1.5%, feet on the scale at ~98%) and the scale is the story, so the
  layout's per-image knob gets its first ASPECT use: `aspect-ratio:
  3 / 4` for this frame — the arch runs 6% taller and shows the full
  frame; dome and hairline unchanged.
- The section: `## Before and After`, one disclosure line ("Photos
  shared with the permission of Amy's clients. Individual results
  vary." — the minimum responsible framing for the override; passes the
  gate), then a `.pair-gallery` of three figures. Full frames, never
  cropped or arched (a dome would clip the faces in the top corners; a
  cropped pair is an altered pair): NOT `.media-figure`, so the arch
  rule never reaches them; the bare film frame's recipe (magenta
  hairline + 12px corners); stacked and centred at `min(30rem, 100%)`,
  which keeps every source at or above 2× (964px = 2.0×) — no retina
  override; tiers `[480, 960]` never upscale. Assets content-named
  `client-pair-couple.png`, `client-pair-friends.png`,
  `client-pair-portrait.png` (byte copies). Alts name people, setting,
  and clothing on the left and right — no numbers, dates, names, or
  the banned phrase.
- `supervised-weigh-in.jpg` removed (no other consumer; git history
  keeps it). `amy-palacios-fnp.jpg` (row 1) and the /services card
  untouched.

**Alternatives rejected:** holding the section for counsel and the
releases (recommended; operator chose to ship); a heading without the
banned adjacency (the client's wording was kept under the allowlist
route); a 3-up grid (each pair would render ~14rem — faces unreadable
and far below the retina rule); a full-width gallery (below the retina
rule at every source); defocusing the 23a sign (declined); cropping it
out (loses head or feet).

**Consequences:** the site carries before/after content for the first
time, on one page, in one section, under a recorded operator override
— any extension is a fresh flag. Constraint-3's claims bullet now
lists four photo overrides and this section; BUILD_SPEC §1, §7.1, §8.3,
§8.9 and compliance/README are amended in the same PR. The disclosure
line is copy the operator may reword; the alts and the "no numbers,
dates, names" rule are not negotiable without a new flag.

## 2026-08-21 — weight-loss round 2: the pairs section gets its real heading and intro; the seventh allowlist entry withdrawn

**Context:** Operator feedback on the PR #136 preview: "Before and
After" and the line "Photos shared with the permission of Amy's
clients. Individual results vary." were flat; the section needed copy
that is original, positive, and attention-grabbing. "Results" was
floated.

**Candidates offered (all gate-checked against the full registry and
the voice rule):** (1) "They showed up for themselves" — credits the
clients, not the clinic; (2) "Two photos, one story" — leads with the
format; (3) "Results" — the operator's suggestion, advised against: it
passes the gate as a bare word but is the regulator's trigger word for
an efficacy claim and the generic label every competitor uses. Each
came with an intro that does the old line's two jobs — consent ("chose
to share") and individuality ("no two of these look alike") — inside
the prose, and closes on the consultation route (the clinical-routing
word).

**Decision (operator):** heading **"They showed up for themselves"**;
intro: "Two photos, one story — and each of these is a client who chose
to share theirs. Different starting points, different plans, the same
decision to begin. Every plan Amy writes is for one person, so no two
of these look alike. Where yours would start is a consultation." No
banned word (no results/proven/guarantee/testimonial/permanent/best; no
before/after adjacency); no first-person plural; third-person Amy, the
site's established mode.

**The gate:** with the original heading gone, the seventh allowlist
authorization (`## Before and After`, entered earlier the same day)
had no consumer. An authorization nothing uses is a loophole, so the
entry was removed — a tightening, authorized by the operator's approval
of the round-2 plan (the registry rule: changing the list requires the
human operator). `$allowlistComment` keeps the paragraph and records
the withdrawal in place; the phrase is banned everywhere again, and
`git grep` finds zero occurrences in `src/`. The self-test passed
with the entry gone. The section's CONTENT override — the three client
pairs, the releases + HIPAA record — is unchanged.

**Consequences:** CLAUDE.md constraint 3, BUILD_SPEC §7.1/§8.3/§8.9,
compliance/README, CHANGELOG, CLINICIAN-SIGN-OFF, and REDESIGN name the
section by its heading and record the withdrawal. The intro is copy
the operator may reword; any future wording keeps consent,
individuality, and the consultation route, and never adds numbers,
dates, names, or outcome words.
## 2026-08-21 — laser-treatments: the priced menu, Venus Epileve laser hair removal, and photo round page 8

**Context:** Client direction via the operator, two messages the same
morning. First, three photo placements on /services/laser-treatments:
her pick 21a replaces the 2026-08-04 `venus-versa-pro.jpg` console
snapshot beside "What they are" (420×604 — the weakest asset left on the
site, 0.73–0.77× at DPR 2 in every slot); 21b joins "Fine lines" to the
right of its copy; 21d joins the page. Second, two Mobile Aesthetics
pricing flyers in `C:\Amy\New Pics` — `Laser_Hair.jpg` (Venus Epileve
"LASER Hair Removal" pricing guide) and `Venus_Versa_Pro.jpg` (Venus
Versa Pro pricing) — whose services and prices go on the page; the JPGs
do not. That resolves `{{VENUS_VERSA_MENU}}` (open since 2026-07-22) and
adds a FOURTH service to the line: Venus Epileve laser hair removal — a
true laser on a page whose copy has been careful that the Versa Pro is
IPL + RF, "close relatives of the laser."

**The flyers are view-only sources** (constraint-8 class — the
2026-07-22 brochure precedent): never committed, never linked; only
service names, areas, and prices transfer. The Versa flyer's marketing
copy — "minimal downtime and maximum results", "Safe and effective",
"clinically proven", the "Improves / Reduces / Tightens / Lifts" bullet
lists, "rosacea", "more youthful skin", the "BEST FOR:" blocks — is
prohibited §8 content and enters no file; the build is grepped for that
vocabulary (zero hits sitewide, case-insensitive). The flyer's
manufacturer marketing name for the fine-line applicator stays out of the
repo entirely (standing 2026-07-22 rule); the page's own name —
Multi-Polar RF + PEMF — titles that card.

**Screening (RUNBOOK "Replacing site photography", full resolution —
astro:assets serves the master as the `<img src>`):** all three picks
1067×1600 pro-shoot frames, SHA-256-unique against `src/assets/photos/`,
Amy alone in every frame — no release needed.
- 21a → `amy-versa-pro-console.jpg`: Amy standing beside the Venus Versa
  Pro console ("VENUS / VERSA PRO" legible on the chassis — the same
  logo the retired snapshot showed, so the 2026-08-04 naming basis
  carries forward), the Mobile Aesthetics neon (her own branding; the
  source frame truncates its right end), the treatment chair, the foot
  pedal. The console screen is IDLE — zero-percent and zero-time fields,
  an applicator icon, no treatment parameters. Three Venus applicator-tip
  cartons lie on the chair; "VENUS" and a pack-count word are soft-
  legible: consumable pack contents as sold, not a drug or energy
  quantity (the 2026-08-18 B3 Radiesse pack-marking precedent —
  screening note, no override; never restated in text).
- 21b → `versa-pro-applicators-chair.jpg`: Amy seated in the chair
  holding two Versa Pro applicators, the console left (same idle
  screen), the neon above, a second cart blurred in the background
  (unreadable). Clean.
- 21d → `amy-epileve-window.jpg`: Amy at the studio window, a handpiece
  in hand beside the chair's headrest — and the device is the Venus
  Epileve, a hair-removal laser, not the Versa Pro: "VENUS EPILEVE" is
  legible on the bezel, and the console's settings readout is legible at
  served resolution — fluence, pulse-duration, and speed values with
  their units. That is the dosing-class readout this log rejected
  outright on 2026-08-04 and carved out once, pixel-scoped, for
  `amy-pixel8-cart.jpg` earlier today.

**Flags raised, and the operator's decisions (two AskUserQuestion
rounds; the house rule: flag once, then execute cleanly):**
1. **21d ships AS-IS — operator override after the compliance flag.**
   The recommended compliant path — a crop bake from the master
   (≈688×860 4:5 window from the top of the frame: Amy, the handpiece,
   the headrest, the window light; the console, its readout, and the
   device name all below the crop; no override needed) — was declined,
   as was holding the slot for another frame. This is the **fifth
   pixel-level override and the second under the dosing bullet**
   (CLAUDE.md constraint 3; BUILD_SPEC §8.1; compliance/README). Fixed
   by the record: frame + page scope; no value from the readout is ever
   restated in text — copy, alt, comments, meta, JSON-LD. Because the
   page now describes the Epileve, the alt and filename may name the
   device (they do); the values never appear.
2. **Venus Epileve laser hair removal is a service Amy offers** (operator
   confirmation) — and the flyer supplies its first brief: areas,
   single and series prices. Recorded in BUILD_SPEC §7.12.
3. **Series prices ship WITH their counts** ("$574 for a series of six";
   NanoFractional "for a series of three") — the body-contouring
   unit-of-sale form (this log, 2026-07-20: a course "carries no
   frequency and no interval"). Count-keyed strings match no registry
   pattern, so **`compliance/banned-patterns.json` is untouched** — the
   "$350 for 10 threads" shape. The Epileve flyer's undiscounted
   "6 × single" column ($702 and so on) is arithmetic and is not shown;
   only the real series price ships. §7.12's "no session counts"
   exclusion gains the unit-of-sale carve-out. "How many treatments will
   I need?" stays consult-routed, with a sentence saying a series is a
   way to buy, not a prescription.
4. **Item names flyer-VERBATIM — operator override** of the §7.12
   exclusions for these menu item names only: "Isolated Lesion (up to
   3)" (the brief excludes "lesions"), "Under Eye & Brow Lift", "Eye
   Laxity", and the minute durations on the fine-line items ("Full
   Face, 30 Minutes Treatment" and so on — booking lengths as price
   keys; the body-contouring "~30–60 minutes" scheduling-fact
   precedent). The recommended paraphrases — "Isolated spots (up to
   three)", "Under-eye and brow", "Around the eyes", durations dropped
   — were declined. lint:claims has no pattern on any of these words
   (verified: only `safe and effective` among the flyer vocabulary is
   registered, and it never appears). Prices, areas, and package names
   verbatim too; the two package group headings are house-styled
   ("Women's packages" / "Men's packages").
5. **21d sits beside the NEW "Laser hair removal" section** (photo left
   of its copy — the recommended placement once the section existed);
   "Individualized, with Amy" returns to text-only.
6. **Laser hair removal is bookable directly on Vagaro.** Page-level
   `ctaType: consult` stays (the three Versa applications remain
   consult-first); the hair-removal section carries its own
   `<CTAButton variant="book" />` — solid "Book with Amy" → the standing
   Vagaro page, `book_click` — and the booking FAQ splits the two
   routes. No service-specific Vagaro link was supplied.

**Decision (the page):**
- `productDetails` carry the menu as `priceLines` on all four cards —
  the pattern on every priced line; `pricingDisplay: consult` stays as on
  every other priced page. NanoFractional: face / neck / face & neck,
  single and series of three. IPL: six areas. Multi-Polar RF + PEMF:
  four minute-keyed items. NEW card "Venus Epileve Laser Hair Removal"
  (tag "Laser"): the four area tiers, single and series of six. Four
  cards make an even 2×2 grid.
- Body, in order: row 1 (21a left) "What they are" + one sentence
  naming the Epileve as the page's one true laser → Skin resurfacing →
  Photo-rejuvenation (prose unchanged) → "Fine lines" as
  `media-row media-row--flip` (21b right) → NEW "Laser hair removal" as a
  `media-row` (21d left) — heading + one paragraph; BELOW the row,
  full-width, the area menu as a bold-lead-in list (the body-contouring
  list form — Tailwind preflight renders body lists bullet-less), the
  women's and men's packages, then the Book button → "Three tools, one
  conversation" + one sentence ("Laser hair removal is the simpler case:
  choose the area and book.") → "Individualized, with Amy".
- `summary`, `deck`, `products`, and the SEO title/description gain the
  Epileve ("Laser Treatments & Laser Hair Removal in Harrisburg, NC");
  the first FAQ ("Is this actually a laser?") now answers "Partly" and
  names the exception. The /services menu-card summary
  (`src/lib/serviceLines.ts`) gains "plus Venus Epileve laser hair
  removal" and the Pro name.
- Crop (default 30% anchor; measured from the masters, then eyeballed at
  390 and 1280 on the built page): 21a — head ≈230, neon 190–330, logo
  ≈1130, cartons ≈880, all inside the 80→1413 window; the arch dome
  clips the neon's right tail (inherent — Revanesse/19a precedent).
  21b — head ≈300, neon 150–250, shoes 1100–1330, logo ≈1130; the dome
  grazes the neon's last letters. 21d — head ≈200, handpiece 480–720,
  readout 905–1230, bezel name ≈1190; all inside. **No per-image anchor
  override needed; TreatmentLayout is untouched.** `widths`
  `[340, 540, 680]` on all three rows (the page's old `[340, 420]` was
  source-bound below delivery resolution).
- `venus-versa-pro.jpg` had no other consumer → removed; git history
  keeps it (and 21a shows the same Pro logo it documented).
- `clinicianApproved` true → false — approved content edited
  (constraint 4: pricing, a new section, a rewritten FAQ answer, three
  photos). Amy re-reviews on the PR preview — prices AND photos; the
  flag returns in the consolidated pre-relaunch round.

**Alternatives rejected:** the crop bake for 21d (recommended; declined
— the client's frame ships untouched); a defocus bake (would still leave
the device name and the hair-removal implication, which the new section
now resolves anyway); paraphrased item names (declined — flyer-verbatim);
single-only pricing (loses the packages Amy printed); a separate
hair-removal page (the operator said "edit the page"); a `PriceList`
component or a markdown table (the cards already carry prices sitewide;
tables are unstyled under preflight).

**Consequences:** the dosing bullet now carries two pixel-scoped
exceptions, each fixed to its frame and page — any future readout frame
is a fresh flag, not a precedent. `{{VENUS_VERSA_MENU}}` resolves. The
"Laser Treatments" line carries an actual laser for the first time, so
the 2026-07-22 naming flag is half-moot; the page's physics sentences
stay exact. The flyers stay where they are, uncommitted.

**Addendum, same day — round 2: the price sheet.** The operator's
preview review of PR #135: the hair-removal prices were "VERY difficult
to read" as a bold-lead-in prose list, and the page had dropped two
things Amy's guide states — the undiscounted FULL SERIES (6 treatments)
column and the ~15% discount framing of the third column. Direction:
every price as her guide lists it, three columns if that is what it
takes. Decision: a new zero-JS `PriceSheet` component
(`src/components/PriceSheet.astro`) renders the guide as a ledger —
title, an aria-hidden header row of tracked caps ("Single" / "Full
series · 6 treatments" / "Full series · ~15% off"), three groups
(Treatment areas · Women's packages · Men's packages), ten rows, thirty
prices, every name and area verbatim. Desktop (≥ 40rem): name + area
note left, three fixed-width right-aligned tabular columns; the
discounted column carries weight 600 and the in-box ink-pink accent
(4.60:1 on the card plate — the operator-accepted pair; everything else
ink-900 at 11.80:1). Phones: the same DOM stacks — name, note, then a
three-up strip with each price under its own small label, prices pinned
to a shared baseline. Each price is a real `<dt>`/`<dd>` pair (labels
visible on phones, sr-only on desktop), so assistive tech hears
"label, price" per item at every width — no pseudo-element text, no
`display: contents`, no table-role gymnastics; real text on an opaque
plate, so axe audits it. A footnote states the unit of sale ("A full
series is six treatments; the discounted series is about 15% off six
singles") and keeps the routing ("decided with Amy"). This REVERSES the
earlier call above that the undiscounted column was "arithmetic, not
shown": it is shown, as printed. The Epileve product card de-duplicates
to two lines (single prices by tier; "Full series of six: about 15% off
— full price sheet below") — it had repeated the same four long lines
at the top of the page. Sheet data lives in the MDX as a JSX literal
(audit trail; no schema change). Alternatives rejected: a `<table>`
(stacking it on phones needs `display: block` on table parts, which
strips table semantics unless every cell carries redundant ARIA roles);
a markdown table (unstyled under preflight, no responsive story);
pseudo-element `data-label` captions (unauditable text). Follow-up
option, not done: the same sheet for the NanoFractional single /
series-of-three prices. Verified at 344, 390, and 1280 — no horizontal
overflow; all thirty figures present in the built page.

**Addendum 2, same day — round 3: hierarchy.** On the round-2 preview
the operator saw that the group headings ("Women's packages", "Men's
packages", "Treatment areas") and the item names beneath them shared
one size and weight (1.0625rem / 600) and read as peers. The sheet now
carries a three-level ladder, CSS only: title 1.375rem/600 → group
heading 1.125rem/600 in ink-pink over an ink-pink rule (4.60:1 on the
card plate — the operator-accepted in-box pair) → item name 1rem/500,
indented under its heading (1rem on desktop, 0.75rem on phones) → area
note 0.875rem. Prices keep 1.0625rem so the figures still lead the row.

**Addendum 3, same day — the "name Amy uses on her menu" clause.** The
operator struck it from both places it appeared ("What they are" and the
first FAQ answer): it read as if Amy had coined the category name, when
"laser treatments" is simply what this family of light- and energy-based
work is called. The physics sentences — the 2026-07-22 mitigation for
the line title — stay exactly as they were; only the attribution clause
goes. Two other pages describe Amy's menu in a different sense
(body-contouring: "Amy lists it on her menu exactly as…"; iv-therapy:
"Amy's menu is short and named plainly") — reported to the operator,
not changed here (approved content; edits reset flags).

## 2026-08-22 — peptide-therapy: the "Delivered, and always supervised" section is removed

**Context:** Amy flagged the section on `/services/peptide-therapy`, naming
"always supervised" as the likely problem. Reading the page turned up three
faults, of which the headline was only the most visible. First, the page said
"supervised" **seven** times — the lead paragraph (frontmatter `summary`, which
`TreatmentLayout` renders under the H1), the SEO description, "What it is", this
heading, this paragraph, an FAQ question, and the closing line. Second, the
section's last clause — "never something you sort out on your own" — was aimed
at gray-market peptide buyers but landed on whoever was reading; it was the one
sentence on the page that did not sound like Amy. Third, "supervised" implies
someone else does the work while Amy watches, which is both inaccurate (the
page's own FAQ said "Every visit is with Amy herself") and, faintly, a
delegation model — the wrong signal under constraint 2. Structurally it was also
the only `h2` on the site whose subject was governance rather than the treatment
or the visit, against siblings like "It starts with labs" and "What a visit
looks like". Its content was almost entirely duplicated: route-of-administration
appears in the FAQ nearly verbatim, supervision in five other places. Its only
unique contribution was the word *prescription*.

**Decision (operator, after the options were laid out):** delete the section
outright and relocate the prescription fact into "What it is", where
`wrinkle-relaxers` and `weight-loss-glp-1` both state it — scoped to "the ones
Amy offers", which is narrower than the deleted blanket "Peptides are
prescription treatments" and therefore a reduction in exposure, not an addition.
The detailed subcutaneous/IV split stays in the FAQ, which already owns it, and
was deliberately not folded back into the body. The word is swept out of the
body copy, the FAQ question ("Who supervises peptide treatments?" → "Who gives
the treatment?"), and the lead paragraph; the SEO description keeps
"clinician-supervised" and the deck is untouched. The closing line joins the
house sentence six other treatment pages already carry — "plans and gives every
peptide treatment herself", cf. `iv-therapy`'s "administers every infusion and
every shot herself". Peptide-therapy and weight-loss-glp-1 were the only two
pages saying "supervises"; on the GLP-1 page that framing is appropriate and
stays. The stock "under clinician supervision" phrase was **not** added — it was
not on this page before, and `iv-therapy`, the closest sibling, does not carry
it either. Net: `supervis-` goes from seven occurrences to one.

**Alternatives rejected:** replacing the section with the process section this
page actually lacks ("What a plan looks like" — it says "decided with Amy" four
times but never says what happens); a minimal retitle-and-trim to "How peptides
are given", which fixes the headline but leaves the section duplicating the FAQ
answer word for word; a whole-page sweep including the deck and the SEO
description (the description earns its keep in search, and the deck's "always
within a plan" carries no supervision connotation). Also rejected: inventing a
labs step to give the page back its fourth section — no such business fact is on
file.

**Consequences:** this partly reverses the enrichment recorded above on
2026-07-21, which added the section after the operator flagged the page as too
thin; the operator accepted that trade-off with the section count in front of
them. The page drops from four body sections to three, still within house norms
(`regenerative` has three), and keeps its nine priced product cards and five
FAQs. `clinicianApproved` reset to `false` (constraint 4 — approved content
edited), so the production gate blocks this page until Amy re-approves on the
preview; treatment flags now read 4 true / 8 false. The 2026-07-21 entry still
describes the section — that log is append-only, and this entry supersedes it.
Verified: build, `astro check` (0/0/0), `lint:claims`, `lint:voice`, pa11y
24/24, Lighthouse budgets.

## 2026-08-23 — /services intro: the third service category becomes "Wellness"

**Context:** Client direction (via the operator, 2026-08-23): in the `/services`
lead, sentence 2 listed three service categories, and she wants the third one —
a trailing "all things … oriented" modifier naming peptides — replaced with the
single word "Wellness". Sentence 2 is client-verbatim copy recorded on
2026-08-18, so the change is a deliberate departure from her own earlier
wording, at her request.

**Decision:** sentence 2 now reads "From Facial Balancing to Weight Loss & Body
Contouring to Wellness, Amy has your best self in mind." Three parallel
capitalized categories replace two plus a trailing modifier. "Wellness" is
already house vocabulary (`/about` uses it for the same grouping) and is clean
against all six banned categories, so the registry is untouched.

Allowlist entry #6 — the exact fragment "Amy has your best self in mind" — is
**unchanged and still in use**, so the 2026-08-21 withdrawal precedent (an
authorization nothing uses is a loophole) does not apply. Its editing rule is
what shaped the edit: stripping is per-line and case-sensitive, so lines 74–76
were rewrapped to keep the fragment whole on one source line. The in-page
comment's "verbatim" claim was amended in the same commit to stay an accurate
audit trail; `compliance/banned-patterns.json` and CLAUDE.md needed no edit —
the exception's scope ("the /services intro lead only, on one source line")
remains exactly true.

**Alternatives rejected:** keeping the client's idiom as "to all things
Wellness" (smallest delta, but preserves the phrasing she asked to lose); ending
the sentence at "Wellness." and dropping the "best self" tail — a larger change
that would also have required withdrawing allowlist entry #6, and she did not
ask for it.

**Consequences:** the 2026-08-18 entry above still quotes the original sentence
— that log is append-only, and this entry supersedes its "verbatim" framing for
that one list item only. No treatment content is touched, so no
`clinicianApproved` flag moves (flags still read 4 true / 8 false) and the
production approval gate is unaffected. `/services` remains the only page
rendering the allowlisted `best` fragment. The demo and review preview branches
will not show this until `phase-c` is merged into each. Verified: build, `astro
check`, `lint:claims`, `lint:voice`, pa11y 24/24, Lighthouse budgets.

## 2026-08-23 — wrinkle-relaxers: the lead and deck copy round (a flag that did NOT become an override)

**Context:** Client direction (via the operator, 2026-08-23) for the two copy
blocks that open `/services/wrinkle-relaxers` — the `summary` lead and the
`deck` statement card, which `TreatmentLayout` renders in that order directly
under the H1. (1) The lead should stop saying "creases". (2) The deck's single
line is replaced wholesale with her new wording, which names three treatment
areas and closes with a promise verb addressed to the reader.

**The flag.** The closing half of her deck sentence was an outcome promise —
CLAUDE.md constraint 3, BUILD_SPEC §8.3 — and three things made it sharper
than the usual copy flag. It promises a named result on named areas in the
SECOND PERSON, where every prior override of this rule (regenerative and
peptide cards, both 2026-08-01) covered a product *description*. It implies
the lines go and stay gone, on the one page carrying no duration hedge since
"temporary/temporarily" came off all six occurrences (2026-07-30 — an entry
that already recorded the risk profile ticking up), and where "permanent" is
itself a banned pattern and longevity is deliberately routed to the consult
(biostimulators, 2026-07-21). And its "11's" is the vocabulary of the Jeuveau
banner in this page's own band photo, which ships under a pixel-level override
(2026-08-18) resting precisely on the fact that the site's own copy never says
it — so the sentence would have converted photographed third-party marketing
into a first-party claim, beside the photo it came from.

Verified first-hand against all six categories in
`compliance/banned-patterns.json`: **the sentence trips no pattern.**
`lint:claims` would have passed it. This was judgment-level, exactly like the
2026-08-01 overrides — not a gate catch.

**Decision (operator, from three options with previews):** the COMPLIANT
REWRITE, not an override. The deck now reads "A light, deliberate hand for
those lines repeated expressions leave behind — crow's feet, "11's", and
frown lines." Her opening clause and all three named areas survive verbatim;
only the promise verb is gone. **This is the round's first compliance flag to
resolve without an override**, and the consequence worth recording is a
negative one: there is NO `allowedStrings` entry, NO CLAUDE.md exception, and
NO BUILD_SPEC amendment to lean on here — the registry is untouched and a
future session must not read this entry as authorizing the drafted wording.
The lead became "…soften dynamic lines: the ones that come from repeated
expression" (operator's pick over the literal creases→lines swap, which would
have said "lines" twice in one sentence).

**Alternatives rejected:** shipping her wording verbatim under an override —
the drafted second sentence, recorded here for the audit trail because this
log is the only place it survives: "Wave good-bye to your crow's feet, "11's",
and frown lines!" (offered explicitly, declined); a two-sentence compliant
variant keeping her
exclamation ("softened, with movement kept" — offered, declined); the literal
one-word swap in the lead (offered, declined); changing the second "creases"
in the body's "What they are" (offered as an out-of-scope tidy, declined — the
word survives once on the page, and nowhere else on the site).

**Consequences:** `summary` feeds the Service JSON-LD description via
`[slug].astro`, so the lead edit reaches structured data — confirmed
claims-clean in the built output. `deck` is layout-only and reaches no meta,
OG, or JSON-LD — verified by grep on the built page, the same discipline the
Laurel ranking claim is held to. The em dash is this paragraph's only one and
introduces a gloss (2026-07-29 budget: earned, within budget).
`clinicianApproved` was already `false` (2026-08-18 Evolus-plate move), so
nothing reset; flags still read 4 true / 8 false and the page rides the
consolidated pre-relaunch re-approval. `src/lib/serviceLines.ts` carries a
shorter menu summary without "creases" — unaffected. Verified: build, `astro
check`, `lint:claims`, `lint:voice`, pa11y 24/24, Lighthouse 7 URLs x 3 runs.

**The generalizable lesson, and a gap PROPOSED for the operator (not
edited).** The hazard this round was neither the photo nor the copy alone: it
was the two IN COMBINATION, and no gate can see either half. `lint:claims`
cannot read the banner in `jeuveau-banner-studio.jpg`, and it could not have
caught the drafted sentence either (verified — no pattern matches). The
standing rule this produces, recorded for whoever edits this page next: **on
/services/wrinkle-relaxers, any copy naming treatment areas must be read
against that photo before it ships.** The pixel override and the page's text
are one surface, not two.

Which exposes a real asymmetry in the exception records, surfaced by the
concurrent session reviewing this page's overrides: the two dosing-bullet
pixel overrides (`amy-pixel8-cart`, 2026-08-21; `amy-epileve-window`,
2026-08-21) each carry an explicit never-restate-in-text clause naming copy,
alt, comments, meta, and JSON-LD — but the `jeuveau-banner-studio` entry
(2026-08-18, claims bullet) records only that the banner vocabulary is
legible. It has no such clause, and this round is precisely the case such a
clause exists to prevent. **Recommendation to the operator: add the same
never-restate clause to the jeuveau entry in CLAUDE.md constraint 3.** Not
done here — governing-doc edits are operator-gated, and a peer session's
agreement is not that authorization; this paragraph is the traceability
bridge until the operator rules (the 2026-08-14 carousel-JS precedent). If he
declines the amendment, this entry remains the only written form of the rule.

**Addendum, same day — round 2: the body copy.** Client direction for three
more strings on the same page, carried on the same PR so Amy reviews one
preview rather than two (the 2026-08-15 split-preview lesson). (1) Under "Not
just for women", "gendered" becomes "gender defined" — shipped unhyphenated
exactly as dictated, per the house verbatim precedent (this page's own title
carries a client hyphen the same way). The FAQ answer carried a near-verbatim
echo of that sentence, and the operator chose to change BOTH: they are a
matched pair — the FAQ answers the point the section makes — unlike the two
"creases" of round 1, which he deliberately left divergent. Page now reads
"gendered" nowhere. (2) In the same paragraph, "lines they'd rather soften"
becomes "lines they'd rather not see". **Flagged once and shipped as
directed:** "soften" is this page's label-mirroring verb (what the products
are labeled to do), and "not see" leans toward absence on the one page
carrying no duration hedge since 2026-07-30 — but it describes the client's
WISH rather than the treatment's result, which is why it stands rather than
becoming an override. It trips no pattern; nothing was added to the registry.
(3) "Individualized, with Amy" takes her replacement paragraph, which drops
"There is no standard plan here." and adds "Your trust is well placed when you
walk through the doors!" — provider puffery, clean against every category, in
the register of the client-verbatim /services intro.

**The supervision clause: flagged, and KEPT at the operator's direction.** Her
drafted paragraph omitted "under clinician supervision", so the research is
recorded here because the question will recur. No gate requires the phrase:
`lint-claims.mjs` carries exactly three inverse checks — investigational
disclosure, Retatrutide, and Biote symptom vocabulary — and none touches
supervision. BUILD_SPEC §7 does name it ("individualized under clinician
supervision") but as a BEAT in the copy pattern, not a mandated string: only
four of twelve pages carry the literal words, three carry no supervision
language at all (hormone-optimization, iv-therapy, skincare), and the
2026-08-22 peptide-therapy entry reasoned exactly this way when it cut
`supervis-` from seven occurrences to one. Dropping it would therefore have
been defensible and gate-clean; the operator chose to keep it, so the page
holds at one occurrence. Recorded so a future session does not read the
peptide precedent as licence to sweep the phrase off this page too.

Round-2 consequences: no JSON-LD fan-out this time — only `title` and
`summary` reach structured data via `[slug].astro`, and FAQPage JSON-LD is
still deferred to Phase D, so body and FAQ prose render to HTML only. No
registry change, no allowlist entry, no CLAUDE.md or BUILD_SPEC edit. The em
dash in "Not just for women" is the paragraph's original one and the new
paragraph adds none (2026-07-29 budget). `clinicianApproved` was already
`false`, so nothing reset; flags stay 4 true / 8 false. Noted in passing, not
a regression: MDX smart-quotes body prose (`aren’t`, U+2019) while frontmatter
strings keep straight apostrophes, so this page renders both forms — true of
every treatment page since C3, and unchanged by this round. Verified: build,
`astro check`, `lint:claims`, `lint:voice`, pa11y 24/24, Lighthouse 7 URLs x 3
runs.

## 2026-08-24 — wrinkle-relaxers deck: the flag becomes an operator override (SUPERSEDES the 2026-08-23 "did NOT become an override" entry)

**Read this entry alongside 2026-08-23 above.** That entry's heading is now
stale by one day: the flag it records as resolved *without* an override was
overridden here. Its analysis stands in full and is not repeated; only its
outcome changed. DECISIONS is append-only, so the correction lives here.

**Context:** Round 3 of the same client copy round on
`/services/wrinkle-relaxers`, and the narrowest one — a single frontmatter
field, `deck`, the blush statement card `TreatmentLayout` renders under the
lead. The operator returned to the wording flagged on 2026-08-23, restored it,
and extended it to say where the areas sit. The deck now reads:

> A light, deliberate hand for those lines repeated expressions leave behind.
> Wave good-bye to your crow's feet, "11's" between your eyes and forehead
> frown lines!

**The flag was raised once, on 2026-08-23, and is not re-argued** (CLAUDE.md:
flag once, then execute cleanly). Everything in that entry applies unchanged:
a named result promised on named areas in the second person, where every prior
outcome-promise override covered a product *description*; on the one treatment
page carrying no duration hedge since 2026-07-30.

**What is new, and was reported before building.** The combination hazard
recorded on 2026-08-23 as a risk is now realised. The band photo on this page,
`jeuveau-banner-studio.jpg`, ships under a pixel-level override (2026-08-18)
whose stated premise is that the banner's marketing headline is legible *but
the site's own copy never says it*. The banner reads "KISS YOUR 11s GOODBYE".
The deck now reads "Wave good-bye to your ... '11's'" roughly a screen above
it. That is a near-paraphrase of photographed third-party marketing, adopted
as first-party copy, on the same page — which removes the one premise the
2026-08-18 override rested on. Round 2's rewrite kept the area name and
dropped the claim, so the echo was vocabulary only; this restores the claim.
The operator was shown this, in these terms, and directed the change anyway.

**Decision (operator override, 2026-08-24):** ship the client's wording
verbatim. Scope is exact and does not travel: **this string, in the `deck`
field, on `/services/wrinkle-relaxers`, and nowhere else.** The vocabulary is
never restated in body copy, FAQ answers, alt text, meta descriptions, OG
tags, JSON-LD, or source comments. Widening any of that requires the human
operator. Verified in the built output: one occurrence, on one page, absent
from `<meta>` and from every JSON-LD block (only `title` and `summary` fan out
to structured data via `[slug].astro`).

**Registry consequence — the same negative result as 2026-08-23, now pointing
the other way.** Re-verified first-hand against all six categories in
`compliance/banned-patterns.json`: **the sentence trips no pattern**, and
`npm run lint:claims` passes (self-test: 6 categories). So there is **no
`allowedStrings` entry** — nothing to allow, because nothing is caught. The
authorization for this text lives in this decision record and nowhere else,
the same shape as the EvolusLaurel ranking sentences (2026-08-19), which are
authorized here rather than in the registry for exactly this reason. A future
session must not infer from a green linter that this wording is
self-authorizing, and must not read the 2026-08-23 entry's "no override"
finding as current.

**CLAUDE.md consequence — APPLIED same day, operator-authorized.** Constraint 3's
outcome-promise exception list enumerates every scoped override of this rule;
this one belongs on it and is not there, because governing-doc edits are the
operator's alone. Recommended sentence, for the operator to place or decline:

> *And the exact `deck` sentence "Wave good-bye to your crow's feet, "11's"
> between your eyes and forehead frown lines!" on /services/wrinkle-relaxers
> only (operator override after the compliance flag — DECISIONS 2026-08-23 and
> 2026-08-24; the compliant rewrite was shipped 2026-08-23 and reversed
> 2026-08-24). It contains no token lint:claims can see, which is why the
> authorization is recorded in DECISIONS rather than `allowedStrings`. The
> wording is exact and the page scope fixed; the vocabulary is never restated
> in copy, alt, comments, meta, OG, or JSON-LD.*

Still open from 2026-08-23 and now more pointed: the same photo's 2026-08-18
override lacks the never-restate-in-text clause that `amy-pixel8-cart` and
`amy-epileve-window` both carry. Had it carried one, this change would have
contradicted it in writing rather than only in premise.

**Verbatim handling.** "good-bye" keeps the client's hyphenation and the area
list keeps her punctuation, un-comma'd, under the house verbatim precedent
(the page `title` carries a client hyphen the same way). The value stays on
ONE source line with the inner quotes backslash-escaped — folding a
double-quoted YAML scalar would alter the text. The double space she typed
after the first sentence collapses in HTML and is written as one.

**Approval.** `clinicianApproved` was already `false` (since 2026-08-18);
nothing to reset. Amy reviews this text with the rest of the round; the
sign-off row is extended.

**Addendum, same day — the CLAUDE.md exception was applied.** The operator
authorized the constraint-3 edit and it is in this PR: the outcome-promise
exception list gains the deck sentence, placed last, immediately before its
"Nothing else; extending any of these requires the human operator" close.
Three deliberate departures from the sentence drafted above, all recorded so
the difference is not read as drift:

1. **The string is enclosed in backticks, not quotes.** Every other entry on
   that list quotes its exact string with double quotes; this one contains
   double quotes, so nesting them would have made the boundaries of the
   authorized text ambiguous — which is the one thing an exactness clause
   cannot afford. Code formatting fixes that without changing a character.
2. **The never-restate clause was corrected.** The draft said the vocabulary
   is "never restated in copy" — self-contradictory, because the deck *is*
   copy. Shipped wording: never restated anywhere else — body copy, FAQ
   answers, alt text, comments, meta descriptions, OG tags, or JSON-LD.
3. **A coupling note was added** pointing whoever edits either half at the
   band photo's 2026-08-18 pixel override, since the banner headline this
   sentence paraphrases is legible in the served file. It is a pointer, not a
   new authorization: it changes nothing about what either override permits.

Note what this edit does **not** do. It does not add the never-restate-in-text
clause to the `jeuveau-banner-studio.jpg` pixel override itself — that override
is still the only one of the three lacking the clause `amy-pixel8-cart` and
`amy-epileve-window` both carry. The operator authorized the outcome-promise
sentence, and that is what was written. The gap stays open and stays theirs.

`compliance/banned-patterns.json` is untouched, and `lint:claims` is green
after the edit — expected, since the linter scans `src/` and CLAUDE.md is not
in it. Nothing about the gate changed.

**Addendum, same day — the documentation sweep before merge.** The operator
authorized updating whatever documentation the round required. What was found
stale, and what was done:

- **BUILD_SPEC §8.3** — the outcome-promise rule carries an exception list
  parallel to CLAUDE.md constraint 3, and it did not have this override. Added,
  with the note that no prior entry on that list covers it: the two film
  exceptions carry the manufacturer's or Amy's own published content, and the
  photo-pairs exception is imagery. This is the list's first exception for
  first-party marketing prose.
- **`compliance/README.md` — a factual correction.** Its media-blindness
  section described the three 2026-08-18 pixel overrides as covering "text the
  site's own copy could not say." That is now false for the wrinkle-relaxers
  frame and the sentence was corrected in place, with a caveat paragraph
  stating the general lesson: **a pixel override's premise can expire**, and a
  premise about what the copy says is a constraint on the copy that nothing
  enforces. Whoever edits copy on such a page must read the premise, not the
  verdict.
- **`compliance/README.md` — a new section, "Authorizations the registry does
  not hold."** The sharper gap this round exposed. A reader who audits
  `allowedStrings` to learn what ships under override will under-report,
  because text that is non-compliant on the merits but matches no pattern never
  reaches the allowlist — the linter is already green on it. That class now has
  two members (the EvolusLaurel ranking sentences, and this deck sentence) and
  had no home in the tooling docs. Stated plainly there: a green `lint:claims`
  is not evidence a string is authorized, and an empty `allowedStrings` search
  is not evidence it is unauthorized.
- **`docs/RUNBOOK.md`** — both lessons condensed into step 1 of "Everyday
  changes", which is the procedure people actually follow, with pointers rather
  than a restatement.
- **`docs/REDESIGN.md`** — a tracker row for the copy round, all three passes,
  carrying the override, the empty-registry consequence, and the retired
  premise.

**Deliberately not touched.** `docs/PHASE-C.md`, which declares itself the
closed historical Phase C record and routes post-launch work to REDESIGN —
adding to it would contradict its own header. `docs/RELAUNCH.md`, whose copy
precondition is `check:approvals`, unaffected. `compliance/banned-patterns.json`,
untouched all round: nothing was allowlisted, nothing loosened, and the list
still only ever grows.

**What is still not done, and is still the operator's:** the
`jeuveau-banner-studio.jpg` pixel override in CLAUDE.md gains no
never-restate-in-text clause here. The documentation now says in four places
that the clause is missing and why it matters, which is the most a session can
do without authorization to write it.

## 2026-08-24 — VisitSteps step 2: a one-sentence change that was not where it appeared to be

**Context:** Client copy direction (via the operator) for the closing sentence
of "Personalized plan", the second step of "Your visit, step by step". From
"Together you decide what, if anything, comes next." to **"Together with Amy,
you decide what comes next."**

**The finding that changed the task.** The sentence was pointed at on
`/services/wrinkle-relaxers`, where it does render — but it is not in that
page's MDX. It lives in `src/components/VisitSteps.astro`, which
`TreatmentLayout` renders on **all twelve treatment pages** plus the
styleguide. A single grep confirmed one copy in the repo, no spec, no test, no
snapshot. What read as a thirteenth edit to one page was a sitewide copy
change, and it was surfaced as such before any edit. Recording it because the
failure mode generalises: **on this site, a sentence a page displays is not
necessarily a sentence that page owns.** Four of the twelve pages it now
changes are clinician-approved.

**Three operator answers, all taken before building:**

1. **Sitewide.** The alternative — a page-scoped override — needs a prop on
   `VisitSteps`, a pass-through in `TreatmentLayout`, and a `content.config.ts`
   field: more machinery than the sentence, and this file already rejected a
   comparable page-scoped variant (2026-08-21) as visibly inconsistent between
   treatment pages a visitor may compare.
2. **The wording ships exactly as dictated**, hedge dropped.
3. **The four approved flags stay `true`.**

**The flag, and why it did NOT become an override.** Dropping "if anything"
removes the only note in the four-step sequence that allows for *no* treatment
— steps 3 and 4 are "Treatment visit" and "Aftercare guidance", so the list
otherwise reads end-to-end as a treatment path. That hedge was doing real work.
But this is drift, not a rule break: BUILD_SPEC §8.7 requires suitability to
route to a consultation, and the new sentence names Amy as co-decider, so the
routing survives intact. The component's header comment — "routes decisions to
the consultation" — remains accurate and was left alone. Verified against all
six categories: **the sentence trips no pattern**, and `lint:voice` is clean
(no first-person plural; no standalone "us"). So, like 2026-08-23 and unlike
the deck the same week: **no override, no `allowedStrings` entry, no CLAUDE.md
or BUILD_SPEC amendment.** `compliance/banned-patterns.json` is untouched. A
future session must not read this entry as authorizing anything.

Two consequences worth recording. Naming Amy is a small *gain* — the outgoing
sentence's bare "Together" never said with whom. And the idiom is not retired
sitewide: `dermal-fillers.mdx` still carries "what, if anything, to place",
verified still rendering after this change; only this instance moved.

**Approval handling.** `check:approvals` reads only
`src/content/treatments/*.mdx` frontmatter, so a component edit resets nothing
mechanically — the gate cannot see this change at all. The operator chose to
leave the flags, consistent with 2026-08-21 ("one shared change, zero MDX edits
elsewhere, zero flag resets"). Flags stay **4 true / 8 false** and relaunch
precondition 2 is unaffected. The gap this leaves is real and is closed by
documentation rather than by the gate: CLINICIAN-SIGN-OFF now carries the new
step text as a cross-cutting item, so Amy reviews words that changed on four
pages she has already signed off.

**Verification.** `npm run verify` green. The new sentence renders exactly once
on each of the twelve treatment pages and the styleguide (13/13); the outgoing
string returns zero across all of them.

**Addendum, same day — the rest of the batch (steps 3, two FAQ answers, and
the layout).** Four further client copy directions, batched at the operator's
choice so Amy reviews one preview rather than five, each committed separately
to keep the audit trail one-change-per-commit.

1. **VisitSteps step 3** — "Confidently book your appointment when you are
   ready." (adverb added; second sentence unchanged). Sitewide, like step 2.
2. **wrinkle-relaxers FAQ, "Do men get neurotoxin treatments?"** — "Yes.
   Expression lines are not gender based…" The body copy under "Not just for
   women" was **deliberately left** at "aren't gender defined": the operator
   was shown the resulting mismatch and chose the FAQ alone, reversing the
   matched-pair call made for this same wording on 2026-08-23. The page now
   states the idea two ways on purpose. A future session must not sync them.
   "gendered" remains absent, which was the point of the earlier change.
3. **wrinkle-relaxers FAQ, "Do I need a consultation before booking?"** — "No.
   A consultation is never required; however, one is free upon request." Drops
   "Book directly, or ask to talk it through first." Small consistency gain:
   "free upon request" now matches TrustChips' operator-confirmed "Free
   consultation upon request" (2026-07-29) exactly.
4. **`TreatmentLayout`** — the pricing line deleted, the consult router
   reworded. See below; this is the one with consequences.

**The layout change, and why it is compliant.** After it, the consult router
card carries no form of the word "consultation": the heading is "The right fit
is just a conversation away.", the subline is "Every plan is personal, decided
between you and Amy.", and `CTAButton variant="consult"` has read "Book with
Amy" since 2026-07-21. The deleted pricing line was the card's other
consultation mention. That reads alarming and is not: **BUILD_SPEC §8.7 routing
is carried by `DisclaimerBlock`**, which renders immediately below the router
card, states that whether a treatment fits your needs is decided with Amy
during a consultation, is layout-injected, and cannot be opted out of
(CLAUDE.md constraint 3). Verified in the built output on all twelve pages.
The router card is marketing microcopy sitting above the gate, not the gate.
This is recorded because the analysis is non-obvious and someone will re-derive
it: a comment in the layout now states it, and warns against "aligning"
`DisclaimerBlock` to the card's new tone. **Weakening that component is the one
thing this change must never license.**

**`pricingDisplay` is now inert.** No enum value renders anything, so `none`,
`consult` and `startingAt` are indistinguishable on the page; ten of the twelve
content files set `consult`. The field, its schema enum, the `Props` entry and
the `[slug].astro` pass-through were all **left in place** so restoring the
line is a one-line change — removing them is a schema change across twelve
content files and is the operator's call, not a cleanup to do unasked. The
now-unused destructure was dropped because it introduced a `ts(6133)` warning
that had not been there; `astro check` is back to 0/0/0. The layout's
documented compliance order no longer lists a pricing step, because it no
longer renders one. Consumer note, not a rule: ten pages show product prices
and the caveat that pricing is individual is now gone from all of them.

**The cumulative observation, closed.** Flagged once at step 3 and not
re-argued since: across today's edits the treatment pages moved consistently in
one direction — step 2 lost the hedge allowing for no treatment, step 3 gained
"Confidently", the consultation FAQ lost its talk-first invitation, and the
router card lost the word "consultation" entirely. **Every one of these is
individually compliant and none trips a pattern**, and the §8.7 gate is intact
in `DisclaimerBlock` on all twelve pages. The direction is the client's to set
and the operator confirmed each step. It is recorded here as a trend line
rather than a defect, so that the *next* trim to consultation or optionality
language is evaluated against where the pages now stand and not against where
they stood this morning.

**Registry and governing docs: untouched, all four changes.** No
`allowedStrings` entry, no CLAUDE.md or BUILD_SPEC amendment, no pattern added
or loosened. `npm run verify` green.

**Addendum, same day — one-word correction to the router subline.** The
subline shipped in this batch as "Every plan is personal, decided between you
and Amy." and was corrected at the client's direction to "Every plan is
**personalized**, decided between you and Amy." before merge, so nothing but
the preview ever carried the first wording. Same scope — the layout, all twelve
pages. It trips no pattern and needs no allowlist entry. Small side effect
worth noting: the subline now echoes the "Personalized plan" step title above
it, which reads as deliberate rather than repetitive. The paragraphs above are
left as written, per this file being append-only; `docs/CHANGELOG.md` and
`docs/CLINICIAN-SIGN-OFF.md` were corrected in place instead, the latter
because Amy reviews from it and must see the current text.
## 2026-08-24 — the relaunch guard could never report, so every PR into `main` was blocked

**Context:** Restoring the Xtend-AI credit to the production placeholder
(PR #144) hit a wall: the PR is `mergeable: MERGEABLE` but
`mergeStateStatus: BLOCKED`, permanently. Investigation found a required status
check that no workflow on `main` can produce. This is not specific to that PR —
**no PR into `main` could pass through the normal flow**, which means production
had no hotfix path at all.

**Two independent defects.** They must be read together; fixing either alone
changes nothing useful.

**A — the blocker.** `.github/workflows/relaunch-guard.yml` exists only on
`phase-c`. A PR into `main` is cut from `main`, so neither its head nor its base
carries the workflow, the job never runs, and the required context
`gutted-merge-guard` never reports. Evidence: `main`'s tree holds only
`pr-preview.yml` and `production.yml`; the job's conclusion was `skipped` in all
40 runs sampled — **it had never once executed its logic**; PR #144 reported
only `verify-and-deploy` and `close-preview`. This is the failure mode the
workflow's own header warns about for a different cause: *"a path-filtered
required check never reports, which blocks the merge forever."* The RUNBOOK
described the guard as "required on both branches" — true of the **check**,
false of the **workflow**, and that gap is the bug.

**B — latent.** The skip test `! git merge-base --is-ancestor
"$LAUNCH_MERGE_BASE" HEAD` could never be true. The takedown revert changed
`main`'s TREE, not its HISTORY — the same file's header says so — therefore
`LAUNCH_MERGE_BASE` is an ancestor of `main` and of every branch cut from it.
The comment claiming "placeholder-era PRs pass trivially" described an
unreachable state. Had A been fixed alone, the job would have run and failed,
reporting 98 missing files against a PR that deletes nothing (verified: 0
deletions relative to `main`).

**Decision.** Replace the skip test with one that actually separates a release
merge from a placeholder fix — *does this PR carry post-takedown `phase-c`
commits?* — and put the identical workflow on `main` so the check can report.

**The file comparison is deliberately untouched.** Only the skip condition
changed, so a release PR runs exactly the check it always would have. This
cannot weaken what the guard exists for. Proven locally before shipping, which
mattered because the job had never run and a silently-always-passing guard would
be worse than the broken one:

| Case | Shared commits | Behaviour |
|---|---|---|
| Placeholder fix off `main` (#144) | 0 | skips — correct, it deletes nothing |
| `phase-c`-derived head | 186 | runs the file check — correct, that is the hazard |
| Gutted tree fed to the file check | — | reports 98 missing, exit 1 — the guard still bites |

`LAUNCH_MERGE_BASE` was removed as dead config, with the reason left in a
comment; dead config is what produced this class of bug. `TAKEDOWN_REVERT`
stays — job 1 uses it. Job 1 was not touched. Neither job gained a `name:`
field: the check-run names equal the job ids, which is what the required
contexts match on, so renaming would silently re-break the gate.

**Bootstrap.** The PR that fixes a never-reporting required check is itself
blocked by it. Resolved by adding the workflow in the PR — GitHub runs
`pull_request` workflows from the merge commit, so the check runs on itself —
with a one-time admin merge as the fallback (`enforce_admins` is `false` on
`main`). No branch-protection context was removed at any point.

**Consequences for the relaunch, recorded because they are not obvious.**
`docs/RELAUNCH.md` step 6 promises the relaunch PR will go green *"including
`gutted-merge-guard`, which proves the tree complete before it retires"*, while
step 4 deletes the workflow in that same PR. That cannot work, for two
independent reasons: the workflow is then absent from the merge commit and
cannot run at all; and **even if it ran it would fail**, because
`relaunch-guard.yml` is itself a tracked file on `phase-c`, so deleting it makes
the guard's own comparison report it as a missing phase-c file. Verified: it is
the first entry in the missing list. The relaunch PR would fail its own required
check on its own retirement. Corrected sequencing: keep the workflow in the
relaunch PR so the check runs and proves the tree, merge, then retire the
workflow and both branches' required contexts in a follow-up. Separately, step 5
lists `studio-counter-portrait.jpg` among the deletions the tree check will
surface — that asset is not on `phase-c` (verified), so it never appears.

**Two things deliberately NOT changed.** The fixed guard no longer incidentally
fails a placeholder PR that deletes files for unrelated reasons; it never aimed
to, and adding a base-relative deletion check would introduce a new failure mode
into a gate the relaunch depends on. And `verify-and-deploy` is a required check
on **neither** branch — only the two guards are — so CI green is advisory and a
PR with failing tests is mergeable once its guard passes. That is the operator's
call, flagged rather than altered.

## 2026-08-25 — PR board cleanup: merging into `main` during the takedown era is safe, and why

**Context:** six PRs open, four unable to move, and the board read as disarray.
Two of the four — #146 (the guard onto `main`) and #144 (the Xtend-AI credit on
the placeholder) — had been parked under the standing instruction that we are
not ready for a production deployment. Separately, both standing preview PRs had
drifted six commits behind `phase-c` (last refreshed 2026-08-22), so the client
and the review pair were reading a `/services` intro that had already been
rewritten at the client's own direction, and the `relaunch-guard.yml` header
still carried the retirement instruction that 2026-08-24 corrected.

**Decision:** land #146 then #144 into `main`, refresh both previews, correct
the guard header, and add a preview-refresh rule to the RUNBOOK. Nothing about
the takedown topology changes: PR #95 is untouched, `main` is never merged into
`phase-c`, and no gate, budget, or banned-pattern list is altered.

**The load-bearing fact, recorded because it will look alarming later.**
"Merge to `main`" normally means "publish the client's website." It does not
mean that during the takedown era, and reading it that way is what froze two
PRs. `main`'s tree carries **three page files** — `404.astro`, the Under
Construction `index.astro`, and the styleguide catch-all — and
`src/content/treatments/` holds nothing but a `.gitkeep`. A merge into `main`
rebuilds and redeploys **the construction placeholder**; it cannot publish the
site, because the site is not in that tree. The site's only route to production
is a `phase-c` → `main` release merge (PR #95's successor), which is
permanently CONFLICTING by design and requires the two-step relaunch. Verified
alongside: no PR has merged into `main` since #99 on 2026-08-05, so #144 was the
first attempt since the takedown and it hit the never-reporting required check
head-on — which is also why production has been un-hotfixable rather than merely
untouched.

**Scope of the credit loss.** Placeholder-only. `phase-c`'s `Footer.astro`
carries `Created by: Xtend-AI` sitewide and always has; the takedown revert
removed it from the placeholder alone. The restored copy on `main` becomes
redundant at relaunch and goes out with the rest of the placeholder.

**Guard header corrected.** The file said *"RETIRE THIS WORKFLOW IN THE RELAUNCH
PR ITSELF"*; `docs/RELAUNCH.md` step 4 was corrected on 2026-08-24 to explain
that this cannot work (the workflow is tracked on `phase-c`, so deleting it in
the relaunch PR makes the guard report itself missing and fail its own required
check on its own retirement). The most consequential instruction in the repo
existed in two contradicting versions, and the wrong one was the one an operator
reads inside the file. The header now points at RELAUNCH.md step 4 as the
authority. The two copies of `relaunch-guard.yml` stay byte-identical: the
`main` copy is taken with `git checkout origin/phase-c -- <path>`, never
retyped, and the identity diff is a merge gate rather than a formality.

**RUNBOOK gains a refresh rule.** Pushes to `phase-c` deploy nowhere and GitHub
does not re-run a PR's workflows when its base branch moves, so a preview PR
serves whatever it last built until someone merges `phase-c` into it. Nothing in
"Everyday changes" said to do that, which is the whole explanation for the
six-commit drift. Now it does.

**Alternatives rejected.** Combining #146 and #144 into one PR to halve the
placeholder redeploys — rejected, the split is what keeps the first-ever real
execution of `gutted-merge-guard` on a `main` merge content-free, and a
placeholder redeploy costs nothing. Enabling `delete_branch_on_merge` to stop
branch litter — verified safe (`allow_deletions` is `false` on both `main` and
`phase-c`, so GitHub cannot delete either even though `phase-c` is the release
PR's head branch), but the litter rate is one stale branch per 136 merges and
the setting would not touch local branches or worktrees, which is where the
actual clutter lives; left to the operator. Closing #97 or #138 as stale —
rejected, #97 is the standing client link and #138's review tags are still in
use; both were refreshed instead. Requiring `verify-and-deploy` as a status
check — rejected for now and flagged again: `pr-preview.yml` carries
`paths-ignore`, so a docs-only PR would never run it, the required check would
never report, and docs-only PRs would block forever. That is the identical bug
2026-08-24 fixed, and a proper version needs an always-runs summary job.

**Consequences.** Two production deploys of the placeholder, each re-verified
and each purging the Front Door cache; the visible difference is the restored
credit line. `main` gains `relaunch-guard.yml`, which makes the RUNBOOK's
existing claim that the file "ships on both branches" true rather than
aspirational, and makes production hotfixable again. The guard's skip path was
confirmed to execute for real on #146 — its run log ends `No post-takedown
phase-c commits in this PR; not a release merge. Nothing to check.` — so the
open question of whether `origin/phase-c` resolves in the runner's checkout is
closed. PR #143 stays open awaiting Amy; #95, #97 and #138 stay open by design.

## 2026-08-25 — PR previews deploy before the slow gates, not after

**Context:** the operator asked whether raising `numberOfRuns` on `main`'s
Lighthouse config would make previews slower to appear. Measuring to answer it
surfaced a bigger problem. `pr-preview.yml`'s `verify-and-deploy` is a single
sequential job that ran the whole of `npm run verify` — including Lighthouse —
*before* the SWA upload step. Measured on PR #147 (2026-08-25): the job took
6m40s, of which **Lighthouse alone was 4m11s** (14:46:39 → 14:50:50), and the
`Deploy preview` step did not begin until 14:50:51. A link that was ready in
under two minutes could not be sent for six and a half. Every preview the
client and the review pair have ever waited on paid that cost.

**Decision:** split `verify` into halves and put the deploy between them.
`package.json` gains `verify:fast` (build, `check`, `lint:claims`,
`lint:voice`) and `verify:slow` (`test:a11y`, `test:perf`); `verify` becomes
`npm run verify:fast && npm run verify:slow`. This is **step order only** — the
same six commands run in the same order with the same `&&` short-circuit, so
a11y failing still stops perf exactly as before, and `production.yml`, which
runs `npm run verify` unchanged, is not touched. Measured locally: `verify:fast`
completes in **22 seconds** and leaves a fully deployable `dist/` (`index.html`
and `staticwebapp.config.json` both present).

**Not a weakened gate.** Every gate that ran before still runs and still
reports. The gates that decide whether a client should be shown the page at all
are the cheap ones and they still run *before* the upload: build 11s, `check`
7s, `lint:claims` and `lint:voice` under a second each. A page carrying a banned
claim, or first-person plural, still cannot reach a preview URL.

**Trade accepted:** if a11y or perf fails, the preview stays up while the PR
goes red. That is the right default for a preview environment rather than
production, and `verify-and-deploy` is a required status check on neither
branch today, so nothing that gated a merge stopped gating one. The RUNBOOK now
says a red run means a preview is up that failed a slow gate — read the run
before acting on the link.

**Two syntax traps, recorded because both fail silently-ish.** The trailing step
is guarded `if: ${{ !cancelled() && steps.fast_gates.outcome == 'success' }}`.
The `${{ }}` wrapper is required, not stylistic: a bare `!` opens a YAML tag, so
`if: !cancelled() && …` will not parse. And the step id is `fast_gates`, not
`fast-gates`, because a hyphen in dot-notation inside an expression is read as
subtraction. The guard itself is load-bearing twice over: `!cancelled()` stops a
failed deploy step from SKIPPING the remaining gates (the job would go red
having never reported an a11y or perf result), and the `fast_gates` clause stops
them running against a `dist/` that was never built.

**Alternatives rejected.** Raising `main`'s `numberOfRuns` from 1 to 3, the
change originally proposed — wrong lever (it would have added ~48s to a rare PR
type while saving nothing on the previews anyone actually opens), and wrong on
its own terms: LHCI's `aggregationMethod` defaults to `optimistic`
(`@lhci/utils/src/assertions.js:139`), which takes `Math.min` for `max*`
assertions and `Math.max` for `min*` ones, so bumping the run count without also
setting `"aggregationMethod": "median"` silently converts every assertion to
best-of-N. `phase-c`'s own config already defends against exactly this and says
so in its `$comment`; `main`'s does not, and gets away with it only because
best-of-1 is the sole value. Splitting into two jobs with artifact passing —
rejected, it costs a second `npm ci` plus upload/download for no benefit over
reordering steps in one job.

**Scope: `phase-c` only.** `main`'s copy of `pr-preview.yml` already diverges
(it predates the 2026-07-26 `paths-ignore` block, frozen by the takedown
revert), so this introduces no new class of divergence, and the two-step
relaunch brings `phase-c`'s copy across. Placeholder PRs into `main` keep the
old ordering; they spend ~24s in Lighthouse, so there is little to reclaim.

## 2026-08-25 — skincare: photo round page 9 — 28.jpg replaces the shelf photo (baked 4:5 crop)

**Context:** Operator direction (2026-08-25): on /services/skincare, the
photo to the right of "Individualized, with Amy" (`skinbetter-shelf.jpg`,
from 8K0A9922, committed 2026-07-23) is replaced by
`C:\Amy\New Pics\28.jpg`. Photo round page 9 — the round's first page
since laser-treatments (2026-08-21).

**Screening (RUNBOOK "Replacing site photography", full resolution —
astro:assets serves the source-resolution derivative as the `<img src>`):**
1600×1067 landscape, 405KB, SHA-256 `7ABBEDAB…7490` — hash-unique against
`src/assets/photos/`. Seven Skinbetter Science products on a white table
(sunbetter SPF, Trio, Refining Foam Cleanser, InterFuse EYE, Mystro, Alto
Advanced, AlphaRet) above a spread of Amy's own business cards (her
headshot; "Palacios" / "Nurse" / phone fragment "…7108" legible — her own
marketing, sole-owner precedent). Product labels and fl oz/mL sizes are
manufacturer trade dress as sold (the skinbetter-lineup precedent on this
same page; pack sizes are package contents, not dosing). No clients, no
other providers — no release needed. **Flag raised once: two small capped
syringes lie among the cards** — soft focus, unlabeled, no vials, no prep
tray; the injectable-ambiguity class on a topical/shop page (the
2026-07-20 weight-loss rejection class), and they sit inside every
possible crop. **Operator decision: SHIP AS-IS** — recorded as a
screening-note acceptance, NOT a constraint-3 override (no dosing or
claims content in frame).

**Decision — the crop is baked, and why.** The media-row arch is a 4:5
display window; from a landscape source the house CSS anchor knob would
serve full-frame derivatives whose window region under-delivers — the
680w tier puts ~363 device px across the 576px DPR2 window (0.63×, below
the redesign retina hard rule). The "prefer the CSS knob" precedent
(dermal-fillers, 2026-08-21) covered portrait sources, where the knob has
no retina cost. So the asset is a server-side extract from the master:
sharp `.extract({ left: 480, top: 0, width: 854, height: 1067 })`, JPEG
q92, single generation → `skinbetter-over-cards.jpg` (content-named). The
x=480 offset was chosen from three rendered candidates (440/480/520): 440
truncates AlphaRet's label mid-word, 520 leaves half-words on Trio's; 480
keeps five complete labels with both edge bottles cut cleanly. The baked
window matches the layout's `aspect-ratio: 4/5` exactly, so `object-fit`
is inert (the prp-treatment pattern); tiers `[340, 540, 680]` unchanged
(854 ≥ 680 — no upscale). Geometry accepted with the pick: the products
span ~1090px and the window holds 854, so no 4:5 crop keeps all seven —
the outer two (sunbetter, AlphaRet) crop out; the full-frame segmental
alternative was offered and declined (operator, 2026-08-25).

**Alternatives rejected:** the CSS anchor knob on the full frame (the
retina math above); the full frame in a row-scale segmental arch
(offered, declined — a short, wide arch beside the copy, unlike every
other row); a blur-fill 4:5 contain composite (a 3:2 frame in a portrait
canvas is ~47% bars).

**Consequences:** `skinbetter-shelf.jpg` had no other consumer and is
deleted (git history keeps it; its remaining mentions are historical
docs). `clinicianApproved` true → false in the content commit
(constraint 4) — flags now read **3 true / 9 false**; Amy re-reviews on
the PR preview and the flag returns in the consolidated pre-relaunch
round. Alt text rewritten factually (products above the card spread; no
product count, since the crop trims two). The master stays in
C:\Amy\New Pics, never committed.

**Addendum, same day — the first photo too: Amy's chin returns to
frame.** Operator direction after PR #150 merged (the second slot) but
before the standing previews were refreshed: the page's FIRST photo,
beside "What it is" (`skinbetter-lineup.jpg`, committed 2026-07-23),
cuts Amy's head off at the neck — replace it with
`C:\Amy\New Pics\27.jpg`, the same held-out-line-up scene from the same
shoot with **her chin visible at the top of the frame**. Screened:
1600×1385 landscape, 513KB, hash-unique; Amy alone (the operator's
direction identifies her — chin, blonde hair, the pink blazer of the
2026-08-18 blazer frame), so no release; six product labels are
manufacturer trade dress as sold (sunbetter's SPF/water-resistance
lines included — label text, the standing precedent); the soft pink
blur at her shoulder is illegible and benign. Same mechanics as the
morning's swap: baked 4:5 crop (sharp
`.extract({ left: 246, top: 0, width: 1108, height: 1385 })`, JPEG q92,
single generation) → `amy-holding-skinbetter.jpg`; tiers
`[340, 540, 680]` unchanged (1108 ≥ 680). x=246 chosen from three
rendered candidates (180/246/320) on a criterion the page itself
supplies: the copy names sunbetter and AlphaRet as the line's example
franchises, and 246 is the window that keeps the chin centered,
sunbetter whole, and AlphaRet readable at the edge (180 loses AlphaRet
entirely; 320 cuts sunbetter's label and strands a floating Mystro cap
fragment). Alt names Amy for the first time on this page — the
operator's identification is the record. `skinbetter-lineup.jpg` had no
other consumer (the 2026-08-17 door round left it only here) and is
deleted. `clinicianApproved` was already false (this morning's reset) —
unchanged; Amy reviews both new photos on one preview (the 2026-08-15
combined-review lesson).

## 2026-08-25 — the storefront QR: Amy's registration handoff joins the Skinbetter callout

**Context:** Operator direction, same day: place the QR code Amy uses on
the website. The source shown (`IMG_0001.jpg`, repo root — untracked,
covered by the root image guard) is a scan of her Skinbetter counter
card; its QR decoded (scratchpad zxing-wasm — jsQR could not read the
photocopy) to `skinbetter.pro//MobileAesthetics?k=signup`, byte-identical
to the 2026-07-23 decode that resolved `{{SKINBETTER_URL}}`. The operator
then supplied the URL the site QR should encode: the skinbetter.com
Account-Registration deep link carrying
`businessPartner_id=0000267316&location_id=a306e000001ksylAAA`.

**Screening:** the destination is skinbetter.com's own registration page
with Amy's partner id — probed live (403 to bare curl, the Vagaro
bot-protection class; 200 with a browser UA, no redirect, the partner id
present in the served page). No other provider named; constraint 2 not
engaged. The registration-first-vs-bare-URL trade-off was flagged when
the QR was first discussed (the 2026-07-23 decision chose the bare URL
for the site's *buttons* because form-first landing punishes cold
traffic); the operator chose this URL for the QR with that in hand — the
QR serves the desktop→phone handoff, where the card's register-to-shop
flow is the intended path. The buttons keep the canonical bare URL;
nothing about the 2026-07-23 decision changes.

**Decision:** a fresh SVG, not the scan (the photocopy is yellowed,
halftoned, and skewed — below the flawless-assets bar, and it carries
Skinbetter's card design). Generated scratchpad-locally (`qrcode` npm
package, never a repo dependency — the jsqr decode precedent) at ECC M,
margin 4, black on white → `src/assets/brand/skinbetter-registration-qr.svg`
(4,584 bytes, version-9 code). **Round-trip proof, recorded as the
control for a pixel asset no linter can read:** the committed SVG
rasterized and decoded back to the exact URL; the built page's rendered
plate screenshot at 1280 ALSO decoded to the exact URL; and the operator
scan-tested the code themselves the same day ("It works") — the human
verification on top of the mechanical ones. Placement: a
white tile (12px corners, the SVG's baked quiet zone continuous with the
tile) inside the noir StorefrontCallout plate, statement left / tile
right on desktop, stacked on phones; caption "Scan to register and shop
from your phone." in raw ink-900 (deliberately not `--ng-text`, which
re-scopes light under the noir surface). The QR is never the only
route — the shop button beside it remains the click path (a11y and
phone users, for whom an on-screen QR is unscannable). Zero JS; the
page is pa11y-covered, not LHCI-gated.

**Alternatives rejected:** committing the scan (quality + trade dress);
a QR API image URL (a third-party request — the CI-enforced zero);
encoding the site's canonical bare storefront URL (recommended for
consistency; the operator chose their supplied registration URL);
making the QR itself a link (the button is the click path; a clickable
QR duplicates it for no gain).

**Consequences:** the site carries its first QR code, on one page, in
one component whose sole consumer is skincare.mdx. Changing the encoded
URL is a regenerate-plus-decode-verify, never an edit to the SVG. Rides
PR #151 with the day's two photo swaps so Amy reviews one preview; the
page's flag is already false and resets nothing further.

## 2026-08-25 — Girl Team on /about: the still, the plate, and the second Mobile Aesthetics link

**Context:** Client direction relayed by the operator, same day: a third
photo on /about — 29b.jpg, to the left of "Two decades in the making." —
with "Girl Team!" in letters on the photo (top), and below it a button
to https://yourmobileaesthetics.com. Screening: 1600×1067 (≈3:2)
landscape JPEG, SHA-256 `51E04D45…B433BB`, hash-unique against the 52
committed photos. Frame: five women in a white studio — Amy center with
FOUR of the location's five other providers (the 2026-08-17 team film
has all five; one is not in this still). No signage, products, or
legible text anywhere in frame; nobody is named anywhere. "Girl team"
is already the record's own name for this group (the carousel record's
name for `commercial-team`).

**The flag and the override:** three items sit outside the recorded
constraint-2 exceptions and were flagged together: a STILL of the other
providers (the film exception covers the film only); "Girl Team!" as
rendered team language (trips no lint:voice token — the gate bans only
we/our/us/let's — but is against the rule's written rationale: the
green-linter-is-not-authorization class); and a SECOND outbound link to
yourmobileaesthetics.com (the header badge had been "the only
sanctioned outbound reference"). Operator override, direct from Amy —
recorded as CLAUDE.md constraint 2's fourth scoped exception. Releases:
the four pictured providers' releases for needlegirlie.com use
confirmed on file (operator, same day — the 2026-08-17 confirmations
covered the film, not stills).

**Decision:** full frame, no crop — committed byte-identical to the
master as `girl-team-studio.jpg`. The figure wears the segmental arch —
the shape built 2026-08-18 for landscape frames that must show full
content, at this photo's native 3:2 — hand-copied into the page style
block because the recipe is scoped to `.treatment-body` (the
`.about-print` hand-copy precedent), with the page's house wash.
"Girl Team!" is LIVE TEXT (operator choice over baking it into pixels):
the site's first text-over-photo, an opaque paper keystone plate
straddling the arch crown. The Phase C rule requires opaque plates (no
scrims), and the keystone seat clears every face at every viewport — a
%-offset plate grew into Amy's hair at 390px, since Amy stands center
under a centered plate. Raw ink-900 on paper (the QR-tile in-tile
idiom); Amy's own casing, no uppercase transform. The milestones
section became a photo-left grid (`md:grid-cols-[5fr_6fr]`, figure
`md:order-first`, DOM still heading-first). The button: a hand-rolled
`.cta cta--outline` anchor (the ConceptHome Instagram precedent), label
"Visit Mobile Aesthetics" (operator choice), `data-event="ma_site_click"`
(already in the analytics union), new tab + noopener + sr-only note.
Deliberately NOT a CTAButton: the book/consult variants accept
href/label overrides but hard-bind `book_click` — the wrong event for
an MA link.

**Alternatives rejected:** baking the text into the JPEG (soft on
retina, invisible to every gate, a regenerate to reword); a 4:5 Roman
arch (crops the team to ~2 people — defeats the point); a plain
rectangle (violates the sitewide every-photo-wears-an-arch direction,
2026-08-17); CTAButton with overrides (wrong analytics event).

**Verification:** verify:fast green; the built section eyeballed at
390 and 1280 — all five in frame, plate clear of every face and
untinted by the wash (z-indexed above it). Budget measured, not
assumed: LHCI's full-page scroll fetches lazy images, and /about's
mobile fetched set was ≈149KB of the 240KB image budget before this
photo — the new 760-tier derivative fits with margin; the full verify
run gates the PR.

**Consequences:** the sanctioned outbound references to
yourmobileaesthetics.com are now TWO (header badge 2026-08-15; this
button) — siteConfig's "only sanctioned" comment corrected in the same
commit, and CLAUDE.md constraint 2, compliance/README, BUILD_SPEC §6,
REDESIGN, and the CHANGELOG ride the docs commit. The already-screened
destination did not carry authorization forward: the second consumer
got its own flag and its own override. /about carries no
`clinicianApproved` flag — Amy's review happens on the PR preview.

## 2026-08-25 — the Evolus Laurel replaces the recognition plate on /about; the "#1" sentence retires sitewide

**Context:** Client direction relayed by the operator, same day (riding
the Girl Team PR #153 at the operator's choice — the 2026-08-15
combined-review lesson, one preview for Amy): the ranking banner from
/services/wrinkle-relaxers — the EvolusLaurel plaque — joins /about
near the ICON film, replacing the smaller EvolusCallout recognition
plate. This is the dermal-fillers move (2026-08-21) repeated: the
Laurel into the Callout's exact spot, above "Inside Evolus".

**Two authorizations, both flagged and operator-confirmed:**

1. **The ranking sentences' page scope widens to /about.** The two
   Laurel sentences were authorized on wrinkle-relaxers and
   dermal-fillers, "nowhere else"; widening requires the human
   operator, who directed exactly this. /about is the third and only
   other authorized page. Recorded in CLAUDE.md constraint 3,
   BUILD_SPEC §8.4, and the component header. (Historical note: this
   supersedes what remained of the 2026-07-21 "About is ranking-free"
   placement in spirit — that decision was already superseded
   2026-08-18 when the "#1" plate moved there.)

2. **The "#1" allowlist entry is withdrawn** (operator choice after
   the flag; the recommended withdrawal accepted). The /about plate
   was the sentence's LAST consumer, so after the swap "Charlotte's #1
   Evolus provider" renders nowhere — and an authorization nothing
   uses is a loophole (the 2026-08-21 seventh-authorization precedent,
   quoted in the registry's own comment). The entry came out of
   `allowedStrings` in the same commit that removed its consumer
   (atomic: the entry never outlives the consumer, the sentence never
   outlives the authorization). The ranking vocabulary is banned
   everywhere again, comments included; re-adding the sentence
   requires the human operator. Verified safe before the edit: the
   lint-claims self-test has no coupling to the entry (its samples
   build from fragments), and the full self-test + scan pass after
   removal.

**Also:** `EvolusCallout.astro` deleted — orphaned by the swap (sole
consumer was about.astro; grep-proven), the DraftBanner deletion
precedent; git history keeps it. The EvolusLaurel header, about.astro's
page and section comments, siteConfig untouched. The Laurel is
self-contained (component-scoped styles, its own noir surface) and
needed no adaptation for /about; its shimmer stays within the motion
vocabulary (39px floor holds).

**Verification:** verify:fast green — the self-test proving the
registry edit is clean; built dist grep: "Top Evolus Injector" on
exactly /about + wrinkle-relaxers + dermal-fillers, the retired phrase
zero hits sitewide; the section eyeballed at 390 and 1280 (plaque on
noir, wreath + stacked Top-50 lockup, ICON film unchanged below).

**Consequences:** the registry shrinks for only the second time, both
times by withdrawal of a consumer-less authorization — the "list only
ever grows" rule governs patterns, and allowedStrings changes remain
operator-gated in both directions. Three pages now render the Laurel,
once each. CLAUDE.md constraint 3, BUILD_SPEC §8.4 + §6 + §7.4 + the
§17 registry row, and compliance/README updated in the docs commit.

## 2026-08-25 — the ICON film autoplays on /about (a scoped override of the narrated-manufacturer-film rule)

**Context:** Client direction relayed by the operator, same day (riding
PR #153 with the day's other /about changes): the ICON film autoplays.
The mechanism already exists — `TreatmentVideo autoplay="inview"` and
the third sanctioned script (`public/js/treatment-video.js`, ~2KB) —
but its recorded contract (operator direction, 2026-08-21) restricts
the opt-in to Amy's own speech-free films: "never for a manufacturer
film or one with narration, which muted autoplay would gut." All three
existing consumers are Amy's `[Music]`-cue reels.

**The flag:** the ICON film is the opposite case on every axis — an
Evolus manufacturer production, narrated, whose printed caption says
"sound on." Browser autoplay must start muted and the inview mechanism
hard-wires `loop`, so autoplay means silent event footage looping
until a visitor taps for sound. Claims calculus unchanged (the film
ships as-is, nothing trimmed — the 2026-08-18 exception terms hold);
the flag was the film-class rule and the experience.

**Decision (operator override after the flag):** autoplay anyway.
`autoplay="inview"` added to the /about player — muted on approach,
loop while on screen, native controls as pause and tap-for-sound,
reduced motion = click-to-play. The caption keeps "sound on" as the
tap-for-sound nudge. Recorded as the film-class rule's ONE scoped
exception in the component header, CLAUDE.md (script-consumer list),
and BUILD_SPEC §5/§9-perf; the rule stands for every other film and a
further exception requires the human operator.

**Verification:** functional check on the built page (Playwright):
paused before approach; playing + muted + looping with playback
advancing in view; paused again scrolled away. /about gains its first
script (~2KB, far under the 30KB budget and the per-page LHCI
script-size gate); the full verify run gates the PR.

**Consequences:** the autoplay script now renders on three pages
(biostimulators, body-contouring, /about). CLAUDE.md's stale "today
/services/biostimulators alone" consumer note was corrected to the
full list in the same commit (body-contouring had shipped later the
same 2026-08-21 day).

## 2026-08-25 — /injector-training: the dedicated training portrait (31.jpg), a new pixel-level claims override

**Context:** Operator direction, from Amy: replace the page's hero
portrait — the deliberately reused grey-seamless frame — with
`31.jpg`. The 2026-08-04 entry recorded exactly this as the upgrade
path ("a dedicated Amy-solo training photo"). New asset
`src/assets/photos/amy-evolysse-cart.jpg` (byte-identical copy,
SHA-256 16F9DA9F…A56DFB, 1067×1600): Amy holding Evolysse cartons at
her studio cart. The shared `amy-palacios-fnp.jpg` stays in place for
its two treatment-page consumers — only this page's import changes.

**The flag:** legible in the served source file (astro:assets serves
the source-resolution derivative — the pixel8-cart precedent): a
Jeuveau banner's marketing headline ("KISS YOUR 11s GOODBYE"), its
indication line, and part of its Important-Safety-Information fine
print — the jeuveau-banner-studio class, whose override is fixed to
that frame on that page and does not carry here. Also on frame:
Evolysse cartons and tray vials (no quantities legible at source
resolution; the frame-level vet is the record). A defocus bake of the
banner text was offered.

**Decision (operator override after the flag):** carry the photo
as-is. The override is fixed to this frame on /injector-training; no
value or phrase from the banner — headline vocabulary, indication
language, ISI text — is ever restated in site text: copy, alt,
comments, meta descriptions, OG tags, JSON-LD. The alt names Amy and
the cartons factually. Changing the frame, the page scope, or
restating any banner content requires the human operator. Recorded in
CLAUDE.md constraint 3 (the photo-override list) and BUILD_SPEC §8.

**Verification:** frame vet at source resolution (this entry); crop
check at 390/768/1280 after the swap (the page's 4:5 window +
`object-position` tuned to the new frame); lint:claims green proves
nothing about pixels — the screening above is the control.

**Consequences:** the 2026-08-04 "recorded upgrade path" is taken;
the page header comment's portrait bullet is rewritten in the same
commit. The pixel-override list grows by one photo.

## 2026-08-25 — /injector-training: the training reel ships (Amy's own film, carried as-is; autoplay in-class)

**Context:** Operator direction, from Amy: add `training.mov` — Amy's
own produced Private Injector Training reel, the course-flyer set
animated — directly under the "Four courses, taught one-on-one."
heading, before the course cards, on autoplay. Source 1080×1920 (9:16)
HEVC+AAC, 19.8s. Screening: 1fps contact set (20 frames), full-res
grabs, a jar-shot zoom, `volumedetect`.

**The screening record:** burned-in course cards restate this page's
own operator-authorized card copy in pixels — including the
dosing/dilution-class curriculum vocabulary of the 2026-08-04 fifth
allowlist authorization ("Dosing and dilution", "Hyperdilute
Radiesse", "Advanced injection protocols", "Safety protocols",
"Training manual & protocols" among the topics) plus course prices.
The Dermal Filler segment's jar shot shows Jeuveau vials with the
per-vial "100 U" quantity legible (the radiesse-visit carton class).
B-roll shows Amy actively treating on-camera models, needle on frame.
The closing card displays Amy's contact block: phone, the
"Learn with confidence. Inject with purpose." tagline (already this
page's closing copy), "Injecting Since 2017" (the flyer's narrower
wording of the site's "in medical aesthetics since 2017" fact — pixels
self-identify; page copy still uses the one set of facts), and
`yourmobileaesthetics.com` on screen — a DISPLAY-ONLY reference to
Amy's practice site (not a link; the sanctioned outbound links remain
exactly two, per constraint 2).

**Releases (operator, 2026-08-25, two confirmations):** the on-camera
people besides Amy — the black-tank woman, the yellow-dress woman
(injected on camera), the dark-floral woman, and per the follow-up
after the completed sweep, the man in the olive shirt (PDO segment)
and the reclined woman in black (intro segment, possibly the
yellow-dress woman in different clothes) — ALL have releases for
needlegirlie.com use confirmed on file; NONE is another provider at
the location. This supersedes, for these frames only, the 2026-08-04
"trainee/model frames carry no releases" posture.

**Audio (operator confirmation, the record):** music bed, no speech
(volumedetect mean −25.0dB, peak −6.9dB; not transcribable on this
workstation). Captions therefore take the sounded-film form: bounded
`[Music]` cues. Deliberately NO "On screen:" cues — mirroring the
burned-in cards would restate vocabulary the override covers only as
pixels into a rendered text track; the cues describe the audio only
(recorded in the .vtt NOTE).

**Decision (operator override after the flag):** carry the film
as-is, whole — nothing trimmed (the closing-card trim was offered and
declined). Fixed terms: this film on /injector-training only; labels,
captions, and comments describe only what the pixels self-identify
and never restate the curriculum vocabulary, the vial quantity, or
the banner-class content; the on-screen MA URL stays display-only.
Changing the film, the page scope, or any fixed term requires the
human operator. Recorded in CLAUDE.md constraints 2 + 3 and
BUILD_SPEC §8.

**Autoplay (in-class, no exception):** Amy's own speech-free film —
exactly the class the 2026-08-21 opt-in was written for.
`autoplay="inview"` (muted, loop in view, native controls as pause
and tap-for-sound, reduced motion = click-to-play);
/injector-training becomes the autoplay script's fourth page, and the
CLAUDE.md consumer list is updated in the same round.

**Rendition:** the ICON recipe with one addition — a 810×1440
downscale (`scale=810:1440`, then `-c:v libx264 -crf 20 -preset
medium -pix_fmt yuv420p -c:a copy -movflags +faststart`): the player
sits in a 24rem (384px CSS) standalone slot, so 810px ≈ 2× the retina
need (the evolve-reel sizing discipline), and the downscale cuts the
autoplay fetch from 11.45MB (native-res encode) to 7.59MB
(3.06Mbps). Poster from the rendition at 12.4s — Amy alone at the
tray, no card text, no model on frame — 810×1440, 79KB. Uploaded to
the media origin AFTER this entry was committed (the written rule);
new filename `training-reel.mp4`, so no purge.

**Consequences:** the site's first film on an LHCI-budgeted page —
the perf-gate consequence is measured and recorded separately below
once known. /injector-training's header comment gains the film's
rules; CLINICIAN-SIGN-OFF carries the round for Amy's pass.

## 2026-08-25 — /injector-training under the LHCI gate with a film: measured, no carve-out

**Context:** /injector-training is LHCI-collected under the strict
house assertMatrix row (`third-party:count 0`, total ≤ 350KB, image ≤
240KB) and the training reel makes it the site's first film-bearing
page under a Lighthouse budget. The flagged risk (approved plan, same
date): LH's full-page pass fetches lazy content on this site — the
recorded reason /services has a carve-out row — so the in-view
autoplay could start the cross-origin media fetch mid-run, tripping
`third-party:count` and making `total:size` nondeterministic. The
plan authorized a page-scoped carve-out row IF measurement confirmed.

**Measurement (local LHCI against the built page, 1 + 3 runs, all
identical):** media 0 requests / 0 bytes; third-party 0; total
198,898 B; image 144,414 B (new portrait + poster together, well
under 240KB); LCP ~2,335 ms; CLS 0; performance 0.98. The autoplay
fetch does not occur inside the LH trace window.

**Decision:** `lighthouserc.json` is untouched — the strict house
budgets hold and the authorized carve-out is NOT enacted. If a
future LHCI or Chrome behavior change starts counting the media
fetch, the carve-out this entry describes (page-scoped row:
third-party 1, no total:size, every component budget kept) is the
recorded, already-flagged remedy — enacting it then still gets its
own DECISIONS entry.

**Consequences:** the perf gate stays at full strength on the page;
CI's own 3×-median run on the PR is the confirming record.
## 2026-08-25 — the team film joins /about's Girl Team unit (sounded rendition; the second constraint-2 exception widens)

**Context:** Operator direction, riding the day's /about round: the Mobile
Aesthetics team film — `C:\Amy\New Pics\team.MOV` — joins /about directly
below the "Visit Mobile Aesthetics" button, on autoplay. Verified
first-hand before planning: the file (22,013,675 bytes, SHA-256
7956A8DE6C607C85022426CC22EA4544665610EB24424DB0ED9B8D3F814BEB73, last
modified 2026-08-17 05:45, the only team MOV under C:\Amy) is the same
master screened frame-level for the home carousel that day — a fresh
contact sheet matched the 2026-08-17 record shot for shot (the burned-in
"GIRL TEAM" opener under the MA neon, the B&W photo-shoot montage; no
products, no clients, no claims text; the only legible words are the
overlay and Amy's own neon) — and **the operator confirmed the identity
on the record ("It was 08/17")**. Probed: 1080×1920 portrait — 9:16, a
fact the carousel record never needed to state — H.264 High at
12.6 Mbps, 13.87s, stereo AAC-LC ~126kbps.

**Flags raised, and the operator's decisions:**

1. **Constraint 2 — placement widening.** The film shows the location's
   other five providers, and its exception (the second scoped
   exception, 2026-08-17) is recorded as the home-carousel film;
   CLAUDE.md requires the human operator for any further film
   placement. **Operator override, direct from the client: the film
   joins /about**, inside the Girl Team unit. The five providers'
   releases for needlegirlie.com use, confirmed 2026-08-17, cover the
   film (as the Girl Team entry above noted — the film, not stills)
   and carry to this second placement. CLAUDE.md's second exception is
   widened in this PR; a third placement requires the human operator.
2. **Sound.** The muted carousel rendition was offered as the
   recommended path (zero new objects; browser autoplay is muted
   regardless); **the operator directed a SOUNDED rendition** — "if
   there is music, we'll have it setup where a user can unmute." The
   master's audio probed as a steady music-class track (volumedetect
   mean −20.2 dB, peak −6.0 dB; zero silent windows at −40dB/1s).
   **"No speech or narration anywhere" is the operator's confirmation
   (2026-08-25), and that confirmation is the record** (the
   biostimulators pattern — no transcription tooling on this
   workstation). Consequence: `autoplay="inview"` is **IN-CONTRACT** —
   site-authored and speech-free, the film class the opt-in was
   written for. No autoplay override exists or is needed; the ICON
   film's scoped override remains that rule's only exception.

**Decisions:**

- **Rendition** `girl-team-film.mp4` (content-named, the unit's
  vocabulary; a new filename, so no purge): H.264 CRF 23, preset
  medium, yuv420p, `-c:a copy` (the AAC track untouched), faststart —
  6.86MB / ~4.0 Mbps. Two recorded deviations, reasoned: the
  lossless-remux rule for H.264/AAC sources would ship the master's
  12.6 Mbps (22MB) into an autoplaying slot; and the sounded-film
  CRF 20 recipe (written for HEVC sources) measured 9.54MB here,
  while THIS master already has a client-reviewed visual precedent at
  CRF 23 — its own carousel rendition. Both encodes were made and
  measured; CRF 23 ships.
- **Captions** `public/media/girl-team-film.vtt`, audio-faithful:
  bounded `[Music]` cues plus the 0–2s cue mirroring the burned-in
  "Girl team" overlay. The carousel's `commercial-team.vtt` is
  deliberately NOT reused: `TreatmentVideo` renders captions
  default-on, and that file's film-long descriptive cue — written for
  the carousel, where captions are viewer-opt-in over a muted film —
  would paint text across the whole play. The carousel file is
  untouched.
- **Poster:** `commercial-team-poster.jpg` REUSED (dedup rule) —
  1080×1920, the same master's opening neon frame; the component
  clamps the request to the 1080 source width.
- **Placement + presentation:** inside the Girl Team unit's column,
  directly below the button — the unit now runs still → plate →
  button → film. Portrait 9:16 at full column width would render
  ~800px tall, so a page-scoped wrapper caps it at the treatment
  pages' in-row film width (18rem — the page's standing hand-copy
  precedent; the sizing rule is scoped to `.treatment-body` and
  unreachable here). `frame="bare"` beside the unit's bare segmental
  arch; the mat stays the ICON player's standalone look. No printed
  caption (the 2026-08-21 rule); the label names the team factually,
  within the fourth exception's unit terms. The EvolusLaurel section
  simply sits lower; the film's own 2.5rem top margin is the gap
  under the button, and the plaque gap is eyeballed at 390/1280 on
  the built page before the PR.

**Alternatives rejected:** reusing the muted carousel rendition
(recommended, declined — the client wants the music unmutable);
lossless remux (22MB); CRF 20 (9.54MB, no visual gain over the
master's own carousel precedent); full-column width (an ~800px
portrait tower); the mat frame (re-imports the print look beside the
unit's bare arch); a fresh constraint-2 exception entry instead of
widening the second (one film, one exception — the record stays
navigable).

**Consequences:** two renditions of one master now serve from the
media origin — `commercial-team.mp4` (muted, home carousel) and
`girl-team-film.mp4` (sounded, /about) — so replacing the team film
someday touches BOTH. /about runs two autoplaying players sharing the
one ~2KB static script (zero new JS). The poster is fetched at page
load on an LHCI-gated page — measured in verify, not assumed. Egress
~7MB per full play. /about is structural — no clinicianApproved
mechanics; Amy reviews on the PR preview, and the pending
presentation-approval row gains the film. One passage left for the
operator: the fourth exception's cross-reference sentence in CLAUDE.md
(noting the unit gained the film) was blocked by the tooling
classifier mid-edit — the OPERATIVE authorization, the second
exception's widening, is applied; the cross-reference is flagged as
the operator's passage (the DraftBanner BUILD_SPEC §4/§7 precedent).

## 2026-08-25 — iv-therapy: the IV photos land (IV01 + IV02); studio-wide.jpg retires with its alt defect

**Context:** Client direction via the operator (2026-08-25): on
/services/iv-therapy, the page's one photo — `studio-wide.jpg` beside
"What a visit looks like" (committed 2026-07-22, predating the photo
round; also the carrier of the recorded alt defect, "two clients" vs
its one-client 4:5 window — AUDIT 2026-08-17 / RELAUNCH precondition 3)
— "isn't any good" and is replaced by `C:\Amy\New Pics\IV01.png`; a
second photo, `C:\Amy\New Pics\IV02.jpg`, joins to the LEFT of
"Individualized, with Amy" (text-only until now). One of three
concurrent sessions this day; built in an isolated worktree on
`content/iv-therapy-photos` off origin/phase-c (the 2026-08-21
three-session precedent).

**Sources, probed first-hand.** IV01: 1290×1720 PNG (exactly 3:4),
2.27MB, casual phone-shot class (mild motion blur on Amy's arm — the
client's pick, hers to make). IV02: 1290×2078 JPEG (~0.62), 342KB, EXIF
orientation 1 (no rotation needed), **no GPS EXIF** (checked — the repo
is public). Both SHA-256-unique against all 55 committed photos;
neither duplicates `iv-drip-neon.jpg` (the /services menu card 11
frame, untouched).

**Screening record (frame-level + magnified scratchpad crops of every
flagged region — the RUNBOOK full-resolution rule; astro:assets serves
the source-resolution derivative as the `<img src>`):**
- IV01 — a client seated in the treatment chair, IV line taped at her
  elbow, working on a MacBook (back of screen to camera; her phone on
  the chair is dark), lip-pillow on lap; Amy at the IV pole preparing
  supplies over a gold tray; a yellow IV bag hanging. Zoomed and
  cleared: a cursive wall-decal fragment top-right resolves to "by"
  plus one partial letterform cut by the master's own frame edge — no
  word or name resolves at source resolution, so no reference is
  conveyed (the 2026-08-18 slot-01 illegible-fragment class); the tray
  holds gloves, prep packets, orange-cap flush syringes, and
  blue-capped items whose labels do not resolve (distinct from the
  rejected prep-tray class, where branded vials and unit-marked boxes
  were legible and central — nothing brands or quantifies here, and IV
  supplies are this page's own subject); the bag shows only blurred
  volume graduations — no name, no numerals resolve.
- IV02 — Amy (pink gloves) tends the reclined male client's forearm;
  yellow IV bag behind; supply cart left; fridge in background. Zoomed
  and cleared: "AMERICAN EAGLE" on the client's t-shirt (third-party
  apparel trade dress as worn — screening note); the decorative
  LIVE/DREAM/LAUGH/DANCE/LOVE word-art print (the exact benign class
  recorded 2026-08-17, frame 7); an illegible smudge of a tool-brand
  cap logo; racked small vials/bottles and pink folders on the cart's
  shelves with no label resolving at source resolution
  (identifiable-but-illegible, noted per the RUNBOOK); the counter
  phone lies edge-on, screen dark. No claims or dosing content in
  either frame. **No override of any kind is required** — the
  evolve-reel class: releases and screening notes only; CLAUDE.md, the
  compliance registry, and BUILD_SPEC are untouched.

**Identity + releases (operator, 2026-08-25, AskUserQuestion — the
confirmations are the record):** the standing clinician in IV01
(burgundy scrubs, back to camera) **is Amy**; the clinician in IV02
(royal-blue scrubs, face mostly hidden) **is Amy** — constraint 2 not
engaged in either frame. The seated IV01 woman is **a client, website-use
release confirmed on file**; the IV02 male client's **website-use release
confirmed on file**.

**Decisions:**
- Assets content-named: `iv-infusion-laptop.jpg` — the PNG master
  re-encoded JPEG q92, single generation via sharp
  (`sharp(master).jpeg({ quality: 92 })`, 2.27MB → 233KB; the
  prp-treatment/studio-counter-portrait precedent — Astro re-encodes
  every variant, so a committed PNG compounds); `iv-male-client.jpg` —
  a byte-identical copy of the JPEG master (revanesse-mirror-client
  pattern; hash-verified). Masters stay in C:\Amy\New Pics. No baked
  crops: both sources are portrait, so the 4:5 arch display window is
  width-limited and the full 1290px width serves — the sitewide
  [340, 540, 680] widths contract is met with no retina override (the
  skincare bake was for a landscape source).
- Row 1 keeps its `media-row--flip` shape (photo right); src, alt, and
  a provenance comment swap in. Row 2 wraps "Individualized, with Amy"
  in a plain `media-row` — figure first, photo LEFT — mirroring
  weight-loss-glp-1's row for the same section. Page rhythm: flip
  (right) → text → plain (left); two rows, no band needed.
- Per-image knob, one: `iv-infusion-laptop` anchors top (50% 0%) — the
  hanging IV bag is already clipped by the master's own top edge and
  the default 30% anchor trimmed another 32px off it; anchored top the
  window keeps the maximum of the bag and sheds only floor. A/B'd on
  the built page at 390 and 1280 (both anchors screenshotted). IV02
  sits at the default anchor — the 4:5 window (~466px trim) keeps the
  word-art print, the bag, both people, and the client's shoes; the
  arch dome grazes the print's top edge, cosmetic only. Layout knob in
  its own commit (layout ≠ content).
- `studio-wide.jpg` had no other consumer (git grep, zero hits outside
  docs) → deleted in the content commit; git history keeps the frame.
  Its recorded alt defect retires with it — CLINICIAN-SIGN-OFF and
  RELAUNCH precondition 3 updated in the docs commit.
- `clinicianApproved` true → false in the content commit (constraint 4
  — the page was approved 2026-08-05). Flags now read
  **2 true / 10 false** (hormone-optimization and regenerative remain
  true); Amy re-reviews on the PR preview and the flag returns in the
  consolidated pre-relaunch round.

**Alternatives rejected:** reusing `iv-drip-neon.jpg` in-body (would
duplicate the menu-card frame on the page it opens); committing the
IV01 PNG as-is (double-lossy through the pipeline); a baked 4:5 crop
of either source (portrait sources — the CSS knob has no retina cost
here, the dermal-fillers precedent); the 3:4 aspect knob for IV01
(offered by the geometry, unneeded — the 4:5 window loses only floor
and already-clipped edge content).

**Consequences:** photo round page 10; the page's two photos are now
both the client's own picks; /services/iv-therapy is pa11y-gated and
outside the LHCI set, so the swap carries no budget math. The two new
frames are casual phone shots rather than pro-shoot frames — the
client's pick, noted once. Docs updated in this PR: DECISIONS,
CHANGELOG, CLINICIAN-SIGN-OFF (row + drift list + defect note),
RELAUNCH (precondition 3's defect note), REDESIGN (photo row).

**Addendum, same day — IV02 re-graded brighter (operator review).**
The frame read very dark on the operator's first look. Re-derived from
the master in a single generation — superseding the byte-copy above,
its own commit — with the house dim-ambient recipe (the 2026-08-18
cards 11/12 precedent): sharp
`.modulate({ brightness: 1.28, saturation: 1.05 })`, JPEG q92, same
content name, zero code change. Chosen against four side-by-side
candidates (1.15 / 1.25 / 1.35 / 1.25+linear) with highlight clipping
measured rather than guessed: 3.0% of pixels at ≥250, concentrated in
the ceiling light panels (light sources — harmless), vs 1.5% at 1.25
and 3.8% at 1.35; the word-art print, cabinets, and cart hold texture
on the built page and the client's black shirt stays rich. The lift
changes exposure, not what the frame discloses — a brightness multiply
adds no resolution, so every illegible item in the screening record
stays illegible and the screening posture is unchanged. sharp strips
the master's (GPS-free) EXIF in the derivation — a wash. IV01 was not
re-graded: its white-room frame already sits bright beside it.
## 2026-08-25 — regenerative: the PRP media round (PRP01 + PRP02 + Amy's reel; two new scoped overrides)

**Context:** Client direction via the operator (2026-08-25), three
additions to /services/regenerative — until now the thinnest media page
(the one prp-treatment band) and one of the last approved pages: PRP01
to the left of "Who they're generally for" (plain media row), PRP02 to
the right of "Individualized, with Amy" (flip row), and PRP.MOV
standalone at the end of the body — which renders immediately before
"Your visit, step by step" (verified: nothing sits between the MDX slot
and VisitSteps in TreatmentLayout) — on autoplay. One of several
concurrent sessions this day; built in an isolated worktree on
`content/regenerative-media` off origin/phase-c. The existing band
stays; its "single media moment" comment is rewritten. ffmpeg/ffprobe
were absent from this workstation — a static build was downloaded to
the session scratchpad (session tooling, never a repo dependency).

**Sources, probed first-hand.** PRP01/PRP02: 4032×3024 iPhone JPEGs,
EXIF orientation 6 (upright 3024×4032, exactly 3:4), no GPS EXIF;
SHA-256-unique against all 55 committed photos. PRP.MOV: 8.73s, H.264
High 1920×1080 with rotation −90 (upright 1080×1920 portrait 9:16),
30fps, 15.1Mbps, 16.8MB; AAC-LC stereo ~164kbps; audio near-silent
(volumedetect mean −49.8dB, max −24.4dB); a raw camera file (Apple
metadata streams — not the TikTok aigc-label class).

**Screening record (contact sheet at 1fps + full-res grabs for the
film; magnified crops of the committed derivatives for the photos —
what ships is what was screened):**
- PRP01 (`prp-blood-draw.jpg`) — an arm with gauze at the elbow, post
  blood-draw, on a draped table; a rack of three filled collection
  tubes; a crimp-cap vial; supplies. **PHI check: PASS** — the tube
  labels are the manufacturer's own (BD Vacutainer REF/barcode class,
  mostly turned away, near-illegible at committed resolution); no
  patient label, name, or date anywhere. The vial's label faces away —
  only lot/exp field fragments and a barcode edge; no product name
  resolves. The pad's tag is a supply part number + maker's address
  (the identifiable-but-illegible class); the packet under the arm is
  unbranded. No claims or dosing content. **The arm is AMY'S OWN
  (operator, 2026-08-25 — the confirmation is the record); no release
  needed.** No override needed for this frame — screening notes only.
- PRP02 (`prp-syringes.jpg`) — four prepared PRP syringes with needles
  on a towel, gauze, a torn supply packet — and two vials whose labels
  ARE legible in the served file: "Bacteriostatic 0.9% Sodium
  Chloride / Injection, USP", "30 mL Multiple-dose", "NDC
  0409-3977-01", red "For drug diluent use only" text, "Rx only", a
  lot code, and partial manufacturer fine print. A diluent vial beside
  prepared syringes is prep-workflow imagery of the class the
  2026-07-23 rubric excluded, and pixels are invisible to lint:claims.
  **Flag raised in full → OPERATOR OVERRIDE: SHIP AS-IS** (the
  crop-out bake — which would have kept the syringes, the frame's
  subject — and the defocus bake were both offered and declined).
  Fixed terms: this frame, this page; no text from the packaging is
  ever restated in site text — copy, alt, comments, meta, OG, JSON-LD.
  Recorded in CLAUDE.md constraint 3 (the dosing/reconstitution
  bullet's pixel-override list) and BUILD_SPEC. The syringes' scale
  graduations are the engraved-scale screening-note class (the 19b
  collar precedent).
- PRP.MOV (`prp-visit.mp4`) — a single continuous selfie-style scene,
  no cut, no before/after structure, no burned-in text; the only
  legible content is the syringe's graduation numerals (engraved-scale
  class). **The film shows TWO people, which contradicted the first
  stated cast ("Amy/hands only") — stopped and re-flagged with the
  frames described.** Operator resolution (2026-08-25, the
  confirmations are the record): the RECIPIENT (pink top, face to
  camera throughout) **is Amy herself**, receiving her own PRP
  hairline treatment; the INJECTOR (black top, gloved hands, chain
  bracelet, face mostly out of frame, briefly part-visible) **is one
  of the location's other providers — OPERATOR OVERRIDE, a new
  constraint-2 scoped exception** (the radiesse-visit configuration:
  face mostly out of frame, never named), **her consent for
  needlegirlie.com use confirmed on file.** Consequence for wording:
  the film's label and captions never attribute the hands-on treatment
  to anyone; the page's "Every appointment is with Amy herself" FAQ is
  unaffected (Amy is the patient here, not a client appointment).
- **Audio: KEPT, tap-for-sound** (operator choice over the recommended
  strip — the treatment-film pattern), and **"no speech or narration"
  is the operator's on-record confirmation (2026-08-25, after
  listening; no transcription tooling on this workstation)** — with
  which `autoplay="inview"` is fully in-contract: Amy's own,
  speech-free (the constraint-2 override is a separate matter; the
  radiesse-visit film set the precedent that the two coexist).
  Captions are bounded quiet-room cues (one 2s cue), faithful to the
  near-silent track — never film-long.

**Decisions:**
- Photos: the 23a EXIF-normalize recipe, single generation each —
  sharp `.rotate()` → `.resize(1200, 1600)` (3:4 exact, no crop) →
  JPEG q92; content-named `prp-blood-draw.jpg` / `prp-syringes.jpg`
  (the PRP01/PRP02 pick labels live only in this entry). 1200px ≥ the
  680 max row tier through the 4:5 window — no retina override, no
  baked crop (portrait sources). Both rows take the sitewide
  [340, 540, 680] / 17rem contract. Default crop anchors read well at
  390 and 1280 — zero TreatmentLayout knobs this round.
- Film rendition: `-vf "scale=810:1440" -c:v libx264 -crf 20 -preset
  medium -pix_fmt yuv420p -c:a copy -movflags +faststart` → 810×1440,
  4.0MB @ 3.7Mbps (the training-reel sizing discipline: 810 ≈ 2× the
  24rem standalone cap; ffmpeg applies the −90 rotation in the filter
  graph). A lossless remux was rejected on the girl-team precedent —
  it would ship the master's 15.1Mbps / 16.8MB into an autoplaying
  slot. Poster from the rendition at 0.5s (`-q:v 2`, 810×1440, 84KB)
  → `prp-visit-poster.jpg`. Blob name `prp-visit.mp4` (content-named,
  the radiesse-visit naming family; new filename, no purge), uploaded
  AFTER this entry was committed (the written rule).
- Placement: standalone `TreatmentVideo` in the default mat frame
  inside a `mx-auto max-w-sm` wrapper (the injector-training
  standalone pattern, first use inside an MDX body), at the very end
  of the body — the film renders directly above "Your visit, step by
  step" as directed. Autoplay verified functionally on the built page
  before the upload: playing muted + looping in view, paused
  off-screen (the ICON verification pattern).
- `clinicianApproved` true → false (constraint 4 — the page was
  approved 2026-08-05). Flags on this branch read 2 true / 10 false;
  iv-therapy's reset rides the open PR #160, so once both merge the
  count is 1 true / 11 false and hormone-optimization is the last
  approved page. Amy re-reviews on the PR preview; the flag returns in
  the consolidated pre-relaunch round.

**Alternatives rejected:** the PRP02 crop-out bake (recommended —
declined; the client's frame ships whole) and defocus bake (declined);
stripping the film's audio (recommended for simplicity — operator
chose keep, tap-for-sound); a lossless remux (weight, above); wrapping
the film in a media row (the direction was a standalone placement
before the visit steps, and the mat frame is the recorded standalone
look); reusing the muted-carousel captions form (the audio is kept, so
cues must be faithful to it).

**Consequences:** the site's fifth autoplay page and the page's first
film; the page now runs the full media rhythm (band → row → flip row →
film) — the band's "single media moment" comment rewritten in the same
commit. Two new scoped overrides enter the books: the PRP02 packaging
frame (constraint 3, dosing-bullet pixel list) and the prp-visit film's
on-camera provider (constraint 2, the radiesse-visit class) — each
fixed to its asset and page; extending either requires the human
operator. /services/regenerative is pa11y-gated (the .vtt is the
video-caption gate's requirement) and outside the LHCI set; the poster
fetch and the 4.0MB in-view stream are the page-weight notes. Egress
~4MB per full play.

## 2026-08-26 — `::selection` joins the ombre companion re-ink (the invisible-highlight report on dermal-fillers)

**Context:** the text-review round surfaced it — on
/services/dermal-fillers, "Placed in proportion" "doesn't let us"
highlight or copy, on every system tried. Diagnosis, verified live on
the -149 review preview: selection itself works (a programmatic range
returns all 244 characters — copy always worked), but the sitewide
`::selection` rule painted a fixed pink-300 highlight with ink-900
letters. Pink-300's luminance sits between the ombre ramp's endpoints,
so the canvas crosses it: canvas-equal at 33.8% of the document (42%
along the ramp, 1.004:1), sub-1.2:1 from 22.0% to 45.8% — the card
plates' dead-band arithmetic exactly (their published 19.6% / 24.5% /
1.001:1 / 8–32% figures were reproduced with the same model before the
new numbers were trusted). And ink-900 selection letters match the
body text, so the letters never changed either. The section's copy
measures 34.1% of the document — the bottom of the band — with the
noir Laurel plaque directly above it highlighting in vivid pink (its
own scoped values), which made the page read as "selection dies right
here" rather than "the highlight is invisible." Site-wide in cause,
positional in effect: canvas-level prose between ~22% and ~46% of any
light page carried the same latent defect.

**Decision:** `::selection` becomes surface-scoped in global.css — an
ink-900 plate with blush-50 letters on light surfaces (4.88:1 at the
held ramp end, 15.77:1 at the top; no dead band is possible, the plate
being darker than every light surface on the site), plus a
`[data-surface='noir']` scoped rule keeping noir's pink-300/ink-900
look pixel-for-pixel. Scoped by SELECTOR, not by re-scoped semantic
tokens: custom-property resolution inside highlight pseudo-elements is
browser-divergent, so the `--ng-focus-ring` per-surface pattern (a
pseudo-class consumer) does not transfer — the new rules consume only
root-constant palette tokens, identical under every resolution model.
Verified functionally on the built page: dark plate + light letters at
the dead spot, Laurel and footer selections unchanged, FAQ cards
ink-plated, `getSelection()` returning the text throughout.

**Alternatives rejected:** any other fixed light pink (still crosses
the ramp somewhere — a point fix moves the dead band, never removes
it); surface-scoped semantic tokens consumed inside `::selection`
(bets the fix on inconsistent var-in-highlight-pseudo behavior);
leaving it (a text-review round is exactly when people copy text).

**Consequences:** selection now shows at every point of every page;
noir is untouched. Colors only — no rendered text changes, no MDX, no
`clinicianApproved` resets, no lint surface. The tokens.css OMBRE
CANVAS record carries the crossing figures alongside the card-plate
precedent.

## 2026-08-26 — dermal-fillers copy round (client wording, two batches); VisitSteps step 4 names Amy sitewide

**Context:** Client-directed copy changes on /services/dermal-fillers,
dictated by the operator across two same-day batches on one PR (#165
into `phase-c` — one preview for Amy, the 2026-08-15 combined-review
lesson). Batch 1: the lead drops "gel" ("Injectable fillers for volume
and contour.") and takes her new areas sentence and order ("Common
areas include the lips, under-eye area, cheeks, jawline and chin." —
"lipos" confirmed as a typo for "lips"); the body's near-identical
"What they are" areas sentence synced to the same order (operator's
choice, unlike the 2026-08-23 deliberately-divergent "creases" call);
the deck gains its opening — "Facial Balancing — volume and contour in
proportion — never more than the face asks for." (em dashes, the
operator's pick over the dictated hyphens); all three product cards now
read "$650 (full-syringe) or $325 (half-syringe)"; and the /services
menu-card echo drops "gel" too (serviceLines.ts — the 2026-07-30
"temporary" card-summary precedent). Batch 2: the "Placed in
proportion" parenthetical becomes a spaced em-dash pair ("Amy maps each
face — where volume sits, where it has thinned, how the features
balance — and places only what the plan calls for."); "Individualized,
with Amy" is retitled "Personalized, with Amy" (this page only) over
her new paragraph; "Lips, styled" closes "begins with a conversation."
(was "is a consultation conversation."); and "After weight loss" ends
its second sentence at "more visible." (the "than they were"
comparison dropped). Dictated typos corrected with the operator's
confirmation or on the record here: "lipos" → "lips", "grreater" →
"greater", "questios" → "questions".

**The one flag of the round, and how it resolved.** Her new
"Personalized, with Amy" paragraph drops "under clinician supervision"
— the clause the operator chose to KEEP on wrinkle-relaxers
(2026-08-23) when Amy's draft omitted it there. Flagged once with that
counterpart decision named; the operator directed the drop for this
page. Gate-clean and defensible, per the 2026-08-23 research: no
inverse check touches supervision, BUILD_SPEC §7 names it as a beat in
the copy pattern rather than a mandated string, and several pages
carry no supervision language at all. The supervised-care fact
survives on the page in "plans and performs each treatment herself".
No override, no allowlist entry — nothing trips a pattern; recorded so
the two pages' opposite calls are both visible and neither is read as
an oversight.

**Also recorded, not re-argued:** (1) the paren→em-dash change
reverses one of the 2026-07-29 em-dash-budget moves (parentheses were
that pass's approved fix for "— x —" pairs) — client wording governs,
as it did for the two-dash deck; (2) "begins with a conversation." is
another consultation-language trim, logged against the 2026-08-24
trend line as that record instructs — individually compliant, §8.7
routing intact via the layout-injected DisclaimerBlock on all twelve
pages plus this page's five FAQ consultation routings.

**VisitSteps step 4 (sitewide).** The dictated "Aftercare guidance"
sentence differed from the shipped text by two words: "reach out"
becomes "reach out to Amy". The sentence lives in the shared
`VisitSteps.astro`, so the change lands on all twelve treatment pages
and the styleguide — surfaced before editing (the 2026-08-24 lesson: a
sentence a page displays is not necessarily a sentence that page
owns), and the operator chose sitewide over page-scoped machinery,
exactly as for steps 2 and 3 on 2026-08-24. Naming Amy is the same
gain step 2 got. `check:approvals` cannot see a component edit;
hormone-optimization — the one page still `clinicianApproved: true` —
keeps its flag at the operator's standing direction, and
CLINICIAN-SIGN-OFF carries the new words as a cross-cutting item so
Amy sees them.

**Alternatives rejected:** page-scoped step-4 wording (a VisitSteps
prop + layout pass-through + schema field — rejected 2026-08-24 as
more machinery than the sentence, and again here); keeping the
dictated hyphens in the deck and the mapping aside (operator chose em
dashes); leaving the /services menu-card echo on "gel" (operator chose
the sweep).

**Consequences:** `compliance/banned-patterns.json` untouched all
round — no new string trips any pattern and nothing needed an
allowlist entry. dermal-fillers' `clinicianApproved` was already
`false` (2026-08-21), so no reset fired; flags stand at 1 true / 11
false (hormone-optimization only). The lead edit reaches the Service
JSON-LD description via `[slug].astro` (verified claims-clean in the
built output); the deck reaches no meta, OG, or JSON-LD (verified).
"Individualized, with Amy" remains the heading on the other treatment
pages — the retitle is this page's alone, and syncing any sibling is a
fresh direction, not a tidy. Amy reviews the full round on the PR #165
preview; the sign-off row and the step-4 cross-cutting note are the
review record.

## 2026-08-26 — /about milestones: MA chevron plates replace the numerals

**Context:** Operator direction (reference screenshot chevrons02.png,
repo root): the "Two decades in the making." timeline's 01–04
numerals become the MA chevron plates the treatment pages' VisitSteps
wears. This supersedes the scoping in the 2026-08-19 VisitSteps entry
— "The /about milestones keep their numerals (career timeline —
different object)" — by the operator's own call. The two patterns are
siblings: the timeline runs the Playfair-counter recipe hand-copied
2026-08-15 FROM VisitSteps, which retired it 2026-08-19 for the
plates; this change closes the recipe's last live use.

**Decision:** Hand-copy, one page. about.astro gains the FOIL_STOPS +
CHEVRONS consts (verbatim from VisitSteps.astro, itself verbatim from
src/assets/brand/mobile-aesthetics-mark-header.svg; MA is Amy's own
PLLC — constraint 2 not engaged, DECISIONS 2026-07-23) and four badge
divs with gradient ids about-foil-0…3 — an id namespace of its own,
indexed so no page carries duplicate ids (axe). The counter CSS
retires; the plate rules are hand-copied (noir plate, 7rem,
decorative, aria-hidden). NO sr-only ordinal joins the headings — a
deliberate asymmetry with VisitSteps' "Step N.": step numbers carry
meaning in a process walkthrough but would misdescribe a biography
timeline whose headings carry the years; the ol[role="list"]
announces order and count as before, and sighted users lose the
identical numerals, so no cross-modality gap opens (SC 1.3.1/1.1.1
hold). Knock-on: --ng-display-accent now has no light-canvas
consumer; the ombre re-ink STAYS (defense-in-depth — magenta-600 at
~1.9 mid-ramp may never render on the ramp) and the tokens.css OMBRE
CANVAS record says so.

**Alternatives rejected:** extracting a shared badge component
(touches VisitSteps → re-verifying 12 treatment pages + styleguide
for a /about-only ask, and collides with the parallel session working
treatment pages today; consolidation stays available as a later
round); converting the four hand-written li's to an array+map (moves
Amy-confirmed copy — PR #83 — into frontmatter strings and changes
built bytes, the &middot; entities; the insertion-only diff wins); an
sr-only "Milestone N." (new AT-only copy adding nothing the years
don't already carry).

**Consequences:** the chevron data now lives in three places (brand
SVG → VisitSteps → about), each copy under a dated provenance comment
— drift is discoverable, and consolidation is a one-round job if a
fourth consumer ever appears. The 49px-Playfair-outside-headings
sanction and the display accent's light-canvas consumer both retire
with the counter. Design-only: no rendered-text changes, no MDX, no
clinicianApproved implications.

## 2026-08-26 — the team film goes widescreen (a scoped crop override, checkpoint-approved)

**Context:** Operator direction: the /about Girl Team film's vertical
screen becomes "a screen laying horizontal." Probed at frame level,
the film is NATIVELY portrait — every frame is 1080 wide with no side
matte, ~17% of frames are full-bleed 1080×1920 (the B&W montage), the
opener band is 4:5, and the widest recurring content band is
1080×720; there is no letterboxed 16:9 picture to reveal. Flagged to
the operator with the two honest builds (a true 16:9 crop that trims
the tallest shots, or a horizontal stage around the intact vertical
film); the operator chose the crop. RUNBOOK's sounded-film rule says
"nothing crops or masks a film" — this is a scoped operator override
of that sentence, after the flag; the RUNBOOK gains the parenthetical.

**Decision:** `girl-team-film-wide.mp4` — a static 16:9 center crop
of the master (`crop=1080:608:0:656`; every stable shot's content
band centers at y=960, verified by per-frame cropdetect), H.264 CRF
23 + `-c:a copy` + faststart: 4.19MB / 2.4Mbps, audio byte-identical
so the caption cues carry over. CRF 23 is this master's own recorded
precedent. Checkpoint before upload (the ship gate): seven pre/post
frame pairs, poster candidates, and page mocks presented on a review
page; the crop verified kinder than the static arithmetic suggested —
the film's per-shot zooms mean the wide window catches a complete
composition in nearly every beat: all heads stay in frame throughout,
the neon sign and the burned-in "GiRL TEAM" overlay both survive
(so the player label and the opening caption cue stay accurate), and
the losses are lower legs in the two full-height beats plus the
opener's counter. Operator approved the crop and poster A (the
opener frame). New filename per the RUNBOOK's own preference (no
purge); poster forked from the new rendition —
`girl-team-film-wide-poster.jpg`, 1080×608, which is also what flips
the aspect-agnostic player's box to landscape (the carousel keeps the
portrait rendition and poster untouched); new VTT with the NOTE
rewritten and cues unchanged; the `.about-team-film` 18rem cap
retired — the film fills the unit column, and the unit reads still →
plate → button → film at one width. CLAUDE.md's constraint-2 second
exception is updated in-PR to the new rendition name (the 2026-08-25
widening precedent); its operative terms — placement, sound behavior,
releases, third-placement-requires-operator — are unchanged. The
fourth exception's classifier-blocked cross-reference sentence
remains the operator's open passage, untouched.

**Alternatives rejected:** the horizontal noir stage around the
intact portrait film (offered; the operator chose the crop); reusing
the carousel rendition (portrait AND audio-less); per-shot dynamic
cropping (only single-frame transitions sit off-center — complexity
with no visible gain); replacing the object in place (edge caches it
for a day; a new name needs no purge).

**Consequences:** the sounded /about rendition and the muted carousel
rendition now differ in shape as well as sound — the "one master, two
renditions" RUNBOOK note carries both names. Egress per full play
drops ~7MB → ~4.2MB. The retired portrait object `girl-team-film.mp4`
is deleted from Blob only when NO open PR's branch references it —
at merge time the parallel session's dermal-fillers PR (#165) still
does, so the deletion waits for that PR and is verified by re-running
the branch grep until clean. Its VTT is deleted in this PR (served
per-branch, same-origin — old branches keep their own copy).

## 2026-08-26 — the Evolus Laurel centers on /about's band

**Context:** Operator report: the plaque "looks like it's off" on
desktops. Measured live at 1440: the 768px noir slab sat with 160px
of canvas to its left and 512px to its right. Cause: the whole
Evolus unit lives in a deliberately left-aligned max-w-3xl column
(the 2026-08-18 "milestones idiom" intent, recorded when the
recognition plate moved from wrinkle-relaxers) inside the centered
max-w-6xl section — and the plaque, the unit's only full-bleed noir
box, is what makes the left bias read as a defect. Treatment pages
center it for free (their article is mx-auto).

**Decision:** The plaque hoists into its own `mx-auto max-w-3xl`
wrapper at the top of the same section; the "Inside Evolus" heading,
prose, and ICON film keep the left-aligned column and its recorded
idiom. Supersedes the 2026-08-18 left-aligned-column intent FOR THE
PLAQUE ONLY (operator direction). No change below 816px viewport
(the column already fills the band). Verified: gaps 328/344 at 1440
(the 16px delta is the scrollbar), heading rail unchanged, the
component has no width/margin rules that fight the wrapper.

**Alternatives rejected:** centering the whole unit (indents the
heading off the page's left rail shared by every other section);
margin-inline on the component (a no-op inside a full-width parent,
and it would repaint nothing on the treatment pages either — the
wrapper is the actual knob).

**Consequences:** /about's Evolus section now has two column blocks
(centered plaque, left-aligned unit). Design-only: no rendered-text
changes, no MDX, no clinicianApproved implications.

## 2026-08-26 — the Evolus unit centers whole, text included (second pass, same day)

**Context:** Operator direction on seeing the first pass rendered:
"Inside Evolus", its paragraph, and the ICON film still sat too far
left on desktops — center them too. This chooses exactly what this
morning's plaque entry listed under alternatives rejected ("centering
the whole unit indents the heading off the page's left rail"): the
operator saw the centered plaque above the left rail and picked the
whole unit. A planning flag shaped the form: block-centering the
column alone would not read centered for the TEXT (the heading is
~200px, the paragraph ~533px, in a 768px column — the film alone
fills it), so the operator was offered block-centered vs
text-centered and picked TEXT-CENTERED, /about's own "Ready when you
are" band being the page's precedent.

**Decision:** The section's two column divs merge back into one
`mx-auto max-w-3xl` (vertical rhythm identical — the rule's mt-12/16
collapsed through the old second div's top edge). Per-element
centering, not a wrapper `text-center`: the accent rule gains
`mx-auto`, the h2 `text-center`, the paragraph `mx-auto text-center`
(the 65ch block centers, its lines center); the ICON film centers by
filling the column, and its printed figcaption deliberately keeps
its left seat at the film's edge — nothing re-aligns unreviewed.
Verified on the built page: heading, paragraph, and film centers all
at 0px offset from the band's center at 1440 (the trace-animation
transform makes mid-animation rule measurements read ~28px left —
measure after it settles). Classes only; every word byte-identical.

**Alternatives rejected:** block-centered with left text (offered —
the operator picked text-centered); `text-center` on the wrapper
(silently re-aligns the film's figcaption and touches the plaque's
already-centered internals).

**Consequences:** "Inside Evolus" leaves the left heading rail the
other sections share — the request, with the centered plaque and
film keeping the unit coherent as the page's showcase band. The
2026-08-18 left-aligned-column intent is now fully superseded (the
morning entry took the plaque; this one takes the rest). Design-only:
no MDX, no clinicianApproved implications, no lint surface.

## 2026-08-26 — a moved base silences a PR's CI (the conflicted-PR class hits a feature PR); the standing previews get a no-checkout refresh

**Context:** With two sessions merging into `phase-c` in parallel, the
open dermal-fillers PR (#165) went silent: after its batch-2 push,
GitHub created NO workflow runs — not the PR preview, not the Relaunch
guard — and a close/reopen cycle plus an empty-commit nudge were
swallowed too, five qualifying events over ~90 minutes. It was
misdiagnosed as a GitHub Actions outage (workflows verified active,
Actions enabled, triggers correct, no posted incident) until the
operator supplied the deciding fact: the /about session's pushes were
running fine. The real mechanism was already in the RUNBOOK, filed
under PR #95: **GitHub creates no `pull_request` runs for a PR whose
merge ref it cannot compute.** The /about session's merges (#164,
#166) had moved `phase-c` under the open PR at 19:53Z, the branches
conflicted on the append-only docs (DECISIONS tail, CHANGELOG head),
and everything after that instant was silently dropped. The timeline
matched exactly: the PR's own opening ran at 19:48Z; nothing ran
after 19:53Z.

**Decision:** merge `origin/phase-c` into the PR branch and resolve
keep-both (the 2026-08-15 rule — their three /about entries and the
copy round's entry all survive; no source files collided). Full
verify green; on push, both workflows fired within seconds and ran
green; the PR converged and merged (`85b51ba`). The RUNBOOK gains a
troubleshooting entry putting `gh pr view --json mergeable` FIRST in
this diagnosis — the check that was skipped for an hour — and naming
close/reopen and nudge commits as useless here (their events need
the same merge ref).

**The second procedure this surfaced:** refreshing the standing
previews after the merge, both preview branches
(`chore/monday-demo-preview`, `review/page-numbers`) were checked out
in the other sessions' worktrees (`website-iv`, `website-tags`), so
`git checkout` refuses them in this tree. Refreshed WITHOUT a
checkout: `git merge-tree --write-tree origin/<branch> phase-c` →
`git commit-tree` with both parents → push the commit to the branch
ref. Both merged clean, both environments probed to convergence.
The recipe is now in the RUNBOOK beside the refresh rule, with the
caveat that the holding session's local branch is left behind origin
and must pull before its own next refresh.

**Alternatives rejected:** force-pushing `phase-c` over a preview
branch (destroys its merge history for nothing); `git worktree add
--force` to double-check-out a locked branch (fights the other
session for the same ref); waiting out the "outage" (there was none
to wait out).

**Consequences:** two harmless artifacts remain on the merged branch
from the misdiagnosis — an empty "chore: nudge CI" commit and a
close/reopen cycle on PR #165 (no side effects; no workflow ran on
either event). The generalizable rule, recorded so the next silence
is diagnosed in one command: **when a push creates no runs at all,
check the PR's mergeability before anything else** — in a
two-session week, a moved base is the likely cause, and the fix is a
sync merge, not a CI remedy. REDESIGN gains the copy round's tracker
row in the same commit (it was missing against the wrinkle-relaxers
precedent). Docs-only; no gate, config, or content changes.
