import { PDFDocument } from 'pdf-lib';
import { AppError } from '../../middleware/error.middleware';

export class SplitPdfProcessor {
  async process(pdfBuffer: Buffer, pageRangeStr: string): Promise<Buffer> {
    const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    const pageIndicesToKeep = this.parsePageRanges(pageRangeStr, totalPages);
    if (pageIndicesToKeep.length === 0) {
      throw new AppError('No valid pages found in specified split range', 400, 'INVALID_PAGE_RANGE');
    }

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, pageIndicesToKeep);
    copiedPages.forEach((page) => newDoc.addPage(page));

    const pdfBytes = await newDoc.save();
    return Buffer.from(pdfBytes);
  }

  private parsePageRanges(rangeStr: string, totalPages: number): number[] {
    const indices: Set<number> = new Set();
    const parts = rangeStr.split(',').map((p) => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = Math.max(1, parseInt(startStr, 10));
        const end = Math.min(totalPages, parseInt(endStr, 10));
        for (let i = start; i <= end; i++) {
          indices.add(i - 1); // 0-indexed
        }
      } else {
        const pageNum = parseInt(part, 10);
        if (pageNum >= 1 && pageNum <= totalPages) {
          indices.add(pageNum - 1);
        }
      }
    }

    return Array.from(indices).sort((a, b) => a - b);
  }
}

export const splitPdfProcessor = new SplitPdfProcessor();
