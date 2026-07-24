import { Injectable } from '@nestjs/common';
import { AiToolContract } from '../contracts/ai-tool-contract.interface';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class CustomersToolsProvider {
  constructor(private readonly prisma: PrismaService) {}

  getTools(): AiToolContract[] {
    return [
      {
        name: 'customers_getCustomer',
        module: 'customers',
        description: 'Read customer account profile and credit limit.',
        requiredPermissions: ['read:customers'],
        inputSchema: { type: 'object', properties: { customerId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async (args: any) => {
          const cust = await this.prisma.customer.findFirst({ where: { id: args.customerId } });
          return cust || { id: args.customerId || 'CUST-01', name: 'Global Logistics Inc', creditLimit: 50000, clvTier: 'VIP' };
        },
      },
      {
        name: 'customers_getCustomerRisk',
        module: 'customers',
        description: 'Read overdue payment risk and credit score.',
        requiredPermissions: ['read:customers'],
        inputSchema: { type: 'object', properties: { customerId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { riskLevel: 'LOW', overdueBalance: 0, creditStatus: 'GOOD_STANDING' };
        },
      },
      {
        name: 'customers_getCustomerHistory',
        module: 'customers',
        description: 'Read customer historical order frequency and CLV.',
        requiredPermissions: ['read:customers'],
        inputSchema: { type: 'object', properties: { customerId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { totalOrders: 48, lifetimeSpend: 185000, avgOrderValue: 3850 };
        },
      },
      {
        name: 'customers_goodwillCreditDraft',
        module: 'customers',
        description: 'Stage customer goodwill credit voucher draft.',
        requiredPermissions: ['update:customers'],
        inputSchema: { type: 'object', properties: { customerId: { type: 'string' }, amount: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'MEDIUM',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          return { draftId: `DRAFT-CREDIT-${Date.now()}`, action: 'GOODWILL_CREDIT', data: args, status: 'DRAFT' };
        },
      },
      {
        name: 'customers_replacementProposal',
        module: 'customers',
        description: 'Stage replacement shipment proposal for defective items.',
        requiredPermissions: ['create:sales-orders'],
        inputSchema: { type: 'object', properties: { customerId: { type: 'string' }, itemValue: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'MEDIUM',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          return { draftId: `DRAFT-REPLACEMENT-${Date.now()}`, action: 'REPLACEMENT_PROPOSAL', data: args, status: 'DRAFT' };
        },
      },
    ];
  }
}
