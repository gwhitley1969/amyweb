// DNS records in the EXISTING needlegirlie.com zone (BUILD_SPEC §15 — the
// zone lives in rg-corp; reference it, never recreate it).
param zoneName string = 'needlegirlie.com'
param endpointId string
param endpointHostname string
param apexValidationToken string
param wwwValidationToken string
param mediaValidationToken string

resource zone 'Microsoft.Network/dnsZones@2018-05-01' existing = {
  name: zoneName
}

// Apex alias A record -> Front Door endpoint (Azure DNS alias supports apex -> AFD).
resource apexAlias 'Microsoft.Network/dnsZones/A@2018-05-01' = {
  parent: zone
  name: '@'
  properties: {
    TTL: 3600
    targetResource: {
      id: endpointId
    }
  }
}

resource wwwCname 'Microsoft.Network/dnsZones/CNAME@2018-05-01' = {
  parent: zone
  name: 'www'
  properties: {
    TTL: 3600
    CNAMERecord: {
      cname: endpointHostname
    }
  }
}

// Managed-TLS domain validation tokens for the Front Door custom domains.
resource apexAuth 'Microsoft.Network/dnsZones/TXT@2018-05-01' = {
  parent: zone
  name: '_dnsauth'
  properties: {
    TTL: 3600
    TXTRecords: [
      { value: [apexValidationToken] }
    ]
  }
}

resource wwwAuth 'Microsoft.Network/dnsZones/TXT@2018-05-01' = {
  parent: zone
  name: '_dnsauth.www'
  properties: {
    TTL: 3600
    TXTRecords: [
      { value: [wwwValidationToken] }
    ]
  }
}

// Media origin hostname (2026-08-17): the films' stable public host —
// previews and production play the same files (frontdoor.bicep media route).
resource mediaCname 'Microsoft.Network/dnsZones/CNAME@2018-05-01' = {
  parent: zone
  name: 'media'
  properties: {
    TTL: 3600
    CNAMERecord: {
      cname: endpointHostname
    }
  }
}

resource mediaAuth 'Microsoft.Network/dnsZones/TXT@2018-05-01' = {
  parent: zone
  name: '_dnsauth.media'
  properties: {
    TTL: 3600
    TXTRecords: [
      { value: [mediaValidationToken] }
    ]
  }
}
