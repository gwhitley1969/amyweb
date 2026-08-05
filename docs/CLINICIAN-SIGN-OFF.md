# Clinician sign-off — the last gate before production

**Who:** Amy Palacios, FNP, reviews; the operator logs and flips.
**Where:** the stable preview — always the current `phase-c` build:
<https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net>
**Why:** CLAUDE.md hard constraint 4 — treatment content ships with
`clinicianApproved: false` until Amy signs off, and the production
pipeline **fails** if unapproved treatment content would publish. The
flips below are the launch key.

Scope: the twelve treatment pages. (Structural pages — home, /about,
/visit, /services, legal — carry their own recorded approvals and are
not flag-gated.) One more page — /injector-training, new 2026-08-04 —
is also not flag-gated and has its own review section below the table.

## How this works

1. Amy reviews each page below on the stable preview — words, prices,
   photos, films. The right-hand column lists what is newest or most
   consequential on each page.
2. For every page she approves, the operator checks the box AND flips
   that page's flag (instructions at the bottom — the flip must be the
   operator's own act, never the assistant's).
3. Anything she wants changed: note it, leave that flag `false`, and
   the change ships as its own content PR before her re-review.
4. The commit that flips the flags IS the written sign-off log
   (§16: "Amy's written sign-off logged by the operator") — use the
   commit-message template below.

## The twelve pages

| ✓ | Page (stable-preview link) | What to look at hardest |
|---|---|---|
| ☐ | [/services/wrinkle-relaxers](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/wrinkle-relaxers) | Jeuveau / Xeomin / Daxxify cards with per-unit prices ($10, $10, $12); the Evolus ICON film; the "Charlotte's #1 Evolus provider" sentence; three treatment photos |
| ☐ | [/services/dermal-fillers](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/dermal-fillers) | Evolysse / Revanesse cards ($650 or $325 half-syringe); the Evolysse film; the lip style guide; the #1-provider sentence. (Amy approved this page once on 2026-07-21; the caption sweep reset the flag — this is her re-confirmation.) |
| ☐ | [/services/biostimulators](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/biostimulators) | Radiesse $900/syringe; PDO threads $350 for 10; studio portrait |
| ☐ | [/services/regenerative](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/regenerative) | PRP $600; PRP with microneedling $900; PRP photo |
| ☐ | [/services/skin-rejuvenation](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/skin-rejuvenation) | PiXel8-RF $1,500; peels "Starting at $180"; **NEW: the docked PiXel8-RF handpiece photo** |
| ☐ | [/services/body-contouring](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/body-contouring) | Evolve $1,500 course of six / $275 single session; **NEW: the Evolve session photo from her Reel (caption cropped)** |
| ☐ | [/services/laser-treatments](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/laser-treatments) | **NEW: "Venus Versa Pro" naming throughout** (based on her console photo) + the console photo; pricing is deliberately consult-only (no dollar figures) — confirm that stays, or supply prices |
| ☐ | [/services/weight-loss-glp-1](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/weight-loss-glp-1) | The mg-keyed vial price tiers; the single Retatrutide investigational line; two photos |
| ☐ | [/services/peptide-therapy](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/peptide-therapy) | Nine product cards with prices (her wording, near-verbatim); portrait photo |
| ☐ | [/services/iv-therapy](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/iv-therapy) | Menu cards ($125 / $125 / $200 / $25 shots); studio photo |
| ☐ | [/services/hormone-optimization](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/hormone-optimization) | Pellets $450 women / $750 men; lab draw $125; the Biote FDA disclaimer; **NEW: her grey-seamless portrait** (also on weight-loss) |
| ☐ | [/services/skincare](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/skincare) | Skinbetter storefront routing (shop button, Mobile Aesthetics naming); two product photos |

## Also for Amy's review (not flag-gated): /injector-training

New page (2026-08-04):
[/injector-training](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/injector-training)
— Private Injector Training, for licensed medical professionals. It is
not treatment content, so no flag blocks the pipeline — but Amy should
verify before launch:

- The four course prices: Neurotoxin $5,000 · Dermal Filler $5,000 ·
  PDO Thread Lift $5,000 · Radiesse $7,500 — each three hours, product
  included.
- Course names and topic lists (carried from her flyer verbatim).
- The certificate sentence (completion documentation; licensure and
  scope stay the trainee's own).
- The reused grey-seamless portrait, and "in medical aesthetics since
  2017" (the site's standard phrasing of her flyer's experience line).

Anything she wants changed ships as its own PR before launch.

## Operator: flipping the flags (your own hands only)

After Amy approves, on a fresh branch off `phase-c`, run — for **each
approved page** (or the loop for all twelve):

```powershell
# one page:
(Get-Content src/content/treatments/wrinkle-relaxers.mdx) -replace 'clinicianApproved: false', 'clinicianApproved: true' | Set-Content src/content/treatments/wrinkle-relaxers.mdx

# all twelve at once (only if she approved all twelve):
Get-ChildItem src/content/treatments/*.mdx | ForEach-Object { (Get-Content $_) -replace 'clinicianApproved: false', 'clinicianApproved: true' | Set-Content $_ }
```

Commit-message template (this commit is the sign-off log):

```
content: clinician approval — Amy signed off <N> treatment pages on the stable preview

Amy Palacios, FNP, reviewed the pages listed in docs/CLINICIAN-SIGN-OFF.md
on the stable preview on <DATE> and approved: <list or "all twelve">.
Flags flipped by the operator per CLAUDE.md hard constraint 4.
```

Then PR into `phase-c` as usual. The assistant can verify, watch CI,
and handle everything after the flip — the flip itself is yours.

## After the flips (assistant's checklist, for the record)

1. Merge the approval PR; stable preview redeploys.
2. Merge PR #5 (`phase-c` → `main`) — the launch merge.
3. The production pipeline runs: verify → **check:approvals (now
   green)** → production build (Front Door lockdown) → SWA deploy →
   Front Door cache purge.
4. §16 mechanics, verified live: needlegirlie.com serves the site; SWA
   default hostname 403s; www → apex; HTTP → HTTPS; production
   indexable (previews stay noindexed); OG cards; 404 at the edge;
   Vagaro + Skinbetter link-outs reachable; Lighthouse spot-run.
5. Post-launch standing items (recorded, not blocking): counsel review
   of the legal pages; laser pricing if Amy supplies it; higher-res
   photo upgrades; Plausible analytics as a deliberate opt-in.
