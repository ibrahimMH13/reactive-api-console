import React from 'react';
import { AuthProvider as OidcAuthProvider } from 'react-oidc-context';
import type {AuthProviderProps} from 'react-oidc-context';
import { cognitoConfig } from '../../config/auth';

interface CustomAuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<CustomAuthProviderProps> = ({ children }) => {
  const onSigninCallback = () => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
  };

  const oidcConfig: AuthProviderProps = {
    ...cognitoConfig,
    onSigninCallback,
    onSigninSilentCallback: onSigninCallback,
  };

  return (
    <OidcAuthProvider {...oidcConfig}>
      {children}
    </OidcAuthProvider>
  );
};