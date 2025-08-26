import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Lazy create the verifier
let verifier: any = null;

const getVerifier = () => {
  if (!verifier) {
    if (!process.env.COGNITO_USER_POOL_ID || !process.env.COGNITO_CLIENT_ID) {
      throw new Error('Cognito configuration missing. Set COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID environment variables.');
    }
    
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      tokenUse: 'access',
      clientId: process.env.COGNITO_CLIENT_ID,
    });
  }
  return verifier;
};

export const verifyCognitoToken = async (token: string) => {
  try {
    const cognitoVerifier = getVerifier();
    const payload = await cognitoVerifier.verify(token);
    
    return {
      id: payload.sub as string,
      email: (payload.email || payload.username) as string,
      name: (payload.name || payload.given_name || payload.username) as string,
      groups: payload['cognito:groups'] || []
    };
  } catch (error) {
    console.error('Cognito token verification failed:', error);
    throw new Error('Invalid token');
  }
};