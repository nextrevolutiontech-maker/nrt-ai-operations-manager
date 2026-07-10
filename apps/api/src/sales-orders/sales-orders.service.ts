import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { SalesOrderFilterDto } from './dto/sales-order-filter.dto';
import { GoodsIssueDto } from './dto/goods-issue.dto';
import {
  SalesOrderStatus,
  MovementType,
  Prisma,
} from '@nrt-ai-workforce/database';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SalesOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(companyId: string, userId: string, dto: CreateSalesOrderDto) {
    // Basic validation
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, companyId },
    });
    if (!customer) throw new BadRequestException('Customer not found');

    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, companyId },
    });
    if (!warehouse) throw new BadRequestException('Warehouse not found');

    // Generate Sales Number
    const count = await this.prisma.salesOrder.count({ where: { companyId } });
    const salesNumber = `SO-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    // Calculate totals
    let totalAmount = 0;
    const itemsData = dto.items.map((item) => {
      let lineTotal = item.quantity * item.unitPrice;
      if (item.discount) {
        lineTotal -= lineTotal * (item.discount / 100);
      }
      if (item.tax) {
        lineTotal += lineTotal * (item.tax / 100);
      }
      totalAmount += lineTotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        tax: item.tax || 0,
        total: lineTotal,
      };
    });

    const order = await this.prisma.salesOrder.create({
      data: {
        companyId,
        customerId: dto.customerId,
        warehouseId: dto.warehouseId,
        salesNumber,
        orderDate: dto.orderDate,
        deliveryDate: dto.deliveryDate,
        notes: dto.notes,
        totalAmount,
        createdBy: userId,
        updatedBy: userId,
        items: {
          create: itemsData,
        },
      },
      include: { items: true },
    });

    await this.logAudit(companyId, userId, 'SALES_ORDER_CREATED', order.id);
    this.eventEmitter.emit('sales.order.created', {
      orderId: order.id,
      companyId,
    });

    return order;
  }

  async findAll(companyId: string, query: SalesOrderFilterDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      customerId,
      warehouseId,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SalesOrderWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (search) {
      where.salesNumber = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        include: { customer: true, warehouse: true },
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.salesOrder.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const order = await this.prisma.salesOrder.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        items: { include: { product: true } },
        customer: true,
        warehouse: true,
      },
    });
    if (!order) throw new NotFoundException('Sales order not found');
    return order;
  }

  async update(
    companyId: string,
    id: string,
    userId: string,
    dto: UpdateSalesOrderDto,
  ) {
    const order = await this.findOne(companyId, id);

    if (
      order.status !== SalesOrderStatus.DRAFT &&
      order.status !== SalesOrderStatus.PENDING_APPROVAL
    ) {
      throw new BadRequestException(
        'Only DRAFT or PENDING_APPROVAL orders can be edited',
      );
    }

    // Handle Status Transitions securely
    if (dto.status) {
      const validTransitions: Partial<
        Record<SalesOrderStatus, SalesOrderStatus[]>
      > = {
        [SalesOrderStatus.DRAFT]: [
          SalesOrderStatus.PENDING_APPROVAL,
          SalesOrderStatus.CANCELLED,
        ],
        [SalesOrderStatus.PENDING_APPROVAL]: [
          SalesOrderStatus.APPROVED,
          SalesOrderStatus.CANCELLED,
        ],
      };

      const allowed = validTransitions[order.status as SalesOrderStatus];
      if (!allowed || !allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Invalid status transition from ${order.status} to ${dto.status}`,
        );
      }
    }

    const updated = await this.prisma.salesOrder.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
        deliveryDate: dto.deliveryDate,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'SALES_ORDER_UPDATED', updated.id);

    if (dto.status === SalesOrderStatus.APPROVED) {
      await this.logAudit(
        companyId,
        userId,
        'SALES_ORDER_APPROVED',
        updated.id,
      );
      this.eventEmitter.emit('sales.order.approved', {
        orderId: updated.id,
        companyId,
      });
    }
    if (dto.status === SalesOrderStatus.CANCELLED) {
      await this.logAudit(
        companyId,
        userId,
        'SALES_ORDER_CANCELLED',
        updated.id,
      );
      this.eventEmitter.emit('sales.order.cancelled', {
        orderId: updated.id,
        companyId,
      });
    }

    return updated;
  }

  async issueGoods(
    companyId: string,
    id: string,
    userId: string,
    dto: GoodsIssueDto,
  ) {
    const order = await this.findOne(companyId, id);

    if (
      order.status !== SalesOrderStatus.APPROVED &&
      order.status !== SalesOrderStatus.PARTIALLY_DELIVERED
    ) {
      throw new BadRequestException(
        'Goods can only be issued for APPROVED or PARTIALLY_DELIVERED orders',
      );
    }

    return await this.prisma
      .$transaction(async (tx) => {
        for (const issueItem of dto.items) {
          const orderItem = order.items.find(
            (i) => i.id === issueItem.salesOrderItemId,
          );
          if (!orderItem)
            throw new BadRequestException(
              `Order item ${issueItem.salesOrderItemId} not found in this order`,
            );

          const remainingToDeliver =
            Number(orderItem.quantity) - Number(orderItem.deliveredQty);
          if (
            issueItem.quantityToDeliver <= 0 ||
            issueItem.quantityToDeliver > remainingToDeliver
          ) {
            throw new BadRequestException(
              `Invalid delivery quantity for product ${orderItem.product?.name}`,
            );
          }

          // Deduct inventory
          const inventory = await tx.inventory.findUnique({
            where: {
              companyId_warehouseId_productId: {
                companyId,
                warehouseId: order.warehouseId,
                productId: orderItem.productId,
              },
            },
          });

          if (
            !inventory ||
            Number(inventory.availableStock) < issueItem.quantityToDeliver
          ) {
            throw new BadRequestException(
              `Insufficient stock for product ${orderItem.product?.name} in the selected warehouse`,
            );
          }

          const newCurrentStock =
            Number(inventory.currentStock) - issueItem.quantityToDeliver;
          const newAvailableStock =
            Number(inventory.availableStock) - issueItem.quantityToDeliver;

          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              currentStock: newCurrentStock,
              availableStock: newAvailableStock,
              updatedBy: userId,
            },
          });

          // Create Stock Movement (SALE_OUT)
          await tx.stockMovement.create({
            data: {
              companyId,
              warehouseId: order.warehouseId,
              productId: orderItem.productId,
              type: MovementType.SALE_OUT,
              quantity: issueItem.quantityToDeliver,
              previousStock: inventory.currentStock,
              newStock: newCurrentStock,
              reference: order.salesNumber,
              notes: dto.notes || 'Goods Issued for Sales Order',
              createdBy: userId,
            },
          });

          // Update delivered quantity
          await tx.salesOrderItem.update({
            where: { id: orderItem.id },
            data: {
              deliveredQty:
                Number(orderItem.deliveredQty) + issueItem.quantityToDeliver,
            },
          });
        }

        // Check if completely delivered
        const updatedOrderItems = await tx.salesOrderItem.findMany({
          where: { salesOrderId: order.id },
        });
        const isComplete = updatedOrderItems.every(
          (i) => Number(i.deliveredQty) >= Number(i.quantity),
        );

        const newStatus = isComplete
          ? SalesOrderStatus.COMPLETED
          : SalesOrderStatus.PARTIALLY_DELIVERED;

        const finalOrder = await tx.salesOrder.update({
          where: { id: order.id },
          data: { status: newStatus, updatedBy: userId },
        });

        await tx.auditLog.create({
          data: {
            companyId,
            userId,
            action: 'GOODS_ISSUED',
            entity: 'SalesOrder',
            entityId: order.id,
          },
        });

        if (isComplete) {
          await tx.auditLog.create({
            data: {
              companyId,
              userId,
              action: 'SALES_ORDER_COMPLETED',
              entity: 'SalesOrder',
              entityId: order.id,
            },
          });
        }

        return finalOrder;
      })
      .then((res) => {
        this.eventEmitter.emit('sales.order.issued', {
          orderId: res.id,
          companyId,
        });
        if (res.status === SalesOrderStatus.COMPLETED) {
          this.eventEmitter.emit('sales.order.completed', {
            orderId: res.id,
            companyId,
          });
        }
        return res;
      });
  }

  private async logAudit(
    companyId: string,
    userId: string,
    action: string,
    entityId: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action,
        entity: 'SalesOrder', // Could be dynamic but here mostly called for SalesOrder
        entityId,
      },
    });
  }
}
