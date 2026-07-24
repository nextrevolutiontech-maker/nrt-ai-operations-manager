import { Injectable } from '@nestjs/common';
import { BusinessEvent } from '../events/event.interface';

@Injectable()
export class AlertDeduplicatorService {
  private readonly recentAlerts: Map<string, number> = new Map();
  private readonly deduplicationWindowMs = 15 * 60 * 1000; // 15-minute deduplication window

  isDuplicate(event: BusinessEvent): boolean {
    const key = `${event.eventType}:${event.domain}:${JSON.stringify(event.payload)}`;
    const now = Date.now();

    if (this.recentAlerts.has(key)) {
      const lastTime = this.recentAlerts.get(key)!;
      if (now - lastTime < this.deduplicationWindowMs) {
        return true;
      }
    }

    this.recentAlerts.set(key, now);
    return false;
  }
}
