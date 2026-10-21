# ARCHITECTURE.md — needlegirlie.com

The standing architecture record for this repo: the narrative an engineer
reads first. The normative statements live in `.claude/BUILD_SPEC.md` — §2
architecture, §4 technical configuration, §11 analytics, §14 CI/CD, §15
infrastructure — and in CLAUDE.md's hard constraints, and this file cites
them rather than restating them. Where the two disagree, BUILD_SPEC is
fixed first and this file follows in the same commit. The *why* of every
decision cited here is in `docs/DECISIONS.md`; the *how* of every
procedure is in `docs/RUNBOOK.md`.

**How this file was checked.** Every statement about live Azure state was
read on 2026-10-21 with `az` against the `ng-website` and `ng-app`
subscriptions and with `curl` against the public hostnames, and is marked
*(verified 2026-10-21)* where it carries weight. A statement that rests on
the repo's records alone carries no mark. The few things that could not be
confirmed are marked UNVERIFIED. The sibling record is the app repo's
`docs/ARCHITECTURE.md`, whose section structure this file follows.

## 1. Purpose and scope

needlegirlie.com is the marketing website for Needle Girlie, the personal
brand of Amy Palacios, FNP — built and maintained by Xtend-AI, LLC for a
paying client. It is a **fully static Astro 5 site**: pages are rendered to
HTML at build time, uploaded to Azure Static Web Apps, and served through
Azure Front Door. Its job is to look premium, route every visitor to a
booking or a consultation, be found locally, be fast, be accessible, and
stay compliant (BUILD_SPEC §1).

What it is not, and must not become (CLAUDE.md hard constraints 1 and 5):
there is **no server code** — no SWA Functions, no API routes, no
server-side rendering, no database — and there is **no data collection** —
no cookies, no forms, no PII, no third-party trackers or pixels. The
mobile app and its AI assistant are a separate repo (`C:\Amy\app`,
`gwhitley1969/amyapp`) in a separate subscription; nothing from it lives
here. The one place the two touch is the edge: this repo's Front Door
profile carries two hostnames for the app (§2, §4.5).

## 2. System context

**The visitor's browser** is the only client. It receives HTML, CSS, one
font family, images, a handful of static scripts and, from a second
hostname, the films. It sends nothing back to this system: no form posts,
no cookies, no analytics beacons while Plausible stays dark (§4.6).
Everything a visitor *does* is a link-out that leaves the site — booking
on Aesthetic Record (`siteConfig.booking.url`; that page answers 403 to
non-browser clients, so its reachability is checked in a browser), a phone
call (`tel:`), the skinbetter storefront, Amy's practice site, social
profiles and map links — all enumerated in `src/lib/siteConfig.ts` under
the scoped exceptions CLAUDE.md records. BUILD_SPEC §9: every integration
is outbound; no data is exchanged.

**Azure DNS** holds two zones in `rg-corp` (subscription `ng-website`):
`needlegirlie.com` and the legacy `needlegirl.com`. Both apexes are alias A
records to the Front Door endpoint; `www`, `media`, `api` and `login` are
CNAMEs to the endpoint hostname; the `_dnsauth.*` TXT records carry Front
Door's managed-certificate validation tokens (`infra/dns.bicep`,
`infra/dns-needlegirl.bicep`). The zones also carry records this repo does
not declare (§5).

**Azure Front Door Standard** (`afd-needlegirlie`, endpoint
`needlegirlie`, `needlegirlie-b9bbeadqaucyd7af.z03.azurefd.net`) is the
single public edge. It terminates TLS with managed certificates on seven
custom domains, redirects HTTP to HTTPS and the `www` and legacy hosts to
the canonical apex, caches and compresses, and forwards to one of four
origins by hostname: the Static Web App for the pages, Blob Storage for the
films, and — for the app — the Function App and the Entra External ID
tenant. There is no WAF policy on the profile (`{{WAF_DECISION}}` open;
*verified 2026-10-21*: `az afd security-policy list` returns nothing).

**Azure Static Web Apps Standard** (`stapp-needlegirlie`,
`polite-flower-0a41b770f.7.azurestaticapps.net`, East US 2) is the origin
for every page. It holds the built `dist/` of `main` as its production
environment and one preview environment per open pull request. In
production its generated config admits only this Front Door profile (§6);
a direct hit on the `azurestaticapps.net` hostname is refused (*verified
2026-10-21*: 403).

**Blob Storage** (`stngmediag2g4stj5m2gts`, Standard_LRS, container
`media`, anonymous blob read) holds the `.mp4` renditions of the site's
films, served only as `https://media.needlegirlie.com/<file>.mp4` through
the Front Door `media` route. Nothing links the raw blob hostname. Captions
(`.vtt`) are not here: they stay in the repo under `public/media/`, served
same-origin from the Static Web App, because they are compliance-screened
text whose git trail matters (DECISIONS 2026-08-17, the media-origin
entry).

**GitHub** (`gwhitley1969/amyweb`) is the source of truth for everything
but the films, and GitHub Actions is the only thing that deploys the site.
Two couplings cross from GitHub into Azure: the SWA deployment token (a
repository secret) that uploads a build, and an OIDC federated identity
that logs in to purge the Front Door cache after a production deploy.
Neither can create, delete or re-role anything (§6).

**The Needle Girlie app** (repo `gwhitley1969/amyapp`, resource group
`rg-needlegirlie-app`, subscription `ng-app`) is a tenant of this repo's
edge, not a component of this site. `api.needlegirlie.com` and
`login.needlegirlie.com` are custom domains and routes declared in
`infra/frontdoor.bicep` whose origins — `func-needlegirlie-api.azurewebsites.net`
and `needlegirlieapp.ciamlogin.com` — live outside this subscription. The
dependency is one-way and by hostname only: this Bicep names the Function
App's hostname as a parameter default, holds no cross-subscription resource
id, and shares no state beyond DNS and the edge (DECISIONS 2026-09-07).
§4.5 records what was verified about that path on 2026-10-21.

**Search engines** read `robots.txt` (allow all, names the sitemap) and
`sitemap-index.xml` from production; previews carry `X-Robots-Tag: noindex,
nofollow` and a `noindex` meta so drafts never index. Google Search Console
is verified as a Domain property by a TXT record at the zone apex, and Bing
imports from it (DECISIONS 2026-10-12); neither needs anything on a page.

**Plausible** is the one third party the site is wired to talk to, and it
is dark: the self-hosted tracker is in the repo, nothing emits it, and the
CSP admits `plausible.io` only in a build that actually shipped the script
(§4.6).

**Amy** reviews on PR previews, which are public and noindexed by the
operator's decision (DECISIONS 2026-07-21), and signs off treatment
content in `docs/CLINICIAN-SIGN-OFF.md`; the production pipeline refuses
to deploy while a non-draft treatment page is unapproved (constraint 4).
She holds no Azure or GitHub access; the operator holds both.

## 3. Containers

```
Visitor (mobile-first)              Search engines           Amy (reviews previews)
   │ HTTPS                               │                          │
   ▼                                     ▼                          ▼
Azure DNS (rg-corp, ng-website)  needlegirlie.com · needlegirl.com
   │ apex alias A + www/media/api/login CNAMEs → the one Front Door endpoint
   ▼
Azure Front Door Standard  afd-needlegirlie / endpoint needlegirlie  (no WAF)
   ├─ route default  needlegirlie.com · www · needlegirl.com · www.needlegirl.com → og-swa
   │     HTTP→HTTPS · www + legacy hosts 301 → apex · edge cache · compression
   ├─ route media    media.needlegirlie.com  (originPath /media)                → og-media
   ├─ route api      api.needlegirlie.com    (HTTPS only, no cache, no redirect) → og-api   ┐ the app's,
   └─ route login    login.needlegirlie.com  (no cache)                          → og-login ┘ declared here
   ▼                       ▼                        ▼                        ▼
Static Web App Standard    Blob Storage             Function App             Entra External ID
stapp-needlegirlie         stngmedia…  /media       func-needlegirlie-api    needlegirlieapp.ciamlogin.com
 production = main          .mp4 films, public read  (rg-needlegirlie-app,    (the app's external tenant;
 + one env per open PR      LRS, TLS 1.2             ng-app — the app repo)   custom URL domain)
 locked to this Front Door
 ▲ deployment token
GitHub Actions (gwhitley1969/amyweb)
 pr-preview.yml: fast gates → preview deploy → slow gates · close → tear down
 production.yml (main): verify + approvals gate → locked build → deploy → OIDC login → purge
 ▲
GitHub repo — Astro 5 static site · content in MDX · Bicep in /infra · SWA config templates in /config/swa
Budget budget-ng-website $60/mo (50% · 80% actual, 100% forecast)
```

**Azure DNS.** Responsibility: name resolution for both domains and the
proof of ownership Front Door's managed certificates need. Technology: two
existing zones in `rg-corp`, referenced and never recreated by Bicep; the
apex is an alias A record, because an Azure DNS alias to a Front Door
endpoint is what lets an apex point at Front Door at all. Scaling and
cost: Microsoft's; pennies.

**Azure Front Door Standard.** Responsibility: TLS, the HTTPS redirect, the
canonical-host 301s, edge caching and compression for the pages, routing
by hostname to four origins, and the cache purge after every release.
Technology: one profile, one endpoint, four routes, four origin groups,
seven custom domains, one rule set with two redirect rules — all in
`infra/frontdoor.bicep` and matching the live profile (*verified
2026-10-21*: every custom domain `Approved`/`Succeeded` with a managed
certificate at TLS 1.2; the routes, origins and rules as declared; no
`what-if` was run). Only `og-api` carries a health probe (`/healthz`,
every 100 s) because only that origin scales past one instance. Scaling:
Microsoft's edge. Cost: the fixed Front Door Standard line plus egress —
the largest part of the ~$45–55/month run-rate target (CLAUDE.md "How to
operate").

**Azure Static Web Apps Standard.** Responsibility: hold and serve the
built site and its per-PR previews; apply the generated
`staticwebapp.config.json` (headers, cache rules, the 404 rewrite and, in
production, the origin lockdown). Technology: SKU Standard in East US 2
(the closest SWA region to the Charlotte market, DECISIONS 2026-07-07; the
region holds configuration only, serving is global), staging environments
enabled, enterprise-grade CDN disabled because Front Door sits in front,
`allowConfigFileUpdates` on because the config is generated at build, no
custom domains of its own and no basicAuth resource (`infra/swa.bicep`;
*verified 2026-10-21*). Scaling: the platform's. Cost: the Standard plan's
fixed line, needed for the SLA and the preview environments (BUILD_SPEC
§2).

**Blob Storage.** Responsibility: the films, and only the films.
Technology: `StorageV2`, `Standard_LRS` (marketing copies, re-derivable
from the operator's masters — no geo-redundancy), `Hot`, TLS 1.2, HTTPS
only, account-level public blob access on, container `media` with
blob-level anonymous read and no listing, shared-key access on for the
upload path (`az storage blob upload`, RUNBOOK "Publishing a film").
Scaling: egress is the line that tracks marketing success — a viewer who
watches the whole carousel pulls ~30 MB (DECISIONS 2026-08-17). Cost:
fractions of a cent for storage; egress a few dollars at today's traffic.

**GitHub Actions.** Responsibility: every build, every gate, every site
deploy, and the cache purge. Technology: two workflows (§4.3, §4.4), Node
22 from `.nvmrc`, `npm ci`, the gates in `package.json` (`verify:fast` =
build, `astro check`, the claims, voice and practice-link linters;
`verify:slow` = pa11y and the Lighthouse budgets), and
`Azure/static-web-apps-deploy@v1` with `skip_app_build: true` so the action
can never build on its own and bypass the gates. Scaling: not applicable.
Cost: GitHub's included Actions minutes.

**The budget.** `budget-ng-website`, a subscription budget of $60/month
with alerts at 50% and 80% of actual and 100% of forecast, anchored at
2026-07-01 (`infra/budget.bicep`; *verified 2026-10-21*). The anchor is
immutable after creation, which is why every redeploy passes it explicitly
(RUNBOOK "Infrastructure changes"). It stops nothing; it is the backstop.

**Not this repo's containers, but on its edge.** The Function App
(`func-needlegirlie-api`: Flex Consumption `FC1`, Linux, Node 24, 2048 MB,
one always-ready HTTP instance, a maximum of 100 instances; *verified
2026-10-21*) and the External ID tenant are the app repo's, with their own
Bicep, runbook and architecture record. This repo declares the two routes
and nothing behind them.

## 4. Runtime flows

### 4.1 A page request

```
  Browser          DNS            Front Door                         Static Web App
    │               │                 │                                   │
(1) ├──────────────►│ needlegirlie.com → alias A → the endpoint
(2) ├────────────────────────────────►│ TLS (managed cert); http:// → 307 to https://
(3) │                                 │ host www / needlegirl.com → 301 https://needlegirlie.com/…
(4) │                                 │ cache hit? → serve (HTML max-age=300; /_astro/* immutable)
(5) │                                 ├──────────────────────────────────►│ Host: polite-flower…; X-Azure-FDID: ee68a15a-…
(6) │                                 │                                   │ allowedIpRanges + requiredHeaders pass →
    │                                 │                                   │   the file, or /404.html for an unknown route
(7) ◄─────────────────────────────────┤ + the generated global headers (CSP, HSTS, nosniff,
    │                                 │   Referrer-Policy, Permissions-Policy, Cache-Control)
```

Observed on 2026-10-21: `http://needlegirlie.com/` → 307 to `https://`;
`https://www.needlegirlie.com/` and `https://www.needlegirl.com/` → 301 to
`https://needlegirlie.com/`; the apex → 200 with `Cache-Control: public,
max-age=300`, HSTS for two years with `includeSubDomains; preload`,
`nosniff`, `strict-origin-when-cross-origin`, the Permissions-Policy
denials, and a CSP of `default-src 'self'` with no third-party script,
frame or connect origin and `form-action 'self'`. Two headers the templates
do not declare are present on every response — `X-XSS-Protection: 1;
mode=block` and `X-DNS-Prefetch-Control: off` — and `script-src` reads
`'self' 'wasm-unsafe-eval'` where `config/swa/*.json` say `'self'`. They
appear identically on a preview environment, and `main` and `phase-c`
carry the same templates, so they come from the Static Web Apps platform,
not from this repo (the platform's reason for the addition is UNVERIFIED
against Microsoft's documentation; the observation is what the record
carries). `'wasm-unsafe-eval'` admits WebAssembly compilation only and no
script origin; it does not weaken the policy the templates state.

Step 4 is why a release purges: HTML is edge-cached for five minutes, so
without `az afd endpoint purge --content-paths '/*'` a visitor could see the
old page for that long. Hashed `/_astro/*` assets are immutable for a year
and never need purging; anything served from `public/` at a stable path
(favicons, captions, scripts) is replaced under a new filename, never in
place (RUNBOOK "Manual cache purge").

**The default endpoint hostname serves the site.** RUNBOOK "The system at
a glance" says the `*.azurefd.net` hostname serves 404 because
`allowedForwardedHosts` admits only the real hostnames. *Verified
2026-10-21*: `https://needlegirlie-b9bbeadqaucyd7af.z03.azurefd.net/` and
`/about` answer 200 with the site, canonical tags pointing at the apex.
The likeliest cause is in the template, not a fault: the `default` route
is declared with `linkToDefaultDomain: 'Enabled'`, so Front Door accepts
the host; and the SWA setting, as its documentation is remembered here,
governs how redirect URLs are generated rather than which forwarded hosts
are served (UNVERIFIED — read the current SWA documentation before
changing anything). Nothing links to the hostname, it is in no sitemap,
and every page carries its canonical, so the exposure is a duplicate host
search engines are told to ignore. Closing it is one line
(`linkToDefaultDomain: 'Disabled'` on the `default` route, as the other
three routes already have) plus a RUNBOOK correction; that change is the
operator's to call (§11).

### 4.2 A film request

```
  Browser                  Front Door (route media)                 Blob (container media)
    │                            │                                        │
(1) ├─ GET media.needlegirlie.com/<film>.mp4  Range: bytes=0-… ─────►│
(2) │                            │ originPath /media → /media/<film>.mp4 ──►│ anonymous read
(3) ◄─ 206 Partial Content, video/mp4, Content-Range ──────────────────┤ cached a day; query strings ignored
(4) ├─ GET needlegirlie.com/media/<film>.vtt  (same-origin, from the Static Web App) — the captions
```

*Verified 2026-10-21*: a ranged request for `girl-team-film-wide.mp4`
answers 206 `video/mp4` with a `Content-Range` through Front Door. The
hostname is deliberately absolute in every build (`siteConfig.mediaBase`)
so a preview plays exactly the file production plays, and a film is
reviewable on a PR preview the moment its upload lands. Publishing is an
`az storage blob upload` by the operator plus a normal PR for the caption;
replacing a file in place needs an edge purge of that path, so the
procedure prefers a new filename (RUNBOOK "Publishing a film").

### 4.3 From a change to the live site

```
  Developer      PR → phase-c          Preview env        Release PR → main        Production
     │               │                      │                     │                     │
(1)  │ branch off phase-c; npm run verify green
(2)  ├──────────────►│ pr-preview.yml: verify:fast (build, check, three linters, ~20 s)
(3)  │               ├─────────────────────►│ deploy dist/ as-is (PUBLIC_ENV=preview → preview.json)
(4)  │               │ verify:slow (pa11y, Lighthouse) — a red run leaves the preview up
(5)  │ Amy reviews the preview URL; a treatment edit needs her OK and the operator's
     │   flag flip ON phase-c before any release can pass the approvals gate
(6)  │ merge into phase-c on the operator's word (merge commit); pushes to phase-c deploy nowhere
(7)  │                                                          │ PR phase-c → main; merge commit, never squash
(8)  │                                                          │                     ├─ verify (all gates) + check:approvals
(9)  │                                                          │                     ├─ check:approvals again, then build with
     │                                                          │                     │   PUBLIC_ENV=production + FRONT_DOOR_ID
(10) │                                                          │                     ├─ SWA deploy (upload, skip_app_build)
(11) │                                                          │                     ├─ azure/login (OIDC) → az afd endpoint purge '/*'
(12) │                                                          │                     └─ live ~15 min end to end (measured 2026-10-05)
(13) │ fast-forward phase-c to main so the two stay one history
```

Two gates decide what can ship. The clinician-approval gate
(`scripts/check-approvals.mjs`) fails the production run while any
non-draft treatment page carries `clinicianApproved: false` — only a human
sets it true, and any edit to approved content resets it in the same
commit (constraint 4). The config generator
(`scripts/generate-swa-config.mjs`) fails a production build that lacks a
GUID `FRONT_DOOR_ID`, so the production config can never ship unlocked or
with a placeholder, and fails a preview build whose template contains a
lockdown, so a preview can never lock itself out. `vars.FRONT_DOOR_ID` is
also the deploy job's `if:` — unsetting the repository variable is the
kill switch for deploys while every gate keeps running (RUNBOOK "GitHub
wiring").

One thing the workflow does not gate: `production.yml` also accepts
`workflow_dispatch`, and its deploy job carries no branch condition. A
manual run from another ref would pass through the same gates and the
approvals check and then upload that ref's build to production; only the
OIDC purge step, whose federated credential trusts `main` alone, would
fail. The app repo closed the same gap with `if: github.ref ==
'refs/heads/main'` on its deploy job (its `docs/ARCHITECTURE.md` change
record, 2026-09-16); whether to mirror that here is the operator's call
(§11). Nothing has ever been
dispatched that way; the record is the posture, not an incident.

The branch model is the operator's decision of 2026-10-05: `main` is the
tree that is live and changes only by a release or an urgent fix; `phase-c`
is where work gathers and gets a preview; a release is a merge commit from
`phase-c` into `main`, and rebase merging is off in the repository settings
because a rebased release would leave `phase-c` out of `main`'s history
(DECISIONS 2026-10-05, the branch-model entry; RUNBOOK "Everyday changes").

### 4.4 Previews

`pr-preview.yml` runs on `pull_request` only, skips entirely for a PR whose
every changed file is under `docs/**`, `**/*.md` or `.gitignore` (none of
the gates read those; DECISIONS 2026-07-26), deploys the pre-verified
`dist/` *before* the slow gates so a link is ready in under two minutes
(DECISIONS 2026-08-25), and tears the environment down when the PR closes.
Each environment is
`polite-flower-0a41b770f-<PR>.eastus2.7.azurestaticapps.net`. Previews are
public and noindexed: SWA password protection was removed on 2026-07-21
because its cookie looped in Chrome and locked Amy out, and
`infra/swa.bicep` deliberately declares no basicAuth resource so a redeploy
cannot bring it back. Two standing draft PRs hold stable previews — the
client demo (#97, `chore/monday-demo-preview`) and the review scaffolding
(#149) — and both are refreshed by merging `phase-c` into their branches
after every merge, because GitHub does not re-run a PR's workflow when its
base moves (*verified 2026-10-21*: environments `default`, `97` and `149`
exist and are `Ready`).

### 4.5 The app's routes through this edge

```
  Phone (the app)              Front Door (routes api, login)           Function App / External ID
    │                                 │                                        │
(1) ├─ https://api.needlegirlie.com/… ─►│ TLS; HTTPS only; no cache ───────────►│ func-needlegirlie-api.azurewebsites.net
    │                                 │   + X-Azure-FDID: ee68a15a-…           │   admits AzureFrontDoor.Backend + this FDID only
(2) ├─ https://login.needlegirlie.com/… ►│ TLS; no cache; http → https ─────────►│ needlegirlieapp.ciamlogin.com (custom URL domain)
```

What this repo owns here is exactly the edge: the two custom domains, the
two origin groups, the two routes, and the two CNAME/TXT pairs in the zone
(DECISIONS 2026-09-07). It owns nothing behind them and never calls them.
The `api` route is bound only to its hostname, HTTPS-only with the redirect
off so an API caller gets a clean failure rather than a 301, not linked to
the default domain, and uncached because every response is per-user;
`og-api` is the one origin group with a health probe. The `login` route
keeps the HTTP→HTTPS redirect on because a typed URL must still land on a
sign-in page. BUILD_SPEC §2's bracketed note that a later phase "will add
`/api/*` → Container Apps" on this route is superseded by this design — the
app's API is Azure Functions on its own hostname — and is listed in §11 as
a line to amend.

**Checked on 2026-10-21, because the two repos' records were said to
disagree about whether the API sits behind this edge.** They do not, and
the live state matches both. The app repo's `docs/ARCHITECTURE.md` (branch
`phase-a`, and the older copy on its `main`) says Front Door terminates TLS
for `api.needlegirlie.com` and is the single ingress, with the Function App
admitting only the `AzureFrontDoor.Backend` service tag plus this profile's
`X-Azure-FDID`. Live: `api.needlegirlie.com` is a CNAME to this profile's
endpoint; the `api` route, domain (`Approved`/`Succeeded`, managed
certificate) and `og-api` origin exist as declared; the Function App's only
hostname binding is `func-needlegirlie-api.azurewebsites.net` (no custom
domain of its own); its access restrictions are one `Allow` rule for
`AzureFrontDoor.Backend` with header `x-azure-fdid` =
`ee68a15a-55e1-4220-8016-3052e33d4988` and a default `Deny`; its app
settings carry `FRONT_DOOR_ID` (the same GUID) and `FRONT_DOOR_ENFORCE=true`;
`GET https://api.needlegirlie.com/healthz` answers 200 through Front Door,
and `https://func-needlegirlie-api.azurewebsites.net/healthz` answers `403
Ip Forbidden` direct. The nearest thing to the reported wording is the app
record's "there is no WAF in front of it", which is true of this profile
too.

### 4.6 Analytics, when it is lit

Today nothing leaves the browser. The wiring (DECISIONS 2026-08-17, the
Plausible entry) is one two-value edit in `siteConfig.analytics`, and
three things change in the same build so no state can lie: `BaseLayout`
emits the self-hosted tracker (`public/js/plausible.js`; `script-src`
stays `'self'`), the privacy page swaps its analytics bullet, and
`generate-swa-config.mjs` widens the CSP with `connect-src 'self'
https://plausible.io` only after it finds the script tag in the built
`dist/index.html`. The only outbound flow is then a `POST
https://plausible.io/api/event` per pageview — no cookie, no identifier
(constraint 5). The 2026-10-05 relaunch went out with it off, the
operator's decision, and the flip is the operator's act (RUNBOOK "Turning
on analytics"). Until then Front Door's edge reports and Search Console
are the site's only numbers.

## 5. Data

There is no database, no session, no user record and no form. What the
system holds, by where it lives:

| Where | Holds | Written by | What it is |
|---|---|---|---|
| Git (`gwhitley1969/amyweb`) | every page and component; the treatment collection (`src/content/treatments/*.mdx`) with its `clinicianApproved` flags; `compliance/banned-patterns.json` and its `allowedStrings`; the caption files in `public/media/`; the Bicep; the SWA config templates; the records in `docs/` | PRs, merged on the operator's word | the audit trail — treatment edits get their own commits for clinician review |
| Blob `media` | the `.mp4` renditions (about 53 MB at the 2026-08-17 move; 17 films at the relaunch) | the operator's `az` login, after a compliance screen and a DECISIONS entry | serving infrastructure, not the archive — masters stay in the operator's folders |
| Static Web App | the built `dist/` per environment, with the generated `staticwebapp.config.json` inside it | the workflows, by deployment token | derived; rebuilt from git on every deploy |
| Front Door | the edge cache; the request reports the operator reads in the portal | the platform | no body of any kind |
| Azure DNS | the records in §2, plus records this repo does not declare | Bicep for its own; by hand for the rest | see below |
| GitHub secrets and variables | `AZURE_STATIC_WEB_APPS_API_TOKEN`, `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`; `FRONT_DOOR_ID`, `AZURE_RESOURCE_GROUP`, `FRONT_DOOR_PROFILE`, `FRONT_DOOR_ENDPOINT` | the operator (`docs/OPERATOR-SETUP.md`) | the only secrets anywhere; none in the repo, ever |

**What is never held.** No personal data of any visitor — the site sets
no cookie, hosts no form and runs no tracker. No health content in any
log: the only logs are Front Door's and the platforms', which see URLs and
headers. No credential of any kind in the tree (constraint 5; BUILD_SPEC
§14). The client's internal product cards are prohibited inputs and never
enter the repo (constraint 8).

**Records in the zones outside the IaC** (*verified 2026-10-21*).
`needlegirlie.com` also carries: a TXT set at the apex with two values —
an `MS=…` value (the form Microsoft 365 uses to prove domain ownership)
and the `google-site-verification=…` token the operator added on
2026-10-12 for Search Console; a `_dmarc` TXT (`p=quarantine`, reporting
to a secureserver.net address); `_domainconnect` and `pay` CNAMEs that
point at GoDaddy services; and **no MX record**. `needlegirl.com` carries
the same DMARC, `_domainconnect` and `pay` records. None of these is in
`infra/dns.bicep`, and a redeploy leaves them alone — with one standing
caveat: a Bicep TXT record set replaces the live set wholesale, so the day
the apex TXT is declared as the RUNBOOK's `googleSiteVerification`
parameter asks, **both** values must be listed in that one resource or the
Microsoft proof is lost (DECISIONS 2026-10-12; RUNBOOK "Telling the search
engines the site exists").

**Retention.** Git is append-only in spirit: `docs/DECISIONS.md` and
`docs/CHANGELOG.md` are never rewritten, `main` is never force-pushed
(RUNBOOK "Rollback" — revert, never rewrite), and an old film file leaves
Blob only once nothing references it.

## 6. Identity and trust boundaries

```
┌─ untrusted: the public internet ──────────────────────────────────────────────┐
│  any browser · any crawler · the phone running the app                        │
└──────────┬────────────────────────────────────────────┬───────────────────────┘
           │ HTTPS only (http → 307)                    │ HTTPS only
           ▼                                            ▼
┌─ Microsoft's edge: afd-needlegirlie (this repo's Bicep) ──────────────────────┐
│  managed TLS on 7 hosts · no WAF · 301s · cache · adds X-Azure-FDID          │
└───┬───────────────────────┬────────────────────┬───────────────────┬──────────┘
    │ og-swa                │ og-media           │ og-api            │ og-login
    ▼                       ▼                    ▼                   ▼
┌─ trusted: rg-needlegirlie-web (ng-website) ─┐  ┌─ the app's: rg-needlegirlie-app (ng-app) ┐
│ stapp-needlegirlie                          │  │ func-needlegirlie-api                     │
│  · production: admits AzureFrontDoor.Backend│  │  · admits AzureFrontDoor.Backend          │
│    + X-Azure-FDID = this profile only;      │  │    + x-azure-fdid = this profile only;    │
│    direct hit → 403                         │  │    direct hit → 403 Ip Forbidden          │
│  · previews: open, noindexed, drafts only   │  │  (the app repo's control, read back here) │
│ stngmedia… container media                  │  └───────────────────────────────────────────┘
│  · anonymous READ by design; no listing;    │  needlegirlieapp.ciamlogin.com — Entra's,
│    WRITE needs the operator's az identity   │  reached only through the login route
└─────────────────────────────────────────────┘
           ▲ deployment token (secret)          ▲ OIDC: CDN Profile Contributor on the
GitHub Actions ─────────────────────────────────┘ profile only (purge, nothing else)
```

**Who can change what.** The operator is Owner of the subscription and the
only human with Azure or GitHub write access; Amy reviews and signs off,
nothing more. GitHub reaches the Static Web App by one deployment token —
the only coupling between the two; no role assignment is scoped to the
SWA itself (*verified 2026-10-21*). GitHub reaches Front Door as a
federated identity (the app registration `gh-amyweb-frontdoor-purge`,
DECISIONS 2026-07-07) that holds exactly one role, **CDN Profile
Contributor scoped to the `afd-needlegirlie` profile** (*verified
2026-10-21*: the only service-principal assignment visible at that scope,
inherited ones included) — enough to purge the cache, not enough to touch
DNS, the SWA, storage or anything else. Its federated credential trusts
only the `main` branch of `gwhitley1969/amyweb` (OPERATOR-SETUP). No
publish profile and no client secret exist.

**What the origin trusts.** In production the Static Web App accepts a
request only if it arrives from the `AzureFrontDoor.Backend` service tag
*and* carries `X-Azure-FDID` equal to this profile's id, and it generates
redirects only for `needlegirlie.com` and `www.needlegirlie.com`
(`config/swa/production.json`). The service tag alone would admit every
tenant's Front Door; the header is what pins the origin to this one. The
header value is a repository variable injected at build, and the generator
refuses to build production without it. Previews carry no lockdown by
design — they are the review surface — and `X-Robots-Tag: noindex,
nofollow` is the control that keeps unapproved drafts out of search; the
clinician-approval gate is the control that keeps them out of production.

**What the browser is told.** The response headers are the site's
client-side policy: `default-src 'self'`; `script-src 'self'` (plus the
platform's `'wasm-unsafe-eval'`, §4.1); `style-src 'self' 'unsafe-inline'`
— the one concession, for Astro's inlined page CSS, which stays inlined
because un-inlining it (`assetsInlineLimit: 0`) regressed LCP sitewide
(DECISIONS 2026-08-14); `img-src
'self' data:`; `media-src 'self' https://media.needlegirlie.com`;
`font-src 'self'`; `object-src 'none'`; `base-uri 'self'`; `form-action
'self'`; `frame-ancestors 'none'`; `upgrade-insecure-requests`; HSTS for
two years with `includeSubDomains; preload`; `nosniff`;
`strict-origin-when-cross-origin`; camera, microphone, geolocation and
interest-cohort denied. No third-party script, frame or connection is
admitted; the only widening the code can make is `connect-src` for
Plausible, and only when the script actually shipped. The CSP refuses
inline scripts, which is why every site script is a static file under
`public/js/` referenced by a literal tag, and why built pages are tested
under the generated headers (DECISIONS 2026-08-14).

**Content trust.** Every string in `src/` — copy, headings, alt text, meta,
JSON-LD, comments — passes `lint:claims` against
`compliance/banned-patterns.json`, `lint:voice` (the site speaks as Amy,
never as a collective) and `lint:practice-link` before a preview exists;
the banned list only ever grows; a green linter is a floor, not an
authorization, and the overrides no pattern can see live in CLAUDE.md and
DECISIONS (RUNBOOK "Everyday changes"). Pixels and the caption files are
outside the linter and are screened per item.

**What this architecture rules out.** There is no server-side runtime
anywhere in this repo: no PHP, no Node at request time, no SSR, no
SWA-managed Functions, no API routes (constraint 1; `astro.config.mjs`
`output: 'static'`; no `api_location` in either workflow). An advisory
about server-side code execution — the PHP2Shell class assessed on
2026-10-21 is the worked example — does not apply to this site, and the
place to confirm that is this section, `infra/`, `config/swa/` and the
workflows, not a scan. The attack surface that does exist is the one
drawn above: the edge configuration, the SWA config, the deployment
token, the purge identity, the public-read film container, and the
content itself.

## 7. Cost

The run-rate target is ~$45–55/month (CLAUDE.md "How to operate"): Front
Door Standard's fixed line plus egress, SWA Standard's fixed line, Blob at
fractions of a cent plus egress that scales with how many people watch the
films, and nothing else metered. The $60 subscription budget (§3) is the
backstop, with the 50% line as the early warning. Three lines would move
it, each with its off-ramp recorded: Plausible, ~$9/month billed to the
client, off until the operator flips it; a WAF policy, if
`{{WAF_DECISION}}` is ever closed the other way; and the app's traffic
through this profile, which adds egress to this subscription's bill but no
fixed line (DECISIONS 2026-09-07). Dollar figures here are the records';
the operator's Cost Management view is the source before quoting the
client.

## 8. Environments and naming

One resource group, `rg-needlegirlie-web`, in the client's **`ng-website`**
subscription (`62cd1c71-3239-4b8b-8a10-4dc4da52e29e`, tenant
`319c12c2-1ddf-449b-8337-fe9c4d96a055` — the client's workforce tenant,
`needlegirlie.onmicrosoft.com` per OPERATOR-SETUP; the app's External ID
tenant `needlegirlieapp` is a separate external tenant), region **East US
2** for the two regional resources and `global` for Front Door, holding
exactly four resources: `stapp-needlegirlie`, `afd-needlegirlie` with its
endpoint `needlegirlie`, and `stngmediag2g4stj5m2gts` (*verified
2026-10-21*). The DNS zones live in `rg-corp` in the same subscription. The
naming rule is prefix per resource type, then the brand, then the role;
the storage account's suffix is `uniqueString(resourceGroup().id)` because
storage names are global.

Environments: **production** is whatever `main` last deployed, served at
`https://needlegirlie.com`; **previews** are one SWA environment per open
PR, numbered by PR, public and noindexed; the two standing drafts (#97,
#149) are the stable previews of `phase-c`. There is no staging
subscription and no second Azure environment — a preview is the staging
(DECISIONS 2026-07-21, 2026-10-05).

Infrastructure is Bicep under `/infra`, orchestrated by `main.bicep` at
subscription scope, applied by the operator after `az deployment sub
what-if` (RUNBOOK "Infrastructure changes"), always with
`budgetStartDate=2026-07-01`. Bicep deletes nothing it stops declaring, so
a retired resource is removed by hand. The last infrastructure change was
the app's two hosts on 2026-09-07; the routes, domains, origins and rules
read back on 2026-10-21 match the template.

Branches and worktrees: ordinary work branches from `phase-c` in a
worktree under `.claude/worktrees/`, PRs into `phase-c`, releases from
`phase-c` into `main` (§4.3). Commits are conventional (`feat:`, `fix:`,
`content:`, `infra:`, `chore:`, `docs:`); treatment-page content changes
get their own commits.

## 9. Scaling path

A static site behind Microsoft's edge scales without a decision: Front
Door and Static Web Apps serve from Microsoft's network, there is no
instance to size, no state to shard, and a traffic spike costs egress and
nothing else. The knobs that exist are small and recorded:

- **More or heavier films** go to Blob, never to the repo (the 2026-08-17
  move exists so the repo and the ~500 MB SWA deployment ceiling never see
  them); egress is the metered line and is a named budget line.
- **More pages** cost build time and Lighthouse runs, both in CI; the
  performance budget (BUILD_SPEC §13: ≤ 30 KB JS on every page but the home
  URL's 80 KB row) is the real ceiling, enforced on every PR.
- **A WAF** is one policy on the existing profile (`{{WAF_DECISION}}`).
- **Anything that needs a server** does not scale this site; it starts a
  different one. The app repo is that answer, and its API already rides
  this edge without touching this origin.

## 10. Rejected alternatives

- **Any server code in this repo** — SWA Functions, API routes, SSR, a
  database — constraint 1, from the first day; the app is the separate
  phase that has them.
- **Azure API Management** — there is no API here to manage (CLAUDE.md
  "Precedence").
- **SWA's enterprise-grade CDN instead of Front Door** — Front Door
  Standard is what gives the canonical-host redirects, managed certificates
  on seven hosts, the multi-origin routing the films and the app needed,
  and the rule set; the SWA option is switched off in `swa.bicep`.
- **A WAF policy** — not built unless instructed; `{{WAF_DECISION}}` stays
  open (BUILD_SPEC §15).
- **Password-protected previews** — removed 2026-07-21: the basicAuth
  cookie looped in Chrome and locked the reviewer out; public + noindexed,
  with the approval gate as the production safeguard, was chosen instead.
- **Git LFS for the films** — rejected 2026-08-17: GitHub's free LFS
  bandwidth would die in days against this repo's CI cadence, and
  `actions/checkout` would silently deploy pointer files; Blob made it
  moot.
- **A separate Front Door profile for media, or for the app's sign-in
  host** — double the fixed cost for nothing; the existing profile carries
  every host (DECISIONS 2026-08-17, 2026-09-07).
- **A `/api/*` path on the apex route for the app** — would couple the API
  to the static site's CSP, lockdown and redirect rules; a dedicated
  hostname was chosen (DECISIONS 2026-09-07).
- **Plausible's hosted script, GA4, pixels** — the hosted tag would widen
  `script-src` to a third-party CDN with no SRI possible; GA4 and every ad
  or retargeting pixel are prohibited outright (constraint 5, BUILD_SPEC
  §11).
- **`assetsInlineLimit: 0` to satisfy the CSP** — made the carousel work
  and regressed LCP sitewide; one static script file in `public/js/` was
  the scoped answer (DECISIONS 2026-08-14).
- **Publish-profile secrets for the purge** — an OIDC federated identity
  with one role at one scope instead (DECISIONS 2026-07-07).
- **A staging subscription** — a second fixed cost for a one-person
  project; PR previews are the staging.

## 11. Change record

Architecture changes are logged in `docs/DECISIONS.md`; this file is
updated in the same commit as any change to BUILD_SPEC §2, §4, §14 or §15,
to `infra/`, to `config/swa/` or to the workflows.

**2026-10-21 — this file created, after an advisory had to be answered
without it.** A PHP2Shell security advisory (a server-side code-execution
class) was assessed on 2026-10-21 by reconstructing the hosting from Bicep,
the SWA templates and the workflows, because no architecture record
existed; the answer was that it does not apply (§6, "What this
architecture rules out"). This record was then written from that
reconstruction and checked against the live estate the same day. The check
turned up four things, none a change to the architecture and each left as
found for the operator to call:

- `api.needlegirlie.com` is served by this repo's Front Door and the
  Function App admits only this profile — what both repos' records say;
  the reported disagreement did not reproduce (§4.5). BUILD_SPEC §2's
  bracketed "`/api/*` → Container Apps" note is the one stale line and
  needs the operator's amendment.
- The default `*.azurefd.net` hostname serves the site (200) where the
  RUNBOOK says 404; the `default` route is linked to the default domain by
  the template. Closing it is a one-line Bicep change plus a RUNBOOK
  correction (§4.1).
- `production.yml`'s deploy job has no branch condition under
  `workflow_dispatch`; the app repo's `if: github.ref == 'refs/heads/main'`
  is the pattern to mirror if wanted (§4.3).
- The live CSP carries `'wasm-unsafe-eval'` and two extra headers the
  templates do not declare, on production and previews alike — the
  platform's addition, not this repo's (§4.1).

Also recorded: the apex TXT record set is live with two values and
undeclared in Bicep (§5), as DECISIONS 2026-10-12 foresaw.
