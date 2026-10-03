import React, { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';
import { ProcessingJob } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Clock, Download, RefreshCw, XCircle, FileText, CheckCircle2 } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/jobs?page=${page}&limit=15`);
      setJobs(res.data.data.jobs || []);
      setTotalPages(res.data.data.pagination?.totalPages || 1);
    } catch (err) {
      addToast('Error', getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const handleCancelJob = async (jobId: string) => {
    try {
      await api.post(`/jobs/${jobId}/cancel`);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: 'CANCELLED' } : j))
      );
      addToast('Cancelled', 'Processing job was stopped', 'info');
    } catch (err) {
      addToast('Error', getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Processing History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit trail of asynchronous background BullMQ transformations
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchJobs}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh Jobs
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-6 space-y-4">
          <LoadingSkeleton className="h-6 w-full" />
          <LoadingSkeleton className="h-6 w-full" />
          <LoadingSkeleton className="h-6 w-full" />
        </Card>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No background jobs recorded"
          description="Transformations initiated via document tools will appear here in real-time."
          actionText="Explore Tools"
          onAction={() => (window.location.href = '/tools')}
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold capitalize text-slate-900 dark:text-white">
                        {job.toolType.replace(/-/g, ' ')}
                      </h4>
                      <Badge
                        variant={
                          job.status === 'COMPLETED'
                            ? 'success'
                            : job.status === 'FAILED'
                            ? 'danger'
                            : 'primary'
                        }
                        size="sm"
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Source: <span className="font-semibold text-slate-700 dark:text-slate-300">{job.document?.title || 'Uploaded Document'}</span>
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {job.executionTimeMs ? `${job.executionTimeMs}ms` : 'Queued'}
                      </span>
                      <span>·</span>
                      <span>{new Date(job.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {job.status === 'COMPLETED' && job.downloadUrl && (
                    <a href={job.downloadUrl} download={job.outputFileName || 'document_result'}>
                      <Button variant="primary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                        Download
                      </Button>
                    </a>
                  )}

                  {(job.status === 'PROCESSING' || job.status === 'QUEUED') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelJob(job.id)}
                      leftIcon={<XCircle className="w-4 h-4 text-rose-500" />}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {job.status === 'PROCESSING' && (
                <div className="mt-3">
                  <Progress value={job.progress} size="sm" showLabel />
                </div>
              )}

              {job.errorMessage && (
                <div className="mt-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">
                  {job.errorMessage}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};
