import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../events/event-bus.service';
import { BusinessEventType } from '../events/event-types';

@Injectable()
export class SalesMonitorService {
  private readonly logger = new Logger(SalesMonitorService.name);

  constructor(private readonly eventBus: EventBusService) {}

  async scanSalesOrders(companyId: string = 'COMP-01') {
    this.logger.log(`[SALES MONITOR] Scanning order SLAs for company ${companyId}...`);

    await this.eventBus.publish({
      eventId: `EVT-SALES-${Date.now()}`,
      eventType: BusinessEventType.SALES_SLA_BREACH,
      severity: 'HIGH',
      domain: 'sales',
      sourceModule: 'SalesMonitor',
      companyId,
      payload: {
        orderId: 'ORD-9021',
        customerName: 'ACME Corp',
        breachDurationHours: 4,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
