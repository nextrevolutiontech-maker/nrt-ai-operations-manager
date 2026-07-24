import { Injectable } from '@nestjs/common';
import { AiToolContract } from '../contracts/ai-tool-contract.interface';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class SuppliersToolsProvider {
  constructor(private readonly prisma: PrismaService) {}

  getTools(): AiToolContract[] {
    return [
      {
        name: 'suppliers_supplierPerformance',
        module: 'suppliers',
        description: 'Read supplier OTIF score and pricing compliance.',
        requiredPermissions: ['read:suppliers'],
        inputSchema: { type: 'object', properties: { supplierId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { otifScorePercent: 94.2, priceCompliancePercent: 98.8, defectRatePercent: 0.5 };
        },
      },
      {
        name: 'suppliers_supplierLeadTimes',
        module: 'suppliers',
        description: 'Read supplier lead times and lead-time drift history.',
        requiredPermissions: ['read:suppliers'],
        inputSchema: { type: 'object', properties: { supplierId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { promisedLeadTimeDays: 7, actualAvgLeadTimeDays: 10, driftDays: +3 };
        },
      },
      {
        name: 'suppliers_supplierRisk',
        module: 'suppliers',
        description: 'Evaluate single-source supplier risk score.',
        requiredPermissions: ['read:suppliers'],
        inputSchema: { type: 'object', properties: { supplierId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { riskLevel: 'MEDIUM', singleSourceDependency: true, alternateSuppliersCount: 2 };
        },
      },
      {
        name: 'suppliers_debitNoteDraft',
        module: 'suppliers',
        description: 'Stage vendor defect chargeback debit note draft.',
        requiredPermissions: ['create:purchase-orders'],
        inputSchema: { type: 'object', properties: { supplierId: { type: 'string' }, amount: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'MEDIUM',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          return { draftId: `DRAFT-DEBIT-${Date.now()}`, action: 'DEBIT_NOTE', data: args, status: 'DRAFT' };
        },
      },
      {
        name: 'suppliers_alternateSupplierProposal',
        module: 'suppliers',
        description: 'Propose secondary backup vendor contingency order.',
        requiredPermissions: ['read:suppliers'],
        inputSchema: { type: 'object', properties: { primarySupplierId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { alternateSupplierId: 'SUP-02', name: 'Local Supply Co', leadTimeDays: 3, pricePremiumPercent: +12 };
        },
      },
    ];
  }
}
