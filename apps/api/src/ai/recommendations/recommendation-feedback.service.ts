import { Injectable, Logger } from '@nestjs/common';

export type RecommendationOutcome = 'ACCEPTED' | 'REJECTED' | 'MODIFIED' | 'IGNORED' | 'SUCCESS' | 'FAILURE';

export interface RecommendationFeedbackRecord {
  recommendationId: string;
  outcome: RecommendationOutcome;
  userNotes?: string;
  actualRoiRealized?: number;
  timestamp: Date;
}

@Injectable()
export class RecommendationFeedbackService {
  private readonly logger = new Logger(RecommendationFeedbackService.name);
  private readonly feedbackLogs: RecommendationFeedbackRecord[] = [];

  recordFeedback(feedback: RecommendationFeedbackRecord) {
    this.feedbackLogs.push(feedback);
    this.logger.log(
      `[RECOMMENDATION FEEDBACK] Rec ${feedback.recommendationId} -> Outcome: ${feedback.outcome}`,
    );
  }

  getFeedbackHistory(): RecommendationFeedbackRecord[] {
    return this.feedbackLogs;
  }
}
