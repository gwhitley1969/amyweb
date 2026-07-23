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
    // {{VAGARO_URL}} supplied by operator 2026-07-18. The handle is the
    // practice's own: Mobile Aesthetics is Amy's business (sole owner —
    // operator 2026-07-23, recorded in DECISIONS); the 2026-07-18
    // shared-location flag is resolved. Reachability still gets checked
    // at the §16 launch checklist.
    vagaroUrl: 'https://www.vagaro.com/mobileaestheticshealthandbeautyassociates',
  },
  // {{SKINBETTER_URL}} resolved by operator 2026-07-23 (DECISIONS same
  // date). Canonical form of the QR on Amy's Skinbetter counter card
  // (skinbetter.pro/MobileAesthetics 301s here); lands on the
  // skinbetter.com shop carrying the practice's businessPartner_id
  // (verified in-browser). Mobile Aesthetics is Amy's own practice, so
  // the storefront is hers. The QR's ?k=signup variant (account-form
  // first) is deliberately NOT used — a Shop button lands on the shop;
  // practice attribution is identical either way.
  skinbetterUrl: 'https://connect.skinbetter.com/MobileAesthetics',
  social: {
    // {{SOCIAL_LINKS}} supplied by operator 2026-07-18. The Yelp listing
    // runs under the practice name — Mobile Aesthetics is Amy's own
    // business (sole owner — operator 2026-07-23), so the earlier
    // "location's, not Amy-specific" flag is resolved.
    facebook: 'https://www.facebook.com/MobileAestheticsNP704',
    instagram: 'https://www.instagram.com/amypalaciosnp.mobileaesthetics/',
    yelp: 'https://www.yelp.com/biz/mobile-aesthetics-harrisburg',
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
