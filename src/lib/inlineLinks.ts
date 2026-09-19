/**
 * Inline link markers for copy that lives in PLAIN STRINGS — FAQ answers
 * (treatment frontmatter) and the visit-step bodies (VisitSteps' array) —
 * where a sentence cannot hold markup. A linked word is written as:
 *
 *     Feel free to [book](cta:book) now!
 *
 * `cta:book` is the ONLY target; the consumer renders it with BookLink
 * (Amy's Vagaro page — siteConfig.booking.vagaroUrl). Arbitrary URLs are
 * deliberately NOT supported: every outbound destination on this site is
 * screened first (compliance/README), and a content string must not be
 * able to add one. An unknown target or a malformed marker THROWS, which
 * fails the build, rather than printing brackets on a page.
 *
 * History: born inside FaqAccordion 2026-09-19 (operator direction — the
 * body-contouring booking answer); moved here the same day when the
 * operator had every "book" in running text and FAQ answers linked and
 * VisitSteps became the second consumer (DECISIONS 2026-09-19).
 *
 * Never put a marker in a string that renders inside a control — the FAQ
 * QUESTION is a <summary>; a link there hijacks the click that opens the
 * answer. Anything that reads these strings as plain text (FAQPage JSON-LD
 * is Phase D) must call stripInlineLinks first.
 */
export type InlinePart = { text: string; link?: 'book' };

const LINK_MARKER = /\[([^\]]+)\]\(cta:([^)]*)\)/g;

/** Split a string into plain and linked parts. `where` names the string in errors. */
export function parseInlineLinks(text: string, where: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK_MARKER)) {
    const at = m.index ?? 0;
    const label = m[1] ?? '';
    const target = m[2] ?? '';
    if (target !== 'book') {
      throw new Error(`inline link: unknown target "cta:${target}" in ${where}. Only cta:book exists.`);
    }
    if (at > last) parts.push({ text: text.slice(last, at) });
    parts.push({ text: label, link: 'book' });
    last = at + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  if (parts.some((part) => !part.link && part.text.includes(']('))) {
    throw new Error(`inline link: malformed marker in ${where}. The only form is [text](cta:book).`);
  }
  return parts;
}

/** The same string with every marker reduced to its text. */
export function stripInlineLinks(text: string): string {
  return parseInlineLinks(text, 'stripInlineLinks')
    .map((part) => part.text)
    .join('');
}
