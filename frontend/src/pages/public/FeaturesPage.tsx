import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  FileText,
  Sparkles,
  Layers,
  Lock,
  Maximize2,
  Workflow,
  Search,
  RefreshCw,
  Cpu,
  Database,
  Cloud,
  CheckCircle2,
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const categories = [
    {
      category: 'Core Document Transformation',
      items: [
        { title: 'PDF to Word (.docx)', desc: 'Converts complex vector PDF documents into native Microsoft Word XML formats with paragraph and table styling.' },
        { title: 'Word to PDF', desc: 'Renders DOCX files into standardized PDF/A documents with bookmark preservation.' },
        { title: 'PDF to Excel (.xlsx)', desc: 'Extracts tabulated grid elements, column headers, and structured numeric cells directly into spreadsheet sheets.' },
        { title: 'Excel to PDF', desc: 'Renders wide spreadsheets with automatic landscape pagination and alternating grid lines.' },
        { title: 'Presentation Converters', desc: 'Bi-directional transformation between PPTX slide decks and 16:9 widescreen PDF presentation viewports.' },
      ],
    },
    {
      category: 'PDF Page & Stream Operations',
      items: [
        { title: 'Intelligent PDF Merge', desc: 'Combine multiple disparate documents with automatic page numbering and outline tree preservation.' },
        { title: 'Precision Splitter', desc: 'Specify custom page ranges (e.g. 1-4, 8, 12-16) or extract individual high-importance pages.' },
        { title: 'Lossless & Stream Compression', desc: 'Strips unreferenced object trees, downsamples embedded raster images, and compresses stream dictionaries.' },
        { title: 'Selective Page Rotation', desc: 'Rotate specific pages or uniform documents by 90°, 180°, or 270° orientation matrices.' },
        { title: 'Interactive Reordering & Deletion', desc: 'Visually reorder pages or excise confidential pages with instant client preview.' },
      ],
    },
    {
      category: 'AI & Document Intelligence',
      items: [
        { title: 'Grounded RAG Q&A', desc: 'Interactive chat anchored by vector embeddings and cosine similarity, yielding precise page-cited answers.' },
        { title: 'Hierarchical Summarization', desc: 'Generates executive summaries, critical takeaways, and scheduled action items in seconds.' },
        { title: 'Entity Extraction', desc: 'Isolates contractual dates, currency valuations, counterparties, and regulatory classifications.' },
        { title: 'Optical Character Recognition (OCR)', desc: 'Transcribes low-resolution scans and camera photos into crisp, searchable text layers.' },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4">
        <Badge variant="primary" size="md">Platform Capabilities</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          Complete Cloud Document Feature Set
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Explore the modular processing tools, vector retrieval systems, and storage engines powering CloudDoc AI.
        </p>
      </div>

      <div className="space-y-12">
        {categories.map((cat) => (
          <div key={cat.category} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              {cat.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.items.map((item) => (
                <Card key={item.title} className="p-6 space-y-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
