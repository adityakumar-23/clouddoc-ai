import { prisma } from '../config/database';
import { s3Service } from './s3.service';
import { AppError } from '../middleware/error.middleware';
import { sanitizeFilename } from '../middleware/fileValidation.middleware';
import { DocumentStatus } from '@prisma/client';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import path from 'path';

export interface DocumentFilterOptions {
  search?: string;
  fileType?: string;
  isFavorite?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'title' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
}

export class DocumentService {
  async uploadDocument(
    userId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string; size: number }
  ) {
    const sanitizedName = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitizedName).toLowerCase().replace('.', '');
    const s3Key = s3Service.generateOriginalKey(userId, sanitizedName);

    // Upload to S3
    await s3Service.uploadFile(s3Key, file.buffer, file.mimetype);

    // Extract basic metadata & page count
    let pageCount = 1;
    let extractedTextPreview = '';
    let author = '';
    let title = sanitizedName.replace(/\.[^/.]+$/, '');

    if (file.mimetype === 'application/pdf') {
      try {
        const pdfDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
        pageCount = pdfDoc.getPageCount();
        title = pdfDoc.getTitle() || title;
        author = pdfDoc.getAuthor() || '';
      } catch (err) {
        // PDF parsing might fail on password protected files
      }
    } else if (file.mimetype.includes('wordprocessingml') || file.mimetype.includes('msword')) {
      try {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        extractedTextPreview = result.value.slice(0, 500);
      } catch (err) {
        // Fallback
      }
    }

    // Create Document record in PostgreSQL
    const document = await prisma.document.create({
      data: {
        userId,
        title,
        originalName: sanitizedName,
        fileType: ext,
        mimeType: file.mimetype,
        fileSize: BigInt(file.size),
        s3Bucket: s3Service.getBucketName(),
        s3Key,
        pageCount,
        status: DocumentStatus.READY,
        metadata: {
          author,
          extractedTextPreview,
          originalExt: ext,
        },
        versions: {
          create: [
            {
              versionNumber: 1,
              s3Key,
              fileSize: BigInt(file.size),
              operation: 'INITIAL_UPLOAD',
            },
          ],
        },
      },
    });

    // Update user storage metrics
    await prisma.usageMetric.upsert({
      where: { userId },
      create: {
        userId,
        storageUsedBytes: BigInt(file.size),
      },
      update: {
        storageUsedBytes: { increment: BigInt(file.size) },
      },
    });

    const downloadUrl = await s3Service.getPresignedDownloadUrl(s3Key, 1800);

    return {
      ...this.serializeDocument(document),
      downloadUrl,
    };
  }

  async listDocuments(userId: string, options: DocumentFilterOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      deletedAt: null,
    };

    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { originalName: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    if (options.fileType && options.fileType !== 'all') {
      where.fileType = options.fileType.toLowerCase();
    }

    if (options.isFavorite !== undefined) {
      where.isFavorite = options.isFavorite;
    }

    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    const serializedDocs = await Promise.all(
      documents.map(async (doc) => {
        const downloadUrl = await s3Service.getPresignedDownloadUrl(doc.s3Key, 3600);
        return {
          ...this.serializeDocument(doc),
          downloadUrl,
        };
      })
    );

    return {
      documents: serializedDocs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDocumentById(userId: string, documentId: string) {
    const doc = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
        deletedAt: null,
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
        processingJobs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!doc) {
      throw new AppError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
    }

    const downloadUrl = await s3Service.getPresignedDownloadUrl(doc.s3Key, 3600);

    return {
      ...this.serializeDocument(doc),
      downloadUrl,
      versions: doc.versions.map((v) => ({
        id: v.id,
        versionNumber: v.versionNumber,
        fileSize: Number(v.fileSize),
        operation: v.operation,
        createdAt: v.createdAt,
      })),
      processingJobs: doc.processingJobs.map((j) => ({
        id: j.id,
        toolType: j.toolType,
        status: j.status,
        progress: j.progress,
        createdAt: j.createdAt,
      })),
    };
  }

  async toggleFavorite(userId: string, documentId: string) {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId, deletedAt: null },
    });

    if (!doc) {
      throw new AppError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: { isFavorite: !doc.isFavorite },
    });

    return this.serializeDocument(updated);
  }

  async deleteDocument(userId: string, documentId: string) {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId, deletedAt: null },
    });

    if (!doc) {
      throw new AppError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
    }

    // Soft delete document in DB
    await prisma.document.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });

    // Decrement storage usage
    await prisma.usageMetric.update({
      where: { userId },
      data: {
        storageUsedBytes: {
          decrement: BigInt(doc.fileSize),
        },
      },
    });

    // Optionally cleanup S3 object
    await s3Service.deleteFile(doc.s3Key).catch(() => {});

    return { message: 'Document deleted successfully' };
  }

  private serializeDocument(doc: any) {
    const rawSize = doc.fileSize ?? doc.fileSizeBytes ?? 0;
    const numericSize = typeof rawSize === 'bigint' ? Number(rawSize) : Number(rawSize || 0);

    return {
      id: doc.id,
      userId: doc.userId,
      title: doc.title || doc.originalName,
      originalName: doc.originalName,
      fileType: doc.fileType,
      mimeType: doc.mimeType || 'application/octet-stream',
      fileSize: isNaN(numericSize) ? 0 : numericSize,
      s3Bucket: doc.s3Bucket || 'local-storage',
      s3Key: doc.s3Key,
      pageCount: doc.pageCount || 1,
      isFavorite: !!doc.isFavorite,
      status: doc.status || 'READY',
      metadata: doc.metadata || {},
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

export const documentService = new DocumentService();
