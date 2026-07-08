import type { SERVICE_LINES } from '../content.config';

type LineSlug = (typeof SERVICE_LINES)[number];

export interface ServiceLine {
  slug: LineSlug;
  title: string;
  /** One factual sentence — the claim rulebook (BUILD_SPEC §8) applies. */
  summary: string;
  href: string;
}

// Titles per BUILD_SPEC §6; summaries drafted from the §7 briefs only.
export const serviceLines: ServiceLine[] = [
  {
    slug: 'weight-loss-glp-1',
    title: 'Weight Loss & GLP-1 Therapy',
    summary: 'Prescription GLP-1 medications in a medically supervised weight-management program.',
    href: '/services/weight-loss-glp-1',
  },
  {
    slug: 'peptide-therapy',
    title: 'Peptide Therapy',
    summary: 'Peptide therapy options, individualized under clinician supervision.',
    href: '/services/peptide-therapy',
  },
  {
    slug: 'wrinkle-relaxers',
    title: 'Neuromodulators',
    summary: 'Prescription injectable treatments for temporary softening of dynamic lines.',
    href: '/services/wrinkle-relaxers',
  },
  {
    slug: 'dermal-fillers',
    title: 'Dermal Fillers',
    summary: 'Injectable gel fillers for volume and contour.',
    href: '/services/dermal-fillers',
  },
  {
    slug: 'biostimulators',
    title: 'Biostimulators',
    summary: 'Collagen-stimulating treatments, including PDO threads and Radiesse.',
    href: '/services/biostimulators',
  },
  {
    slug: 'regenerative',
    title: 'Regenerative Treatments',
    summary: 'PRP & PRF, PDRN, and related regenerative treatment options.',
    href: '/services/regenerative',
  },
  {
    slug: 'iv-therapy',
    title: 'IV Therapy & Vitamin Support',
    summary: "IV drips and vitamin shots, including the Myers' Cocktail.",
    href: '/services/iv-therapy',
  },
  {
    slug: 'hormone-optimization',
    title: 'Hormone Optimization',
    summary: 'Bioidentical hormone replacement therapy from a Biote-certified provider.',
    href: '/services/hormone-optimization',
  },
  {
    slug: 'skincare',
    title: 'Skincare',
    summary: "Medical-grade skincare through Amy's Skinbetter Science storefront.",
    href: '/services/skincare',
  },
];
