import { prisma } from '../config/database';
import { enqueueDocumentJob } from '../queues/documentQueue';
import { s3Service } from './s3.service';
import { AppError } from '../middleware/error.middleware';
import { JobStatus } from '@prisma/client';

export interface CreateJobInput {
  userId: string;
  documentId?: string;
  toolType: string;
  parameters?: Record<string, any>;
}

export class JobService {
  async createJob(input: CreateJobInput) {
    // If documentId specified, verify ownership
    if (input.documentId) {
      const doc = await prisma.document.findFirst({
        where: { id: input.documentId, userId: input.userId, deletedAt: null },
      });
      if (!doc) {
        throw new AppError('Document not found or access denied', 404, 'DOCUMENT_NOT_FOUND');
      }
    }

    // Create job record in PostgreSQL
    const job = await prisma.processingJob.create({
      data: {
        userId: input.userId,
        documentId: input.documentId || null,
        toolType: input.toolType,
        status: JobStatus.QUEUED,
        progress: 0,
        parameters: input.parameters || {},
        history: {
          create: [
            {
              status: JobStatus.QUEUED,
              message: `Job submitted for ${input.toolType}`,
              progress: 0,
            },
          ],
        },
      },
      include: {
        document: true,
      },
    });

    // Enqueue to BullMQ / background queue
    await enqueueDocumentJob({
      jobId: job.id,
      userId: input.userId,
      toolType: input.toolType,
    });

    return this.serializeJob(job);
  }

  async getJobById(userId: string, jobId: string) {
    const job = await prisma.processingJob.findFirst({
      where: { id: jobId, userId },
      include: {
        document: true,
        history: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!job) {
      throw new AppError('Processing job not found', 404, 'JOB_NOT_FOUND');
    }

    let downloadUrl: string | undefined;
    if (job.status === JobStatus.COMPLETED && job.outputS3Key) {
      downloadUrl = await s3Service.getPresignedDownloadUrl(job.outputS3Key, 3600);
    }

    return {
      ...this.serializeJob(job),
      downloadUrl,
      history: (job.history || []).map((h) => ({
        id: h.id,
        status: h.status,
        message: h.message,
        progress: h.progress,
        createdAt: h.createdAt,
      })),
    };
  }

  async listUserJobs(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, jobs] = await Promise.all([
      prisma.processingJob.count({ where: { userId } }),
      prisma.processingJob.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          document: {
            select: { id: true, title: true, fileType: true },
          },
        },
      }),
    ]);

    const serializedJobs = await Promise.all(
      jobs.map(async (j) => {
        let downloadUrl: string | undefined;
        if (j.status === JobStatus.COMPLETED && j.outputS3Key) {
          downloadUrl = await s3Service.getPresignedDownloadUrl(j.outputS3Key, 3600);
        }
        return {
          ...this.serializeJob(j),
          downloadUrl,
        };
      })
    );

    return {
      jobs: serializedJobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async cancelJob(userId: string, jobId: string) {
    const job = await prisma.processingJob.findFirst({
      where: { id: jobId, userId },
    });

    if (!job) {
      throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
    }

    if (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) {
      throw new AppError('Cannot cancel a finished job', 400, 'CANNOT_CANCEL');
    }

    const cancelledJob = await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.CANCELLED,
        errorMessage: 'Operation cancelled by user request',
      },
    });

    await prisma.processingHistory.create({
      data: {
        jobId,
        status: JobStatus.CANCELLED,
        message: 'Job cancelled by user',
        progress: job.progress,
      },
    });

    return this.serializeJob(cancelledJob);
  }

  private serializeJob(job: any) {
    return {
      id: job.id,
      userId: job.userId,
      documentId: job.documentId,
      toolType: job.toolType,
      status: job.status,
      progress: job.progress,
      parameters: job.parameters,
      outputS3Key: job.outputS3Key,
      outputFileName: job.outputFileName,
      outputFileSize: job.outputFileSize ? Number(job.outputFileSize) : null,
      errorMessage: job.errorMessage,
      executionTimeMs: job.executionTimeMs,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      createdAt: job.createdAt,
      document: job.document
        ? {
            id: job.document.id,
            title: job.document.title,
            fileType: job.document.fileType,
          }
        : null,
    };
  }
}

export const jobService = new JobService();
