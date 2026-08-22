/**
 * REVIEW SCAFFOLDING — see src/components/ReviewNumber.astro.
 *
 * Letter tags for the pages outside /services/<slug>, so a review pair can
 * refer to any page by a short label. The twelve service pages carry their
 * /services menu numbers (01..12) via lineNumber() in serviceLines.ts, and
 * /injector-training carries 13, set where it renders.
 *
 * Keyed by pathname on purpose: / and /styleguide/concept render the SAME
 * component (ConceptHome.astro), so a hardcoded letter would tag both. The
 * lookup answers for / and returns null for the styleguide route, which is
 * deliberately left bare along with /404.
 *
 * Short-lived: this file lives on the review branch only and goes with it.
 */
const TAGS: Record<string, string> = {
  '/': 'A',
  '/services': 'B',
  '/about': 'C',
  '/visit': 'D',
  '/privacy': 'E',
  '/terms': 'F',
  '/medical-disclaimer': 'G',
};

/** Letter tag for a route, or null when the route is deliberately untagged. */
export function reviewTag(pathname: string): string | null {
  return TAGS[pathname.replace(/\/$/, '') || '/'] ?? null;
}
