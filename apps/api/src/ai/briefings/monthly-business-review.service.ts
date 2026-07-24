import { Injectable, Logger } from '@nestjs/common';
import { SiernaFormatterService } from '../brain/persona/sierna-formatter.service';

@Injectable()
export class MonthlyBusinessReviewService {
  private readonly logger = new Logger(MonthlyBusinessReviewService.name);

  constructor(private readonly siernaFormatter: SiernaFormatterService) {}

  generateMonthlyBusinessReview() {
    this.logger.log('[MONTHLY MBR] Generating Monthly Business Review Report...');
    return this.siernaFormatter.format({
      situation: 'Monthly Business Review (MBR) & Operational Audit.',
      impact: 'Monthly Revenue: $320,000; Gross Profit: $125,000 (39.0% margin).',
      evidence: 'Cash Reserves: $150,000; Working Capital Ratio: 1.85.',
      recommendation: 'Reallocate slow-moving inventory (SKU-3011) via clearance promotions.',
      nextActions: ['Present MBR summary to Board of Directors'],
    });
  }
}
