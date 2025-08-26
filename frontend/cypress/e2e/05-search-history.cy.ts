describe('Search History Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.login()
    cy.waitForWebSocketConnection()
  })

  it('should display search history after making API calls', () => {
    // Make several API calls
    cy.sendChatCommand('get weather Berlin')
    cy.waitForApiResponse('weather')
    
    cy.sendChatCommand('get cat fact')
    cy.waitForApiResponse('catfacts')
    
    cy.sendChatCommand('chuck norris joke')
    cy.waitForApiResponse('chucknorris')
    
    // Check search history card
    cy.get('[data-testid="search-history"]').should('be.visible')
    cy.get('[data-testid="search-history"]').within(() => {
      // Should show recent commands
      cy.contains('get weather Berlin').should('be.visible')
      cy.contains('get cat fact').should('be.visible')
      cy.contains('chuck norris joke').should('be.visible')
    })
  })

  it('should filter search history with global filter', () => {
    // Make API calls
    cy.sendChatCommand('get weather Berlin')
    cy.waitForApiResponse('weather')
    
    cy.sendChatCommand('get weather Paris')
    cy.waitForApiResponse('weather')
    
    cy.sendChatCommand('get cat fact')
    cy.waitForApiResponse('catfacts')
    
    // Use global filter to search for "weather"
    cy.get('[data-testid="global-filter"]').clear().type('weather')
    
    // Search history should show filtered results
    cy.get('[data-testid="search-history"]').within(() => {
      cy.contains('get weather Berlin').should('be.visible')
      cy.contains('get weather Paris').should('be.visible')
      cy.contains('get cat fact').should('not.exist')
    })
  })

  it('should show search history in chronological order (newest first)', () => {
    // Make API calls with delays to ensure different timestamps
    cy.sendChatCommand('get weather Berlin')
    cy.waitForApiResponse('weather')
    
    cy.wait(1000)
    
    cy.sendChatCommand('get cat fact')
    cy.waitForApiResponse('catfacts')
    
    cy.wait(1000)
    
    cy.sendChatCommand('chuck norris joke')
    cy.waitForApiResponse('chucknorris')
    
    // Check order in search history (newest should be first)
    cy.get('[data-testid="search-history"]').within(() => {
      cy.get('[data-testid="history-item"]').first().should('contain', 'chuck norris joke')
      cy.get('[data-testid="history-item"]').eq(1).should('contain', 'get cat fact')
      cy.get('[data-testid="history-item"]').last().should('contain', 'get weather Berlin')
    })
  })

  it('should support pagination in search history', () => {
    // Make many API calls to trigger pagination
    const commands = [
      'get weather Berlin',
      'get weather Paris',
      'get weather London',
      'get cat fact',
      'chuck norris joke',
      'get activity',
      'search github john',
      'get weather Madrid',
      'get weather Rome',
      'get weather Tokyo',
      'get weather Sydney',
      'get weather New York'
    ]
    
    // Send commands (but don't wait for all responses to speed up test)
    commands.forEach(command => {
      cy.sendChatCommand(command)
      cy.wait(500) // Brief wait between commands
    })
    
    // Wait for last command to complete
    cy.waitForApiResponse('weather')
    
    // Check pagination controls in search history
    cy.get('[data-testid="search-history"]').within(() => {
      // Should show pagination controls if more than 10 items
      cy.get('[data-testid="pagination-next"]').should('be.visible')
      cy.get('[data-testid="pagination-info"]').should('contain', 'Page 1')
      
      // Click next page
      cy.get('[data-testid="pagination-next"]').click()
      cy.get('[data-testid="pagination-info"]').should('contain', 'Page 2')
    })
  })

  it('should persist search history across page reloads', () => {
    // Make an API call
    cy.sendChatCommand('get weather Berlin')
    cy.waitForApiResponse('weather')
    
    // Reload page
    cy.reload()
    cy.login()
    cy.waitForWebSocketConnection()
    
    // Search history should still show the command
    cy.get('[data-testid="search-history"]').within(() => {
      cy.contains('get weather Berlin').should('be.visible')
    })
  })
})