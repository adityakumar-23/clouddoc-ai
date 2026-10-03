import React from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Server, Database, Cloud, Shield, Cpu, Lock } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          System Configuration & Cloud Parameters
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Immutable infrastructure variables deployed across AWS EC2, S3, and Amazon RDS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AWS S3 Configuration</h3>
              <p className="text-[11px] text-slate-400">Target Region: us-east-1</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p>BUCKET: clouddoc-documents-prod</p>
            <p>ENCRYPTION: AES256 (SSE-S3)</p>
            <p>PRESIGNED_EXPIRY: 900s (15 min)</p>
            <p>LIFECYCLE_TEMP_EXPIRATION: 24h</p>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Amazon RDS PostgreSQL</h3>
              <p className="text-[11px] text-slate-400">Multi-AZ Standby Active</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p>ENGINE: PostgreSQL 16.3</p>
            <p>SSL_MODE: require (TLS 1.3)</p>
            <p>POOL_SIZE: 20 max connections</p>
            <p>STORAGE_AUTOSCALING: Enabled</p>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">EC2 Compute & PM2</h3>
              <p className="text-[11px] text-slate-400">Ubuntu 22.04 LTS HVM</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p>NODE_ENV: production</p>
            <p>PM2_CLUSTER: max vCPUs</p>
            <p>REVERSE_PROXY: Nginx HTTP/2</p>
            <p>MEMORY_LIMIT: 4096 MB</p>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & Audit</h3>
              <p className="text-[11px] text-slate-400">Zero-Trust Posture</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p>JWT_ALGORITHM: HS256</p>
            <p>TOKEN_EXPIRY: 15m access / 7d refresh</p>
            <p>RATE_LIMITING: ExpressRateLimit (300/15m)</p>
            <p>HELMET_HEADERS: Active</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
