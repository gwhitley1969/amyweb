import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The 11 service lines (BUILD_SPEC §6/§7; skin-rejuvenation and
// body-contouring added in the 2026-07-19 Vagaro alignment — operator
// approved). Slugs match the /services/* routes.
export const SERVICE_LINES = [
  'weight-loss-glp-1',
  'peptide-therapy',
  'wrinkle-relaxers',
  'dermal-fillers',
  'biostimulators',
  'regenerative',
  'skin-rejuvenation',
  'body-contouring',
  'iv-therapy',
  'hormone-optimization',
  'skincare',
] as const;

// Treatment collection schema per BUILD_SPEC §7. Schema changes are reviewed
// changes — do not modify without operator approval.
const treatments = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/treatments' }),
  schema: z.object({
    title: z.string(),
    line: z.enum(SERVICE_LINES),
    summary: z.string(),
    // Optional editorial standfirst (2026-07-20 — replaced the AtAGlance
    // fact card at operator direction): one short, claims-clean display
    // line rendered as the blush statement card under the lead. §8
    // applies to it like any other string.
    deck: z.string().optional(),
    products: z.array(z.string()).default([]),
    // Optional per-product cards (2026-07-20 GLP-1 alignment — operator-
    // approved schema change): upgrades the products bullet list in the
    // layout. `detail` is one factual, claim-free sentence (§7/§8);
    // `priceLines` may hold ONLY the operator-authorized allowlist strings
    // in compliance/banned-patterns.json.
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
    bioteDisclaimer: z.boolean().default(false),
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
