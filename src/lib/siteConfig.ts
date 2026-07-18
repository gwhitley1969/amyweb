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
    // {{VAGARO_URL}} supplied by operator 2026-07-18. FLAG (BUILD_SPEC §9,
    // recorded in DECISIONS): this appears to be the shared location's
    // handle, not an Amy-specific page — operator confirmed it is where
    // her bookings take place; revisit at the §16 launch checklist.
    vagaroUrl: 'https://www.vagaro.com/mobileaestheticshealthandbeautyassociates',
  },
  skinbetterUrl: '{{SKINBETTER_URL}}',
  social: {
    // {{SOCIAL_LINKS}} supplied by operator 2026-07-18. FLAG: the Yelp
    // listing is the location's (not Amy-specific) — same §9 note as the
    // Vagaro handle above.
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
