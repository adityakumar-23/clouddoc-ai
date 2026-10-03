import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle2, AlertCircle, Download, FileText, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { ProcessingJob } from '../../types';
import { Link } from 'react-router-dom';

export interface ProcessingModalProps {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (job: ProcessingJob) => void;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  jobId,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!jobId || !isOpen) {
      setJob(null);
      return;
    }

    let isMounted = true;
    let pollInterval: any = null;

    async function fetchJobStatus() {
      try {
        const res = await api.get(`/jobs/${jobId}`);
        const currentJob = res.data.data.job as ProcessingJob;

        if (isMounted) {
          setJob(currentJob);

          if (currentJob.status === 'COMPLETED') {
            clearInterval(pollInterval);
            setIsPolling(false);
            if (onComplete) onComplete(currentJob);
          } else if (currentJob.status === 'FAILED' || currentJob.status === 'CANCELLED') {
            clearInterval(pollInterval);
            setIsPolling(false);
          }
        }
      } catch (err) {
        // Retry
      }
    }

    setIsPolling(true);
    fetchJobStatus();
    pollInterval = setInterval(fetchJobStatus, 1500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [jobId, isOpen]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        job?.status === 'COMPLETED'
          ? 'Processing Completed'
          : job?.status === 'FAILED'
          ? 'Processing Failed'
          : 'Processing Document'
      }
      description="Cloud asynchronous conversion pipeline execution"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Job Header */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Operation</p>
              <h4 className="text-sm font-semibold capitalize text-slate-800 dark:text-slate-100">
                {job?.toolType ? job.toolType.replace(/-/g, ' ') : 'Processing'}
              </h4>
            </div>
          </div>

          <Badge
            variant={
              job?.status === 'COMPLETED'
                ? 'success'
                : job?.status === 'FAILED'
                ? 'danger'
                : 'primary'
            }
          >
            {job?.status || 'QUEUED'}
          </Badge>
        </div>

        {/* Progress Bar & Status */}
        <div className="space-y-2">
          <Progress
            value={job?.progress || (job?.status === 'COMPLETED' ? 100 : 15)}
            showLabel
            size="md"
            variant={job?.status === 'FAILED' ? 'warning' : 'brand'}
          />

          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            {job?.status === 'COMPLETED' && 'All stages finished successfully. Result is available for download.'}
            {job?.status === 'PROCESSING' && 'Running document transformation in cloud background worker...'}
            {job?.status === 'QUEUED' && 'Job placed in BullMQ queue. Awaiting worker pickup...'}
            {job?.status === 'FAILED' && (job.errorMessage || 'An error occurred during transformation.')}
          </p>
        </div>

        {/* Processing Event Log */}
        {job?.history && job.history.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 max-h-36 overflow-y-auto space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Execution Timeline
            </p>
            {job.history.map((h) => (
              <div key={h.id} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="text-[10px] text-brand-600 dark:text-brand-400 font-mono mt-0.5">
                  [{h.progress}%]
                </span>
                <span>{h.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Completion Actions */}
        {job?.status === 'COMPLETED' && (
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {job.downloadUrl && (
              <a
                href={job.downloadUrl}
                download={job.outputFileName || 'document_processed'}
                className="flex-1"
              >
                <Button variant="primary" className="w-full" leftIcon={<Download className="w-4 h-4" />}>
                  Download {job.outputFileName ? `(${job.outputFileName.split('.').pop()?.toUpperCase()})` : 'File'}
                </Button>
              </a>
            )}

            <Button variant="outline" onClick={onClose} className="sm:w-auto">
              Done
            </Button>
          </div>
        )}

        {job?.status === 'FAILED' && (
          <div className="pt-2 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Dismiss
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
