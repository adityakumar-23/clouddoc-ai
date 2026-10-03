export type Role = 'USER' | 'ADMIN' | 'AUDITOR';

export type DocumentStatus = 'PENDING' | 'READY' | 'PROCESSING' | 'FAILED';

export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isVerified: boolean;
  avatarUrl?: string;
  plan?: string;
  storageUsedBytes?: number;
  storageLimitBytes?: number;
  createdAt: string;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  s3Bucket: string;
  s3Key: string;
  pageCount: number;
  isFavorite: boolean;
  status: DocumentStatus;
  metadata?: {
    author?: string;
    extractedTextPreview?: string;
    keywords?: string[];
    ocrPerformed?: boolean;
    ocrConfidence?: number;
  };
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
  versions?: DocumentVersion[];
  processingJobs?: ProcessingJob[];
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  fileSize: number;
  operation: string;
  createdAt: string;
}

export interface ProcessingJob {
  id: string;
  userId: string;
  documentId?: string;
  toolType: string;
  status: JobStatus;
  progress: number;
  parameters?: Record<string, any>;
  outputS3Key?: string;
  outputFileName?: string;
  outputFileSize?: number;
  errorMessage?: string;
  executionTimeMs?: number;
  downloadUrl?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  document?: {
    id: string;
    title: string;
    fileType: string;
  };
  history?: Array<{
    id: string;
    status: JobStatus;
    message: string;
    progress: number;
    createdAt: string;
  }>;
}

export interface Citation {
  page: number;
  snippet: string;
  score: number;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  sender: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  citations?: Citation[];
  promptTokens?: number;
  completionTokens?: number;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  documentId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  document?: {
    id: string;
    title: string;
  };
  messages?: AIMessage[];
}

export interface SummaryResult {
  executiveSummary: string;
  keyPoints: string[];
  actionItems: string[];
  entities: {
    dates: string[];
    monetaryValues: string[];
    organizations: string[];
  };
  classification: string;
}

export interface AdminStats {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalDocuments: number;
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    successRate: number;
    totalStorageBytes: number;
    totalConversions: number;
    totalAiRequests: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    ipAddress?: string;
    createdAt: string;
    user?: { email: string; fullName: string };
  }>;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptime: number;
  subsystems: {
    database: { type: string; status: string };
    storage: { type: string; status: string };
    redis: { type: string; status: string };
  };
  server: {
    cpuUsage: number[];
    freeMemory: number;
    totalMemory: number;
    nodeVersion: string;
    platform: string;
  };
}
