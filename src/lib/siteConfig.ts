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
  // {{HOURS}} CLOSED 2026-08-04: Amy's decision — hours are NOT listed on
  // the website, anywhere (not a pending value; no hours field exists).
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
  // The practice site of Amy's own PLLC. Destination screened
  // 2026-08-15: it names the location's other providers, which hard
  // constraint 2 otherwise bans linking to — the header badge link is
  // an OPERATOR OVERRIDE, recorded in DECISIONS 2026-08-15 and scoped
  // in CLAUDE.md constraint 2. The only sanctioned outbound reference.
  mobileAestheticsUrl: 'https://yourmobileaesthetics.com',
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
    // {{ANALYTICS_PROVIDER}} RESOLVED 2026-08-04: NONE at launch (operator
    // delegated the call — DECISIONS same date). Traffic visibility comes
    // from Front Door's built-in edge reports (zero script, zero cookies,
    // zero added cost). Plausible (~$9/mo) remains the future default —
    // enabling it is a deliberate opt-in: set provider + enabled here and
    // wire track() in analytics.ts; the privacy page updates first.
    enabled: false,
    provider: 'none',
  },
} as const;
