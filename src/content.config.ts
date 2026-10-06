import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The 12 service lines (BUILD_SPEC §6/§7; skin-rejuvenation and
// body-contouring added in the 2026-07-19 Vagaro alignment,
// laser-treatments added 2026-07-22 — operator approved). Slugs match
// the /services/* routes.
export const SERVICE_LINES = [
  'weight-loss-glp-1',
  'peptide-therapy',
  'wrinkle-relaxers',
  'dermal-fillers',
  'biostimulators',
  'regenerative',
  'skin-rejuvenation',
  'body-contouring',
  'laser-treatments',
  'iv-therapy',
  'hormone-optimization',
  'skincare',
] as const;

// Treatment collection schema per BUILD_SPEC §7. Schema changes are reviewed
// changes — do not modify without operator approval.
const treatments = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/treatments' }),
  // The function form supplies `image()` for `film.poster` (2026-10-02).
  schema: ({ image }) => z.object({
    title: z.string(),
    line: z.enum(SERVICE_LINES),
    summary: z.string(),
    // Optional override for the Service JSON-LD description ONLY
    // (2026-09-19 — operator-approved schema change, DECISIONS same
    // date). `summary` renders as the lead under the H1 AND, by default,
    // feeds structured data. When a page's visible lead ships under an
    // operator override of the claim rules, this field keeps the
    // structured-data description factual: overrides never reach meta
    // descriptions, OG tags, or JSON-LD. Absent = `summary` is used, so
    // every other page is unchanged. §8 applies to it like any string.
    schemaDescription: z.string().optional(),
    // Optional editorial standfirst (2026-07-20 — replaced the AtAGlance
    // fact card at operator direction): one short, claims-clean display
    // line rendered as the blush statement card under the lead. §8
    // applies to it like any other string.
    deck: z.string().optional(),
    // Renders the EvolusLaurel ranking plaque between the deck and the
    // product cards (2026-08-19 — operator-approved schema change).
    // The plaque's copy lives in the component under an exact-wording
    // operator authorization (CLAUDE.md constraint 3, DECISIONS same
    // date); this flag only places it. wrinkle-relaxers only today —
    // widening the page scope requires the human operator.
    evolusLaurel: z.boolean().default(false),
    products: z.array(z.string()).default([]),
    // Optional per-product cards (2026-07-20 GLP-1 alignment — operator-
    // approved schema change): upgrades the products bullet list in the
    // layout. `detail` is short factual text — a sentence or a few —
    // claim-free by rule (§7/§8); the peptide and regenerative cards
    // carry the client's own definitions under recorded operator
    // overrides (DECISIONS 2026-08-01).
    // `priceLines` holds operator-supplied price strings only. A string
    // that would trip a banned category (mg-keyed, per-unit, …)
    // additionally requires an exact allowlist entry in
    // compliance/banned-patterns.json — operator-only. (Comment aligned
    // with merged practice 2026-07-22: plain-dollar strings like
    // "$900 per syringe" ship without allowlisting; the `detail` wording
    // aligned the same way 2026-10-02.)
    productDetails: z
      .array(
        z.object({
          name: z.string(),
          detail: z.string(),
          tag: z.string().optional(),
          priceLines: z.array(z.string()).default([]),
        }),
      )
      .default([]),
    ctaType: z.enum(['book', 'consult', 'shop']),
    investigational: z.boolean().default(false),
    // Names the compound inside InvestigationalNotice so the disclosure
    // is unambiguous on pages that list several products (added in the
    // 2026-07-19 Vagaro alignment — operator-approved schema change).
    investigationalProduct: z.string().optional(),
    // Page-supplied wording for InvestigationalNotice (2026-07-21 —
    // operator-approved consolidation to a single calm disclosure line).
    // The sentence must still state the compound is investigational and
    // not FDA-approved; lint:claims' inverse check enforces that on this
    // file's own text, so the wording lives here in the audit trail.
    investigationalNote: z.string().optional(),
    bioteDisclaimer: z.boolean().default(false),
    // Optional film rendered by the layout directly above "What Amy
    // offers" (2026-10-02 — operator-approved schema change, DECISIONS
    // same date; first use: /services/hormone-optimization). The fields
    // are TreatmentVideo's props; the poster resolves relative to the
    // content file. A film placed further down a page stays in the MDX
    // body, as before. Every film ships under its own DECISIONS entry;
    // label and caption are site text and §8 applies to them.
    film: z
      .object({
        src: z.string(),
        poster: image(),
        captionsSrc: z.string(),
        label: z.string(),
        caption: z.string().optional(),
        // 'bare' drops the white paper mat (operator direction 2026-10-02,
        // the Biote film); absent = the player's default mat.
        frame: z.enum(['mat', 'bare']).optional(),
        autoplay: z.literal('inview').optional(),
      })
      .optional(),
    pricingDisplay: z.enum(['none', 'consult', 'startingAt']).default('consult'),
    // Editorial Q&A only (§7): process, logistics, credentials. Suitability
    // questions always answer "that's decided in a consultation". Compliance
    // text NEVER goes in an accordion. Rides the clinician-approval gate
    // with the rest of the page. (Field added in C2 — operator-approved
    // schema change, flagged in the PR.)
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    // Only the human operator ever sets this to true (CLAUDE.md hard constraint 4).
    clinicianApproved: z.boolean().default(false),
    draft: z.boolean().default(false),
    seo: z.object({
      title: z.string(),
      description: z.string(),
    }),
  }),
});

export const collections = { treatments };
