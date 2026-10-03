import { Request, Response, NextFunction } from 'express';
import { documentService } from '../services/document.service';
import { s3Service } from '../services/s3.service';
import { recordAuditLog } from '../middleware/auditLog.middleware';
import { AppError } from '../middleware/error.middleware';

export class DocumentController {
  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let file = req.file;
      if (!file && req.files) {
        if (Array.isArray(req.files) && req.files.length > 0) {
          file = req.files[0];
        } else if (typeof req.files === 'object') {
          const all = Object.values(req.files).flat();
          if (all.length > 0) file = all[0] as Express.Multer.File;
        }
      }

      if (!file) {
        throw new AppError('File payload is missing', 400, 'FILE_MISSING');
      }

      const result = await documentService.uploadDocument(req.user!.id, {
        originalname: file.originalname,
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
      });

      await recordAuditLog(req, 'DOCUMENT_UPLOAD', 'DOCUMENT', result.id, {
        fileName: result.originalName,
        fileSize: result.fileSize,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async listDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, fileType, isFavorite, page, limit, sortBy, sortOrder } = req.query;

      const result = await documentService.listDocuments(req.user!.id, {
        search: search as string,
        fileType: fileType as string,
        isFavorite: isFavorite === 'true' ? true : isFavorite === 'false' ? false : undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getDocumentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await documentService.getDocumentById(req.user!.id, req.params.id);
      res.json({
        success: true,
        data: doc,
      });
    } catch (err) {
      next(err);
    }
  }

  async toggleFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await documentService.toggleFavorite(req.user!.id, req.params.id);
      res.json({
        success: true,
        data: doc,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await documentService.deleteDocument(req.user!.id, req.params.id);
      await recordAuditLog(req, 'DOCUMENT_DELETE', 'DOCUMENT', req.params.id);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getPresignedUploadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileName, mimeType } = req.body;
      if (!fileName || !mimeType) {
        throw new AppError('fileName and mimeType are required', 400);
      }

      const s3Key = s3Service.generateOriginalKey(req.user!.id, fileName);
      const uploadUrl = await s3Service.getPresignedUploadUrl(s3Key, mimeType, 900);

      res.json({
        success: true,
        data: {
          s3Key,
          uploadUrl,
          expiresInSeconds: 900,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async downloadStream(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = req.query.key as string;
      if (!key) {
        throw new AppError('Storage key required', 400);
      }

      const stream = await s3Service.getFileBuffer(key);
      res.setHeader('Content-Disposition', `attachment; filename="${key.split('/').pop()}"`);
      res.send(stream);
    } catch (err) {
      next(err);
    }
  }
}

export const documentController = new DocumentController();
