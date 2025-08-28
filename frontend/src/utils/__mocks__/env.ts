// Mock for env utility during testing
export const getBackendUrl = jest.fn(() => 'http://localhost:3000');
export const getWsUrl = jest.fn(() => 'http://localhost:3000');
export const getCognitoAuthority = jest.fn(() => 'https://test-cognito.amazonaws.com');
export const getCognitoClientId = jest.fn(() => 'test-client-id');
export const getCognitoRedirectUri = jest.fn(() => 'http://localhost:5173/callback');
export const getCognitoLogoutUri = jest.fn(() => 'http://localhost:5173/logout');
export const getCognitoScope = jest.fn(() => 'openid profile email');
export const getCognitoDomain = jest.fn(() => 'https://test-cognito-domain.auth.us-east-1.amazoncognito.com');