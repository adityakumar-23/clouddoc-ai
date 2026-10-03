import React, { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Users, Shield, Mail } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      try {
        const res = await api.get(`/admin/users?page=${page}&limit=20`);
        setUsers(res.data.data.users || []);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
      } catch (err) {
        addToast('Error', getErrorMessage(err), 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          User Management
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View registered tenants, role assignments, storage consumption, and account status
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Plan</th>
                <th className="p-4 font-semibold">Storage Used</th>
                <th className="p-4 font-semibold">Documents</th>
                <th className="p-4 font-semibold">Jobs</th>
                <th className="p-4 font-semibold">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center">
                    <LoadingSkeleton className="h-6 w-full" />
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{u.fullName}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant={u.role === 'ADMIN' ? 'warning' : 'primary'} size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="neutral" size="sm">{u.plan}</Badge>
                    </td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                      {Math.round(u.storageUsedBytes / (1024 * 1024))} MB
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">
                      {u.documentCount}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">
                      {u.jobCount}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
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
