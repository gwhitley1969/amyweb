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
- Most entries are marketing copy the client wanted published: the GLP-1
  vial tiers, the per-unit neuromodulator prices, the Evolus ranking
  sentence (authorizations 1–3 — the ranking sentence WITHDRAWN
  2026-08-25, when its last consumer, the /about recognition plate, was
  swapped for the EvolusLaurel plaque: like the seventh below, an
  authorization nothing uses is a loophole, so the entry came off and
  the ranking vocabulary is banned everywhere again), and the four Private Injector Training
  curriculum topics in exact `<li>`-wrapped source form (fifth
  authorization, 2026-08-04 — the wrap binds each to one attribute-less
  source line and preserves the self-test's word boundary); and the
  seventh (2026-08-21): the weight-loss page's original pairs-section
  heading in h2 source form — authorized and withdrawn the same day
  when the client changed the heading, so the list holds no entry for
  it and the phrase is banned everywhere, alt text and comments
  included. One is
  different in kind: **Biote's FDA disclaimer** (fourth authorization),
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

## What the linter cannot see: media text

Text baked into pixels — photo signage, burned-in video captions and
safety screens — and the WebVTT caption files in `public/media/` are
outside `SCAN_DIRS` entirely. §8 still governs them; the control is
per-item human screening plus a recorded DECISIONS entry (frame-level
vets for photos and video contact sheets; operator overrides for
manufacturer films carried as-is and for Amy's own published content,
and — since 2026-08-18 — for photo frames whose pixels carry text the
site's own copy could not say: three /services and wrinkle-relaxers
frames with legible banner/sign text (see the caveat below — the
wrinkle-relaxers frame no longer satisfies that premise), and from 2026-08-21 the
skin-rejuvenation cart frame and the laser-treatments Epileve frame,
each with its device-console readout, and the weight-loss weigh-in
frame with its aftercare sign, all
enumerated in CLAUDE.md constraint 3 with their DECISIONS entries).
The home-carousel films and their caption files (three cleared
2026-08-14; the team film 2026-08-17, constraint-2 override) ship under
exactly this regime, and so do the site-authored, sounded films: the
two on /services/biostimulators (2026-08-21 — Amy's own reels:
constraint-3 and constraint-2 overrides for the Radiesse-visit film,
a retina-rule override for the 480p reel), the body-contouring Evolve
reel (2026-08-21, no override needed), and the /about team film's
sounded rendition (2026-08-25 — the carousel team film under its
widened constraint-2 exception); every sounded caption file carries
bounded `[Music]` cues on the operator's no-speech confirmation. From
2026-08-25 the /injector-training round adds both kinds at once: the
hero portrait `amy-evolysse-cart.jpg` (a second Jeuveau-banner frame
— headline, indication line, and partial safety fine print legible —
under its own override, the 2026-08-18 frame's not carrying over) and
Amy's training reel `training-reel` (burned-in course cards restating
the page's allowlisted curriculum vocabulary as pixels, a legible
per-vial quantity, the practice-site URL displayed on screen — the
constraint-2 fifth exception — all on-camera releases confirmed; its
caption file deliberately carries no "On screen:" cues, so what the
override covers only as pixels is never restated as rendered text).
And from the same date the regenerative PRP round: `prp-syringes.jpg`
(two diluent vials' labels legible beside the prepared syringes — the
prep-workflow class, under its own constraint-3 pixel override) and
Amy's PRP-visit reel `prp-visit` (another provider injecting on
camera, face mostly out of frame — the constraint-2 sixth exception;
near-silent audio kept on the operator's no-speech confirmation, its
caption file a single bounded quiet-room cue). Since 2026-08-17 the film FILES live outside the
repo entirely (Blob, served as media.needlegirlie.com — RUNBOOK
"Publishing a film"): the frame-level screen and DECISIONS entry
happen BEFORE the upload, and the caption .vtt stays in-repo precisely
so this screening regime keeps a git audit trail. A green
`lint:claims` says nothing about media content. Photo replacements follow docs/RUNBOOK.md "Replacing site
photography" — frame-level screen first, releases confirmed on the
operator's record, DECISIONS entry per page.

**Caveat, 2026-08-24 — a pixel override's premise can expire.** The
wrinkle-relaxers band frame (`jeuveau-banner-studio.jpg`) was cleared
2026-08-18 on the stated ground that the banner's marketing headline is
legible *but the site's own copy never says it*. On 2026-08-24 the page's
`deck` was changed, under a separate operator override, to a sentence that
paraphrases that headline. The premise no longer holds, and the override was
not re-opened — the operator was shown the coupling and directed the copy
change anyway (DECISIONS 2026-08-24). Two working rules come out of it. Before
editing copy on a page carrying a pixel override, read the override's stated
premise, not just its verdict; a premise about what the copy says is a
constraint on the copy, and nothing enforces it. And note that of the three
pixel overrides for legible on-frame text, this is the only one whose CLAUDE.md
entry lacks a never-restate-in-text clause — `amy-pixel8-cart` and
`amy-epileve-window` both carry one, which is what would have made this
contradiction visible in writing rather than only in premise. Adding it is the
operator's call and remains open.

The same blindness applies to **outbound link destinations**: the
linter reads this repo, never the far side of an `href`. Any new
external link gets its destination screened by a human before it
ships, with findings and the decision recorded in DECISIONS. Precedent:
the header badge link to yourmobileaesthetics.com (2026-08-15) — the
destination names the location's other providers, which tripped hard
constraint 2; it ships as a scoped operator override recorded in
DECISIONS and in CLAUDE.md's constraint-2 exception text. The second
link to that same destination (the /about Girl Team button,
2026-08-25) shipped the same way — its own flag, its own override:
an already-screened destination does not carry authorization forward
to a new consumer.

**QR codes are both blindness classes at once** (first instance: the
storefront QR on /services/skincare, 2026-08-25): the encoded URL is
pixels no linter reads, AND it is an outbound destination in
machine-readable form. The control is threefold, all recorded in the
DECISIONS entry: the destination screened like any outbound link; the
committed SVG round-trip decode-verified against the intended URL
(scratchpad zxing — the committed artifact is proven, not assumed);
and the rendered page's own screenshot decoded again as the end-to-end
check. Changing an encoded URL is a regenerate-plus-reverify, never a
hand-edit of the SVG — an edited QR that still scans is worse than one
that doesn't, because it fails silently to the wrong place.

## Authorizations the registry does not hold

`allowedStrings` is **not** the complete list of copy that ships under an
operator override. It holds only the overrides for text a category would
otherwise catch. Text that is non-compliant on the merits but happens to
contain no token any pattern matches never reaches the allowlist at all — the
linter is already green on it — so its authorization is recorded in
`docs/DECISIONS.md`, and mirrored in CLAUDE.md and BUILD_SPEC §8, instead.

Current members of that class:

- The two EvolusLaurel ranking sentences — "The Top Evolus Injector in
  Charlotte." and "And among the Top 50 in the United States." — on
  /services/wrinkle-relaxers, /services/dermal-fillers, and (since
  2026-08-25) /about (operator
  authorization, DECISIONS 2026-08-19 + the two page-scope widenings,
  DECISIONS 2026-08-21 and 2026-08-25; BUILD_SPEC §8.4). The superiority
  patterns see no token in either. Deliberately **not** allowlisted: a bare
  `top` pattern would false-positive ordinary copy, and the list only ever
  grows, so it was never added.
- The /services/wrinkle-relaxers `deck` sentence beginning "Wave good-bye…"
  (operator override, DECISIONS 2026-08-23 and 2026-08-24; BUILD_SPEC §8.3,
  CLAUDE.md constraint 3). A second-person outcome promise that trips nothing.
- The /about plate text "Girl Team!" (operator override, DECISIONS
  2026-08-25; CLAUDE.md constraint 2, fourth scoped exception). Team
  language the voice rule's written rationale forbids — a team implies
  the location's other providers — but its patterns cannot see: the
  gate bans only first-person plural tokens. A green `lint:voice`
  never authorizes it.

The practical consequence, and the reason this section exists: **a green
`lint:claims` is not evidence that a string is authorized, and an empty
`allowedStrings` search is not evidence that it is unauthorized.** A session
auditing what ships under override must read DECISIONS, CLAUDE.md constraint 3,
and BUILD_SPEC §8 — the registry alone will under-report. The same asymmetry
applies to the inverse checks below, where "menopause" and "Low T" are
excluded by editorial judgment no pattern encodes.

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
