import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateProductDto) {
    // Auto-generate SKU if missing
    if (!dto.sku) {
      dto.sku = `PRD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    // Uniqueness Checks
    const [existingSku, existingBarcode] = await Promise.all([
      this.prisma.product.findUnique({ where: { companyId_sku: { companyId, sku: dto.sku } } }),
      dto.barcode
        ? this.prisma.product.findUnique({ where: { companyId_barcode: { companyId, barcode: dto.barcode } } })
        : null,
    ]);

    if (existingSku) throw new ConflictException('Product with this SKU already exists');
    if (existingBarcode) throw new ConflictException('Product with this barcode already exists');

    // Relation Validations
    await this.validateRelations(companyId, dto.categoryId, dto.brandId, dto.unitId);

    const product = await this.prisma.product.create({
      data: {
        ...dto,
        sku: dto.sku!, // Assured to be string due to above check
        companyId,
        createdBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'CREATE_PRODUCT', product.id);
    return product;
  }

  async findAll(companyId: string, query: ProductFilterDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', includeDeleted, categoryId, brandId, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (!includeDeleted) where.deletedAt = null;
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
      if (search.length > 2) {
        where.OR.push({ barcode: { contains: search, mode: 'insensitive' } });
      }
    }

    const [total, data] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          unit: { select: { id: true, name: true, symbol: true } },
        },
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async findOne(companyId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        category: true,
        brand: true,
        unit: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateProductDto) {
    const product = await this.findOne(companyId, id);

    if (dto.sku && dto.sku !== product.sku) {
      const existing = await this.prisma.product.findUnique({ where: { companyId_sku: { companyId, sku: dto.sku } } });
      if (existing) throw new ConflictException('Product with this SKU already exists');
    }

    if (dto.barcode && dto.barcode !== product.barcode) {
      const existing = await this.prisma.product.findUnique({ where: { companyId_barcode: { companyId, barcode: dto.barcode } } });
      if (existing) throw new ConflictException('Product with this barcode already exists');
    }

    await this.validateRelations(
      companyId,
      dto.categoryId !== undefined ? dto.categoryId : product.categoryId,
      dto.brandId !== undefined ? dto.brandId : product.brandId,
      dto.unitId || product.unitId
    );

    const updated = await this.prisma.product.update({
      where: { id },
      data: { ...dto, updatedBy: userId },
    });

    await this.logAudit(companyId, userId, 'UPDATE_PRODUCT', id);
    return updated;
  }

  async remove(companyId: string, id: string, userId: string) {
    const product = await this.findOne(companyId, id);

    await this.prisma.product.update({
      where: { id: product.id },
      data: { deletedAt: new Date(), updatedBy: userId },
    });

    await this.logAudit(companyId, userId, 'DELETE_PRODUCT', id);
    return { message: 'Product softly deleted' };
  }

  async restore(companyId: string, id: string, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId, deletedAt: { not: null } },
    });
    if (!product) throw new NotFoundException('Deleted product not found');

    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: null, updatedBy: userId },
    });

    await this.logAudit(companyId, userId, 'RESTORE_PRODUCT', id);
    return { message: 'Product restored successfully' };
  }

  private async validateRelations(companyId: string, categoryId?: string | null, brandId?: string | null, unitId?: string) {
    if (categoryId) {
      const cat = await this.prisma.category.findFirst({ where: { id: categoryId, companyId, deletedAt: null } });
      if (!cat) throw new BadRequestException('Invalid or inaccessible category');
    }
    if (brandId) {
      const brand = await this.prisma.brand.findFirst({ where: { id: brandId, companyId, deletedAt: null } });
      if (!brand) throw new BadRequestException('Invalid or inaccessible brand');
    }
    if (unitId) {
      const unit = await this.prisma.unit.findFirst({
        where: { id: unitId, OR: [{ companyId }, { companyId: null }], deletedAt: null },
      });
      if (!unit) throw new BadRequestException('Invalid or inaccessible unit');
    }
  }

  private async logAudit(companyId: string, userId: string, action: string, entityId: string) {
    await this.prisma.auditLog.create({
      data: { companyId, userId, action, entity: 'Product', entityId },
    }).catch((e: any) => console.error('Failed to log audit:', e));
  }
}
