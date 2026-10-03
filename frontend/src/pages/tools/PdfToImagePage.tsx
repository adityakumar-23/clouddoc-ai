import React from 'react';
import { ToolWorkspace } from '../../components/tools/ToolWorkspace';
import { Input } from '../../components/ui/Input';

export const PdfToImagePage: React.FC = () => {
  return (
    <ToolWorkspace
      toolType="pdf-to-image"
      title="PDF to High-Resolution Image"
      description="Render PDF vector pages into high-definition raster images (SVG, PNG) for presentations, web embeds, or thumbnail previews."
      acceptedFormats=".pdf"
      endpoint="/tools/pdf-to-image"
      defaultParams={{ page: 1 }}
      extraParametersUI={(params, setParams) => (
        <div className="space-y-2">
          <Input
            type="number"
            min={1}
            label="Page Number to Render"
            value={params.page || 1}
            onChange={(e) => setParams({ ...params, page: parseInt(e.target.value, 10) || 1 })}
            helperText="Select which page of the document to extract as an image"
          />
        </div>
      )}
    />
  );
};
