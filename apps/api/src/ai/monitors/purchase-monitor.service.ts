import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../events/event-bus.service';
import { BusinessEventType } from '../events/event-types';

@Injectable()
export class PurchaseMonitorService {
  private readonly logger = new Logger(PurchaseMonitorService.name);

  constructor(private readonly eventBus: EventBusService) {}

  async scanPurchaseOrders(companyId: string = 'COMP-01') {
    this.logger.log(`[PURCHASE MONITOR] Scanning purchase order ETAs for company ${companyId}...`);

    await this.eventBus.publish({
      eventId: `EVT-PO-${Date.now()}`,
      eventType: BusinessEventType.PURCHASE_PO_DELAY,
      severity: 'HIGH',
      domain: 'purchase',
      sourceModule: 'PurchaseMonitor',
      companyId,
      payload: {
        poNumber: 'PO-8810',
        supplierId: 'SUP-01',
        supplierName: 'Acme Logistics',
        delayDays: 14,
        impactedValue: 45000,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
