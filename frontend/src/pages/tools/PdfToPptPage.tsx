import React from 'react';
import { ToolWorkspace } from '../../components/tools/ToolWorkspace';

export const PdfToPptPage: React.FC = () => {
  return (
    <ToolWorkspace
      toolType="pdf-to-ppt"
      title="PDF to PowerPoint Converter"
      description="Extract PDF presentation pages and generate editable Microsoft PowerPoint slides (.pptx)."
      acceptedFormats=".pdf"
      endpoint="/tools/pdf-to-ppt"
    />
  );
};
