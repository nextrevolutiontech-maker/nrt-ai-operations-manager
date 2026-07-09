import { Module } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { ExcelExportProvider } from './providers/excel-export.provider';
import { CsvExportProvider } from './providers/csv-export.provider';
import { PdfExportProvider } from './providers/pdf-export.provider';

@Module({
  providers: [
    ExportsService,
    ExcelExportProvider,
    CsvExportProvider,
    PdfExportProvider,
  ],
  exports: [ExportsService],
})
export class ExportsModule {}
