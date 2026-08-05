# Runbook — needlegirlie.com operations

Everything needed to run, change, and fix the site. Written for the operator;
assumes `az` and `gh` CLIs authenticated against the client tenant
(`needlegirlie.onmicrosoft.com`) and the GitHub repo (`gwhitley1969/amyweb`).

## The system at a glance

| Piece | Value |
|---|---|
| Production | https://needlegirlie.com (canonical apex) |
| Redirecting hosts | www.needlegirlie.com, needlegirl.com, www.needlegirl.com → 301 to apex |
| Front Door | profile `afd-needlegirlie`, endpoint `needlegirlie` (`needlegirlie-b9bbeadqaucyd7af.z03.azurefd.net`), ID `ee68a15a-55e1-4220-8016-3052e33d4988` |
| Static Web App | `stapp-needlegirlie` (`polite-flower-0a41b770f.7.azurestaticapps.net`) — returns **403 direct; by design** (locked to Front Door) |
| Resource group | `rg-needlegirlie-web` (eastus2); DNS zones live in `rg-corp` |
| Subscription | `ng-website` (`62cd1c71-3239-4b8b-8a10-4dc4da52e29e`) |
| Budget | $60/mo, alerts at 50%/80% actual + 100% forecast |

The Front Door **default endpoint** (`*.azurefd.net`) serves 404 — also by
design: `allowedForwardedHosts` only admits the real hostnames.

## Everyday changes (content/code)

1. Branch → edit → `npm run verify` (must be green; never weaken a gate).
2. Open a PR. CI verifies again and deploys a **preview environment**
   (URL in the workflow summary; password-protected — share the password
   with Amy for review). Closing the PR tears the preview down.
3. Merge to `main`. The production workflow re-verifies, runs the
   **clinician-approval gate**, deploys, and purges the Front Door cache.
   Live in ~5–10 minutes end to end.

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

## Manual cache purge

Deploys purge automatically. To force one:

```
az afd endpoint purge -g rg-needlegirlie-web --profile-name afd-needlegirlie \
  --endpoint-name needlegirlie --content-paths '/*'
```

HTML is edge-cached ~5 minutes (`max-age=300`); hashed `/_astro/*` assets are
immutable and never need purging.

## Preview password

Protects all non-production SWA environments (form login, cookie session).
Consumed only by humans — no pipeline or identity uses it. Rotate either in
Portal → `stapp-needlegirlie` → Configuration → Password protection, or by
re-running the infra deployment with a new `previewPassword` value (below).

## Infrastructure changes (Bicep)

All Azure state is captured in `infra/`. To apply changes:

```
az deployment sub create --location eastus2 --template-file infra/main.bicep \
  --parameters previewPassword=<current-or-new> budgetStartDate=<yyyy-MM-01>
```

Idempotent — safe to re-run. `previewPassword` must be supplied each run
(it is not stored anywhere; supplying a new value rotates it).

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
- **Production build fails with "FRONT_DOOR_ID is missing":** intentional —
  a production artifact must never ship without the origin lockdown GUID.
- **Stale page after a deploy:** hard refresh (Ctrl+F5); remember the 5-min
  HTML edge cache plus any local Canopy cache.

## Reference docs

- `DECISIONS.md` — why things are the way they are (append-only).
- `OPERATOR-SETUP.md` — GitHub/Azure wiring details.
- `BRAND-ASSETS.md` — logo sources and the export pipeline.
- `.claude/BUILD_SPEC.md` — the specification; §16 is the launch checklist.
