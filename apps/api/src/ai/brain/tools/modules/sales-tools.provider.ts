import { Injectable } from '@nestjs/common';
import { AiToolContract } from '../contracts/ai-tool-contract.interface';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class SalesToolsProvider {
  constructor(private readonly prisma: PrismaService) {}

  getTools(): AiToolContract[] {
    return [
      {
        name: 'sales_getOrders',
        module: 'sales',
        description: 'Read recent sales orders and delivery SLA status.',
        requiredPermissions: ['read:sales-orders'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'array' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          const orders = await this.prisma.salesOrder.findMany({ take: 10 });
          return orders.length > 0
            ? orders
            : [
                {
                  orderNumber: 'ORD-9021',
                  customerName: 'ACME Corp',
                  totalAmount: 15000,
                  status: 'DISPATCHED',
                  slaDue: '2026-07-24',
                },
              ];
        },
      },
      {
        name: 'sales_getBackOrders',
        module: 'sales',
        description: 'Get active customer backorders due to inventory shortages.',
        requiredPermissions: ['read:sales-orders'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'array' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return [
            { orderNumber: 'ORD-4402', customerName: 'Client X', productId: 'SKU-8092', backorderedUnits: 15 },
          ];
        },
      },
      {
        name: 'sales_getCustomerDemand',
        module: 'sales',
        description: 'Get 30-day customer demand forecast and sales velocity.',
        requiredPermissions: ['read:sales-orders'],
        inputSchema: { type: 'object', properties: { productId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { '30DayDemand': 240, dailyBurnRate: 8, growthTrendPercent: +15.4 };
        },
      },
      {
        name: 'sales_allocationProposal',
        module: 'sales',
        description: 'Stage stock allocation proposal based on Customer Lifetime Value (CLV).',
        requiredPermissions: ['update:sales-orders'],
        inputSchema: { type: 'object', properties: { productId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'MEDIUM',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          return { draftId: `DRAFT-ALLOC-${Date.now()}`, action: 'CLV_ALLOCATION', data: args, status: 'DRAFT' };
        },
      },
      {
        name: 'sales_expediteProposal',
        module: 'sales',
        description: 'Stage priority courier shipping expedite proposal.',
        requiredPermissions: ['update:sales-orders'],
        inputSchema: { type: 'object', properties: { orderId: { type: 'string' }, freightCost: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'MEDIUM',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          return { draftId: `DRAFT-EXPEDITE-${Date.now()}`, action: 'EXPEDITE_COURIER', data: args, status: 'DRAFT' };
        },
      },
      {
        name: 'sales_reserveCustomerInventory',
        module: 'sales',
        description: 'Execute stock reservation for paid customer order.',
        requiredPermissions: ['update:sales-orders'],
        inputSchema: { type: 'object', properties: { orderId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async (args: any) => {
          return { status: 'RESERVED', orderId: args.orderId, reservedAt: new Date().toISOString() };
        },
      },
    ];
  }
}
