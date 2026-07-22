import type { SERVICE_LINES } from '../content.config';

type LineSlug = (typeof SERVICE_LINES)[number];

export interface ServiceLine {
  slug: LineSlug;
  title: string;
  /** One factual sentence — the claim rulebook (BUILD_SPEC §8) applies. */
  summary: string;
  href: string;
}

// Titles per BUILD_SPEC §6 (+ the 2026-07-19 Vagaro alignment);
// summaries drafted from the §7 briefs only.
export const serviceLines: ServiceLine[] = [
  {
    slug: 'weight-loss-glp-1',
    title: 'Weight Loss & GLP-1 Therapy',
    summary: 'Prescription weight-management medications in a medically supervised program.',
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
    title: 'Wrinkle Relaxers',
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
    summary: 'PRP treatments — on their own, or combined with microneedling.',
    href: '/services/regenerative',
  },
  {
    slug: 'skin-rejuvenation',
    title: 'Skin Rejuvenation',
    summary: 'PiXel8-RF microneedling and medical-grade chemical peels.',
    href: '/services/skin-rejuvenation',
  },
  {
    slug: 'body-contouring',
    title: 'Body Contouring',
    summary: 'Evolve — a non-invasive device treatment designed for skin tightening and muscle toning.',
    href: '/services/body-contouring',
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
