import { Injectable } from '@nestjs/common';

export type RecommendationState = 'CREATED' | 'STAGED' | 'APPROVED' | 'EXECUTED' | 'ARCHIVED';

export interface AiRecommendationRecord {
  id: string;
  situation: string;
  evidence: string;
  rootCause: string;
  businessImpact: string;
  riskLevel: string;
  confidenceScore: number;
  recommendedAction: string;
  approvalRequired: boolean;
  estimatedRoi: number;
  expectedOutcome: string;
  state: RecommendationState;
  createdAt: Date;
}

@Injectable()
export class RecommendationLifecycleService {
  transitionState(record: AiRecommendationRecord, newState: RecommendationState): AiRecommendationRecord {
    record.state = newState;
    return record;
  }
}
