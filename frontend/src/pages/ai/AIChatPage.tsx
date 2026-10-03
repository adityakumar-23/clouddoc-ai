import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api, getErrorMessage } from '../../services/api';
import { Document, AIMessage } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  Sparkles,
  Send,
  User,
  Bot,
  FileText,
  Bookmark,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export const AIChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedDocId = searchParams.get('docId') || '';

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(preselectedDocId);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    async function loadDocuments() {
      try {
        const res = await api.get('/documents?limit=50');
        const docs = res.data.data.documents || [];
        setDocuments(docs);
        if (!selectedDocId && docs.length > 0) {
          setSelectedDocId(docs[0].id);
        }
      } catch {}
    }
    loadDocuments();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const question = textToSend || inputQuestion;
    if (!question.trim()) return;
    if (!selectedDocId) {
      addToast('Select Document', 'Please choose a document to chat with', 'error');
      return;
    }

    const optimisticUserMsg: AIMessage = {
      id: `temp-${Date.now()}`,
      conversationId: conversationId || '',
      sender: 'USER',
      content: question,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInputQuestion('');
    setIsSending(true);

    try {
      const res = await api.post('/ai/chat', {
        documentId: selectedDocId,
        question,
        conversationId,
      });

      const { conversationId: newConvId, assistantMessage } = res.data.data;
      setConversationId(newConvId);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      addToast('AI Request Failed', getErrorMessage(err), 'error');
    } finally {
      setIsSending(false);
    }
  };

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  const suggestedQuestions = [
    'What are the primary operational recommendations outlined in this document?',
    'What are the critical dates and milestone deadlines mentioned?',
    'Summarize the financial metrics and cost impact.',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="md">RAG Architecture</Badge>
            <span className="text-xs text-slate-400">Cosine Similarity Grounding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Document Q&A with Citations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Answers are strictly synthesized from retrieved document chunks with source page references
          </p>
        </div>

        {/* Document Switcher */}
        <div className="w-full sm:w-64">
          <select
            value={selectedDocId}
            onChange={(e) => {
              setSelectedDocId(e.target.value);
              setMessages([]);
              setConversationId(null);
            }}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.fileType.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Box Card */}
      <Card className="flex flex-col h-[580px] shadow-lg overflow-hidden border-slate-200 dark:border-slate-800">
        {/* Active Document Subheader */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <FileText className="w-4 h-4 text-brand-500" />
            <span className="font-semibold truncate max-w-sm">
              Context: {selectedDoc?.title || 'No Document Selected'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hallucination Filter Active</span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Ask Anything About This Document
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  The RAG pipeline retrieves relevant passages and synthesizes an answer with exact page citations.
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="w-full max-w-md space-y-2 pt-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left">
                  Suggested Prompts:
                </p>
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'USER' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender !== 'USER' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-xl space-y-2.5 ${
                    msg.sender === 'USER'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-subtle'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Citations Box */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <Bookmark className="w-3 h-3" /> Grounded Source Citations
                      </p>
                      <div className="space-y-1">
                        {msg.citations.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-900/60 text-[11px] border border-slate-200/50 dark:border-slate-800"
                          >
                            <span className="font-bold text-slate-900 dark:text-slate-100 mr-1.5">
                              [Page {c.page}]:
                            </span>
                            <span className="italic text-slate-600 dark:text-slate-300">
                              "{c.snippet}"
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.promptTokens && (
                    <p className="text-[10px] text-slate-400 font-mono">
                      Tokens: {msg.promptTokens} in / {msg.completionTokens || 0} out
                    </p>
                  )}
                </div>

                {msg.sender === 'USER' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {isSending && (
            <div className="flex gap-3 text-xs justify-start items-center text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
                <span>Searching vector chunks & synthesizing answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              placeholder={`Ask a question about ${selectedDoc?.title || 'this document'}...`}
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              disabled={isSending}
              className="flex-1"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!inputQuestion.trim() || isSending}
              isLoading={isSending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
