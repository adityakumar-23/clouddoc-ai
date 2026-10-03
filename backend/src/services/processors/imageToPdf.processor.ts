import { PDFDocument } from 'pdf-lib';
import { AppError } from '../../middleware/error.middleware';

export class ImageToPdfProcessor {
  async process(imageFiles: Array<{ buffer: Buffer; mimeType: string }>): Promise<Buffer> {
    if (!imageFiles || imageFiles.length === 0) {
      throw new AppError('At least one image is required to generate a PDF', 400, 'NO_IMAGES_PROVIDED');
    }

    const pdfDoc = await PDFDocument.create();

    for (const img of imageFiles) {
      let embeddedImage;
      if (img.mimeType === 'image/jpeg' || img.mimeType === 'image/jpg') {
        embeddedImage = await pdfDoc.embedJpg(img.buffer);
      } else if (img.mimeType === 'image/png') {
        embeddedImage = await pdfDoc.embedPng(img.buffer);
      } else {
        // Fallback or attempt PNG embed
        try {
          embeddedImage = await pdfDoc.embedPng(img.buffer);
        } catch {
          embeddedImage = await pdfDoc.embedJpg(img.buffer);
        }
      }

      const { width, height } = embeddedImage.scale(1);

      // Create page matching image proportions (standard max bounds A4 595.28 x 841.89)
      const maxWidth = 595.28;
      const maxHeight = 841.89;

      const scaleFactor = Math.min(maxWidth / width, maxHeight / height, 1);
      const scaledWidth = width * scaleFactor;
      const scaledHeight = height * scaleFactor;

      const page = pdfDoc.addPage([maxWidth, maxHeight]);
      const x = (maxWidth - scaledWidth) / 2;
      const y = (maxHeight - scaledHeight) / 2;

      page.drawImage(embeddedImage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}

export const imageToPdfProcessor = new ImageToPdfProcessor();
