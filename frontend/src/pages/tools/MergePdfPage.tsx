import React from 'react';
import { ToolWorkspace } from '../../components/tools/ToolWorkspace';

export const MergePdfPage: React.FC = () => {
  return (
    <ToolWorkspace
      toolType="merge-pdf"
      title="Merge PDF Files"
      description="Combine multiple PDF documents into a single cohesive document with sequential page ordering."
      acceptedFormats=".pdf"
      endpoint="/tools/merge"
      allowMultiple={true}
    />
  );
};
