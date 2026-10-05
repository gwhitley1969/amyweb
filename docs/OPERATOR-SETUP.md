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

## GitHub repository settings (pull requests; read back 2026-10-05)

Set by the operator in the repository's Settings page on the day of the
relaunch, and read back with
`gh api repos/gwhitley1969/amyweb --jq '{delete_branch_on_merge,allow_merge_commit,allow_squash_merge,allow_rebase_merge,allow_auto_merge}'`:

| Setting | Value | Why |
|---|---|---|
| Automatically delete head branches | on | A merged PR's branch leaves GitHub by itself; the PR keeps a "Restore branch" button. Protected branches (`main`, `phase-c`) are not deleted |
| Allow merge commits | on | The only method this repo uses |
| Allow rebase merging | off | A rebased release would leave `phase-c` out of `main`'s history |
| Allow squash merging | on | Left on by the operator; never used for a release, for the same reason |
| Allow auto-merge | off | `gh pr merge --auto` merges at once here; never use it |

## GitHub branch protection (added 2026-08-17 — takedown-era guard)

**Since 2026-10-05 neither branch has a required status check.** The
relaunch merged that day and the guard retired right after it: the
operator removed the required checks from both branches himself
(`gh api -X DELETE …/protection/required_status_checks`), then the
workflow was deleted and `phase-c` was fast-forwarded to `main`
(DECISIONS 2026-10-05). The rest of each protection is unchanged: no
force pushes and no deletions on `main` or `phase-c`. The rule about
`verify-and-deploy` below still holds if a required check is ever
added again. The paragraph that follows is the takedown-era record.

Both branches carry required status checks (the repo's first branch
protection), created via `gh api` after PR #114: `phase-c` requires
`takedown-revert-guard`; `main` requires `gutted-merge-guard`. They
enforce the two-step relaunch topology (RUNBOOK "Relaunching after
the takedown"). Inspect with
`gh api repos/gwhitley1969/amyweb/branches/<branch>/protection`.
Rules: never add `verify-and-deploy` as required (its docs
paths-ignore would deadlock docs-only PRs on a check that never
reports), and the protection contexts retire WITH the guard workflow
in a follow-up PR right after the relaunch, never in the relaunch PR
itself (DECISIONS 2026-08-17, corrected 2026-08-24; this line still
said "in the relaunch PR" until 2026-10-05). The order: remove the two
required checks first (`gh api -X DELETE
repos/gwhitley1969/amyweb/branches/<branch>/protection/required_status_checks`,
which leaves the force-push and deletion protection in place), then
merge the PR that deletes the workflow.

## Media origin (added 2026-08-17)

The films live in Blob, not the repo: storage account
`stngmediag2g4stj5m2gts` (rg-needlegirlie-web), container `media`,
served only as `https://media.needlegirlie.com` through the existing
Front Door profile. Publishing/replacing a film is an `az storage
blob upload` + a caption PR — the full procedure is RUNBOOK
"Publishing a film". Nothing here needs GitHub secrets; uploads use
your `az` login.

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
