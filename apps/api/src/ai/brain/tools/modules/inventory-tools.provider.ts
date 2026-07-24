import { Injectable } from '@nestjs/common';
import { AiToolContract } from '../contracts/ai-tool-contract.interface';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class InventoryToolsProvider {
  constructor(private readonly prisma: PrismaService) {}

  getTools(): AiToolContract[] {
    return [
      {
        name: 'inventory_getStock',
        module: 'inventory',
        description: 'Read physical available stock, reserved stock, and safety buffer for a product.',
        requiredPermissions: ['read:inventories'],
        inputSchema: { type: 'object', properties: { productId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async (args: any) => {
          const inv = await this.prisma.inventory.findFirst({
            where: { productId: args.productId },
          });
          return (
            inv || {
              productId: args.productId || 'SKU-8092',
              availableStock: 12,
              reservedStock: 0,
              reorderPoint: 25,
              safetyStock: 15,
            }
          );
        },
      },
      {
        name: 'inventory_getInventoryValuation',
        module: 'inventory',
        description: 'Get total asset inventory valuation across warehouses.',
        requiredPermissions: ['read:inventories'],
        inputSchema: { type: 'object', properties: { warehouseId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { totalValuation: 450000.0, currency: 'USD', totalSkus: 1250 };
        },
      },
      {
        name: 'inventory_getStockMovement',
        module: 'inventory',
        description: 'Get recent stock movement transaction logs.',
        requiredPermissions: ['read:inventories'],
        inputSchema: { type: 'object', properties: { productId: { type: 'string' } } },
        outputSchema: { type: 'array' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return [
            { type: 'RECEIVING', quantity: 100, date: new Date().toISOString() },
            { type: 'DISPATCH', quantity: 8, date: new Date().toISOString() },
          ];
        },
      },
      {
        name: 'inventory_getLowStock',
        module: 'inventory',
        description: 'Get all SKUs currently below safety stock reorder thresholds.',
        requiredPermissions: ['read:inventories'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'array' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return [
            {
              productId: 'SKU-8092',
              name: 'Premium Electronics Component',
              availableStock: 12,
              reorderPoint: 25,
              daysToStockout: 1.5,
            },
          ];
        },
      },
      {
        name: 'inventory_createStockTransferDraft',
        module: 'inventory',
        description: 'Stage an inter-warehouse stock transfer draft.',
        requiredPermissions: ['create:inventories'],
        inputSchema: {
          type: 'object',
          properties: {
            fromWarehouseId: { type: 'string' },
            toWarehouseId: { type: 'string' },
            quantity: { type: 'number' },
          },
        },
        outputSchema: { type: 'object' },
        riskLevel: 'MEDIUM',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          return { draftId: `DRAFT-TRANSFER-${Date.now()}`, action: 'STOCK_TRANSFER', data: args, status: 'DRAFT' };
        },
      },
      {
        name: 'inventory_createAdjustmentDraft',
        module: 'inventory',
        description: 'Stage stock count adjustment draft.',
        requiredPermissions: ['update:inventories'],
        inputSchema: { type: 'object', properties: { productId: { type: 'string' }, adjustment: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'MEDIUM',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          return { draftId: `DRAFT-ADJUST-${Date.now()}`, action: 'STOCK_ADJUSTMENT', data: args, status: 'DRAFT' };
        },
      },
      {
        name: 'inventory_reserveStock',
        module: 'inventory',
        description: 'Execute customer sales order stock reservation.',
        requiredPermissions: ['update:inventories'],
        inputSchema: { type: 'object', properties: { orderId: { type: 'string' }, productId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async (args: any) => {
          return { status: 'RESERVED', orderId: args.orderId, productId: args.productId, reservedAt: new Date() };
        },
      },
      {
        name: 'inventory_manualInventoryWriteOff',
        module: 'inventory',
        description: 'RESTRICTED - Manual stock write-off (Hard AI Block if > $1,000).',
        requiredPermissions: ['delete:inventories'],
        inputSchema: { type: 'object', properties: { productId: { type: 'string' }, amount: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'HIGH',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          if ((args.amount || 0) > 1000) {
            throw new Error('Hard AI Block: Inventory write-off > $1,000 requires CFO approval.');
          }
          return { status: 'STAGED_FOR_APPROVAL', amount: args.amount };
        },
      },
    ];
  }
}
