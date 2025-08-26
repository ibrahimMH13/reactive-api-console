import { Router } from 'express';
import { verifyToken } from '../auth/jwt';
import { repositoryManager } from '../services/repositoryManager';

const router = Router();

// Apply auth middleware to all user routes
router.use(verifyToken);

// User Preferences Management
router.get('/preferences', async (req, res) => {
  try {
    const preferences = await repositoryManager.getUserPreferences(req.user!.id);
    res.json({ success: true, data: preferences });
  } catch (error:any) {
    console.error('Get preferences error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get user preferences' 
    });
  }
});

router.post('/preferences', async (req, res) => {
  try {
    const { theme, activeAPIs, notifications } = req.body;
    
    // Validate input
    if (!theme || (typeof activeAPIs !== 'object' || activeAPIs === null) || typeof notifications !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid preferences format' 
      });
    }
    
    const preferences = { theme, activeAPIs, notifications };
    
    await repositoryManager.saveUserPreferences(req.user!.id, preferences);
    
    res.json({ 
      success: true, 
      data: preferences,
      message: 'Preferences saved successfully'
    });
  } catch (error: any) {
    console.error('Save preferences error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save user preferences' 
    });
  }
});

// User Profile Information
router.get('/profile', (req, res) => {
  try {
    const user = req.user!;
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error :any) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get user profile' 
    });
  }
});

export default router;