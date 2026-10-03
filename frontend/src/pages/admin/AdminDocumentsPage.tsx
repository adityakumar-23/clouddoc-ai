import React, { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';

export const AdminDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function loadDocuments() {
      setIsLoading(true);
      try {
        const res = await api.get(`/admin/documents?page=${page}&limit=20`);
        setDocuments(res.data.data.documents || []);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
      } catch (err) {
        addToast('Error', getErrorMessage(err), 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadDocuments();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Documents Inventory
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Global index of all documents stored across S3 private object buckets
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Format</th>
                <th className="p-4 font-semibold">Size</th>
                <th className="p-4 font-semibold">Tenant Owner</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Uploaded</th>
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
                documents.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {d.title}
                    </td>
                    <td className="p-4">
                      <Badge variant={d.fileType as any} size="sm">{d.fileType}</Badge>
                    </td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                      {Math.round(d.fileSize / 1024)} KB
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {d.ownerEmail}
                    </td>
                    <td className="p-4">
                      <Badge variant="success" size="sm">{d.status}</Badge>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(d.createdAt).toLocaleDateString()}
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
