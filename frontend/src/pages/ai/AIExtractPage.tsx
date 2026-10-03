import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, getErrorMessage } from '../../services/api';
import { Document } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Sparkles, Calendar, DollarSign, Building, CheckCircle2, Shield } from 'lucide-react';

export const AIExtractPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedDocId = searchParams.get('docId') || '';

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(preselectedDocId);
  const [extractedData, setExtractedData] = useState<any | null>(null);
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

  const handleExtract = async () => {
    if (!selectedDocId) {
      addToast('Select Document', 'Please choose a document to extract entities from', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/ai/extract', { documentId: selectedDocId });
      setExtractedData(res.data.data);
      addToast('Entities Extracted', 'Document entities and classification parsed successfully', 'success');
    } catch (err) {
      addToast('Extraction Failed', getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="primary" size="md">Entity Intelligence</Badge>
          <span className="text-xs text-slate-400">Structured JSON Output</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Entity & Metadata Extraction
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Automatically detect organizations, currency amounts, deadlines, and document taxonomy
        </p>
      </div>

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
                {d.title} ({d.fileType.toUpperCase()})
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            onClick={handleExtract}
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Extract Entities
          </Button>
        </div>
      </Card>

      {isLoading && (
        <Card className="p-6 space-y-4">
          <LoadingSkeleton className="h-6 w-48" />
          <LoadingSkeleton className="h-32 w-full" />
        </Card>
      )}

      {extractedData && !isLoading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500">Document Classification:</span>
            <Badge variant="primary" size="md">{extractedData.classification}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Dates & Milestones</span>
              </div>
              <div className="space-y-1.5">
                {extractedData.entities?.dates?.map((d: string) => (
                  <div key={d} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-mono">
                    {d}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Monetary Values</span>
              </div>
              <div className="space-y-1.5">
                {extractedData.entities?.monetaryValues?.map((m: string) => (
                  <div key={m} className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-semibold">
                    {m}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Building className="w-4 h-4 text-indigo-500" />
                <span>Organizations</span>
              </div>
              <div className="space-y-1.5">
                {extractedData.entities?.organizations?.map((o: string) => (
                  <div key={o} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium">
                    {o}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
