# Relaunch dossier — the ready-to-execute record

Prepared 2026-08-17 (external-audit Findings 2+3 close-out) so the
relaunch needs only two operator inputs — the date and the approvals —
not a planning round. Everything else below is written, tested, or
already merged.

## Preconditions (hard gates — none may be skipped)

1. **Round close recorded** in docs/REDESIGN.md: the frozen change
   list, the relaunch date, and the seven-gap acceptance checks — all
   three slots filled by the operator. Anything raised after the
   freeze is change-order/retainer scope, recorded as such.
2. **Copy approval** — `check:approvals` green: every non-draft
   treatment file `clinicianApproved: true`. Any file edited since its
   flip carries `false` and blocks production (constraint 4 — the gate
   is the record).
3. **Presentation approval** — docs/CLINICIAN-SIGN-OFF.md carries a
   presentation-approval date NEWER than the last merged visual
   change. Amy reviews the standing demo (PR #97's environment) on her
   phone: the pages look different from what she approved 2026-08-05
   (Playfair body, arches + 4:5 crops, new photography, header badge,
   footer) even where no copy changed. The operator logs the date.
   **Known defect to fix during this pass:** `studio-wide.jpg` alt
   says "two clients" but the 4:5 arch window shows one — an alt edit
   is an MDX edit, so it waits for this flag-resetting round
   (DECISIONS 2026-08-17).
4. **Analytics flip** (operator decision 2026-08-17: Plausible at
   relaunch): account created, then the two-value siteConfig edit per
   RUNBOOK "Turning on analytics" — ships in the relaunch PR or just
   before it, so the baseline starts day one.

## The relaunch PR itself (two-step — NEVER a plain merge)

The takedown revert `e57a4448` is why: a naive merge silently deletes
~48 files (all twelve treatment pages included) with a passing build —
simulated and verified 2026-08-17; the `gutted-merge-guard` required
check will refuse it. On a branch off `main`:

1. `git revert e57a4448f77e8ff64c623cd1d734fddfb0f00801` — restores
   the launch tree. Expect a conflict on `src/pages/index.astro`
   (PR #99 edited the placeholder): **take the launch-tree side**.
2. `git merge phase-c` — brings every post-takedown revision.
3. In the same PR: delete `src/assets/photos/studio-counter-portrait.jpg`
   (the placeholder's photo — zero-reference once the placeholder
   retires; PR #101 orphan precedent).
4. **Do NOT retire the guard in this PR** (corrected 2026-08-24 — the
   previous instruction could not work). Deleting
   `.github/workflows/relaunch-guard.yml` here breaks step 6 twice over:
   the workflow is then absent from the merge commit so the check cannot
   run at all, and even if it ran it would FAIL, because that file is
   itself tracked on `phase-c` — the guard's own comparison reports it as
   a missing phase-c file (verified: it is the first entry in the missing
   list). The relaunch PR would fail its own required check on its own
   retirement. Retire the guard in a FOLLOW-UP PR after this one merges:
   delete the workflow from both branches and remove the required
   contexts from both (`gh api`), with a DECISIONS entry. Post-relaunch
   the revert is a harmless ancestor everywhere and `takedown-revert-guard`
   would fail every PR forever, so the follow-up is not optional.
5. Verify the tree before pushing: file count vs `phase-c` = zero
   missing. Note (2026-08-24) that `studio-counter-portrait.jpg` from
   step 3 will NOT appear in that comparison — it is a placeholder asset
   that exists only on `main`, never on `phase-c`. With step 4 deferred,
   the expected result is a clean zero, no intentional exceptions.
6. PR into `main` → CI green (including `gutted-merge-guard`, which
   proves the tree complete before it retires) → operator merges.

## Launch-day checklist (§16 mechanics, verified live)

- Production pipeline: verify → check:approvals → production build
  (Front Door lockdown) → SWA deploy → Front Door cache purge.
- needlegirlie.com serves the site; SWA default hostname blocked;
  www → apex; HTTP → HTTPS; production indexable (previews stay
  noindexed); OG cards render; 404 at the edge.
- Films play from media.needlegirlie.com on production (206 Range
  probes; the four carousel films + the ICON film on /about + the two
  biostimulators reels `radiesse-visit.mp4` / `amy-reel.mp4` + the
  body-contouring reel `evolve-reel.mp4` + the /about team film
  `girl-team-film.mp4` (2026-08-25 — the sounded second rendition of
  the carousel team film's master) + the /injector-training reel
  `training-reel.mp4` (2026-08-25) — the Evolysse film retired
  2026-08-21 and its Blob object was deleted the same day, so it is
  not a probe target). On /services/biostimulators,
  /services/body-contouring, /about, and /injector-training also probe
  `/js/treatment-video.js` (200, `text/javascript`) and confirm the
  six players carry `data-autoplay="inview"` (two on biostimulators,
  one on body-contouring, two on /about: the ICON film — its scoped
  override, DECISIONS 2026-08-25 — and the team film; one on
  /injector-training, the training reel) — the films autoplay muted
  on approach.
- Plausible: `/api/event` returns 202 from the production page;
  dashboard shows the first pageviews.
- Vagaro + Skinbetter link-outs reachable; Lighthouse spot-run.
- Converged multi-pass probes (3 consecutive clean passes, plain +
  cache-busted) before telling Amy it's live.

## Standing PR bookkeeping at relaunch

- PR #95 (standing phase-c → main): superseded by the relaunch PR —
  close WITHOUT merging only after relaunch is live, or retarget per
  the operator's preference for the next round.
- PR #97 (standing demo): close without merging when the operator no
  longer needs the demo environment.

## After relaunch

- Post-relaunch continuing work happens against a LIVE site: every
  merge to main ships. The round's remaining items proceed as normal
  PRs with Amy's word per increment.
- Update docs/REDESIGN.md, PHASE-C.md, CHANGELOG, and memory records
  to the relaunched state; the takedown-era warnings in RUNBOOK get
  their close-out edits (the two-step section becomes historical).
