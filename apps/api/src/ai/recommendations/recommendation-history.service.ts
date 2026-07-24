import { Injectable } from '@nestjs/common';
import { AiRecommendationRecord } from './recommendation-lifecycle.service';

@Injectable()
export class RecommendationHistoryService {
  private readonly history: Map<string, AiRecommendationRecord> = new Map();

  saveRecommendation(rec: AiRecommendationRecord) {
    this.history.set(rec.id, rec);
  }

  getRecommendations(): AiRecommendationRecord[] {
    return Array.from(this.history.values());
  }

  getRecommendation(id: string): AiRecommendationRecord | undefined {
    return this.history.get(id);
  }
}
