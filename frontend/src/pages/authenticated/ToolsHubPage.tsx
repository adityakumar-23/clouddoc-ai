import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  FileText,
  Layers,
  Maximize2,
  Workflow,
  RefreshCw,
  Image as ImageIcon,
  Cpu,
  Search,
  Sparkles,
  ArrowRight,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';

export const ToolsHubPage: React.FC = () => {
  const toolSections = [
    {
      title: 'Convert From PDF',
      tools: [
        { name: 'PDF to Word', desc: 'Convert PDF into formatted Microsoft Word (.docx) document.', path: '/tools/pdf-to-word', icon: FileText, tag: 'Popular' },
        { name: 'PDF to PowerPoint', desc: 'Convert PDF pages into presentation slides (.pptx).', path: '/tools/pdf-to-ppt', icon: RefreshCw },
        { name: 'PDF to Excel', desc: 'Extract data tables into Excel (.xlsx) workbooks.', path: '/tools/pdf-to-excel', icon: FileSpreadsheet },
        { name: 'PDF to Images', desc: 'Render pages as high-resolution PNG/SVG images.', path: '/tools/pdf-to-image', icon: ImageIcon },
      ],
    },
    {
      title: 'Convert To PDF',
      tools: [
        { name: 'Word to PDF', desc: 'Transform Word (.docx) into standard PDF/A format.', path: '/tools/word-to-pdf', icon: FileText, tag: 'Native' },
        { name: 'PowerPoint to PDF', desc: 'Export presentation decks into widescreen PDF slides.', path: '/tools/ppt-to-pdf', icon: RefreshCw },
        { name: 'Image to PDF', desc: 'Embed JPG, PNG, and WebP images into a multi-page PDF.', path: '/tools/image-to-pdf', icon: ImageIcon },
      ],
    },
    {
      title: 'PDF Page & Stream Manipulation',
      tools: [
        { name: 'Merge PDF', desc: 'Combine multiple PDF documents into a unified file.', path: '/tools/merge-pdf', icon: Layers, tag: 'Fast' },
        { name: 'Split PDF', desc: 'Extract custom page ranges or separate pages.', path: '/tools/split-pdf', icon: Workflow },
        { name: 'Compress PDF', desc: 'Optimize stream dictionaries to reduce file size.', path: '/tools/compress-pdf', icon: Maximize2, tag: 'Lossless' },
        { name: 'Rotate PDF', desc: 'Rotate specific pages or entire documents by 90° intervals.', path: '/tools/rotate-pdf', icon: RefreshCw },
      ],
    },
    {
      title: 'AI Intelligence & OCR',
      tools: [
        { name: 'Document Summarizer', desc: 'Generate executive summaries and key decision points.', path: '/ai/summarize', icon: Cpu, tag: 'AI' },
        { name: 'RAG Document Chat', desc: 'Ask questions with verified page citations and quotes.', path: '/ai/chat', icon: Sparkles, tag: 'Vector RAG' },
        { name: 'Key Points & Entities', desc: 'Extract contractual dates, financial numbers, and organizations.', path: '/ai/extract', icon: Search, tag: 'AI' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Document Tools Catalog
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select a tool to process existing cloud documents or upload a new file
        </p>
      </div>

      <div className="space-y-10">
        {toolSections.map((sec) => (
          <div key={sec.title} className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
              {sec.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sec.tools.map((t) => {
                const Icon = t.icon;
                return (
                  <Link key={t.name} to={t.path} className="group">
                    <Card className="p-5 h-full hover:border-brand-500 transition-all duration-200 group-hover:-translate-y-0.5 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center transition-transform group-hover:scale-110">
                            <Icon className="w-5 h-5" />
                          </div>
                          {t.tag && <Badge variant="primary" size="sm">{t.tag}</Badge>}
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {t.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {t.desc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center text-xs text-brand-600 dark:text-brand-400 font-semibold gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Launch Tool</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
