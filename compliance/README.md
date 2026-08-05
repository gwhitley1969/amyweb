# Compliance tooling

A licensed clinician is advertising medical treatments on this site. Every
string in **six** directories — copy, headings, frontmatter, SEO fields, alt
text, JSON-LD, microcopy — is scanned by `scripts/lint-claims.mjs` against
`banned-patterns.json`.

```
SCAN_DIRS = src/content  src/pages  src/components
            src/layouts  src/lib    src/styles
```

**`src/components` and `src/layouts` are scanned.** This surprises people:
a disclosure component is subject to the same banned patterns as marketing
copy, which is exactly how the Biote FDA disclaimer came to fail the linter
(see *Allowlisted strings* below). Do not assume a file is exempt because it
is infrastructure rather than content. `SCAN_DIRS` in `lint-claims.mjs` is
the only authority; this list is a copy and can drift.

## Rules of the registry

- **The list only ever grows.** Removing or loosening a pattern requires the
  human operator. Never adjust a pattern to make a failing build pass — fix
  the content or raise the issue.
- Patterns are case-insensitive JavaScript regexes, applied per line.
- Each category maps to a rule in BUILD_SPEC §8 / the §7 per-line briefs.

## Allowlisted strings

`allowedStrings` holds **exact** strings that are stripped from a line before
the categories run. It is the only sanctioned way to publish something a
category would otherwise catch. Every entry is an operator authorization
recorded in `docs/DECISIONS.md`; the `$allowlistComment` field carries the
reasoning inline.

- **Adding, changing, or removing an entry requires the human operator.** The
  categories themselves are never touched to accommodate one.
- Matching is exact, with digit-boundary guards — `"120mg vial: $675"` is not
  stripped by the entry `"20mg vial: $675"`. A near-miss variant still fails,
  and the self-test proves this.
- Three of the current entries are marketing copy the client wanted published
  (GLP-1 vial tiers, per-unit neuromodulator prices, the Evolus ranking
  sentence). The fourth is different in kind: **Biote's FDA disclaimer**,
  which a regulator effectively requires. It names all four verbs the
  `disease-claims` category bans — that is what a disclaimer *is* — so the
  gate blocked the compliance text until the sentence was allowlisted.

⚠️ **Stripping is per line.** A long allowlisted sentence must live on a
single source line. If an editor or formatter re-wraps it, the exact string
matches nothing and every banned term inside it trips. This is a live hazard
for the FDA disclaimer in `src/components/BioteDisclaimer.astro`, which
carries the rule in its header comment. For the same reason, never restate an
allowlisted string's banned vocabulary elsewhere in the same file — only the
exact string is stripped.

## Inverse checks (treatment files only)

- `investigational: true` requires the investigational / not-FDA-approved
  disclosure wording in the file.
- Any mention of Retatrutide requires `investigational: true`.
- Symptom-awareness language (fatigue, brain fog, hot flashes, …) requires
  `bioteDisclaimer: true`, which makes the treatment layout inject the FDA
  disclaimer Biote uses. *(Accurate since 2026-07-22. Before then the
  component rendered the unresolved `{{BIOTE_FDA_DISCLAIMER}}` token, so the
  check passed while no disclaimer was actually shown — the flag was
  enforced, its payload was not.)*

**What the flag does and does not unlock.** `bioteDisclaimer: true` permits
the *symptom-awareness vocabulary* listed above. It does **not** permit
disease names (diabetes, osteoporosis, PTSD, …) or condition names the
treatment is positioned as being *for* — those contradict the very disclaimer
being rendered. Note the linter cannot enforce that second half: "menopause"
and "Low T" trip no pattern, and are excluded by editorial judgment recorded
in DECISIONS 2026-07-22. A green `lint:claims` is a floor, not a verdict.

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
