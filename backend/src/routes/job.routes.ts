import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', (req, res, next) => jobController.createJob(req, res, next));
router.get('/', (req, res, next) => jobController.listJobs(req, res, next));
router.get('/:id', (req, res, next) => jobController.getJobById(req, res, next));
router.post('/:id/cancel', (req, res, next) => jobController.cancelJob(req, res, next));

export default router;
