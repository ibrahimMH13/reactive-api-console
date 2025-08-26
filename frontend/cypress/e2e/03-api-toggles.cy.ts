describe('API Toggle Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.login()
    cy.waitForWebSocketConnection()
  })

  it('should toggle weather API on/off', () => {
    // Initially weather should be enabled
    cy.get('[data-testid="weather-card"]').should('be.visible')
    
    // Toggle weather API off
    cy.toggleApi('weather')
    
    // Weather card should be hidden/disabled
    cy.get('[data-testid="weather-card"]').should('not.be.visible')
    
    // Toggle weather API back on
    cy.toggleApi('weather')
    
    // Weather card should be visible again
    cy.get('[data-testid="weather-card"]').should('be.visible')
  })

  it('should toggle cat facts API on/off', () => {
    // Initially catfacts should be enabled
    cy.get('[data-testid="catfacts-card"]').should('be.visible')
    
    // Toggle catfacts API off
    cy.toggleApi('catfacts')
    
    // Cat facts card should be hidden/disabled
    cy.get('[data-testid="catfacts-card"]').should('not.be.visible')
    
    // Toggle catfacts API back on
    cy.toggleApi('catfacts')
    
    // Cat facts card should be visible again
    cy.get('[data-testid="catfacts-card"]').should('be.visible')
  })

  it('should persist API toggle state across page reloads', () => {
    // Toggle weather API off
    cy.toggleApi('weather')
    cy.get('[data-testid="weather-card"]').should('not.be.visible')
    
    // Reload page
    cy.reload()
    cy.waitForWebSocketConnection()
    
    // Weather API should still be off
    cy.get('[data-testid="weather-card"]').should('not.be.visible')
    
    // Toggle weather API back on
    cy.toggleApi('weather')
    cy.get('[data-testid="weather-card"]').should('be.visible')
  })

  it('should disable commands for toggled off APIs', () => {
    // Toggle weather API off
    cy.toggleApi('weather')
    
    // Try to send weather command
    cy.sendChatCommand('get weather Berlin')
    
    // Should not receive response in weather card since it's disabled
    cy.get('[data-testid="weather-card"]').should('not.be.visible')
    
    // May receive error or no response
    cy.wait(5000) // Wait a bit to ensure no response comes through
  })

  it('should allow toggling multiple APIs', () => {
    // Toggle multiple APIs off
    cy.toggleApi('weather')
    cy.toggleApi('catfacts')
    cy.toggleApi('github')
    
    // Verify all are hidden
    cy.get('[data-testid="weather-card"]').should('not.be.visible')
    cy.get('[data-testid="catfacts-card"]').should('not.be.visible')
    cy.get('[data-testid="github-card"]').should('not.be.visible')
    
    // Chuck Norris and Bored should still be visible
    cy.get('[data-testid="chucknorris-card"]').should('be.visible')
    cy.get('[data-testid="bored-card"]').should('be.visible')
    
    // Toggle them back on
    cy.toggleApi('weather')
    cy.toggleApi('catfacts')
    cy.toggleApi('github')
    
    // Verify all are visible again
    cy.get('[data-testid="weather-card"]').should('be.visible')
    cy.get('[data-testid="catfacts-card"]').should('be.visible')
    cy.get('[data-testid="github-card"]').should('be.visible')
  })
})