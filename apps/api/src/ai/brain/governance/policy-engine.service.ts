import { Injectable } from '@nestjs/common';
import { AI_CONFIG } from '../../config/ai.config';

export interface PolicyCheckResult {
  allowed: boolean;
  requiresHumanApproval: boolean;
  approvalRole?: string;
  violations: string[];
}

@Injectable()
export class PolicyEngineService {
  checkPolicy(params: {
    actionName: string;
    amount?: number;
    userRole?: string;
    isBlockedAction?: boolean;
  }): PolicyCheckResult {
    const violations: string[] = [];
    const amount = params.amount || 0;

    if (params.isBlockedAction) {
      return {
        allowed: false,
        requiresHumanApproval: false,
        violations: [
          `Action '${params.actionName}' is strictly prohibited by Hard AI Block Rules (Safety/Compliance/Security violation).`,
        ],
      };
    }

    if (amount > AI_CONFIG.approvalThresholds.cfo) {
      return {
        allowed: true,
        requiresHumanApproval: true,
        approvalRole: 'CFO / EXECUTIVE_BOARD',
        violations: [`Amount ($${amount}) exceeds Ops Manager limit ($50,000). Routed to CFO queue.`],
      };
    }

    if (amount > AI_CONFIG.approvalThresholds.opsManager) {
      return {
        allowed: true,
        requiresHumanApproval: true,
        approvalRole: 'OPERATIONS_DIRECTOR',
        violations: [`Amount ($${amount}) exceeds $5,000 single approval threshold.`],
      };
    }

    return {
      allowed: true,
      requiresHumanApproval: false,
      violations: [],
    };
  }
}
