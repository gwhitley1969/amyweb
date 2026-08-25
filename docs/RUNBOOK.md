# Runbook — needlegirlie.com operations

Everything needed to run, change, and fix the site. Written for the operator;
assumes `az` and `gh` CLIs authenticated against the client tenant
(`needlegirlie.onmicrosoft.com`) and the GitHub repo (`gwhitley1969/amyweb`).

> **STATUS 2026-08-05: production is OFFLINE — serving the Under
> Construction placeholder** (since the same evening with Amy's studio
> photo in the window — the caricature is retired at her word, PR #99).
> The launch merge was reverted at operator
> direction (revert commit `e57a4448`; DECISIONS 2026-08-05 takedown
> entry) pending a client review round. Relaunch is TWO-STEP — see
> "Relaunching after the takedown" under Rollback. While the revert is
> reachable from `main` (it is no longer the tip — PR #99 moved past
> it — but ancestry is what matters): never merge `main` into
> `phase-c` (including PR #95's "Update branch" button) and never
> close PR #95. Since 2026-08-17 the **relaunch guard** enforces this
> mechanically (`.github/workflows/relaunch-guard.yml` — see the
> relaunch section). Until 2026-08-24 the workflow lived only on
> `phase-c` while `main` required its check, so the check could never
> report and **every** PR into `main` was permanently blocked; the file
> now ships on both branches and the two copies must stay identical
> (DECISIONS 2026-08-24). The `-95` preview
> cannot deploy during the takedown (merge ref conflicted by design);
> the full-site demo preview is **PR #97**'s environment.

## The system at a glance

| Piece | Value |
|---|---|
| Production | https://needlegirlie.com (canonical apex) |
| Redirecting hosts | www.needlegirlie.com, needlegirl.com, www.needlegirl.com → 301 to apex |
| Front Door | profile `afd-needlegirlie`, endpoint `needlegirlie` (`needlegirlie-b9bbeadqaucyd7af.z03.azurefd.net`), ID `ee68a15a-55e1-4220-8016-3052e33d4988` |
| Static Web App | `stapp-needlegirlie` (`polite-flower-0a41b770f.7.azurestaticapps.net`) — direct hits are **refused by design** (locked to Front Door; the config is the documented 403 form, but the platform was observed answering 404 with zero site content at launch, 2026-08-05 — either way, blocked) |
| Resource group | `rg-needlegirlie-web` (eastus2); DNS zones live in `rg-corp` |
| Subscription | `ng-website` (`62cd1c71-3239-4b8b-8a10-4dc4da52e29e`) |
| Budget | $60/mo, alerts at 50%/80% actual + 100% forecast |

The Front Door **default endpoint** (`*.azurefd.net`) serves 404 — also by
design: `allowedForwardedHosts` only admits the real hostnames.

## Everyday changes (content/code)

1. Branch → edit → `npm run verify` (must be green; never weaken a gate).
   *Before changing copy on a page that carries a pixel override, read that
   override's stated premise in CLAUDE.md, not just its verdict.* Several are
   conditioned on what the page's own text does or does not say, and nothing
   enforces that — `lint:claims` cannot see pixels. Precedent: the
   wrinkle-relaxers band photo was cleared 2026-08-18 because the site's copy
   never repeated its banner headline; a 2026-08-24 deck change made the copy
   paraphrase it, retiring the premise (DECISIONS 2026-08-24;
   compliance/README "What the linter cannot see: media text"). And note that
   a green `lint:claims` is a floor, not an authorization — copy can be
   non-compliant while tripping no pattern, in which case the override lives
   in DECISIONS and NOT in `allowedStrings` (compliance/README
   "Authorizations the registry does not hold").
2. Open a PR. CI runs the fast gates (build, `check`, `lint:claims`,
   `lint:voice` — about 20 seconds together), deploys a **preview
   environment**, and only then runs the slow gates (pa11y, Lighthouse).
   Previews are **public and noindexed** — no password (DECISIONS
   2026-07-21) — so the URL can go straight to Amy, but only **once the
   `Deploy preview to Azure Static Web Apps` step has finished**: sent
   earlier it 404s and reads as a broken link. Since 2026-08-25 that step
   finishes at roughly **1m45s**, not at the end of the job — you no longer
   wait out Lighthouse to send a link (DECISIONS same date). The job stays
   amber while the slow gates run; that is expected, and a red one means a
   preview is up that failed a11y or perf, so read the run before acting on
   the link. Closing the PR tears the preview down.
   *Documentation-only PRs run nothing and get no preview* — `paths-ignore`
   covers `docs/**`, `**/*.md`, `.gitignore` (DECISIONS 2026-07-26). Touch
   one source file and the full suite runs as usual.
3. Merge to `main`. The production workflow re-verifies, runs the
   **clinician-approval gate**, deploys, and purges the Front Door cache.
   Live in ~5–10 minutes end to end.

**After every merge into `phase-c`, refresh the standing previews.** Pushes to
`phase-c` deploy nowhere (see "Where `phase-c` is visible"), and GitHub does not
re-run a PR's workflows when its base branch moves — so a preview PR keeps
serving whatever it last built, indefinitely. Refresh each open preview PR by
merging `phase-c` into its branch and pushing: the standing client demo (**#97**)
and whatever review-scaffolding PR is open at the time. Skipping this is how
both previews came to be six commits stale on 2026-08-25, showing the client a
`/services` intro that had already been rewritten at her own direction.

**Hotfixing production during the takedown era.** What `needlegirlie.com`
serves today is the construction placeholder on `main`, not the site — a fix
to it is a PR into `main`, branched from `main`, never from `phase-c`. It runs
`pr-preview.yml` and the `gutted-merge-guard` check, which skips for any PR
carrying no post-takedown `phase-c` commits. Merging deploys production and
purges the Front Door cache like any other `main` merge. Precedent and the
reason this path exists at all: the Xtend-AI footer credit was lost from the
placeholder by the takedown revert and went unnoticed for nineteen days
(DECISIONS 2026-08-24).

## Where `phase-c` is visible

`pr-preview.yml` triggers on `pull_request` only — never on `push`. The
original design was that a **standing PR from `phase-c` → `main`** would
make each push a `synchronize` event, so that PR's environment served as
the stable `phase-c` preview. Launch PR #5 played that role until it merged
as the launch merge (2026-08-05), which tore its `…-5…` environment down.
The standing PR has been **#95** (draft "Next release") since.

**That mechanism has not worked since the takedown, and `…-95…` does not
resolve** — verified 2026-08-23: `/`, `/services`, and `/about` all 404.
This is not a regression to investigate; it was decided and recorded on
the day of the takedown. DECISIONS 2026-08-05, consequence (3): *"PR #95's
merge ref is conflicted by design, so the standing preview cannot deploy
during the takedown — interim previews come from sub-PRs into phase-c."*
See also "Relaunch guard" below: *a conflicted PR runs no workflows.*

Concretely: PR #95 is permanently **CONFLICTING** (the takedown topology
working as designed), GitHub will not run `pull_request` workflows for a PR
whose merge commit it cannot compute, so no `synchronize` run has ever
fired for #95 — its only checks come from the `push`-triggered Relaunch
guard, which is exactly why that workflow listens on
`push: branches: [phase-c]`. **Pushes to `phase-c` deploy nowhere.** This
resolves at relaunch, when the two-step re-sync makes #95's successor
mergeable again.

Do not wait on a `…-95…` environment, and do **not** close PR #95 to "fix"
it — closing it would not create a preview, and the relaunch depends on it.

**Where to look at `phase-c` meanwhile:** the demo environment below,
refreshed by merging `phase-c` into `chore/monday-demo-preview`. PR #97
works precisely because its base is `phase-c`, not `main`, so it never
conflicts and its `synchronize` events do fire. Any interim preview must be
built the same way — a branch off `phase-c`, PR **into** `phase-c`.

The environment number is the PR number — PR #61's preview was `…-61…`,
PR #97's is `…-97…`.

**The standing demo (the link the client keeps):** PR #97 — branch
`chore/monday-demo-preview`, a draft titled DO NOT MERGE — exists only
to hold the stable client-facing preview at
`https://polite-flower-0a41b770f-97.eastus2.7.azurestaticapps.net`.
Refresh after merges, on the operator's request: switch to the branch,
`git merge phase-c`, push, switch back; watch the PR-preview run to
completion, then verify with converged probes (below) before sharing.
Never merge #97 (its base would take the demo branch's merge commits);
if it is ever closed, open a fresh DO-NOT-MERGE draft from a fresh
branch off `phase-c` and note the new environment number here.

Treatment-content rules (CLAUDE.md hard constraint 4): only a human sets
`clinicianApproved: true`; any edit to approved content resets it to `false`
in the same commit; production deploys fail while unapproved non-draft
treatment content exists.

## Adding or replacing a homepage commercial

The home carousel (src/components/VideoCarousel.astro; behavior in
public/js/video-carousel.js) plays muted films from the media origin
(`https://media.needlegirlie.com` — Blob behind the same Front Door,
built 2026-08-17; see "Publishing a film" below). Captions stay in
public/media/ — in-repo, same-origin, ON PURPOSE (compliance-screened
text keeps its git audit trail, and same-origin tracks need no CORS).
To add or swap a film:

1. **Compliance screen FIRST** (frame-level, house method): contact
   sheet via `ffmpeg -i in.mp4 -vf "fps=1/2,scale=480:-1,tile=5x4"
   -frames:v 1 sheet.png`, vet every legible word/brand; on-camera
   clients need releases confirmed on the record; manufacturer films
   carry as-is or not at all (never trim safety screens); each film
   gets its DECISIONS entry before it ships.
2. **Encode the web rendition** (muted, ~2–4 Mbps):
   `ffmpeg -i master.mp4 -an -c:v libx264 -crf 23 -preset medium
   -movflags +faststart commercial-<name>.mp4` (a working file — the
   rendition is uploaded to the media origin, never committed), then
   **publish it** per "Publishing a film" below.
3. **Poster frame:** `ffmpeg -ss <t> -i rendition.mp4 -frames:v 1
   -q:v 2 src/assets/photos/commercial-<name>-poster.jpg` (pick a
   visually simple frame — posters count toward the / image budget).
4. **Captions:** `public/media/commercial-<name>.vtt` mirroring the
   film's on-screen text (the a11y gate requires a track on every
   built video; VTT files are outside lint:claims scope — the per-film
   override entry is the control).
5. Add the slide to the `slides` array in VideoCarousel.astro (the
   films render `object-fit: contain`, uncropped — for the Evolus
   spots that is a compliance requirement). Optional `rate` field =
   per-slide playback tempo (the studio reel runs 0.5×; tuning ladder
   in DECISIONS 2026-08-15). Amy's own films ONLY — manufacturer
   films always play at 1×, their presentation is carried as-is.
   0.5 is the floor (engines clamp below); slower means re-editing.
   Bars-row width: at four films the progress bars run 48px under
   600px (64px above); a FIFTH film overflows the 344px fold cover —
   revisit the bar width (~40px) or let the row wrap (the math lives
   in the component's bars comment).
6. `npm run verify` green → PR → preview → Amy's word → merge.

**Treatment-page films (sounded — `TreatmentVideo`)** follow the same
screen → DECISIONS → upload order, with four differences (first
site-authored pair: /services/biostimulators, 2026-08-21): the
rendition KEEPS its audio (`-c:a copy`; `-crf 20` for an HEVC source,
a lossless `-c copy` remux when the source is already H.264/AAC), the
captions are faithful to the audio (a transcript when there is
speech; bounded `[Music]` cues when there is none — a film-long cue
paints "[Music]" over the whole play), the poster is committed to
`src/assets/photos/<name>-poster.jpg` and is never requested above
its source width (the component clamps), and a film placed INSIDE a
media row takes `frame="bare"` so it sits with the bare arches (the
standalone player keeps its mat). Portrait films are sized by the
row column; nothing crops or masks a film. `autoplay="inview"` (same
day, operator direction) plays a film MUTED and looping while ~a third
of it is on screen, via the static `public/js/treatment-video.js`
(~2KB; reduced motion = click-to-play; the controls are the pause and
the tap-for-sound) — opt in ONLY for Amy's own speech-free films,
never a manufacturer film or one with narration.

Scripts on this site are STATIC FILES (public/js/) — never component
`<script>` blocks; see the troubleshooting entry below for why.

## Publishing a film (media origin)

Since 2026-08-17 (DECISIONS same date, external-audit Finding 5) the
.mp4 renditions live in Blob storage served as
`https://media.needlegirlie.com/<file>.mp4` — Front Door route
`media` → container `media` on the storage account (name via
`az storage account list -g rg-needlegirlie-web -o table`; Bicep in
`infra/storage.bicep`). Films are NOT in git; captions (.vtt) ARE
(public/media/, shipped by normal PR alongside the film's DECISIONS
entry).

1. Upload (after the compliance screen and DECISIONS entry):

   ```
   az storage blob upload --account-name <account> -c media \
     -f commercial-<name>.mp4 -n commercial-<name>.mp4 \
     --content-type video/mp4 \
     --content-cache-control "public, max-age=86400" --auth-mode key
   ```

2. Verify before linking: `curl -sI -r 0-1023
   https://media.needlegirlie.com/commercial-<name>.mp4` → expect
   `206`, `Content-Type: video/mp4`, `Accept-Ranges: bytes` (seeking
   depends on Range support).
3. **Replacing a file in place requires a purge** (edge caches it for
   a day): `az afd endpoint purge -g rg-needlegirlie-web
   --profile-name afd-needlegirlie --endpoint-name needlegirlie
   --content-paths '/commercial-<name>.mp4'` — prefer a NEW filename
   (and a normal PR for the reference) over in-place replacement;
   old files are deleted with `az storage blob delete` once
   zero-referenced.
4. The caption file and any slide/label change ship as a normal PR;
   previews play the same media host as production, so a film is
   reviewable on the PR preview the moment the upload lands.

Master files stay in the operator's archive (C:\Amy\Videos,
C:\Amy\New Pics) — renditions are re-derivable; the Blob copy is
serving infrastructure, not the archive.

## Turning on analytics (Plausible — prepped 2026-08-17, ships dark)

Everything is wired and gated behind `siteConfig.analytics`
(src/lib/siteConfig.ts); while it ships dark the site is byte-identical
to the no-analytics build. The flip is the operator's act, intended
for relaunch day so the baseline starts at day one:

1. Create the Plausible account (plausible.io, ~$9/mo — client
   pass-through) and add the site `needlegirlie.com`.
2. In `src/lib/siteConfig.ts` set `enabled: true` and
   `provider: 'plausible'`. That one edit does everything in the same
   build: BaseLayout emits the self-hosted tracker
   (public/js/plausible.js, `data-api` pointing at plausible.io), the
   privacy page swaps its analytics bullet (its launch wording
   promises "this page will be updated first" — the conditional keeps
   that promise atomically), and the generated CSP admits
   plausible.io in `connect-src` because the built page now carries
   the script (`generate-swa-config.mjs` sniffs dist/ — the header
   cannot drift from the code).
3. `npm run verify` → PR → preview: confirm the script tag renders,
   the privacy page shows the Plausible wording, and — on the
   preview — the Network tab shows the `/api/event` POST returning
   202. Watch the / perf gate: the tracker adds ~3.6KB of JS (budget
   headroom is ample, but read the numbers).
4. Merge on the operator's word. Verify events arrive in the
   Plausible dashboard once production traffic exists.

To turn it OFF, revert the two values — script, CSP widening, and
privacy wording all retract in the same build. The self-hosted
tracker file stays in the repo either way (dead weight ~3.6KB,
referenced by nothing while dark). Custom events: `track()` in
src/lib/analytics.ts is wired but has no callers — the site ships no
client-side component code; wiring the first event is a normal PR
when a consumer exists.

## Replacing site photography

The per-pic workflow (established over the 2026-08-17 photo round —
homepage doors, /services strip; the release/screening record for
each shipped page lives in DECISIONS):

1. **Screen the frame FIRST** at full resolution — full resolution is
   what ships: astro:assets serves the source-resolution derivative as
   the `<img src>` beside the srcset tiers, and the repo is public, so
   anything legible in the master is legible to a visitor (learned
   2026-08-21 on the skin-rejuvenation cart frame): vet every legible
   word (labels, banners, signage, embroidery, device screens) against
   the §8 claim rules; no other provider may appear (hard constraint 2); anything
   identifiable-but-illegible gets noted in the DECISIONS entry.
2. **Releases:** every identifiable client needs the operator's
   on-record confirmation that a website-use release is on file —
   the confirmation IS the record; quote it in DECISIONS.
3. **Dedup + resolution:** hash the pick against src/assets/photos
   (no duplicate commits) and confirm the source width ≥ the slot's
   largest served width (retina rule — nothing ships below delivery
   resolution).
4. **Content-named asset** (what it shows, never the slot name) into
   src/assets/photos/; slot names couple assets to placements.
5. Swap the import + rewrite the alt to what the new frame factually
   shows — never invent a treatment the pixels don't self-identify.
   Comment truth in the same file (release record, screening note).
   The /services menu cards are the exception on alts: their photos
   are decorative (`alt=""`) to the card's labeled link, and a swap
   is one line in ServiceLineGrid's `linePhotos` map (photo import +
   sharp gravity anchor — no page edits). Tone/grade fixes are
   asset-level: re-derive from the master in C:\Amy\New Pics (single
   generation — never re-process the committed JPEG), commit under
   the same content name, and record the exact sharp recipe in
   DECISIONS. When a frame's aspect can't cover-crop into the slot
   without losing the story (face AND device both required), the
   asset becomes a pre-composed blur-fill contain: the full frame at
   native resolution on a slot-aspect canvas, side bars a blurred
   blowup of the same frame (menu card 06 precedent, 2026-08-18 —
   recipe in DECISIONS). One escalation past that, for a TREATMENT
   BAND whose full landscape content must all be visible (client
   rejected both a person-losing crop and the blur-fill's bars on the
   wrinkle-relaxers band, 2026-08-18): the `media-band--segmental`
   layout variant — the arch family's wide sibling, its 3:2 window
   matching the frame exactly, so the full photo ships uncropped and
   unfilled (DECISIONS same date; BUILD_SPEC §5).
6. **Orphan check:** grep the outgoing asset repo-wide; zero
   remaining references → delete it (git history preserves the
   frame); any remaining consumer → it stays.
7. **Eyeball the built crops** — every slot crops server- or
   CSS-side (doors 640×800 attention; strip/portraits 4:5 at a fixed
   object-position; the twelve /services menu cards 640×800 at their
   per-photo gravity anchors from the ServiceLineGrid map; arch
   frames clip corners) — screenshot each changed slot at 390 and
   desktop before calling it done.
8. `npm run verify` green → PR → preview probes converge → Amy's
   word → merge.

## Rollback

Never force-push or rewrite `main`. Revert instead:

```
git revert <bad-commit-sha>
git push origin main
```

The production workflow redeploys the previous state and purges the cache.
(To revert a MERGE commit, add `-m 1` — parent 1 is the main side.)

### Relaunching after the takedown (2026-08-05)

The takedown reverted the launch merge (revert commit
`e57a4448f77e8ff64c623cd1d734fddfb0f00801`). Because main's history
still CONTAINS the phase-c commits, merging phase-c alone will NOT
restore the site — only post-takedown commits would apply, producing a
broken hybrid. Relaunch is two-step, in order:

1. **Revert the revert** on `main` (restores the full launch tree
   exactly): `git revert e57a4448…`, verify, push per this runbook —
   or carry both steps in one relaunch PR. Note: `main` has moved past
   the takedown revert (PR #99 put Amy's photo on the placeholder), so
   this revert can conflict on `src/pages/index.astro` and
   `src/assets/photos/studio-counter-portrait.jpg` — **take the
   launch-tree side**; the placeholder retires at relaunch anyway.
2. **Merge the updated `phase-c`** (brings the post-takedown
   revisions). Content edits made during revision reset the affected
   pages' `clinicianApproved` flags (constraint 4), so
   `check:approvals` correctly blocks production until Amy re-approves
   on a preview and the operator flips the flags — the same sign-off
   flow as launch.

The full execution record — preconditions (including the
**presentation-approval hard gate**: a dated entry in
docs/CLINICIAN-SIGN-OFF.md newer than the last merged visual change),
the ready-to-run PR steps, guard retirement, the analytics flip, and
the launch-day checklist — lives in **docs/RELAUNCH.md** (prepared
2026-08-17). Use it as the relaunch PR's script; do not re-derive.

During the takedown: never merge `main` into `phase-c`, never press
"Update branch" on PR #95, never close PR #95 (the standing-PR pattern
survives for relaunch). Interim previews come from sub-PRs into
`phase-c` — PR #97 is the standing full-site demo (comment-only diff,
never merges; close it without merging when no longer needed).

**The relaunch guard (2026-08-17, external-audit Finding 1):**
`.github/workflows/relaunch-guard.yml` enforces both halves of the
hazard as required status checks — `takedown-revert-guard` (PRs into
`phase-c` + pushes to it) fails if the takedown revert is reachable,
i.e. if `main` leaked in; `gutted-merge-guard` (PRs into `main`)
fails if a phase-c-derived merge would drop any phase-c file, i.e.
the naive one-step merge. Why the second matters: simulated
2026-08-17 — the naive merge silently deletes ~48 files (all twelve
treatment MDX pages, both treatment films, every photo) with no
conflict on any of them, and the build still passes. A conflicted PR
runs no workflows, but it also cannot merge; the guard fires exactly
when someone hand-resolves PR #95's conflicts and the merge ref
becomes computable. **The relaunch PR retires this workflow** (with
a DECISIONS entry): after the two-step re-sync the revert is a
harmless ancestor everywhere and the first job would fail every PR
forever.

## Manual cache purge

Deploys purge automatically. To force one:

```
az afd endpoint purge -g rg-needlegirlie-web --profile-name afd-needlegirlie \
  --endpoint-name needlegirlie --content-paths '/*'
```

HTML is edge-cached ~5 minutes (`max-age=300`); hashed `/_astro/*` assets are
immutable and never need purging.

## Preview access

There is none to manage: SWA password protection is **off**, and preview
environments are public + noindexed (DECISIONS 2026-07-21 — the basicAuth
cookie looped in Chrome for Windows and locked Amy out). `infra/swa.bicep`
deliberately declares no basicAuth resource; **do not re-add one** without
the operator, or the same lockout returns.

## Infrastructure changes (Bicep)

All Azure state is captured in `infra/`. To apply changes:

```
az deployment sub create --location eastus2 --template-file infra/main.bicep \
  --parameters budgetStartDate=2026-07-01
```

`budgetStartDate` is pinned: a budget's start date is IMMUTABLE (the
API rejects updates — learned 2026-08-17 when a re-deploy passed the
then-current month and only the budget module failed). Always pass the
live budget's own anchor, 2026-07-01. Run
`az deployment sub what-if` first and read it before applying.

Idempotent — safe to re-run. `budgetStartDate` is the only parameter without
a default, so it must be supplied each run; `location`,
`dnsZoneResourceGroup`, and `budgetContactEmails` default correctly.

Adding a Front Door custom domain takes three phases: TXT validation
(instant, automated in Bicep) → managed cert issuance (minutes) → edge
rollout (typically 10–30 min, occasionally up to an hour). During rollout
the domain serves Front Door's generic `*.azureedge.net` certificate and a
blue "Page not found" placeholder — **this is normal**; wait, don't debug.

## GitHub wiring

Secrets/variables are documented in `OPERATOR-SETUP.md` (all configured
2026-07-07). Two behaviors worth remembering:

- The production **deploy job only runs when the `FRONT_DOOR_ID` repo
  variable is set** — unsetting it is the kill switch for deploys while
  leaving CI gates active.
- The SWA deploy action uploads the pre-verified `dist/` as-is; it must
  never be allowed to build on its own.

## Troubleshooting

- **A preview environment 404s or serves stale/mixed content after
  "Deployment Complete":** SWA staging propagation, three observed
  presentations (PRs #79, #109, #110): route-level 200↔404 bursts;
  a fresh env serving unevenly for minutes; and — worst — the whole
  hostname serving SWA's *platform* 404 for 11+ minutes while
  `az staticwebapp environment list` reports the env **Ready** (ARM
  "Ready" ≠ serving). The artifact is never the suspect if CI passed.
  Remedy ladder: converged probes first (3 consecutive passes where
  EVERY route serves the exact expected marker counts, plain AND
  cache-busted — single clean passes lie), then re-run the workflow,
  then **close and re-open the PR** (tears the env down and recreates
  it — the only fix for a bad serving replica; even the recreated env
  can need several minutes to converge). Probe with `curl -sL`
  (trailing-slash 301s fake failures) and never share a link before
  probes converge.
- **pa11y contrast failure that appears/disappears with unrelated copy
  changes:** before 2026-08-17 the audit ran with animations live, so
  scroll-driven entrance blocks (`ng-rise`) froze at whatever partial
  opacity the page height put them at — one added line of text could
  flip a page's contrast verdict. Fixed by auditing the settled state:
  pa11y Chrome runs `--force-prefers-reduced-motion` (.pa11yci.json;
  the site's reduced-motion CSS disables the entrance animations —
  DECISIONS 2026-08-17). If a contrast error still appears, it is
  real: the element's final colors fail.
- **"Not secure" in a browser on the operator workstation:** the Canopy
  content filter (Netspark engine, local proxy on 127.0.0.1:3128) intercepts
  browser TLS and can present wrong certificates or stale content. Verify
  from a phone on cellular data, or with a direct handshake:
  `openssl s_client -connect needlegirlie.com:443 -servername needlegirlie.com`.
  Real visitors are unaffected.
- **CI fails in pa11y/Lighthouse with Chrome crashes:** the gates prefer the
  runner's system Chrome (`scripts/lib/chrome.mjs`); puppeteer's downloaded
  build has crashed on ubuntu-24.04 runners before.
- **CI fails a Lighthouse METRIC while every resource-summary budget
  passes:** likely a shared-runner phantom (three known cases were TBT on
  zero-JS pages; local TBT measures 0 ms). The gate already asserts the
  median of 3 runs (DECISIONS 2026-07-19). If a phantom still gets through:
  rerun once; if the identical code passes, the pre-agreed escalation rule
  applies — flag the operator with the evidence before touching any
  assertion. Expected verify wall time is ~6 minutes (3 Lighthouse runs
  per URL).
- **Production build fails with "FRONT_DOOR_ID is missing":** intentional —
  a production artifact must never ship without the origin lockdown GUID.
- **Stale page after a deploy:** hard refresh (Ctrl+F5); remember the 5-min
  HTML edge cache plus any local Canopy cache.
- **Preview serves unstyled HTML or mixed 404s after a "Succeeded" deploy:**
  the staging environment propagated unevenly (a bad serving replica). Tells:
  the 404s are SWA's *platform* page, not the branded /404; they come in
  bursts even on cache-busted URLs (`?bust=<unique>` — busted 404s prove the
  origin is at fault, not the browser/Canopy cache); pages render unstyled
  when HTML comes from a healthy replica but the hashed CSS 404s. If CI's
  pa11y passed, the artifact is not the suspect — do not "fix" code or
  gates. Kick: re-run the deploy workflow (`gh run rerun <id>`). If it
  persists, close and reopen the PR: teardown + recreation replaces the
  serving pool (same `-NN` hostname). Verify with 3–4 probe passes ~45s
  apart across several routes before sharing the URL — single green probes
  lie; the bursts have appeared ~100s in. Advise Ctrl+F5 locally afterward.
  (2026-08-01 incident, PR #79 — DECISIONS.)

- **A scripted feature works on a local server but is dead on the
  preview/production host:** the CSP (`script-src 'self'`, no
  unsafe-inline — both SWA config variants) silently refuses scripts
  inlined into the HTML, and Astro inlines component scripts smaller
  than 4KB. Local test servers that don't send the SWA headers cannot
  catch this — the home carousel shipped inert exactly this way
  (2026-08-14). Fix pattern: the script lives in `public/js/` as a
  plain static file referenced by a literal
  `<script type="module" src=... is:inline>` tag. Do NOT "fix" it with
  `vite.build.assetsInlineLimit: 0` — that also un-inlines every
  page's CSS and regressed wrinkle-relaxers past its LCP budget
  (CI-caught). When testing built pages locally, serve dist/ WITH the
  headers from the generated staticwebapp.config.json.

## Reference docs

- `DECISIONS.md` — why things are the way they are (append-only).
- `OPERATOR-SETUP.md` — GitHub/Azure wiring details.
- `BRAND-ASSETS.md` — logo sources and the export pipeline.
- `.claude/BUILD_SPEC.md` — the specification; §16 is the launch checklist.
