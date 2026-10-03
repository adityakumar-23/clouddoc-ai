import { Router } from 'express';
import { toolController } from '../controllers/tool.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { processingLimiter } from '../middleware/rateLimiter.middleware';
import { uploadMiddleware } from '../middleware/fileValidation.middleware';

const router = Router();

router.use(requireAuth);
router.use(processingLimiter);

router.post('/pdf-to-word', uploadMiddleware.single('file'), (req, res, next) =>
  toolController.pdfToWord(req, res, next)
);

router.post('/pdf-to-ppt', uploadMiddleware.single('file'), (req, res, next) =>
  toolController.pdfToPpt(req, res, next)
);

router.post('/pdf-to-excel', uploadMiddleware.single('file'), (req, res, next) =>
  toolController.pdfToExcel(req, res, next)
);

router.post('/merge', uploadMiddleware.array('files', 10), (req, res, next) =>
  toolController.merge(req, res, next)
);

router.post('/split', uploadMiddleware.single('file'), (req, res, next) =>
  toolController.split(req, res, next)
);

router.post('/compress', uploadMiddleware.single('file'), (req, res, next) =>
  toolController.compress(req, res, next)
);

router.post('/rotate', uploadMiddleware.single('file'), (req, res, next) =>
  toolController.rotate(req, res, next)
);

router.post('/extract-pages', uploadMiddleware.single('file'), (req, res, next) =>
  toolController.extractPages(req, res, next)
);

router.post('/delete-pages', uploadMiddleware.single('file'), (req, res, next) =>
  toolController.deletePages(req, res, next)
);

router.post('/reorder-pages', uploadMiddleware.single('file'), (req, res, next) =>
  toolController.reorderPages(req, res, next)
);

router.post('/pdf-to-image', uploadMiddleware.single('file'), (req, res, next) =>
  toolController.pdfToImage(req, res, next)
);

router.post('/image-to-pdf', uploadMiddleware.array('files', 10), (req, res, next) =>
  toolController.imageToPdf(req, res, next)
);

router.post('/word-to-pdf', uploadMiddleware.single('file'), (req, res, next) =>
  toolController.wordToPdf(req, res, next)
);

router.post('/ppt-to-pdf', uploadMiddleware.single('file'), (req, res, next) =>
  toolController.pptToPdf(req, res, next)
);

router.post('/excel-to-pdf', uploadMiddleware.single('file'), (req, res, next) =>
  toolController.excelToPdf(req, res, next)
);

router.post('/ocr', uploadMiddleware.single('file'), (req, res, next) =>
  toolController.ocr(req, res, next)
);

router.get('/metadata/:documentId', (req, res, next) =>
  toolController.getPdfMetadata(req, res, next)
);

router.post('/metadata/:documentId', (req, res, next) =>
  toolController.updatePdfMetadata(req, res, next)
);

export default router;
