import { siteConfig } from './siteConfig';

/**
 * JSON-LD builders (BUILD_SPEC §10). Single source for all structured data.
 * The claim rulebook applies to every string here (the linter scans this
 * file). Unresolved {{TOKEN}} values are OMITTED — placeholder strings must
 * never be serialized into structured data.
 */

const isResolved = (value: string): boolean => !/\{\{.+\}\}/.test(value);

/** Strips properties whose values are unresolved tokens or empty. */
function pruned<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && (!value || !isResolved(value))) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out as Partial<T>;
}

/**
 * Sitewide LocalBusiness. Stable type pairing (logged in DECISIONS.md):
 * MedicalBusiness + HealthAndBeautyBusiness.
 */
export function localBusiness() {
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalBusiness', 'HealthAndBeautyBusiness'],
    ...pruned({
      name: siteConfig.name,
      url: siteConfig.url,
      telephone: '+17045797108',
      // {{ADDRESS_DISPLAY}} resolved 2026-07-18 (matches siteConfig.address)
      address: {
        '@type': 'PostalAddress',
        streetAddress: '4350 Main Street, Suite 224',
        addressLocality: 'Harrisburg',
        addressRegion: 'NC',
        postalCode: '28075',
        addressCountry: 'US',
      },
      openingHours: siteConfig.hours,
      // social values are literal types now — no widening predicate needed
      sameAs: Object.values(siteConfig.social).filter((v) => isResolved(v)),
    }),
  };
}

/** Per-treatment-page Service — factual name + description only (§10). */
export function service(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url,
    provider: { '@type': 'MedicalBusiness', name: siteConfig.name, url: siteConfig.url },
  };
}

export function breadcrumbList(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
