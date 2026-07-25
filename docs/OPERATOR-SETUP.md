# Operator setup — GitHub & Azure wiring

One-time configuration the pipeline expects. Names must match exactly.

> **Status: fully configured 2026-07-07.** All secrets/variables below are
> set and verified working (preview + production deploys + cache purge).
> This document remains the reference for rotation or rebuild.

## GitHub repository secrets (Settings → Secrets and variables → Actions → Secrets)

| Secret | Value | Used by |
|---|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | SWA deployment token (Portal → Static Web App → Manage deployment token) | preview + production deploys |
| `AZURE_CLIENT_ID` | App registration (federated credential for this repo) client ID | Front Door purge login |
| `AZURE_TENANT_ID` | needlegirlie.onmicrosoft.com tenant GUID | Front Door purge login |
| `AZURE_SUBSCRIPTION_ID` | Client subscription GUID | Front Door purge login |

## GitHub repository variables (Settings → Secrets and variables → Actions → Variables)

| Variable | Value | Notes |
|---|---|---|
| `FRONT_DOOR_ID` | Front Door profile's `frontDoorId` GUID (X-Azure-FDID) | Setting this **arms production deploys** — until then the deploy job is skipped |
| `AZURE_RESOURCE_GROUP` | Resource group holding the Front Door profile | for cache purge |
| `FRONT_DOOR_PROFILE` | Front Door profile name | for cache purge |
| `FRONT_DOOR_ENDPOINT` | Front Door endpoint name | for cache purge |

## Azure portal (SWA Standard)

- **No preview password to set.** Password protection is off and preview
  environments are public + noindexed (DECISIONS 2026-07-21). Preview URLs go
  to Amy as-is, once the deploy run finishes. Do not turn Password protection
  back on in Portal → `stapp-needlegirlie` → Configuration: the basicAuth
  cookie looped in Chrome for Windows and locked her out, which is why it
  was removed.
- The deployment token above is the only coupling between GitHub and SWA.

## OIDC federated credential (no publish-profile secrets)

App registration → Certificates & secrets → Federated credentials → GitHub
Actions: repo `gwhitley1969/amyweb`, entity `branch`, branch `main`. Role
assignment: scope the service principal to the Front Door profile (or its
resource group) with the minimal role that allows `az afd endpoint purge`
(e.g. **CDN Profile Contributor**). Nothing broader — it only purges cache.

## Approval workflow reminders (CLAUDE.md hard constraint 4)

- Only you flip `clinicianApproved: true`, after Amy's written sign-off.
- Any edit to approved treatment content resets the flag to `false` in the
  same commit; production deploys fail while unapproved content is non-draft.
