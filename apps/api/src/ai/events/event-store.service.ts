import { Injectable, Logger } from '@nestjs/common';
import { BusinessEvent } from './event.interface';
import { PersistentEventRecord, EventProcessingStatus } from './event.entity';

@Injectable()
export class EventStoreService {
  private readonly logger = new Logger(EventStoreService.name);
  private readonly store: Map<string, PersistentEventRecord> = new Map();

  saveEvent(event: BusinessEvent): PersistentEventRecord {
    const record: PersistentEventRecord = {
      id: event.eventId,
      event,
      status: 'QUEUED',
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.store.set(event.eventId, record);
    return record;
  }

  updateStatus(id: string, status: EventProcessingStatus, error?: string): PersistentEventRecord | undefined {
    const record = this.store.get(id);
    if (record) {
      record.status = status;
      record.updatedAt = new Date();
      if (error) record.errorMessage = error;
      if (status === 'RETRY') record.retryCount++;
    }
    return record;
  }

  getQueuedEvents(): PersistentEventRecord[] {
    return Array.from(this.store.values()).filter((r) => r.status === 'QUEUED' || r.status === 'RETRY');
  }

  getEventHistory(): PersistentEventRecord[] {
    return Array.from(this.store.values());
  }
}
