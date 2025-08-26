// Custom Cypress commands for the Reactive API Console

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login to the application using OIDC
       */
      login(): Chainable<void>
      
      /**
       * Wait for WebSocket connection to be established
       */
      waitForWebSocketConnection(): Chainable<void>
      
      /**
       * Send a command through the chat input
       * @param command - The command to send
       */
      sendChatCommand(command: string): Chainable<void>
      
      /**
       * Wait for API response card to appear
       * @param apiName - The API name (weather, catfacts, etc.)
       */
      waitForApiResponse(apiName: string): Chainable<void>
      
      /**
       * Toggle an API on/off in the sidebar
       * @param apiName - The API name to toggle
       */
      toggleApi(apiName: string): Chainable<void>
      
      /**
       * Check if theme toggle works
       * @param expectedTheme - 'light' or 'dark'
       */
      checkTheme(expectedTheme: 'light' | 'dark'): Chainable<void>
    }
  }
}

// Mock authentication for testing
Cypress.Commands.add('login', () => {
  // Mock the OIDC authentication process
  cy.window().then((win) => {
    // Set mock user data in localStorage/sessionStorage
    win.localStorage.setItem('oidc.user:http://localhost:3000/auth:reactive-api-console', JSON.stringify({
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_at: Date.now() + 3600000, // 1 hour from now
      profile: {
        sub: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User'
      }
    }))
    
    // Mock theme preference
    win.localStorage.setItem('theme', 'dark')
    
    // Mock API preferences
    win.localStorage.setItem('activeApis', JSON.stringify(['weather', 'catfacts', 'github', 'chucknorris', 'bored', 'custom']))
  })
  
  cy.reload()
  cy.get('[data-testid="dashboard"]', { timeout: 10000 }).should('be.visible')
})

Cypress.Commands.add('waitForWebSocketConnection', () => {
  // Wait for WebSocket connection indicator or successful connection
  cy.get('[data-testid="chat-input"]', { timeout: 15000 }).should('not.have.attr', 'disabled')
  cy.get('[placeholder*="Connecting"]').should('not.exist')
})

Cypress.Commands.add('sendChatCommand', (command: string) => {
  cy.get('[data-testid="chat-input"]').should('be.visible').clear().type(command)
  cy.get('[data-testid="chat-submit"]').click()
})

Cypress.Commands.add('waitForApiResponse', (apiName: string) => {
  // Wait for the API response to appear in the corresponding card
  cy.get(`[data-testid="${apiName}-card"]`, { timeout: 15000 })
    .should('be.visible')
    .within(() => {
      // Should not be loading
      cy.get('[data-testid="loading-indicator"]').should('not.exist')
      // Should have results or error
      cy.get('[data-testid="api-results"], [data-testid="error-message"]').should('exist')
    })
})

Cypress.Commands.add('toggleApi', (apiName: string) => {
  // Toggle API in the sidebar
  cy.get('[data-testid="sidebar"]').within(() => {
    cy.get(`[data-testid="api-toggle-${apiName}"]`).click()
  })
})

Cypress.Commands.add('checkTheme', (expectedTheme: 'light' | 'dark') => {
  if (expectedTheme === 'dark') {
    cy.get('html').should('have.class', 'dark')
    cy.get('body').should('have.css', 'background-color').and('not.equal', 'rgb(255, 255, 255)')
  } else {
    cy.get('html').should('not.have.class', 'dark')
    cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)')
  }
})

export {}