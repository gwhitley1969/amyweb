/**
 * Ad landing pages — /go/<slug>
 * (docs/superpowers/specs/2026-10-12-landing-pages-design.md; DECISIONS
 * 2026-10-12, the landing-pages entry).
 *
 * A landing page re-renders its treatment entry's approved strings
 * through LandingLayout: nothing is written twice, and the treatment
 * files are untouched, so no approval flag resets. Enabling a line is a
 * slug here plus its URL in .pa11yci.json; the route fails the build for
 * a slug with no non-draft entry.
 *
 * Deliberately absent: weight-loss-glp-1, hormone-optimization and
 * peptide-therapy (Google may refuse ads for them without a
 * certification Amy does not hold) and regenerative (PRP is named on
 * Google's cell-therapy prohibition). The spec's §12 carries the record;
 * enabling any of them is an operator decision.
 */
export const LANDING_SLUGS = ['wrinkle-relaxers'] as const;
export type LandingSlug = (typeof LANDING_SLUGS)[number];

export interface LandingRules {
  /** Render the EvolusLaurel plaque. The plaque's page scope was
   * extended by the operator to /go/wrinkle-relaxers and
   * /go/dermal-fillers (CLAUDE.md constraint 3; DECISIONS 2026-10-12). */
  laurel: boolean;
  /** FAQ questions NOT rendered on the landing page, by exact question
   * text: an answer that carries a page-scoped operator exception stays
   * on its own page. The route fails the build if a listed question no
   * longer exists in the entry, so a rule cannot rot silently. */
  faqExclude: readonly string[];
}

const RULES: Readonly<Record<string, Partial<LandingRules>>> = {
  'wrinkle-relaxers': { laurel: true },
  'dermal-fillers': { laurel: true },
  // The §8.7 scoped exception in that answer is authorized on
  // /services/laser-treatments only (CLAUDE.md constraint 3; DECISIONS
  // 2026-09-19), so the landing page omits the item.
  'laser-treatments': { faqExclude: ['Can I book a laser treatment directly?'] },
};

export function landingRules(slug: string): LandingRules {
  const r = RULES[slug] ?? {};
  return { laurel: r.laurel ?? false, faqExclude: r.faqExclude ?? [] };
}
