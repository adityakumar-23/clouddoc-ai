import { PrismaClient, Role, DocumentStatus, JobStatus, MessageSender, SubscriptionPlan } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CloudDoc AI Database Seeding...');

  // Clean existing tables in development
  await prisma.auditLog.deleteMany();
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.processingHistory.deleteMany();
  await prisma.processingJob.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.usageMetric.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password@1234', 12);

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@clouddoc.ai',
      passwordHash,
      fullName: 'Enterprise Administrator',
      role: Role.ADMIN,
      isVerified: true,
      subscription: {
        create: {
          plan: SubscriptionPlan.ENTERPRISE,
          status: 'ACTIVE',
        },
      },
      usage: {
        create: {
          storageUsedBytes: BigInt(254000000), // ~254 MB
          storageLimitBytes: BigInt(107374182400), // 100 GB
          monthlyConversions: 42,
          monthlyAiRequests: 185,
        },
      },
    },
  });
  console.log('✅ Created Admin user:', adminUser.email);

  // 2. Create Regular Demo User
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@clouddoc.ai',
      passwordHash,
      fullName: 'Sarah Jenkins',
      role: Role.USER,
      isVerified: true,
      subscription: {
        create: {
          plan: SubscriptionPlan.PRO,
          status: 'ACTIVE',
        },
      },
      usage: {
        create: {
          storageUsedBytes: BigInt(48500000), // ~48.5 MB
          storageLimitBytes: BigInt(10737418240), // 10 GB
          monthlyConversions: 18,
          monthlyAiRequests: 64,
        },
      },
    },
  });
  console.log('✅ Created Demo user:', demoUser.email);

  // 3. Create Sample Documents for Demo User
  const doc1 = await prisma.document.create({
    data: {
      userId: demoUser.id,
      title: 'Cloud Architecture & Cost Optimization Guide 2026',
      originalName: 'AWS_Architecture_Optimization.pdf',
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: BigInt(4194304), // 4 MB
      s3Bucket: 'clouddoc-documents-prod',
      s3Key: `original/${demoUser.id}/sample-doc-1/AWS_Architecture_Optimization.pdf`,
      pageCount: 16,
      isFavorite: true,
      status: DocumentStatus.READY,
      metadata: {
        author: 'CloudDoc Systems',
        extractedTextPreview: 'This whitepaper analyzes AWS multi-region failover, S3 Intelligent-Tiering strategies, and EC2 Graviton3 price-performance ratios...',
        keywords: ['AWS', 'Cloud Architecture', 'Cost Optimization', 'Kubernetes', 'EC2'],
        ocrPerformed: false,
      },
      versions: {
        create: [
          {
            versionNumber: 1,
            s3Key: `original/${demoUser.id}/sample-doc-1/AWS_Architecture_Optimization.pdf`,
            fileSize: BigInt(4194304),
            operation: 'INITIAL_UPLOAD',
          },
        ],
      },
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      userId: demoUser.id,
      title: 'Q3 Enterprise Financial Report & Forecasting',
      originalName: 'Q3_Financial_Analysis.docx',
      fileType: 'docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: BigInt(1887436), // ~1.8 MB
      s3Bucket: 'clouddoc-documents-prod',
      s3Key: `original/${demoUser.id}/sample-doc-2/Q3_Financial_Analysis.docx`,
      pageCount: 8,
      isFavorite: false,
      status: DocumentStatus.READY,
      metadata: {
        author: 'Finance & Strategy Group',
        extractedTextPreview: 'Consolidated revenue for the quarter reached $14.2M, representing a 28% year-over-year increase across SaaS recurring subscriptions...',
        keywords: ['Financials', 'Revenue', 'EBITDA', 'Q3', 'Forecast'],
      },
    },
  });

  const doc3 = await prisma.document.create({
    data: {
      userId: demoUser.id,
      title: 'Vendor Master Services Agreement - Scanned Execution',
      originalName: 'Scanned_MSA_Signed.pdf',
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: BigInt(8402910), // ~8.4 MB
      s3Bucket: 'clouddoc-documents-prod',
      s3Key: `original/${demoUser.id}/sample-doc-3/Scanned_MSA_Signed.pdf`,
      pageCount: 12,
      isFavorite: true,
      status: DocumentStatus.READY,
      metadata: {
        author: 'Legal Operations',
        extractedTextPreview: 'MASTER SERVICES AGREEMENT: This agreement entered into between Cloud Systems Inc and Enterprise Partners LLC...',
        keywords: ['Legal', 'MSA', 'Confidentiality', 'Liability'],
        ocrPerformed: true,
      },
    },
  });
  console.log('✅ Created 3 sample documents');

  // 4. Create Processing Jobs & Histories
  const job1 = await prisma.processingJob.create({
    data: {
      userId: demoUser.id,
      documentId: doc1.id,
      toolType: 'compress-pdf',
      status: JobStatus.COMPLETED,
      progress: 100,
      parameters: { compressionLevel: 'medium', stripMetadata: false },
      outputS3Key: `processed/${demoUser.id}/job-compress-1/AWS_Architecture_Optimization_compressed.pdf`,
      outputFileName: 'AWS_Architecture_Optimization_compressed.pdf',
      outputFileSize: BigInt(1782500),
      executionTimeMs: 1420,
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3598580),
      history: {
        create: [
          { status: JobStatus.QUEUED, message: 'Job placed in BullMQ queue', progress: 0 },
          { status: JobStatus.PROCESSING, message: 'Compressing stream objects and images', progress: 45 },
          { status: JobStatus.COMPLETED, message: 'Compressed PDF generated successfully (57.5% size reduction)', progress: 100 },
        ],
      },
    },
  });

  const job2 = await prisma.processingJob.create({
    data: {
      userId: demoUser.id,
      documentId: doc2.id,
      toolType: 'word-to-pdf',
      status: JobStatus.COMPLETED,
      progress: 100,
      parameters: { preserveBookmarks: true },
      outputS3Key: `processed/${demoUser.id}/job-word-1/Q3_Financial_Analysis.pdf`,
      outputFileName: 'Q3_Financial_Analysis.pdf',
      outputFileSize: BigInt(2105400),
      executionTimeMs: 2310,
      startedAt: new Date(Date.now() - 7200000),
      completedAt: new Date(Date.now() - 7197690),
      history: {
        create: [
          { status: JobStatus.QUEUED, message: 'Document conversion queued', progress: 0 },
          { status: JobStatus.PROCESSING, message: 'Rendering pages with typography preserving layout', progress: 60 },
          { status: JobStatus.COMPLETED, message: 'Converted DOCX to PDF successfully', progress: 100 },
        ],
      },
    },
  });

  const job3 = await prisma.processingJob.create({
    data: {
      userId: demoUser.id,
      documentId: doc3.id,
      toolType: 'ocr',
      status: JobStatus.COMPLETED,
      progress: 100,
      parameters: { language: 'eng', confidenceThreshold: 85 },
      outputS3Key: `processed/${demoUser.id}/job-ocr-1/Scanned_MSA_Signed_searchable.pdf`,
      outputFileName: 'Scanned_MSA_Signed_searchable.pdf',
      outputFileSize: BigInt(8600100),
      executionTimeMs: 4120,
      startedAt: new Date(Date.now() - 14400000),
      completedAt: new Date(Date.now() - 14395880),
      history: {
        create: [
          { status: JobStatus.QUEUED, message: 'OCR analysis enqueued', progress: 0 },
          { status: JobStatus.PROCESSING, message: 'Running optical character recognition on scanned pages', progress: 50 },
          { status: JobStatus.COMPLETED, message: 'Embedded invisible text layer for full document searchability', progress: 100 },
        ],
      },
    },
  });
  console.log('✅ Created 3 sample processing jobs');

  // 5. Create AI Conversation & Grounded Q&A Messages
  const conv1 = await prisma.aIConversation.create({
    data: {
      userId: demoUser.id,
      documentId: doc1.id,
      title: 'Cost Optimization Strategies Inquiry',
      messages: {
        create: [
          {
            sender: MessageSender.USER,
            content: 'What are the main recommendations for reducing S3 and EC2 costs outlined in this document?',
            promptTokens: 48,
          },
          {
            sender: MessageSender.ASSISTANT,
            content: `Based on the Cloud Architecture Guide, here are the primary cost reduction strategies:

1. **S3 Intelligent-Tiering:** Automatically moves objects between frequent, infrequent, and archive access tiers without retrieval fees, reducing storage costs by up to 68%.
2. **EC2 Graviton3 Migration:** Migrating general-purpose and compute-optimized workloads to ARM64 Graviton3 instances provides up to 25% better compute performance for 20% lower cost.
3. **VPC Endpoint Integration:** Routing S3 and DynamoDB traffic through Gateway VPC Endpoints eliminates NAT Gateway data processing charges ($0.045/GB).`,
            citations: [
              { page: 4, snippet: 'Enable S3 Intelligent-Tiering across buckets containing objects larger than 128KB.', score: 0.94 },
              { page: 7, snippet: 'AWS Graviton3 processors offer 25% compute uplift with 20% lower hourly EC2 rates.', score: 0.91 },
              { page: 11, snippet: 'Directing storage requests via Gateway Endpoints bypasses NAT egress charges.', score: 0.88 },
            ],
            promptTokens: 850,
            completionTokens: 142,
          },
        ],
      },
    },
  });
  console.log('✅ Created sample AI conversation with citations');

  // 6. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: demoUser.id,
        action: 'AUTH_LOGIN',
        entityType: 'USER',
        entityId: demoUser.id,
        ipAddress: '198.51.100.24',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        details: { method: 'password', mfa: false },
      },
      {
        userId: demoUser.id,
        action: 'DOCUMENT_UPLOAD',
        entityType: 'DOCUMENT',
        entityId: doc1.id,
        ipAddress: '198.51.100.24',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        details: { fileName: doc1.originalName, fileSize: Number(doc1.fileSize) },
      },
      {
        userId: demoUser.id,
        action: 'PROCESSING_JOB_COMPLETED',
        entityType: 'PROCESSING_JOB',
        entityId: job1.id,
        ipAddress: '127.0.0.1',
        userAgent: 'BullMQ-Worker/1.0',
        details: { toolType: 'compress-pdf', executionMs: 1420 },
      },
      {
        userId: adminUser.id,
        action: 'ADMIN_ACCESS',
        entityType: 'USER',
        entityId: adminUser.id,
        ipAddress: '203.0.113.19',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        details: { section: '/admin/dashboard' },
      },
    ],
  });
  console.log('✅ Created initial audit log entries');

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
