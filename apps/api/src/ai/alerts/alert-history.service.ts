import { Injectable, Logger } from '@nestjs/common';
import { BusinessEvent } from '../events/event.interface';
import { AlertDeduplicatorService } from './alert-deduplicator.service';

export interface AlertRecord {
  id: string;
  event: BusinessEvent;
  priorityScore: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  createdAt: Date;
}

@Injectable()
export class AlertHistoryService {
  private readonly alerts: Map<string, AlertRecord> = new Map();

  saveAlert(record: AlertRecord) {
    this.alerts.set(record.id, record);
  }

  getAlerts(): AlertRecord[] {
    return Array.from(this.alerts.values());
  }

  acknowledgeAlert(id: string, user: string): AlertRecord | undefined {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = user;
    }
    return alert;
  }
}
