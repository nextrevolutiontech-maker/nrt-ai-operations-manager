import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../events/event-bus.service';
import { BusinessEventType } from '../events/event-types';

@Injectable()
export class FinanceMonitorService {
  private readonly logger = new Logger(FinanceMonitorService.name);

  constructor(private readonly eventBus: EventBusService) {}

  async scanFinance(companyId: string = 'COMP-01') {
    this.logger.log(`[FINANCE MONITOR] Scanning cash flow and budgets for company ${companyId}...`);

    await this.eventBus.publish({
      eventId: `EVT-FIN-${Date.now()}`,
      eventType: BusinessEventType.FINANCE_BUDGET_VARIANCE,
      severity: 'HIGH',
      domain: 'finance',
      sourceModule: 'FinanceMonitor',
      companyId,
      payload: {
        poNumber: 'PO-9082',
        requestedAmount: 42000,
        monthlyBudgetRemaining: 25000,
        varianceAmount: 17000,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
