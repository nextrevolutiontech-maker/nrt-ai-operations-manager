import { Injectable, Logger } from '@nestjs/common';
import { NotificationPreferencesService } from './notification-preferences.service';
import { InAppNotificationProvider } from './inapp.provider';
import { EmailNotificationProvider } from './email.provider';
import { WebhookNotificationProvider } from './webhook.provider';
import { NotificationHistoryService } from './notification-history.service';
import { EventSeverity } from '../events/event.interface';

@Injectable()
export class NotificationEngineService {
  private readonly logger = new Logger(NotificationEngineService.name);

  constructor(
    private readonly preferences: NotificationPreferencesService,
    private readonly inAppProvider: InAppNotificationProvider,
    private readonly emailProvider: EmailNotificationProvider,
    private readonly webhookProvider: WebhookNotificationProvider,
    private readonly historyService: NotificationHistoryService,
  ) {}

  async dispatchNotification(severity: EventSeverity, recipient: string, message: string) {
    const channels = this.preferences.getChannelsForSeverity(severity);
    this.logger.log(`[NOTIFICATION ENGINE] Dispatching alert via channels: ${channels.join(', ')}`);

    const results = [];
    if (channels.includes('IN_APP')) {
      const r = await this.inAppProvider.send(recipient, message);
      results.push(r);
    }
    if (channels.includes('EMAIL')) {
      const r = await this.emailProvider.send(recipient, `[ALERT - ${severity}] Operational Warning`, message);
      results.push(r);
    }
    if (channels.includes('WEBHOOK')) {
      const r = await this.webhookProvider.send('https://hooks.enterprise.com/ops-alerts', { severity, message });
      results.push(r);
    }

    this.historyService.logNotification({
      id: `NOTIF-${Date.now()}`,
      channel: channels.join(','),
      recipient,
      message,
      status: 'DELIVERED',
      sentAt: new Date(),
    });

    return results;
  }
}
