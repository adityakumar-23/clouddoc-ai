import React from 'react';
import { ToolWorkspace } from '../../components/tools/ToolWorkspace';
import { Input } from '../../components/ui/Input';

export const SplitPdfPage: React.FC = () => {
  return (
    <ToolWorkspace
      toolType="split-pdf"
      title="Split PDF Document"
      description="Extract specific page ranges, divide chapters, or burst a large document into targeted segments."
      acceptedFormats=".pdf"
      endpoint="/tools/split"
      defaultParams={{ pageRange: '1-3' }}
      extraParametersUI={(params, setParams) => (
        <div className="space-y-2">
          <Input
            label="Page Range to Extract"
            placeholder="e.g. 1-3, 5, 8-10"
            value={params.pageRange || ''}
            onChange={(e) => setParams({ ...params, pageRange: e.target.value })}
            helperText="Specify comma-separated page numbers or ranges (e.g., 1-4, 7, 9-12)"
          />
        </div>
      )}
    />
  );
};
