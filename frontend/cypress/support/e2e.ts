// Cypress support file for E2E testing
import './commands'

// Global configuration and hooks
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // that might come from the application under test
  console.log('Uncaught exception:', err)
  return false
})

// Set up global test hooks
beforeEach(() => {
  // Clear localStorage and sessionStorage before each test
  cy.clearLocalStorage()
  cy.clearCookies()
})