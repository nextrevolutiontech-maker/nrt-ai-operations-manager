import { Injectable } from '@nestjs/common';
import { AiToolContract } from '../contracts/ai-tool-contract.interface';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PurchaseToolsProvider {
  constructor(private readonly prisma: PrismaService) {}

  getTools(): AiToolContract[] {
    return [
      {
        name: 'purchase_getOpenPOs',
        module: 'purchase',
        description: 'Read inbound open Purchase Orders and delivery ETAs.',
        requiredPermissions: ['read:purchase-orders'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'array' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          const pos = await this.prisma.purchaseOrder.findMany({ take: 10 });
          return pos.length > 0
            ? pos
            : [
                {
                  poNumber: 'PO-8810',
                  supplierName: 'Acme Logistics',
                  totalAmount: 42000,
                  status: 'IN_TRANSIT',
                  deliveryEta: '2026-07-28',
                },
              ];
        },
      },
      {
        name: 'purchase_getSupplierPerformance',
        module: 'purchase',
        description: 'Get vendor OTIF scorecards and defect rates.',
        requiredPermissions: ['read:suppliers'],
        inputSchema: { type: 'object', properties: { supplierId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { supplierId: 'SUP-01', otifScore: 92.4, leadTimeDriftDays: 3, defectRatePercent: 0.8 };
        },
      },
      {
        name: 'purchase_getPendingApprovals',
        module: 'purchase',
        description: 'Get PO approval queue waiting for manager sign-off.',
        requiredPermissions: ['read:purchase-orders'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'array' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return [{ poNumber: 'PO-9082', amount: 42000, requestedBy: 'Buyer 1', status: 'PENDING_APPROVAL' }];
        },
      },
      {
        name: 'purchase_createPODraft',
        module: 'purchase',
        description: 'Stage a new supplier Purchase Order draft.',
        requiredPermissions: ['create:purchase-orders'],
        inputSchema: { type: 'object', properties: { supplierId: { type: 'string' }, totalAmount: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'MEDIUM',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          return { draftId: `DRAFT-PO-${Date.now()}`, action: 'CREATE_PO', data: args, status: 'DRAFT' };
        },
      },
      {
        name: 'purchase_splitBlanketPO',
        module: 'purchase',
        description: 'Structure split-tranche Blanket Purchase Order for budget compliance.',
        requiredPermissions: ['create:purchase-orders'],
        inputSchema: { type: 'object', properties: { totalAmount: { type: 'number' }, monthlyLimit: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'MEDIUM',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          const tranches = Math.ceil(args.totalAmount / args.monthlyLimit);
          return {
            status: 'BLANKET_PO_DRAFT',
            totalAmount: args.totalAmount,
            tranchesCount: tranches,
            trancheAmount: args.totalAmount / tranches,
          };
        },
      },
      {
        name: 'purchase_supplierReplacementDraft',
        module: 'purchase',
        description: 'Stage emergency secondary supplier Purchase Order draft.',
        requiredPermissions: ['create:purchase-orders'],
        inputSchema: { type: 'object', properties: { secondarySupplierId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'HIGH',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          return { draftId: `DRAFT-EMERG-PO-${Date.now()}`, action: 'EMERGENCY_PO', data: args, status: 'DRAFT' };
        },
      },
      {
        name: 'purchase_issueApprovedPO',
        module: 'purchase',
        description: 'Execute release of approved PO (< $5,000).',
        requiredPermissions: ['update:purchase-orders'],
        inputSchema: { type: 'object', properties: { poNumber: { type: 'string' }, amount: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'MEDIUM',
        approvalRequired: false,
        auditEnabled: true,
        handler: async (args: any) => {
          if ((args.amount || 0) > 5000) {
            throw new Error('PO > $5,000 requires human manager approval.');
          }
          return { status: 'ISSUED', poNumber: args.poNumber };
        },
      },
      {
        name: 'purchase_approveLargePO',
        module: 'purchase',
        description: 'RESTRICTED - Approve large PO > $50,000 (Requires CFO Sign-off).',
        requiredPermissions: ['approve:purchase-orders'],
        inputSchema: { type: 'object', properties: { poNumber: { type: 'string' }, amount: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'CRITICAL',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          if ((args.amount || 0) > 50000) {
            throw new Error('Hard AI Block: PO > $50,000 requires CFO Executive Board sign-off.');
          }
          return { status: 'APPROVED_LARGE_PO', poNumber: args.poNumber };
        },
      },
    ];
  }
}
