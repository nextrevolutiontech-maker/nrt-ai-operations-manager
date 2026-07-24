import { Injectable, Logger } from '@nestjs/common';
import { BusinessEvent } from './event.interface';
import { EventStoreService } from './event-store.service';

export type EventHandler = (event: BusinessEvent) => Promise<void>;

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  private readonly subscribers: Map<string, EventHandler[]> = new Map();

  constructor(private readonly eventStore: EventStoreService) {}

  subscribe(eventType: string, handler: EventHandler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(handler);
  }

  async publish(event: BusinessEvent): Promise<void> {
    this.logger.log(`[EVENT BUS] Published Event: ${event.eventType} | ID: ${event.eventId} | Severity: ${event.severity}`);

    // Persist Event
    this.eventStore.saveEvent(event);

    const handlers = this.subscribers.get(event.eventType) || [];
    const wildcardHandlers = this.subscribers.get('*') || [];
    const allHandlers = [...handlers, ...wildcardHandlers];

    this.eventStore.updateStatus(event.eventId, 'PROCESSING');

    try {
      await Promise.all(allHandlers.map((h) => h(event)));
      this.eventStore.updateStatus(event.eventId, 'COMPLETED');
    } catch (err: any) {
      this.logger.error(`Error processing event ${event.eventId}: ${err.message}`);
      this.eventStore.updateStatus(event.eventId, 'RETRY', err.message);
    }
  }
}
