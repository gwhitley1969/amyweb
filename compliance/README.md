# Compliance tooling

A licensed clinician is advertising medical treatments on this site. Every
string in `src/content/**` and `src/pages/**` — copy, headings, frontmatter,
SEO fields, alt text, JSON-LD, microcopy — is scanned by
`scripts/lint-claims.mjs` against `banned-patterns.json`.

## Rules of the registry

- **The list only ever grows.** Removing or loosening a pattern requires the
  human operator. Never adjust a pattern to make a failing build pass — fix
  the content or raise the issue.
- Patterns are case-insensitive JavaScript regexes, applied per line.
- Each category maps to a rule in BUILD_SPEC §8 / the §7 per-line briefs.

## Inverse checks (treatment files only)

- `investigational: true` requires the investigational / not-FDA-approved
  disclosure wording in the file.
- Any mention of Retatrutide requires `investigational: true`.
- Symptom-awareness language (fatigue, brain fog, hot flashes, …) requires
  `bioteDisclaimer: true`, which makes the treatment layout inject the FDA
  disclaimer Biote uses.

## Self-test

`node scripts/lint-claims.mjs --self-test` proves each category flags a
known-bad sample and passes a known-clean one. It runs automatically before
every scan (`npm run lint:claims`). If you add a category, add bad samples
for it — the self-test fails on categories without samples.

Known-bad samples are assembled from string fragments at runtime because
banned phrasings (dosing vocabulary, disease claims) may not exist verbatim
in any committed file (CLAUDE.md hard constraint 3).

## Approvals

`scripts/check-approvals.mjs` fails the production deploy if any non-draft
treatment file lacks `clinicianApproved: true`. Only the operator flips that
flag, after Amy's written sign-off. Any edit to approved content must reset
the flag to `false` in the same commit.
