import { Request, Response } from 'express';
import { verifyToken, verifySocketToken } from '../../src/auth/jwt';
import { createTestToken, createExpiredToken, createTestUser } from '../utils/testHelpers';

describe('JWT Authentication', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('verifyToken middleware', () => {
    it('should authenticate valid token', async () => {
      const testUser = createTestUser();
      const token = createTestToken(testUser);
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.user).toEqual({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      });
    });

    it('should reject missing authorization header', async () => {
      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'No token provided'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject malformed authorization header', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token123'
      };

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'No token provided'
      });
    });

    it('should reject expired token', async () => {
      const expiredToken = createExpiredToken();
      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`
      };

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid token'
      });
    });

    it('should reject invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token-string'
      };

      await verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid token'
      });
    });
  });

  describe('verifySocketToken', () => {
    it('should verify valid socket token', async () => {
      const testUser = createTestUser();
      const token = createTestToken(testUser);

      const result = await verifySocketToken(token);

      expect(result).toEqual({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      });
    });

    it('should reject invalid socket token', async () => {
      await expect(verifySocketToken('invalid-token')).rejects.toThrow('Invalid socket token');
    });

    it('should reject expired socket token', async () => {
      const expiredToken = createExpiredToken();
      await expect(verifySocketToken(expiredToken)).rejects.toThrow('Invalid socket token');
    });
  });
});