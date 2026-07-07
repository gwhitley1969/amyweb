# Operator setup — GitHub & Azure wiring

One-time configuration the pipeline expects. Names must match exactly.

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

- Set the **preview environment password**: Static Web App → Environments →
  password-protect non-production environments. Share the password with Amy
  for her reviews.
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
