import { Injectable } from '@nestjs/common';

export interface NotificationLogRecord {
  id: string;
  channel: string;
  recipient: string;
  message: string;
  status: 'DELIVERED' | 'FAILED';
  sentAt: Date;
}

@Injectable()
export class NotificationHistoryService {
  private readonly logs: NotificationLogRecord[] = [];

  logNotification(record: NotificationLogRecord) {
    this.logs.push(record);
  }

  getLogs(): NotificationLogRecord[] {
    return this.logs;
  }
}
