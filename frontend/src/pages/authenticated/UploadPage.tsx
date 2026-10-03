import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DropZone } from '../../components/common/DropZone';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { useToast } from '../../context/ToastContext';
import { api, getErrorMessage } from '../../services/api';
import { FileText, CheckCircle2, AlertCircle, UploadCloud, X, ArrowRight } from 'lucide-react';

interface UploadQueueItem {
  file: File;
  progress: number;
  status: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'ERROR';
  errorMessage?: string;
  documentId?: string;
}

export const UploadPage: React.FC = () => {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleFilesSelected = (files: File[]) => {
    const newItems: UploadQueueItem[] = files.map((file) => ({
      file,
      progress: 0,
      status: 'PENDING',
    }));
    setQueue((prev) => [...prev, ...newItems]);
  };

  const removeQueueItem = (index: number) => {
    setQueue((prev) => prev.filter((_, idx) => idx !== index));
  };

  const uploadAll = async () => {
    if (queue.length === 0) return;
    setIsUploading(true);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'COMPLETED') continue;

      setQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: 'UPLOADING', progress: 20 } : q))
      );

      try {
        const formData = new FormData();
        formData.append('file', item.file);

        const res = await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              ((progressEvent.loaded || 0) * 100) / (progressEvent.total || item.file.size)
            );
            setQueue((prev) =>
              prev.map((q, idx) =>
                idx === i ? { ...q, progress: Math.min(95, percentCompleted) } : q
              )
            );
          },
        });

        const uploadedDoc = res.data.data;
        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: 'COMPLETED', progress: 100, documentId: uploadedDoc.id } : q
          )
        );
        addToast('Upload Complete', `"${item.file.name}" saved to encrypted S3`, 'success');
      } catch (err) {
        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: 'ERROR', errorMessage: getErrorMessage(err) } : q
          )
        );
        addToast('Upload Failed', getErrorMessage(err), 'error');
      }
    }

    setIsUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Upload Documents
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Direct ingestion into private Amazon S3 with automated text indexing
        </p>
      </div>

      <DropZone
        onFilesSelected={handleFilesSelected}
        multiple={true}
        title="Drop your files here to start upload"
        subtitle="Upload PDF, Word, PowerPoint, Excel, or high-res images up to 100 MB"
      />

      {/* Selected Files Queue */}
      {queue.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Upload Batch ({queue.length} files)
            </h3>
            {!isUploading && (
              <Button
                variant="primary"
                size="sm"
                onClick={uploadAll}
                leftIcon={<UploadCloud className="w-4 h-4" />}
              >
                Upload All Files
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {queue.map((item, idx) => (
              <div
                key={`${item.file.name}-${idx}`}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-sm">
                        {item.file.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {Math.round(item.file.size / 1024)} KB · {item.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'COMPLETED' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {item.documentId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/documents/${item.documentId}`)}
                            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                          >
                            View
                          </Button>
                        )}
                      </div>
                    )}
                    {item.status === 'ERROR' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                    {item.status === 'PENDING' && !isUploading && (
                      <button
                        onClick={() => removeQueueItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {item.status === 'UPLOADING' && (
                  <Progress value={item.progress} size="sm" showLabel />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
