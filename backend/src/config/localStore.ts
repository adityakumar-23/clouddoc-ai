import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { logger } from './logger';

export interface LocalDbData {
  users: any[];
  documents: any[];
  jobs: any[];
  auditLogs: any[];
  subscriptions: any[];
  usageMetrics: any[];
  conversations: any[];
  messages: any[];
}

const STORAGE_DIR = path.resolve(process.cwd(), 'storage');
const DB_FILE = path.join(STORAGE_DIR, 'clouddoc_local_db.json');

// Default initial seed data for local offline development
function getInitialSeedData(): LocalDbData {
  const adminPasswordHash = bcrypt.hashSync('AdminSecret2026!', 10);
  const demoPasswordHash = bcrypt.hashSync('DemoUser2026!', 10);

  const adminUser = {
    id: 'usr_admin_default',
    email: 'admin@clouddoc.ai',
    passwordHash: adminPasswordHash,
    fullName: 'System Administrator',
    role: 'ADMIN',
    isVerified: true,
    verificationToken: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const demoUser = {
    id: 'usr_demo_default',
    email: 'demo@clouddoc.ai',
    passwordHash: demoPasswordHash,
    fullName: 'Alex Mercer (Demo)',
    role: 'USER',
    isVerified: true,
    verificationToken: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const demoDoc = {
    id: 'doc_demo_sample_01',
    userId: 'usr_demo_default',
    originalName: 'Cloud_Architecture_Overview.pdf',
    fileType: 'PDF',
    fileSizeBytes: 2450000,
    pageCount: 12,
    s3Key: 'original/usr_demo_default/Cloud_Architecture_Overview.pdf',
    isFavorite: true,
    isArchived: false,
    deletedAt: null,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const demoJob = {
    id: 'job_demo_sample_01',
    userId: 'usr_demo_default',
    documentId: 'doc_demo_sample_01',
    operation: 'PDF_TO_WORD',
    status: 'COMPLETED',
    progress: 100,
    resultS3Key: 'processed/usr_demo_default/Cloud_Architecture_Overview.docx',
    errorMessage: null,
    processingTimeMs: 1420,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    users: [adminUser, demoUser],
    documents: [demoDoc],
    jobs: [demoJob],
    auditLogs: [],
    subscriptions: [
      { id: 'sub_admin', userId: 'usr_admin_default', plan: 'ENTERPRISE', status: 'ACTIVE' },
      { id: 'sub_demo', userId: 'usr_demo_default', plan: 'PRO', status: 'ACTIVE' },
    ],
    usageMetrics: [
      { id: 'usg_admin', userId: 'usr_admin_default', storageUsedBytes: 0, storageLimitBytes: 107374182400, monthlyConversions: 5, monthlyAiRequests: 20 },
      { id: 'usg_demo', userId: 'usr_demo_default', storageUsedBytes: 2450000, storageLimitBytes: 10737418240, monthlyConversions: 18, monthlyAiRequests: 42 },
    ],
    conversations: [],
    messages: [],
  };
}

class LocalStoreManager {
  private data: LocalDbData;

  constructor() {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        logger.warn('Could not read existing local database file, re-initializing.');
        this.data = getInitialSeedData();
        this.save();
      }
    } else {
      this.data = getInitialSeedData();
      this.save();
    }
  }

  private save() {
    try {
      const serialized = JSON.stringify(
        this.data,
        (_key, value) => (typeof value === 'bigint' ? Number(value) : value),
        2
      );
      fs.writeFileSync(DB_FILE, serialized, 'utf-8');
    } catch (err) {
      logger.error('Failed to persist local database to disk:', err);
    }
  }

  // --- USER REPOSITORY ---
  user = {
    findUnique: async (args: { where: { email?: string; id?: string; verificationToken?: string; resetPasswordToken?: string }; include?: any }) => {
      const user = this.data.users.find((u) => {
        if (args.where.email && u.email.toLowerCase() === args.where.email.toLowerCase()) return true;
        if (args.where.id && u.id === args.where.id) return true;
        if (args.where.verificationToken && u.verificationToken === args.where.verificationToken) return true;
        if (args.where.resetPasswordToken && u.resetPasswordToken === args.where.resetPasswordToken) return true;
        return false;
      });

      if (!user) return null;

      const result = { ...user };
      if (args.include?.subscription) {
        result.subscription = this.data.subscriptions.find((s) => s.userId === user.id) || { plan: 'FREE', status: 'ACTIVE' };
      }
      if (args.include?.usage) {
        const u = this.data.usageMetrics.find((m) => m.userId === user.id);
        result.usage = u
          ? {
              ...u,
              storageUsedBytes: BigInt(Number(u.storageUsedBytes || 0)),
              storageLimitBytes: BigInt(Number(u.storageLimitBytes || 524288000)),
            }
          : { storageUsedBytes: BigInt(0), storageLimitBytes: BigInt(524288000), monthlyConversions: 0, monthlyAiRequests: 0 };
      }
      return result;
    },

    findFirst: async (args: any) => {
      return this.user.findUnique(args);
    },

    findMany: async (args?: { where?: any; skip?: number; take?: number; orderBy?: any }) => {
      let list = [...this.data.users];
      if (args?.where?.role) {
        list = list.filter((u) => u.role === args.where.role);
      }
      if (args?.skip) list = list.slice(args.skip);
      if (args?.take) list = list.slice(0, args.take);
      return list;
    },

    count: async (args?: any) => {
      return this.data.users.length;
    },

    create: async (args: { data: any; select?: any }) => {
      const id = 'usr_' + crypto.randomBytes(8).toString('hex');
      const newUser = {
        id,
        email: args.data.email.toLowerCase().trim(),
        passwordHash: args.data.passwordHash,
        fullName: args.data.fullName,
        role: args.data.role || 'USER',
        isVerified: args.data.isVerified !== undefined ? args.data.isVerified : true,
        verificationToken: args.data.verificationToken || null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.data.users.push(newUser);

      // Subscription
      const sub = {
        id: 'sub_' + crypto.randomBytes(6).toString('hex'),
        userId: id,
        plan: args.data.subscription?.create?.plan || 'FREE',
        status: args.data.subscription?.create?.status || 'ACTIVE',
      };
      this.data.subscriptions.push(sub);

      // Usage
      const usg = {
        id: 'usg_' + crypto.randomBytes(6).toString('hex'),
        userId: id,
        storageUsedBytes: BigInt(0),
        storageLimitBytes: BigInt(524288000), // 500 MB
        monthlyConversions: 0,
        monthlyAiRequests: 0,
      };
      this.data.usageMetrics.push(usg);

      this.save();

      return {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt,
      };
    },

    update: async (args: { where: { id?: string; email?: string }; data: any }) => {
      const idx = this.data.users.findIndex((u) => (args.where.id ? u.id === args.where.id : u.email === args.where.email));
      if (idx === -1) throw new Error('User not found');
      this.data.users[idx] = { ...this.data.users[idx], ...args.data, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.users[idx];
    },
  };

  // --- DOCUMENT REPOSITORY ---
  document = {
    findMany: async (args?: { where?: any; skip?: number; take?: number; orderBy?: any }) => {
      let list = [...this.data.documents].filter((d) => !d.deletedAt);

      if (args?.where?.userId) {
        list = list.filter((d) => d.userId === args.where.userId);
      }
      if (args?.where?.fileType) {
        list = list.filter((d) => d.fileType === args.where.fileType);
      }
      if (args?.where?.isFavorite !== undefined) {
        list = list.filter((d) => d.isFavorite === args.where.isFavorite);
      }
      if (args?.where?.originalName?.contains) {
        const term = args.where.originalName.contains.toLowerCase();
        list = list.filter((d) => d.originalName.toLowerCase().includes(term));
      }

      // Sort
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (args?.skip) list = list.slice(args.skip);
      if (args?.take) list = list.slice(0, args.take);

      return list.map((doc) => ({
        ...doc,
        fileSize: doc.fileSize ?? doc.fileSizeBytes ?? 0,
        versions: [],
        processingJobs: [],
      }));
    },

    findUnique: async (args: { where: { id: string } }) => {
      const doc = this.data.documents.find((d) => d.id === args.where.id && !d.deletedAt);
      if (!doc) return null;
      return {
        ...doc,
        fileSize: doc.fileSize ?? doc.fileSizeBytes ?? 0,
        versions: [
          {
            id: 'ver_' + doc.id,
            versionNumber: 1,
            fileSize: doc.fileSize ?? doc.fileSizeBytes ?? 0,
            operation: 'INITIAL_UPLOAD',
            createdAt: doc.createdAt,
          },
        ],
        processingJobs: this.data.jobs.filter((j) => j.documentId === doc.id),
      };
    },

    findFirst: async (args: { where: { id: string; userId?: string } }) => {
      const doc = this.data.documents.find((d) => {
        if (d.deletedAt) return false;
        if (d.id !== args.where.id) return false;
        if (args.where.userId && d.userId !== args.where.userId) return false;
        return true;
      });
      if (!doc) return null;
      return {
        ...doc,
        fileSize: doc.fileSize ?? doc.fileSizeBytes ?? 0,
        versions: [
          {
            id: 'ver_' + doc.id,
            versionNumber: 1,
            fileSize: doc.fileSize ?? doc.fileSizeBytes ?? 0,
            operation: 'INITIAL_UPLOAD',
            createdAt: doc.createdAt,
          },
        ],
        processingJobs: this.data.jobs.filter((j) => j.documentId === doc.id),
      };
    },

    create: async (args: { data: any }) => {
      const id = 'doc_' + crypto.randomBytes(8).toString('hex');
      const size = Number(args.data.fileSize ?? args.data.fileSizeBytes ?? 0);
      const newDoc = {
        id,
        userId: args.data.userId,
        title: args.data.title || args.data.originalName,
        originalName: args.data.originalName,
        fileType: args.data.fileType,
        mimeType: args.data.mimeType || 'application/octet-stream',
        fileSize: size,
        fileSizeBytes: size,
        s3Bucket: args.data.s3Bucket || 'local-storage',
        s3Key: args.data.s3Key,
        pageCount: args.data.pageCount || 1,
        status: args.data.status || 'READY',
        metadata: args.data.metadata || {},
        isFavorite: false,
        isArchived: false,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.data.documents.unshift(newDoc);

      // Increment user storage
      const usage = this.data.usageMetrics.find((m) => m.userId === args.data.userId);
      if (usage) {
        const cur = Number(usage.storageUsedBytes || 0);
        usage.storageUsedBytes = BigInt(Math.max(0, cur + size));
      }

      this.save();
      return newDoc;
    },

    update: async (args: { where: { id: string }; data: any }) => {
      const idx = this.data.documents.findIndex((d) => d.id === args.where.id);
      if (idx === -1) throw new Error('Document not found');
      this.data.documents[idx] = { ...this.data.documents[idx], ...args.data, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.documents[idx];
    },

    count: async (args?: { where?: any }) => {
      let list = this.data.documents.filter((d) => !d.deletedAt);
      if (args?.where?.userId) {
        list = list.filter((d) => d.userId === args.where.userId);
      }
      return list.length;
    },

    delete: async (args: { where: { id: string } }) => {
      const idx = this.data.documents.findIndex((d) => d.id === args.where.id);
      if (idx !== -1) {
        this.data.documents.splice(idx, 1);
        this.save();
      }
      return { id: args.where.id };
    },
  };

  // --- PROCESSING JOBS ---
  processingJob = {
    findUnique: async (args: { where: { id: string }; include?: any }) => {
      const job = this.data.jobs.find((j) => j.id === args.where.id);
      if (!job) return null;
      const res = { ...job };
      if (args.include?.document && job.documentId) {
        res.document = this.data.documents.find((d) => d.id === job.documentId) || null;
      }
      if (args.include?.user && job.userId) {
        res.user = this.data.users.find((u) => u.id === job.userId) || null;
      }
      res.history = [];
      return res;
    },

    findFirst: async (args: { where: { id: string; userId?: string }; include?: any }) => {
      return this.processingJob.findUnique(args);
    },

    findMany: async (args?: { where?: any; skip?: number; take?: number; orderBy?: any; include?: any }) => {
      let list = [...this.data.jobs];
      if (args?.where?.userId) {
        list = list.filter((j) => j.userId === args.where.userId);
      }
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (args?.skip) list = list.slice(args.skip);
      if (args?.take) list = list.slice(0, args.take);

      return list.map((job) => {
        const res = { ...job };
        if (args?.include?.document && job.documentId) {
          res.document = this.data.documents.find((d) => d.id === job.documentId) || null;
        }
        res.history = [];
        return res;
      });
    },

    create: async (args: { data: any; include?: any }) => {
      const id = 'job_' + crypto.randomBytes(8).toString('hex');
      const newJob = {
        id,
        userId: args.data.userId,
        documentId: args.data.documentId || null,
        toolType: args.data.toolType || args.data.operation,
        operation: args.data.operation || args.data.toolType,
        status: args.data.status || 'QUEUED',
        progress: args.data.progress || 0,
        parameters: args.data.parameters || {},
        resultS3Key: args.data.resultS3Key || null,
        outputS3Key: null,
        outputFileName: null,
        outputFileSize: null,
        errorMessage: null,
        processingTimeMs: null,
        startedAt: null,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.jobs.unshift(newJob);
      this.save();

      const res: any = { ...newJob };
      if (args.include?.document && newJob.documentId) {
        res.document = this.data.documents.find((d) => d.id === newJob.documentId) || null;
      }
      res.history = [];
      return res;
    },

    update: async (args: { where: { id: string }; data: any }) => {
      const idx = this.data.jobs.findIndex((j) => j.id === args.where.id);
      if (idx === -1) throw new Error('Job not found');

      const updated = {
        ...this.data.jobs[idx],
        ...args.data,
        outputFileSize: args.data.outputFileSize ? Number(args.data.outputFileSize) : this.data.jobs[idx].outputFileSize,
        updatedAt: new Date().toISOString(),
      };
      this.data.jobs[idx] = updated;
      this.save();
      return updated;
    },

    count: async (args?: { where?: any }) => {
      let list = this.data.jobs;
      if (args?.where?.status) {
        list = list.filter((j) => j.status === args.where.status);
      }
      return list.length;
    },
  };

  // --- PROCESSING HISTORY ---
  processingHistory = {
    create: async (args: { data: any }) => {
      return {
        id: 'hist_' + crypto.randomBytes(6).toString('hex'),
        ...args.data,
        createdAt: new Date().toISOString(),
      };
    },
    findMany: async () => [],
  };

  // --- AUDIT LOGS ---
  auditLog = {
    create: async (args: { data: any }) => {
      const log = {
        id: 'log_' + crypto.randomBytes(6).toString('hex'),
        ...args.data,
        createdAt: new Date().toISOString(),
      };
      this.data.auditLogs.unshift(log);
      this.save();
      return log;
    },

    findMany: async (args?: { take?: number; skip?: number }) => {
      let list = [...this.data.auditLogs];
      if (args?.skip) list = list.slice(args.skip);
      if (args?.take) list = list.slice(0, args.take);
      return list;
    },

    count: async () => this.data.auditLogs.length,
  };

  // --- SUBSCRIPTIONS & USAGE ---
  subscription = {
    findUnique: async (args: { where: { userId: string } }) => {
      return this.data.subscriptions.find((s) => s.userId === args.where.userId) || { plan: 'FREE', status: 'ACTIVE' };
    },
  };

  usageMetric = {
    findUnique: async (args: { where: { userId: string } }) => {
      return (
        this.data.usageMetrics.find((m) => m.userId === args.where.userId) || {
          storageUsedBytes: BigInt(0),
          storageLimitBytes: BigInt(524288000),
          monthlyConversions: 0,
          monthlyAiRequests: 0,
        }
      );
    },
    update: async (args: { where: { userId: string }; data: any }) => {
      const idx = this.data.usageMetrics.findIndex((m) => m.userId === args.where.userId);
      if (idx !== -1) {
        this.data.usageMetrics[idx] = { ...this.data.usageMetrics[idx], ...args.data };
        this.save();
        return this.data.usageMetrics[idx];
      }
      return args.data;
    },
    upsert: async (args: { where: { userId: string }; create: any; update: any }) => {
      const idx = this.data.usageMetrics.findIndex((m) => m.userId === args.where.userId);
      const inc = args.update?.storageUsedBytes?.increment !== undefined
        ? Number(args.update.storageUsedBytes.increment)
        : Number(args.create?.storageUsedBytes || 0);

      if (idx !== -1) {
        const cur = Number(this.data.usageMetrics[idx].storageUsedBytes || 0);
        this.data.usageMetrics[idx].storageUsedBytes = BigInt(Math.max(0, cur + inc));
        this.save();
        return this.data.usageMetrics[idx];
      } else {
        const newUsage = {
          id: 'usg_' + crypto.randomBytes(6).toString('hex'),
          userId: args.where.userId,
          storageUsedBytes: BigInt(Math.max(0, inc)),
          storageLimitBytes: BigInt(524288000),
          monthlyConversions: 0,
          monthlyAiRequests: 0,
        };
        this.data.usageMetrics.push(newUsage);
        this.save();
        return newUsage;
      }
    },
  };

  // --- AI CONVERSATIONS ---
  aiConversation = {
    findMany: async (args?: any) => this.data.conversations,
    create: async (args: { data: any }) => {
      const conv = { id: 'conv_' + crypto.randomBytes(6).toString('hex'), ...args.data, createdAt: new Date().toISOString() };
      this.data.conversations.unshift(conv);
      this.save();
      return conv;
    },
  };

  aIConversation = this.aiConversation;

  aiMessage = {
    create: async (args: { data: any }) => {
      const msg = { id: 'msg_' + crypto.randomBytes(6).toString('hex'), ...args.data, createdAt: new Date().toISOString() };
      this.data.messages.push(msg);
      this.save();
      return msg;
    },
  };

  aIMessage = this.aiMessage;
}

export const localStore = new LocalStoreManager();
