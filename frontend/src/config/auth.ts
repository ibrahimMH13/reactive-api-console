export const cognitoConfig = {
    authority: import.meta.env.VITE_COGNITO_AUTHORITY,
    client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
    post_logout_redirect_uri: import.meta.env.VITE_COGNITO_LOGOUT_URI,
    response_type: "code",
    scope: import.meta.env.VITE_COGNITO_SCOPE,
    automaticSilentRenew: true,
    includeIdTokenInSilentRenew: true,
  };
  
  export const backendConfig = {
    baseURL: import.meta.env.VITE_BACKEND_URL,
    wsURL: import.meta.env.VITE_WS_URL,
  };
  