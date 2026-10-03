import React from 'react';
import { ToolWorkspace } from '../../components/tools/ToolWorkspace';

export const CompressPdfPage: React.FC = () => {
  return (
    <ToolWorkspace
      toolType="compress-pdf"
      title="Compress PDF"
      description="Reduce PDF file size up to 70% by optimizing stream objects, font dictionaries, and embedded raster resources."
      acceptedFormats=".pdf"
      endpoint="/tools/compress"
      defaultParams={{ compressionLevel: 'medium' }}
      extraParametersUI={(params, setParams) => (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Compression Intensity Level:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'low', name: 'Low (Light)', desc: 'Highest visual quality, ~25% size reduction' },
              { id: 'medium', name: 'Medium (Balanced)', desc: 'Recommended, ~55% size reduction' },
              { id: 'high', name: 'High (Maximum)', desc: 'Smallest file size for web & email distribution' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setParams({ ...params, compressionLevel: lvl.id })}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  (params.compressionLevel || 'medium') === lvl.id
                    ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <p className="font-bold">{lvl.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{lvl.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    />
  );
};
