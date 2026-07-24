import { BusinessEvent } from './event.interface';

export type EventProcessingStatus = 'CREATED' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'RETRY';

export interface PersistentEventRecord {
  id: string;
  event: BusinessEvent;
  status: EventProcessingStatus;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
