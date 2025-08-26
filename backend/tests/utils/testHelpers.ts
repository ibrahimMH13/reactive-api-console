import jwt from 'jsonwebtoken';
import { User } from '../../src/types';

export const createTestUser = (): User => ({
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User'
});

export const createTestToken = (user: User = createTestUser()): string => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    },
    process.env.JWT_SECRET || 'test-secret'
  );
};

export const createExpiredToken = (user: User = createTestUser()): string => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000) - (60 * 60 * 2), // 2 hours ago
      exp: Math.floor(Date.now() / 1000) - (60 * 60) // 1 hour ago (expired)
    },
    process.env.JWT_SECRET || 'test-secret'
  );
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};