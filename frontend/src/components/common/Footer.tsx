import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, ShieldCheck, Cpu, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
                <Cloud className="w-4 h-4 fill-white/20" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                CloudDoc<span className="text-brand-600 dark:text-brand-400 font-extrabold ml-1">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Enterprise-grade document processing, format transformation, optical character recognition, and retrieval-augmented AI understanding built for AWS cloud infrastructure.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> AES-256 Encrypted
              </span>
              <span className="inline-flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-blue-500" /> RDS Multi-AZ
              </span>
              <span className="inline-flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" /> EC2 Graviton
              </span>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">
              Popular Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/tools/pdf-to-word" className="hover:text-brand-600 dark:hover:text-brand-400">PDF to Word</Link></li>
              <li><Link to="/tools/merge-pdf" className="hover:text-brand-600 dark:hover:text-brand-400">Merge PDF</Link></li>
              <li><Link to="/tools/compress-pdf" className="hover:text-brand-600 dark:hover:text-brand-400">Compress PDF</Link></li>
              <li><Link to="/tools/split-pdf" className="hover:text-brand-600 dark:hover:text-brand-400">Split PDF</Link></li>
              <li><Link to="/tools/word-to-pdf" className="hover:text-brand-600 dark:hover:text-brand-400">Word to PDF</Link></li>
              <li><Link to="/tools/image-to-pdf" className="hover:text-brand-600 dark:hover:text-brand-400">Image to PDF</Link></li>
            </ul>
          </div>

          {/* AI Capabilities */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">
              AI Capabilities
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/ai/summarize" className="hover:text-brand-600 dark:hover:text-brand-400">Document Summarizer</Link></li>
              <li><Link to="/ai/chat" className="hover:text-brand-600 dark:hover:text-brand-400">RAG Chat with PDF</Link></li>
              <li><Link to="/ai/extract" className="hover:text-brand-600 dark:hover:text-brand-400">Entity & Key Points</Link></li>
              <li><Link to="/tools/rotate-pdf" className="hover:text-brand-600 dark:hover:text-brand-400">Page Management</Link></li>
              <li><Link to="/pricing" className="hover:text-brand-600 dark:hover:text-brand-400">API Tokens & Quota</Link></li>
            </ul>
          </div>

          {/* Legal & Platform */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">
              Governance & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/privacy" className="hover:text-brand-600 dark:hover:text-brand-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-600 dark:hover:text-brand-400">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-brand-600 dark:hover:text-brand-400">Contact Support</Link></li>
              <li><a href="/api/v1/health" target="_blank" rel="noreferrer" className="hover:text-brand-600 dark:hover:text-brand-400">System Status</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>© 2026 CloudDoc AI Inc. All rights reserved.</p>
          <p>Production AWS Architecture · ISO/IEC 27001 & SOC 2 Type II Aligned Design</p>
        </div>
      </div>
    </footer>
  );
};
