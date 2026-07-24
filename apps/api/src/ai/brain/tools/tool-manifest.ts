import { ToolSchema } from './tool-schema.interface';

export const ERP_TOOL_MANIFEST: ToolSchema[] = [
  {
    name: 'inventories_checkStock',
    module: 'inventory',
    description: 'Get real-time stock balance, reserved stock, and safety stock levels for a product.',
    inputSchema: { type: 'object', properties: { productId: { type: 'string' } } },
    requiresApproval: false,
  },
  {
    name: 'purchase_createPO',
    module: 'purchase',
    description: 'Create a new Purchase Order for supplier raw materials or finished goods.',
    inputSchema: {
      type: 'object',
      properties: {
        supplierId: { type: 'string' },
        items: { type: 'array' },
        totalAmount: { type: 'number' },
      },
    },
    requiresApproval: true,
    minRoleRequired: 'OPERATIONS_MANAGER',
  },
  {
    name: 'sales_getOrders',
    module: 'sales',
    description: 'Fetch recent sales orders and fulfillment status.',
    inputSchema: { type: 'object', properties: { status: { type: 'string' } } },
    requiresApproval: false,
  },
  {
    name: 'finance_getCashFlow',
    module: 'finance',
    description: 'Fetch working capital and cash flow budget allowances.',
    inputSchema: { type: 'object', properties: { period: { type: 'string' } } },
    requiresApproval: false,
  },
  {
    name: 'warehouse_transferStock',
    module: 'warehouse',
    description: 'Draft inter-warehouse stock transfer between locations.',
    inputSchema: {
      type: 'object',
      properties: {
        fromWarehouseId: { type: 'string' },
        toWarehouseId: { type: 'string' },
        items: { type: 'array' },
      },
    },
    requiresApproval: true,
  },
];
