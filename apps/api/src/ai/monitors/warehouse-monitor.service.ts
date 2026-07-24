import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../events/event-bus.service';
import { BusinessEventType } from '../events/event-types';

@Injectable()
export class WarehouseMonitorService {
  private readonly logger = new Logger(WarehouseMonitorService.name);

  constructor(private readonly eventBus: EventBusService) {}

  async scanWarehouse(companyId: string = 'COMP-01') {
    this.logger.log(`[WAREHOUSE MONITOR] Scanning warehouse queues for company ${companyId}...`);

    await this.eventBus.publish({
      eventId: `EVT-WH-${Date.now()}`,
      eventType: BusinessEventType.WAREHOUSE_DOCK_CONGESTION,
      severity: 'HIGH',
      domain: 'warehouse',
      sourceModule: 'WarehouseMonitor',
      companyId,
      payload: {
        warehouseId: 'WH-01',
        backloggedTrailersCount: 14,
        putAwaySlaBreachedHours: 26,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
