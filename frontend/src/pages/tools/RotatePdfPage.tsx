import React from 'react';
import { ToolWorkspace } from '../../components/tools/ToolWorkspace';
import { RotateCw } from 'lucide-react';

export const RotatePdfPage: React.FC = () => {
  return (
    <ToolWorkspace
      toolType="rotate-pdf"
      title="Rotate PDF Pages"
      description="Reorient upside down or rotated PDF pages by 90°, 180°, or 270° degrees."
      acceptedFormats=".pdf"
      endpoint="/tools/rotate"
      defaultParams={{ angle: 90 }}
      extraParametersUI={(params, setParams) => (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Clockwise Rotation Angle:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { angle: 90, label: '90° Clockwise' },
              { angle: 180, label: '180° Flip' },
              { angle: 270, label: '270° Counter-Clockwise' },
            ].map((opt) => (
              <button
                key={opt.angle}
                type="button"
                onClick={() => setParams({ ...params, angle: opt.angle })}
                className={`p-3.5 rounded-xl border text-center text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  (params.angle || 90) === opt.angle
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <RotateCw className="w-4 h-4" />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    />
  );
};
