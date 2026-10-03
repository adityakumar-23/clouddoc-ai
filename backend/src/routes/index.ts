import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import documentRoutes from './document.routes';
import toolRoutes from './tool.routes';
import aiRoutes from './ai.routes';
import jobRoutes from './job.routes';
import adminRoutes from './admin.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/documents', documentRoutes);
router.use('/tools', toolRoutes);
router.use('/ai', aiRoutes);
router.use('/jobs', jobRoutes);
router.use('/admin', adminRoutes);
router.use('/health', healthRoutes);

export default router;
