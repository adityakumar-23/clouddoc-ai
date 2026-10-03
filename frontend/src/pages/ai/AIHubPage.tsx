import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { api, getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  Cpu,
  Search,
  ArrowRight,
  Database,
  FileText,
  Lock,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

export const AIHubPage: React.FC = () => {
  const [semanticQuery, setSemanticQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { addToast } = useToast();

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semanticQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await api.post('/ai/search', { query: semanticQuery });
      setSearchResults(res.data.data.results || []);
      if ((res.data.data.results || []).length === 0) {
        addToast('Search Finished', 'No relevant document passages matched your query.', 'info');
      }
    } catch (err) {
      addToast('Search Failed', getErrorMessage(err), 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const aiModules = [
    {
      title: 'RAG Document Q&A',
      desc: 'Chat directly with your documents. Every response is grounded in semantic vector embeddings and references exact source page citations.',
      icon: MessageSquare,
      path: '/ai/chat',
      badge: 'Interactive Chat',
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60',
    },
    {
      title: 'Hierarchical Summarizer',
      desc: 'Condense 50-page reports and contracts into structured executive summaries, core bullet points, and actionable next steps in seconds.',
      icon: Cpu,
      path: '/ai/summarize',
      badge: 'Map-Reduce',
      color: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60',
    },
    {
      title: 'Entity & Key Points Extractor',
      desc: 'Automatically identify and parse monetary amounts, execution dates, contractual entities, and classify document taxonomy.',
      icon: Sparkles,
      path: '/ai/extract',
      badge: 'Structured JSON',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="primary" size="md">Cloud Intelligence</Badge>
          <span className="text-xs text-slate-400">RAG Vector Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          AI Document Intelligence Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Extract insights, query information with grounded citations, and summarize complex cloud assets
        </p>
      </div>

      {/* Semantic Search Box */}
      <Card className="p-6 bg-gradient-to-r from-brand-900/10 via-indigo-900/10 to-purple-900/10 border-brand-200 dark:border-brand-900/50">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cross-Document Semantic Search
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Query ideas and concepts across all your stored documents using vector similarity search
          </p>

          <form onSubmit={handleSemanticSearch} className="flex gap-2">
            <Input
              placeholder="e.g., 'What are the termination clauses?' or 'S3 storage lifecycle rules'"
              value={semanticQuery}
              onChange={(e) => setSemanticQuery(e.target.value)}
              className="bg-white dark:bg-slate-900"
            />
            <Button type="submit" variant="primary" size="md" isLoading={isSearching}>
              Search
            </Button>
          </form>

          {/* Search Results Display */}
          {searchResults.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Top Relevant Matches:
              </p>
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/documents/${res.document.id}`}
                      className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{res.document.title}</span>
                    </Link>
                    <Badge variant="success" size="sm">
                      {Math.round(res.relevanceScore * 100)}% Match
                    </Badge>
                  </div>
                  {res.matchingSnippets?.map((snip: any, sIdx: number) => (
                    <div key={sIdx} className="p-2 rounded bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 italic text-[11px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200 not-italic mr-1.5">
                        [Page {snip.page}]:
                      </span>
                      "{snip.snippet}"
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* AI Feature Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {aiModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Card key={mod.title} className="p-6 flex flex-col justify-between space-y-4 hover:border-brand-500 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${mod.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="primary" size="sm">{mod.badge}</Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{mod.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{mod.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link to={mod.path}>
                  <Button variant="primary" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Open Feature
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
