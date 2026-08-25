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
  // Films origin (2026-08-17, external-audit Finding 5 — DECISIONS same
  // date): the .mp4 renditions serve from Blob behind the same Front
  // Door, on a stable hostname so PR previews play exactly what
  // production plays. Deliberately ABSOLUTE in every build. The WebVTT
  // caption files are NOT here — they stay in public/media/ (in-repo,
  // same-origin: compliance-screened text keeps its git audit trail,
  // and same-origin tracks need no CORS).
  mediaBase: 'https://media.needlegirlie.com',
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
  // constraint 2 otherwise bans linking to — every link to it is an
  // OPERATOR OVERRIDE scoped in CLAUDE.md constraint 2. TWO sanctioned
  // references: the header badge (DECISIONS 2026-08-15) and the /about
  // Girl Team button (DECISIONS 2026-08-25, direct from Amy). Adding
  // any further consumer requires the human operator.
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
    // zero added cost).
    // PLAUSIBLE PREP 2026-08-17 (operator decision, external-audit
    // Finding 6 — DECISIONS same date): the wiring is BUILT and ships
    // dark. Flipping these two values to true / 'plausible' is the
    // whole switch: BaseLayout emits the script, the privacy page
    // swaps its analytics section, and the generated CSP admits
    // plausible.io — all in the same build, nothing else to edit.
    // Procedure (account creation first, ~$9/mo): docs/RUNBOOK.md
    // "Turning on analytics". The flip is the OPERATOR'S act, at
    // relaunch. (The wide types keep the dark-state literals from
    // making the flip a type error.)
    enabled: false as boolean,
    provider: 'none' as 'none' | 'plausible',
  },
} as const;
