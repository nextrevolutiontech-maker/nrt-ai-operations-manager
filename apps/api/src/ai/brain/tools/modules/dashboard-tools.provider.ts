import { Injectable } from '@nestjs/common';
import { AiToolContract } from '../contracts/ai-tool-contract.interface';

@Injectable()
export class DashboardToolsProvider {
  getTools(): AiToolContract[] {
    return [
      {
        name: 'dashboard_getLiveWidgetData',
        module: 'dashboard',
        description: 'Read live Dashboard widgets: Critical Alerts, KPIs, Exceptions, Low Stock, Supplier Delays, Financial Risks, SLA Breaches, Recommended Actions.',
        requiredPermissions: ['read:dashboards'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return {
            criticalAlerts: [
              { id: 'ALT-01', severity: 'HIGH', message: 'SKU-8092 stock below safety threshold (12 units remaining)' },
              { id: 'ALT-02', severity: 'MEDIUM', message: 'Supplier Acme Corp shipment PO-8810 delayed by 14 days' },
            ],
            kpis: {
              otif: 98.2,
              orderCycleTimeHours: 14.2,
              inventoryTurnover: 9.4,
              grossMarginPercent: 39.0,
            },
            exceptionsCount: 3,
            lowStockCount: 1,
            supplierDelaysCount: 1,
            financialRisksCount: 0,
            slaBreachesCount: 0,
            recommendedActions: [
              'Execute inter-warehouse stock transfer from WH-B (20 units)',
              'Issue split Blanket PO for raw material replenishment',
            ],
          };
        },
      },
    ];
  }
}
