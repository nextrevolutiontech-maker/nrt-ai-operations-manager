import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../events/event-bus.service';
import { BusinessEventType } from '../events/event-types';

@Injectable()
export class KpiMonitorService {
  private readonly logger = new Logger(KpiMonitorService.name);

  constructor(private readonly eventBus: EventBusService) {}

  async scanKpis(companyId: string = 'COMP-01') {
    this.logger.log(`[KPI MONITOR] Scanning operational KPIs for company ${companyId}...`);

    await this.eventBus.publish({
      eventId: `EVT-KPI-${Date.now()}`,
      eventType: BusinessEventType.EXECUTIVE_KPI_BELOW_TARGET,
      severity: 'MEDIUM',
      domain: 'executive',
      sourceModule: 'KpiMonitor',
      companyId,
      payload: {
        metric: 'OTIF',
        currentValue: 92.1,
        targetValue: 95.0,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
