import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { AppError } from './error.middleware';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  'application/vnd.ms-powerpoint', // ppt
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.jpg', '.jpeg', '.png', '.webp', '.tiff'];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export function sanitizeFilename(originalName: string): string {
  // Strip path traversal and weird unicode
  const basename = path.basename(originalName).trim();
  const ext = path.extname(basename).toLowerCase();
  const nameWithoutExt = path.basename(basename, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 80);
  return `${nameWithoutExt || 'document'}${ext}`;
}

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Multi-file uploads up to 10
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new AppError(`Unsupported file extension: ${ext}. Supported: ${ALLOWED_EXTENSIONS.join(', ')}`, 400, 'UNSUPPORTED_FILE_TYPE'));
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new AppError(`Unsupported MIME type: ${file.mimetype}`, 400, 'UNSUPPORTED_MIME_TYPE'));
    }

    cb(null, true);
  },
});

export function validateUploadedFile(req: Request, res: Response, next: NextFunction): void {
  if (!req.file && (!req.files || (Array.isArray(req.files) && req.files.length === 0))) {
    return next(new AppError('No document was provided for upload', 400, 'FILE_MISSING'));
  }
  next();
}
