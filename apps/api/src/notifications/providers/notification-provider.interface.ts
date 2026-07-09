import { NotificationType, PriorityLevel } from '@nrt-ai-workforce/database';

export interface SendNotificationDto {
  companyId: string;
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  priority?: PriorityLevel;
  module?: string;
  entityType?: string;
  entityId?: string;
  createdBy?: string;
}

export interface NotificationProvider {
  send(dto: SendNotificationDto): Promise<void>;
}
