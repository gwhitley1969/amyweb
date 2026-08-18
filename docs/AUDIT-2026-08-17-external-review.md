# External architecture review — `amyweb` (needlegirlie.com)

**Reviewer:** external principal-architect pass (Claude, chat session)
**Date:** 2026-08-17
**Audience:** Claude Code, working in this repo
**Basis:** fresh clone of `https://github.com/gwhitley1969/amyweb`, no working-tree state, no prior session context

---

## 0. How to read this document

Every finding below was produced by running commands against a clean clone. **Verify each one yourself before acting** — the commands are given. If a finding doesn't reproduce, say so; do not act on it.

Findings are triaged by what they actually need. "Urgent" is not uniform here:

| # | Finding | Severity | Needs | Blocking relaunch? |
|---|---|---|---|---|
| 1 | Relaunch merge landmine (`main` ⇄ `phase-c`) | **High** | Mechanical guard — no operator decision | No, but it can destroy `phase-c` |
| 2 | Redesign round has no exit criterion; production dark | **High** | Operator + client decision only | Yes — it *is* the gate |
| 3 | `clinicianApproved` attests to copy, not presentation | Medium | Record change + one re-approval pass | Yes |
| 4 | Assistant scope conflict (BUILD_SPEC §3 vs. later decision) | Medium | Operator decision, then possible build | Depends on the answer |
| 5 | Self-hosted video: cost, coupling, git history | Medium | Build work + SOW narrative update | No |
| 6 | No analytics at launch | Medium | Operator decision (~$9/mo) | Should be |
| 7 | Housekeeping (orphan asset, `astro check` hints) | Low | Fold into the relaunch PR | No |

**One finding (stale project-knowledge snapshots) is outside this repo and is the operator's action — see §8.**

---

## 1. Repo state as observed

```
main       4655609  Merge PR #99 — construction page, Amy's studio photo
phase-c    b4da9e2  Merge PR #113 — 2026-08-17 audit close
```

- `git rev-list --left-right --count main...phase-c` → **`4  66`** (main 4 ahead, 66 behind)
- Tree size: `main` = **90 files**; `phase-c` = **165 files**
- Production currently serves the Under Construction placeholder (takedown `e57a4448`, 2026-08-05)

### Gates I ran on `phase-c` — all green

```
npm ci                  ok (see note)
npm run build           ok — 24 pages, sitemap written, SWA config generated
npm run check           0 errors, 0 warnings, 4 hints
npm run lint:claims     self-test passed; no banned patterns
npm run lint:voice      self-test passed; no first-person plural
npm run check:approvals self-test passed; 12/12 treatment files, all clinicianApproved: true
```

Not run: `test:a11y`, `test:perf` — the review sandbox could not download Chrome. **These are unverified externally; CI is the authority.** (Install note: `npm ci` needed `PUPPETEER_SKIP_DOWNLOAD=1` in the sandbox. Environment artifact, not a repo defect — do not "fix" it.)

**Conclusion: `phase-c` is in good shape. The engineering discipline in this repo — self-testing linters, the approval gate as a build blocker, the decision log — is doing its job. Every finding below is about coordination, scope, and history, not code quality.**

---

## 2. FINDING 1 — The relaunch is a two-step git maneuver with no mechanical guard

### What is true

`e57a4448` reverted the launch merge `aae51ba3`. A revert changes the **tree**, not the **history** — every `phase-c` commit remains an ancestor of `main`. Git therefore believes `main` already contains that work.

Merge base of `main` and `phase-c` is **`c36de77`** (phase-c's tip at launch). A plain `merge phase-c → main` applies only the 66 post-takedown commits on top of a tree where the launched files are *deleted*.

### Evidence — reproduce this in a throwaway clone, never in a real one

```bash
git clone <repo> /tmp/sim && cd /tmp/sim
git checkout main
git merge --no-edit origin/phase-c            # DO NOT PUSH
git ls-tree -r --name-only origin/phase-c | sort > /tmp/pc.txt
git ls-tree -r --name-only HEAD               | sort > /tmp/hd.txt
comm -23 /tmp/pc.txt /tmp/hd.txt | wc -l
```

Observed result:

- Merge completes with conflicts in **10 files** — all docs and components `phase-c` edited after the takedown.
- **77 files present on `phase-c` are absent from the merged tree**: `/about`, `/services`, all twelve treatment MDX files, `VideoCarousel.astro`, every photo asset, every `.mp4`.
- **None of those 77 are reported as conflicts.** A file `phase-c` didn't touch post-takedown has no competing change, so the deletion applies silently.

That is the hazard: ten conflicts get resolved, the merge goes green, and a site missing three quarters of its pages ships. The Astro build would very likely still pass — it builds whatever pages exist.

### The RUNBOOK procedure is correct — verified

```
1. git revert e57a4448…    # conflicts on src/pages/index.astro — take the launch-tree side
2. merge phase-c
```

Observed: step 1 → 145 files; step 2 → **166 files, zero missing vs. `phase-c`**.

The inverse — merging `main` **into** `phase-c` (GitHub's "Update branch" button on standing PR #95) — applies those same 77 deletions to `phase-c` itself.

### Requested action

Add a required status check on PRs targeting `phase-c` that fails when the takedown revert is reachable from the PR head:

```yaml
- name: Takedown-revert guard
  run: |
    if git merge-base --is-ancestor e57a4448f77e8ff64c623cd1d734fddfb0f00801 HEAD; then
      echo "::error::The takedown revert is an ancestor of this branch."
      echo "Merging main into phase-c deletes the launched site. See RUNBOOK, 'Relaunching after the takedown'."
      exit 1
    fi
```

Requires `fetch-depth: 0` on checkout. Propose it as its own PR into `phase-c`; do not bundle it with content work.

### Acceptance criteria

- Guard job runs on `pull_request` targeting `phase-c` and is marked required.
- A deliberate test branch containing the revert fails the check with the message above.
- RUNBOOK's "Relaunching after the takedown" section cross-references the guard.
- Guard is removed (or made inert) as part of the relaunch PR itself, with a DECISIONS entry.

---

## 3. FINDING 2 — The redesign round has no exit criterion, and production is dark

### What is true

- Production has served the placeholder since **2026-08-05** — 12 days at time of review.
- `docs/REDESIGN.md` → Open items: *"The operator's full change list ('A LOT more') — in progress; gates the §5-style design plan for the rest of the round."*
- No relaunch date is recorded anywhere in the repo.
- The round's trigger is a subjective client judgment. The seven-gap yardstick is good instrumentation, but a yardstick is not a stopping rule.

### Why it matters

1. **Fixed-fee exposure.** Phase 2 is fixed-fee; every hour past the original scope is margin, not revenue.
2. **Phase 3 is downstream.** App Store and Play submission both require a live privacy-policy URL, which lives on this site. Website relaunch is on the critical path for a ~221-hour engagement. Every week dark is a week Phase 3 cannot reach submission.
3. **`phase-c` today is already materially ahead of what was taken down** — hero, four-film carousel, Playfair sitewide, MA badge, sitewide arches, two pages of new photography.

### Requested action

**This is an operator decision, not a Claude Code decision.** Do not propose a relaunch PR until it's answered. What Claude Code can usefully do now:

- Draft `docs/REDESIGN.md` → a **"Round close"** section with three empty slots to be filled by the operator: (a) the frozen change list, (b) the relaunch date, (c) the seven gaps restated as pass/fail acceptance tests.
- Draft the relaunch PR *body* (two-step procedure, conflict expectations, the §4 re-approval gate) so it's ready the moment the date lands.

### Acceptance criteria

- `REDESIGN.md` carries a dated, frozen change list and a relaunch target date.
- Anything raised after the freeze is recorded as change-order or retainer scope, not silently absorbed.

---

## 4. FINDING 3 — The approval gate attests to copy, not to presentation

### What is true

`scripts/check-approvals.mjs` reads `clinicianApproved` from treatment MDX frontmatter; MDX edits reset it. This is a good control and it works — verified, 12/12 pass.

Its scope is **file contents**. What Amy signs off on is **rendered pages**. Those have diverged since her 2026-08-05 approval:

- Body type → Playfair 17px/1.65, DM Sans retired (PR #103)
- Every photo now inside `.ng-arch` with a **4:5 CSS crop** (2026-08-17)
- The arch rollout used a `TreatmentLayout` selector mirror **specifically so MDX wasn't touched and flags wouldn't reset** — recorded in DECISIONS as intentional

So all twelve flags read `true` against an approval given on visibly different pages.

### The gap is already visible in your own log

DECISIONS 2026-08-17 records: `studio-wide`'s alt text says "two clients" while the 4:5 window shows one — kept as-is because an alt edit is an MDX edit that resets the flag. The site currently ships alt text that does not match the rendered image. Small, but it's the incentive structure showing through: the gate makes presentation-accurate alt text expensive.

### Requested action

1. In `docs/CLINICIAN-SIGN-OFF.md`, split the record into **copy approval** (gate-enforced, per-file) and **presentation approval** (preview-reviewed, per-round, dated). Do not change the gate's logic — it's correctly scoped.
2. Add the consolidated re-approval pass to the relaunch checklist as a **hard gate**, not a to-do.
3. Log the `studio-wide` alt mismatch as a known defect to fix during that pass, when the reset is happening anyway.
4. Note in `BUILD_SPEC` §7 that CSS-level presentation changes do not reset flags **by design**, and that presentation approval is therefore a separate, manual record.

### Acceptance criteria

- Sign-off doc distinguishes the two approval types with dates.
- Relaunch cannot proceed without a presentation-approval date newer than the last shipped visual change.

---

## 5. FINDING 4 — Assistant scope conflict

### What is true

- `.claude/BUILD_SPEC.md` §3: the AI assistant is explicitly **not** in v1 — "Phase 3, mobile app". §4.5 diagram carries `[Phase 3 will add /api/* → Container Apps — NOT built now]`.
- The Phase 2 SOW draft §4.2 argues the same at length: the public web is the highest-abuse, highest-cost LLM surface.
- A later scope decision (recorded outside this repo) moved a **text-only, filtered assistant into website launch**.
- Repo reality: **no `/api`, no Functions, no Azure OpenAI resource in Bicep, no corpus compile step, no `CorpusProvider` seam, no challenge/rate-limiting, no output filter.**
- `infra/budget.bicep` → `param monthlyAmount int = 60`, against a modeled website run-rate of ~$45–50/mo. Any metered AI usage trips the forecast alert immediately.

### Why it matters

This would be the **first server-side component in an architecture whose security and cost story rests entirely on being static**. It changes the threat model (prompt injection, token-burn abuse), the cost model (metered, unbounded without caps), and the ops model. It is an increment, not an add-on.

### Requested action

Do not build anything here. Surface the fork to the operator and record the answer:

- **If out of relaunch scope:** BUILD_SPEC stays as written; the Phase 2 SOW cost narrative needs updating (it's already owed an update for metered AI).
- **If in scope:** it needs its own plan — endpoint host, corpus compile from the same content collections, deterministic `$`-suppression output filter, challenge before session-token issuance, per-session/per-IP caps, and a `monthlyAmount` that reflects the real ceiling.

Either way: **"relaunch" currently has no agreed definition of done.** Flag that as the blocking ambiguity.

---

## 6. FINDING 5 — Self-hosted video

### What is true

```
public/media/  53 MB across 6 .mp4 files (largest: evolus-icon.mp4, 15 MB)
dist/          59 MB total
.git/          68 MB
.gitattributes contains no .mp4 rule; no Git LFS in use
```

Four of the six autoplay in the homepage carousel (facade-loaded, so zero bytes at page load — that part is correct engineering).

The Phase 2 SOW §4.3 states video is **embedded from YouTube/Vimeo, not self-hosted**, and the cost model lines up video hosting at **$0**. That line is now factually wrong.

### Four distinct problems

1. **SOW contradiction** — the client-facing cost narrative misstates the architecture. Fix alongside the metered-AI update already owed.
2. **Unmodeled egress** — roughly 30 MB per visitor who watches the carousel through. Small in absolute terms today; it is the one run-rate line that **scales with marketing success** and it appears nowhere in the model. Verify current Front Door egress pricing before quoting a figure to the client.
3. **Permanent git history** — no LFS rule for `.mp4`; every re-encode adds a full copy forever. `.git` is already 68 MB, paid on every CI checkout.
4. **Media is coupled to code — the one that actually bites.** Swapping a film today = commit + build + deploy + cache purge. With a Blob `/media` origin behind the existing Front Door it's an upload. The redesign direction is explicitly video-led and Amy produces content continuously.

`docs/REDESIGN.md` already records the Blob `/media` origin as *"Recommended, not built"* at ~$1–2/mo.

### Requested action

- Draft the Bicep for a `/media` Blob origin behind the existing Front Door profile, plus the route and cache rules. Propose separately from content work.
- Add a `.gitattributes` LFS rule for `.mp4` **going forward** (this does not shrink existing history — do not attempt history rewriting; the RUNBOOK's no-rewrite stance stands).
- Record the migration path for the six existing films, including the cache-purge implication.

---

## 7. FINDING 6 — No analytics

`{{ANALYTICS_PROVIDER}}` resolved to **none at launch** (2026-08-04, `src/lib/siteConfig.ts`). `src/lib/analytics.ts` is a no-op shim.

The client's objection is subjective; the only durable rebuttal is eventually behavioural data. With no instrumentation there is no way to answer "did the redesign work" at relaunch or at retainer-renewal.

**Correction worth recording:** a true before/after is no longer obtainable — the site was live for hours only. What's obtainable is a **forward baseline from relaunch day**, plus whatever booking-source data Vagaro exposes.

Plausible (~$9/mo, cookieless) was flagged as the candidate; cookieless matters on a health-adjacent site where GA4 raises consent questions. **Operator decision — needed before relaunch, so the baseline starts on day one.** Claude Code: prepare the integration behind the existing shim so it's a config flip, not a build.

---

## 8. FINDING 7 — Housekeeping (fold into the relaunch PR)

- **Orphan asset after relaunch.** The two-step relaunch yields **166 files vs. `phase-c`'s 165**. The extra is `src/assets/photos/studio-counter-portrait.jpg`, added by PR #99 for the placeholder; `phase-c`'s hero uses `needlegirlie-hero.jpg`. Delete it in the relaunch PR — it becomes zero-reference the moment the placeholder retires.
- **4 `astro check` hints** — all `is:inline` on JSON-LD `<script>` tags in `SeoHead.astro` / `schema.ts`. Cosmetic; adding the directive silences them. Note that BUILD_SPEC §CSP already discusses `is:inline` handling — follow whatever that section mandates rather than adding directives blindly.
- **Outside this repo — operator action.** The `DECISIONS.md` / `PHASE-C.md` / `CHANGELOG.md` snapshots attached to the operator's Claude Project are ~2026-07-07 vintage (291 / 147 / 78 lines vs. the repo's 3,490 / 557 / 1,118+). They describe a superseded world: no carousel, no arches, DM Sans live, flags false, site up. Any session reading them as current will reason from stale facts. Re-upload from `phase-c` or remove.

---

## 9. Guardrails for this review

**Do not, without explicit operator instruction:**

- Merge `main` into `phase-c`, or press "Update branch" on PR #95, or close PR #95.
- Merge `phase-c` into `main` — the relaunch is two-step and gated on §3 and §4 above.
- Rewrite history, force-push, or run `git filter-repo`/LFS migration on existing commits.
- Edit any file under `src/content/treatments/` — every edit resets `clinicianApproved`.
- Build any part of the AI assistant.
- Change `check-approvals.mjs`, `lint-claims.mjs`, or `lint-voice.mjs` logic. If a gate blocks something, that is the gate working; raise it.

**Do, as separate PRs into `phase-c`:** the §2 guard workflow, the §4 sign-off record change, the §6 Blob origin draft, the §7 shim prep, and the §8 housekeeping items.

---

## 10. Decisions needed from the operator before further work

1. **Does relaunch wait for the full change list, or does `phase-c` go up now and the round continue against a live site?** Everything else resolves differently depending on this.
2. **Is the text-only assistant in relaunch scope, or is BUILD_SPEC §3 still correct?**
3. **Analytics at relaunch — Plausible, or still none?**
4. **Blob `/media` origin — build now, or defer until the video program grows further?**

Answer 1 first. It sets the clock on everything above.
