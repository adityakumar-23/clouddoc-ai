import { s3Service } from '../s3.service';
import { prisma } from '../../config/database';
import { mergePdfProcessor } from './mergePdf.processor';
import { splitPdfProcessor } from './splitPdf.processor';
import { compressPdfProcessor } from './compressPdf.processor';
import { rotatePdfProcessor } from './rotatePdf.processor';
import { pageManagementProcessor } from './pageManagement.processor';
import { pdfSecurityProcessor } from './pdfSecurity.processor';
import { imageToPdfProcessor } from './imageToPdf.processor';
import { wordToPdfProcessor } from './wordToPdf.processor';
import { pptToPdfProcessor } from './pptToPdf.processor';
import { excelToPdfProcessor } from './excelToPdf.processor';
import { pdfToWordProcessor } from './pdfToWord.processor';
import { pdfToExcelProcessor } from './pdfToExcel.processor';
import { pdfToPptProcessor } from './pdfToPpt.processor';
import { pdfToImageProcessor } from './pdfToImage.processor';
import { ocrService } from '../ocr/ocr.service';
import { AppError } from '../../middleware/error.middleware';
import { logger } from '../../config/logger';
import { JobStatus } from '@prisma/client';

export class DocumentProcessingService {
  async processJob(jobId: string): Promise<any> {
    const job = await prisma.processingJob.findUnique({
      where: { id: jobId },
      include: {
        document: true,
        user: true,
      },
    });

    if (!job) {
      throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
    }

    const startTime = Date.now();

    try {
      // Mark as PROCESSING
      await this.updateJobStatus(job.id, JobStatus.PROCESSING, 15, 'Job initiated by processor');

      let outputBuffer: Buffer;
      let outputFileName: string;
      let outputMimeType: string;
      const params = (job.parameters as any) || {};

      switch (job.toolType) {
        case 'merge-pdf': {
          const s3Keys: string[] = params.sourceS3Keys || [];
          if (job.document && !s3Keys.includes(job.document.s3Key)) {
            s3Keys.unshift(job.document.s3Key);
          }
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 35, 'Downloading input documents from S3');
          const buffers = await Promise.all(s3Keys.map((k) => s3Service.getFileBuffer(k)));
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 65, 'Merging PDF streams');
          outputBuffer = await mergePdfProcessor.process(buffers);
          outputFileName = params.outputFileName || 'merged_document.pdf';
          outputMimeType = 'application/pdf';
          break;
        }

        case 'split-pdf': {
          if (!job.document) throw new AppError('Document required for splitting', 400);
          const buffer = await s3Service.getFileBuffer(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 50, 'Extracting page range');
          outputBuffer = await splitPdfProcessor.process(buffer, params.pageRange || '1');
          outputFileName = `${job.document.title}_split.pdf`;
          outputMimeType = 'application/pdf';
          break;
        }

        case 'compress-pdf': {
          if (!job.document) throw new AppError('Document required for compression', 400);
          const buffer = await s3Service.getFileBuffer(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 55, 'Compressing PDF stream structures');
          outputBuffer = await compressPdfProcessor.process(buffer, params.level || 'medium');
          outputFileName = `${job.document.title}_compressed.pdf`;
          outputMimeType = 'application/pdf';
          break;
        }

        case 'rotate-pdf': {
          if (!job.document) throw new AppError('Document required for rotation', 400);
          const buffer = await s3Service.getFileBuffer(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 60, `Rotating pages by ${params.angle || 90}°`);
          outputBuffer = await rotatePdfProcessor.process(buffer, params.angle || 90, params.pageIndices);
          outputFileName = `${job.document.title}_rotated.pdf`;
          outputMimeType = 'application/pdf';
          break;
        }

        case 'extract-pages': {
          if (!job.document) throw new AppError('Document required for page extraction', 400);
          const buffer = await s3Service.getFileBuffer(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 60, 'Extracting selected pages');
          outputBuffer = await pageManagementProcessor.extractPages(buffer, params.pages || [1]);
          outputFileName = `${job.document.title}_extracted_pages.pdf`;
          outputMimeType = 'application/pdf';
          break;
        }

        case 'delete-pages': {
          if (!job.document) throw new AppError('Document required for page deletion', 400);
          const buffer = await s3Service.getFileBuffer(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 60, 'Removing selected pages');
          outputBuffer = await pageManagementProcessor.deletePages(buffer, params.pages || []);
          outputFileName = `${job.document.title}_deleted_pages.pdf`;
          outputMimeType = 'application/pdf';
          break;
        }

        case 'reorder-pages': {
          if (!job.document) throw new AppError('Document required for page reordering', 400);
          const buffer = await s3Service.getFileBuffer(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 60, 'Reorganizing page sequence');
          outputBuffer = await pageManagementProcessor.reorderPages(buffer, params.order || []);
          outputFileName = `${job.document.title}_reordered.pdf`;
          outputMimeType = 'application/pdf';
          break;
        }

        case 'image-to-pdf': {
          const s3Keys: string[] = params.sourceS3Keys || [];
          if (job.document) s3Keys.unshift(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 40, 'Loading images');
          const imageFiles = await Promise.all(
            s3Keys.map(async (key) => ({
              buffer: await s3Service.getFileBuffer(key),
              mimeType: 'image/jpeg',
            }))
          );
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 70, 'Building multi-page vector PDF');
          outputBuffer = await imageToPdfProcessor.process(imageFiles);
          outputFileName = params.outputFileName || 'images_compiled.pdf';
          outputMimeType = 'application/pdf';
          break;
        }

        case 'word-to-pdf': {
          if (!job.document) throw new AppError('Document required for Word to PDF', 400);
          const buffer = await s3Service.getFileBuffer(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 55, 'Parsing DOCX structure & styling');
          outputBuffer = await wordToPdfProcessor.process(buffer);
          outputFileName = `${job.document.title}.pdf`;
          outputMimeType = 'application/pdf';
          break;
        }

        case 'ppt-to-pdf': {
          if (!job.document) throw new AppError('Document required for PPT to PDF', 400);
          const buffer = await s3Service.getFileBuffer(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 55, 'Rendering presentation slides');
          outputBuffer = await pptToPdfProcessor.process(buffer);
          outputFileName = `${job.document.title}.pdf`;
          outputMimeType = 'application/pdf';
          break;
        }

        case 'excel-to-pdf': {
          if (!job.document) throw new AppError('Document required for Excel to PDF', 400);
          const buffer = await s3Service.getFileBuffer(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 55, 'Converting spreadsheet tables to PDF');
          outputBuffer = await excelToPdfProcessor.process(buffer);
          outputFileName = `${job.document.title}.pdf`;
          outputMimeType = 'application/pdf';
          break;
        }

        case 'pdf-to-word': {
          if (!job.document) throw new AppError('Document required for PDF to Word', 400);
          const buffer = await s3Service.getFileBuffer(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 55, 'Extracting text and generating DOCX');
          outputBuffer = await pdfToWordProcessor.process(buffer);
          outputFileName = `${job.document.title}.docx`;
          outputMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        }

        case 'pdf-to-excel': {
          if (!job.document) throw new AppError('Document required for PDF to Excel', 400);
          const buffer = await s3Service.getFileBuffer(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 55, 'Extracting tables and generating XLSX');
          outputBuffer = await pdfToExcelProcessor.process(buffer);
          outputFileName = `${job.document.title}.xlsx`;
          outputMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        }

        case 'pdf-to-ppt': {
          if (!job.document) throw new AppError('Document required for PDF to PPT', 400);
          const buffer = await s3Service.getFileBuffer(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 55, 'Creating presentation slides');
          outputBuffer = await pdfToPptProcessor.process(buffer);
          outputFileName = `${job.document.title}.pptx`;
          outputMimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        }

        case 'pdf-to-image': {
          if (!job.document) throw new AppError('Document required for PDF to Image', 400);
          const buffer = await s3Service.getFileBuffer(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 60, 'Rendering page images');
          const images = await pdfToImageProcessor.process(buffer, params.page || 1);
          outputBuffer = images[0].buffer;
          outputFileName = `${job.document.title}_page_${images[0].pageNumber}.${images[0].fileName.split('.').pop()}`;
          outputMimeType = images[0].mimeType;
          break;
        }

        case 'ocr': {
          if (!job.document) throw new AppError('Document required for OCR', 400);
          const buffer = await s3Service.getFileBuffer(job.document.s3Key);
          await this.updateJobStatus(job.id, JobStatus.PROCESSING, 45, 'Executing optical character recognition');
          const ocrResult = await ocrService.extractText(buffer, job.document.mimeType);

          // Update document metadata with full extracted OCR text
          await prisma.document.update({
            where: { id: job.document.id },
            data: {
              metadata: {
                ...((job.document.metadata as any) || {}),
                ocrPerformed: true,
                ocrConfidence: ocrResult.confidence,
                extractedText: ocrResult.text,
              },
            },
          });

          outputBuffer = Buffer.from(ocrResult.text, 'utf-8');
          outputFileName = `${job.document.title}_ocr.txt`;
          outputMimeType = 'text/plain';
          break;
        }

        default:
          throw new AppError(`Unsupported tool operation: ${job.toolType}`, 400, 'UNSUPPORTED_OPERATION');
      }

      await this.updateJobStatus(job.id, JobStatus.PROCESSING, 85, 'Uploading processed asset to S3');

      // Upload processed file to S3
      const outputKey = s3Service.generateProcessedKey(job.userId, job.id, outputFileName);
      await s3Service.uploadFile(outputKey, outputBuffer, outputMimeType);

      const executionTime = Date.now() - startTime;

      // Update ProcessingJob to COMPLETED
      const completedJob = await prisma.processingJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.COMPLETED,
          progress: 100,
          outputS3Key: outputKey,
          outputFileName,
          outputFileSize: BigInt(outputBuffer.length),
          executionTimeMs: executionTime,
          completedAt: new Date(),
        },
      });

      // Increment user monthly conversion count
      await prisma.usageMetric.update({
        where: { userId: job.userId },
        data: {
          monthlyConversions: { increment: 1 },
        },
      });

      // Add completion event to ProcessingHistory
      await prisma.processingHistory.create({
        data: {
          jobId: job.id,
          status: JobStatus.COMPLETED,
          message: `Operation ${job.toolType} completed successfully in ${executionTime}ms`,
          progress: 100,
        },
      });

      logger.info(`Job ${job.id} completed successfully in ${executionTime}ms`);
      return completedJob;
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      logger.error(`Job ${job.id} failed:`, error);

      await prisma.processingJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.FAILED,
          progress: 0,
          errorMessage: error.message,
          executionTimeMs: executionTime,
          completedAt: new Date(),
        },
      });

      await prisma.processingHistory.create({
        data: {
          jobId: job.id,
          status: JobStatus.FAILED,
          message: `Job failed: ${error.message}`,
          progress: 0,
        },
      });

      throw error;
    }
  }

  private async updateJobStatus(jobId: string, status: JobStatus, progress: number, message: string) {
    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status,
        progress,
        ...(status === JobStatus.PROCESSING && progress <= 15 ? { startedAt: new Date() } : {}),
      },
    });

    await prisma.processingHistory.create({
      data: {
        jobId,
        status,
        progress,
        message,
      },
    });
  }
}

export const documentProcessingService = new DocumentProcessingService();
