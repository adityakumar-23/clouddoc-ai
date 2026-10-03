import { PDFDocument } from 'pdf-lib';

export interface PdfMetadataResult {
  title: string;
  author: string;
  subject: string;
  creator: string;
  producer: string;
  keywords: string[];
  pageCount: number;
  creationDate: Date | null;
  modificationDate: Date | null;
}

export class PdfSecurityProcessor {
  async getMetadata(pdfBuffer: Buffer): Promise<PdfMetadataResult> {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

    return {
      title: pdfDoc.getTitle() || '',
      author: pdfDoc.getAuthor() || '',
      subject: pdfDoc.getSubject() || '',
      creator: pdfDoc.getCreator() || '',
      producer: pdfDoc.getProducer() || '',
      keywords: pdfDoc.getKeywords() ? pdfDoc.getKeywords()!.split(';') : [],
      pageCount: pdfDoc.getPageCount(),
      creationDate: pdfDoc.getCreationDate() || null,
      modificationDate: pdfDoc.getModificationDate() || null,
    };
  }

  async updateMetadata(
    pdfBuffer: Buffer,
    metadata: Partial<PdfMetadataResult>
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

    if (metadata.title !== undefined) pdfDoc.setTitle(metadata.title);
    if (metadata.author !== undefined) pdfDoc.setAuthor(metadata.author);
    if (metadata.subject !== undefined) pdfDoc.setSubject(metadata.subject);
    if (metadata.keywords !== undefined) pdfDoc.setKeywords(metadata.keywords);

    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  }
}

export const pdfSecurityProcessor = new PdfSecurityProcessor();
