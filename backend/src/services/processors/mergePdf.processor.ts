import { PDFDocument } from 'pdf-lib';
import { AppError } from '../../middleware/error.middleware';

export class MergePdfProcessor {
  async process(pdfBuffers: Buffer[]): Promise<Buffer> {
    if (!pdfBuffers || pdfBuffers.length < 2) {
      throw new AppError('At least two PDF files are required for merging', 400, 'INSUFFICIENT_FILES');
    }

    const mergedPdf = await PDFDocument.create();

    for (const buffer of pdfBuffers) {
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    return Buffer.from(mergedBytes);
  }
}

export const mergePdfProcessor = new MergePdfProcessor();
