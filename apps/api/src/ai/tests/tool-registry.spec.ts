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

describe('Tool Registry & Executor Tests', () => {
  let toolRegistry: ToolRegistryService;
  let toolExecutor: ToolExecutorService;

  beforeEach(() => {
    const mockPrisma: any = {
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

    const normalizer = new ToolResultNormalizerService();
    const policyEngine = new PolicyEngineService();
    const decisionTrace = new DecisionTraceService();
    const workflowService = new ApprovalWorkflowService();
    const approvalsService = new AiApprovalsService(mockPrisma, workflowService);

    toolExecutor = new ToolExecutorService(
      toolRegistry,
      normalizer,
      policyEngine,
      decisionTrace,
      approvalsService,
    );
  });

  it('should register and retrieve ERP tool contracts', () => {
    const tools = toolRegistry.getAllContracts();
    expect(tools.length).toBeGreaterThan(20);

    const checkStock = toolRegistry.getToolContract('inventory_getStock');
    expect(checkStock).toBeDefined();
    expect(checkStock?.module).toBe('inventory');
  });

  it('should execute registered tool safely', async () => {
    const res = await toolExecutor.executeTool('inventory_getStock', { productId: 'SKU-8092' }, {});
    expect(res.status).toBe('SUCCESS');
    expect(res.toolName).toBe('inventory_getStock');
  });

  it('should throw error when executing unregistered tool', async () => {
    await expect(toolExecutor.executeTool('unknown_tool', {}, {})).rejects.toThrow();
  });
});
