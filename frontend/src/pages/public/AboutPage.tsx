import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck, Cloud, Cpu, Database, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4">
        <Badge variant="primary" size="md">Our Mission & Engineering</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          Architected for Cloud Document Processing
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          CloudDoc AI was engineered by Principal UI/UX Designers, Senior Frontend Architects, Staff Backend Engineers, and Cloud Leads to demonstrate enterprise SaaS best practices on Amazon Web Services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Cloud className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">AWS Cloud-Native</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Every layer from Route 53 DNS and Application Load Balancer to private S3 buckets and multi-AZ RDS PostgreSQL instances follows AWS Well-Architected Framework guidelines.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Asynchronous Concurrency</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            By delegating heavy conversions to Redis and BullMQ background workers, API responsiveness is preserved and large 100-page documents process reliably without memory starvation.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Strict Zero-Trust Security</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            We avoid storing raw document files in relational databases. S3 buckets are private, and access is governed by IAM instance execution roles and short-lived pre-signed download tokens.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Grounded RAG Intelligence</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Rather than blindly passing full documents to large language models, documents are chunked and indexed. Only high-confidence passages with verifiable citations are synthesized.
          </p>
        </Card>
      </div>

      <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Compliance & Governance Standards</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Server-side encryption via AES-256 / AWS KMS</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Full audit log tracking for all authenticated actions</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Role-Based Access Control (RBAC) across API endpoints</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Automated 24-hour lifecycle cleanup on temporary jobs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
