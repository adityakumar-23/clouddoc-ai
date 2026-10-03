import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../../services/api';
import { Document } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Star, Eye, Download, FileText, Sparkles } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchFavorites() {
      setIsLoading(true);
      try {
        const res = await api.get('/documents?isFavorite=true');
        setDocuments(res.data.data.documents || []);
      } catch (err) {
        addToast('Error', getErrorMessage(err), 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchFavorites();
  }, []);

  const handleUnfavorite = async (docId: string) => {
    try {
      await api.patch(`/documents/${docId}/favorite`);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      addToast('Removed', 'Document removed from favorites', 'info');
    } catch (err) {
      addToast('Error', getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Favorite Documents</span>
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          High-priority documents bookmarked for rapid retrieval and transformation
        </p>
      </div>

      {isLoading ? (
        <Card className="p-6 space-y-4">
          <LoadingSkeleton className="h-6 w-full" />
          <LoadingSkeleton className="h-6 w-full" />
        </Card>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<Star className="w-7 h-7 text-amber-500" />}
          title="No favorite documents yet"
          description="Star important documents from your repository to access them quickly here."
          actionText="Browse Documents"
          onAction={() => (window.location.href = '/documents')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-5 flex flex-col justify-between space-y-4">
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
                  onClick={() => handleUnfavorite(doc.id)}
                  className="text-amber-500 hover:text-slate-300 transition-colors"
                >
                  <Star className="w-4 h-4 fill-amber-500" />
                </button>
              </div>

              <div>
                <Link
                  to={`/documents/${doc.id}`}
                  className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-600 line-clamp-1"
                >
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
                  {doc.downloadUrl && (
                    <a href={doc.downloadUrl} download={doc.originalName} className="p-1 hover:text-slate-700 dark:hover:text-slate-200">
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
