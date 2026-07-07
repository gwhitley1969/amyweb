// DNS records in the EXISTING needlegirl.com zone (legacy domain) so
// www.needlegirl.com resolves to Front Door, which 301s it to the canonical
// https://needlegirlie.com. Reference the zone, never recreate it.
param zoneName string = 'needlegirl.com'
param endpointHostname string
param wwwValidationToken string

resource zone 'Microsoft.Network/dnsZones@2018-05-01' existing = {
  name: zoneName
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
