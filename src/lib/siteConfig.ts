// Single source of business facts used across the site.
// Unknown values use {{TOKEN}} placeholders from BUILD_SPEC §17 — never invent
// real values here; the operator supplies them.
export const siteConfig = {
  name: 'Needle Girlie',
  legalName: 'Needle Girlie — Amy Palacios, FNP',
  domain: 'needlegirlie.com',
  url: 'https://needlegirlie.com',
  address: '{{ADDRESS_DISPLAY}}',
  phone: '{{PHONE}}',
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
