import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export let redisClient: Redis | null = null;
export let isRedisAvailable = false;

try {
  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis connection retry limit reached. Falling back to in-memory queue adapter for local development.');
        return null; // Stop retrying
      }
      return Math.min(times * 200, 1000);
    },
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    logger.info('Connected to Redis server successfully');
  });

  redisClient.on('error', (err) => {
    isRedisAvailable = false;
    // Log as warning rather than uncaught error to prevent process crash
    logger.warn(`Redis connection error: ${err.message}. Local queue fallback active.`);
  });
} catch (error: any) {
  isRedisAvailable = false;
  logger.warn(`Failed to initialize Redis client: ${error.message}. Local queue fallback active.`);
}

export async function checkRedisHealth(): Promise<boolean> {
  if (!redisClient || !isRedisAvailable) {
    return false;
  }
  try {
    const ping = await redisClient.ping();
    return ping === 'PONG';
  } catch {
    return false;
  }
}
