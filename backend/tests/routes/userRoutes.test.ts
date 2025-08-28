import request from 'supertest';
import express from 'express';
import userRoutes from '../../src/routes/user';
import { createTestToken, createTestUser } from '../utils/testHelpers';

// Mock repositoryManager
jest.mock('../../src/services/repositoryManager', () => ({
  repositoryManager: {
    getUserPreferences: jest.fn(),
    saveUserPreferences: jest.fn()
  }
}));

import { repositoryManager } from '../../src/services/repositoryManager';

describe('User Routes', () => {
  let app: express.Application;
  let token: string;
  let testUser: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/user', userRoutes);
    
    testUser = createTestUser();
    token = createTestToken(testUser);
    
    jest.clearAllMocks();
  });

  describe('GET /user/preferences', () => {
    it('should get user preferences', async () => {
      const mockPreferences = {
        theme: 'dark',
        activeAPIs: { weather: true, github: true, catfacts: false, chucknorris: false, bored: false, custom: false },
        notifications: true
      };

      (repositoryManager.getUserPreferences as jest.Mock).mockReturnValue(mockPreferences);

      const response = await request(app)
        .get('/user/preferences')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockPreferences
      });
      expect(repositoryManager.getUserPreferences).toHaveBeenCalledWith(testUser.id);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/user/preferences');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'No token provided'
      });
    });

    it('should handle repository errors', async () => {
      (repositoryManager.getUserPreferences as jest.Mock).mockImplementation(() => {
        throw new Error('Repository error');
      });

      const response = await request(app)
        .get('/user/preferences')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Failed to get user preferences'
      });
    });
  });

  describe('POST /user/preferences', () => {
    it('should save user preferences', async () => {
      const newPreferences = {
        theme: 'light',
        activeAPIs: { weather: true, catfacts: true, github: false, chucknorris: false, bored: false, custom: false },
        notifications: false
      };

      const response = await request(app)
        .post('/user/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send(newPreferences);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: newPreferences,
        message: 'Preferences saved successfully'
      });
      expect(repositoryManager.saveUserPreferences).toHaveBeenCalledWith(testUser.id, newPreferences);
    });

    it('should validate preferences format', async () => {
      const invalidPreferences = {
        theme: 'dark',
        activeAPIs: 'not-an-object', // Should be object
        notifications: true
      };

      const response = await request(app)
        .post('/user/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidPreferences);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid preferences format'
      });
    });

    it('should require all preference fields', async () => {
      const incompletePreferences = {
        theme: 'dark'
        // Missing activeAPIs and notifications
      };

      const response = await request(app)
        .post('/user/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send(incompletePreferences);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /user/profile', () => {
    it('should return user profile', async () => {
      const response = await request(app)
        .get('/user/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name
        }
      });
    });
  });
});