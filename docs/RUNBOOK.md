# Runbook — needlegirlie.com operations

Everything needed to run, change, and fix the site. Written for the operator;
assumes `az` and `gh` CLIs authenticated against the client tenant
(`needlegirlie.onmicrosoft.com`) and the GitHub repo (`gwhitley1969/amyweb`).

> **STATUS 2026-08-05: production is OFFLINE — serving the Under
> Construction placeholder.** The launch merge was reverted at operator
> direction (revert commit `e57a4448`; DECISIONS 2026-08-05 takedown
> entry) pending a client review round. Relaunch is TWO-STEP — see
> "Relaunching after the takedown" under Rollback. While the revert is
> main's tip: never merge `main` into `phase-c` (including PR #95's
> "Update branch" button) and never close PR #95. The `-95` preview
> cannot deploy during the takedown (merge ref conflicted by design);
> the full-site demo preview is **PR #97**'s environment.

## The system at a glance

| Piece | Value |
|---|---|
| Production | https://needlegirlie.com (canonical apex) |
| Redirecting hosts | www.needlegirlie.com, needlegirl.com, www.needlegirl.com → 301 to apex |
| Front Door | profile `afd-needlegirlie`, endpoint `needlegirlie` (`needlegirlie-b9bbeadqaucyd7af.z03.azurefd.net`), ID `ee68a15a-55e1-4220-8016-3052e33d4988` |
| Static Web App | `stapp-needlegirlie` (`polite-flower-0a41b770f.7.azurestaticapps.net`) — direct hits are **refused by design** (locked to Front Door; the config is the documented 403 form, but the platform was observed answering 404 with zero site content at launch, 2026-08-05 — either way, blocked) |
| Resource group | `rg-needlegirlie-web` (eastus2); DNS zones live in `rg-corp` |
| Subscription | `ng-website` (`62cd1c71-3239-4b8b-8a10-4dc4da52e29e`) |
| Budget | $60/mo, alerts at 50%/80% actual + 100% forecast |

The Front Door **default endpoint** (`*.azurefd.net`) serves 404 — also by
design: `allowedForwardedHosts` only admits the real hostnames.

## Everyday changes (content/code)

1. Branch → edit → `npm run verify` (must be green; never weaken a gate).
2. Open a PR. CI verifies again and deploys a **preview environment**
   (URL in the workflow summary). Previews are **public and noindexed** —
   no password (DECISIONS 2026-07-21) — so the URL can go straight to Amy,
   but only **after the deploy run completes**: sent earlier it 404s and
   reads as a broken link. Closing the PR tears the preview down.
   *Documentation-only PRs run nothing and get no preview* — `paths-ignore`
   covers `docs/**`, `**/*.md`, `.gitignore` (DECISIONS 2026-07-26). Touch
   one source file and the full suite runs as usual.
3. Merge to `main`. The production workflow re-verifies, runs the
   **clinician-approval gate**, deploys, and purges the Front Door cache.
   Live in ~5–10 minutes end to end.

## Where `phase-c` is visible

`pr-preview.yml` triggers on `pull_request` only — never on `push`. Pushes
to `phase-c` deploy only while a **standing PR from `phase-c` → `main` is
open**: each push is a `synchronize` event on it, so that PR's preview
environment is effectively the stable `phase-c` preview.

Launch PR #5 played this role until it merged as the launch merge
(2026-08-05), which tore its `…-5…` environment down. **The standing PR is
now #95** (draft "Next release"), so the stable preview lives at
`https://polite-flower-0a41b770f-95.eastus2.7.azurestaticapps.net` — note
it deploys on the next push whose diff touches a source file
(documentation-only diffs are `paths-ignore`d, above). Merging the standing
PR is a production release; open the next one right after.

The environment number is the PR number — PR #61's preview was `…-61…`.
**Consequence worth knowing:** if the standing PR is ever closed without a
replacement, pushes to `phase-c` stop deploying anywhere, with no failing
run to point at. Open a new PR from `phase-c` rather than debugging the
workflow.

Treatment-content rules (CLAUDE.md hard constraint 4): only a human sets
`clinicianApproved: true`; any edit to approved content resets it to `false`
in the same commit; production deploys fail while unapproved non-draft
treatment content exists.

## Rollback

Never force-push or rewrite `main`. Revert instead:

```
git revert <bad-commit-sha>
git push origin main
```

The production workflow redeploys the previous state and purges the cache.
(To revert a MERGE commit, add `-m 1` — parent 1 is the main side.)

### Relaunching after the takedown (2026-08-05)

The takedown reverted the launch merge (revert commit
`e57a4448f77e8ff64c623cd1d734fddfb0f00801`). Because main's history
still CONTAINS the phase-c commits, merging phase-c alone will NOT
restore the site — only post-takedown commits would apply, producing a
broken hybrid. Relaunch is two-step, in order:

1. **Revert the revert** on `main` (restores the full launch tree
   exactly): `git revert e57a4448…`, verify, push per this runbook —
   or carry both steps in one relaunch PR.
2. **Merge the updated `phase-c`** (brings the post-takedown
   revisions). Content edits made during revision reset the affected
   pages' `clinicianApproved` flags (constraint 4), so
   `check:approvals` correctly blocks production until Amy re-approves
   on a preview and the operator flips the flags — the same sign-off
   flow as launch.

During the takedown: never merge `main` into `phase-c`, never press
"Update branch" on PR #95, never close PR #95 (the standing-PR pattern
survives for relaunch). Interim previews come from sub-PRs into
`phase-c` — PR #97 is the standing full-site demo (comment-only diff,
never merges; close it without merging when no longer needed).

## Manual cache purge

Deploys purge automatically. To force one:

```
az afd endpoint purge -g rg-needlegirlie-web --profile-name afd-needlegirlie \
  --endpoint-name needlegirlie --content-paths '/*'
```

HTML is edge-cached ~5 minutes (`max-age=300`); hashed `/_astro/*` assets are
immutable and never need purging.

## Preview access

There is none to manage: SWA password protection is **off**, and preview
environments are public + noindexed (DECISIONS 2026-07-21 — the basicAuth
cookie looped in Chrome for Windows and locked Amy out). `infra/swa.bicep`
deliberately declares no basicAuth resource; **do not re-add one** without
the operator, or the same lockout returns.

## Infrastructure changes (Bicep)

All Azure state is captured in `infra/`. To apply changes:

```
az deployment sub create --location eastus2 --template-file infra/main.bicep \
  --parameters budgetStartDate=<yyyy-MM-01>
```

Idempotent — safe to re-run. `budgetStartDate` is the only parameter without
a default, so it must be supplied each run; `location`,
`dnsZoneResourceGroup`, and `budgetContactEmails` default correctly.

Adding a Front Door custom domain takes three phases: TXT validation
(instant, automated in Bicep) → managed cert issuance (minutes) → edge
rollout (typically 10–30 min, occasionally up to an hour). During rollout
the domain serves Front Door's generic `*.azureedge.net` certificate and a
blue "Page not found" placeholder — **this is normal**; wait, don't debug.

## GitHub wiring

Secrets/variables are documented in `OPERATOR-SETUP.md` (all configured
2026-07-07). Two behaviors worth remembering:

- The production **deploy job only runs when the `FRONT_DOOR_ID` repo
  variable is set** — unsetting it is the kill switch for deploys while
  leaving CI gates active.
- The SWA deploy action uploads the pre-verified `dist/` as-is; it must
  never be allowed to build on its own.

## Troubleshooting

- **"Not secure" in a browser on the operator workstation:** the Canopy
  content filter (Netspark engine, local proxy on 127.0.0.1:3128) intercepts
  browser TLS and can present wrong certificates or stale content. Verify
  from a phone on cellular data, or with a direct handshake:
  `openssl s_client -connect needlegirlie.com:443 -servername needlegirlie.com`.
  Real visitors are unaffected.
- **CI fails in pa11y/Lighthouse with Chrome crashes:** the gates prefer the
  runner's system Chrome (`scripts/lib/chrome.mjs`); puppeteer's downloaded
  build has crashed on ubuntu-24.04 runners before.
- **CI fails a Lighthouse METRIC while every resource-summary budget
  passes:** likely a shared-runner phantom (three known cases were TBT on
  zero-JS pages; local TBT measures 0 ms). The gate already asserts the
  median of 3 runs (DECISIONS 2026-07-19). If a phantom still gets through:
  rerun once; if the identical code passes, the pre-agreed escalation rule
  applies — flag the operator with the evidence before touching any
  assertion. Expected verify wall time is ~6 minutes (3 Lighthouse runs
  per URL).
- **Production build fails with "FRONT_DOOR_ID is missing":** intentional —
  a production artifact must never ship without the origin lockdown GUID.
- **Stale page after a deploy:** hard refresh (Ctrl+F5); remember the 5-min
  HTML edge cache plus any local Canopy cache.
- **Preview serves unstyled HTML or mixed 404s after a "Succeeded" deploy:**
  the staging environment propagated unevenly (a bad serving replica). Tells:
  the 404s are SWA's *platform* page, not the branded /404; they come in
  bursts even on cache-busted URLs (`?bust=<unique>` — busted 404s prove the
  origin is at fault, not the browser/Canopy cache); pages render unstyled
  when HTML comes from a healthy replica but the hashed CSS 404s. If CI's
  pa11y passed, the artifact is not the suspect — do not "fix" code or
  gates. Kick: re-run the deploy workflow (`gh run rerun <id>`). If it
  persists, close and reopen the PR: teardown + recreation replaces the
  serving pool (same `-NN` hostname). Verify with 3–4 probe passes ~45s
  apart across several routes before sharing the URL — single green probes
  lie; the bursts have appeared ~100s in. Advise Ctrl+F5 locally afterward.
  (2026-08-01 incident, PR #79 — DECISIONS.)

## Reference docs

- `DECISIONS.md` — why things are the way they are (append-only).
- `OPERATOR-SETUP.md` — GitHub/Azure wiring details.
- `BRAND-ASSETS.md` — logo sources and the export pipeline.
- `.claude/BUILD_SPEC.md` — the specification; §16 is the launch checklist.
