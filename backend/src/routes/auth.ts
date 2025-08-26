import { Router } from 'express';
import { cognitoService } from '../services/cognitoService';
import { verifyToken } from '../auth/jwt';

const router = Router();

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await cognitoService.signUp(email, password, name);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully. Please check your email for verification code.',
      data: {
        userSub: result.userSub,
        codeDeliveryDetails: result.codeDeliveryDetails
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Confirm sign up
router.post('/confirm', async (req, res) => {
  try {
    const { email, confirmationCode } = req.body;
    
    if (!email || !confirmationCode) {
      return res.status(400).json({
        success: false,
        error: 'Email and confirmation code are required'
      });
    }

    await cognitoService.confirmSignUp(email, confirmationCode);
    
    res.json({
      success: true,
      message: 'Email confirmed successfully. You can now sign in.'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await cognitoService.signIn(email, password);
    
    res.json({
      success: true,
      message: 'Signed in successfully',
      data: {
        accessToken: result.accessToken,
        idToken: result.idToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn
      }
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken, email } = req.body;
    
    if (!refreshToken || !email) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token and email are required'
      });
    }

    const result = await cognitoService.refreshToken(refreshToken, email);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
        idToken: result.idToken,
        expiresIn: result.expiresIn
      }
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// Get current user (protected route)
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user info'
    });
  }
});

// Hosted UI URLs
router.get('/urls', (req, res) => {
  const domain = process.env.COGNITO_DOMAIN;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const redirectCallback = process.env.CORS_ORIGIN;
  const redirectUri = encodeURIComponent(redirectCallback + '/callback');
  
  res.json({
    success: true,
    data: {
      loginUrl: `${domain}/login?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirectUri}`,
      logoutUrl: `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(redirectCallback as string)}`,
      signupUrl: `${domain}/signup?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirectUri}`
    }
  });
});

export default router;