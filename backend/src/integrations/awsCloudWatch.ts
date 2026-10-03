import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  CreateLogStreamCommand,
  DescribeLogStreamsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class CloudWatchService {
  private client: CloudWatchLogsClient | null = null;
  private sequenceToken: string | undefined = undefined;
  private isEnabled: boolean = false;

  constructor() {
    this.isEnabled = env.ENABLE_CLOUDWATCH;
    if (this.isEnabled) {
      try {
        const config: any = { region: env.AWS_REGION };
        if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
          config.credentials = {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          };
        }
        this.client = new CloudWatchLogsClient(config);
        logger.info(`AWS CloudWatch logging enabled. Target: ${env.CLOUDWATCH_LOG_GROUP}/${env.CLOUDWATCH_LOG_STREAM}`);
      } catch (err) {
        logger.error('Failed to initialize CloudWatchLogsClient:', err);
      }
    }
  }

  async logEvent(message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO', extra: Record<string, any> = {}): Promise<void> {
    if (!this.isEnabled || !this.client) {
      return;
    }

    try {
      const payload = {
        timestamp: Date.now(),
        message: JSON.stringify({
          level,
          message,
          service: 'clouddoc-backend',
          ...extra,
          timestamp: new Date().toISOString(),
        }),
      };

      const command = new PutLogEventsCommand({
        logGroupName: env.CLOUDWATCH_LOG_GROUP,
        logStreamName: env.CLOUDWATCH_LOG_STREAM,
        logEvents: [payload],
        sequenceToken: this.sequenceToken,
      });

      const response = await this.client.send(command);
      this.sequenceToken = response.nextSequenceToken;
    } catch (err: any) {
      // In production, sequence token mismatch may occur; fetch next token
      logger.warn(`CloudWatch dispatch issue: ${err.message}`);
    }
  }
}

export const cloudWatch = new CloudWatchService();
