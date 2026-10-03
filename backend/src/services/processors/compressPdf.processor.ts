import { PDFDocument } from 'pdf-lib';

export class CompressPdfProcessor {
  async process(pdfBuffer: Buffer, compressionLevel: 'low' | 'medium' | 'high' = 'medium'): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

    // Use PDF-lib's object stream compression and unreferenced dictionary stripping
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });

    return Buffer.from(compressedBytes);
  }
}

export const compressPdfProcessor = new CompressPdfProcessor();
