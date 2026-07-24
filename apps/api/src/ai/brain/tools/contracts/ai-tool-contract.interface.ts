export type ToolRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AiToolContract {
  name: string;
  module:
    | 'products'
    | 'inventory'
    | 'warehouse'
    | 'purchase'
    | 'sales'
    | 'customers'
    | 'suppliers'
    | 'finance'
    | 'reports'
    | 'dashboard';
  description: string;
  requiredPermissions: string[];
  inputSchema: any;
  outputSchema: any;
  riskLevel: ToolRiskLevel;
  approvalRequired: boolean;
  auditEnabled: boolean;
  supportedIndustries?: string[];
  handler: (args: any, context: any) => Promise<any>;
}

export interface ToolExecutionOptions {
  idempotencyKey?: string;
  executionId?: string;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
}
