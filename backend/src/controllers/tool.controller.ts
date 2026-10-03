import { Request, Response, NextFunction } from 'express';
import { jobService } from '../services/job.service';
import { pdfSecurityProcessor } from '../services/processors/pdfSecurity.processor';
import { s3Service } from '../services/s3.service';
import { recordAuditLog } from '../middleware/auditLog.middleware';
import { documentService } from '../services/document.service';
import { AppError } from '../middleware/error.middleware';

export class ToolController {
  // Generic handler for document tools
  private async dispatchToolJob(
    req: Request,
    res: Response,
    next: NextFunction,
    toolType: string,
    extraParams?: Record<string, any>
  ): Promise<void> {
    try {
      const { documentId, parameters } = req.body;
      let targetDocId = documentId;

      // If file was directly uploaded in this multipart request
      let directFile = req.file;
      if (!directFile && req.files) {
        if (Array.isArray(req.files) && req.files.length > 0) {
          directFile = req.files[0];
        } else if (typeof req.files === 'object') {
          const all = Object.values(req.files).flat();
          if (all.length > 0) directFile = all[0] as Express.Multer.File;
        }
      }

      if (directFile) {
        const uploadedDoc = await documentService.uploadDocument(req.user!.id, {
          originalname: directFile.originalname,
          buffer: directFile.buffer,
          mimetype: directFile.mimetype,
          size: directFile.size,
        });
        targetDocId = uploadedDoc.id;
      }

      if (!targetDocId && toolType !== 'merge-pdf' && toolType !== 'image-to-pdf') {
        throw new AppError('documentId or uploaded file is required', 400, 'DOCUMENT_REQUIRED');
      }

      const mergedParams = {
        ...(parameters || {}),
        ...(extraParams || {}),
      };

      const job = await jobService.createJob({
        userId: req.user!.id,
        documentId: targetDocId,
        toolType,
        parameters: mergedParams,
      });

      await recordAuditLog(req, 'TOOL_JOB_DISPATCH', 'PROCESSING_JOB', job.id, {
        toolType,
        documentId: targetDocId,
      });

      res.status(202).json({
        success: true,
        data: { job },
      });
    } catch (err) {
      next(err);
    }
  }

  async pdfToWord(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'pdf-to-word');
  }

  async pdfToPpt(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'pdf-to-ppt');
  }

  async pdfToExcel(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'pdf-to-excel');
  }

  async merge(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'merge-pdf', {
      sourceS3Keys: req.body.sourceS3Keys,
      documentIds: req.body.documentIds,
    });
  }

  async split(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'split-pdf', {
      pageRange: req.body.pageRange || '1',
    });
  }

  async compress(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'compress-pdf', {
      level: req.body.compressionLevel || 'medium',
    });
  }

  async rotate(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'rotate-pdf', {
      angle: req.body.angle || 90,
      pageIndices: req.body.pageIndices,
    });
  }

  async extractPages(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'extract-pages', {
      pages: req.body.pages,
    });
  }

  async deletePages(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'delete-pages', {
      pages: req.body.pages,
    });
  }

  async reorderPages(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'reorder-pages', {
      order: req.body.order,
    });
  }

  async pdfToImage(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'pdf-to-image', {
      page: req.body.page || 1,
    });
  }

  async imageToPdf(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'image-to-pdf');
  }

  async wordToPdf(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'word-to-pdf');
  }

  async pptToPdf(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'ppt-to-pdf');
  }

  async excelToPdf(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'excel-to-pdf');
  }

  async ocr(req: Request, res: Response, next: NextFunction) {
    return this.dispatchToolJob(req, res, next, 'ocr', {
      language: req.body.language || 'eng',
    });
  }

  async getPdfMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await documentService.getDocumentById(req.user!.id, req.params.documentId);
      const buffer = await s3Service.getFileBuffer(doc.s3Key);
      const metadata = await pdfSecurityProcessor.getMetadata(buffer);

      res.json({
        success: true,
        data: { metadata },
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePdfMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await documentService.getDocumentById(req.user!.id, req.params.documentId);
      const buffer = await s3Service.getFileBuffer(doc.s3Key);
      const updatedBuffer = await pdfSecurityProcessor.updateMetadata(buffer, req.body);

      // Save as new version
      const newKey = s3Service.generateOriginalKey(req.user!.id, doc.originalName);
      await s3Service.uploadFile(newKey, updatedBuffer, 'application/pdf');

      res.json({
        success: true,
        message: 'PDF metadata updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const toolController = new ToolController();
