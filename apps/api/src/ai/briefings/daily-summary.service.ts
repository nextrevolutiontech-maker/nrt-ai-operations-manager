import { Injectable, Logger } from '@nestjs/common';
import { SiernaFormatterService } from '../brain/persona/sierna-formatter.service';

@Injectable()
export class DailySummaryService {
  private readonly logger = new Logger(DailySummaryService.name);

  constructor(private readonly siernaFormatter: SiernaFormatterService) {}

  generateDailySummary() {
    this.logger.log('[DAILY SUMMARY] Generating Daily EOD Summary Report...');
    return this.siernaFormatter.format({
      situation: 'Daily EOD Operational Summary compiled.',
      impact: '1,240 dispatches completed (99.2% target achievement).',
      evidence: 'Active Stockouts: 1 (SKU-8092); Open POs: 14; Dock Backlog: 0.',
      recommendation: 'Maintain standard shift allocation for tomorrow morning.',
      nextActions: ['Verify Dock 1 receiving schedule at 08:00 AM'],
    });
  }
}
