# CloudDoc AI — REST API Documentation (v1)

Base URL: `https://clouddoc.ai/api/v1` (Local: `http://localhost:5000/api/v1`)

All authenticated endpoints require an `Authorization: Bearer <JWT_ACCESS_TOKEN>` header.

---

## 1. System & Health

### `GET /health`
Returns live system health, database latency, storage driver connectivity, and background queue status.
- **Auth:** Public
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-03T09:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": { "status": "up", "latencyMs": 3 },
    "storage": { "status": "up", "driver": "s3" },
    "queue": { "status": "up", "waiting": 0, "active": 0 }
  }
}
```

---

## 2. Authentication (`/auth`)

### `POST /auth/register`
Creates a new tenant user account.
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cly101...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

### `POST /auth/login`
Authenticates user credentials and returns tokens.
- **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Response `200 OK`**: (Same structure as registration)

### `POST /auth/refresh-token`
Exchanges a valid refresh token for a new access token.
- **Request Body**: `{ "refreshToken": "..." }`

### `POST /auth/forgot-password`
Initiates password recovery email token.
- **Request Body**: `{ "email": "jane@example.com" }`

### `POST /auth/reset-password`
Resets password using signed token.
- **Request Body**: `{ "token": "...", "password": "NewPassword123!" }`

---

## 3. Users (`/users`)

### `GET /users/me`
Retrieves current profile, subscription tier, and usage statistics.
- **Auth:** Required
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "cly101...",
    "email": "demo@clouddoc.ai",
    "name": "Alex Mercer",
    "role": "USER",
    "subscription": {
      "plan": "PRO",
      "status": "ACTIVE",
      "maxStorageBytes": 10737418240,
      "maxJobsPerMonth": 500
    },
    "usage": {
      "storageUsed": 24903680,
      "jobsCount": 18,
      "aiTokensUsed": 45100
    }
  }
}
```

### `PUT /users/me`
Updates user profile metadata.

---

## 4. Documents (`/documents`)

### `POST /documents/upload`
Uploads one or multiple documents via `multipart/form-data`.
- **Auth:** Required
- **Content-Type:** `multipart/form-data`
- **Fields:** `files` (Array of files, max 50MB each, supported types: `.pdf`, `.docx`, `.pptx`, `.xlsx`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.tiff`)
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_101",
      "originalName": "Quarterly_Financial_Report.pdf",
      "fileType": "PDF",
      "fileSizeBytes": 2450000,
      "pageCount": 14,
      "s3Key": "original/user_1/1727950000-Quarterly_Financial_Report.pdf",
      "createdAt": "2026-10-03T09:12:00.000Z"
    }
  ]
}
```

### `GET /documents`
List documents with filtering, search, sorting, and pagination.
- **Auth:** Required
- **Query Params:**
  - `page`: default `1`
  - `limit`: default `10`
  - `search`: string keyword
  - `fileType`: `PDF` | `DOCX` | `PPTX` | `XLSX` | `IMAGE`
  - `isFavorite`: `true` | `false`
  - `sortBy`: `createdAt` | `originalName` | `fileSizeBytes`
  - `sortOrder`: `asc` | `desc`

### `GET /documents/:id`
Fetch single document details, versions, and active jobs.

### `GET /documents/:id/download`
Generates a secure, short-lived AWS S3 pre-signed download URL.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://clouddoc-production-documents.s3.amazonaws.com/original/user_1/...?AWSAccessKeyId=...&Signature=...",
    "expiresInSeconds": 900
  }
}
```

### `POST /documents/:id/favorite`
Toggles favorite bookmark status.

### `DELETE /documents/:id`
Soft-deletes document and marks associated S3 objects for asynchronous lifecycle purging.

---

## 5. Document Tools (`/tools`)

All tools create an asynchronous `ProcessingJob` queued through BullMQ / Redis.

### `POST /tools/pdf-to-word`
- **Body**: `{ "documentId": "doc_101" }`
- **Response `202 Accepted`**:
```json
{
  "success": true,
  "message": "Conversion job queued",
  "data": {
    "jobId": "job_998",
    "status": "QUEUED",
    "operation": "PDF_TO_WORD"
  }
}
```

### `POST /tools/merge`
- **Body**: `{ "documentIds": ["doc_101", "doc_102"], "outputFileName": "Combined_Report.pdf" }`

### `POST /tools/split`
- **Body**: `{ "documentId": "doc_101", "pageRanges": "1-3, 5, 8-10" }`

### `POST /tools/compress`
- **Body**: `{ "documentId": "doc_101", "compressionLevel": "medium" }`

### `POST /tools/rotate`
- **Body**: `{ "documentId": "doc_101", "angle": 90, "pages": "all" }`

### `POST /tools/page-management`
- **Body**: `{ "documentId": "doc_101", "action": "reorder", "newOrder": [3, 1, 2, 4] }`

### `POST /tools/pdf-to-image`
- **Body**: `{ "documentId": "doc_101", "format": "png", "dpi": 150 }`

### `POST /tools/image-to-pdf`
- **Body**: `{ "documentIds": ["img_01", "img_02"], "pageSize": "A4" }`

### `POST /tools/word-to-pdf`
- **Body**: `{ "documentId": "doc_word_01" }`

### `POST /tools/ppt-to-pdf`
- **Body**: `{ "documentId": "doc_ppt_01" }`

### `POST /tools/excel-to-pdf`
- **Body**: `{ "documentId": "doc_xls_01" }`

---

## 6. Jobs (`/jobs`)

### `GET /jobs/:id`
Polls status and progress of an asynchronous processing job.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "job_998",
    "operation": "PDF_TO_WORD",
    "status": "COMPLETED",
    "progress": 100,
    "resultS3Key": "processed/user_1/1727950050-Quarterly_Financial_Report.docx",
    "downloadUrl": "https://clouddoc-production-documents.s3.amazonaws.com/processed/...?AWSAccessKeyId=...",
    "processingTimeMs": 1420,
    "error": null
  }
}
```

---

## 7. AI Capabilities (`/ai`)

### `POST /ai/summarize`
Generates an executive summary, key takeaways, and tone analysis.
- **Body**: `{ "documentId": "doc_101", "length": "concise" | "detailed" }`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "summary": "This document outlines Q3 financial performance with revenues growing 18% YoY...",
    "keyTakeaways": [
      "Gross margins increased to 64%",
      "Cloud infrastructure costs reduced by 12%",
      "Enterprise customer retention reached 98.4%"
    ],
    "entities": ["Amazon AWS", "Stripe", "Goldman Sachs"],
    "category": "Financial Statement"
  }
}
```

### `POST /ai/chat`
Ask questions with citation references using Retrieval-Augmented Generation (RAG).
- **Body**:
```json
{
  "documentId": "doc_101",
  "question": "What was the total revenue growth reported for Q3?"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "answer": "Total revenue grew by 18.2% year-over-year, driven primarily by enterprise expansion.",
    "citations": [
      {
        "pageNumber": 3,
        "snippet": "...total top-line revenue demonstrated an 18.2% expansion compared to the prior year period...",
        "relevanceScore": 0.892
      }
    ]
  }
}
```

### `POST /ai/extract`
Performs OCR, structured table extraction, and named entity recognition.
- **Body**: `{ "documentId": "doc_101", "extractTables": true, "extractEntities": true }`

---

## 8. Admin Portal (`/admin`)

Requires `Role: ADMIN`.

- `GET /admin/dashboard`: Platform aggregates (total users, active jobs, storage used, error rates).
- `GET /admin/users`: User management with plan adjustments, suspension, and role promotion.
- `GET /admin/documents`: Platform-wide document catalog.
- `GET /admin/jobs`: Background queue monitoring and failed job replays.
- `GET /admin/audit-logs`: System audit trail for security and compliance.
