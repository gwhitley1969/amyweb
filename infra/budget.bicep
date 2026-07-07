// Subscription budget with alerts (BUILD_SPEC §15) — the client is billed
// directly by Microsoft; alerts protect her from surprises.
targetScope = 'subscription'

param contactEmails array
param monthlyAmount int = 60
param startDate string // first day of the current month, yyyy-MM-01

resource budget 'Microsoft.Consumption/budgets@2023-11-01' = {
  name: 'budget-ng-website'
  properties: {
    category: 'Cost'
    amount: monthlyAmount
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: startDate
    }
    notifications: {
      actual50: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 50
        thresholdType: 'Actual'
        contactEmails: contactEmails
      }
      actual80: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        thresholdType: 'Actual'
        contactEmails: contactEmails
      }
      forecast100: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Forecasted'
        contactEmails: contactEmails
      }
    }
  }
}
