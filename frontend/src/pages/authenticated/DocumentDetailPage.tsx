import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../../services/api';
import { Document, ProcessingJob } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  FileText,
  Download,
  Sparkles,
  ArrowLeft,
  Calendar,
  HardDrive,
  FileCheck,
  Star,
  RefreshCw,
  Maximize2,
  Layers,
  Search,
  Cpu,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'metadata' | 'versions' | 'history'>('preview');
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDoc() {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await api.get(`/documents/${id}`);
        setDoc(res.data.data);
      } catch (err) {
        addToast('Document Not Found', getErrorMessage(err), 'error');
        navigate('/documents');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDoc();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!doc) return;
    try {
      await api.patch(`/documents/${doc.id}/favorite`);
      setDoc((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    } catch (err) {
      addToast('Error', getErrorMessage(err), 'error');
    }
  };

  if (isLoading || !doc) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-8 w-64" />
        <Card className="p-8 space-y-4">
          <LoadingSkeleton className="h-6 w-full" />
          <LoadingSkeleton className="h-6 w-3/4" />
          <LoadingSkeleton className="h-96 w-full" />
        </Card>
      </div>
    );
  }

  const isPdf = doc.fileType === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(doc.fileType);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/documents"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate max-w-lg">
                {doc.title}
              </h1>
              <button onClick={handleToggleFavorite} className="text-slate-300 hover:text-amber-400">
                <Star className={`w-5 h-5 ${doc.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{doc.originalName} · S3 Object Key: <span className="font-mono">{doc.s3Key}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/ai/chat?docId=${doc.id}`}>
            <Button variant="secondary" size="sm" leftIcon={<Sparkles className="w-4 h-4 text-purple-500" />}>
              Ask AI
            </Button>
          </Link>
          {doc.downloadUrl && (
            <a href={doc.downloadUrl} download={doc.originalName}>
              <Button variant="primary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                Download
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Quick Action Ribbon */}
      <Card className="p-3 bg-slate-50/70 dark:bg-slate-900/40">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2 pr-1 shrink-0">
            Apply Tool:
          </span>
          <Link to={`/tools/pdf-to-word?docId=${doc.id}`} className="shrink-0">
            <Button variant="outline" size="sm">PDF → Word</Button>
          </Link>
          <Link to={`/tools/compress-pdf?docId=${doc.id}`} className="shrink-0">
            <Button variant="outline" size="sm">Compress</Button>
          </Link>
          <Link to={`/tools/split-pdf?docId=${doc.id}`} className="shrink-0">
            <Button variant="outline" size="sm">Split Pages</Button>
          </Link>
          <Link to={`/tools/rotate-pdf?docId=${doc.id}`} className="shrink-0">
            <Button variant="outline" size="sm">Rotate</Button>
          </Link>
          <Link to={`/ai/summarize?docId=${doc.id}`} className="shrink-0">
            <Button variant="outline" size="sm" leftIcon={<Cpu className="w-3.5 h-3.5 text-amber-500" />}>
              Summarize
            </Button>
          </Link>
        </div>
      </Card>

      {/* Main Grid: Preview / Metadata Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column (3 cols): Document Viewer */}
        <div className="lg:col-span-3 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-semibold">
            {[
              { id: 'preview', name: 'Document Preview' },
              { id: 'metadata', name: 'Metadata & Text' },
              { id: 'versions', name: `Versions (${doc.versions?.length || 1})` },
              { id: 'history', name: `Transformations (${doc.processingJobs?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab 1: Preview */}
          {activeTab === 'preview' && (
            <Card className="min-h-[560px] flex flex-col bg-slate-950 rounded-2xl overflow-hidden shadow-xl border-slate-800">
              {isPdf && doc.downloadUrl ? (
                <iframe
                  src={`${doc.downloadUrl}#toolbar=0`}
                  title={doc.title}
                  className="w-full h-[640px] border-0 rounded-2xl bg-white"
                />
              ) : isImage && doc.downloadUrl ? (
                <div className="flex items-center justify-center p-8 h-[600px] overflow-auto">
                  <img
                    src={doc.downloadUrl}
                    alt={doc.title}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] text-center p-8 space-y-4 text-white">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-brand-400 flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{doc.originalName}</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Direct browser rendering is optimized for PDF and images. Download the asset or convert it to PDF to view online.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <a href={doc.downloadUrl} download={doc.originalName}>
                      <Button variant="primary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                        Download {doc.fileType.toUpperCase()}
                      </Button>
                    </a>
                    {doc.fileType === 'docx' && (
                      <Link to={`/tools/word-to-pdf?docId=${doc.id}`}>
                        <Button variant="outline" size="sm">
                          Convert to PDF Preview
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Tab 2: Metadata & Extracted Text */}
          {activeTab === 'metadata' && (
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Extracted Text & OCR Layer</h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                {doc.metadata?.extractedTextPreview ||
                  'No text extract preview available for this document. Run OCR to generate text layer.'}
              </div>
            </Card>
          )}

          {/* Tab 3: Versions */}
          {activeTab === 'versions' && (
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Document Version History</h3>
              <div className="space-y-3">
                {doc.versions?.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">Version {v.versionNumber}</span>
                      <p className="text-slate-400 text-[11px]">{v.operation}</p>
                    </div>
                    <span className="text-slate-500 font-mono">{Math.round(v.fileSize / 1024)} KB</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tab 4: Processing History */}
          {activeTab === 'history' && (
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Processing History</h3>
              <div className="space-y-3">
                {doc.processingJobs?.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="font-bold capitalize text-slate-900 dark:text-white">{job.toolType.replace(/-/g, ' ')}</span>
                      <p className="text-slate-400 text-[11px]">Job ID: {job.id}</p>
                    </div>
                    <Badge variant={job.status === 'COMPLETED' ? 'success' : 'primary'} size="sm">
                      {job.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (1 col): Technical Metadata Card */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Asset Properties
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">File Type</span>
                <Badge variant={doc.fileType as any} size="sm">{doc.fileType}</Badge>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">File Size</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {Math.round(doc.fileSize / 1024)} KB
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Page Count</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.pageCount}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">S3 Bucket</span>
                <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{doc.s3Bucket}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Storage Class</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">S3 Standard (SSE)</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-500">Ingested At</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
