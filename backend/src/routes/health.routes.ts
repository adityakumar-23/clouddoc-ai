import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';

const router = Router();

router.get('/', (req, res) => getHealth(req, res));

export default router;
