import React from 'react';
import { ToolWorkspace } from '../../components/tools/ToolWorkspace';

export const ImageToPdfPage: React.FC = () => {
  return (
    <ToolWorkspace
      toolType="image-to-pdf"
      title="Image to PDF Converter"
      description="Convert single or multiple JPG, PNG, and WebP images into a standardized vector PDF with automatic page fitting."
      acceptedFormats=".jpg,.jpeg,.png,.webp"
      endpoint="/tools/image-to-pdf"
      allowMultiple={true}
    />
  );
};
