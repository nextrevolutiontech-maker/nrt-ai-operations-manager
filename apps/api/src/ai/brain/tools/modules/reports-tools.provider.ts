import { Injectable } from '@nestjs/common';
import { AiToolContract } from '../contracts/ai-tool-contract.interface';
import { SiernaFormatterService } from '../../persona/sierna-formatter.service';

@Injectable()
export class ReportsToolsProvider {
  constructor(private readonly siernaFormatter: SiernaFormatterService) {}

  getTools(): AiToolContract[] {
    return [
      {
        name: 'reports_generateExecutiveBriefing',
        module: 'reports',
        description: 'Generate SIERNA Executive Briefing Report for C-Suite.',
        requiredPermissions: ['read:reports'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          const content = this.siernaFormatter.format({
            situation: 'Weekly Executive Briefing across Enterprise Operations.',
            impact: 'OTIF delivery score at 98.2%; Gross Margin maintained at 39.0%.',
            evidence: 'Active Orders: 1,240; Inbound Freight: 450 pallets; Open Stockouts: 1 (SKU-8092).',
            recommendation: 'Approve inter-warehouse stock transfer from WH-B to cover SKU-8092 backorder.',
            nextActions: ['Dispatch WH-B transfer', 'Monitor Dock 3 receiving'],
          });
          return { reportType: 'EXECUTIVE_BRIEFING', content };
        },
      },
      {
        name: 'reports_generateDailyOperationsReport',
        module: 'reports',
        description: 'Generate End-of-Day (EOD) Operations Report.',
        requiredPermissions: ['read:reports'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { reportType: 'DAILY_OPERATIONS', dispatchedOrders: 1240, target: 1250, achievementPercent: 99.2 };
        },
      },
      {
        name: 'reports_generateWeeklyKpiReport',
        module: 'reports',
        description: 'Generate Weekly KPI Scorecard Report.',
        requiredPermissions: ['read:reports'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { reportType: 'WEEKLY_KPI', otif: 98.2, octHours: 14.2, inventoryTurnover: 9.4, scrapPercent: 0.4 };
        },
      },
      {
        name: 'reports_generateMonthlyBusinessReview',
        module: 'reports',
        description: 'Generate Monthly Business Review (MBR) Report.',
        requiredPermissions: ['read:reports'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { reportType: 'MBR', revenue: 320000, margin: 125000, opexVariance: -1.2 };
        },
      },
      {
        name: 'reports_generateSupplierScorecard',
        module: 'reports',
        description: 'Generate Supplier Performance & OTIF Scorecard.',
        requiredPermissions: ['read:reports', 'read:suppliers'],
        inputSchema: { type: 'object', properties: { supplierId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { reportType: 'SUPPLIER_SCORECARD', otifPercent: 94.2, leadTimeDriftDays: 3 };
        },
      },
      {
        name: 'reports_generateInventoryHealthReport',
        module: 'reports',
        description: 'Generate Inventory Valuation & SLOB Health Report.',
        requiredPermissions: ['read:reports', 'read:inventories'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { reportType: 'INVENTORY_HEALTH', totalValuation: 450000, slobValuation: 28000 };
        },
      },
      {
        name: 'reports_generateCashFlowSummary',
        module: 'reports',
        description: 'Generate Financial Cash Flow & Budget Summary.',
        requiredPermissions: ['read:reports', 'read:ledger'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { reportType: 'CASH_FLOW_SUMMARY', cashReserves: 150000, arOverdue: 12000, apDue: 28000 };
        },
      },
      {
        name: 'reports_generateWarehousePerformanceReport',
        module: 'reports',
        description: 'Generate Warehouse SLA & Dock Turnaround Report.',
        requiredPermissions: ['read:reports', 'read:warehouses'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { reportType: 'WAREHOUSE_PERFORMANCE', putAwaySlaPercent: 96.5, avgDockTurnaroundMin: 45 };
        },
      },
    ];
  }
}
