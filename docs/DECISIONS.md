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
