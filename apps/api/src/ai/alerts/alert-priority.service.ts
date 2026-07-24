import { Injectable } from '@nestjs/common';
import { EventSeverity } from '../events/event.interface';

@Injectable()
export class AlertPriorityService {
  getPriorityScore(severity: EventSeverity): number {
    switch (severity) {
      case 'CRITICAL':
        return 100;
      case 'HIGH':
        return 75;
      case 'MEDIUM':
        return 50;
      case 'LOW':
      default:
        return 25;
    }
  }
}
