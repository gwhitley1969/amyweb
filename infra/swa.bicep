// Azure Static Web App (Standard) — origin for needlegirlie.com (BUILD_SPEC §15).
// Deployed from GitHub Actions via deployment token; no repo link here.
param location string

resource swa 'Microsoft.Web/staticSites@2023-12-01' = {
  name: 'stapp-needlegirlie'
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled' // per-PR preview environments
    allowConfigFileUpdates: true // staticwebapp.config.json is generated at build
    enterpriseGradeCdnStatus: 'Disabled' // Front Door Standard sits in front instead
  }
}

// Preview environments are deliberately PUBLIC (operator decision,
// DECISIONS 2026-07-21 — the SWA basicAuth cookie looped constantly in
// Chrome and blocked client reviews). Drafts are kept out of search by
// the X-Robots-Tag header in config/swa/preview.json. Do not re-add a
// basicAuth resource here without the operator. Production stays locked
// to Front Door by the generated SWA config.

output defaultHostname string = swa.properties.defaultHostname
output swaId string = swa.id
