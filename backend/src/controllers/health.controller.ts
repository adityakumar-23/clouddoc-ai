import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/database';
import { storage } from '../config/s3';

export async function getHealth(req: Request, res: Response): Promise<void> {
  const [dbOk, storageOk] = await Promise.all([
    checkDatabaseConnection(),
    storage.checkHealth(),
  ]);

  const isHealthy = dbOk && storageOk;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    database: dbOk ? 'connected' : 'disconnected',
    storage: storageOk ? 'available' : 'unavailable',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'clouddoc-backend-api',
  });
}
