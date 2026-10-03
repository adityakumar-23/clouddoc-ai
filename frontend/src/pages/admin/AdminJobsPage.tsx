import React, { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

export const AdminJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function loadJobs() {
      setIsLoading(true);
      try {
        const query = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
        const res = await api.get(`/admin/jobs?page=${page}&limit=20${query}`);
        setJobs(res.data.data.jobs || []);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
      } catch (err) {
        addToast('Error', getErrorMessage(err), 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadJobs();
  }, [page, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Worker Job Queue Monitor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time telemetry on BullMQ job lifecycle, completion times, and execution exceptions
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
          {['all', 'COMPLETED', 'FAILED', 'PROCESSING'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {s.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="p-4 font-semibold">Job ID & Tool</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Progress</th>
                <th className="p-4 font-semibold">Tenant</th>
                <th className="p-4 font-semibold">Execution Time</th>
                <th className="p-4 font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center">
                    <LoadingSkeleton className="h-6 w-full" />
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No worker jobs match the active filter criteria.
                  </td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-4">
                      <p className="font-bold capitalize text-slate-900 dark:text-white">
                        {j.toolType.replace(/-/g, ' ')}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">{j.id.slice(0, 16)}...</p>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          j.status === 'COMPLETED'
                            ? 'success'
                            : j.status === 'FAILED'
                            ? 'danger'
                            : 'primary'
                        }
                        size="sm"
                      >
                        {j.status}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono font-semibold">{j.progress}%</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{j.userEmail}</td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                      {j.executionTimeMs ? `${j.executionTimeMs}ms` : '—'}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(j.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};
