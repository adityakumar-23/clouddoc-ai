import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(requireAuth);
router.use(requireRole(Role.ADMIN));

router.get('/stats', (req, res, next) => adminController.getDashboardStats(req, res, next));
router.get('/users', (req, res, next) => adminController.listUsers(req, res, next));
router.get('/documents', (req, res, next) => adminController.listDocuments(req, res, next));
router.get('/jobs', (req, res, next) => adminController.listJobs(req, res, next));
router.get('/logs', (req, res, next) => adminController.listAuditLogs(req, res, next));
router.get('/health', (req, res, next) => adminController.getSystemHealth(req, res, next));

export default router;
