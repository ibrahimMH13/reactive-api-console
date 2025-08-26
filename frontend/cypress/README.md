# Cypress E2E Testing for Reactive API Console

This directory contains end-to-end tests for the Reactive API Console application using Cypress.

## Test Structure

### Test Files
- `01-authentication.cy.ts` - Authentication flow tests
- `02-chat-commands.cy.ts` - API command testing 
- `03-api-toggles.cy.ts` - API enable/disable functionality
- `04-theme-toggle.cy.ts` - Dark/light theme switching
- `05-search-history.cy.ts` - Search history and filtering
- `06-integration.cy.ts` - Full application integration tests

### Support Files
- `support/commands.ts` - Custom Cypress commands
- `support/e2e.ts` - Global configuration and hooks

### Fixtures
- `fixtures/api-responses.json` - Mock API response data
- `fixtures/user-data.json` - Mock user and authentication data

## Running Tests

### Prerequisites
1. Backend server must be running on `http://localhost:3000`
2. Frontend development server must be running on `http://localhost:5173`

### Commands

```bash
# Open Cypress Test Runner (interactive mode)
yarn cypress:open
# or
yarn test:e2e:open

# Run all tests headlessly (CI mode)
yarn cypress:run
# or 
yarn test:e2e

# Run specific test file
yarn cypress:run --spec "cypress/e2e/02-chat-commands.cy.ts"

# Run tests with specific browser
yarn cypress:run --browser chrome
```

## Test Features

### Custom Commands
- `cy.login()` - Mock user authentication
- `cy.waitForWebSocketConnection()` - Wait for WebSocket to connect
- `cy.sendChatCommand(command)` - Send command through chat input
- `cy.waitForApiResponse(apiName)` - Wait for API response card
- `cy.toggleApi(apiName)` - Toggle API in sidebar
- `cy.checkTheme(theme)` - Verify light/dark theme

### Test Coverage
- ✅ User authentication flow
- ✅ WebSocket connection establishment  
- ✅ API command processing (weather, cat facts, Chuck Norris, etc.)
- ✅ API enable/disable toggles
- ✅ Theme switching (light/dark)
- ✅ Search history functionality
- ✅ Global filtering
- ✅ Error handling
- ✅ State persistence across page reloads
- ✅ Full application integration workflows

### Mock Authentication
Tests use mocked OIDC authentication to avoid requiring real authentication servers. The mock sets up:
- Access tokens in localStorage
- User profile data
- Theme and API preferences

## Configuration

### Browser Support
- Chrome (default)
- Firefox  
- Edge
- Electron (headless)

### Viewport
- Default: 1280x720
- Configurable in `cypress.config.ts`

### Timeouts
- Default command timeout: 10s
- Request timeout: 15s
- Response timeout: 15s

## Best Practices

1. **Test Isolation** - Each test starts with a clean state
2. **Mock Authentication** - Use `cy.login()` instead of real auth
3. **Wait for WebSocket** - Always call `cy.waitForWebSocketConnection()` before sending commands
4. **Use data-testid** - Tests rely on `data-testid` attributes for element selection
5. **Verify Responses** - Always verify API responses contain expected data
6. **Test Edge Cases** - Include error scenarios and invalid inputs

## Debugging

### Screenshots and Videos
- Screenshots captured on test failures
- Videos recorded for all test runs
- Located in `cypress/screenshots/` and `cypress/videos/`

### Debug Mode
```bash
# Open Cypress with Chrome DevTools
yarn cypress:open --browser chrome

# Run with debug output
DEBUG=cypress:* yarn cypress:run
```

### Common Issues
1. **WebSocket Connection** - Ensure backend is running before tests
2. **Timing Issues** - Use proper waits instead of hard `cy.wait()`
3. **Authentication** - Verify mock authentication data is correct
4. **Element Selection** - Use `data-testid` attributes consistently