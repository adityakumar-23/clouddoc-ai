# CloudDoc AI — AI-Powered Cloud Document Processing & Conversion Platform

CloudDoc AI is a production-grade, enterprise-ready cloud document management and processing SaaS built on modern cloud-native principles. It provides high-performance document conversions (PDF, Word, Excel, PowerPoint, Images), page-level manipulations, OCR extraction, and citation-backed generative AI workflows (Summarization, Q&A, Entity Extraction) designed for deployment on AWS (EC2, RDS PostgreSQL, S3, CloudWatch).

---

## Key Highlights

- **Enterprise SaaS Aesthetic:** Sleek, responsive, dark/light mode interface built with React 18, Vite, Tailwind CSS, and Lucide icons.
- **Production AWS Architecture:** Decoupled storage using Amazon S3 with pre-signed upload/download URLs, server-side encryption (SSE-S3), and automated lifecycle policies.
- **PostgreSQL Database:** Powered by Prisma ORM configured for Amazon RDS PostgreSQL (no local MongoDB or Firebase compromises).
- **Asynchronous Job Engine:** Heavy document parsing and conversions are queued through BullMQ + Redis with dedicated worker pools and real-time progress polling.
- **RAG-Powered AI Engine:** Chunking, cosine similarity embeddings, and citations that point users back to exact page numbers and quotes.
- **Local & Cloud Portability:** Clean dual-driver pattern (`S3StorageDriver` / `LocalStorageDriver`, `BullMQ Redis` / `In-Memory Queue`, `OpenAI` / `Heuristic Vector RAG`) ensuring frictionless local development without needing an active AWS account.
- **Full Admin Control Plane:** User role management, document tracking, failed job retries, real-time platform metrics, and audit logging.

---

## Architecture Overview

```
                      +-----------------------------+
                      |   CloudDoc AI Web Client    |
                      |   (React 18 + Vite + SPA)   |
                      +--------------+--------------+
                                     |  HTTPS (Port 443 / Route 53 + ALB)
                                     v
                      +-----------------------------+
                      |     Nginx Reverse Proxy     |
                      |       (AWS EC2 Host)        |
                      +--------------+--------------+
                                     |  Reverse Proxy (Port 5000)
                                     v
                      +-----------------------------+
                      |   Express + TypeScript API  |
                      |       (PM2 Cluster)         |
                      +-------+-------------+-------+
                              |             |
            +-----------------+             +-----------------+
            |                                                 |
            v                                                 v
  +-------------------+                             +-------------------+
  |  Prisma Client    |                             |  BullMQ Job Queue |
  |   (ORM Layer)     |                             |   (Redis 7.x)     |
  +---------+---------+                             +---------+---------+
            |                                                 |
            v                                                 v
+-----------------------+                         +-----------------------+
|  Amazon RDS Postgres  |                         |  Document Workers     |
|   (Multi-AZ db.m6g)   |                         |  (PDF-Lib, Mammoth,   |
+-----------------------+                         |   Tesseract OCR)      |
                                                  +-----------+-----------+
                                                              |
                                                              v
                                                  +-----------------------+
                                                  |   Amazon S3 Bucket    |
                                                  |  (SSE-S3 Encryption)  |
                                                  +-----------------------+
```

---

## Directory Structure

```
CloudDoc/
├── ARCHITECTURE.md                  # Comprehensive architectural blueprint
├── README.md                        # Primary project documentation
├── package.json                     # Root workspace configuration
├── docker-compose.yml               # Multi-container orchestration (App, DB, Redis)
├── ecosystem.config.js              # PM2 production cluster configuration
├── .env.example                     # Environment template with safe defaults
├── .github/
│   └── workflows/
│       └── deploy.yml               # GitHub Actions CI/CD to AWS EC2
├── docs/
│   ├── AWS_DEPLOYMENT.md            # 20-step production deployment manual
│   └── API_DOCUMENTATION.md         # Full REST API v1 specification
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma            # RDS PostgreSQL relational schema
│   │   └── seed.ts                  # Development and demo database seeder
│   ├── src/
│   │   ├── config/                  # Envs, Database, S3 Driver, Redis, Logger
│   │   ├── controllers/             # Auth, User, Document, Tool, AI, Admin, Health
│   │   ├── middleware/              # JWT, RBAC, Rate Limiting, File Validation, Error
│   │   ├── routes/                  # Express REST routes mounted under /api/v1
│   │   ├── queues/                  # BullMQ job queue definitions
│   │   ├── workers/                 # Background document processor worker
│   │   ├── services/
│   │   │   ├── processors/          # PDF/Word/Excel/PPT/Image conversion engines
│   │   │   ├── ocr/                 # Tesseract OCR & AWS Textract adapters
│   │   │   ├── ai/                  # Embeddings, Vector RAG, Citations, Summarizer
│   │   │   ├── document.service.ts
│   │   │   ├── s3.service.ts
│   │   │   └── auth.service.ts
│   │   ├── app.ts                   # Express application setup
│   │   └── server.ts                # Server entrypoint & graceful shutdown
│   └── tests/                       # Jest unit & integration test suites
└── frontend/
    ├── Dockerfile
    ├── nginx.conf                   # Production SPA Nginx configuration
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── components/              # UI library (Buttons, Modals, Cards, Tables)
        ├── context/                 # Auth, Theme (Dark/Light), Toast systems
        ├── layouts/                 # Public, Dashboard, and Admin layouts
        ├── pages/
        │   ├── public/              # Landing (14 sections), Auth, Legal
        │   ├── authenticated/       # Dashboard, Documents, Upload, Detail, Profile
        │   ├── tools/               # 11 Dedicated document conversion tool workspaces
        │   ├── ai/                  # Summarization, RAG Chat, OCR Extraction
        │   └── admin/               # Dashboard, Users, Documents, Jobs, Logs, Settings
        ├── services/                # Axios API client with automatic token refresh
        └── App.tsx                  # Client-side router with route protection
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- Docker & Docker Compose (optional, for local PostgreSQL & Redis)

### Option 1: Quick Start with Local SQLite/Postgres & Local Storage (Zero AWS Required)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/clouddoc-ai.git
   cd clouddoc-ai
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example backend/.env
   ```
   *(The default `.env.example` is preconfigured to use `STORAGE_DRIVER=local` and `AI_PROVIDER=heuristic` for instant offline testing!)*

4. **Initialize Database & Seed Sample Data:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   ```

   **Default Accounts Created:**
   - **Administrator:** `admin@clouddoc.ai` / `AdminSecret2026!`
   - **Demo User:** `demo@clouddoc.ai` / `DemoUser2026!`

5. **Start Development Servers:**
   - Backend API:
     ```bash
     cd backend && npm run dev
     ```
   - Frontend SPA:
     ```bash
     cd frontend && npm run dev
     ```
   Open [http://localhost:3000](http://localhost:3000) in your browser!

---

### Option 2: Run via Docker Compose

```bash
docker-compose up --build
```
This spins up PostgreSQL 16, Redis 7, the Express Backend API, and the Nginx-hosted Frontend SPA automatically.

---

## AWS Deployment

Full step-by-step instructions for provisioning VPC, RDS PostgreSQL, S3, IAM Roles, Ubuntu EC2, Nginx, PM2, and CloudWatch can be found in:

👉 **[AWS Deployment Guide](file:///docs/AWS_DEPLOYMENT.md)**

---

## REST API Reference

Full specification with request/response schemas:

👉 **[API Documentation](file:///docs/API_DOCUMENTATION.md)**

---

## Automated Testing

Run the test suite across processors, file validation, and AI RAG modules:
```bash
cd backend
npm test
```

---

## Security & Compliance Checklist

- [x] **Zero Plaintext Secrets:** No credentials committed to git; all secrets read via environment variables.
- [x] **Private Storage:** S3 buckets block all public access; all downloads mediated via short-lived pre-signed URLs.
- [x] **Least Privilege:** EC2 operates under IAM Roles (`CloudDocEC2InstanceRole`) rather than hardcoded access keys.
- [x] **Strict File Validation:** Magic byte/MIME inspection and file extension validation; malicious filenames sanitized.
- [x] **Rate Limiting:** IP and user-based throttling against denial-of-service attempts.
- [x] **Secure Headers:** Helmet, strict CORS policies, and no referrer leakage.
- [x] **Audit Trail:** Immutable database logging of sensitive administrative and document actions.

---

## License

MIT License. Built with ❤️ for enterprise cloud document engineering.
