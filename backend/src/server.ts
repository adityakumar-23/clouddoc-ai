import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { checkDatabaseConnection, prisma } from './config/database';
import { startWorker } from './workers/documentWorker';
import { isRedisAvailable, redisClient } from './config/redis';

const server = app.listen(env.PORT, async () => {
  logger.info(`================================================================`);
  logger.info(`🚀 ${env.APP_NAME} Backend API Server running on port ${env.PORT}`);
  logger.info(`📍 Base URL: ${env.API_URL}`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
  logger.info(`📦 Storage Driver: ${env.STORAGE_DRIVER}`);
  logger.info(`================================================================`);

  // Verify Database Connection
  const dbConnected = await checkDatabaseConnection();
  if (dbConnected) {
    logger.info('✅ Amazon RDS PostgreSQL database connected successfully');
  } else {
    logger.warn('⚠️ Database connection pending or failed. Check DATABASE_URL in .env');
  }

  // Initialize background worker if redis is available
  if (isRedisAvailable) {
    try {
      startWorker();
      logger.info('✅ Background Document Processing Worker started successfully');
    } catch (err: any) {
      logger.warn(`Failed to auto-start worker: ${err.message}`);
    }
  } else {
    logger.info('ℹ️ Redis not detected. In-Memory Job Dispatcher will process async jobs.');
  }
});

// Graceful Shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Initiating graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await prisma.$disconnect();
      logger.info('Prisma disconnected.');
    } catch (err) {
      logger.error('Error disconnecting Prisma:', err);
    }

    if (redisClient) {
      try {
        await redisClient.quit();
        logger.info('Redis client disconnected.');
      } catch (err) {
        logger.error('Error disconnecting Redis:', err);
      }
    }

    process.exit(0);
  });

  // Force shutdown after 10s if lingering
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
