import { Queue } from 'bullmq';
import { redisClient, isRedisAvailable } from '../config/redis';
import { documentProcessingService } from '../services/processors/documentProcessing.service';
import { logger } from '../config/logger';

export interface DocumentJobData {
  jobId: string;
  userId: string;
  toolType: string;
}

export let documentQueue: Queue<DocumentJobData> | null = null;

if (redisClient && isRedisAvailable) {
  try {
    documentQueue = new Queue<DocumentJobData>('document-processing', {
      connection: redisClient,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
    logger.info('BullMQ Document Processing Queue initialized with Redis');
  } catch (err: any) {
    logger.warn(`Failed to initialize BullMQ queue: ${err.message}. Using In-Memory dispatcher.`);
    documentQueue = null;
  }
}

export async function enqueueDocumentJob(jobData: DocumentJobData): Promise<void> {
  if (documentQueue && isRedisAvailable) {
    await documentQueue.add('process-document', jobData, {
      jobId: jobData.jobId,
    });
    logger.info(`Job ${jobData.jobId} enqueued to BullMQ Redis Queue`);
  } else {
    // In-memory async worker fallback for local development & zero-dependency environments
    logger.info(`Job ${jobData.jobId} submitted to in-memory asynchronous dispatcher`);
    setImmediate(async () => {
      try {
        await documentProcessingService.processJob(jobData.jobId);
      } catch (err: any) {
        logger.error(`In-memory worker execution failed for job ${jobData.jobId}:`, err);
      }
    });
  }
}
