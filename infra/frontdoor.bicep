// Azure Front Door (Standard) — edge for needlegirlie.com (BUILD_SPEC §2, §15).
// Managed TLS, HTTPS redirect, www -> apex 301, edge cache + compression.
// No WAF ({{WAF_DECISION}} open); no /api routes (v1 has no API).
// Since 2026-08-17 also fronts the media origin: media.needlegirlie.com
// -> Blob (storage.bicep), its own route + origin group on this same
// endpoint. The stable hostname is deliberate — PR previews play the
// same films production does (docs/REDESIGN.md media-origin record).
param swaDefaultHostname string
param mediaOriginHostname string

var apexHost = 'needlegirlie.com'
var wwwHost = 'www.needlegirlie.com'
var mediaHost = 'media.needlegirlie.com'
// Legacy domain Amy owns; both hosts redirect to the canonical apex
// (BUILD_SPEC §2).
var legacyWwwHost = 'www.needlegirl.com'
var legacyApexHost = 'needlegirl.com'

resource profile 'Microsoft.Cdn/profiles@2024-02-01' = {
  name: 'afd-needlegirlie'
  location: 'global'
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
}

resource endpoint 'Microsoft.Cdn/profiles/afdEndpoints@2024-02-01' = {
  parent: profile
  name: 'needlegirlie'
  location: 'global'
  properties: {
    enabledState: 'Enabled'
  }
}

resource originGroup 'Microsoft.Cdn/profiles/originGroups@2024-02-01' = {
  parent: profile
  name: 'og-swa'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    // Single origin: no health probe (avoids pointless probe traffic).
  }
}

resource origin 'Microsoft.Cdn/profiles/originGroups/origins@2024-02-01' = {
  parent: originGroup
  name: 'swa'
  properties: {
    hostName: swaDefaultHostname
    originHostHeader: swaDefaultHostname
    httpPort: 80
    httpsPort: 443
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
    enforceCertificateNameCheck: true
  }
}

resource apexDomain 'Microsoft.Cdn/profiles/customDomains@2024-02-01' = {
  parent: profile
  name: 'apex-needlegirlie-com'
  properties: {
    hostName: apexHost
    tlsSettings: {
      certificateType: 'ManagedCertificate'
      minimumTlsVersion: 'TLS12'
    }
  }
}

resource wwwDomain 'Microsoft.Cdn/profiles/customDomains@2024-02-01' = {
  parent: profile
  name: 'www-needlegirlie-com'
  properties: {
    hostName: wwwHost
    tlsSettings: {
      certificateType: 'ManagedCertificate'
      minimumTlsVersion: 'TLS12'
    }
  }
}

resource legacyWwwDomain 'Microsoft.Cdn/profiles/customDomains@2024-02-01' = {
  parent: profile
  name: 'www-needlegirl-com'
  properties: {
    hostName: legacyWwwHost
    tlsSettings: {
      certificateType: 'ManagedCertificate'
      minimumTlsVersion: 'TLS12'
    }
  }
}

resource legacyApexDomain 'Microsoft.Cdn/profiles/customDomains@2024-02-01' = {
  parent: profile
  name: 'apex-needlegirl-com'
  properties: {
    hostName: legacyApexHost
    tlsSettings: {
      certificateType: 'ManagedCertificate'
      minimumTlsVersion: 'TLS12'
    }
  }
}

resource mediaDomain 'Microsoft.Cdn/profiles/customDomains@2024-02-01' = {
  parent: profile
  name: 'media-needlegirlie-com'
  properties: {
    hostName: mediaHost
    tlsSettings: {
      certificateType: 'ManagedCertificate'
      minimumTlsVersion: 'TLS12'
    }
  }
}

resource mediaOriginGroup 'Microsoft.Cdn/profiles/originGroups@2024-02-01' = {
  parent: profile
  name: 'og-media'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    // Single origin: no health probe (mirrors og-swa).
  }
}

resource mediaOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2024-02-01' = {
  parent: mediaOriginGroup
  name: 'blob-media'
  properties: {
    hostName: mediaOriginHostname
    originHostHeader: mediaOriginHostname
    httpPort: 80
    httpsPort: 443
    priority: 1
    weight: 1000
    enabledState: 'Enabled'
    enforceCertificateNameCheck: true
  }
}

// www -> apex 301 (apex is canonical, BUILD_SPEC §2).
resource ruleSet 'Microsoft.Cdn/profiles/ruleSets@2024-02-01' = {
  parent: profile
  name: 'redirects'
}

resource wwwToApex 'Microsoft.Cdn/profiles/ruleSets/rules@2024-02-01' = {
  parent: ruleSet
  name: 'wwwtoapex'
  properties: {
    order: 1
    matchProcessingBehavior: 'Stop'
    conditions: [
      {
        name: 'HostName'
        parameters: {
          typeName: 'DeliveryRuleHostNameConditionParameters'
          operator: 'Equal'
          matchValues: [wwwHost]
          transforms: ['Lowercase']
        }
      }
    ]
    actions: [
      {
        name: 'UrlRedirect'
        parameters: {
          typeName: 'DeliveryRuleUrlRedirectActionParameters'
          redirectType: 'Moved'
          destinationProtocol: 'Https'
          customHostname: apexHost
        }
      }
    ]
  }
}

resource legacyWwwToApex 'Microsoft.Cdn/profiles/ruleSets/rules@2024-02-01' = {
  parent: ruleSet
  name: 'needlegirlwwwtoapex'
  dependsOn: [wwwToApex] // rules in a set must be created serially
  properties: {
    order: 2
    matchProcessingBehavior: 'Stop'
    conditions: [
      {
        name: 'HostName'
        parameters: {
          typeName: 'DeliveryRuleHostNameConditionParameters'
          operator: 'Equal'
          matchValues: [legacyWwwHost, legacyApexHost]
          transforms: ['Lowercase']
        }
      }
    ]
    actions: [
      {
        name: 'UrlRedirect'
        parameters: {
          typeName: 'DeliveryRuleUrlRedirectActionParameters'
          redirectType: 'Moved'
          destinationProtocol: 'Https'
          customHostname: apexHost
        }
      }
    ]
  }
}

resource route 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = {
  parent: endpoint
  name: 'default'
  dependsOn: [origin]
  properties: {
    originGroup: {
      id: originGroup.id
    }
    supportedProtocols: ['Http', 'Https']
    patternsToMatch: ['/*']
    forwardingProtocol: 'HttpsOnly'
    httpsRedirect: 'Enabled' // HTTP -> HTTPS at the edge
    linkToDefaultDomain: 'Enabled'
    customDomains: [
      { id: apexDomain.id }
      { id: wwwDomain.id }
      { id: legacyWwwDomain.id }
      { id: legacyApexDomain.id }
    ]
    ruleSets: [
      { id: ruleSet.id }
    ]
    cacheConfiguration: {
      queryStringCachingBehavior: 'UseQueryString'
      compressionSettings: {
        isCompressionEnabled: true
        contentTypesToCompress: [
          'text/html'
          'text/css'
          'text/plain'
          'text/xml'
          'text/javascript'
          'application/javascript'
          'application/x-javascript'
          'application/json'
          'application/xml'
          'application/rss+xml'
          'image/svg+xml'
          'font/woff2'
        ]
      }
    }
  }
}

// Media route: bound ONLY to media.needlegirlie.com — same '/*' pattern as
// 'default' is legal because the domain sets are disjoint, and
// linkToDefaultDomain stays Disabled so the two routes never both claim
// the *.azurefd.net hostname. originPath maps the clean public URL
// (media.needlegirlie.com/film.mp4) onto the 'media' container. No
// compression settings: mp4 is already compressed, and the .vtt captions
// are served same-origin from SWA, not from here.
resource mediaRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2024-02-01' = {
  parent: endpoint
  name: 'media'
  dependsOn: [mediaOrigin]
  properties: {
    originGroup: {
      id: mediaOriginGroup.id
    }
    originPath: '/media'
    supportedProtocols: ['Http', 'Https']
    patternsToMatch: ['/*']
    forwardingProtocol: 'HttpsOnly'
    httpsRedirect: 'Enabled'
    linkToDefaultDomain: 'Disabled'
    customDomains: [
      { id: mediaDomain.id }
    ]
    cacheConfiguration: {
      queryStringCachingBehavior: 'IgnoreQueryString'
    }
  }
}

output frontDoorId string = profile.properties.frontDoorId
output profileName string = profile.name
output endpointName string = endpoint.name
output endpointHostname string = endpoint.properties.hostName
output endpointId string = endpoint.id
output apexValidationToken string = apexDomain.properties.validationProperties.validationToken
output wwwValidationToken string = wwwDomain.properties.validationProperties.validationToken
output legacyWwwValidationToken string = legacyWwwDomain.properties.validationProperties.validationToken
output legacyApexValidationToken string = legacyApexDomain.properties.validationProperties.validationToken
output mediaValidationToken string = mediaDomain.properties.validationProperties.validationToken
