import { Injectable } from '@nestjs/common';

export type ActionTier =
  | 'EXECUTE_AUTOMATICALLY'
  | 'CREATE_DRAFT'
  | 'RECOMMEND_ONLY'
  | 'REQUIRE_HUMAN_APPROVAL'
  | 'NEVER_PERFORM';

@Injectable()
export class AutonomousMatrixService {
  classifyAction(actionName: string, amount: number = 0): ActionTier {
    const act = actionName.toLowerCase();

    if (
      act.includes('machine_parameter') ||
      act.includes('prescription') ||
      act.includes('drop_table') ||
      act.includes('fraud_bypass')
    ) {
      return 'NEVER_PERFORM';
    }

    if (amount > 5000 || act.includes('scrap_writeoff') || act.includes('terminate_vendor')) {
      return 'REQUIRE_HUMAN_APPROVAL';
    }

    if (act.includes('transfer') || act.includes('expedite') || act.includes('clearance')) {
      return 'CREATE_DRAFT';
    }

    if (amount <= 1000 || act.includes('reorder') || act.includes('delay_notice') || act.includes('rma_low_value')) {
      return 'EXECUTE_AUTOMATICALLY';
    }

    return 'RECOMMEND_ONLY';
  }
}
