import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailNotificationProvider {
  private readonly logger = new Logger(EmailNotificationProvider.name);

  async send(recipient: string, subject: string, body: string) {
    this.logger.log(`[EMAIL NOTIFICATION] Sent subject '${subject}' to ${recipient}`);
    return { success: true, channel: 'EMAIL' };
  }
}
