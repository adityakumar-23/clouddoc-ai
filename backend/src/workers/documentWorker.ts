import { Worker, Job } from 'bullmq';
import { redisClient } from '../config/redis';
import { documentProcessingService } from '../services/processors/documentProcessing.service';
import { DocumentJobData } from '../queues/documentQueue';
import { logger } from '../config/logger';

export function startWorker() {
  if (!redisClient) {
    logger.warn('Cannot start BullMQ worker: Redis client is not configured.');
    return;
  }

  logger.info('Starting BullMQ Document Processing Worker...');

  const worker = new Worker<DocumentJobData>(
    'document-processing',
    async (job: Job<DocumentJobData>) => {
      logger.info(`Worker picked up job ${job.data.jobId} [${job.data.toolType}]`);
      return documentProcessingService.processJob(job.data.jobId);
    },
    {
      connection: redisClient,
      concurrency: 5, // Process up to 5 concurrent document conversions per worker instance
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Worker finished job ${job.data.jobId}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Worker failed job ${job?.data?.jobId}:`, err);
  });

  worker.on('error', (err) => {
    logger.error('Worker internal error:', err);
  });

  return worker;
}

if (require.main === module) {
  startWorker();
}
