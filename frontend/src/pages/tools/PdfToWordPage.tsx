import React from 'react';
import { ToolWorkspace } from '../../components/tools/ToolWorkspace';

export const PdfToWordPage: React.FC = () => {
  return (
    <ToolWorkspace
      toolType="pdf-to-word"
      title="PDF to Word Converter"
      description="Convert PDF documents into editable Microsoft Word (.docx) files while preserving headings, paragraphs, and text formatting."
      acceptedFormats=".pdf"
      endpoint="/tools/pdf-to-word"
    />
  );
};
