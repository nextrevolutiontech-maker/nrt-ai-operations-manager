import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ReceiveGoodsDto } from './dto/receive-goods.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import {
  POStatus,
  MovementType,
  Prisma,
  RequestStatus,
} from '@nrt-ai-workforce/database';
import { ApprovalsService } from '../approvals/approvals.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvalsService: ApprovalsService,
  ) {}

  private async generatePurchaseNumber(
    companyId: string,
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const prefix = `PO-${dateStr}-`;

    const lastPo = await tx.purchaseOrder.findFirst({
      where: { companyId, orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: 'desc' },
    });

    if (!lastPo) {
      return `${prefix}000001`;
    }

    const sequence = parseInt(lastPo.orderNumber.replace(prefix, ''), 10);
    const nextSequence = (sequence + 1).toString().padStart(6, '0');
    return `${prefix}${nextSequence}`;
  }

  async create(companyId: string, userId: string, dto: CreatePurchaseOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // Validate Supplier
      const supplier = await tx.supplier.findUnique({
        where: { id: dto.supplierId, companyId },
      });
      if (!supplier || supplier.deletedAt)
        throw new NotFoundException('Supplier not found');

      // Validate Warehouse
      const warehouse = await tx.warehouse.findUnique({
        where: { id: dto.warehouseId, companyId },
      });
      if (!warehouse || warehouse.deletedAt)
        throw new NotFoundException('Warehouse not found');

      // Validate Products and Compute Totals
      let grandTotal = 0;
      const itemsToCreate = [];

      for (const itemDto of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: itemDto.productId, companyId },
        });
        if (!product || product.deletedAt)
          throw new NotFoundException(`Product ${itemDto.productId} not found`);

        const quantity = Number(itemDto.quantity);
        const unitCost = Number(itemDto.unitCost);
        const discountPct = Number(itemDto.discount || 0);
        const taxPct = Number(itemDto.tax || 0);

        const subtotal = quantity * unitCost;
        const discountAmount = subtotal * (discountPct / 100);
        const subtotalAfterDiscount = subtotal - discountAmount;
        const taxAmount = subtotalAfterDiscount * (taxPct / 100);
        const totalPrice = subtotalAfterDiscount + taxAmount;

        grandTotal += totalPrice;

        itemsToCreate.push({
          productId: itemDto.productId,
          quantity,
          unitCost,
          discount: discountPct,
          tax: taxPct,
          totalPrice,
          receivedQuantity: 0,
        });
      }

      const orderNumber = await this.generatePurchaseNumber(companyId, tx);

      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          companyId,
          orderNumber,
          supplierId: dto.supplierId,
          warehouseId: dto.warehouseId,
          orderDate: new Date(dto.orderDate),
          expectedDeliveryDate: dto.expectedDeliveryDate
            ? new Date(dto.expectedDeliveryDate)
            : null,
          status: POStatus.DRAFT,
          notes: dto.notes,
          totalAmount: grandTotal,
          createdBy: userId,
          updatedBy: userId,
          items: {
            create: itemsToCreate,
          },
        },
        include: { items: true },
      });

      await tx.auditLog.create({
        data: {
          companyId,
          userId,
          action: 'CREATE_PO',
          entity: 'PurchaseOrder',
          entityId: purchaseOrder.id,
          details: { orderNumber },
        },
      });

      return purchaseOrder;
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto & {
      status?: POStatus;
      supplierId?: string;
      warehouseId?: string;
      search?: string;
    },
  ) {
    const {
      page = 1,
      limit = 10,
      status,
      supplierId,
      warehouseId,
      search,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (search) where.orderNumber = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: { select: { name: true } },
          warehouse: { select: { name: true } },
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
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
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, companyId },
      include: {
        items: { include: { product: true } },
        supplier: true,
        warehouse: true,
      },
    });

    if (!po) throw new NotFoundException('Purchase Order not found');
    return po;
  }

  async updateStatus(
    companyId: string,
    id: string,
    userId: string,
    newStatus: POStatus,
  ) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, companyId },
    });
    if (!po) throw new NotFoundException('Purchase Order not found');

    const currentStatus = po.status;

    // Strict Transitions
    const allowedTransitions: Record<string, string[]> = {
      [POStatus.DRAFT]: [POStatus.PENDING_APPROVAL, POStatus.CANCELLED],
      [POStatus.PENDING_APPROVAL]: [POStatus.APPROVED, POStatus.CANCELLED],
      [POStatus.APPROVED]: [POStatus.PARTIALLY_RECEIVED, POStatus.COMPLETED],
      [POStatus.PARTIALLY_RECEIVED]: [POStatus.COMPLETED],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }

    if (
      currentStatus === POStatus.DRAFT &&
      newStatus === POStatus.PENDING_APPROVAL
    ) {
      // Auto-trigger workflow engine
      await this.approvalsService.createRequest(
        companyId,
        'PROCUREMENT',
        'PurchaseOrder',
        id,
        userId,
      );
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: newStatus, updatedBy: userId },
    });

    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action: 'UPDATE_PO_STATUS',
        entity: 'PurchaseOrder',
        entityId: id,
        details: { from: currentStatus, to: newStatus },
      },
    });

    return updated;
  }

  async receiveGoods(
    companyId: string,
    id: string,
    userId: string,
    dto: ReceiveGoodsDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findFirst({
        where: { id, companyId },
        include: { items: true },
      });

      if (!po) throw new NotFoundException('Purchase Order not found');
      if (
        po.status !== POStatus.APPROVED &&
        po.status !== POStatus.PARTIALLY_RECEIVED
      ) {
        throw new BadRequestException(
          'Purchase Order must be APPROVED or PARTIALLY_RECEIVED to receive goods',
        );
      }

      for (const receiveItem of dto.items) {
        const item = po.items.find((i) => i.id === receiveItem.purchaseItemId);
        if (!item)
          throw new BadRequestException(
            `Item ${receiveItem.purchaseItemId} not in this PO`,
          );

        const remainingQty =
          Number(item.quantity) - Number(item.receivedQuantity);
        if (
          receiveItem.quantityToReceive <= 0 ||
          receiveItem.quantityToReceive > remainingQty
        ) {
          throw new BadRequestException(
            `Invalid receive quantity for item ${item.id}. Max allowed: ${remainingQty}`,
          );
        }

        // 1. Update PurchaseItem
        await tx.purchaseItem.update({
          where: { id: item.id },
          data: {
            receivedQuantity: { increment: receiveItem.quantityToReceive },
            updatedBy: userId,
          },
        });

        // 2. Upsert Inventory & Optimistic Lock update
        let inventory = await tx.inventory.findUnique({
          where: {
            companyId_warehouseId_productId: {
              companyId,
              warehouseId: po.warehouseId,
              productId: item.productId,
            },
          },
        });

        const qtyToRcv = new Prisma.Decimal(receiveItem.quantityToReceive);
        let previousStock = new Prisma.Decimal(0);
        let newStock = qtyToRcv;

        if (!inventory) {
          inventory = await tx.inventory.create({
            data: {
              companyId,
              warehouseId: po.warehouseId,
              productId: item.productId,
              currentStock: qtyToRcv,
              availableStock: qtyToRcv,
              createdBy: userId,
              updatedBy: userId,
            },
          });
        } else {
          previousStock = inventory.currentStock;
          newStock = previousStock.plus(qtyToRcv);

          const { count } = await tx.inventory.updateMany({
            where: { id: inventory.id, version: inventory.version },
            data: {
              currentStock: { increment: qtyToRcv },
              availableStock: { increment: qtyToRcv },
              version: { increment: 1 },
              updatedBy: userId,
            },
          });

          if (count === 0)
            throw new ConflictException(
              `Inventory update conflict for product ${item.productId}`,
            );
        }

        // 3. Create Stock Movement
        await tx.stockMovement.create({
          data: {
            companyId,
            warehouseId: po.warehouseId,
            productId: item.productId,
            type: MovementType.PURCHASE_IN,
            quantity: qtyToRcv,
            previousStock,
            newStock,
            reference: po.orderNumber,
            notes: `Received from PO ${po.orderNumber}`,
            createdBy: userId,
          },
        });
      }

      // Re-evaluate PO Status
      const updatedPoItems = await tx.purchaseItem.findMany({
        where: { purchaseOrderId: id },
      });
      const allReceived = updatedPoItems.every(
        (i) => Number(i.quantity) === Number(i.receivedQuantity),
      );

      const newStatus = allReceived
        ? POStatus.COMPLETED
        : POStatus.PARTIALLY_RECEIVED;

      if (newStatus !== po.status) {
        await tx.purchaseOrder.update({
          where: { id },
          data: { status: newStatus, updatedBy: userId },
        });
      }

      await tx.auditLog.create({
        data: {
          companyId,
          userId,
          action: 'RECEIVE_PO_GOODS',
          entity: 'PurchaseOrder',
          entityId: id,
          details: { status: newStatus },
        },
      });

      return { success: true, status: newStatus };
    });
  }

  @OnEvent('approval.completed')
  async handleApprovalCompleted(payload: {
    requestId: string;
    entityType: string;
    entityId: string;
    status: RequestStatus;
  }) {
    if (payload.entityType !== 'PurchaseOrder') return;

    const poId = payload.entityId;
    let newStatus: POStatus | null = null;

    if (payload.status === RequestStatus.APPROVED) {
      newStatus = POStatus.APPROVED;
    } else if (
      payload.status === RequestStatus.REJECTED ||
      payload.status === RequestStatus.RETURNED
    ) {
      newStatus = POStatus.DRAFT;
    }

    if (newStatus) {
      const po = await this.prisma.purchaseOrder.findUnique({
        where: { id: poId },
      });
      if (po) {
        await this.prisma.purchaseOrder.update({
          where: { id: poId },
          data: { status: newStatus },
        });

        await this.prisma.auditLog.create({
          data: {
            companyId: po.companyId,
            action: 'EVENT_UPDATE_PO_STATUS',
            entity: 'PurchaseOrder',
            entityId: poId,
            details: { reason: 'Approval Engine Completed', status: newStatus },
          },
        });
      }
    }
  }
}
