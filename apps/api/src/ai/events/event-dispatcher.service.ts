import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from './event-bus.service';
import { BusinessEvent } from './event.interface';

@Injectable()
export class EventDispatcherService {
  private readonly logger = new Logger(EventDispatcherService.name);

  constructor(private readonly eventBus: EventBusService) {}

  async dispatchConcurrent(events: BusinessEvent[]): Promise<void> {
    this.logger.log(`[EVENT DISPATCHER] Dispatching ${events.length} events concurrently.`);
    await Promise.all(events.map((evt) => this.eventBus.publish(evt)));
  }
}
