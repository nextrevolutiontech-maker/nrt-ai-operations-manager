import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFilterDto } from './dto/notification-filter.dto';
import { InAppNotificationProvider } from './providers/in-app.provider';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType, PriorityLevel } from '@nrt-ai-workforce/database';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inAppProvider: InAppNotificationProvider,
  ) {}

  async create(
    companyId: string,
    createdBy: string,
    dto: CreateNotificationDto,
  ) {
    // For now, route directly to InApp provider.
    // Future architecture will resolve user preferences here.
    await this.inAppProvider.send({
      companyId,
      createdBy,
      ...dto,
    });

    // We only log the event creation audit if it's manual, or we can rely on global event auditor.
    await this.prisma.auditLog
      .create({
        data: {
          companyId,
          userId: createdBy,
          action: 'NOTIFICATION_CREATED',
          entity: 'Notification',
          entityId: 'manual', // since send doesn't return ID immediately in generic interface
        },
      })
      .catch(() => null);

    return { message: 'Notification queued for delivery' };
  }

  async findAll(
    companyId: string,
    userId: string,
    query: NotificationFilterDto,
  ) {
    const { page = 1, limit = 10, type, priority, module, isRead } = query;
    const skip = (page - 1) * limit;

    const where: any = { companyId, userId, deletedAt: null };
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (module) where.module = module;
    if (isRead !== undefined) where.isRead = isRead === 'true';

    const [total, data] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async findOne(companyId: string, userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, companyId, userId, deletedAt: null },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async markAsRead(companyId: string, userId: string, id: string) {
    const notification = await this.findOne(companyId, userId, id);
    const updated = await this.prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });

    await this.prisma.auditLog
      .create({
        data: {
          companyId,
          userId,
          action: 'NOTIFICATION_READ',
          entity: 'Notification',
          entityId: id,
        },
      })
      .catch(() => null);

    return updated;
  }

  async markAllAsRead(companyId: string, userId: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { companyId, userId, isRead: false, deletedAt: null },
      data: { isRead: true },
    });

    await this.prisma.auditLog
      .create({
        data: {
          companyId,
          userId,
          action: 'NOTIFICATION_READ_ALL',
          entity: 'Notification',
          entityId: 'all',
          details: { count },
        },
      })
      .catch(() => null);

    return { message: `${count} notifications marked as read` };
  }

  async remove(companyId: string, userId: string, id: string) {
    const notification = await this.findOne(companyId, userId, id);
    await this.prisma.notification.update({
      where: { id: notification.id },
      data: { deletedAt: new Date() },
    });

    await this.prisma.auditLog
      .create({
        data: {
          companyId,
          userId,
          action: 'NOTIFICATION_DELETED',
          entity: 'Notification',
          entityId: id,
        },
      })
      .catch(() => null);

    return { message: 'Notification soft deleted' };
  }

  // --- EVENT SUBSCRIBERS ---

  @OnEvent('purchase.approved')
  async handlePurchaseApproved(payload: {
    companyId: string;
    userId: string;
    entityId: string;
    orderNumber: string;
  }) {
    await this.inAppProvider.send({
      companyId: payload.companyId,
      userId: payload.userId, // User to notify (likely the creator)
      title: 'Purchase Order Approved',
      message: `Purchase Order ${payload.orderNumber} has been fully approved.`,
      type: NotificationType.SUCCESS,
      priority: PriorityLevel.HIGH,
      module: 'PROCUREMENT',
      entityType: 'PurchaseOrder',
      entityId: payload.entityId,
    });
  }

  @OnEvent('purchase.rejected')
  async handlePurchaseRejected(payload: {
    companyId: string;
    userId: string;
    entityId: string;
    orderNumber: string;
  }) {
    await this.inAppProvider.send({
      companyId: payload.companyId,
      userId: payload.userId,
      title: 'Purchase Order Rejected',
      message: `Purchase Order ${payload.orderNumber} was rejected.`,
      type: NotificationType.ERROR,
      priority: PriorityLevel.HIGH,
      module: 'PROCUREMENT',
      entityType: 'PurchaseOrder',
      entityId: payload.entityId,
    });
  }

  @OnEvent('inventory.low')
  async handleInventoryLow(payload: {
    companyId: string;
    userId: string;
    entityId: string;
    productName: string;
    available: number;
  }) {
    await this.inAppProvider.send({
      companyId: payload.companyId,
      userId: payload.userId,
      title: 'Low Inventory Alert',
      message: `Product ${payload.productName} is running low (Available: ${payload.available}).`,
      type: NotificationType.WARNING,
      priority: PriorityLevel.MEDIUM,
      module: 'INVENTORY',
      entityType: 'Inventory',
      entityId: payload.entityId,
    });
  }

  @OnEvent('inventory.out_of_stock')
  async handleInventoryOutOfStock(payload: {
    companyId: string;
    userId: string;
    entityId: string;
    productName: string;
  }) {
    await this.inAppProvider.send({
      companyId: payload.companyId,
      userId: payload.userId,
      title: 'Out of Stock Alert',
      message: `Product ${payload.productName} is entirely out of stock.`,
      type: NotificationType.ERROR,
      priority: PriorityLevel.CRITICAL,
      module: 'INVENTORY',
      entityType: 'Inventory',
      entityId: payload.entityId,
    });
  }

  @OnEvent('workflow.assigned')
  async handleWorkflowAssigned(payload: {
    companyId: string;
    userId: string;
    entityId: string;
    entityType: string;
    requestTitle: string;
  }) {
    await this.inAppProvider.send({
      companyId: payload.companyId,
      userId: payload.userId,
      title: 'Approval Required',
      message: `You have been assigned to approve: ${payload.requestTitle}`,
      type: NotificationType.INFO,
      priority: PriorityLevel.HIGH,
      module: 'WORKFLOW',
      entityType: payload.entityType,
      entityId: payload.entityId,
    });
  }

  @OnEvent('workflow.approved')
  async handleWorkflowApproved(payload: {
    companyId: string;
    userId: string;
    entityId: string;
    entityType: string;
    requestTitle: string;
  }) {
    await this.inAppProvider.send({
      companyId: payload.companyId,
      userId: payload.userId,
      title: 'Approval Request Passed',
      message: `Your request for ${payload.requestTitle} has been approved.`,
      type: NotificationType.SUCCESS,
      priority: PriorityLevel.MEDIUM,
      module: 'WORKFLOW',
      entityType: payload.entityType,
      entityId: payload.entityId,
    });
  }

  @OnEvent('workflow.rejected')
  async handleWorkflowRejected(payload: {
    companyId: string;
    userId: string;
    entityId: string;
    entityType: string;
    requestTitle: string;
  }) {
    await this.inAppProvider.send({
      companyId: payload.companyId,
      userId: payload.userId,
      title: 'Approval Request Rejected',
      message: `Your request for ${payload.requestTitle} has been rejected.`,
      type: NotificationType.ERROR,
      priority: PriorityLevel.HIGH,
      module: 'WORKFLOW',
      entityType: payload.entityType,
      entityId: payload.entityId,
    });
  }

  @OnEvent('supplier.created')
  async handleSupplierCreated(payload: {
    companyId: string;
    userId: string;
    entityId: string;
    supplierName: string;
  }) {
    await this.inAppProvider.send({
      companyId: payload.companyId,
      userId: payload.userId,
      title: 'New Supplier Created',
      message: `Supplier ${payload.supplierName} was successfully onboarded.`,
      type: NotificationType.INFO,
      priority: PriorityLevel.LOW,
      module: 'PROCUREMENT',
      entityType: 'Supplier',
      entityId: payload.entityId,
    });
  }

  @OnEvent('warehouse.created')
  async handleWarehouseCreated(payload: {
    companyId: string;
    userId: string;
    entityId: string;
    warehouseName: string;
  }) {
    await this.inAppProvider.send({
      companyId: payload.companyId,
      userId: payload.userId,
      title: 'New Warehouse Added',
      message: `Warehouse ${payload.warehouseName} has been configured.`,
      type: NotificationType.INFO,
      priority: PriorityLevel.LOW,
      module: 'INVENTORY',
      entityType: 'Warehouse',
      entityId: payload.entityId,
    });
  }
}
