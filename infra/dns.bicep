// DNS records in the EXISTING needlegirlie.com zone (BUILD_SPEC §15 — the
// zone lives in rg-corp; reference it, never recreate it).
param zoneName string = 'needlegirlie.com'
param endpointId string
param endpointHostname string
param apexValidationToken string
param wwwValidationToken string
param mediaValidationToken string
param apiValidationToken string
param loginValidationToken string

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

// API hostname (2026-09, the app's Phase A): api.needlegirlie.com -> Front Door.
resource apiCname 'Microsoft.Network/dnsZones/CNAME@2018-05-01' = {
  parent: zone
  name: 'api'
  properties: { TTL: 3600, CNAMERecord: { cname: endpointHostname } }
}

resource apiAuth 'Microsoft.Network/dnsZones/TXT@2018-05-01' = {
  parent: zone
  name: '_dnsauth.api'
  properties: { TTL: 3600, TXTRecords: [{ value: [apiValidationToken] }] }
}

// Sign-in hostname (2026-09-06): login.needlegirlie.com -> Front Door -> the
// external tenant. Entra's ownership TXT lives at `login` itself, and a CNAME
// cannot share a name with any other record, so that TXT is added by hand,
// verified, and DELETED (Task 6 §7) BEFORE this CNAME is deployed.
resource loginCname 'Microsoft.Network/dnsZones/CNAME@2018-05-01' = {
  parent: zone
  name: 'login'
  properties: { TTL: 3600, CNAMERecord: { cname: endpointHostname } }
}

resource loginAuth 'Microsoft.Network/dnsZones/TXT@2018-05-01' = {
  parent: zone
  name: '_dnsauth.login'
  properties: { TTL: 3600, TXTRecords: [{ value: [loginValidationToken] }] }
}
