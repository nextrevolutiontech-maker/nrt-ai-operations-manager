import { Injectable } from '@nestjs/common';
import { BusinessEventType } from './event-types';

@Injectable()
export class EventRegistryService {
  private readonly registeredEventTypes = new Set<string>(Object.values(BusinessEventType));

  isRegistered(eventType: string): boolean {
    return this.registeredEventTypes.has(eventType);
  }

  getRegisteredEvents(): string[] {
    return Array.from(this.registeredEventTypes);
  }
}
