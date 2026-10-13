/**
 * Ad landing pages — /go/<slug>
 * (docs/superpowers/specs/2026-10-12-landing-pages-design.md and its §13
 * addendum; DECISIONS 2026-10-12, the landing-pages entry, and
 * 2026-10-13, the four remaining lines).
 *
 * A landing page re-renders its treatment entry's approved strings
 * through LandingLayout: nothing is written twice, and the treatment
 * files are untouched, so no approval flag resets. Enabling a line is a
 * slug here plus its URL in .pa11yci.json; the route fails the build for
 * a slug with no non-draft entry.
 *
 * All twelve lines are enabled. The last four — regenerative,
 * weight-loss-glp-1, peptide-therapy and hormone-optimization — were
 * left out on 2026-10-12 because of Google's ad rules (PRP is named on
 * the cell-therapy prohibition; the other three carry the
 * prescription-drug certification question) and enabled on 2026-10-13
 * at Amy's request: the pages also serve posts, texts and QR codes, and
 * Google's answer is hers to get. Google's position is unchanged and
 * recorded in DECISIONS.
 */
export const LANDING_SLUGS = [
  'wrinkle-relaxers',
  'dermal-fillers',
  'biostimulators',
  'laser-treatments',
  'skin-rejuvenation',
  'body-contouring',
  'skincare',
  'iv-therapy',
  'regenerative',
  'weight-loss-glp-1',
  'peptide-therapy',
  'hormone-optimization',
] as const;
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
  /** Which entry field is the lead under the H1. `factual` (the default)
   * is `schemaDescription ?? summary`: the factual description wherever
   * a page has one. `summary` renders the entry's summary even though a
   * schemaDescription exists — only where the operator has extended a
   * page-scoped override of that sentence to the landing page. The route
   * fails the build if a `summary` rule names an entry with no
   * schemaDescription, because the rule would then change nothing. */
  lead: 'factual' | 'summary';
}

const RULES: Readonly<Record<string, Partial<LandingRules>>> = {
  'wrinkle-relaxers': { laurel: true },
  'dermal-fillers': { laurel: true },
  // The §8.7 scoped exception in that answer is authorized on
  // /services/laser-treatments only (CLAUDE.md constraint 3; DECISIONS
  // 2026-09-19), so the landing page omits the item.
  'laser-treatments': { faqExclude: ['Can I book a laser treatment directly?'] },
  // The regenerative summary sentence is an operator override (CLAUDE.md
  // constraint 3; DECISIONS 2026-09-19) that renders as the visible lead
  // of /services/regenerative; on 2026-10-13 the operator extended it to
  // this landing page's lead (DECISIONS same date). The page's meta
  // description stays the factual seo.description.
  regenerative: { lead: 'summary' },
  // weight-loss-glp-1: no rule. The Retatrutide card and its
  // investigational notice render by the entry's flag, the operator's
  // choice on 2026-10-13: the page mirrors the approved page, and
  // Google's view of an unapproved medicine is Amy's to handle.
  // peptide-therapy: no rule. The time-span price lines on the GLOW and
  // KLOW cards render as approved; the operator extended that
  // exception's scope to /go/peptide-therapy on 2026-10-13 (CLAUDE.md
  // constraint 3; DECISIONS same date).
  // hormone-optimization: no rule. The vocabulary the linter's symptom
  // check guards lives in the MDX body, which no landing page renders;
  // bioteDisclaimer stays false by the entry's flag, as on its page.
};

export function landingRules(slug: string): LandingRules {
  const r = RULES[slug] ?? {};
  return { laurel: r.laurel ?? false, faqExclude: r.faqExclude ?? [], lead: r.lead ?? 'factual' };
}
