// DNS records in the EXISTING needlegirl.com zone (legacy domain) so
// needlegirl.com and www.needlegirl.com resolve to Front Door, which 301s
// them to the canonical https://needlegirlie.com. Reference the zone,
// never recreate it.
param zoneName string = 'needlegirl.com'
param endpointId string
param endpointHostname string
param wwwValidationToken string
param apexValidationToken string

resource zone 'Microsoft.Network/dnsZones@2018-05-01' existing = {
  name: zoneName
}

// Apex alias A record -> Front Door endpoint.
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

// Managed-TLS domain validation token for the Front Door custom domain.
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
