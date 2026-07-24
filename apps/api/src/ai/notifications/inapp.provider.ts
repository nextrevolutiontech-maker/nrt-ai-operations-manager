import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class InAppNotificationProvider {
  private readonly logger = new Logger(InAppNotificationProvider.name);

  async send(recipient: string, message: string) {
    this.logger.log(`[IN-APP NOTIFICATION] Sent to ${recipient}: ${message.substring(0, 60)}...`);
    return { success: true, channel: 'IN_APP' };
  }
}
