import React from 'react';
import { Card } from '../../components/ui/Card';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Effective Date: October 2026</p>
      </div>

      <Card className="p-8 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Data Storage & Encryption</h2>
          <p>
            CloudDoc AI stores documents exclusively within private Amazon S3 buckets protected by Server-Side Encryption (SSE-S3 / SSE-KMS with AES-256). S3 buckets block all public ingress. Document contents are never embedded as raw binary payloads inside relational database tables.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Pre-Signed Temporary Access</h2>
          <p>
            File downloads and browser uploads utilize AWS Pre-Signed URLs generated using IAM credentials. Download links expire automatically after 15 minutes, preventing persistent unauthorized link distribution.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. AI Processing & Model Training</h2>
          <p>
            We do not use customer documents to train foundational public models. Text chunks retrieved during RAG operations are stored in isolated sessions and are purged in accordance with user retention policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Temporary File Cleanup</h2>
          <p>
            All intermediate transformation artifacts generated in the S3 <code>temporary/</code> prefix are automatically expired after 24 hours using AWS S3 Lifecycle expiration rules.
          </p>
        </section>
      </Card>
    </div>
  );
};
