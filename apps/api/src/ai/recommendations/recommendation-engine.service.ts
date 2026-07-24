import { Injectable, Logger } from '@nestjs/common';
import { BusinessEvent } from '../events/event.interface';
import { RecommendationHistoryService } from './recommendation-history.service';
import { AiRecommendationRecord } from './recommendation-lifecycle.service';

@Injectable()
export class RecommendationEngineService {
  private readonly logger = new Logger(RecommendationEngineService.name);

  constructor(private readonly historyService: RecommendationHistoryService) {}

  generateRecommendation(event: BusinessEvent): AiRecommendationRecord {
    const id = `REC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const recommendation: AiRecommendationRecord = {
      id,
      situation: `Event ${event.eventType} detected in ${event.domain} domain.`,
      evidence: `Event Payload: ${JSON.stringify(event.payload)}`,
      rootCause: `Operational anomaly detected by ${event.sourceModule}`,
      businessImpact: `Severity ${event.severity} operational risk to SLA / margin`,
      riskLevel: event.severity === 'CRITICAL' ? 'CRITICAL' : event.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
      confidenceScore: 0.92,
      recommendedAction: `Execute operational mitigation workflow for ${event.eventType}`,
      approvalRequired: event.severity === 'HIGH' || event.severity === 'CRITICAL',
      estimatedRoi: 3.5,
      expectedOutcome: 'Preserve SLA targets and prevent stockout / delay',
      state: 'CREATED',
      createdAt: new Date(),
    };

    this.historyService.saveRecommendation(recommendation);
    this.logger.log(`[RECOMMENDATION ENGINE] Generated Recommendation ${id} for Event ${event.eventType}`);
    return recommendation;
  }
}
