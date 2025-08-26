describe('Full Application Integration', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.login()
    cy.waitForWebSocketConnection()
  })

  it('should complete a full user workflow', () => {
    // 1. Check initial state
    cy.get('[data-testid="dashboard"]').should('be.visible')
    cy.checkTheme('dark')
    
    // 2. Send multiple commands and verify responses
    cy.sendChatCommand('get weather Berlin')
    cy.waitForApiResponse('weather')
    
    cy.sendChatCommand('get cat fact')
    cy.waitForApiResponse('catfacts')
    
    cy.sendChatCommand('chuck norris joke')
    cy.waitForApiResponse('chucknorris')
    
    // 3. Toggle theme
    cy.get('[data-testid="theme-toggle"]').click()
    cy.checkTheme('light')
    
    // 4. Toggle some APIs off
    cy.toggleApi('weather')
    cy.toggleApi('catfacts')
    
    // 5. Verify APIs are disabled
    cy.get('[data-testid="weather-card"]').should('not.be.visible')
    cy.get('[data-testid="catfacts-card"]').should('not.be.visible')
    
    // 6. Check preferences are synced
    cy.sendChatCommand('get my preferences')
    cy.waitForApiResponse('custom')
    
    cy.get('[data-testid="custom-card"]').within(() => {
      cy.get('[data-testid="api-results"]').should('contain.text', 'light')
      cy.get('[data-testid="api-results"]').should('contain.text', 'weather":false')
      cy.get('[data-testid="api-results"]').should('contain.text', 'catfacts":false')
    })
    
    // 7. Check search history
    cy.get('[data-testid="search-history"]').should('be.visible')
    cy.get('[data-testid="search-history"]').within(() => {
      cy.contains('get my preferences').should('be.visible')
      cy.contains('chuck norris joke').should('be.visible')
      cy.contains('get cat fact').should('be.visible')
      cy.contains('get weather Berlin').should('be.visible')
    })
    
    // 8. Test global filter
    cy.get('[data-testid="global-filter"]').clear().type('weather')
    
    // Should filter both cards and history
    cy.get('[data-testid="search-history"]').within(() => {
      cy.contains('get weather Berlin').should('be.visible')
      cy.contains('get cat fact').should('not.exist')
    })
    
    // 9. Clear filter
    cy.get('[data-testid="global-filter"]').clear()
    
    // 10. Test error handling
    cy.sendChatCommand('invalid command xyz')
    cy.get('[data-testid="custom-card"]', { timeout: 15000 }).within(() => {
      cy.get('[data-testid="error-message"]').should('exist')
    })
    
    // 11. Re-enable APIs
    cy.toggleApi('weather')
    cy.toggleApi('catfacts')
    
    // 12. Verify APIs work again
    cy.get('[data-testid="weather-card"]').should('be.visible')
    cy.get('[data-testid="catfacts-card"]').should('be.visible')
    
    cy.sendChatCommand('get weather London')
    cy.waitForApiResponse('weather')
    
    // 13. Final state check
    cy.checkTheme('light')
    cy.get('[data-testid="weather-card"]').should('be.visible')
    cy.get('[data-testid="catfacts-card"]').should('be.visible')
  })

  it('should handle WebSocket reconnection gracefully', () => {
    // Send initial command
    cy.sendChatCommand('get weather Berlin')
    cy.waitForApiResponse('weather')
    
    // Simulate WebSocket disconnection by reloading
    cy.reload()
    cy.login()
    cy.waitForWebSocketConnection()
    
    // Should be able to send commands again
    cy.sendChatCommand('get cat fact')
    cy.waitForApiResponse('catfacts')
    
    // History should include both commands
    cy.get('[data-testid="search-history"]').within(() => {
      cy.contains('get weather Berlin').should('be.visible')
      cy.contains('get cat fact').should('be.visible')
    })
  })

  it('should maintain state consistency across browser sessions', () => {
    // Set up initial state
    cy.get('[data-testid="theme-toggle"]').click() // Switch to light
    cy.toggleApi('weather') // Disable weather
    
    cy.sendChatCommand('get cat fact')
    cy.waitForApiResponse('catfacts')
    
    // Simulate closing and reopening browser
    cy.clearCookies()
    cy.visit('/')
    cy.login()
    cy.waitForWebSocketConnection()
    
    // State should be preserved
    cy.checkTheme('light')
    cy.get('[data-testid="weather-card"]').should('not.be.visible')
    cy.get('[data-testid="catfacts-card"]').should('be.visible')
    
    // History should be preserved
    cy.get('[data-testid="search-history"]').within(() => {
      cy.contains('get cat fact').should('be.visible')
    })
  })
})