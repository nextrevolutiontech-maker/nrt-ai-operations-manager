import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../events/event-bus.service';
import { BusinessEventType } from '../events/event-types';

@Injectable()
export class InventoryMonitorService {
  private readonly logger = new Logger(InventoryMonitorService.name);

  constructor(private readonly eventBus: EventBusService) {}

  async scanInventory(companyId: string = 'COMP-01') {
    this.logger.log(`[INVENTORY MONITOR] Scanning stock levels for company ${companyId}...`);

    // Simulated scan finding low stock on SKU-8092
    await this.eventBus.publish({
      eventId: `EVT-INV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventType: BusinessEventType.INVENTORY_LOW_STOCK,
      severity: 'HIGH',
      domain: 'inventory',
      sourceModule: 'InventoryMonitor',
      companyId,
      payload: {
        sku: 'SKU-8092',
        productName: 'Premium Electronics Component',
        availableStock: 12,
        reorderPoint: 25,
        dailyBurnRate: 8,
        daysToStockout: 1.5,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
