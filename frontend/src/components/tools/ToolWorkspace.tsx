import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../../services/api';
import { Document, ProcessingJob } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DropZone } from '../common/DropZone';
import { ProcessingModal } from '../common/ProcessingModal';
import { FileText, ArrowRight, CheckCircle2, Sliders, UploadCloud } from 'lucide-react';

export interface ToolWorkspaceProps {
  toolType: string;
  title: string;
  description: string;
  acceptedFormats?: string;
  endpoint: string;
  allowMultiple?: boolean;
  extraParametersUI?: (params: any, setParams: React.Dispatch<React.SetStateAction<any>>) => React.ReactNode;
  defaultParams?: Record<string, any>;
}

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({
  toolType,
  title,
  description,
  acceptedFormats = '.pdf',
  endpoint,
  allowMultiple = false,
  extraParametersUI,
  defaultParams = {},
}) => {
  const [searchParams] = useSearchParams();
  const preselectedDocId = searchParams.get('docId');

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(preselectedDocId || '');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [parameters, setParameters] = useState<Record<string, any>>(defaultParams);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUserDocuments() {
      try {
        const res = await api.get('/documents?limit=50');
        setDocuments(res.data.data.documents || []);
      } catch {}
    }
    loadUserDocuments();
  }, []);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setSelectedDocId(''); // Clear existing doc selection if new file provided
  };

  const handleRunTool = async () => {
    if (!selectedDocId && selectedFiles.length === 0) {
      addToast('Input Required', 'Please select a cloud document or upload a file to process', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        if (allowMultiple) {
          selectedFiles.forEach((f) => formData.append('files', f));
        } else {
          formData.append('file', selectedFiles[0]);
        }
        Object.keys(parameters).forEach((k) => formData.append(k, parameters[k]));

        res = await api.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post(endpoint, {
          documentId: selectedDocId,
          parameters,
        });
      }

      const job: ProcessingJob = res.data.data.job;
      setActiveJobId(job.id);
      setIsProcessingModalOpen(true);
      addToast('Job Queued', `Job ${job.id.slice(0, 8)} dispatched to cloud worker`, 'info');
    } catch (err) {
      addToast('Operation Failed', getErrorMessage(err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">Cloud Tool</Badge>
          <span className="text-xs text-slate-400 font-mono">POST {endpoint}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Input Selection Card */}
      <Card className="p-6 space-y-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Step 1: Choose Source Document
        </h3>

        {/* Existing Repository Documents Dropdown */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select from My Documents:
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                setSelectedFiles([]);
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Or choose an uploaded cloud document --</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.fileType.toUpperCase()}, {d.pageCount} pages, {Math.round(d.fileSize / 1024)} KB)
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Or upload directly
          </span>
        </div>

        {/* Direct Upload Dropzone */}
        <DropZone
          onFilesSelected={handleFilesSelected}
          accept={acceptedFormats}
          multiple={allowMultiple}
          title={`Upload document for ${title}`}
          subtitle={`Drop file (${acceptedFormats}) to convert immediately`}
        />

        {selectedFiles.length > 0 && (
          <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-brand-900 dark:text-brand-300">
              Selected: {selectedFiles.map((f) => f.name).join(', ')}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])}>
              Clear
            </Button>
          </div>
        )}
      </Card>

      {/* Extra Parameters UI (if tool has options like compression level, angle, etc.) */}
      {extraParametersUI && (
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-500" />
            <span>Step 2: Conversion Options</span>
          </h3>
          {extraParametersUI(parameters, setParameters)}
        </Card>
      )}

      {/* Process CTA Button */}
      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          variant="primary"
          onClick={handleRunTool}
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Execute {title}
        </Button>
      </div>

      {/* Async Processing Status Modal */}
      <ProcessingModal
        jobId={activeJobId}
        isOpen={isProcessingModalOpen}
        onClose={() => setIsProcessingModalOpen(false)}
      />
    </div>
  );
};
