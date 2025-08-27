import { Router } from 'express';
import { verifyToken } from '../auth/jwt';
import { providerService } from '../providers/index';

const router = Router();

// Apply auth middleware to all provider routes
router.use(verifyToken);
// Weather API Testing
router.get('/weather', async (req, res) => {
  try {
    const city = req.query.city as string || 'berlin';
    
    if (typeof city !== 'string' || city.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid city name is required' 
      });
    }
    
    const result = await providerService.getWeather(city.trim());
    console.log('----------------->',result);
    res.json({ 
      success: true, 
      data: result,
      meta: {
        provider: 'open-meteo',
        requestedCity: city,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Weather API error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to get weather data'
    });
  }
});

// Cat Facts API Testing
router.get('/catfact', async (req, res) => {
  console.log('here---------------------->');
  try {
    const result = await providerService.getCatFact();
    
    res.json({ 
      success: true, 
      data: result,
      meta: {
        provider: 'catfact.ninja',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Cat fact API error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to get cat fact'
    });
  }
});

// GitHub API Testing
router.get('/github', async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query is required' 
      });
    }
    
    const result = await providerService.searchGitHubUsers(query.trim());
    
    res.json({ 
      success: true, 
      data: result,
      meta: {
        provider: 'github',
        searchQuery: query,
        resultCount: result.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('GitHub API error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to search GitHub users'
    });
  }
});

// Chuck Norris API Testing
router.get('/chuck', async (req, res) => {
  try {
    const search = req.query.search as string;
    const result = await providerService.getChuckNorrisJoke(search);
    
    res.json({ 
      success: true, 
      data: result,
      meta: {
        provider: 'chucknorris.io',
        searchTerm: search || null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Chuck Norris API error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to get Chuck Norris joke'
    });
  }
});

// Bored API Testing
router.get('/activity', async (req, res) => {
  try {
    const result = await providerService.getBoredActivity();
    
    res.json({ 
      success: true, 
      data: result,
      meta: {
        provider: 'boredapi.com',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Bored API error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to get activity'
    });
  }
});

export default router;