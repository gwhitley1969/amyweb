// Subscription budget with alerts (BUILD_SPEC §15) — the client is billed
// directly by Microsoft; alerts protect her from surprises.
targetScope = 'subscription'

param contactEmails array
param monthlyAmount int = 60
// IMMUTABLE after creation (learned 2026-08-17: the Consumption API
// rejects startDate updates — "delete and create a new budget"). The
// live budget anchors at 2026-07-01; every re-deploy must pass that
// same date. Only a brand-new budget takes a new first-of-month date.
param startDate string // yyyy-MM-01 — the EXISTING budget's own start date

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
