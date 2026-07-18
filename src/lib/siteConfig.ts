// Single source of business facts used across the site.
// Unknown values use {{TOKEN}} placeholders from BUILD_SPEC §17 — never invent
// real values here; the operator supplies them.
export const siteConfig = {
  name: 'Needle Girlie',
  legalName: 'Needle Girlie — Amy Palacios, FNP',
  provider: 'Amy Palacios, FNP', // established business fact (CLAUDE.md)
  locality: 'Harrisburg, NC', // established business fact (CLAUDE.md)
  domain: 'needlegirlie.com',
  url: 'https://needlegirlie.com',
  // {{ADDRESS_DISPLAY}} resolved by operator 2026-07-18
  address: '4350 Main Street, Suite 224, Harrisburg, NC 28075',
  phone: '704-579-7108', // {{PHONE}} resolved by operator 2026-07-07
  phoneTel: 'tel:+17045797108',
  hours: '{{HOURS}}',
  booking: {
    vagaroUrl: '{{VAGARO_URL}}',
  },
  skinbetterUrl: '{{SKINBETTER_URL}}',
  social: {
    // Populated from {{SOCIAL_LINKS}} when supplied.
  },
  appLinks: {
    // Get-the-App module is feature-flagged off in v1 (BUILD_SPEC §9).
    enabled: false,
  },
  analytics: {
    // Cookieless only (BUILD_SPEC §11). Stays disabled until the operator
    // confirms {{ANALYTICS_PROVIDER}}.
    enabled: false,
    provider: '{{ANALYTICS_PROVIDER}}',
  },
} as const;
