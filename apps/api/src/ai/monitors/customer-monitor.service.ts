import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../events/event-bus.service';
import { BusinessEventType } from '../events/event-types';

@Injectable()
export class CustomerMonitorService {
  private readonly logger = new Logger(CustomerMonitorService.name);

  constructor(private readonly eventBus: EventBusService) {}

  async scanCustomerTickets(companyId: string = 'COMP-01') {
    this.logger.log(`[CUSTOMER MONITOR] Scanning complaint tickets for company ${companyId}...`);

    await this.eventBus.publish({
      eventId: `EVT-CUST-${Date.now()}`,
      eventType: BusinessEventType.CUSTOMER_COMPLAINT_SPIKE,
      severity: 'HIGH',
      domain: 'customer',
      sourceModule: 'CustomerMonitor',
      companyId,
      payload: {
        ticketId: 'CS-9912',
        customerName: 'Global Logistics Inc',
        issue: '30% defect rate on Lot #B-4022',
        affectedValue: 18000,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
