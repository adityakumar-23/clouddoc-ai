import React, { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { Shield } from 'lucide-react';

export const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      try {
        const res = await api.get(`/admin/logs?page=${page}&limit=25`);
        setLogs(res.data.data.logs || []);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
      } catch (err) {
        addToast('Error', getErrorMessage(err), 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Security & Audit Logs
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Immutable audit record of all authentication, file access, and administrative actions
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="p-4 font-semibold">Action Key</th>
                <th className="p-4 font-semibold">Entity Type</th>
                <th className="p-4 font-semibold">User Principal</th>
                <th className="p-4 font-semibold">IP Address</th>
                <th className="p-4 font-semibold">User Agent</th>
                <th className="p-4 font-semibold">Logged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center">
                    <LoadingSkeleton className="h-6 w-full" />
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="p-4 text-slate-500">{log.entityType}</td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {log.user?.email || 'Anonymous / System'}
                    </td>
                    <td className="p-4 font-mono text-slate-400">{log.ipAddress}</td>
                    <td className="p-4 text-slate-400 truncate max-w-xs">{log.userAgent}</td>
                    <td className="p-4 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
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
