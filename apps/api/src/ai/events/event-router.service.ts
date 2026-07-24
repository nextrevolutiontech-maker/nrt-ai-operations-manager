import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from './event-bus.service';
import { BusinessEvent } from './event.interface';

@Injectable()
export class EventRouterService {
  private readonly logger = new Logger(EventRouterService.name);

  constructor(private readonly eventBus: EventBusService) {}

  async routeEvent(event: BusinessEvent) {
    this.logger.log(`[EVENT ROUTER] Routing event ${event.eventType} for domain: ${event.domain}`);
    await this.eventBus.publish(event);
  }
}
