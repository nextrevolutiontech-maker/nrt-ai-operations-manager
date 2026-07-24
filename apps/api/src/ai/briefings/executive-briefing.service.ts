import { Injectable, Logger } from '@nestjs/common';
import { DailySummaryService } from './daily-summary.service';
import { WeeklyReviewService } from './weekly-review.service';
import { MonthlyBusinessReviewService } from './monthly-business-review.service';

@Injectable()
export class ExecutiveBriefingService {
  private readonly logger = new Logger(ExecutiveBriefingService.name);

  constructor(
    private readonly dailySummary: DailySummaryService,
    private readonly weeklyReview: WeeklyReviewService,
    private readonly monthlyReview: MonthlyBusinessReviewService,
  ) {}

  generateBriefing(type: 'DAILY' | 'WEEKLY' | 'MONTHLY'): string {
    this.logger.log(`[EXECUTIVE BRIEFING] Generating ${type} briefing...`);
    switch (type) {
      case 'DAILY':
        return this.dailySummary.generateDailySummary();
      case 'WEEKLY':
        return this.weeklyReview.generateWeeklyReview();
      case 'MONTHLY':
      default:
        return this.monthlyReview.generateMonthlyBusinessReview();
    }
  }
}
