import { ExportProvider, ExportData } from './export-provider.interface';
import { Stream } from 'stream';
import * as ExcelJS from 'exceljs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CsvExportProvider implements ExportProvider {
  async export(data: ExportData): Promise<Stream | Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    worksheet.columns = data.columns.map((col) => ({
      header: col.header,
      key: col.key,
    }));

    worksheet.addRows(data.data);

    const buffer = await workbook.csv.writeBuffer();
    return Buffer.from(buffer);
  }

  getContentType(): string {
    return 'text/csv';
  }

  getFileExtension(): string {
    return 'csv';
  }
}
