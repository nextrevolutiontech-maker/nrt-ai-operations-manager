import { Injectable } from '@nestjs/common';
import { AiToolContract } from './contracts/ai-tool-contract.interface';

import { ProductsToolsProvider } from './modules/products-tools.provider';
import { InventoryToolsProvider } from './modules/inventory-tools.provider';
import { WarehouseToolsProvider } from './modules/warehouse-tools.provider';
import { PurchaseToolsProvider } from './modules/purchase-tools.provider';
import { SalesToolsProvider } from './modules/sales-tools.provider';
import { CustomersToolsProvider } from './modules/customers-tools.provider';
import { SuppliersToolsProvider } from './modules/suppliers-tools.provider';
import { FinanceToolsProvider } from './modules/finance-tools.provider';
import { ReportsToolsProvider } from './modules/reports-tools.provider';
import { DashboardToolsProvider } from './modules/dashboard-tools.provider';

@Injectable()
export class ToolRegistryService {
  private readonly toolContracts: Map<string, AiToolContract> = new Map();

  constructor(
    private readonly productsTools: ProductsToolsProvider,
    private readonly inventoryTools: InventoryToolsProvider,
    private readonly warehouseTools: WarehouseToolsProvider,
    private readonly purchaseTools: PurchaseToolsProvider,
    private readonly salesTools: SalesToolsProvider,
    private readonly customersTools: CustomersToolsProvider,
    private readonly suppliersTools: SuppliersToolsProvider,
    private readonly financeTools: FinanceToolsProvider,
    private readonly reportsTools: ReportsToolsProvider,
    private readonly dashboardTools: DashboardToolsProvider,
  ) {
    this.registerAllModuleTools();
  }

  private registerAllModuleTools() {
    const allContracts: AiToolContract[] = [
      ...this.productsTools.getTools(),
      ...this.inventoryTools.getTools(),
      ...this.warehouseTools.getTools(),
      ...this.purchaseTools.getTools(),
      ...this.salesTools.getTools(),
      ...this.customersTools.getTools(),
      ...this.suppliersTools.getTools(),
      ...this.financeTools.getTools(),
      ...this.reportsTools.getTools(),
      ...this.dashboardTools.getTools(),
    ];

    allContracts.forEach((contract) => {
      this.toolContracts.set(contract.name, contract);
    });
  }

  getToolContract(name: string): AiToolContract | undefined {
    return this.toolContracts.get(name);
  }

  getAllContracts(): AiToolContract[] {
    return Array.from(this.toolContracts.values());
  }

  getToolDefinitionsForAi() {
    return this.getAllContracts().map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
  }
}
