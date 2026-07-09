import { ExportProvider, ExportData } from './export-provider.interface';
import { Stream, PassThrough } from 'stream';
import PDFDocument from 'pdfkit';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfExportProvider implements ExportProvider {
  async export(data: ExportData): Promise<Stream | Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 30,
          size: 'A4',
          layout: 'landscape',
        });
        const stream = new PassThrough();

        doc.pipe(stream);

        // Title
        doc.fontSize(20).text(data.title, { align: 'center' });
        doc.moveDown(2);

        // Draw basic table
        const columnWidth = (doc.page.width - 60) / (data.columns.length || 1);
        let currentY = doc.y;

        // Headers
        doc.fontSize(10).font('Helvetica-Bold');
        data.columns.forEach((col, i) => {
          doc.text(col.header, 30 + i * columnWidth, currentY, {
            width: columnWidth,
            align: 'left',
          });
        });

        currentY += 15;
        doc
          .moveTo(30, currentY)
          .lineTo(doc.page.width - 30, currentY)
          .stroke();
        currentY += 10;

        // Rows
        doc.font('Helvetica');
        data.data.forEach((row) => {
          if (currentY > doc.page.height - 50) {
            doc.addPage();
            currentY = 30;
          }

          data.columns.forEach((col, i) => {
            const val =
              row[col.key] !== null && row[col.key] !== undefined
                ? String(row[col.key])
                : '';
            doc.text(val, 30 + i * columnWidth, currentY, {
              width: columnWidth,
              align: 'left',
            });
          });
          currentY += 15;
        });

        doc.end();
        resolve(stream);
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  getContentType(): string {
    return 'application/pdf';
  }

  getFileExtension(): string {
    return 'pdf';
  }
}
