# CLAUDE.md — needlegirlie.com

This file governs all work in this repository. Read it fully before acting.
`BUILD_SPEC.md` is the full specification — read it before starting any task.

## What this project is

The dedicated marketing website for **Needle Girlie** — the personal brand of
Amy Palacios, FNP, a medical-aesthetics nurse practitioner in Harrisburg, NC
(Charlotte market). Built and maintained by Xtend-AI, LLC for a **paying
client** under a signed engagement. This is a **static Astro site** deployed
to **Azure Static Web Apps (Standard)** behind **Azure Front Door (Standard)**
in the client's Azure subscription (needlegirlie.onmicrosoft.com tenant).
Goals: premium + glamorous brand presence, conversion to consultations and
bookings (Vagaro handoff), local SEO, WCAG 2.2 AA, fast.

## How to operate

Work as a principal-level solution architect and product lead, not a code
generator:

- **Lead with the recommendation**, then the reasoning and trade-offs. Concise
  by default; expand on request.
- **Requirements before solutions.** If a task is ambiguous, pin down the
  requirement first. Never invent requirements, business facts, prices,
  credentials, or clinical statements — use the `{{TOKEN}}` placeholder
  registry (BUILD_SPEC §17) for anything unknown.
- **Traceability.** Every significant technical decision gets a short entry in
  `docs/DECISIONS.md`: context → decision → alternatives rejected →
  consequences. Keep entries to a few lines; the discipline matters more than
  the length.
- **Candid, no flattery.** If an instruction is weak, expensive, risky, or
  non-compliant, say so plainly and propose the better or compliant path.
  Flag once; if the operator overrides after seeing the flag, execute cleanly
  without re-arguing.
- **Cost-conscious.** The client owns the Azure subscription and Microsoft
  bills her directly. Website run-rate target ≈ $45–55/month (Front Door
  Standard + SWA Standard). Flag anything that would raise it before building
  it. Design an off-ramp for anything with recurring cost.
- **One sharp question beats five vague ones.** Batch questions; don't ask
  about anything the placeholder registry already tracks.
- **Small, demonstrable increments.** Plan → approval → build → verify.

## Precedence

This file and BUILD_SPEC.md govern this repository. If any other instructions
— older engagement briefs, pasted documents, or in-session shortcuts —
conflict with them, these documents win: flag the conflict rather than
silently following it. Known superseded points from earlier briefs:

- The domain is **already registered** (needlegirlie.com; DNS in Azure).
- There is **no APIM** anywhere in this project — the website has no API at all.
- Analytics is **cookieless** — no GA4, no ad/retargeting pixels.
- The neuromodulator product list is **resolved** (2026-07-19, from the
  live Vagaro menu, operator-confirmed): **Jeuveau, Xeomin, Daxxify** —
  the older Jeuveau/Daxxify-only brief is superseded.

## Hard constraints — never violate, never work around

1. **No server code.** v1 is a fully static site. No SWA Functions, no API
   routes, no SSR, no databases. If a task seems to need a backend, stop and
   flag it. (The mobile app + AI assistant is a separate later phase; nothing
   from it belongs in this repo.)

2. **Amy's services only.** Never mention, link to, or imply any other
   provider at the Mobile Aesthetics location. The site may factually note
   that Amy practices within a multi-provider location — nothing more.
   *Scoped exception (operator override after the compliance flag —
   DECISIONS 2026-08-15): the header badge links out to Amy's own
   practice site, `siteConfig.mobileAestheticsUrl`
   (yourmobileaesthetics.com), whose pages name the location's other
   providers. The first of two sanctioned outbound references to that
   site (the second is the fourth exception below, 2026-08-25).*
   *Second scoped exception (operator override after the
   compliance flag — DECISIONS 2026-08-17; placement widened
   2026-08-25): the Mobile Aesthetics team film, which shows the
   location's other five providers on camera — the muted
   home-carousel rendition (`commercial-team`) and, since 2026-08-25
   at the client's direction, the sounded rendition inside the
   /about Girl Team unit (autoplay muted in view, music one tap
   away) — since 2026-08-26 the widescreen `girl-team-film-wide`, a
   16:9 center crop of the same screened master, replacing the
   portrait `girl-team-film` (operator direction; DECISIONS same
   date); their releases for needlegirlie.com use are confirmed on
   file, none of them is legibly named in the film, and a third
   placement requires the human operator.*
   *Third scoped exception (operator override after the compliance
   flag — DECISIONS 2026-08-21): the Radiesse-visit film
   (`radiesse-visit`) on /services/biostimulators, Amy's own reel, in
   which one of the location's other providers is on camera for about
   two seconds (face out of frame, never named); their consent for
   needlegirlie.com use is confirmed on file. The film's labels and
   captions never attribute the hands-on treatment to anyone.*
   *Fourth scoped exception (operator override after the compliance
   flag — DECISIONS 2026-08-25, direct from Amy): the /about Girl
   Team unit, all three parts fixed together — the still photo
   `girl-team-studio.jpg` (Amy with four of the location's five
   other providers; all four releases for needlegirlie.com use
   confirmed on file), the rendered text "Girl Team!" on its
   keystone plate (team language against the voice rule's written
   rationale, though it trips no linter token — a green lint:voice
   never authorizes it), and the "Visit Mobile Aesthetics" button
   below it, the second sanctioned outbound link to
   yourmobileaesthetics.com. The unit's own alt text names the team
   factually; nobody is ever individually named in copy, alt text,
   or comments, and the team vocabulary is never restated outside
   the unit — meta descriptions, OG tags, and JSON-LD included.*
   *Fifth scoped exception (operator override after the compliance
   flag — DECISIONS 2026-08-25): the /injector-training reel
   (`training-reel`), Amy's own film, whose closing contact card
   displays yourmobileaesthetics.com on screen — a DISPLAY-ONLY
   pixel reference, not a link; the sanctioned outbound links remain
   exactly the two above, and the site's text never prints the URL.
   (The film's on-camera people are all released and none is another
   provider — its content override lives under constraint 3.)*
   *Sixth scoped exception (operator override after the compliance
   flag — DECISIONS 2026-08-25): the PRP-visit reel (`prp-visit`) on
   /services/regenerative, Amy's own film of her receiving her own
   PRP hairline treatment, in which one of the location's other
   providers is on camera doing the injection (face mostly out of
   frame, never named); their consent for needlegirlie.com use is
   confirmed on file. The film's label and captions never attribute
   the hands-on treatment to anyone.*
   *Outside these six exceptions the other providers are still never
   named or implied in any needlegirlie.com text, and adding any
   further link, film, or mention requires the human operator.*

3. **Medical-marketing claim discipline.** A licensed clinician is advertising
   medical treatments. The full rulebook is BUILD_SPEC §8. Core rules:
   - **Never** include dosing, doses, units, mg/mcg amounts, reconstitution,
     injection frequency, protocols, or titration — anywhere, in any file.
     *Scoped exceptions (operator overrides after the compliance flags —
     DECISIONS 2026-07-20 and 2026-07-21):* the exact price strings
     enumerated in `compliance/banned-patterns.json` `allowedStrings` —
     the mg-keyed GLP-1 vial tiers and the per-unit neuromodulator
     prices — may appear as product pricing. *Fifth scoped exception
     (operator override after the compliance flag — DECISIONS
     2026-08-04): the four Private Injector Training curriculum topics
     enumerated in `allowedStrings` in exact `<li>`-wrapped source form
     — "Dosing and dilution", "Safety protocols", "Advanced injection
     protocols", "Training manual & protocols" — on /injector-training
     only. They are course-topic titles, not quantities; the operator
     chose flyer-verbatim wording over the recommended paraphrase.
     Editing rules: each lives on ONE attribute-less `<li>` source line
     matching the registry exactly (stripping is per-line AND
     case-sensitive), and this vocabulary is never restated elsewhere,
     comments included.* *Fourth pixel-level override, and the first
     under this bullet (operator override after the compliance flag —
     DECISIONS 2026-08-21): the /services/skin-rejuvenation row photo
     `amy-pixel8-cart.jpg`, in which the PiXel8-RF console's settings
     readout — power/time/delay values and a suggested needle-depth
     range — is legible in the served source file (astro:assets serves
     the source-resolution derivative as the `src`). The 2026-08-04
     rejection of a frame for this readout class is superseded for this
     frame only; the recommended defocus bake was declined. Pixel
     content is invisible to lint:claims, which is why the exception is
     recorded here. The frame, its page scope, and the rule that no
     value from the readout is ever restated in text — copy, alt,
     comments, meta, JSON-LD — are fixed; changing any of them requires
     the human operator.* *Fifth pixel-level override, the second under
     this bullet (operator override after the compliance flag — DECISIONS
     2026-08-21): the /services/laser-treatments row photo
     `amy-epileve-window.jpg`, in which the Venus Epileve console's
     settings readout — fluence, pulse-duration, and speed values with
     their units — is legible in the served source file. The recommended
     crop bake (which would also have removed the console) was declined.
     Same fixed terms: this frame, this page; no value from the readout
     is ever restated in text — copy, alt, comments, meta, JSON-LD;
     changing any of it requires the human operator.* *Sixth
     pixel-level override, the third under this bullet (operator
     override after the compliance flag — DECISIONS 2026-08-25): the
     /injector-training reel (`training-reel`), Amy's own film,
     carried as-is: its burned-in course cards restate that page's
     operator-authorized card copy in pixels — including the
     curriculum vocabulary of the fifth scoped exception above and
     dilution-class topic wording — and its jar shot shows Jeuveau
     vials with the per-vial "100 U" quantity legible (the
     radiesse-visit carton class). Releases for every on-camera
     person confirmed on file (operator, same date). Fixed terms:
     this film, this page; the film's label, captions, and comments
     describe only what the pixels self-identify and never restate
     the vocabulary or the quantity; changing any of it requires the
     human operator. (Its on-screen practice-site URL is the
     constraint-2 fifth exception.)* *Seventh pixel-level override,
     the fourth under this bullet (operator override after the
     compliance flag — DECISIONS 2026-08-25): the
     /services/regenerative row photo `prp-syringes.jpg`, in which two
     diluent vials' labels — the product name with its concentration,
     a 30 mL multiple-dose line, an NDC number, and diluent-use fine
     print — are legible in the served source file beside the prepared
     PRP syringes (the prep-workflow imagery class the 2026-07-23
     photo rubric excluded). The recommended crop-out bake and the
     defocus bake were both declined. Fixed terms: this frame, this
     page; no text from the packaging is ever restated in site text —
     copy, alt, comments, meta, OG, JSON-LD; changing any of it
     requires the human operator.* Nothing else;
     changing that list requires the human operator.
   - **Never** make disease claims (treat/cure/prevent/diagnose), efficacy or
     outcome promises, before/after implications, or unsubstantiated
     superiority claims ("#1", "best"). *Scoped exceptions (operator
     overrides after the compliance flags — DECISIONS 2026-07-21): the
     Evolus-produced Evolysse film on /services/dermal-fillers — RETIRED
     2026-08-21: the film was removed from the site at the client's
     direction and renders nowhere (DECISIONS same date; re-adding it
     requires the human operator); the Evolus ICON
     event film on /about (moved from /services/wrinkle-relaxers at the
     client's direction 2026-08-18, exception terms unchanged; carried
     as-is — manufacturer comparative-efficacy remarks, named
     third-party providers, and no safety information, all
     operator-accepted); and the exact sentence "Charlotte's #1 Evolus
     provider" — RETIRED 2026-08-25: the /about recognition plate, by
     then its only consumer, was swapped for the Laurel plaque at the
     client's direction (the same swap dermal-fillers made 2026-08-21,
     after the sentence moved off wrinkle-relaxers 2026-08-18), so the
     `allowedStrings` entry was withdrawn with the operator's
     authorization and the ranking vocabulary is banned everywhere
     again; re-adding the sentence requires the human operator;
     and three of the home-carousel films (operator clearances,
     DECISIONS 2026-08-14) — the two Evolus co-op Jeuveau commercials
     carried as-is with their complete FDA safety information (never
     trimmed or cropped), and Amy's own studio reel under operator
     override with both client releases confirmed on file. (The fourth
     carousel film — the 2026-08-17 team film — contains no claims and
     needs no exception here; its override lives under constraint 2.)
     And five photos (operator overrides after the compliance flags —
     DECISIONS 2026-08-18, 2026-08-21, and 2026-08-25): the /services hormone-optimization menu
     card's photo (`biote-banner-scale.jpg`), in which the Biote
     banner's outcome-promise lines and symptom poster are legible,
     on a page carrying no Biote disclaimer; the /services
     weight-loss menu card's photo (`inbody-weigh-in.jpg`), whose
     aftercare wall sign titles a competitor neuromodulator brand the
     site's own copy never names; and the /services/wrinkle-relaxers
     band photo (`jeuveau-banner-studio.jpg`), in which a Jeuveau
     banner's marketing headline and indication line are legible —
     including vocabulary the site's own copy dropped 2026-07-30; and
     the /services/weight-loss-glp-1 row photo (`inbody-weigh-in-rear.jpg`,
     DECISIONS 2026-08-21) — the same aftercare wall sign, its
     competitor-brand title AND its results-timing line legible in the
     served file; and the /injector-training hero portrait
     (`amy-evolysse-cart.jpg`, DECISIONS 2026-08-25) — a second
     Jeuveau banner frame, its marketing headline, indication line,
     and part of its safety-information fine print legible in the
     served file (the jeuveau-banner-studio override is fixed to its
     own frame and page, so this frame carries its own; no banner
     content is ever restated in site text) —
     pixel content is invisible to lint:claims, which is why these
     exceptions are recorded here.
     And the client photo-pairs section — "They showed up for
     themselves" — on /services/weight-loss-glp-1
     (operator override after the compliance flag — DECISIONS
     2026-08-21; BUILD_SPEC §1 lists before/after galleries as not in
     v1 and §8.9 defers them by SOW — both carved out by this one
     exception): three client-supplied side-by-side photo pairs, the
     site's first before/after content. The allowlist entry briefly
     authorized for its original heading was withdrawn the same day —
     the phrase is banned everywhere, alts and comments included; the
     intro carries the clients' consent and every-plan-is-individual
     in copy and routes to a consultation; and the
     website-use releases + HIPAA marketing authorizations of all five
     pictured people confirmed on file (operator, 2026-08-21). Scope is
     exactly that section on that page; adding pairs, captions,
     numbers, dates, names, or another page requires the human
     operator.
     And the exact fragment "Amy has your best self in mind"
     enumerated in `allowedStrings` (operator override after the
     compliance flag — DECISIONS 2026-08-18; two compliant rephrases
     declined), in the /services intro lead only, on one source line.
     And two ranking sentences rendered by `EvolusLaurel` on
     /services/wrinkle-relaxers (layout slot); since 2026-08-21 at
     the operator's direction, /services/dermal-fillers (in-body, in
     the retired "#1" plate's spot — DECISIONS same date); and since
     2026-08-25 at the operator's direction, /about (the same
     plate-for-plaque swap, retiring the "#1" sentence sitewide —
     DECISIONS same date) — nowhere
     else (operator authorization — DECISIONS 2026-08-19; substantiation = the operator's
     verification with Evolus, which also covers the national
     standing): "The Top Evolus Injector in Charlotte." and "And
     among the Top 50 in the United States." Neither contains a
     token lint:claims' superiority patterns can see — which is why
     the authorization is recorded here rather than in
     `allowedStrings` (the photo-override precedent; the banned list
     does not gain a bare "top" pattern, which would false-positive
     ordinary copy). The wording is exact; changing a word, widening
     the page scope, or restating the ranking anywhere else —
     including meta descriptions, OG tags, alt text, and JSON-LD —
     requires the human operator.
     And two of Amy's own published reels on /services/biostimulators
     (operator overrides after the compliance flags — DECISIONS
     2026-08-21): the Radiesse-visit film (`radiesse-visit`), whose
     cut reads as a before/after sequence and whose carton shot shows
     a neuromodulator box with a per-vial unit quantity legible —
     carried as-is, the on-camera client's release confirmed on file
     (its second on-frame person is the constraint-2 exception
     above); and Amy's Instagram reel (`amy-reel`), which carries no
     claims content (its 480p source ships under a separate
     retina-rule override recorded in DECISIONS and REDESIGN, not
     here). Both keep their audio on the operator's no-speech
     confirmation; their caption files carry `[Music]` cues. Labels,
     captions, and comments for either film describe only what the
     pixels self-identify.
     And the exact deck sentence on /services/wrinkle-relaxers —
     `Wave good-bye to your crow's feet, "11's" between your eyes
     and forehead frown lines!` (operator override after the
     compliance flag — DECISIONS 2026-08-23 and 2026-08-24; flagged
     on the 23rd, when the operator chose a compliant rewrite, and
     that choice reversed on the 24th after seeing the page
     rendered). It is a second-person outcome promise containing no
     token lint:claims can see, which is why the authorization lives
     here and in DECISIONS rather than in `allowedStrings` — a green
     linter never authorizes it. The wording is exact and the scope
     is the `deck` frontmatter field of that one page; the
     vocabulary is never restated anywhere else — body copy, FAQ
     answers, alt text, comments, meta descriptions, OG tags, or
     JSON-LD. One coupling to know before editing either half: that
     page's band photo `jeuveau-banner-studio.jpg` (the 2026-08-18
     pixel override above) carries the banner headline this sentence
     paraphrases, legible in the served file. Changing the wording,
     the page scope, or that photo requires the human operator.
     Nothing else; extending any of these requires the human
     operator.*
     *Fourth scoped exception, and the only one that is not marketing
     copy (operator authorization, DECISIONS 2026-07-22): Biote's FDA
     disclaimer sentence — "These statements have not been evaluated
     by…" — enumerated in `allowedStrings` and rendered by
     `BioteDisclaimer` wherever content sets `bioteDisclaimer: true`.
     It necessarily contains all four banned disease verbs, because
     naming them is what the disclaimer does; that is why the
     `disease-claims` category flagged it and why the exception exists
     at all. **The four verbs stay banned everywhere outside this one
     exact sentence.** Two editing rules: the sentence must live on a
     single source line (the linter strips allowed strings per line, so
     a wrapped copy matches nothing and trips every verb), and those
     verbs must never be restated elsewhere in the same file.*
   - **Never** answer "is this right for me" in copy — route to a consultation.
   - Retatrutide (if published) **must** carry the investigational /
     not-FDA-approved disclosure. Biote symptom language **must** carry the
     FDA disclaimer. Every treatment page carries the medical disclaimer
     (layout-injected — pages cannot opt out).
   - These rules apply to **all text**: page copy, headings, meta
     descriptions, alt text, structured data, OG tags, and microcopy.
   - Language convention: **"consultation"** only for clinical routing;
     **"appointment"** only for booking/conversion.
   - Voice convention (operator rule, 2026-07-08): the site speaks as
     **Amy**, never as a collective. First-person plural — "we", "our",
     "us", "let's" — never appears in rendered site text (a "we" implies
     a team, which implies the other providers at the location — see
     constraint 2). Enforced by `npm run lint:voice` over the built HTML.

4. **Clinician approval gates production.** Treatment content ships with
   `clinicianApproved: false` until Amy signs off. The production pipeline
   fails if unapproved treatment content would publish. Never set
   `clinicianApproved: true` yourself — only the human operator does. Edits
   to approved content reset the flag in the same commit.

5. **Privacy by architecture.** No cookies, no forms, no PII collection, no
   ad/retargeting pixels, no third-party trackers. Cookieless analytics only
   (BUILD_SPEC §11). Video embeds use `youtube-nocookie.com`. Maps are
   link-outs, not embedded iframes.

6. **Accessibility is a requirement, not a polish step.** WCAG 2.2 AA. Text
   contrast ≥ 4.5:1 — the brand hot pinks fail on white at body sizes; use
   the accessible ink tokens per BUILD_SPEC §5. Keyboard operable, visible
   focus, semantic landmarks, reduced-motion respected.

7. **Placeholders, never inventions.** Unknown facts use `{{TOKEN}}`
   placeholders from BUILD_SPEC §17.

8. **The client's internal product cards are prohibited inputs.** They contain
   dosing and non-compliant claims. Do not request them, paste them, or
   commit them. Treatment copy is drafted only from the per-line briefs in
   BUILD_SPEC §7.

## Locked technical decisions (do not revisit without asking)

- **Astro 5** (latest stable), `output: 'static'`, content collections for
  treatments, MDX where needed.
- **Tailwind CSS v4** with brand design tokens as CSS custom properties.
- **Zero client-side JS by default.** Islands only where genuinely required
  (target: mobile nav at most, CSS-first preferred). Budget: ≤ 30 KB total JS.
  First sanctioned consumer (2026-08-14, operator-directed): the home video
  carousel's ~3KB static script — served from `public/js/` because the CSP
  refuses inline scripts (DECISIONS 2026-08-14). Second sanctioned
  consumer (2026-08-17, operator-directed, SHIPS DARK): the self-hosted
  Plausible tracker (~3.6KB, `public/js/plausible.js`) — renders only
  after the operator's relaunch-day flip (BUILD_SPEC §11). Third
  sanctioned consumer (2026-08-21, operator-directed): the treatment-film
  autoplay-in-view script (~2KB, `public/js/treatment-video.js`) —
  rendered only on pages whose `TreatmentVideo` players opt in with
  `autoplay="inview"` (muted, loop-in-view, reduced motion =
  click-to-play; DECISIONS 2026-08-21). Opted-in pages today:
  /services/biostimulators and /services/body-contouring (both
  2026-08-21, Amy's own speech-free reels — the film class the opt-in
  was written for), /about (2026-08-25, the ICON film — a scoped
  operator override of the never-autoplay-a-narrated-manufacturer-film
  rule, DECISIONS same date; the component header carries both the
  rule and the exception — and, same date, the Girl Team unit's team
  film in its sounded rendition, in-contract: site-authored, music
  only, no speech — the operator's confirmation is the record), and
  /injector-training (2026-08-25, Amy's own speech-free training reel
  — in-class, no exception needed; DECISIONS same date), and
  /services/regenerative (2026-08-25, Amy's own speech-free PRP-visit
  reel — in-class; its on-camera provider is the constraint-2 sixth
  exception; DECISIONS same date).
  The budget stands.
- **Self-hosted fonts** (@fontsource, WOFF2, `font-display: swap`), max 2
  families.
- **Images** through `astro:assets` (responsive, AVIF/WebP, lazy below fold).
- **Deploy:** GitHub Actions → SWA (per-PR preview environments — public
  and noindexed; password protection removed at operator direction,
  DECISIONS 2026-07-21) → production behind Front Door with cache purge
  on release.
- `staticwebapp.config.json` is **generated at build time** from
  `config/swa/` templates: Front Door lockdown in production builds only, so
  PR previews stay reachable (BUILD_SPEC §14).

## How to work in this repo

- **Plan before building.** For any multi-file task, present a short plan and
  wait for approval. For design work, follow the design process in
  BUILD_SPEC §5 (design plan → self-critique → build).
- **Verify before done:** `npm run build && npm run check` must pass for every
  unit of work; `npm run verify` before any deploy-affecting change.
- **Quality gates are yours to keep green:** `lint:claims` (compliance
  linter), a11y checks, Lighthouse budgets. Never weaken a gate, its config,
  or the banned-pattern list to make it pass — fix the content or raise the
  issue. The banned list only ever grows.
- **No new dependencies without asking.** Justify each against static-site
  simplicity and solo maintainability.
- Conventional commits (`feat:`, `fix:`, `content:`, `infra:`, `chore:`,
  `docs:`). Treatment-page content changes always get their own commits —
  they are the audit trail for clinician review.

## Key commands

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run check` — astro check + type/content-schema validation
- `npm run lint:claims` — compliance linter over all of `src/` (content,
  pages, components, layouts, lib, styles — comments included)
- `npm run test:a11y` — accessibility checks against the built site
- `npm run verify` — everything above, in order (CI parity)

## Repo map

```
/                     Astro project root
├── BUILD_SPEC.md     Full specification — the source of truth
├── CLAUDE.md         This file
├── docs/
│   └── DECISIONS.md  ADR-lite decision log (append-only)
├── src/
│   ├── content/      Content collection (treatments) + schema (content.config.ts)
│   ├── components/   Astro components
│   ├── layouts/      Base + treatment layouts (disclaimer injection lives here)
│   ├── pages/        Routes
│   ├── styles/       Tokens + global CSS
│   └── lib/          analytics.ts, siteConfig.ts, schema.ts (JSON-LD)
├── config/swa/       staticwebapp.config templates (production / preview)
├── compliance/       banned-patterns.json + linter docs
├── scripts/          lint-claims.mjs, check-approvals.mjs, generate-swa-config.mjs
├── infra/            Bicep (Front Door, SWA, DNS, media storage) — see BUILD_SPEC §15
└── .github/workflows CI/CD
```
