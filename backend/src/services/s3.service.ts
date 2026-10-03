import { storage, StorageUploadResult } from '../config/s3';
import { env } from '../config/env';
import { sanitizeFilename } from '../middleware/fileValidation.middleware';
import { v4 as uuidv4 } from 'uuid';

export class S3Service {
  generateOriginalKey(userId: string, originalName: string, docId?: string): string {
    const id = docId || uuidv4();
    const sanitized = sanitizeFilename(originalName);
    return `original/${userId}/${id}/${sanitized}`;
  }

  generateProcessedKey(userId: string, jobId: string, fileName: string): string {
    const sanitized = sanitizeFilename(fileName);
    return `processed/${userId}/${jobId}/${sanitized}`;
  }

  generateTemporaryKey(jobId: string, fileName: string): string {
    const sanitized = sanitizeFilename(fileName);
    return `temporary/${jobId}/${sanitized}`;
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<StorageUploadResult> {
    return storage.uploadFile(key, buffer, mimeType);
  }

  async getFileBuffer(key: string): Promise<Buffer> {
    return storage.getFileBuffer(key);
  }

  async deleteFile(key: string): Promise<void> {
    return storage.deleteFile(key);
  }

  async getPresignedDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    return storage.getDownloadSignedUrl(key, expiresInSeconds);
  }

  async getPresignedUploadUrl(key: string, mimeType: string, expiresInSeconds = 900): Promise<string> {
    return storage.getUploadSignedUrl(key, mimeType, expiresInSeconds);
  }

  getBucketName(): string {
    return env.AWS_S3_BUCKET;
  }
}

export const s3Service = new S3Service();
