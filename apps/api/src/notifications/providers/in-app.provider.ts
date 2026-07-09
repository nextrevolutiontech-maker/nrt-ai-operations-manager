import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NotificationProvider,
  SendNotificationDto,
} from './notification-provider.interface';

@Injectable()
export class InAppNotificationProvider implements NotificationProvider {
  constructor(private readonly prisma: PrismaService) {}

  async send(dto: SendNotificationDto): Promise<void> {
    await this.prisma.notification.create({
      data: {
        companyId: dto.companyId,
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        priority: dto.priority,
        module: dto.module,
        entityType: dto.entityType,
        entityId: dto.entityId,
        createdBy: dto.createdBy,
        isRead: false,
      },
    });
  }
}
