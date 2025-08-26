describe('Simple Application Test', () => {
  it('should load the application and show login screen', () => {
    // Visit the application
    cy.visit('/')
    
    // Should show login screen when not authenticated
    cy.get('[data-testid="login-screen"]').should('be.visible')
    
    // Should show the app title
    cy.contains('Reactive API Console').should('be.visible')
    
    // Should show the login button
    cy.get('[data-testid="login-button"]').should('be.visible')
    cy.contains('Sign In with AWS Cognito').should('be.visible')
  })
  
  it('should have proper page title and structure', () => {
    cy.visit('/')
    
    // Check page title (if set)
    cy.title().should('not.be.empty')
    
    // Should have proper login form structure
    cy.get('[data-testid="login-screen"]').within(() => {
      cy.contains('Reactive API Console').should('be.visible')
      cy.contains('Sign in to start chatting with APIs').should('be.visible')
      cy.get('[data-testid="login-button"]').should('be.visible')
    })
  })
  
  it('should be responsive and render properly', () => {
    // Test on desktop
    cy.viewport(1280, 720)
    cy.visit('/')
    cy.get('[data-testid="login-screen"]').should('be.visible')
    
    // Test on mobile
    cy.viewport(375, 667)
    cy.visit('/')
    cy.get('[data-testid="login-screen"]').should('be.visible')
    
    // Test on tablet  
    cy.viewport(768, 1024)
    cy.visit('/')
    cy.get('[data-testid="login-screen"]').should('be.visible')
  })
})