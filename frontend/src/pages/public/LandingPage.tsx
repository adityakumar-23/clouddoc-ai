import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Cloud,
  Layers,
  Cpu,
  Database,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Zap,
  Lock,
  Workflow,
  Search,
  Maximize2,
  RefreshCw,
  FolderSync,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, quickDemoLogin } = useAuth();

  const toolHighlights = [
    { title: 'PDF to Word', desc: 'Convert PDFs to editable Microsoft Word (.docx) with typography preservation', icon: FileText, href: '/tools/pdf-to-word', tag: 'High Fidelity' },
    { title: 'Merge PDF', desc: 'Combine multiple PDF files into one clean document with custom order', icon: Layers, href: '/tools/merge-pdf', tag: 'Fast' },
    { title: 'Compress PDF', desc: 'Reduce file size up to 70% while maintaining crisp vector text and raster clarity', icon: Maximize2, href: '/tools/compress-pdf', tag: 'Lossless' },
    { title: 'Split PDF', desc: 'Extract custom page ranges or burst large manuals into separate documents', icon: Workflow, href: '/tools/split-pdf', tag: 'Precise' },
    { title: 'Word to PDF', desc: 'Convert DOCX documents to standard PDF/A format for reliable distribution', icon: RefreshCw, href: '/tools/word-to-pdf', tag: 'DOCX Engine' },
    { title: 'Optical Character Recognition', desc: 'Transcribe scanned PDFs and images into searchable text layers', icon: Search, href: '/tools/pdf-to-image', tag: 'Tesseract & Textract' },
  ];

  const cloudBenefits = [
    {
      title: 'Decoupled Worker Architecture',
      desc: 'Built with BullMQ background queues running on distributed EC2 workers, guaranteeing large document transformations never block HTTP requests.',
      icon: Cpu,
    },
    {
      title: 'Private S3 Pre-Signed Storage',
      desc: 'Zero public bucket exposure. Direct browser-to-S3 transfers with IAM execution roles, KMS encryption, and 15-minute temporary download tokens.',
      icon: Lock,
    },
    {
      title: 'Enterprise RDS Multi-AZ Relational Core',
      desc: 'PostgreSQL on Amazon RDS maintaining transactional integrity, version tracking, usage quotas, and SOC2-aligned audit logs.',
      icon: Database,
    },
    {
      title: 'Retrieval-Augmented AI Pipeline',
      desc: 'Smart chunking and vector embeddings retrieve exact pages and passages before passing them to LLMs, ensuring accurate answers with citations.',
      icon: Sparkles,
    },
  ];

  const pricingTiers = [
    {
      name: 'Free Starter',
      price: '$0',
      period: 'forever',
      desc: 'Ideal for individuals needing essential document conversions and light AI queries.',
      features: [
        '500 MB Encrypted S3 Storage',
        '25 Document Conversions / month',
        '10 AI Document Q&A Requests / month',
        'Standard PDF Tools (Merge, Split, Rotate)',
        'Up to 25 MB max file upload size',
      ],
      cta: 'Get Started Free',
      href: '/register',
      highlight: false,
    },
    {
      name: 'Professional',
      price: '$19',
      period: 'per month',
      desc: 'Built for power users, legal teams, and researchers managing complex document pipelines.',
      features: [
        '10 GB Encrypted S3 Storage',
        'Unlimited Monthly Conversions',
        '500 AI RAG & Summarization Inquiries',
        'Optical Character Recognition (OCR)',
        'Priority BullMQ Worker Execution Queue',
        'Up to 100 MB max file upload size',
        'Audit History & Version Restores',
      ],
      cta: 'Start Pro Trial',
      href: '/register',
      highlight: true,
    },
    {
      name: 'Enterprise Cloud',
      price: '$79',
      period: 'per month',
      desc: 'Dedicated cloud capacity, custom IAM roles, and private VPC endpoint connectivity.',
      features: [
        '100 GB Dedicated AWS S3 Storage',
        'Unlimited AI Inquiries & OCR Pipelines',
        'AWS Textract & CloudWatch Telemetry',
        'Role-Based Access Control (Admin & Auditor)',
        'Custom SSO & Webhook Notifications',
        'Dedicated SLA & Support Engineer',
      ],
      cta: 'Contact Sales',
      href: '/contact',
      highlight: false,
    },
  ];

  const faqs = [
    {
      q: 'How does CloudDoc AI guarantee file security and privacy?',
      a: 'All files are uploaded into private Amazon S3 buckets encrypted at rest via AES-256. Files are never stored as raw blobs inside the database. Downloads are issued via cryptographically signed temporary URLs that expire after 15 minutes.',
    },
    {
      q: 'Does CloudDoc send entire documents blindly to LLMs?',
      a: 'No. CloudDoc AI uses a Retrieval-Augmented Generation (RAG) architecture. Documents are extracted, chunked, and embedded into vector spaces. Only the Top-K most relevant passages are fed to the model along with precise page citations.',
    },
    {
      q: 'Can large document operations timeout in the browser?',
      a: 'No. All operations run asynchronously through BullMQ worker queues. When you submit a job, you immediately receive a job tracker that polls progress or streams events until completed.',
    },
    {
      q: 'What cloud technologies power CloudDoc AI?',
      a: 'CloudDoc AI is built on AWS: EC2 Ubuntu instances managed by PM2, Amazon RDS PostgreSQL for structured relational metadata, Amazon S3 for private object storage, Redis for background workers, and AWS CloudWatch for operational telemetry.',
    },
  ];

  return (
    <div className="space-y-24 py-8 sm:py-16">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production-Grade Cloud Document Processing Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Your Intelligent Cloud Workspace for{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-500">
            Every Document
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Convert, organize, process and understand documents securely with cloud-powered automation and AI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to={isAuthenticated ? '/dashboard' : '/register'}>
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Processing
            </Button>
          </Link>
          <Link to="/tools">
            <Button size="lg" variant="outline">
              Explore Tools
            </Button>
          </Link>
        </div>

        {/* Quick Demo Access Bar */}
        {!isAuthenticated && (
          <div className="pt-2 flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Instant Demo Access:</span>
            <button
              onClick={() => quickDemoLogin('USER')}
              className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
            >
              Demo User
            </button>
            <span>•</span>
            <button
              onClick={() => quickDemoLogin('ADMIN')}
              className="text-amber-600 dark:text-amber-400 hover:underline font-semibold"
            >
              Demo Admin
            </button>
          </div>
        )}
      </section>

      {/* 2. Product Preview Card */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-3 sm:p-4 shadow-2xl backdrop-blur-xl">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-950 p-4 sm:p-8 text-white space-y-6 overflow-hidden relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-400 ml-2 font-mono">CloudDoc AI Processing Console</span>
              </div>
              <Badge variant="success" size="sm">BullMQ Active: 3 Workers</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <p className="text-xs text-slate-400">Source Asset</p>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-400" />
                  <span className="text-sm font-semibold truncate">AWS_Optimization_2026.pdf</span>
                </div>
                <p className="text-[11px] text-slate-500">16 Pages · 4.2 MB · S3 Encrypted</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <p className="text-xs text-slate-400">RAG Semantic Search</p>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-400" />
                  <span className="text-sm font-semibold">Grounded Citations</span>
                </div>
                <p className="text-[11px] text-slate-500">3 Excerpts Retrieved · 0.94 Match</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <p className="text-xs text-slate-400">Conversion Result</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-semibold truncate">Optimized_Word_v1.docx</span>
                </div>
                <p className="text-[11px] text-slate-500">Compressed 57% · 1.8 MB</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Document Tools Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="primary" size="md">Tool Ecosystem</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            High-Performance Document Transformations
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Native format conversions and structural manipulations engineered for precision and speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolHighlights.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.title} to={tool.href} className="group">
                <Card className="h-full p-6 hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300 hover:shadow-premium group-hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center transition-transform group-hover:scale-110">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="neutral" size="sm">{tool.tag}</Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. AI Capabilities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-brand-900 via-slate-900 to-indigo-950 p-8 sm:p-14 text-white space-y-8 relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Document Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Chat, Summarize, and Extract with Grounded Accuracy
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Don't skim through 100-page manuals or contracts. Ask questions in natural language and receive instant, verifiable answers backed by exact page citations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
              <h4 className="text-base font-bold text-white">Hierarchical Summaries</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Map-reduce processing yields concise executive summaries, key bullet points, and actionable decision points.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
              <h4 className="text-base font-bold text-white">RAG Q&A with Citations</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every claim is linked to the source page and passage score, completely eliminating hallucination risks.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
              <h4 className="text-base font-bold text-white">Entity & OCR Extraction</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Structured recognition of contract counterparties, monetary amounts, execution dates, and scanned images.
              </p>
            </div>
          </div>

          <div className="pt-4 relative z-10">
            <Link to="/ai">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-bold">
                Launch AI Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Cloud Architecture Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="primary" size="md">AWS Production Standards</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Architected for AWS Cloud Resiliency
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Built from scratch to mirror real-world cloud architectures running on Amazon Web Services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cloudBenefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="flex gap-4 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Feature Comparison Table */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Enterprise Architecture vs Generic Web Apps
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Why CloudDoc AI meets production deployment criteria
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
              <tr>
                <th className="p-4 font-bold">Engineering Dimension</th>
                <th className="p-4 font-bold text-brand-600 dark:text-brand-400">CloudDoc AI</th>
                <th className="p-4 font-bold text-slate-400">Basic MVP / CRUD App</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              <tr>
                <td className="p-4 font-semibold">Document Storage</td>
                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-medium">Private Amazon S3 + Pre-Signed URLs</td>
                <td className="p-4 text-slate-400">Local disk or Mongo Base64 strings</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Heavy Conversions</td>
                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-medium">BullMQ + Redis Worker Thread Queues</td>
                <td className="p-4 text-slate-400">Blocking synchronous HTTP loop</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">AI Q&A Implementation</td>
                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-medium">RAG with Top-K Cosine Vector Grounding</td>
                <td className="p-4 text-slate-400">Blindly sends 50k tokens to LLM</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Production Database</td>
                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-medium">Amazon RDS PostgreSQL with Prisma ORM</td>
                <td className="p-4 text-slate-400">Local JSON file or loose schema</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Hosting Model</td>
                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-medium">Ubuntu EC2 + Nginx + PM2 Clustered</td>
                <td className="p-4 text-slate-400">Basic node index.js</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. Clearly Marked Demo Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="neutral" size="sm">Demo User Feedback</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Trusted by Document-Driven Teams
          </h2>
          <p className="text-xs text-slate-400 italic">
            [Sample illustrative testimonials created for platform demonstration]
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "The ability to ask complex questions across 80-page contracts and get exact page citations back in seconds has transformed our contract review cycles."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-xs">
                MC
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Marcus Chen</h5>
                <p className="text-[11px] text-slate-400">Legal Operations Lead</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "We process thousands of vendor PDFs every month. The async BullMQ queue handles bursts effortlessly without dropping connection or hitting memory limits."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                ER
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Elena Rostova</h5>
                <p className="text-[11px] text-slate-400">Cloud Platform Engineer</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "Optical Character Recognition on scanned agreements plus immediate conversion into editable Word documents saved us hundreds of manual transcription hours."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                DW
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">David Walsh</h5>
                <p className="text-[11px] text-slate-400">Enterprise Architect</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 8. Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="primary" size="md">Transparent SaaS Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Choose the Plan for Your Workload
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Upgrade, downgrade, or cancel at any time. All tiers feature encrypted S3 storage and HTTPS protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`p-8 flex flex-col justify-between relative ${
                tier.highlight
                  ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-xl'
                  : ''
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tier.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{tier.price}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/{tier.period}</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link to={tier.href}>
                  <Button
                    variant={tier.highlight ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Everything you need to know about security, storage, and processing limits.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.q} className="p-6 space-y-2">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{faq.q}</h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 10. Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand-600 p-8 sm:p-14 text-center text-white space-y-6 shadow-xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to Transform Your Cloud Document Workflow?
          </h2>
          <p className="text-sm sm:text-base text-brand-100 max-w-xl mx-auto">
            Join thousands of organizations using CloudDoc AI to convert, organize, and analyze documents at scale.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/register">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50 font-bold">
                Get Started for Free
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-brand-400 text-white hover:bg-brand-700">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
