import React from 'react';
import { ToolWorkspace } from '../../components/tools/ToolWorkspace';

export const WordToPdfPage: React.FC = () => {
  return (
    <ToolWorkspace
      toolType="word-to-pdf"
      title="Word to PDF Converter"
      description="Transform Microsoft Word documents (.docx, .doc) into high-fidelity PDF/A documents ready for printing, signing, and sharing."
      acceptedFormats=".docx,.doc"
      endpoint="/tools/word-to-pdf"
    />
  );
};
