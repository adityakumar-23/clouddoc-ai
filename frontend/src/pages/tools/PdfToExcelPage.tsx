import React from 'react';
import { ToolWorkspace } from '../../components/tools/ToolWorkspace';

export const PdfToExcelPage: React.FC = () => {
  return (
    <ToolWorkspace
      toolType="pdf-to-excel"
      title="PDF to Excel Converter"
      description="Extract financial tables, balance sheets, and tabular records from PDF into organized Excel (.xlsx) workbooks."
      acceptedFormats=".pdf"
      endpoint="/tools/pdf-to-excel"
    />
  );
};
