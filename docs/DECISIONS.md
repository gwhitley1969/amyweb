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
