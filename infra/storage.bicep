// Media origin storage (BUILD_SPEC §2 escape valve, built 2026-08-17 —
// external-audit Finding 5, operator decision same day). Holds the site's
// self-hosted FILMS only: the .mp4 renditions move here so a 53MB media
// library stops riding every git checkout, CI artifact, and deploy. The
// WebVTT caption files deliberately STAY in the repo (public/media/) —
// they are compliance-screened text and keep their git audit trail, and
// same-origin tracks need no CORS. Served only through Front Door as
// media.needlegirlie.com (frontdoor.bicep); nothing links the raw
// blob hostname.
param location string

// Globally-unique, deterministic across deploys (3–24 lowercase alnum).
var accountName = 'stngmedia${uniqueString(resourceGroup().id)}'

resource account 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: accountName
  location: location
  sku: {
    name: 'Standard_LRS' // marketing copies, replaceable from masters — no geo-redundancy
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    accessTier: 'Hot'
    // Anonymous read on the media container is the serving model (public
    // marketing films; no SAS rotation to operate). Account-level switch:
    allowBlobPublicAccess: true
    allowSharedKeyAccess: true // upload path: az storage blob upload-batch
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: account
  name: 'default'
}

resource mediaContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'media'
  properties: {
    publicAccess: 'Blob' // blob-level anonymous read; no container listing
  }
}

output accountName string = account.name
// 'https://x.blob.core.windows.net/' -> 'x.blob.core.windows.net'
output blobHostname string = replace(replace(account.properties.primaryEndpoints.blob, 'https://', ''), '/', '')
