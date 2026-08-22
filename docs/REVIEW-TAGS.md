# Review tags — what they are and how to remove them

> **Scaffolding, not site design.** Every page carries a small black
> corner tag (`A`, `01`, `13`…) so a review pair can refer to pages by a
> short label instead of by name. It exists for one review round and is
> meant to be removed. Added 2026-08-22 on branch `review/page-numbers`
> (PR #138); the *why* is in `docs/DECISIONS.md`, same date.
>
> **This branch is not for merge.** It exists only to carry a preview
> URL. `phase-c` and the standing client demo (PR #97) are deliberately
> free of tags — see "Why it is kept off phase-c" below.

## The tags

| Tag | Page | Tag | Page |
|---|---|---|---|
| **A** | `/` | **01** | `/services/wrinkle-relaxers` |
| **B** | `/services` | **02** | `/services/dermal-fillers` |
| **C** | `/about` | **03** | `/services/biostimulators` |
| **D** | `/visit` | **04** | `/services/regenerative` |
| **E** | `/privacy` | **05** | `/services/skin-rejuvenation` |
| **F** | `/terms` | **06** | `/services/body-contouring` |
| **G** | `/medical-disclaimer` | **07** | `/services/laser-treatments` |
| | | **08** | `/services/skincare` |
| **13** | `/injector-training` | **09** | `/services/weight-loss-glp-1` |
| | | **10** | `/services/peptide-therapy` |
| | | **11** | `/services/iv-therapy` |
| | | **12** | `/services/hormone-optimization` |

Deliberately untagged: `/404` and the three preview-only `/styleguide*`
routes (operator decision, 2026-08-22).

Numbers 01–12 are the `/services` menu positions, read from the
`serviceLines` array order — they are not typed anywhere. **13 is a
working label only**: `/injector-training` has no menu position. Letters
were assigned by hand.

## Where the code is

Seven files, all page/layout/lib. **No content file is involved.**

| File | Role |
|---|---|
| `src/components/ReviewNumber.astro` | The tag itself. Takes any string; renders a noir plate, `aria-hidden`. Gated by `siteConfig.reviewNumbers`. |
| `src/lib/siteConfig.ts` | `reviewNumbers: true` — the single on/off switch. |
| `src/lib/serviceLines.ts` | `lineNumber(slug)` → `"01".."12"`, or null off-menu. |
| `src/lib/reviewTags.ts` | The letter map, keyed by pathname. Whole file is scaffolding. |
| `src/layouts/TreatmentLayout.astro` | Renders 01–12 (derives the slug from the URL). |
| `src/layouts/LegalLayout.astro` | Renders E/F/G. |
| `src/components/ConceptHome.astro`, `src/pages/{about,visit,injector-training}.astro`, `src/pages/services/index.astro` | Render A/C/D/13/B. |

Every render site is guarded, so a page with no tag renders nothing.

## Turning them off without removing anything

Set `reviewNumbers: false` in `src/lib/siteConfig.ts`. One edit, every tag
gone (numbers and letters alike), branch and code intact. Useful if the
preview needs to be shown to someone who should not see scaffolding.

## Removing them permanently

### Path A — the expected one: close the PR

The tags live only on `review/page-numbers`, which never merges. To remove
them from existence:

```
gh pr close 138 --delete-branch
```

That is the whole procedure. `phase-c` never carried the tags, so there is
nothing to clean up, nothing to verify, and no way for them to reach
relaunch. **Prefer this.**

### Path B — only if the branch was merged into `phase-c`

If someone merged PR #138 despite the do-not-merge marking, the tags are
now in the integration branch and must be removed by hand:

1. Delete `src/components/ReviewNumber.astro` and `src/lib/reviewTags.ts`.
2. Remove the `reviewNumbers` entry from `src/lib/siteConfig.ts`.
3. Remove `lineNumber()` from the end of `src/lib/serviceLines.ts` — check
   for other callers first (`git grep lineNumber`); at the time of writing
   the tag components are the only ones.
4. In each render site, remove the two imports, the `const reviewPageTag`
   / `const reviewNum` line, and the guarded render line. The render sites
   are the last five rows of the table above. `git grep -n "ReviewNumber\|reviewTag\|reviewPageTag\|reviewNum"` finds every one.
5. On `/injector-training`, also remove the explanatory comment block above
   the render line.
6. `npm run verify` must pass, and `git grep -i review-num src/` must
   return nothing.

Removal touches no content file either way, so **no `clinicianApproved`
flag changes and no re-approval is triggered**.

## Why it is built this way

**Layout-layer injection, never the content files.** Editing a treatment
`.mdx` resets its `clinicianApproved` flag in the same commit (CLAUDE.md
constraint 4). Five of the twelve pages are signed off
(hormone-optimization, iv-therapy, peptide-therapy, regenerative,
skincare), so putting a numeral in the MDX would have re-opened Amy's
sign-off on five pages whose copy never changed — for a label that is not
site copy. `TreatmentLayout` reads the slug from the URL instead. This is
the repo's established move: the arch rollout and the media-origin swap
both did the same thing for the same reason (DECISIONS 2026-08-17).

**Letters are keyed by pathname, not hardcoded.** `/` and
`/styleguide/concept` render the *same* component (`ConceptHome.astro`), so
a literal `"A"` would have tagged the styleguide too. The map answers for
`/` and returns null for the styleguide route.

**Why it is kept off `phase-c`.** The "Draft — pending clinician review"
strip was deleted sitewide on 2026-08-21 because the client saw a per-page
marker on a preview and read it as final-site content. Tags on every page
are the same class of thing, so they stay on a branch the client demo does
not track.

**Presentation.** A noir plate with paper text — the recorded 21:1 pair.
The `/services` menu's ink-pink numerals could not be reused: ink-pink and
magenta-600 are illegal as text on the ombre canvas, falling to 2.33 and
~1.9 mid-ramp (`tokens.css`). The tag sits in flow rather than fixed, so it
cannot cover the header's badge link (WCAG 2.2 focus-not-obscured).

## Measured, at the time of building

Full `npm run verify` green locally and in CI. The home tag sits above an
88vh full-bleed hero on a Lighthouse-gated URL: median LCP **1888 ms**
against the 2500 ms budget, CLS 0.00. Running pa11y with the ombre
needs-review cap removed surfaced 48 items, **none** referencing the tag.
