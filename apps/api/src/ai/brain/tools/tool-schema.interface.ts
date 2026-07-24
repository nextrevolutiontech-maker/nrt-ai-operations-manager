export interface ToolSchema {
  name: string;
  module: 'inventory' | 'purchase' | 'sales' | 'finance' | 'suppliers' | 'warehouse';
  description: string;
  inputSchema: any;
  requiresApproval: boolean;
  minRoleRequired?: string;
}
