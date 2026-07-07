import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateBrandDto) {
    const existing = await this.prisma.brand.findUnique({
      where: { companyId_name: { companyId, name: dto.name } },
    });
    if (existing) {
      throw new ConflictException('Brand with this name already exists');
    }

    const brand = await this.prisma.brand.create({
      data: {
        ...dto,
        companyId,
        createdBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'CREATE_BRAND', brand.id);
    return brand;
  }

  async findAll(companyId: string, query: PaginationQueryDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', includeDeleted } = query;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (!includeDeleted) where.deletedAt = null;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [total, data] = await Promise.all([
      this.prisma.brand.count({ where }),
      this.prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async findOne(companyId: string, id: string) {
    const brand = await this.prisma.brand.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateBrandDto) {
    const brand = await this.findOne(companyId, id);

    if (dto.name && dto.name !== brand.name) {
      const existing = await this.prisma.brand.findUnique({
        where: { companyId_name: { companyId, name: dto.name } },
      });
      if (existing) throw new ConflictException('Brand with this name already exists');
    }

    const updated = await this.prisma.brand.update({
      where: { id },
      data: { ...dto, updatedBy: userId },
    });

    await this.logAudit(companyId, userId, 'UPDATE_BRAND', id);
    return updated;
  }

  async remove(companyId: string, id: string, userId: string) {
    const brand = await this.findOne(companyId, id);

    await this.prisma.brand.update({
      where: { id: brand.id },
      data: { deletedAt: new Date(), updatedBy: userId },
    });

    await this.logAudit(companyId, userId, 'DELETE_BRAND', id);
    return { message: 'Brand softly deleted' };
  }

  async restore(companyId: string, id: string, userId: string) {
    const brand = await this.prisma.brand.findFirst({
      where: { id, companyId, deletedAt: { not: null } },
    });
    if (!brand) throw new NotFoundException('Deleted brand not found');

    await this.prisma.brand.update({
      where: { id },
      data: { deletedAt: null, updatedBy: userId },
    });

    await this.logAudit(companyId, userId, 'RESTORE_BRAND', id);
    return { message: 'Brand restored successfully' };
  }

  private async logAudit(companyId: string, userId: string, action: string, entityId: string) {
    await this.prisma.auditLog.create({
      data: { companyId, userId, action, entity: 'Brand', entityId },
    }).catch((e: any) => console.error('Failed to log audit:', e));
  }
}
