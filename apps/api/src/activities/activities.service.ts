import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityFilterDto } from './dto/activity-filter.dto';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, userId: string, query: ActivityFilterDto) {
    const { page = 1, limit = 10, action, entityType, entityId } = query;
    const skip = (page - 1) * limit;

    const where: any = { companyId, userId };
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const [total, data] = await Promise.all([
      this.prisma.activityLog.count({ where }),
      this.prisma.activityLog.findMany({
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

  // --- EVENT SUBSCRIBERS ---

  @OnEvent('purchase.approved')
  async handlePurchaseApproved(payload: {
    companyId: string;
    userId: string;
    entityId: string;
    orderNumber: string;
  }) {
    await this.prisma.activityLog.create({
      data: {
        companyId: payload.companyId,
        userId: payload.userId,
        action: `Purchase Order ${payload.orderNumber} Approved`,
        entityType: 'PurchaseOrder',
        entityId: payload.entityId,
        metadata: { orderNumber: payload.orderNumber },
      },
    });
  }

  @OnEvent('purchase.rejected')
  async handlePurchaseRejected(payload: {
    companyId: string;
    userId: string;
    entityId: string;
    orderNumber: string;
  }) {
    await this.prisma.activityLog.create({
      data: {
        companyId: payload.companyId,
        userId: payload.userId,
        action: `Purchase Order ${payload.orderNumber} Rejected`,
        entityType: 'PurchaseOrder',
        entityId: payload.entityId,
        metadata: { orderNumber: payload.orderNumber },
      },
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
    await this.prisma.activityLog.create({
      data: {
        companyId: payload.companyId,
        userId: payload.userId,
        action: `Inventory low for ${payload.productName}`,
        entityType: 'Inventory',
        entityId: payload.entityId,
        metadata: {
          productName: payload.productName,
          available: payload.available,
        },
      },
    });
  }

  @OnEvent('inventory.out_of_stock')
  async handleInventoryOutOfStock(payload: {
    companyId: string;
    userId: string;
    entityId: string;
    productName: string;
  }) {
    await this.prisma.activityLog.create({
      data: {
        companyId: payload.companyId,
        userId: payload.userId,
        action: `Inventory out of stock for ${payload.productName}`,
        entityType: 'Inventory',
        entityId: payload.entityId,
        metadata: { productName: payload.productName },
      },
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
    await this.prisma.activityLog.create({
      data: {
        companyId: payload.companyId,
        userId: payload.userId,
        action: `Assigned to approve: ${payload.requestTitle}`,
        entityType: payload.entityType,
        entityId: payload.entityId,
      },
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
    await this.prisma.activityLog.create({
      data: {
        companyId: payload.companyId,
        userId: payload.userId,
        action: `Approval request passed for ${payload.requestTitle}`,
        entityType: payload.entityType,
        entityId: payload.entityId,
      },
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
    await this.prisma.activityLog.create({
      data: {
        companyId: payload.companyId,
        userId: payload.userId,
        action: `Approval request rejected for ${payload.requestTitle}`,
        entityType: payload.entityType,
        entityId: payload.entityId,
      },
    });
  }

  @OnEvent('supplier.created')
  async handleSupplierCreated(payload: {
    companyId: string;
    userId: string;
    entityId: string;
    supplierName: string;
  }) {
    await this.prisma.activityLog.create({
      data: {
        companyId: payload.companyId,
        userId: payload.userId,
        action: `Supplier ${payload.supplierName} created`,
        entityType: 'Supplier',
        entityId: payload.entityId,
      },
    });
  }

  @OnEvent('warehouse.created')
  async handleWarehouseCreated(payload: {
    companyId: string;
    userId: string;
    entityId: string;
    warehouseName: string;
  }) {
    await this.prisma.activityLog.create({
      data: {
        companyId: payload.companyId,
        userId: payload.userId,
        action: `Warehouse ${payload.warehouseName} created`,
        entityType: 'Warehouse',
        entityId: payload.entityId,
      },
    });
  }
}
