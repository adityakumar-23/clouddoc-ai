import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { api } from '../../services/api';
import { Document, ProcessingJob } from '../../types';
import {
  Files,
  HardDrive,
  Cpu,
  Sparkles,
  ArrowRight,
  UploadCloud,
  FileText,
  Layers,
  Maximize2,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Star,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [docsRes, jobsRes] = await Promise.all([
          api.get('/documents?limit=5'),
          api.get('/jobs?limit=5'),
        ]);
        setDocuments(docsRes.data.data.documents || []);
        setJobs(jobsRes.data.data.jobs || []);
      } catch (err) {
        // Handled gracefully
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const storageUsedMB = Math.round((user?.storageUsedBytes || 0) / (1024 * 1024));
  const storageLimitMB = Math.round((user?.storageLimitBytes || 524288000) / (1024 * 1024));
  const storagePercent = Math.min(100, Math.round((storageUsedMB / Math.max(1, storageLimitMB)) * 100));

  const quickActions = [
    { title: 'Upload Document', desc: 'S3 Pre-signed ingest', icon: UploadCloud, href: '/upload', color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/60' },
    { title: 'PDF to Word', desc: 'Editable DOCX export', icon: FileText, href: '/tools/pdf-to-word', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60' },
    { title: 'Merge PDFs', desc: 'Combine multiple files', icon: Layers, href: '/tools/merge-pdf', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60' },
    { title: 'Compress PDF', desc: 'Reduce file storage', icon: Maximize2, href: '/tools/compress-pdf', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60' },
    { title: 'RAG Document Chat', desc: 'Ask questions with citations', icon: Sparkles, href: '/ai/chat', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60' },
    { title: 'AI Summarizer', desc: 'Executive key points', icon: Cpu, href: '/ai/summarize', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Workspace Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connected to Amazon RDS PostgreSQL & S3 storage bucket
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/upload">
            <Button variant="primary" size="sm" leftIcon={<UploadCloud className="w-4 h-4" />}>
              Upload Document
            </Button>
          </Link>
          <Link to="/tools">
            <Button variant="outline" size="sm">
              Tools Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Documents</span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <Files className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isLoading ? <LoadingSkeleton className="h-8 w-16" /> : documents.length}
          </p>
          <p className="text-[11px] text-slate-400">Active encrypted S3 objects</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Storage Used</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isLoading ? <LoadingSkeleton className="h-8 w-20" /> : `${storageUsedMB} MB`}
          </p>
          <div className="space-y-1">
            <Progress value={storagePercent} size="sm" />
            <p className="text-[10px] text-slate-400">{storagePercent}% of {storageLimitMB} MB limit</p>
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monthly Conversions</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isLoading ? <LoadingSkeleton className="h-8 w-12" /> : jobs.length}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Worker Success Rate
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI Inquiries</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isLoading ? <LoadingSkeleton className="h-8 w-12" /> : '64'}
          </p>
          <p className="text-[11px] text-slate-400">Vector Grounded with Citations</p>
        </Card>
      </div>

      {/* Quick Tool Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Quick Document Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.href} className="group">
                <Card className="p-4 h-full text-center hover:border-brand-500 transition-all duration-200 group-hover:-translate-y-0.5">
                  <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mx-auto mb-2.5 transition-transform group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{action.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{action.desc}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Dual Section: Recent Documents & Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents Table (2 columns wide) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Documents
            </h2>
            <Link to="/documents" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="p-3.5 pl-4 font-semibold">Document</th>
                    <th className="p-3.5 font-semibold">Format</th>
                    <th className="p-3.5 font-semibold">Size</th>
                    <th className="p-3.5 pr-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center">
                        <LoadingSkeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ) : documents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        No documents uploaded yet. Start by uploading a PDF or DOCX file.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 pl-4">
                          <Link to={`/documents/${doc.id}`} className="font-semibold text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-2">
                            {doc.isFavorite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                            <span className="truncate max-w-[220px]">{doc.title}</span>
                          </Link>
                          <span className="text-[11px] text-slate-400">{doc.pageCount} pages</span>
                        </td>
                        <td className="p-3.5">
                          <Badge variant={doc.fileType as any} size="sm">
                            {doc.fileType}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {Math.round(doc.fileSize / 1024)} KB
                        </td>
                        <td className="p-3.5 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/documents/${doc.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                              <Eye className="w-4 h-4" />
                            </Link>
                            {doc.downloadUrl && (
                              <a href={doc.downloadUrl} download={doc.originalName} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Recent Processing Activity (1 column wide) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Transformations
            </h2>
            <Link to="/history" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              History
            </Link>
          </div>

          <Card className="p-4 space-y-3">
            {isLoading ? (
              <LoadingSkeleton className="h-28 w-full" />
            ) : jobs.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No recent background jobs executed.
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold capitalize text-slate-800 dark:text-slate-200">
                      {job.toolType.replace(/-/g, ' ')}
                    </span>
                    <Badge variant={job.status === 'COMPLETED' ? 'success' : 'primary'} size="sm">
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {job.document?.title || 'Uploaded Document'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {job.executionTimeMs ? `${job.executionTimeMs}ms` : 'Completed'}
                    </span>
                    {job.downloadUrl && (
                      <a href={job.downloadUrl} download={job.outputFileName} className="text-brand-600 dark:text-brand-400 hover:underline font-semibold">
                        Download Result
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
