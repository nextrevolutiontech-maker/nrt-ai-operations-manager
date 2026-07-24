import { Injectable } from '@nestjs/common';
import { SecurityAuditService, SecurityEvent } from './security-audit.service';

@Injectable()
export class AuditExportService {
  constructor(private readonly auditService: SecurityAuditService) {}

  exportAuditLogs(companyId: string, format: 'json' | 'csv' = 'json') {
    const events = this.auditService.getAuditEvents(companyId, 500);

    if (format === 'csv') {
      const headers = 'ID,Event Type,User ID,IP Address,Details,Timestamp\n';
      const rows = events
        .map(
          (e) =>
            `"${e.id}","${e.eventType}","${e.userId || 'N/A'}","${e.ipAddress || 'N/A'}","${e.details.replace(/"/g, '""')}","${e.timestamp.toISOString()}"`,
        )
        .join('\n');
      return headers + rows;
    }

    return events;
  }
}
