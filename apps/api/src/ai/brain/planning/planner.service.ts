import { Injectable } from '@nestjs/common';

export interface PlanStep {
  stepId: number;
  description: string;
  toolName?: string;
  expectedOutput: string;
}

export interface ExecutionPlan {
  goal: string;
  steps: PlanStep[];
}

@Injectable()
export class PlannerService {
  generatePlan(goal: string): ExecutionPlan {
    const g = goal.toLowerCase();

    if (g.includes('stockout') || g.includes('shortage')) {
      return {
        goal,
        steps: [
          { stepId: 1, description: 'Check current inventory balance and safety stock level', toolName: 'inventories.checkStock', expectedOutput: 'Current stock count' },
          { stepId: 2, description: 'Check open inbound purchase orders and lead times', toolName: 'purchaseOrders.getInboundPOs', expectedOutput: 'PO ETA dates' },
          { stepId: 3, description: 'Check secondary warehouse stock availability', toolName: 'warehouses.getSecondaryStock', expectedOutput: 'Secondary stock count' },
          { stepId: 4, description: 'Calculate Expedite Air Freight ROI vs margin lost', expectedOutput: 'Expedite ROI score' },
          { stepId: 5, description: 'Generate SIERNA resolution recommendation and next actions', expectedOutput: 'Executive Briefing' },
        ],
      };
    }

    if (g.includes('delay') || g.includes('supplier')) {
      return {
        goal,
        steps: [
          { stepId: 1, description: 'Verify inbound supplier PO shipment tracking status', expectedOutput: 'Tracking delay gap' },
          { stepId: 2, description: 'Check raw material production line depletion date', expectedOutput: 'Depletion date' },
          { stepId: 3, description: 'Lookup pre-approved secondary supplier lead times', expectedOutput: 'Secondary vendor pricing' },
          { stepId: 4, description: 'Draft emergency split purchase order', expectedOutput: 'Split PO Draft' },
        ],
      };
    }

    return {
      goal,
      steps: [
        { stepId: 1, description: 'Harvest operational context and ERP metrics', expectedOutput: 'Context Data' },
        { stepId: 2, description: 'Evaluate request against policy guardrails and SIERNA model', expectedOutput: 'Operational Recommendation' },
      ],
    };
  }
}
