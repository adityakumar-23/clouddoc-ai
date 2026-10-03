import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/fileValidation.middleware';

const router = Router();

// Streaming endpoint for local storage
router.get('/download-stream', optionalAuth, (req, res, next) =>
  documentController.downloadStream(req, res, next)
);

router.use(requireAuth);

router.post(
  '/upload',
  uploadMiddleware.any(),
  (req, res, next) => documentController.uploadDocument(req, res, next)
);

router.post('/presigned-upload-url', (req, res, next) =>
  documentController.getPresignedUploadUrl(req, res, next)
);

router.get('/', (req, res, next) => documentController.listDocuments(req, res, next));
router.get('/:id', (req, res, next) => documentController.getDocumentById(req, res, next));
router.patch('/:id/favorite', (req, res, next) => documentController.toggleFavorite(req, res, next));
router.delete('/:id', (req, res, next) => documentController.deleteDocument(req, res, next));

export default router;
