# Skincare Page (Skinbetter Science) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the twelfth service line — `/services/skincare` as a Skinbetter Science product showcase with a working practice-storefront CTA.

**Architecture:** Content-only feature on the existing treatment-page machinery: one config value (`siteConfig.skinbetterUrl`), one rewritten MDX content file with `productDetails` cards and two photos, and doc/registry updates. No schema changes, no new components, no new dependencies.

**Tech Stack:** Astro 5 content collections + MDX, `astro:assets`, existing `TreatmentLayout`/`ProductDetailCards`/`CTAButton`. Gates: `lint:claims`, `lint:voice`, pa11y, Lighthouse.

**Spec:** `docs/superpowers/specs/2026-07-23-skincare-page-design.md` (operator-approved 2026-07-23 — read it first).

## Global Constraints

- Work happens in the worktree `C:\Amy\wt-skincare` on branch `feat/skincare-page` (off `phase-c`). NEVER switch the main tree (`C:\Amy\website`) off `phase-c`.
- `clinicianApproved: false` stays false — only the human operator ever flips it (CLAUDE.md hard constraint 4).
- No pricing anywhere on the page: no `priceLines`, `pricingDisplay: none`.
- Voice: the site speaks as Amy — "we/our/us/let's" never appear in rendered text (`lint:voice` enforces).
- Claim discipline (§8): descriptors state what a product *is*, never what it *achieves*. No efficacy/outcome/comparison/superiority language, no disease verbs, no dosing. Applies to copy, FAQ, SEO strings, and alt text alike.
- Never weaken a gate or `compliance/banned-patterns.json` to make something pass — fix content or stop and flag.
- "consultation" = clinical routing; "appointment" = booking (§6 language convention).
- Title-case "Skinbetter Science" in prose; official casing inside product names (AlphaRet, sunbetter TONE SMART SPF 75, InterFuse).
- Storefront URL is exactly `https://connect.skinbetter.com/MobileAesthetics` — no `?k=signup` (spec records the in-browser evidence for why).
- Treatment-page content changes get their own `content:` commit (clinician audit trail).
- Repo has no unit-test suite; the test cycle is the gate suite. Every task runs its named gates before its commit.

---

### Task 1: Worktree build baseline

**Files:**
- Create: `C:\Amy\wt-skincare\node_modules` (junction — never committed)

**Interfaces:**
- Produces: a worktree in which `npm run build`, `npm run check`, and the lint gates run; all later tasks depend on it.

- [ ] **Step 1: Junction the shared node_modules into the worktree**

The worktree has no `node_modules`. Junction the main tree's (established house pattern — and at cleanup time the junction must be removed BEFORE `git worktree remove`, or git traverses it and guts the shared install):

```powershell
New-Item -ItemType Junction -Path "C:\Amy\wt-skincare\node_modules" -Target "C:\Amy\website\node_modules"
```

Expected: junction created, no error.

- [ ] **Step 2: Baseline build + check (proves the worktree is green before any change)**

```powershell
cd C:\Amy\wt-skincare
npm run build && npm run check
```

Expected: build completes (`✓ Completed` / pages generated including `/services/skincare` from the existing stub), `astro check` reports 0 errors. If this fails, STOP — the baseline is broken and nothing in this plan caused it.

---

### Task 2: Resolve `skinbetterUrl` + correct stale ownership comments

**Files:**
- Modify: `C:\Amy\wt-skincare\src\lib\siteConfig.ts` (lines 16–31)

**Interfaces:**
- Produces: `siteConfig.skinbetterUrl === 'https://connect.skinbetter.com/MobileAesthetics'` — consumed by `CTAButton.astro`'s `shop` variant (already wired; no component edits).

- [ ] **Step 1: Replace the booking/skinbetter/social block**

In `src/lib/siteConfig.ts`, replace lines 16–31 (the `booking` object through the `social` opening comment) so the section reads:

```ts
  booking: {
    // {{VAGARO_URL}} supplied by operator 2026-07-18. The handle is the
    // practice's own: Mobile Aesthetics is Amy's business (sole owner —
    // operator 2026-07-23, recorded in DECISIONS); the 2026-07-18
    // shared-location flag is resolved. Reachability still gets checked
    // at the §16 launch checklist.
    vagaroUrl: 'https://www.vagaro.com/mobileaestheticshealthandbeautyassociates',
  },
  // {{SKINBETTER_URL}} resolved by operator 2026-07-23 (DECISIONS same
  // date). Canonical form of the QR on Amy's Skinbetter counter card
  // (skinbetter.pro/MobileAesthetics 301s here); lands on the
  // skinbetter.com shop carrying the practice's businessPartner_id
  // (verified in-browser). Mobile Aesthetics is Amy's own practice, so
  // the storefront is hers. The QR's ?k=signup variant (account-form
  // first) is deliberately NOT used — a Shop button lands on the shop;
  // practice attribution is identical either way.
  skinbetterUrl: 'https://connect.skinbetter.com/MobileAesthetics',
  social: {
    // {{SOCIAL_LINKS}} supplied by operator 2026-07-18. The Yelp listing
    // runs under the practice name — Mobile Aesthetics is Amy's own
    // business (sole owner — operator 2026-07-23), so the earlier
    // "location's, not Amy-specific" flag is resolved.
```

Leave the three social URLs and everything else untouched.

- [ ] **Step 2: Build + check**

```powershell
cd C:\Amy\wt-skincare
npm run build && npm run check
```

Expected: PASS. The built stub page's shop button now carries the real href.

- [ ] **Step 3: Verify the href landed in built HTML**

```powershell
Select-String -Path "C:\Amy\wt-skincare\dist\services\skincare\index.html" -Pattern 'connect\.skinbetter\.com/MobileAesthetics' | Measure-Object | Select-Object -ExpandProperty Count
```

Expected: `1` or more. Also confirm no token remains anywhere in dist:

```powershell
Get-ChildItem "C:\Amy\wt-skincare\dist" -Recurse -Filter *.html | Select-String -Pattern 'SKINBETTER_URL' | Measure-Object | Select-Object -ExpandProperty Count
```

Expected: `0`.

- [ ] **Step 4: Commit**

```powershell
git -C "C:\Amy\wt-skincare" add src/lib/siteConfig.ts
git -C "C:\Amy\wt-skincare" commit -m @'
feat: resolve {{SKINBETTER_URL}} to Amy's practice storefront

Canonical target of the counter-card QR (skinbetter.pro 301s to
connect.skinbetter.com/MobileAesthetics); ?k=signup deliberately
dropped. Vagaro/Yelp shared-location comments corrected per the
sole-owner fact (operator 2026-07-23).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 3: Vet and stage the two photos

**Files:**
- Create: `C:\Amy\wt-skincare\src\assets\photos\skinbetter-lineup.jpg` (from `C:\Amy\pics\8K0A9881.jpg`)
- Create: `C:\Amy\wt-skincare\src\assets\photos\skinbetter-shelf.jpg` (from `C:\Amy\pics\8K0A9922.jpg`)

**Interfaces:**
- Produces: the two asset paths Task 4's MDX imports (`../../assets/photos/skinbetter-lineup.jpg`, `../../assets/photos/skinbetter-shelf.jpg`). Committed WITH Task 4's content commit, not separately.

- [ ] **Step 1: Zoom-vet both source frames at full resolution (house method)**

Read both images with the Read tool and inspect every legible label region closely: `C:\Amy\pics\8K0A9881.jpg` and `C:\Amy\pics\8K0A9922.jpg`.

Pass criteria (all must hold):
- Only Skinbetter product/brand names legible — no dosing, units, mg amounts, or usage-protocol text readable at any zoom.
- No other provider's name/material visible; no client present (Amy-solo frames need no release — PR #35 precedent).
- No legible third-party brand material.

Known content (from design-phase review at 1600px): lineup = Amy in pink blazer holding six labeled products; shelf = retail shelf with bottles and wrapped boxes (InterFuse, Mystro, AlphaRet, sunbetter, Even Tone, Trio, Alto, Refining Foam). Skincare packaging carries no dosing. If anything hazardous IS legible at full res, STOP and flag to the operator before committing.

- [ ] **Step 2: Copy into assets under the site names**

```powershell
Copy-Item "C:\Amy\pics\8K0A9881.jpg" "C:\Amy\wt-skincare\src\assets\photos\skinbetter-lineup.jpg"
Copy-Item "C:\Amy\pics\8K0A9922.jpg" "C:\Amy\wt-skincare\src\assets\photos\skinbetter-shelf.jpg"
```

Expected: both files exist in `src/assets/photos/` (roughly 318 KB and 388 KB). No commit yet — they ride Task 4's content commit.

---

### Task 4: Rewrite `skincare.mdx` — showcase content

**Files:**
- Modify: `C:\Amy\wt-skincare\src\content\treatments\skincare.mdx` (full rewrite)

**Interfaces:**
- Consumes: Task 3's two asset files; the existing `TreatmentLayout` fixed order (lead → deck → product cards under an automatic "What Amy offers" heading → MDX body → visit steps → FAQ → router card → disclaimer → noir band with the shop CTA).
- Produces: the complete page. Note the layout renders the cards BEFORE the body, so the body's first section may refer to "the products above."

- [ ] **Step 1: Replace the entire file with:**

````mdx
---
title: Skincare
line: skincare
summary: "Medical-grade skincare from Skinbetter Science, available through Amy's practice storefront."
deck: "Medical-grade skincare, chosen with a clinician's eye."
products:
  - "Refining Foam"
  - "Mystro Active Balance Serum"
  - "Alto Advanced Defense and Repair Serum"
  - "Even Tone Correcting Serum"
  - "AlphaRet Overnight Cream"
  - "Trio Rebalancing Moisture Treatment"
  - "InterFuse Treatment Cream — Face & Neck"
  - "InterFuse Treatment Cream — Eye"
  - "sunbetter TONE SMART SPF 75 Sunscreen Lotion"
productDetails:
  - name: "Refining Foam"
    tag: "Cleanse"
    detail: "A gentle foaming cleanser for daily use."
  - name: "Mystro Active Balance Serum"
    tag: "Serum"
    detail: "A daily serum built on a botanically derived active blend."
  - name: "Alto Advanced Defense and Repair Serum"
    tag: "Serum"
    detail: "A serum formulated with a broad blend of antioxidants."
  - name: "Even Tone Correcting Serum"
    tag: "Serum"
    detail: "A serum designed for the appearance of uneven tone and discoloration."
  - name: "AlphaRet Overnight Cream"
    tag: "Renew"
    detail: "An overnight cream built on AlphaRet, Skinbetter's patented retinoid-plus-AHA technology."
  - name: "Trio Rebalancing Moisture Treatment"
    tag: "Moisturize"
    detail: "A moisturizer that pairs three approaches to hydration in one formula."
  - name: "InterFuse Treatment Cream — Face & Neck"
    tag: "Moisturize"
    detail: "A peptide and hyaluronic-acid cream for face and neck, using the InterFuse delivery technology."
  - name: "InterFuse Treatment Cream — Eye"
    tag: "Eye"
    detail: "The eye-area treatment cream from the same InterFuse line."
  - name: "sunbetter TONE SMART SPF 75 Sunscreen Lotion"
    tag: "Protect"
    detail: "A mineral, broad-spectrum SPF 75 sunscreen lotion with a sheer tint."
ctaType: shop
pricingDisplay: none
clinicianApproved: false
draft: false
faq:
  - q: "Where do skincare purchases happen?"
    a: "In the studio at any appointment, or online through the Skinbetter Science storefront — the shop button on this page opens it. A first online order creates a Skinbetter account tied to Amy's practice; after that it's ordinary online shopping, shipped to your door."
  - q: "Why does the storefront say Mobile Aesthetics?"
    a: "Mobile Aesthetics is Amy's own practice — the storefront runs under the practice name. A purchase there is a purchase with Amy."
  - q: "How do I know which products suit my skin?"
    a: "That's a conversation with Amy — ask at any appointment, or request a free consultation."
seo:
  title: "Medical-Grade Skincare in Harrisburg & Charlotte, NC | Needle Girlie"
  description: "Skinbetter Science medical-grade skincare through Amy Palacios, FNP — in the Harrisburg, NC studio or through her practice storefront, serving the Charlotte area."
---

import { Image } from 'astro:assets';
import skinbetterLineup from '../../assets/photos/skinbetter-lineup.jpg';
import skinbetterShelf from '../../assets/photos/skinbetter-shelf.jpg';

<section class="media-row">
  <figure class="media-figure">
    <Image
      src={skinbetterLineup}
      alt="Six Skinbetter Science products held out toward the camera in the Harrisburg studio."
      widths={[340, 540, 680]}
      sizes="(max-width: 40rem) 90vw, 17rem"
    />
    <figcaption class="eyebrow">In the studio</figcaption>
  </figure>
  <div class="media-copy">

## What it is

Skinbetter Science is a medical-grade skincare line sold only through
authorized practices — not drugstores, not marketplaces. Amy carries it
at her Harrisburg studio, and the products above are the ones she stocks
and works with herself.

  </div>
</section>

## How buying works

There are two routes, and both run through Amy's practice.

**At the studio** — pick products up at any appointment, and talk through
what you're taking home with Amy while you're in the chair.

**Online** — the shop button on this page opens the Skinbetter Science
storefront. It runs under **Mobile Aesthetics — Amy's own practice** —
so that's the name you'll see when it opens. A first order creates a
Skinbetter account tied to the practice, and orders ship directly to
your door.

## Which products suit your skin

That isn't a question a webpage should answer — and this one won't try.
Which formulas fit your skin, and in what order, is a conversation with
Amy: ask at any appointment, or request a free consultation.

<section class="media-row media-row--flip">
  <div class="media-copy">

## Individualized, with Amy

Skincare guidance here comes from the same clinician who knows your
treatment plan: Amy Palacios, FNP, at her Harrisburg studio in the
greater Charlotte area.

  </div>
  <figure class="media-figure">
    <Image
      src={skinbetterShelf}
      alt="Skinbetter Science bottles and boxed products lined up on a shelf in the studio."
      widths={[340, 540, 680]}
      sizes="(max-width: 40rem) 90vw, 17rem"
    />
    <figcaption class="eyebrow">On the shelf</figcaption>
  </figure>
</section>
````

- [ ] **Step 2: Run the content gates**

```powershell
cd C:\Amy\wt-skincare
npm run lint:claims
npm run build && npm run check
npm run lint:voice
```

Expected: all PASS. (`lint:voice` runs over built HTML — build first.) If `lint:claims` flags anything: fix the flagged copy (the gate is never weakened). If a trademark product *name* itself trips a category, STOP and flag to the operator — names cannot be reworded unilaterally and allowlist edits are operator-only.

- [ ] **Step 3: Visual sanity check of the built page**

```powershell
Select-String -Path "C:\Amy\wt-skincare\dist\services\skincare\index.html" -Pattern 'What Amy offers','skinbetter-lineup','skinbetter-shelf','data-event="skinbetter_click"' | ForEach-Object { $_.Pattern }
```

Expected: all four patterns found (cards heading, both images, tracked CTA). Also confirm the images were pipeline-processed:

```powershell
(Get-ChildItem "C:\Amy\wt-skincare\dist\_astro" | Where-Object Name -match 'skinbetter').Count
```

Expected: ≥ 2 (hashed AVIF/WebP derivatives exist).

- [ ] **Step 4: Commit (content + its two assets — the clinician audit-trail commit)**

```powershell
git -C "C:\Amy\wt-skincare" add src/content/treatments/skincare.mdx src/assets/photos/skinbetter-lineup.jpg src/assets/photos/skinbetter-shelf.jpg
git -C "C:\Amy\wt-skincare" commit -m @'
content: skincare — Skinbetter Science showcase

Nine claim-free product cards (what Amy stocks, verified against her
studio photos), storefront routes + Mobile Aesthetics brand-handoff
copy, two pro photos. No pricing; clinicianApproved stays false.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 5: Docs + registry updates

**Files:**
- Modify: `C:\Amy\wt-skincare\docs\DECISIONS.md` (append)
- Modify: `C:\Amy\wt-skincare\docs\CHANGELOG.md` (insert newest-first under `## Phase C`)
- Modify: `C:\Amy\wt-skincare\.claude\BUILD_SPEC.md` (§9 storefront line ~534, §16 checklist line ~660, §17 row ~679)

**Interfaces:**
- Consumes: facts as recorded in the spec (`docs/superpowers/specs/2026-07-23-skincare-page-design.md`).

- [ ] **Step 1: Append to `docs/DECISIONS.md`:**

```markdown

## 2026-07-23 — Skincare page: storefront URL decoded from Amy's own QR card

Context: the twelfth line's conversion path needed `{{SKINBETTER_URL}}`
("operator to supply"). It arrived indirectly: the QR on Amy's Skinbetter
counter card (C:\Amy\pics\20260623_175534.jpg) decodes — scratchpad jsqr,
never committed — to skinbetter.pro//MobileAesthetics?k=signup, which
301s to connect.skinbetter.com/MobileAesthetics. Both variants verified
in-browser: the bare URL lands on the skinbetter.com shop, ?k=signup on a
create-account form; both carry the practice's businessPartner_id (§9's
"businessPartner id" confirmed live). Decision: wire the canonical bare
URL — a Shop button lands on the shop, attribution is identical, and the
card's signup-first flow suits in-studio acquisition rather than a
website CTA. The operator also established that Amy is the sole owner of
Mobile Aesthetics, which settles the §16 checklist item ("hers, not the
shared location's") by fact and retires the 2026-07-18 Vagaro/Yelp
shared-location flags (comments corrected; URLs unchanged; constraint 2
and the voice rule unaffected — sole owner ≠ sole provider).
Alternatives rejected: the ?k=signup URL (form-first landing punishes
cold traffic); reproducing the QR image on the page (redundant with the
button). Consequences: siteConfig.skinbetterUrl is live and the
skinbetter_click event is armed; §9/§16/§17 updated; the page ships
clinicianApproved: false behind the DraftBanner like every treatment
line.
```

- [ ] **Step 2: Insert into `docs/CHANGELOG.md`** directly under the `## Phase C — pages & content drafts (`phase-c`)` heading (above the 2026-07-22 entries):

```markdown
### 2026-07-23 — Skincare: the twelfth line's storefront opens

- **/services/skincare** rebuilt as a product showcase: the nine
  Skinbetter Science products Amy stocks (verified against her studio
  photos) on claim-free cards — no pricing; prices live in the
  storefront — plus two photos from the pro shoot.
- "Shop Skinbetter Science" is live: `{{SKINBETTER_URL}}` resolved to
  the practice storefront, decoded from Amy's own counter-card QR and
  verified in-browser (DECISIONS same date). Ships
  `clinicianApproved: false` behind the DraftBanner.
```

- [ ] **Step 3: BUILD_SPEC edits (read each target line first, then Edit with the exact current text as anchor):**

3a. **§17 registry row** (~line 679). Current: `| `{{SKINBETTER_URL}}` | Amy's partner storefront URL | Operator to supply |` → new:

```markdown
| `{{SKINBETTER_URL}}` | Amy's partner storefront URL | Resolved 2026-07-23: connect.skinbetter.com/MobileAesthetics (QR decode, verified; DECISIONS 2026-07-23) |
```

3b. **§9 storefront bullet** (~lines 534–535). Current text: "**Products → Skinbetter storefront:** `{{SKINBETTER_URL}}` (partner storefront with her businessPartner id). New tab, tracked (`skinbetter_click`)." → new:

```markdown
- **Products → Skinbetter storefront:** connect.skinbetter.com/MobileAesthetics
  (resolved `{{SKINBETTER_URL}}` — the practice storefront carrying her
  businessPartner id, verified in-browser 2026-07-23). New tab, tracked
  (`skinbetter_click`).
```

3c. **§16 checklist item** (~line 660): Read lines 655–665 to get the exact wrapped text containing "hers, not the shared location's; Skinbetter partner link correct". Append to that item, keeping its wrapping style: ` Satisfied 2026-07-23 — Mobile Aesthetics is Amy's own practice (sole owner; DECISIONS 2026-07-23).`

- [ ] **Step 4: Verify docs didn't break the build** (BUILD_SPEC/docs aren't compiled, but run the cheap gate to be safe):

```powershell
cd C:\Amy\wt-skincare
npm run check
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git -C "C:\Amy\wt-skincare" add docs/DECISIONS.md docs/CHANGELOG.md .claude/BUILD_SPEC.md
git -C "C:\Amy\wt-skincare" commit -m @'
docs: record the skincare storefront decision (DECISIONS/CHANGELOG/BUILD_SPEC)

{{SKINBETTER_URL}} marked resolved in the §17 registry; §9 storefront
bullet + §16 checklist item updated per the sole-owner fact.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
'@
```

---

### Task 6: Full verification + rendered-output audit

**Files:** none modified (fixes, if any, loop back to the owning task's file and gate).

**Interfaces:**
- Consumes: everything above.
- Produces: a green `npm run verify` and a clean rendered audit — the PR gate.

- [ ] **Step 1: CI-parity verify**

```powershell
cd C:\Amy\wt-skincare
npm run verify
```

Expected: every stage passes — build, check, lint:claims, lint:voice, a11y. (pa11y already lists `http://localhost:4325/services/skincare`; note the local-server port-trap rule — if a11y fails oddly, confirm no orphaned server is squatting on the port and that served HTML is this build's.)

- [ ] **Step 2: Rendered-output audit (ASCII-substring greps — built HTML uses curly apostrophes)**

```powershell
$page = "C:\Amy\wt-skincare\dist\services\skincare\index.html"
Select-String -Path $page -Pattern 'connect\.skinbetter\.com/MobileAesthetics' | Measure-Object | Select-Object -ExpandProperty Count   # expect >= 1
Select-String -Path $page -Pattern 'skinbetter_click' | Measure-Object | Select-Object -ExpandProperty Count                            # expect >= 1
Select-String -Path $page -Pattern 'k=signup' | Measure-Object | Select-Object -ExpandProperty Count                                    # expect 0
Select-String -Path $page -Pattern '\{\{' | Measure-Object | Select-Object -ExpandProperty Count                                        # expect 0 (no unresolved tokens)
Select-String -Path $page -Pattern 'rel="noopener"' | Measure-Object | Select-Object -ExpandProperty Count                              # expect >= 1 (external CTA attrs)
```

- [ ] **Step 3: Confirm the DraftBanner renders (clinicianApproved is false)**

```powershell
Select-String -Path $page -Pattern 'draft' -SimpleMatch | Measure-Object | Select-Object -ExpandProperty Count
```

Expected: ≥ 1 (the draft banner markup is present). If 0, inspect — the approval gate must be visibly active on this page.

---

### Task 7: Push, PR, CI watch

**Files:** none.

**Interfaces:**
- Consumes: three commits from Tasks 2/4/5 (plus the two spec/plan docs commits already on the branch).
- Produces: an open PR into `phase-c` with green CI — the operator's review/merge gate.

- [ ] **Step 1: Push the branch**

```powershell
git -C "C:\Amy\wt-skincare" push -u origin feat/skincare-page
```

Expected: branch pushed, upstream set.

- [ ] **Step 2: Open the PR**

```powershell
gh pr create --repo gwhitley1969/amyweb --base phase-c --head feat/skincare-page --title "feat: Skincare — Skinbetter Science showcase + live storefront CTA" --body @'
## Summary
- Twelfth line built: /services/skincare as a product showcase — nine claim-free Skinbetter Science cards (what Amy stocks, verified against her studio photos), two pro photos, no pricing.
- {{SKINBETTER_URL}} resolved: canonical practice storefront (decoded from Amy's counter-card QR; both URL variants verified in-browser — bare = shop, ?k=signup = account form, identical practice attribution). Shop CTA + skinbetter_click event live.
- Sole-owner fact recorded (DECISIONS 2026-07-23); stale shared-location comments corrected; BUILD_SPEC §9/§16/§17 updated.
- Ships clinicianApproved: false behind the DraftBanner — Amy's approval gates production, as always.

Spec: docs/superpowers/specs/2026-07-23-skincare-page-design.md

## Verification
- npm run verify green locally (build, check, lint:claims, lint:voice, a11y)
- Rendered audit: CTA href + event present, no ?k=signup, no unresolved tokens, DraftBanner active

🤖 Generated with [Claude Code](https://claude.com/claude-code)
'@
```

Expected: PR URL printed.

- [ ] **Step 3: Watch CI to a first-hand conclusion**

```powershell
gh pr checks --repo gwhitley1969/amyweb --watch
```

Then confirm the run's conclusion directly (house rule — never trust a watcher's exit code):

```powershell
gh run list --repo gwhitley1969/amyweb --branch feat/skincare-page --limit 3
gh run view <run-id> --repo gwhitley1969/amyweb   # conclusion must read "success"
```

If a check fails: read the failing job log first-hand (`gh run view <run-id> --log-failed`), fix in the owning task's file, re-run that task's gates locally, commit, push — repeat until green. If the PR shows CONFLICTING, check `mergeStateStatus` first — a conflicting PR gets ZERO CI runs (looks like dropped webhooks).

- [ ] **Step 4: Report to operator**

Report: PR link, CI conclusion, and the preview URL **only after the preview deploy run has completed** (house rule). Note for the operator's own checklist: merging is the operator's call; `clinicianApproved` stays false until Amy reviews the live preview.

---

## Post-merge cleanup (operator-triggered, after the PR merges)

Junction FIRST, then worktree (the order matters — removing the worktree first guts the shared node_modules through the junction):

```powershell
(Get-Item "C:\Amy\wt-skincare\node_modules").Delete()   # removes the junction only
git -C "C:\Amy\website" worktree remove "C:\Amy\wt-skincare"
git -C "C:\Amy\website" pull --ff-only                  # main tree stays on phase-c
git -C "C:\Amy\website" branch -d feat/skincare-page
```
