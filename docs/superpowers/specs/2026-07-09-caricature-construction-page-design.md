# Construction page — taped caricature window (Concept A)

Approved 2026-07-09 (operator, after browser mockups of three concepts
built with the real artwork). Amy's commissioned caricature joins the
under-construction page as a story moment: you're peeking through the
taped-off window of a studio that's being finished — and Amy's inside.

## Decisions locked

- **Concept A ("Taped-Off Peek")** over B (polaroid — least bold) and
  C (noir/blush diptych — recommended for Phase C carry-over, not chosen).
- **Logo keeps its full 780px width** and regains the approved
  ignite-then-hum routine (Amy's rule: the logo is big; the hum was
  styleguide-verified 2026-07-08 and only left this page in the marquee
  revert).
- The operator saw the flag on the artwork's Mobile Aesthetics signage
  and explicitly accepted it. Site *copy* rules (hard constraint 2) are
  unchanged.
- Reusable per operator's "Both" answer: the arch window is a component,
  not a page one-off.

## Page composition (top to bottom)

1. Logo — unchanged sizing/priority, `construction-sign` class
   (`ng-ignite` once, `ng-hum` 3.2s infinite; global reduced-motion
   override stills both).
2. `CaricatureWindow` — arched frame (`border-radius: 999px 999px 16px
   16px`), hairline pink-300 border at 50%, static neon-500 halo
   (noir-scoped), two caution-tape strips rotated −7°/+5° across the
   lower third. Max width 520px desktop / 86vw mobile.
3. `Under construction` h1 (tracked uppercase; the tape bars move off the
   heading — they have a job on the window now).
4. Story line (lead, pink-tint): "Amy's inside, getting the studio ready."
   — replaces "Pardon the dust".
5. Existing provider line and phone link, unchanged.

## Component contract — `src/components/CaricatureWindow.astro`

- Props: `image: ImageMetadata`, `alt: string`, `taped?: boolean`
  (default false), `class?: string` (width control stays with the caller).
- Tape strips render only when `taped`; they are `aria-hidden`
  decoration. Tape CSS lives in the component — the heading no longer
  uses it, so nothing else consumes it.
- The halo never animates and is scoped to `[data-surface='noir']`
  (token rule: neon glows on dark surfaces only) — Phase C can reuse the
  window untaped on light surfaces (e.g. About portrait) with no edits.
- Styles are `is:global` (ancestor surface scoping, same pattern and
  namespacing discipline as `ChevronRun`).

## Asset, a11y, performance, compliance

- Asset: `src/assets/brand/amy-caricature.png` (1065×1477 source, 1.9 MB)
  via `astro:assets`, widths [360, 520, 780, 1040] — AVIF/WebP delivery.
- Alt: "Illustrated caricature of Amy Palacios, FNP, seated on a studio
  counter" — factual, claim-free.
- Logo remains LCP (`fetchpriority="high"`); caricature eager but
  unprioritized. Zero client JS. Animations are filter/opacity only
  (no CLS).
- Copy is Amy-singular (lint:voice) and claim-clean (lint:claims); both
  gates run over this page's build output.
- `justify-center` dropped from the section: content now exceeds one
  viewport, and centered overflow clips the top edge.

## Process

Branch `feat/construction-caricature` → `npm run verify` green → PR →
password-protected preview → operator + Amy review on real devices →
merge to production **only on explicit go** (standing rule,
docs/DECISIONS.md 2026-07-08).

## Out of scope

Phase C pages (the window's untaped reuse is designed for, not built);
any additional motion; diptych/polaroid concepts (mockups preserved in
`.superpowers/brainstorm/`, untracked).
