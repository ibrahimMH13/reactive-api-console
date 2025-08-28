import { 
  getCognitoAuthority, 
  getCognitoClientId, 
  getCognitoRedirectUri, 
  getCognitoLogoutUri, 
  getCognitoScope,
  getBackendUrl,
  getWsUrl 
} from '../utils/env';

export const cognitoConfig = {
    authority: getCognitoAuthority(),
    client_id: getCognitoClientId(),
    redirect_uri: getCognitoRedirectUri(),
    post_logout_redirect_uri: getCognitoLogoutUri(),
    response_type: "code",
    scope: getCognitoScope(),
    automaticSilentRenew: true,
    includeIdTokenInSilentRenew: true,
  };
  
  export const backendConfig = {
    baseURL: getBackendUrl(),
    wsURL: getWsUrl(),
  };
  