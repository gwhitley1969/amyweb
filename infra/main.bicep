// Orchestrates the needlegirlie.com website infrastructure (BUILD_SPEC §15).
// Deploy:  az deployment sub create --location <region> --template-file infra/main.bicep \
//            --parameters previewPassword=<secret> budgetStartDate=yyyy-MM-01
// Region note: {{AZURE_REGION}} was unset at first deploy; eastus2 chosen as
// the closest SWA region to the Charlotte market (see docs/DECISIONS.md).
targetScope = 'subscription'

param location string = 'eastus2'
param dnsZoneResourceGroup string = 'rg-corp'

@secure()
param previewPassword string

param budgetContactEmails array = ['genewhitley2017@gmail.com']
param budgetStartDate string

resource rg 'Microsoft.Resources/resourceGroups@2022-09-01' = {
  name: 'rg-needlegirlie-web'
  location: location
}

module swa 'swa.bicep' = {
  scope: rg
  name: 'swa'
  params: {
    location: location
    previewPassword: previewPassword
  }
}

module frontdoor 'frontdoor.bicep' = {
  scope: rg
  name: 'frontdoor'
  params: {
    swaDefaultHostname: swa.outputs.defaultHostname
  }
}

module dns 'dns.bicep' = {
  scope: resourceGroup(dnsZoneResourceGroup)
  name: 'dns'
  params: {
    endpointId: frontdoor.outputs.endpointId
    endpointHostname: frontdoor.outputs.endpointHostname
    apexValidationToken: frontdoor.outputs.apexValidationToken
    wwwValidationToken: frontdoor.outputs.wwwValidationToken
  }
}

module dnsNeedlegirl 'dns-needlegirl.bicep' = {
  scope: resourceGroup(dnsZoneResourceGroup)
  name: 'dns-needlegirl'
  params: {
    endpointHostname: frontdoor.outputs.endpointHostname
    wwwValidationToken: frontdoor.outputs.legacyWwwValidationToken
  }
}

module budget 'budget.bicep' = {
  name: 'budget'
  params: {
    contactEmails: budgetContactEmails
    startDate: budgetStartDate
  }
}

output resourceGroupName string = rg.name
output swaDefaultHostname string = swa.outputs.defaultHostname
output frontDoorId string = frontdoor.outputs.frontDoorId
output frontDoorProfile string = frontdoor.outputs.profileName
output frontDoorEndpoint string = frontdoor.outputs.endpointName
output endpointHostname string = frontdoor.outputs.endpointHostname
