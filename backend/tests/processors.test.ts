import { PDFDocument } from 'pdf-lib';
import { mergePdfProcessor } from '../src/services/processors/mergePdf.processor';
import { rotatePdfProcessor } from '../src/services/processors/rotatePdf.processor';
import { splitPdfProcessor } from '../src/services/processors/splitPdf.processor';
import { compressPdfProcessor } from '../src/services/processors/compressPdf.processor';

describe('Document Processors Unit Tests', () => {
  let samplePdf1: Buffer;
  let samplePdf2: Buffer;

  beforeAll(async () => {
    // Generate valid sample PDF 1 (2 pages)
    const doc1 = await PDFDocument.create();
    doc1.addPage([400, 400]);
    doc1.addPage([400, 400]);
    const bytes1 = await doc1.save();
    samplePdf1 = Buffer.from(bytes1);

    // Generate valid sample PDF 2 (1 page)
    const doc2 = await PDFDocument.create();
    doc2.addPage([400, 400]);
    const bytes2 = await doc2.save();
    samplePdf2 = Buffer.from(bytes2);
  });

  it('MergePdfProcessor should merge two PDFs into a single 3-page document', async () => {
    const mergedBuffer = await mergePdfProcessor.process([samplePdf1, samplePdf2]);
    const mergedDoc = await PDFDocument.load(mergedBuffer);
    expect(mergedDoc.getPageCount()).toBe(3);
  });

  it('RotatePdfProcessor should rotate pages by 90 degrees', async () => {
    const rotatedBuffer = await rotatePdfProcessor.process(samplePdf1, 90);
    const rotatedDoc = await PDFDocument.load(rotatedBuffer);
    const page0Rotation = rotatedDoc.getPage(0).getRotation().angle;
    expect(page0Rotation).toBe(90);
  });

  it('SplitPdfProcessor should extract page 1 from a multi-page PDF', async () => {
    const splitBuffer = await splitPdfProcessor.process(samplePdf1, '1');
    const splitDoc = await PDFDocument.load(splitBuffer);
    expect(splitDoc.getPageCount()).toBe(1);
  });

  it('CompressPdfProcessor should return a valid compressed PDF buffer', async () => {
    const compressedBuffer = await compressPdfProcessor.process(samplePdf1, 'medium');
    expect(compressedBuffer).toBeInstanceOf(Buffer);
    const parsed = await PDFDocument.load(compressedBuffer);
    expect(parsed.getPageCount()).toBe(2);
  });
});
