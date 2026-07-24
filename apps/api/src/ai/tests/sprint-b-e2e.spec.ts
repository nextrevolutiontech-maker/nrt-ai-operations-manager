import { ToolRegistryService } from '../brain/tools/tool-registry.service';
import { ToolExecutorService } from '../brain/tools/tool-executor.service';
import { ToolResultNormalizerService } from '../brain/tools/tool-result-normalizer.service';
import { PolicyEngineService } from '../brain/governance/policy-engine.service';
import { DecisionTraceService } from '../brain/execution/decision-trace.service';
import { AiApprovalsService } from '../approvals/ai-approvals.service';
import { ApprovalWorkflowService } from '../approvals/approval-workflow.service';

import { ProductsToolsProvider } from '../brain/tools/modules/products-tools.provider';
import { InventoryToolsProvider } from '../brain/tools/modules/inventory-tools.provider';
import { WarehouseToolsProvider } from '../brain/tools/modules/warehouse-tools.provider';
import { PurchaseToolsProvider } from '../brain/tools/modules/purchase-tools.provider';
import { SalesToolsProvider } from '../brain/tools/modules/sales-tools.provider';
import { CustomersToolsProvider } from '../brain/tools/modules/customers-tools.provider';
import { SuppliersToolsProvider } from '../brain/tools/modules/suppliers-tools.provider';
import { FinanceToolsProvider } from '../brain/tools/modules/finance-tools.provider';
import { ReportsToolsProvider } from '../brain/tools/modules/reports-tools.provider';
import { DashboardToolsProvider } from '../brain/tools/modules/dashboard-tools.provider';
import { SiernaFormatterService } from '../brain/persona/sierna-formatter.service';

describe('Sprint B — 15 E2E Integration Scenarios', () => {
  let toolRegistry: ToolRegistryService;
  let toolExecutor: ToolExecutorService;
  let approvalsService: AiApprovalsService;
  let workflowService: ApprovalWorkflowService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      product: { findFirst: jest.fn().mockResolvedValue(null), findMany: jest.fn().mockResolvedValue([]) },
      inventory: { findFirst: jest.fn().mockResolvedValue(null) },
      purchaseOrder: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { findMany: jest.fn().mockResolvedValue([]) },
      customer: { findFirst: jest.fn().mockResolvedValue(null) },
      companySettings: { findFirst: jest.fn().mockResolvedValue(null) },
      aiApproval: { create: jest.fn().mockResolvedValue({}) },
    };

    const siernaFormatter = new SiernaFormatterService();
    const productsTools = new ProductsToolsProvider(mockPrisma);
    const inventoryTools = new InventoryToolsProvider(mockPrisma);
    const warehouseTools = new WarehouseToolsProvider(mockPrisma);
    const purchaseTools = new PurchaseToolsProvider(mockPrisma);
    const salesTools = new SalesToolsProvider(mockPrisma);
    const customersTools = new CustomersToolsProvider(mockPrisma);
    const suppliersTools = new SuppliersToolsProvider(mockPrisma);
    const financeTools = new FinanceToolsProvider(mockPrisma);
    const reportsTools = new ReportsToolsProvider(siernaFormatter);
    const dashboardTools = new DashboardToolsProvider();

    toolRegistry = new ToolRegistryService(
      productsTools,
      inventoryTools,
      warehouseTools,
      purchaseTools,
      salesTools,
      customersTools,
      suppliersTools,
      financeTools,
      reportsTools,
      dashboardTools,
    );

    workflowService = new ApprovalWorkflowService();
    approvalsService = new AiApprovalsService(mockPrisma, workflowService);
    const normalizer = new ToolResultNormalizerService();
    const policyEngine = new PolicyEngineService();
    const decisionTrace = new DecisionTraceService();

    toolExecutor = new ToolExecutorService(
      toolRegistry,
      normalizer,
      policyEngine,
      decisionTrace,
      approvalsService,
    );
  });

  it('1. Inventory shortage resolution tool execution', async () => {
    const stock = await toolExecutor.executeTool('inventory_getLowStock', {}, {});
    expect(stock.status).toBe('SUCCESS');
    expect(stock.result[0].productId).toBe('SKU-8092');
  });

  it('2. Supplier delay mitigation tool execution', async () => {
    const delay = await toolExecutor.executeTool('suppliers_supplierLeadTimes', { supplierId: 'SUP-01' }, {});
    expect(delay.status).toBe('SUCCESS');
    expect(delay.result.driftDays).toBe(3);
  });

  it('3. Multi-warehouse stock transfer staging', async () => {
    const transfer = await toolExecutor.executeTool(
      'inventory_createStockTransferDraft',
      { fromWarehouseId: 'WH-02', toWarehouseId: 'WH-01', quantity: 20 },
      {},
    );
    expect(transfer.status).toBe('STAGED_FOR_APPROVAL');
    expect(transfer.approvalId).toBeDefined();

    const pending = await approvalsService.getPendingApprovals();
    expect(pending.length).toBe(1);
  });

  it('4. Purchase approval workflow lifecycle', async () => {
    const poDraft = await toolExecutor.executeTool(
      'purchase_createPODraft',
      { supplierId: 'SUP-01', totalAmount: 42000 },
      {},
    );
    expect(poDraft.status).toBe('STAGED_FOR_APPROVAL');

    const app = await approvalsService.approve(poDraft.approvalId, 'MANAGER-01');
    expect(app.status).toBe('APPROVED');
    expect(app.approvedBy).toBe('MANAGER-01');

    const executed = await approvalsService.markExecuted(poDraft.approvalId, 'SYSTEM');
    expect(executed.status).toBe('EXECUTED');
  });

  it('5. Customer complaint handling & goodwill credit staging', async () => {
    const credit = await toolExecutor.executeTool(
      'customers_goodwillCreditDraft',
      { customerId: 'CUST-01', amount: 50 },
      {},
    );
    expect(credit.status).toBe('STAGED_FOR_APPROVAL');
  });

  it('6. Budget variance proposal tool execution', async () => {
    const prop = await toolExecutor.executeTool('finance_budgetVarianceProposal', { requestedAmount: 15000 }, {});
    expect(prop.status).toBe('STAGED_FOR_APPROVAL');
  });

  it('7. Warehouse congestion labor reallocation staging', async () => {
    const labor = await toolExecutor.executeTool(
      'warehouse_laborReallocationDraft',
      { fromDepartment: 'Packing', toDepartment: 'Receiving' },
      {},
    );
    expect(labor.status).toBe('STAGED_FOR_APPROVAL');
  });

  it('8. Emergency incident response - dock utilization check', async () => {
    const dock = await toolExecutor.executeTool('warehouse_getDockUtilization', {}, {});
    expect(dock.status).toBe('SUCCESS');
    expect(dock.result.congestedDocks).toBe(2);
  });

  it('9. Executive daily briefing report generation', async () => {
    const report = await toolExecutor.executeTool('reports_generateExecutiveBriefing', {}, {});
    expect(report.status).toBe('SUCCESS');
    expect(report.result.content).toContain('Operational Briefing');
  });

  it('10. Dashboard live widgets data harvesting', async () => {
    const dash = await toolExecutor.executeTool('dashboard_getLiveWidgetData', {}, {});
    expect(dash.status).toBe('SUCCESS');
    expect(dash.result.criticalAlerts.length).toBe(2);
  });

  it('11. Order-to-Cash (O2C) stock reservation', async () => {
    const res = await toolExecutor.executeTool('sales_reserveCustomerInventory', { orderId: 'ORD-9021' }, {});
    expect(res.status).toBe('SUCCESS');
    expect(res.result.fulfillmentStatus).toBe('RESERVED');
  });

  it('12. Procure-to-Pay (P2P) open PO tracking', async () => {
    const pos = await toolExecutor.executeTool('purchase_getOpenPOs', {}, {});
    expect(pos.status).toBe('SUCCESS');
    expect(pos.result[0].poNumber).toBe('PO-8810');
  });

  it('13. Cash flow analysis tool execution', async () => {
    const cash = await toolExecutor.executeTool('finance_cashFlow', {}, {});
    expect(cash.status).toBe('SUCCESS');
    expect(cash.result.cashBalance).toBe(150000);
  });

  it('14. Slow-moving inventory optimization query', async () => {
    const slob = await toolExecutor.executeTool('products_getSlowMovingProducts', {}, {});
    expect(slob.status).toBe('SUCCESS');
    expect(slob.result[0].sku).toBe('SKU-3011');
  });

  it('15. Policy Engine Hard Block Enforcement', async () => {
    await expect(toolExecutor.executeTool('products_deleteProduct', { productId: 'SKU-001' }, {})).rejects.toThrow(
      'Hard AI Block',
    );
    await expect(toolExecutor.executeTool('finance_approvePayments', { amount: 50000 }, {})).rejects.toThrow(
      'Hard AI Block',
    );
  });

  it('Idempotency Key Protection Test', async () => {
    const opt = { idempotencyKey: 'IDEMP-KEY-999' };
    const res1 = await toolExecutor.executeTool(
      'inventory_createStockTransferDraft',
      { fromWarehouseId: 'WH-01', toWarehouseId: 'WH-02', quantity: 10 },
      {},
      opt,
    );
    const res2 = await toolExecutor.executeTool(
      'inventory_createStockTransferDraft',
      { fromWarehouseId: 'WH-01', toWarehouseId: 'WH-02', quantity: 10 },
      {},
      opt,
    );

    expect(res1.approvalId).toBe(res2.approvalId);
  });
});
