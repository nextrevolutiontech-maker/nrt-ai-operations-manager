import { Injectable, Logger } from '@nestjs/common';

export interface SecurityEvent {
  id: string;
  eventType: 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'TENANT_VIOLATION' | 'PROMPT_INJECTION' | 'ACTION_APPROVED' | 'RATE_LIMITED';
  companyId: string;
  userId?: string;
  ipAddress?: string;
  details: string;
  timestamp: Date;
}

@Injectable()
export class SecurityAuditService {
  private readonly logger = new Logger(SecurityAuditService.name);
  private auditEvents: SecurityEvent[] = [];

  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>) {
    const fullEvent: SecurityEvent = {
      ...event,
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date(),
    };

    this.auditEvents.push(fullEvent);
    this.logger.log(`SECURITY AUDIT [${fullEvent.eventType}]: Company ${fullEvent.companyId} - ${fullEvent.details}`);
    return fullEvent;
  }

  getAuditEvents(companyId: string, limit = 50): SecurityEvent[] {
    return this.auditEvents
      .filter((e) => e.companyId === companyId)
      .slice(-limit)
      .reverse();
  }
}
