import { Injectable, Logger } from '@nestjs/common';
import { BusinessEvent } from '../events/event.interface';
import { AlertDeduplicatorService } from './alert-deduplicator.service';
import { AlertPriorityService } from './alert-priority.service';
import { AlertHistoryService, AlertRecord } from './alert-history.service';

@Injectable()
export class AlertEngineService {
  private readonly logger = new Logger(AlertEngineService.name);

  constructor(
    private readonly deduplicator: AlertDeduplicatorService,
    private readonly priorityService: AlertPriorityService,
    private readonly historyService: AlertHistoryService,
  ) {}

  processEvent(event: BusinessEvent): AlertRecord | null {
    if (this.deduplicator.isDuplicate(event)) {
      this.logger.log(`[ALERT ENGINE] Merged duplicate alert for ${event.eventType}`);
      return null;
    }

    const priorityScore = this.priorityService.getPriorityScore(event.severity);
    const alertRecord: AlertRecord = {
      id: `ALT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      event,
      priorityScore,
      acknowledged: false,
      createdAt: new Date(),
    };

    this.historyService.saveAlert(alertRecord);
    this.logger.log(`[ALERT ENGINE] Generated Alert ${alertRecord.id} | Score: ${priorityScore}`);
    return alertRecord;
  }
}
