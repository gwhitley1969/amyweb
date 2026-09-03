# Clinician sign-off — the last gate before production

> **EXECUTED 2026-08-05 — the site launched.** Amy approved all twelve
> treatment pages and /injector-training on the stable preview; the
> operator ran the flip and authored the sign-off commit (`ad8fbde`,
> PR #93) with their own commands — that commit is the §16 written log
> and supersedes the per-page checkboxes below. PR #5 then merged as
> the launch, which also retired the `…-5…` preview environment these
> links point at (the stable preview now follows the standing PR — see
> docs/RUNBOOK.md, "Where `phase-c` is visible"). This document remains
> as the procedure record and the TEMPLATE for future approvals: any
> post-launch edit to an approved page resets its flag (constraint 4),
> and re-approval follows this same flow against the current stable
> preview.

## Two kinds of approval (split recorded 2026-08-17 — external-audit Finding 3)

The flag gate attests to **copy**: `clinicianApproved` lives in each
treatment file, resets on any MDX edit, and blocks production via
`check:approvals`. That is its correct scope and it is unchanged.

What Amy actually reviews is **rendered pages** — and presentation
can change with ZERO flag resets, **by design**: CSS-level changes
(the Playfair body face, the sitewide arch motif with its 4:5 display
crops and 9/8 bands, spacing, frames) deliberately avoid MDX so a
visual pass doesn't reset twelve flags (the arch rollout's
selector-mirror is the recorded example, DECISIONS 2026-08-17). The
cost of that design is that the flags can all read `true` against an
approval given on visibly different pages. So presentation gets its
own record:

| Approval | Attests to | Mechanism | Granularity |
|---|---|---|---|
| **Copy** | words, prices, claims in each treatment file | `clinicianApproved` flag + `check:approvals` build gate | per file, resets on edit |
| **Presentation** | how the rendered pages look | Amy reviews the stable preview on her phone; the operator logs a dated entry below | per round, dated |

**Relaunch hard gate:** production does not relaunch unless the
newest presentation-approval date below is NEWER than the last merged
visual change (see docs/RELAUNCH.md, precondition 3).

**No visible marker (2026-08-21):** unapproved pages no longer show
the "Draft — pending clinician review" strip on previews — the
operator retired it because Amy read it as part of the finished site
(DECISIONS 2026-08-21). Pending status is therefore invisible in the
rendered page; this document and the flags are the only record. To
list what is pending: `grep -l "clinicianApproved: false"
src/content/treatments/*.mdx`.

### Presentation-approval record

| Date | Reviewed on | Scope | Logged by |
|---|---|---|---|
| 2026-08-05 | stable preview (`…-5`) | launch state — the same pass as the copy sign-off (`ad8fbde`) | operator |
| _pending_ | standing demo (PR #97) | the redesign round: Playfair body, arch motif + display crops, new photography (doors, /services strip, /services photo-card menu), header badge + hybrid nav, carousel (four films), footer/location card lines, the two biostimulators reels in bare in-row film frames (2026-08-21), laser-treatments' priced menu + Epileve section + three photos (2026-08-21), and the /about round (2026-08-25): the Girl Team section, the Evolus Laurel plaque, the ICON film's autoplay, and the team film below the Girl Team button (sounded, autoplay muted in view), and the /injector-training media round (2026-08-25): the dedicated training portrait + Amy's training reel on autoplay, and the iv-therapy photo round (2026-08-25): both photos now her picks, and the regenerative PRP media round (2026-08-25): two photos + her PRP-visit reel on autoplay, and the /about milestones' numerals swapped for the MA chevron plates (2026-08-26, operator direction — design only, no copy changes), and the /about desktop round (2026-08-26, operator direction): the Girl Team film re-rendered widescreen — a 16:9 center crop of the same screened master, frame-pairs checkpoint-approved — filling the unit column, and the Evolus Laurel plaque centered on the band — then, second pass the same day, the whole Evolus unit: heading + paragraph text-centered (the operator's pick), the ICON film centered below, every word unchanged, and the /about brand-ink round (2026-08-26, operator direction): both "Book with Amy" buttons, the "Visit Mobile Aesthetics" button, and the "Girl Team!" placard now black with lettering in the logo's own pink — every word, event, and placement unchanged, and one /about copy change (2026-08-27, operator direction): the first milestone heading now reads "The early years" (was "The bedside years" — part of the 2026-08-04 confirmed wording), and a second /about copy change (2026-08-27, operator direction, facts confirmed by Amy the same day): the 2018 milestone's credential line now carries her full education — "The credentials read FNP, built on a BA, a BSN, and a Master of Nursing." (was "The credential reads FNP, BSN."), and the home scale-and-rhythm round (2026-09-03, operator direction after the design critique; on its PR preview first): the hero photo bleeding toward a larger headline over a NEW one-sentence lead ("One clinician, every appointment. Amy Palacios, FNP, in medical aesthetics since 2017."), the film band composed beside its heading with her own films first, display-size section openers over one-sentence decks (the intro deck is new wording; the credentials kept as a compact line), a new noir band — "Amy comes to you." beside the van interior, /mobile's first door on the home page — and four transform-only moves; three hero-headline candidates await her pick | — |

Visual drift since 2026-08-05, for Amy's pending pass: body face and
size (DM Sans → Playfair 17px/1.65), every photo arched with 4:5/9:8
display crops, homepage door + /services strip photography replaced,
the /services menu rebuilt as her photo-card "buttons" (2026-08-18 —
her mockup; all twelve are her picks), the MA header
badge and hamburger-only nav, the four-film carousel and its heading,
the "Mobile Aesthetics" line in the location card and footer, the
Evolus recognition plate + ICON film relocated from wrinkle-relaxers
to /about (2026-08-18, her direction), the three new wrinkle-relaxers
photos (2026-08-18, her picks), the treatment-page photo mats
retired sitewide — every treatment photo now sits as a bare arch on
the pink canvas (2026-08-18, her direction), the Evolus Laurel
ranking plaque on wrinkle-relaxers (2026-08-19, her direction —
"The Top Evolus Injector in Charlotte." + the Top-50 line, noir
plaque between the deck and the product cards), and the "Your visit,
step by step" numerals replaced by Mobile Aesthetics chevron plates
on every treatment page (2026-08-19, her mockup), and dermal-fillers'
Evolysse film removed with its two photos replaced and a third added
beside "Lips, styled", and its "#1 provider" plate swapped for the
Evolus Laurel ranking plaque in the same spot (2026-08-21, her
direction + picks), and skin-rejuvenation's two PiXel8-RF photos —
Amy beside the cart, the handpiece in hand (2026-08-21, her picks), and the two
biostimulators reels replacing that page's studio portrait — her own
films, playing inside the media rows in a bare frame (hairline + 12px
corners, no white mat), autoplaying muted as she scrolls to them with
no printed caption underneath (2026-08-21, her direction + the
operator's review round), and body-contouring's session photo
replaced by Amy's own Evolve reel, autoplaying muted in the same row
(2026-08-21, her direction), and weight-loss's weigh-in photo replaced
by the same client seen from behind plus a new "They showed up for
themselves" section of three client photo pairs (2026-08-21, her direction;
operator overrides recorded), and laser-treatments rebuilt around its
menu — prices on all four cards from her flyers, the Venus Epileve
laser hair-removal section with direct booking, and three new photos
replacing the console snapshot (2026-08-21, her direction + picks), and
skincare's two photos replaced — the "What it is" frame now keeps
Amy's chin visible, and the second photo is the Skinbetter line-up
above Amy's business cards (2026-08-25, operator direction; the two
capped syringes in frame accepted as-is — DECISIONS same date).
And the /about round (2026-08-25, all her direction via the
operator): the milestones section is now a photo-left grid carrying
the Girl Team still — Amy with four of the location's other
providers, releases on file — with "Girl Team!" on an opaque keystone
plate (the site's first text-over-photo) and a "Visit Mobile
Aesthetics" button beneath (the second sanctioned outbound link to
her practice site; constraint-2 fourth scoped exception); the black
recognition plate above the ICON film gave way to the Evolus Laurel
ranking plaque — the same swap dermal-fillers made, so the
"Charlotte's #1 Evolus provider" sentence now renders nowhere and its
allowlist entry is withdrawn; and the ICON film autoplays muted as
she scrolls to it, tap for sound (a scoped override of the
narrated-manufacturer-film rule — flagged, her call; DECISIONS
2026-08-25 ×3). And later the same day the Girl Team unit gained the
team film itself — the film the home carousel plays, now in a sounded
rendition directly below the "Visit Mobile Aesthetics" button: it
autoplays muted as she scrolls to it, loops on screen, and the music
is one tap away on the controls (no speech or narration — the
operator's confirmation is the record; DECISIONS 2026-08-25).
And the /injector-training media round (2026-08-25, her direction):
the hero portrait is now her dedicated training photo — Amy with
Evolysse cartons before the Jeuveau banner (its own pixel override;
the reused grey-seamless frame stays on weight-loss and
hormone-optimization) — and her training reel plays directly under
"Four courses, taught one-on-one.", before the cards: muted autoplay
as she scrolls to it, looping, tap for sound, in the white mat frame
at reel width (all on-camera releases confirmed on her record;
DECISIONS 2026-08-25).
And the iv-therapy photo round (2026-08-25, her direction via the
operator): the wide studio frame beside "What a visit looks like"
replaced by a client on her laptop mid-infusion with Amy at the IV
pole, and a new photo to the left of "Individualized, with Amy" — Amy
tending a male client's arm for an IV infusion, re-graded brighter at
the operator's direction (both releases confirmed on file; DECISIONS
2026-08-25).
And the regenerative PRP media round (2026-08-25, her direction via
the operator): two new photos in the rows — the blood draw that
starts a PRP visit (her own arm) and the prepared PRP syringes
(packaging labels in frame, her override) — and her own reel directly
above "Your visit, step by step": Amy receiving her PRP hairline
treatment, autoplaying muted as she scrolls to it, near-silent sound
one tap away; another of the location's providers injects on camera,
face mostly out of frame, never named (her override, consent on
file; DECISIONS 2026-08-25).
And the /about milestones timeline (2026-08-26, operator direction):
the 01–04 numerals beside "Two decades in the making." replaced by
the Mobile Aesthetics chevron plates — the same badge the treatment
pages' "Your visit, step by step" list has worn since 2026-08-19;
every heading and sentence in the section is unchanged (DECISIONS
2026-08-26).
And the /about desktop round (2026-08-26, operator direction): the
Girl Team film — natively a vertical edit — re-rendered as a true
widescreen 16:9 center crop of the same 2026-08-17-screened master
(every head stays in frame in every beat; the neon and the burned-in
"GiRL TEAM" overlay survive; the full-height beats lose lower legs;
frame-pairs approved at the operator checkpoint pre-upload), now
filling the Girl Team unit's column at the same width as the still,
with a new poster from the new rendition; and the Evolus Laurel
plaque centered on the page band on desktops — then, second pass the
same day on seeing it rendered, the WHOLE Evolus unit: "Inside
Evolus" and its paragraph text-centered (the operator's pick; the
"Ready when you are" band is the page's own precedent) with the ICON
film centered below, every word unchanged (DECISIONS 2026-08-26 ×3).
And the /about brand-ink round (2026-08-26, operator direction):
both "Book with Amy" buttons, the "Visit Mobile Aesthetics" button,
and her "Girl Team!" placard now wear the logo's own ink — black
with lettering in the wordmark's exact pink, the header Book
button's shipped look; hover inverts to a pink fill. Every word,
event, and the placard's keystone seat unchanged (DECISIONS
2026-08-26).
And one /about copy change (2026-08-27, operator direction): the
first milestone heading now reads "The early years" — it was "The
bedside years", part of the wording she confirmed on the PR #83
preview 2026-08-04; nothing else on the page reworded (DECISIONS
2026-08-27).
And a second /about copy change, later the same day (operator
direction; facts Amy confirmed to the operator 2026-08-27): the
2018 milestone's credential line now carries her full education —
"The credentials read FNP, built on a BA, a BSN, and a Master of
Nursing." — it was "The credential reads FNP, BSN.", also part of
the 2026-08-04 confirmed wording. "Master of Nursing" is spelled
out pending her exact post-nominal letters (DECISIONS 2026-08-27).
~~Known defect queued for the same pass: `studio-wide.jpg` alt
text ("two clients") vs its one-client 4:5 window~~ — RESOLVED
2026-08-25: the asset was replaced and deleted in the iv-therapy
photo round, so the mismatched alt no longer exists (DECISIONS
2026-08-25; originally recorded 2026-08-17).

**Copy change on every treatment page, 2026-08-24 — read this even for
pages already approved.** The second step of "Your visit, step by step"
now closes **"Together with Amy, you decide what comes next."** It
replaces "Together you decide what, if anything, comes next." The
sentence lives in a shared component, so the same words changed on all
twelve treatment pages — including the four already flipped
(hormone-optimization, iv-therapy, regenerative, skincare). Those flags
were deliberately left `true` at the operator's direction, and
`check:approvals` cannot see a component edit, so nothing blocks
production and nothing prompts a re-review: **this note is the only
thing that puts the new words in front of Amy.** What changed in
substance is that the step no longer says the answer might be no
treatment — the wording is the client's own, flagged once and shipped
as directed (DECISIONS 2026-08-24). Steps 1 and 4 are untouched.

**Same day, four more changes across every treatment page.** Step 3 of
the same list now opens "**Confidently** book your appointment when you
are ready." And below the FAQ, the consult router card was reworded and
its pricing line removed: the heading is now "The right fit is just a
conversation away.", the subline "Every plan is personalized, decided
between you and Amy.", and the sentence "Pricing is individual and
discussed during your consultation." is gone from all twelve pages —
ten of which list product prices. **What did NOT change, and is the
thing to confirm on the preview:** the medical disclaimer directly
beneath that card still says whether a treatment fits your needs is
decided with Amy during a consultation. It is layout-injected on every
page and was verified present on all twelve. Two further edits are
wrinkle-relaxers only: "Do men get neurotoxin treatments?" now answers
"are not gender based" (the body copy above it deliberately keeps its
own wording), and "Do I need a consultation before booking?" now
answers "No. A consultation is never required; however, one is free
upon request." All client wording, all shipped as directed
(DECISIONS 2026-08-24).

**Copy change on every treatment page, 2026-08-26.** Step 4 of the same
list — "Aftercare guidance" — now closes "…and a direct way to reach
out **to Amy** if questions come up." (it said "reach out" with no
name). Two words inserted, her wording; the sentence lives in the
shared component, so it changed on all twelve treatment pages —
including hormone-optimization, the one page still flipped `true`. That
flag stays at the operator's standing direction, and `check:approvals`
cannot see a component edit, so **this note is what puts the new words
in front of Amy.** This supersedes the 2026-08-24 note's "steps 1 and 4
are untouched" for step 4; step 1 remains untouched (DECISIONS
2026-08-26).

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
| ☐ | [/services/wrinkle-relaxers](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/wrinkle-relaxers) | Jeuveau / Xeomin / Daxxify cards with per-unit prices ($10, $10, $12); **NEW: all three photos are her 2026-08-18 picks** (blazer brow appointment under the neon; the hand-mirror male-client frame; the Jeuveau-banner studio scene as a wide segmental arch — the full frame, everyone visible, per her feedback; banner legibility shipped under her override). **NEW 2026-08-19: the Evolus Laurel ranking plaque** between the deck and the product cards — "The Top Evolus Injector in Charlotte." + "And among the Top 50 in the United States." (her direction; operator-verified with Evolus; wording pinned, DECISIONS 2026-08-19). **Also 2026-08-19: the page title is now "Neurotoxins - Wrinkle Relaxers"** (her wording, matching the /services menu line; H1 + breadcrumbs + JSON-LD; seo.title keeps the search phrasing), **and the page now says "neurotoxin" throughout** — card leads, both FAQ strings, body intro (her wording, 2026-08-19; zero "neuromodulator" remains on this page). **NEW 2026-08-23: the two blocks that open the page.** The lead under the H1 now ends "…the ones that come from repeated expression" (it said "creases"). **The deck card below it was changed twice — review only what is on the preview now (2026-08-24):** "A light, deliberate hand for those lines repeated expressions leave behind. Wave good-bye to your crow's feet, "11's" between your eyes and forehead frown lines!" That is her own wording, restored verbatim after a compliant rewrite shipped on 2026-08-23 and was reversed the next day at her direction. Two things to look at together: the closing half promises the reader a result, and the Jeuveau banner in the photo further down the page says "KISS YOUR 11s GOODBYE" — the deck now echoes it (DECISIONS 2026-08-23 and 2026-08-24). **Also 2026-08-23, round 2 — three body strings.** "Not just for women" now reads "Expression lines aren't gender defined…" (and the FAQ answer matches — the word "gendered" is gone from the page) and its second sentence ends "lines they'd rather not see" (was "rather soften" — flagged as leaning toward absence, shipped as her wording). "Individualized, with Amy" is her new paragraph, closing "Your trust is well placed when you walk through the doors!"; it keeps "under clinician supervision" at the operator's direction after her draft omitted it. (The Evolus ICON film moved to /about at her direction, 2026-08-18 — review it there, in the structural-page pass. The "Charlotte's #1 Evolus provider" sentence that moved with it was retired 2026-08-25 when the /about plate gave way to the Evolus Laurel plaque; the sentence now renders nowhere on the site.) |
| ☐ | [/services/dermal-fillers](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/dermal-fillers) | Evolysse / Revanesse cards — **NEW 2026-08-26: every card now reads "$650 (full-syringe) or $325 (half-syringe)"**; the lip style guide; the Evolus Laurel ranking plaque (replacing the #1-provider plate in the same spot, 2026-08-21); three photos — the hand-mirror client frame, the Revanesse Lips+ mirror frame, and the lip-injection detail beside "Lips, styled" (her picks 14/15 + 8K0A9591, 2026-08-21). The Evolysse film no longer renders. **NEW 2026-08-26 — her copy round, two batches on one preview.** The lead drops "gel" and lists the areas her way: "Injectable fillers for volume and contour. Common areas include the lips, under-eye area, cheeks, jawline and chin." (the body's matching sentence syncs; the /services menu card drops "gel" too). The deck now opens "Facial Balancing — volume and contour in proportion — never more than the face asks for." "Placed in proportion" sets its aside in em dashes ("Amy maps each face — where volume sits, where it has thinned, how the features balance — and places only what the plan calls for."). "Individualized, with Amy" is retitled **"Personalized, with Amy"** over her new paragraph — "Every plan is individually mapped out. Amy Palacios, FNP, plans and performs each treatment herself at her Harrisburg studio in the greater Charlotte area." — which **drops "under clinician supervision" at her direction** (the opposite of her wrinkle-relaxers call, where the clause was kept; both on the record, DECISIONS 2026-08-26). "Lips, styled" now closes "begins with a conversation.", and "After weight loss" ends its second sentence at "more visible." (Amy approved this page on 2026-07-21 and again at launch 2026-08-05; the 2026-08-21 film removal + photo round reset the flag — this is her re-confirmation, now covering the 2026-08-26 copy round too.) |
| ☐ | [/services/biostimulators](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/biostimulators) | Radiesse $900/syringe; PDO threads $350 for 10. **NEW 2026-08-21: her two reels replace the studio portrait** — the Radiesse-visit film beside "A longer view of structure" (shipped as-is under her/the operator's overrides: the before/after cut, the unit-labeled carton, another provider on frame for ~2s; client release + consent on file) and her Instagram reel beside "Individualized, with Amy" (480p, shipped as final). Both autoplay MUTED as she scrolls to them and loop while on screen — tap the speaker for sound, tap to pause (2026-08-21 review round: no printed caption under either film); captions are `[Music]` cues. The page now has no photographs. **Re-approval required — the MDX edit reset the flag** (DECISIONS 2026-08-21). |
| ☐ | [/services/regenerative](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/regenerative) | PRP $600; PRP with microneedling $900. **NEW (2026-08-25): the PRP media round** — the blood-draw photo left of "Who they're generally for" (her own arm), the prepared-syringes photo right of "Individualized, with Amy" (packaging labels in frame ship as-is at the operator's override), and her own reel directly above "Your visit, step by step": Amy receiving her PRP hairline treatment, autoplaying muted as she scrolls to it, looping, near-silent sound one tap away. One of the location's other providers injects on camera, face mostly out of frame, never named (her override; consent on file — DECISIONS 2026-08-25). The existing band photo stays. **Re-approval required (flag reset)** |
| ☐ | [/services/skin-rejuvenation](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/skin-rejuvenation) | PiXel8-RF $1,500; peels "Starting at $180"; **NEW (2026-08-21): two PiXel8-RF photos — Amy beside the cart (console readout legible; operator override) and the handpiece in hand** |
| ☐ | [/services/body-contouring](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/body-contouring) | Evolve $1,500 course of six / $275 single session; **NEW (2026-08-21): Amy's own Evolve reel in the session row — autoplays muted on approach, sound on the controls; the Reel-screenshot photo retired** |
| ☐ | [/services/laser-treatments](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/laser-treatments) | "Venus Versa Pro" naming throughout (approved 2026-08-04). **NEW (2026-08-21): prices on all four cards from her two flyers — she confirms every figure and every item name (flyer-verbatim); the Venus Epileve laser hair-removal section (the three-column price sheet — single, full series of six, full series at ~15% off — areas, packages, direct booking); the rewritten "Is this actually a laser?" answer; three photos — beside the Versa Pro console, seated with two applicators, and at the window with the Epileve (its console readout legible; operator override). The 2026-08-04 console snapshot is retired. Re-approval required (flag reset)** |
| ☐ | [/services/weight-loss-glp-1](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/weight-loss-glp-1) | The mg-keyed vial price tiers; the single Retatrutide investigational line; **NEW (2026-08-21): the InBody weigh-in frame from behind (wall sign legible; operator override) and the "They showed up for themselves" section — three client photo pairs under operator override, releases + HIPAA authorizations on file** |
| ☐ | [/services/peptide-therapy](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/peptide-therapy) | Nine product cards with prices (her wording, near-verbatim); portrait photo |
| ☐ | [/services/iv-therapy](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/iv-therapy) | Menu cards ($125 / $125 / $200 / $25 shots). **NEW (2026-08-25): BOTH photos are her picks** — "What a visit looks like" now shows a client on her laptop mid-infusion while Amy prepares supplies at the IV pole (replaces the wide studio frame), and "Individualized, with Amy" gains its first photo, to the left of the copy: Amy tending a male client's arm for an IV infusion (re-graded brighter at the operator's direction). Both pictured clients' releases confirmed on file; Amy is the clinician in both frames (DECISIONS 2026-08-25). **Re-approval required (flag reset)** |
| ☐ | [/services/hormone-optimization](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/hormone-optimization) | Pellets $450 women / $750 men; lab draw $125; the Biote FDA disclaimer; **NEW: her grey-seamless portrait** (also on weight-loss) |
| ☐ | [/services/skincare](https://polite-flower-0a41b770f-5.eastus2.7.azurestaticapps.net/services/skincare) | Skinbetter storefront routing (shop button, Mobile Aesthetics naming); two product photos. **NEW (2026-08-25): BOTH photos** — the first ("What it is") is now the held-out line-up with Amy's chin visible (the outgoing frame cut her head at the neck; a 4:5 crop keeping sunbetter whole and AlphaRet at the edge), and the second ("Individualized, with Amy") is the Skinbetter line-up above a spread of Amy's business cards (a 4:5 crop, so the outer two products are out of frame; the two capped syringes among the cards ship as-is at the operator's word). **Also NEW (2026-08-25): the storefront plate carries a QR code** — scan-to-register-and-shop, the counter-card handoff regenerated crisp (operator-supplied URL, decode-verified + operator scan-tested). **Re-approval required (flag reset)** |

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
- "In medical aesthetics since 2017" (the site's standard phrasing of
  her flyer's experience line; her reel's on-screen wording differs —
  pixels self-identify).
- Since 2026-08-25: the dedicated training portrait (replacing the
  reused grey-seamless frame) and her training reel under the courses
  heading — autoplaying muted, looping, tap for sound — both shipped
  at her direction with the releases and overrides on the operator's
  record (DECISIONS 2026-08-25).

**Round reviewed 2026-08-25** (relayed by the operator, same day the
round merged): Amy reviewed the shipped portrait + reel on the
standing demo and approved them as-is. This is the per-round okay
only — the full presentation pass in the table above stays
_pending_, and she re-sees this page inside that pass like every
other.

Anything she wants changed ships as its own PR before launch.

## Also for Amy's review (not flag-gated): /mobile

New page (2026-09-02), on its PR preview first and on the standing demo
once merged: parties and the van. It is not treatment content, so no
flag blocks the pipeline — but it is a first draft built from her
public posts to get her reaction, and she should verify:

- Every stated fact: she brings the practice to homes, offices, and
  gatherings around Charlotte; the van is fitted out as a treatment
  room with a chair and supplies; for a smaller space she sets up
  inside; parties are planned by phone or text.
- The word "party" on the site (operator decision) — and that the
  brand name her captions use never appears, since she does not carry
  it.
- The van interior photo (from her own site, cropped to the chairs,
  cart, and screen) — and whether she has the original.
- The van film (her own TikTok clip of Jun 17 — Amy treating a seated
  guest in the van — muted, looping small beside "Bring the people
  you'd bring anyway."): the guest pictured needs their website-use
  release confirmed on her word, or the film comes off the page.
  Nobody is named. If she wants the clip's sound on the site, the
  operator listens first and confirms no speech (and no competitor
  name) on the record.
- What the page does NOT say, and needs her answers on: which services
  travel, how far she travels, whether there is a minimum group size,
  whether solo mobile appointments exist, and what she calls the van.
- The photos and clips the page is missing, all hers to supply as
  originals: the Jun 17 van clip at full resolution (the page carries
  the 576px platform copy, so it plays small until her original
  arrives), the van exterior, her posts of Aug 11 (outside the van),
  Jul 20 and May 16 (home visits), May 25 (an office party), and Apr
  22–23 (the Albemarle venue), plus releases for the colleague in the
  van portrait and for any client she wants shown.

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
   of the legal pages; ~~laser pricing if Amy supplies it~~ (landed
   2026-08-21 from her flyers); higher-res
   photo upgrades; Plausible analytics as a deliberate opt-in.
