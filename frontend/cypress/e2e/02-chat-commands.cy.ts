describe('Chat Commands', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.login()
    cy.waitForWebSocketConnection()
  })

  it('should send weather command and receive response', () => {
    // Send weather command
    cy.sendChatCommand('get weather Berlin')
    
    // Wait for response in weather card
    cy.waitForApiResponse('weather')
    
    // Verify response contains weather data
    cy.get('[data-testid="weather-card"]').within(() => {
      cy.get('[data-testid="api-results"]').should('contain', 'Berlin')
      cy.get('[data-testid="api-results"]').should('contain', 'temperature')
    })
  })

  it('should send cat fact command and receive response', () => {
    // Send cat fact command
    cy.sendChatCommand('get cat fact')
    
    // Wait for response in catfacts card
    cy.waitForApiResponse('catfacts')
    
    // Verify response contains fact data
    cy.get('[data-testid="catfacts-card"]').within(() => {
      cy.get('[data-testid="api-results"]').should('exist')
      cy.get('[data-testid="api-results"]').should('contain.text', 'fact')
    })
  })

  it('should send chuck norris command and receive response', () => {
    // Send chuck norris command
    cy.sendChatCommand('chuck norris joke')
    
    // Wait for response in chucknorris card
    cy.waitForApiResponse('chucknorris')
    
    // Verify response contains joke data
    cy.get('[data-testid="chucknorris-card"]').within(() => {
      cy.get('[data-testid="api-results"]').should('exist')
      cy.get('[data-testid="api-results"]').should('contain.text', 'joke')
    })
  })

  it('should send activity command and receive response', () => {
    // Send activity command
    cy.sendChatCommand('get activity')
    
    // Wait for response in bored card
    cy.waitForApiResponse('bored')
    
    // Verify response contains activity data
    cy.get('[data-testid="bored-card"]').within(() => {
      cy.get('[data-testid="api-results"]').should('exist')
      cy.get('[data-testid="api-results"]').should('contain.text', 'activity')
    })
  })

  it('should send github search command and receive response', () => {
    // Send github search command
    cy.sendChatCommand('search github john')
    
    // Wait for response in github card
    cy.waitForApiResponse('github')
    
    // Verify response contains user data
    cy.get('[data-testid="github-card"]').within(() => {
      cy.get('[data-testid="api-results"]').should('exist')
    })
  })

  it('should send preferences command and receive response', () => {
    // Send preferences command
    cy.sendChatCommand('get my preferences')
    
    // Wait for response in custom card
    cy.waitForApiResponse('custom')
    
    // Verify response contains preferences data
    cy.get('[data-testid="custom-card"]').within(() => {
      cy.get('[data-testid="api-results"]').should('exist')
      cy.get('[data-testid="api-results"]').should('contain.text', 'theme')
    })
  })

  it('should handle invalid commands gracefully', () => {
    // Send invalid command
    cy.sendChatCommand('invalid command that does not exist')
    
    // Should show error in custom card (unknown commands go to custom)
    cy.get('[data-testid="custom-card"]', { timeout: 15000 }).within(() => {
      cy.get('[data-testid="error-message"]').should('exist')
      cy.get('[data-testid="error-message"]').should('contain.text', 'Unknown command')
    })
  })
})