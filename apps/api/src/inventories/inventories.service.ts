import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@nrt-ai-workforce/database';
import { InventoryFilterDto } from './dto/inventory-filter.dto';
import { PaginatedResultDto } from '../common/dto/paginated-result.dto';

@Injectable()
export class InventoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    companyId: string,
    query: InventoryFilterDto,
  ): Promise<PaginatedResultDto<any>> {
    const {
      page = 1,
      limit = 10,
      warehouseId,
      productId,
      lowStock,
      outOfStock,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryWhereInput = { companyId };

    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;

    const inventories = await this.prisma.inventory.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { updatedAt: 'desc' },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            cost: true,
            price: true,
            unit: { select: { symbol: true } },
          },
        },
        warehouse: {
          select: { name: true },
        },
      },
    });

    const total = await this.prisma.inventory.count({ where });

    const mapped = inventories.map((inv) => {
      const current = Number(inv.currentStock);
      const cost = Number(inv.product.cost);

      const isLowStock = current > 0 && current <= Number(inv.minStockLevel);
      const isOutOfStock = current <= 0;

      return {
        ...inv,
        valuation: current * cost,
        status: isOutOfStock
          ? 'OUT_OF_STOCK'
          : isLowStock
            ? 'LOW_STOCK'
            : 'IN_STOCK',
      };
    });

    let filteredData = mapped;
    if (outOfStock) {
      filteredData = filteredData.filter((i) => i.status === 'OUT_OF_STOCK');
    } else if (lowStock) {
      filteredData = filteredData.filter((i) => i.status === 'LOW_STOCK');
    }

    return {
      data: filteredData,
      meta: {
        total:
          filteredData.length < limit && page === 1
            ? filteredData.length
            : total,
        page: Number(page),
        limit: Number(limit),
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const inventory = await this.prisma.inventory.findFirst({
      where: { id, companyId },
      include: {
        product: true,
        warehouse: true,
      },
    });

    if (!inventory) throw new NotFoundException('Inventory record not found');

    const current = Number(inventory.currentStock);
    const cost = Number(inventory.product.cost);

    return {
      ...inventory,
      valuation: current * cost,
      status:
        current <= 0
          ? 'OUT_OF_STOCK'
          : current <= Number(inventory.minStockLevel)
            ? 'LOW_STOCK'
            : 'IN_STOCK',
    };
  }
}
