import React from 'react';
import { ToolWorkspace } from '../../components/tools/ToolWorkspace';

export const PptToPdfPage: React.FC = () => {
  return (
    <ToolWorkspace
      toolType="ppt-to-pdf"
      title="PowerPoint to PDF Converter"
      description="Convert Microsoft PowerPoint presentations (.pptx, .ppt) into standardized widescreen PDF slide decks."
      acceptedFormats=".pptx,.ppt"
      endpoint="/tools/ppt-to-pdf"
    />
  );
};
