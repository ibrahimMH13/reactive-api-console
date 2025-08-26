import { 
    CognitoIdentityProviderClient, 
    InitiateAuthCommand,
    SignUpCommand,
    ConfirmSignUpCommand,
    GetUserCommand
  } from '@aws-sdk/client-cognito-identity-provider';
  import crypto from 'crypto';
  
  const client = new CognitoIdentityProviderClient({
    region: process.env.COGNITO_REGION || 'us-east-1'
  });
  
  const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;
  const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;
  
  // Generate secret hash (required if client has secret)
  const generateSecretHash = (username: string): string => {
    if (!CLIENT_SECRET) return '';
    
    return crypto
      .createHmac('sha256', CLIENT_SECRET)
      .update(username + CLIENT_ID)
      .digest('base64');
  };
  
  export class CognitoService {
    
    // Sign up new user
    async signUp(email: string, password: string, name?: string) {
      const params = {
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          ...(name ? [{ Name: 'name', Value: name }] : [])
        ],
        ...(CLIENT_SECRET && { SecretHash: generateSecretHash(email) })
      };
  
      try {
        const command = new SignUpCommand(params);
        const result = await client.send(command);
        
        return {
          success: true,
          userSub: result.UserSub,
          codeDeliveryDetails: result.CodeDeliveryDetails
        };
      } catch (error: any) {
        throw new Error(`Sign up failed: ${error.message}`);
      }
    }
  
    // Confirm sign up with verification code
    async confirmSignUp(email: string, confirmationCode: string) {
      const params = {
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: confirmationCode,
        ...(CLIENT_SECRET && { SecretHash: generateSecretHash(email) })
      };
  
      try {
        const command = new ConfirmSignUpCommand(params);
        await client.send(command);
        return { success: true };
      } catch (error: any) {
        throw new Error(`Confirmation failed: ${error.message}`);
      }
    }
  
    // Sign in user
    async signIn(email: string, password: string) {
      const params = {
        ClientId: CLIENT_ID,
        AuthFlow: 'USER_PASSWORD_AUTH' as const,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          ...(CLIENT_SECRET && { SECRET_HASH: generateSecretHash(email) })
        }
      };
  
      try {
        const command = new InitiateAuthCommand(params);
        const result = await client.send(command);
        
        if (result.AuthenticationResult) {
          return {
            success: true,
            accessToken: result.AuthenticationResult.AccessToken,
            idToken: result.AuthenticationResult.IdToken,
            refreshToken: result.AuthenticationResult.RefreshToken,
            expiresIn: result.AuthenticationResult.ExpiresIn
          };
        } else {
          throw new Error('Authentication failed - no result');
        }
      } catch (error: any) {
        throw new Error(`Sign in failed: ${error.message}`);
      }
    }
  
    // Refresh access token
    async refreshToken(refreshToken: string, email: string) {
      const params = {
        ClientId: CLIENT_ID,
        AuthFlow: 'REFRESH_TOKEN_AUTH' as const,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
          ...(CLIENT_SECRET && { SECRET_HASH: generateSecretHash(email) })
        }
      };
  
      try {
        const command = new InitiateAuthCommand(params);
        const result = await client.send(command);
        
        if (result.AuthenticationResult) {
          return {
            success: true,
            accessToken: result.AuthenticationResult.AccessToken,
            idToken: result.AuthenticationResult.IdToken,
            expiresIn: result.AuthenticationResult.ExpiresIn
          };
        } else {
          throw new Error('Token refresh failed - no result');
        }
      } catch (error: any) {
        throw new Error(`Token refresh failed: ${error.message}`);
      }
    }
  
    // Get user info
    async getUser(accessToken: string) {
      const params = {
        AccessToken: accessToken
      };
  
      try {
        const command = new GetUserCommand(params);
        const result = await client.send(command);
        
        const attributes: Record<string, string> = {};
        result.UserAttributes?.forEach(attr => {
          if (attr.Name && attr.Value) {
            attributes[attr.Name] = attr.Value;
          }
        });
  
        return {
          username: result.Username,
          email: attributes.email,
          name: attributes.name,
          emailVerified: attributes.email_verified === 'true'
        };
      } catch (error: any) {
        throw new Error(`Get user failed: ${error.message}`);
      }
    }
  }
  
  export const cognitoService = new CognitoService();