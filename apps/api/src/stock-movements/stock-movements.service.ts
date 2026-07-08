import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementFilterDto } from './dto/movement-filter.dto';
import { PaginatedResultDto } from '../common/dto/paginated-result.dto';
import { MovementType, Prisma } from '@nrt-ai-workforce/database';

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateMovementDto) {
    if (dto.type === MovementType.TRANSFER_OUT && !dto.targetWarehouseId) {
      throw new BadRequestException(
        'targetWarehouseId is required for TRANSFER_OUT',
      );
    }

    // Ensure product exists and belongs to company
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, companyId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.$transaction(async (tx) => {
      // Helper function to process movement logic
      const processMovement = async (
        warehouseId: string,
        type: MovementType,
        quantity: number,
        ref?: string,
        notes?: string,
      ) => {
        const warehouse = await tx.warehouse.findFirst({
          where: { id: warehouseId, companyId, deletedAt: null },
        });
        if (!warehouse)
          throw new NotFoundException(`Warehouse ${warehouseId} not found`);

        let inventory = await tx.inventory.findUnique({
          where: {
            companyId_warehouseId_productId: {
              companyId,
              warehouseId,
              productId: dto.productId,
            },
          },
        });

        if (!inventory) {
          inventory = await tx.inventory.create({
            data: {
              companyId,
              warehouseId,
              productId: dto.productId,
              minStockLevel: product.minStockLevel,
              maxStockLevel: product.maxStockLevel,
              reorderLevel: product.reorderLevel,
            },
          });
        }

        const previousStock = Number(inventory.availableStock);
        let newStock = previousStock;
        let diff = 0;

        switch (type) {
          case MovementType.OPENING_STOCK:
          case MovementType.PURCHASE_IN:
          case MovementType.MANUAL_ADJUSTMENT_UP:
          case MovementType.TRANSFER_IN:
          case MovementType.RETURN_IN:
            diff = quantity;
            break;
          case MovementType.MANUAL_ADJUSTMENT_DOWN:
          case MovementType.TRANSFER_OUT:
          case MovementType.DAMAGE:
          case MovementType.RETURN_OUT:
            diff = -quantity;
            break;
        }

        newStock += diff;
        if (newStock < 0) {
          throw new BadRequestException(
            `Insufficient stock in warehouse ${warehouseId}. Cannot perform ${type}.`,
          );
        }

        // Update inventory with Optimistic Concurrency Control
        const { count } = await tx.inventory.updateMany({
          where: { id: inventory.id, version: inventory.version },
          data: {
            currentStock: newStock,
            availableStock: newStock,
            version: { increment: 1 },
            updatedBy: userId,
          },
        });

        if (count === 0) {
          throw new ConflictException(
            `Concurrency conflict detected for warehouse ${warehouseId}. Please try again.`,
          );
        }

        // Create immutable ledger
        return tx.stockMovement.create({
          data: {
            companyId,
            warehouseId,
            productId: dto.productId,
            type,
            quantity,
            previousStock,
            newStock,
            reference: ref,
            notes,
            createdBy: userId,
          },
        });
      };

      if (dto.type === MovementType.TRANSFER_OUT) {
        // Step 1: Out from source
        const outMove = await processMovement(
          dto.warehouseId,
          MovementType.TRANSFER_OUT,
          dto.quantity,
          dto.reference,
          dto.notes,
        );
        // Step 2: In to target
        const inMove = await processMovement(
          dto.targetWarehouseId as string,
          MovementType.TRANSFER_IN,
          dto.quantity,
          dto.reference || `Transfer from ${dto.warehouseId}`,
          dto.notes,
        );
        return [outMove, inMove];
      } else {
        return processMovement(
          dto.warehouseId,
          dto.type,
          dto.quantity,
          dto.reference,
          dto.notes,
        );
      }
    });
  }

  async findAll(
    companyId: string,
    query: MovementFilterDto,
  ): Promise<PaginatedResultDto<any>> {
    const { page = 1, limit = 10, warehouseId, productId, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = { companyId };
    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          warehouse: { select: { name: true } },
        },
      }),
      this.prisma.stockMovement.count({ where }),
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
}
