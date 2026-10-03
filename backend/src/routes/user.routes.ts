import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/me', (req, res, next) => userController.getProfile(req, res, next));
router.put('/me', (req, res, next) => userController.updateProfile(req, res, next));
router.post('/change-password', (req, res, next) => userController.changePassword(req, res, next));

export default router;
