import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { env } from './env';
import { logger } from './logger';

export interface StorageUploadResult {
  bucket: string;
  key: string;
  size: number;
  mimeType: string;
}

export interface IStorageDriver {
  uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<StorageUploadResult>;
  getFileStream(key: string): Promise<NodeJS.ReadableStream>;
  getFileBuffer(key: string): Promise<Buffer>;
  deleteFile(key: string): Promise<void>;
  getDownloadSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  getUploadSignedUrl(key: string, mimeType: string, expiresInSeconds?: number): Promise<string>;
  checkHealth(): Promise<boolean>;
}

// ------------------------------------------------------------------------------
// Production AWS S3 Storage Driver
// ------------------------------------------------------------------------------
export class S3StorageDriver implements IStorageDriver {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = env.AWS_S3_BUCKET;

    // In AWS EC2, if AWS_ACCESS_KEY_ID is omitted, S3Client automatically uses
    // IAM Instance Role metadata service (recommended AWS best practice).
    const clientConfig: any = {
      region: env.AWS_REGION,
    };

    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      };
    }

    this.client = new S3Client(clientConfig);
    logger.info(`Initialized AWS S3 Storage Driver for bucket: ${this.bucket} in region: ${env.AWS_REGION}`);
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<StorageUploadResult> {
    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ServerSideEncryption: 'AES256', // SSE-S3 encryption at rest
    };

    await this.client.send(new PutObjectCommand(params));
    return {
      bucket: this.bucket,
      key,
      size: buffer.length,
      mimeType,
    };
  }

  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const response = await this.client.send(command);
    return response.Body as NodeJS.ReadableStream;
  }

  async getFileBuffer(key: string): Promise<Buffer> {
    const stream = await this.getFileStream(key);
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.client.send(command);
  }

  async getDownloadSignedUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async getUploadSignedUrl(key: string, mimeType: string, expiresInSeconds = 900): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
      ServerSideEncryption: 'AES256',
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async checkHealth(): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: 'health-check-probe.tmp',
      });
      // Will return 404 or 200, either confirms bucket communication
      await this.client.send(command).catch((err) => {
        if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) return;
        throw err;
      });
      return true;
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) return true;
      logger.error('S3 health check failed:', err);
      return false;
    }
  }
}

// ------------------------------------------------------------------------------
// Local Filesystem Storage Driver (Development & CI Fallback)
// ------------------------------------------------------------------------------
export class LocalStorageDriver implements IStorageDriver {
  private basePath: string;
  private bucket: string = 'local-clouddoc-storage';

  constructor() {
    this.basePath = path.resolve(process.cwd(), env.LOCAL_STORAGE_PATH);
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
    logger.info(`Initialized Local Filesystem Storage Driver at: ${this.basePath}`);
  }

  private resolveKeyPath(key: string): string {
    const safeKey = key.replace(/\.\./g, '');
    const fullPath = path.join(this.basePath, safeKey);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return fullPath;
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<StorageUploadResult> {
    const filePath = this.resolveKeyPath(key);
    await fs.promises.writeFile(filePath, buffer);
    return {
      bucket: this.bucket,
      key,
      size: buffer.length,
      mimeType,
    };
  }

  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    const filePath = this.resolveKeyPath(key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Storage object not found: ${key}`);
    }
    return fs.createReadStream(filePath);
  }

  async getFileBuffer(key: string): Promise<Buffer> {
    const filePath = this.resolveKeyPath(key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Storage object not found: ${key}`);
    }
    return fs.promises.readFile(filePath);
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = this.resolveKeyPath(key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  async getDownloadSignedUrl(key: string, expiresInSeconds = 900): Promise<string> {
    // In local mode, return an API download endpoint URL
    return `${env.API_URL}/documents/download-stream?key=${encodeURIComponent(key)}`;
  }

  async getUploadSignedUrl(key: string, mimeType: string, expiresInSeconds = 900): Promise<string> {
    // In local mode, uploads are accepted directly via standard multipart
    return `${env.API_URL}/documents/upload-direct?key=${encodeURIComponent(key)}`;
  }

  async checkHealth(): Promise<boolean> {
    try {
      await fs.promises.access(this.basePath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }
}

// Factory instantiation based on environment
export const storage: IStorageDriver =
  env.STORAGE_DRIVER === 's3' && env.AWS_ACCESS_KEY_ID && env.AWS_ACCESS_KEY_ID !== 'AKIAIOSFODNN7EXAMPLE'
    ? new S3StorageDriver()
    : new LocalStorageDriver();
