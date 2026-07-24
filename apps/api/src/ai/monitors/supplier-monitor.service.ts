import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../events/event-bus.service';
import { BusinessEventType } from '../events/event-types';

@Injectable()
export class SupplierMonitorService {
  private readonly logger = new Logger(SupplierMonitorService.name);

  constructor(private readonly eventBus: EventBusService) {}

  async scanSuppliers(companyId: string = 'COMP-01') {
    this.logger.log(`[SUPPLIER MONITOR] Scanning vendor scorecards for company ${companyId}...`);

    await this.eventBus.publish({
      eventId: `EVT-SUPP-${Date.now()}`,
      eventType: BusinessEventType.SUPPLIER_OTIF_DROP,
      severity: 'MEDIUM',
      domain: 'supplier',
      sourceModule: 'SupplierMonitor',
      companyId,
      payload: {
        supplierId: 'SUP-01',
        supplierName: 'Acme Logistics',
        currentOtif: 84.5,
        targetOtif: 95.0,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
