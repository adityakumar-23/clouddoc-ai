import * as XLSX from 'xlsx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../../config/logger';

const execAsync = promisify(exec);

export class ExcelToPdfProcessor {
  async process(xlsxBuffer: Buffer): Promise<Buffer> {
    const libreOfficePdf = await this.tryLibreOfficeConversion(xlsxBuffer);
    if (libreOfficePdf) return libreOfficePdf;

    logger.info('Using Native JS Sheet parser for Excel to PDF');
    return this.nativeXlsxToPdf(xlsxBuffer);
  }

  private async tryLibreOfficeConversion(buffer: Buffer): Promise<Buffer | null> {
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input_${Date.now()}_${Math.random().toString(36).substring(7)}.xlsx`);
    const outputPdfName = inputPath.replace('.xlsx', '.pdf');

    try {
      await fs.promises.writeFile(inputPath, buffer);
      await execAsync(`soffice --headless --convert-to pdf "${inputPath}" --outdir "${tmpDir}"`, {
        timeout: 15000,
      });

      if (fs.existsSync(outputPdfName)) {
        const result = await fs.promises.readFile(outputPdfName);
        await fs.promises.unlink(outputPdfName).catch(() => {});
        await fs.promises.unlink(inputPath).catch(() => {});
        return result;
      }
    } catch {
      // Fallback to native
    } finally {
      if (fs.existsSync(inputPath)) {
        await fs.promises.unlink(inputPath).catch(() => {});
      }
    }
    return null;
  }

  private async nativeXlsxToPdf(xlsxBuffer: Buffer): Promise<Buffer> {
    const workbook = XLSX.read(xlsxBuffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Landscape page for spreadsheet tables
    const pageWidth = 841.89;
    const pageHeight = 595.28;
    const margin = 40;
    const rowHeight = 22;
    const maxRowsPerPage = Math.floor((pageHeight - margin * 2 - 40) / rowHeight);

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentRowOnPage = 0;

    // Draw header
    currentPage.drawText(`Sheet: ${firstSheetName}`, {
      x: margin,
      y: pageHeight - margin,
      size: 14,
      font: fontBold,
      color: rgb(0.1, 0.2, 0.4),
    });

    for (let r = 0; r < Math.min(data.length, 200); r++) {
      if (currentRowOnPage >= maxRowsPerPage) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentRowOnPage = 0;
      }

      const row = data[r] || [];
      const y = pageHeight - margin - 35 - currentRowOnPage * rowHeight;
      const isHeaderRow = r === 0;

      // Draw row background for header or alternating rows
      if (isHeaderRow) {
        currentPage.drawRectangle({
          x: margin,
          y: y - 5,
          width: pageWidth - margin * 2,
          height: rowHeight,
          color: rgb(0.9, 0.93, 0.98),
        });
      }

      const colWidth = (pageWidth - margin * 2) / Math.max(1, Math.min(row.length, 7));

      for (let c = 0; c < Math.min(row.length, 7); c++) {
        const cellValue = String(row[c] ?? '').slice(0, 22);
        currentPage.drawText(cellValue, {
          x: margin + c * colWidth + 4,
          y: y + 2,
          size: 9,
          font: isHeaderRow ? fontBold : fontRegular,
          color: isHeaderRow ? rgb(0.1, 0.2, 0.4) : rgb(0.15, 0.15, 0.15),
        });
      }

      currentRowOnPage++;
    }

    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  }
}

export const excelToPdfProcessor = new ExcelToPdfProcessor();
