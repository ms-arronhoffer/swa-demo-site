@description('Location for all resources')
param location string = resourceGroup().location

@description('Name prefix used for all resources')
param appName string = 'demosite'

@description('GitHub repo URL for SWA (e.g. https://github.com/org/repo)')
param githubRepoUrl string = ''

@description('GitHub repo branch to deploy from')
param githubBranch string = 'main'

// ── Storage Account (Functions host) ────────────────────────────────────────
resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${appName}${uniqueString(resourceGroup().id)}'
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

// ── Cosmos DB (Serverless, no free tier) ────────────────────────────────────
resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2024-02-15-preview' = {
  name: '${appName}-cosmos-${uniqueString(resourceGroup().id)}'
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    capabilities: [
      { name: 'EnableServerless' }
    ]
  }
}

resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-02-15-preview' = {
  parent: cosmos
  name: 'demosite'
  properties: {
    resource: { id: 'demosite' }
  }
}

resource cosmosContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-02-15-preview' = {
  parent: cosmosDatabase
  name: 'demos'
  properties: {
    resource: {
      id: 'demos'
      partitionKey: {
        paths: ['/category']
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
        includedPaths: [{ path: '/*' }]
      }
    }
  }
}

// ── App Service Plan (Linux B1 — avoids Consumption quota restrictions) ──────
resource hostingPlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${appName}-plan'
  location: location
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

// ── Function App (Python 3.11, Linux) ───────────────────────────────────────
var storageConnString = 'DefaultEndpointsProtocol=https;AccountName=${storage.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storage.listKeys().keys[0].value}'
var cosmosConnString = cosmos.listConnectionStrings().connectionStrings[0].connectionString

resource functionApp 'Microsoft.Web/sites@2023-01-01' = {
  name: '${appName}-api-${uniqueString(resourceGroup().id)}'
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: hostingPlan.id
    siteConfig: {
      linuxFxVersion: 'Python|3.11'
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: storageConnString
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'python'
        }
        {
          name: 'COSMOS_CONNECTION_STRING'
          value: cosmosConnString
        }
        {
          name: 'COSMOS_DATABASE'
          value: 'demosite'
        }
        {
          name: 'COSMOS_CONTAINER'
          value: 'demos'
        }
      ]
      cors: {
        allowedOrigins: ['https://portal.azure.com']
      }
    }
    httpsOnly: true
  }
}

// ── Azure Static Web App ─────────────────────────────────────────────────────
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: '${appName}-swa'
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    repositoryUrl: githubRepoUrl != '' ? githubRepoUrl : null
    branch: githubBranch
    buildProperties: {
      appLocation: 'frontend'
      outputLocation: 'dist'
      apiLocation: ''
    }
  }
}

// ── Link Function App as SWA backend ────────────────────────────────────────
resource swaBackend 'Microsoft.Web/staticSites/linkedBackends@2023-01-01' = {
  parent: staticWebApp
  name: 'backend'
  properties: {
    backendResourceId: functionApp.id
    region: location
  }
}

// ── Outputs ──────────────────────────────────────────────────────────────────
output swaHostname string = staticWebApp.properties.defaultHostname
output functionAppName string = functionApp.name
output cosmosAccountName string = cosmos.name
output storageAccountName string = storage.name
