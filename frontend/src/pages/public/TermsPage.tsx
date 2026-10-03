import React from 'react';
import { Card } from '../../components/ui/Card';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
        <p className="text-xs text-slate-400">Effective Date: October 2026</p>
      </div>

      <Card className="p-8 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Service Description</h2>
          <p>
            CloudDoc AI provides cloud-based document transformation, format conversion, optical character recognition, and AI-powered question answering. Access is granted subject to these terms and the chosen subscription plan quotas.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Acceptable Use Policy</h2>
          <p>
            Users agree not to upload malicious binaries, malware, rootkits, copyright-infringing materials, or unlawful content. CloudDoc AI enforces strict MIME type validation and file scanning hooks. Violations result in immediate account termination.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Quotas and Service Availability</h2>
          <p>
            Monthly conversion and storage limits are dictated by your active subscription plan. Rate limits on API calls and worker queue submissions prevent denial of service and ensure equitable compute distribution across tenants.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Service Level & Liability</h2>
          <p>
            While our multi-AZ architecture target is 99.9% uptime, the platform is provided on an "as-is" and "as-available" basis for standard tier tiers. Enterprise agreements are backed by specific contractual SLAs.
          </p>
        </section>
      </Card>
    </div>
  );
};
