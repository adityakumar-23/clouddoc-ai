import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { CheckCircle2, HelpCircle } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Free Starter',
      price: '$0',
      period: 'forever',
      desc: 'Essential PDF utilities and light document workflows.',
      features: [
        '500 MB Encrypted S3 Storage',
        '25 Monthly Document Conversions',
        '10 AI Document Q&A Requests',
        'Standard PDF Tools (Merge, Split, Rotate)',
        '25 MB File Size Limit',
        'Community Support',
      ],
      cta: 'Start Free',
      href: '/register',
      highlight: false,
    },
    {
      name: 'Professional',
      price: '$19',
      period: 'per month',
      desc: 'Full document intelligence, OCR, and unlimited conversions.',
      features: [
        '10 GB Encrypted S3 Storage',
        'Unlimited Monthly Document Conversions',
        '500 AI RAG & Summarization Requests',
        'Tesseract & Textract OCR Pipelines',
        '100 MB File Size Limit',
        'Priority BullMQ Background Worker Queue',
        'Audit Logging & Multi-Version History',
        'Email Support (12h response)',
      ],
      cta: 'Upgrade to Pro',
      href: '/register',
      highlight: true,
    },
    {
      name: 'Enterprise Cloud',
      price: '$79',
      period: 'per month',
      desc: 'Dedicated cloud capacity, SSO, and AWS integration.',
      features: [
        '100 GB Dedicated S3 Storage',
        'Unlimited Monthly AI Inquiries & OCR',
        'Dedicated EC2 Worker Node Pool',
        'Custom IAM Roles & Private VPC Endpoints',
        'AWS CloudWatch Telemetry Dashboard',
        'Role-Based Access Control (Admin/Auditor)',
        '99.9% Uptime Service Level Agreement',
        '24/7 Dedicated Support Engineer',
      ],
      cta: 'Contact Enterprise Sales',
      href: '/contact',
      highlight: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4">
        <Badge variant="primary" size="md">Transparent Cloud Pricing</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          Predictable Pricing for High-Volume Workflows
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Scale your document operations effortlessly without hidden surcharges or surprise cloud data transfer fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((p) => (
          <Card
            key={p.name}
            className={`p-8 flex flex-col justify-between relative ${
              p.highlight
                ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-xl'
                : ''
            }`}
          >
            {p.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider">
                Recommended
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.desc}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{p.price}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/{p.period}</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Link to={p.href}>
                <Button
                  variant={p.highlight ? 'primary' : 'outline'}
                  className="w-full"
                >
                  {p.cta}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
