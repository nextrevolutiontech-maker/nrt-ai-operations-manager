import { Injectable } from '@nestjs/common';
import { AiToolContract } from '../contracts/ai-tool-contract.interface';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class FinanceToolsProvider {
  constructor(private readonly prisma: PrismaService) {}

  getTools(): AiToolContract[] {
    return [
      {
        name: 'finance_cashFlow',
        module: 'finance',
        description: 'Read current working capital reserves and cash flow forecast.',
        requiredPermissions: ['read:ledger'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { cashBalance: 150000, monthlyBudgetRemaining: 25000, workingCapitalRatio: 1.85 };
        },
      },
      {
        name: 'finance_budget',
        module: 'finance',
        description: 'Read departmental monthly budget vs actual spend.',
        requiredPermissions: ['read:ledger'],
        inputSchema: { type: 'object', properties: { department: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { monthlyBudget: 50000, actualSpend: 25000, remainingAllowance: 25000 };
        },
      },
      {
        name: 'finance_profitLoss',
        module: 'finance',
        description: 'Read monthly Income Statement / P&L summary.',
        requiredPermissions: ['read:ledger'],
        inputSchema: { type: 'object', properties: { period: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { revenue: 320000, cogs: 195000, grossProfit: 125000, grossMarginPercent: 39.0 };
        },
      },
      {
        name: 'finance_outstandingInvoices',
        module: 'finance',
        description: 'Read Accounts Receivable and Payable aging summary.',
        requiredPermissions: ['read:ledger'],
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async () => {
          return { accountsReceivableOverdue: 12000, accountsPayableDue: 28000 };
        },
      },
      {
        name: 'finance_paymentScheduleDraft',
        module: 'finance',
        description: 'Stage vendor payment schedule draft.',
        requiredPermissions: ['create:ledger'],
        inputSchema: { type: 'object', properties: { supplierId: { type: 'string' }, amount: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'MEDIUM',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          return { draftId: `DRAFT-PAY-SCHEDULE-${Date.now()}`, action: 'PAYMENT_SCHEDULE', data: args, status: 'DRAFT' };
        },
      },
      {
        name: 'finance_budgetVarianceProposal',
        module: 'finance',
        description: 'Propose formal budget variance request for capital overruns.',
        requiredPermissions: ['create:ledger'],
        inputSchema: { type: 'object', properties: { requestedAmount: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'MEDIUM',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          return { draftId: `DRAFT-BUDGET-VARIANCE-${Date.now()}`, action: 'BUDGET_VARIANCE', data: args, status: 'DRAFT' };
        },
      },
      {
        name: 'finance_approvePayments',
        module: 'finance',
        description: 'RESTRICTED - Execute vendor payment disbursements (Requires CFO Sign-off).',
        requiredPermissions: ['approve:ledger'],
        inputSchema: { type: 'object', properties: { amount: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'CRITICAL',
        approvalRequired: true,
        auditEnabled: true,
        handler: async () => {
          throw new Error('Hard AI Block: Direct payment disbursement approval via AI is strictly prohibited.');
        },
      },
    ];
  }
}
