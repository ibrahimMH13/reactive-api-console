import { useAuth as useOidcAuth } from 'react-oidc-context';
import { getCognitoClientId, getCognitoLogoutUri, getCognitoDomain } from '../utils/env';

export const useAuth = () => {
  const auth = useOidcAuth();

  const signOut = () => {
    const clientId = getCognitoClientId();
    const logoutUri = getCognitoLogoutUri();
    const cognitoDomain = getCognitoDomain();
    
    // First remove user from OIDC context
    auth.removeUser();
    
    // Then redirect to Cognito logout
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const getAccessToken = () => {
    return auth.user?.access_token || null;
  };

  const getIdToken = () => {
    return auth.user?.id_token || null;
  };

  const getUserInfo = () => {
    if (!auth.user) return null;
    
    return {
      id: auth.user.profile.sub || '',
      email: auth.user.profile.email || '',
      name: auth.user.profile.name || auth.user.profile.given_name || '',
      emailVerified: auth.user.profile.email_verified || false,
    };
  };

  return {
    // Original auth properties
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    error: auth.error,
    user: auth.user,
    
    // Custom methods
    signIn: () => auth.signinRedirect(),
    signOut,
    getAccessToken,
    getIdToken,
    getUserInfo,
    
    // Auth states
    hasTokens: !!auth.user?.access_token,
    isExpired: auth.user ? auth.user.expired : true,
  };
};