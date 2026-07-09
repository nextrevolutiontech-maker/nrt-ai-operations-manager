import { Stream } from 'stream';

export interface ReportColumn {
  key: string;
  header: string;
}

export interface ExportData {
  title: string;
  columns: ReportColumn[];
  data: any[];
}

export interface ExportProvider {
  export(data: ExportData): Promise<Stream | Buffer>;
  getContentType(): string;
  getFileExtension(): string;
}
