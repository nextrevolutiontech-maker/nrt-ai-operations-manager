import { ExportProvider, ExportData } from './export-provider.interface';
import { Stream } from 'stream';
import * as ExcelJS from 'exceljs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExcelExportProvider implements ExportProvider {
  async export(data: ExportData): Promise<Stream | Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(data.title.substring(0, 31));

    worksheet.columns = data.columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: 20,
    }));

    // Add styling to header
    worksheet.getRow(1).font = { bold: true };

    worksheet.addRows(data.data);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  getContentType(): string {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }

  getFileExtension(): string {
    return 'xlsx';
  }
}
