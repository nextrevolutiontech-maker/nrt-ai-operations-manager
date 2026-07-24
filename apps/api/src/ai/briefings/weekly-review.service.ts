import { Injectable, Logger } from '@nestjs/common';
import { SiernaFormatterService } from '../brain/persona/sierna-formatter.service';

@Injectable()
export class WeeklyReviewService {
  private readonly logger = new Logger(WeeklyReviewService.name);

  constructor(private readonly siernaFormatter: SiernaFormatterService) {}

  generateWeeklyReview() {
    this.logger.log('[WEEKLY REVIEW] Generating Weekly KPI Scorecard...');
    return this.siernaFormatter.format({
      situation: 'Weekly KPI & Operational Performance Scorecard.',
      impact: 'OTIF delivery score at 98.2%; Order Cycle Time averaged 14.2 hours.',
      evidence: 'Inventory Turnover: 9.4x; Scrap %: 0.4%; Supplier OTIF: 94.2%.',
      recommendation: 'Initiate vendor review with Supplier Acme Corp due to lead-time drift.',
      nextActions: ['Schedule Monday S&OP alignment with Sales'],
    });
  }
}
