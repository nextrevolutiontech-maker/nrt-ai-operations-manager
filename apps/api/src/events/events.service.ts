import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('**')
  async auditAllEvents(payload: any, options: { event: string }) {
    // Generate audit logs for Event Published
    // Only process our business events, filter out generic nestjs events if any
    const eventName = options?.event;
    if (typeof eventName === 'string' && eventName.includes('.')) {
      await this.prisma.auditLog
        .create({
          data: {
            companyId: payload?.companyId || null,
            userId: payload?.userId || null,
            action: 'EVENT_PUBLISHED',
            entity: 'Event',
            entityId: eventName,
            details: { eventPayload: payload },
          },
        })
        .catch(() => null);
    }
  }
}
