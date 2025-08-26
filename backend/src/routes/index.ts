import { Router } from 'express';
import userRoutes from './user';
import searchRoutes from './search';
import providerRoutes from './providers';
import authRoutes from './auth';    
const router = Router();

// Mount route modules
router.use('/auth', authRoutes);    
router.use('/v1/user', userRoutes);         
router.use('/v1/search', searchRoutes);    
router.use('/v1/provider', providerRoutes);          


export default router;