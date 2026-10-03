import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../../services/api';
import { Document } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  Files,
  Search,
  Filter,
  UploadCloud,
  Star,
  Download,
  Trash2,
  Eye,
  FileText,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [fileType, setFileType] = useState('all');
  const [isFavorite, setIsFavorite] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(search && { search }),
        ...(fileType !== 'all' && { fileType }),
        ...(isFavorite && { isFavorite: 'true' }),
      });

      const res = await api.get(`/documents?${params.toString()}`);
      setDocuments(res.data.data.documents || []);
      setTotalPages(res.data.data.pagination?.totalPages || 1);
    } catch (err) {
      addToast('Error', getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, fileType, isFavorite]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDocuments();
  };

  const handleToggleFavorite = async (docId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.patch(`/documents/${docId}/favorite`);
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, isFavorite: !d.isFavorite } : d))
      );
    } catch (err) {
      addToast('Error', getErrorMessage(err), 'error');
    }
  };

  const handleDelete = async (docId: string, docTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${docTitle}"?`)) return;

    try {
      await api.delete(`/documents/${docId}`);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      addToast('Deleted', `"${docTitle}" removed from S3 storage`, 'success');
    } catch (err) {
      addToast('Delete Failed', getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Document Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, manage, and process your private S3 document assets
          </p>
        </div>

        <Link to="/upload">
          <Button variant="primary" leftIcon={<UploadCloud className="w-4 h-4" />}>
            Upload Document
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80">
            <Input
              placeholder="Search by title or filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Format Pills */}
            {['all', 'pdf', 'docx', 'xlsx', 'pptx'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFileType(type);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                  fileType === type
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {type}
              </button>
            ))}

            <button
              onClick={() => {
                setIsFavorite(!isFavorite);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                isFavorite
                  ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Favorites</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 ml-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          <LoadingSkeleton className="h-6 w-full" />
          <LoadingSkeleton className="h-6 w-full" />
          <LoadingSkeleton className="h-6 w-full" />
          <LoadingSkeleton className="h-6 w-3/4" />
        </Card>
      ) : documents.length === 0 ? (
        <EmptyState
          title="No documents found"
          description={
            search || fileType !== 'all' || isFavorite
              ? 'Try modifying your search filter parameters.'
              : 'You have not uploaded any documents to this workspace yet.'
          }
          actionText="Upload Document"
          onAction={() => (window.location.href = '/upload')}
        />
      ) : viewMode === 'table' ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-semibold">Title & Details</th>
                  <th className="p-4 font-semibold">Format</th>
                  <th className="p-4 font-semibold">Size</th>
                  <th className="p-4 font-semibold">Pages</th>
                  <th className="p-4 font-semibold">Uploaded</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={(e) => handleToggleFavorite(doc.id, e)}
                          className="mt-0.5 text-slate-300 hover:text-amber-400 transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${doc.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                          />
                        </button>
                        <div>
                          <Link
                            to={`/documents/${doc.id}`}
                            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 text-sm"
                          >
                            {doc.title}
                          </Link>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{doc.originalName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={doc.fileType as any} size="sm">
                        {doc.fileType}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-slate-500 dark:text-slate-400">
                      {Math.round(doc.fileSize / 1024)} KB
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                      {doc.pageCount}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/documents/${doc.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View & Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/ai/chat?docId=${doc.id}`}
                          className="p-1.5 rounded-lg text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                          title="Ask AI with Citations"
                        >
                          <Sparkles className="w-4 h-4" />
                        </Link>
                        {doc.downloadUrl && (
                          <a
                            href={doc.downloadUrl}
                            download={doc.originalName}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Download Original"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={(e) => handleDelete(doc.id, doc.title, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-5 hover:border-brand-500 transition-all flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge variant={doc.fileType as any} size="sm">
                    {doc.fileType}
                  </Badge>
                </div>
                <button
                  onClick={(e) => handleToggleFavorite(doc.id, e)}
                  className="text-slate-300 hover:text-amber-400"
                >
                  <Star className={`w-4 h-4 ${doc.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>

              <div>
                <Link to={`/documents/${doc.id}`} className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-600 line-clamp-1">
                  {doc.title}
                </Link>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{doc.originalName}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                <span>{doc.pageCount} pages · {Math.round(doc.fileSize / 1024)} KB</span>
                <div className="flex items-center gap-1">
                  <Link to={`/documents/${doc.id}`} className="p-1 hover:text-brand-600">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link to={`/ai/chat?docId=${doc.id}`} className="p-1 hover:text-purple-500">
                    <Sparkles className="w-4 h-4" />
                  </Link>
                  <button onClick={(e) => handleDelete(doc.id, doc.title, e)} className="p-1 hover:text-rose-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};
