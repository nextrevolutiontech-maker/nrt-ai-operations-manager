import { Injectable } from '@nestjs/common';
import { EventSeverity } from '../events/event.interface';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WEBHOOK' | 'DASHBOARD';

@Injectable()
export class NotificationPreferencesService {
  getChannelsForSeverity(severity: EventSeverity): NotificationChannel[] {
    switch (severity) {
      case 'CRITICAL':
        return ['IN_APP', 'EMAIL', 'WEBHOOK', 'DASHBOARD'];
      case 'HIGH':
        return ['IN_APP', 'EMAIL', 'DASHBOARD'];
      case 'MEDIUM':
        return ['IN_APP', 'DASHBOARD'];
      case 'LOW':
      default:
        return ['DASHBOARD'];
    }
  }
}
