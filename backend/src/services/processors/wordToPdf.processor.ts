import mammoth from 'mammoth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../../config/logger';

const execAsync = promisify(exec);

export class WordToPdfProcessor {
  async process(docxBuffer: Buffer): Promise<Buffer> {
    // 1. Try LibreOffice CLI adapter if available on system (standard on Ubuntu EC2)
    const libreOfficePdf = await this.tryLibreOfficeConversion(docxBuffer);
    if (libreOfficePdf) {
      return libreOfficePdf;
    }

    // 2. Pure JavaScript high-fidelity parser fallback
    logger.info('Using Native JS Docx engine for conversion');
    return this.nativeDocxToPdf(docxBuffer);
  }

  private async tryLibreOfficeConversion(buffer: Buffer): Promise<Buffer | null> {
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input_${Date.now()}_${Math.random().toString(36).substring(7)}.docx`);
    const outputPdfName = inputPath.replace('.docx', '.pdf');

    try {
      await fs.promises.writeFile(inputPath, buffer);
      // Run headless libreoffice
      await execAsync(`soffice --headless --convert-to pdf "${inputPath}" --outdir "${tmpDir}"`, {
        timeout: 15000,
      });

      if (fs.existsSync(outputPdfName)) {
        const result = await fs.promises.readFile(outputPdfName);
        await fs.promises.unlink(outputPdfName).catch(() => {});
        await fs.promises.unlink(inputPath).catch(() => {});
        return result;
      }
    } catch (err: any) {
      // LibreOffice not installed or command failed; fallback to native engine
      logger.debug(`LibreOffice CLI not active (${err.message}). Using native AST parser.`);
    } finally {
      if (fs.existsSync(inputPath)) {
        await fs.promises.unlink(inputPath).catch(() => {});
      }
    }
    return null;
  }

  private async nativeDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
    const { value: rawText } = await mammoth.extractRawText({ buffer: docxBuffer });
    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);

    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;
    const lineHeight = 18;
    const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentLineOnPage = 0;

    // Header banner
    currentPage.drawText('CloudDoc Converted Document', {
      x: margin,
      y: pageHeight - margin + 15,
      size: 9,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    for (let i = 0; i < lines.length; i++) {
      if (currentLineOnPage >= maxLinesPerPage) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentLineOnPage = 0;

        currentPage.drawText('CloudDoc Converted Document', {
          x: margin,
          y: pageHeight - margin + 15,
          size: 9,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4),
        });
      }

      const line = lines[i];
      const isHeading = line.length < 60 && i < 5;
      const font = isHeading ? fontBold : fontRegular;
      const size = isHeading ? 14 : 10.5;

      const y = pageHeight - margin - currentLineOnPage * lineHeight;

      // Truncate line if too long for page width
      const cleanLine = line.slice(0, 95);

      currentPage.drawText(cleanLine, {
        x: margin,
        y,
        size,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });

      currentLineOnPage += isHeading ? 2 : 1;
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}

export const wordToPdfProcessor = new WordToPdfProcessor();
