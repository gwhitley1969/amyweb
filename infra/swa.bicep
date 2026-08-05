// Azure Static Web App (Standard) — origin for needlegirlie.com (BUILD_SPEC §15).
// Deployed from GitHub Actions via deployment token; no repo link here.
param location string

@secure()
@description('Password protecting non-production (preview) environments — SWA Standard feature. Share with Amy for reviews.')
param previewPassword string

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

// Password-protect preview environments only; production stays open (it is
// locked to Front Door by the generated SWA config instead).
resource basicAuth 'Microsoft.Web/staticSites/basicAuth@2023-12-01' = {
  parent: swa
  name: 'default'
  properties: {
    applicableEnvironmentsMode: 'StagingEnvironments'
    password: previewPassword
  }
}

output defaultHostname string = swa.properties.defaultHostname
output swaId string = swa.id
