import { PDFDocument, degrees } from 'pdf-lib';
import { AppError } from '../../middleware/error.middleware';

export class RotatePdfProcessor {
  async process(
    pdfBuffer: Buffer,
    angle: number = 90,
    pageIndices?: number[]
  ): Promise<Buffer> {
    if (![90, 180, 270, 360, -90, -180, -270].includes(angle)) {
      throw new AppError('Rotation angle must be a multiple of 90 degrees', 400, 'INVALID_ANGLE');
    }

    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();

    pages.forEach((page, index) => {
      if (!pageIndices || pageIndices.includes(index)) {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + angle + 360) % 360));
      }
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}

export const rotatePdfProcessor = new RotatePdfProcessor();
