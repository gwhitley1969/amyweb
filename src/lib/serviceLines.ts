import type { SERVICE_LINES } from '../content.config';

type LineSlug = (typeof SERVICE_LINES)[number];

export type LineCategory = 'injectables' | 'skin-body' | 'wellness';

export interface ServiceLine {
  slug: LineSlug;
  title: string;
  /** One factual sentence — the claim rulebook (BUILD_SPEC §8) applies. */
  summary: string;
  href: string;
  category: LineCategory;
}

/**
 * Group order + labels for the /services editorial menu (client direction
 * 2026-07-23). Labels render as headings — claims/voice rules apply.
 */
export const CATEGORIES: ReadonlyArray<{ key: LineCategory; label: string }> = [
  { key: 'injectables', label: 'Injectables' },
  { key: 'skin-body', label: 'Skin & Body' },
  { key: 'wellness', label: 'Wellness' },
];

// Titles per BUILD_SPEC §6 (+ the 2026-07-19 Vagaro alignment);
// summaries drafted from the §7 briefs only.
// Array order IS the menu's display + numbering order (grouped 4/4/4,
// injectables lead — client direction 2026-07-23, supersedes the earlier
// weight-loss-first order).
export const serviceLines: ServiceLine[] = [
  {
    slug: 'wrinkle-relaxers',
    title: 'Wrinkle Relaxers',
    summary: 'Prescription injectable treatments for temporary softening of dynamic lines.',
    href: '/services/wrinkle-relaxers',
    category: 'injectables',
  },
  {
    slug: 'dermal-fillers',
    title: 'Dermal Fillers',
    summary: 'Injectable gel fillers for volume and contour.',
    href: '/services/dermal-fillers',
    category: 'injectables',
  },
  {
    slug: 'biostimulators',
    title: 'Biostimulators',
    summary: 'Collagen-stimulating treatments, including PDO threads and Radiesse.',
    href: '/services/biostimulators',
    category: 'injectables',
  },
  {
    slug: 'regenerative',
    title: 'Regenerative Treatments',
    summary: 'PRP treatments — on their own, or combined with microneedling.',
    href: '/services/regenerative',
    category: 'injectables',
  },
  {
    slug: 'skin-rejuvenation',
    title: 'Skin Rejuvenation',
    summary: 'PiXel8-RF microneedling and medical-grade chemical peels.',
    href: '/services/skin-rejuvenation',
    category: 'skin-body',
  },
  {
    slug: 'body-contouring',
    title: 'Body Contouring',
    summary: 'Evolve — a non-invasive device treatment designed for skin tightening and muscle toning.',
    href: '/services/body-contouring',
    category: 'skin-body',
  },
  {
    slug: 'laser-treatments',
    title: 'Laser Treatments',
    summary: 'Venus Versa treatments using intense pulsed light and radiofrequency energy.',
    href: '/services/laser-treatments',
    category: 'skin-body',
  },
  {
    slug: 'skincare',
    title: 'Skincare',
    summary: "Medical-grade skincare through Amy's Skinbetter Science storefront.",
    href: '/services/skincare',
    category: 'skin-body',
  },
  {
    slug: 'weight-loss-glp-1',
    title: 'Weight Loss & GLP-1 Therapy',
    summary: 'Prescription weight-management medications in a medically supervised program.',
    href: '/services/weight-loss-glp-1',
    category: 'wellness',
  },
  {
    slug: 'peptide-therapy',
    title: 'Peptide Therapy',
    summary: 'Peptide therapy options, individualized under clinician supervision.',
    href: '/services/peptide-therapy',
    category: 'wellness',
  },
  {
    slug: 'iv-therapy',
    title: 'IV Therapy & Vitamin Support',
    summary: "IV drips and vitamin shots, including the Myers' Cocktail.",
    href: '/services/iv-therapy',
    category: 'wellness',
  },
  {
    slug: 'hormone-optimization',
    title: 'Hormone Optimization',
    summary: 'Bioidentical hormone replacement therapy from a Biote-certified provider.',
    href: '/services/hormone-optimization',
    category: 'wellness',
  },
];
