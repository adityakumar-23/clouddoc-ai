import { PDFDocument } from 'pdf-lib';
import { AppError } from '../../middleware/error.middleware';

export class PageManagementProcessor {
  async extractPages(pdfBuffer: Buffer, pageNumbers: number[]): Promise<Buffer> {
    const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    const validIndices = pageNumbers
      .map((p) => p - 1)
      .filter((idx) => idx >= 0 && idx < totalPages);

    if (validIndices.length === 0) {
      throw new AppError('No valid pages to extract', 400, 'INVALID_PAGE_NUMBERS');
    }

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, validIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    const bytes = await newDoc.save();
    return Buffer.from(bytes);
  }

  async deletePages(pdfBuffer: Buffer, pageNumbersToDelete: number[]): Promise<Buffer> {
    const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    const deleteSet = new Set(pageNumbersToDelete.map((p) => p - 1));
    const keepIndices = Array.from({ length: totalPages }, (_, i) => i).filter(
      (idx) => !deleteSet.has(idx)
    );

    if (keepIndices.length === 0) {
      throw new AppError('Cannot delete all pages in document', 400, 'CANNOT_DELETE_ALL_PAGES');
    }

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, keepIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    const bytes = await newDoc.save();
    return Buffer.from(bytes);
  }

  async reorderPages(pdfBuffer: Buffer, newOrderPageNumbers: number[]): Promise<Buffer> {
    const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    const indices = newOrderPageNumbers
      .map((p) => p - 1)
      .filter((idx) => idx >= 0 && idx < totalPages);

    if (indices.length !== totalPages) {
      throw new AppError('New page order must contain all original pages exactly once', 400, 'INVALID_REORDER_SPEC');
    }

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, indices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    const bytes = await newDoc.save();
    return Buffer.from(bytes);
  }
}

export const pageManagementProcessor = new PageManagementProcessor();
