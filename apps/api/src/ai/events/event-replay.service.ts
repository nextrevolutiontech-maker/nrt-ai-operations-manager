import { Injectable, Logger } from '@nestjs/common';
import { EventStoreService } from './event-store.service';

@Injectable()
export class EventReplayService {
  private readonly logger = new Logger(EventReplayService.name);

  constructor(private readonly eventStore: EventStoreService) {}

  replayQueuedEvents(dispatchHandler: (event: any) => Promise<void>): number {
    const queuedRecords = this.eventStore.getQueuedEvents();
    this.logger.log(`[EVENT REPLAY] Found ${queuedRecords.length} queued/failed events for replay.`);

    let count = 0;
    for (const record of queuedRecords) {
      if (record.retryCount < record.maxRetries) {
        this.eventStore.updateStatus(record.id, 'PROCESSING');
        dispatchHandler(record.event)
          .then(() => {
            this.eventStore.updateStatus(record.id, 'COMPLETED');
          })
          .catch((err) => {
            this.logger.error(`[EVENT REPLAY FAILED] Event ${record.id}: ${err.message}`);
            this.eventStore.updateStatus(record.id, 'RETRY', err.message);
          });
        count++;
      }
    }

    return count;
  }
}
