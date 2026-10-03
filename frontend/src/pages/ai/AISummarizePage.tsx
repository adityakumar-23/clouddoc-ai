import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, getErrorMessage } from '../../services/api';
import { Document, SummaryResult } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Cpu, FileText, CheckCircle2, Calendar, DollarSign, Building, ArrowRight } from 'lucide-react';

export const AISummarizePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedDocId = searchParams.get('docId') || '';

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(preselectedDocId);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    async function loadDocuments() {
      try {
        const res = await api.get('/documents?limit=50');
        setDocuments(res.data.data.documents || []);
      } catch {}
    }
    loadDocuments();
  }, []);

  const handleGenerateSummary = async () => {
    if (!selectedDocId) {
      addToast('Select Document', 'Please choose a document to summarize', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/ai/summarize', { documentId: selectedDocId });
      setSummary(res.data.data);
      addToast('Summary Generated', 'Document analyzed and key points extracted', 'success');
    } catch (err) {
      addToast('Summarization Failed', getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="primary" size="md">AI Document Intelligence</Badge>
          <span className="text-xs text-slate-400">Map-Reduce Processing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Document Summarizer & Key Points
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Generate high-level executive summaries, actionable directives, and entity extractions
        </p>
      </div>

      {/* Document Selection Card */}
      <Card className="p-6 space-y-4">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Select Document from Repository:
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">-- Choose a document --</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.fileType.toUpperCase()}, {d.pageCount} pages)
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            onClick={handleGenerateSummary}
            isLoading={isLoading}
            leftIcon={<Cpu className="w-4 h-4" />}
          >
            Summarize Document
          </Button>
        </div>
      </Card>

      {/* Loading Skeleton */}
      {isLoading && (
        <Card className="p-6 space-y-4">
          <LoadingSkeleton className="h-6 w-48" />
          <LoadingSkeleton className="h-24 w-full" />
          <LoadingSkeleton className="h-6 w-40" />
          <LoadingSkeleton className="h-16 w-full" />
        </Card>
      )}

      {/* Summary Display */}
      {summary && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          {/* Classification Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800 text-xs">
            <span className="font-semibold text-brand-900 dark:text-brand-200">
              Taxonomy Classification:
            </span>
            <Badge variant="primary" size="md">{summary.classification}</Badge>
          </div>

          {/* Executive Summary */}
          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Executive Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              {summary.executiveSummary}
            </p>
          </Card>

          {/* Key Bullet Points */}
          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Critical Findings & Takeaways
            </h3>
            <ul className="space-y-2.5">
              {summary.keyPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Action Items */}
          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Required Next Steps & Actions
            </h3>
            <ul className="space-y-2">
              {summary.actionItems.map((act, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Extracted Entities */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" /> Dates Mentioned
              </span>
              <div className="flex flex-wrap gap-1.5">
                {summary.entities.dates.map((d) => (
                  <Badge key={d} variant="neutral" size="sm">{d}</Badge>
                ))}
              </div>
            </Card>

            <Card className="p-4 space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Currency & Values
              </span>
              <div className="flex flex-wrap gap-1.5">
                {summary.entities.monetaryValues.map((m) => (
                  <Badge key={m} variant="success" size="sm">{m}</Badge>
                ))}
              </div>
            </Card>

            <Card className="p-4 space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-500" /> Organizations
              </span>
              <div className="flex flex-wrap gap-1.5">
                {summary.entities.organizations.map((o) => (
                  <Badge key={o} variant="primary" size="sm">{o}</Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
