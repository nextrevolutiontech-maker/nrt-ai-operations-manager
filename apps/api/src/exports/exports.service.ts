import { Injectable, BadRequestException } from '@nestjs/common';
import {
  ExportProvider,
  ExportData,
} from './providers/export-provider.interface';
import { ExcelExportProvider } from './providers/excel-export.provider';
import { CsvExportProvider } from './providers/csv-export.provider';
import { PdfExportProvider } from './providers/pdf-export.provider';

@Injectable()
export class ExportsService {
  private providers: Map<string, ExportProvider>;

  constructor(
    private readonly excelProvider: ExcelExportProvider,
    private readonly csvProvider: CsvExportProvider,
    private readonly pdfProvider: PdfExportProvider,
  ) {
    this.providers = new Map<string, ExportProvider>();
    this.providers.set('excel', this.excelProvider);
    this.providers.set('xlsx', this.excelProvider);
    this.providers.set('csv', this.csvProvider);
    this.providers.set('pdf', this.pdfProvider);
  }

  async exportData(format: string, data: ExportData) {
    const provider = this.providers.get(format.toLowerCase());
    if (!provider) {
      throw new BadRequestException(
        `Export format '${format}' is not supported.`,
      );
    }

    const streamOrBuffer = await provider.export(data);

    return {
      content: streamOrBuffer,
      contentType: provider.getContentType(),
      extension: provider.getFileExtension(),
    };
  }
}
