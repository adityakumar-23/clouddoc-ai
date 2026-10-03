import { Request } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export async function recordAuditLog(
  req: Request,
  action: string,
  entityType: string,
  entityId?: string,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';
    const userId = req.user?.id || null;

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId || null,
        ipAddress,
        userAgent,
        details,
      },
    });
  } catch (error: any) {
    logger.error('Failed to create audit log entry:', error);
  }
}
