import { Injectable } from '@nestjs/common';
import { AI_CONFIG } from '../../config/ai.config';

export type ConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ConfidenceEvaluation {
  score: number;
  tier: ConfidenceTier;
  actionable: boolean;
  reasons: string[];
}

@Injectable()
export class ConfidenceEngineService {
  evaluateConfidence(params: {
    dataCompleteness: number; // 0 to 1
    policyClarity: number; // 0 to 1
    precedentConfidence: number; // 0 to 1
  }): ConfidenceEvaluation {
    const score =
      0.5 * params.dataCompleteness +
      0.3 * params.policyClarity +
      0.2 * params.precedentConfidence;

    const reasons: string[] = [];

    if (params.dataCompleteness < 0.7) {
      reasons.push('Incomplete master data or ERP record metrics');
    }
    if (params.policyClarity < 0.7) {
      reasons.push('Ambiguous policy guardrail parameters');
    }

    if (score >= AI_CONFIG.confidenceThresholds.high) {
      return { score, tier: 'HIGH', actionable: true, reasons };
    }
    if (score >= AI_CONFIG.confidenceThresholds.medium) {
      return { score, tier: 'MEDIUM', actionable: true, reasons };
    }

    return {
      score,
      tier: 'LOW',
      actionable: false,
      reasons: [...reasons, 'Low confidence score (< 70%). Refusing autonomous execution.'],
    };
  }
}
