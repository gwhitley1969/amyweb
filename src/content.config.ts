import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The 9 service lines (BUILD_SPEC §6/§7). Slugs match the /services/* routes.
export const SERVICE_LINES = [
  'weight-loss-glp-1',
  'peptide-therapy',
  'wrinkle-relaxers',
  'dermal-fillers',
  'biostimulators',
  'regenerative',
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
    products: z.array(z.string()).default([]),
    ctaType: z.enum(['book', 'consult', 'shop']),
    investigational: z.boolean().default(false),
    bioteDisclaimer: z.boolean().default(false),
    pricingDisplay: z.enum(['none', 'consult', 'startingAt']).default('consult'),
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
