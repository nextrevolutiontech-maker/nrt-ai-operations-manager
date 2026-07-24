import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebhookNotificationProvider {
  private readonly logger = new Logger(WebhookNotificationProvider.name);

  async send(url: string, payload: any) {
    this.logger.log(`[WEBHOOK NOTIFICATION] Dispatched payload to ${url}`);
    return { success: true, channel: 'WEBHOOK' };
  }
}
