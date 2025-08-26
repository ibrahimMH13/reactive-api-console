describe('Theme Toggle Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.login()
  })

  it('should start with dark theme by default', () => {
    // Should start with dark theme
    cy.checkTheme('dark')
  })

  it('should toggle between light and dark themes', () => {
    // Start with dark theme
    cy.checkTheme('dark')
    
    // Toggle to light theme
    cy.get('[data-testid="theme-toggle"]').click()
    cy.checkTheme('light')
    
    // Toggle back to dark theme
    cy.get('[data-testid="theme-toggle"]').click()
    cy.checkTheme('dark')
  })

  it('should persist theme across page reloads', () => {
    // Toggle to light theme
    cy.get('[data-testid="theme-toggle"]').click()
    cy.checkTheme('light')
    
    // Reload page
    cy.reload()
    cy.login()
    
    // Should still be light theme
    cy.checkTheme('light')
  })

  it('should apply theme to all components', () => {
    // Check that theme affects various components
    
    // Start with dark theme
    cy.checkTheme('dark')
    
    // Verify dark theme on key components
    cy.get('[data-testid="sidebar"]').should('have.class', 'dark:bg-slate-800/50')
    cy.get('[data-testid="chat-input"]').should('have.css', 'background-color').and('not.equal', 'rgb(255, 255, 255)')
    
    // Toggle to light theme
    cy.get('[data-testid="theme-toggle"]').click()
    cy.checkTheme('light')
    
    // Verify light theme components look different
    cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)')
  })

  it('should sync theme with backend preferences', () => {
    // Toggle theme
    cy.get('[data-testid="theme-toggle"]').click()
    cy.checkTheme('light')
    
    // Wait a moment for sync
    cy.wait(2000)
    
    // Send preferences command to verify theme was synced
    cy.waitForWebSocketConnection()
    cy.sendChatCommand('get my preferences')
    
    cy.waitForApiResponse('custom')
    
    // Verify response contains light theme
    cy.get('[data-testid="custom-card"]').within(() => {
      cy.get('[data-testid="api-results"]').should('contain.text', 'light')
    })
  })
})