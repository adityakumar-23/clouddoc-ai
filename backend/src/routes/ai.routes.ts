import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { processingLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.use(requireAuth);
router.use(processingLimiter);

router.post('/summarize', (req, res, next) => aiController.summarize(req, res, next));
router.post('/chat', (req, res, next) => aiController.chat(req, res, next));
router.get('/conversations', (req, res, next) => aiController.listConversations(req, res, next));
router.get('/conversations/:id', (req, res, next) => aiController.getConversation(req, res, next));
router.post('/extract', (req, res, next) => aiController.extractEntities(req, res, next));
router.post('/search', (req, res, next) => aiController.semanticSearch(req, res, next));

export default router;
