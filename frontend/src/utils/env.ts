// Environment variable utility to abstract import.meta.env
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof window === 'undefined') {
    // During testing or SSR
    return process.env[key] || defaultValue;
  }
  return (import.meta.env as any)[key] || defaultValue;
};

export const getBackendUrl = (): string => {
  return getEnvVar('VITE_BACKEND_URL', 'http://localhost:3000');
};

export const getWsUrl = (): string => {
  return getEnvVar('VITE_WS_URL', 'http://localhost:3000');
};

export const getCognitoAuthority = (): string => {
  return getEnvVar('VITE_COGNITO_AUTHORITY', '');
};

export const getCognitoClientId = (): string => {
  return getEnvVar('VITE_COGNITO_CLIENT_ID', '');
};

export const getCognitoRedirectUri = (): string => {
  return getEnvVar('VITE_COGNITO_REDIRECT_URI', '');
};

export const getCognitoLogoutUri = (): string => {
  return getEnvVar('VITE_COGNITO_LOGOUT_URI', '');
};

export const getCognitoScope = (): string => {
  return getEnvVar('VITE_COGNITO_SCOPE', 'openid profile email');
};

export const getCognitoDomain = (): string => {
  return getEnvVar('VITE_COGNITO_DOMAIN', '');
};