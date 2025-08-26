import { Router } from 'express';
import { verifyToken } from '../auth/jwt';
import { repositoryManager } from '../services/repositoryManager';

const router = Router();

// Apply auth middleware to all search routes
router.use(verifyToken);

// Search History
router.get('/searches/history', (req, res) => {
    try {
      const history = repositoryManager.getUserSearchHistory(req.user!.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get search history' });
    }
  });
  
router.post('/searches', (req, res) => {
    try {
      const { query, api } = req.body;
      
      if (!query || !api) {
        return res.status(400).json({ error: 'Query and api are required' });
      }
      
      const entry = repositoryManager.addSearchEntry(req.user!.id, {
        query,
        api,
        timestamp: Date.now()
      });
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save search' });
    }
  });
  
  router.delete('/searches/:id', (req, res) => {
    try {
      const { id } = req.params;
      const deleted = repositoryManager.deleteSearchEntry(req.user!.id, id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Search entry not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete search' });
    }
});

export default router;
