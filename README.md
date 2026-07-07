# needlegirlie.com

Dedicated marketing site for **Needle Girlie** — Amy Palacios, FNP
(medical aesthetics, Harrisburg, NC). Static Astro 5 site on Azure Static
Web Apps behind Azure Front Door.

**Read first:** `.claude/CLAUDE.md` (repo constitution) and
`.claude/BUILD_SPEC.md` (full specification). Their compliance constraints
govern every string in this repo and are enforced by CI.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | local dev server |
| `npm run build` | production build + SWA config generation |
| `npm run check` | astro check (types, content schema) |
| `npm run lint:claims` | compliance linter (self-test, then scan) |
| `npm run check:approvals` | clinician-approval gate (production-only in CI) |
| `npm run test:a11y` | axe/WCAG checks against the built site |
| `npm run test:perf` | Lighthouse budgets against the built site |
| `npm run verify` | all of the above except approvals — CI parity |

`verify` must pass for every unit of work. Never weaken a gate to make it
pass.

## Layout

See the repo map in `.claude/CLAUDE.md`. Key references:

- `docs/RUNBOOK.md` — deploy, rollback, cache purge, previews, troubleshooting
- `docs/OPERATOR-SETUP.md` — GitHub/Azure wiring (secrets, variables)
- `docs/BRAND-ASSETS.md` — logo sources and the export pipeline
- `docs/DECISIONS.md` — decision log (append-only)
