import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateCategoryDto) {
    // Check duplicate name
    const existing = await this.prisma.category.findUnique({
      where: { companyId_name: { companyId, name: dto.name } },
    });
    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    if (dto.parentId) {
      await this.validateParent(companyId, dto.parentId);
    }

    const category = await this.prisma.category.create({
      data: {
        ...dto,
        companyId,
        createdBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'CREATE_CATEGORY', category.id);
    return category;
  }

  async findAll(companyId: string, query: PaginationQueryDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', includeDeleted } = query;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [total, data] = await Promise.all([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { parent: true },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { parent: true, subCategory: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(companyId, id);

    if (dto.name && dto.name !== category.name) {
      const existing = await this.prisma.category.findUnique({
        where: { companyId_name: { companyId, name: dto.name } },
      });
      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }
      if (dto.parentId) {
        await this.validateParent(companyId, dto.parentId);
        await this.checkCircularDependency(companyId, id, dto.parentId);
      }
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...dto,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'UPDATE_CATEGORY', id);
    return updated;
  }

  async remove(companyId: string, id: string, userId: string) {
    const category = await this.findOne(companyId, id);

    await this.prisma.category.update({
      where: { id: category.id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'DELETE_CATEGORY', id);
    return { message: 'Category softly deleted' };
  }

  async restore(companyId: string, id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, companyId, deletedAt: { not: null } },
    });

    if (!category) {
      throw new NotFoundException('Deleted category not found');
    }

    await this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'RESTORE_CATEGORY', id);
    return { message: 'Category restored successfully' };
  }

  private async validateParent(companyId: string, parentId: string) {
    const parent = await this.prisma.category.findFirst({
      where: { id: parentId, companyId, deletedAt: null },
    });
    if (!parent) {
      throw new BadRequestException('Parent category not found or belongs to another company');
    }
  }

  private async checkCircularDependency(companyId: string, categoryId: string, newParentId: string) {
    let currentParentId: string | null = newParentId;

    // Traverse upwards to ensure the new parent is not a descendant of the current category
    while (currentParentId) {
      if (currentParentId === categoryId) {
        throw new BadRequestException('Circular parent-child relationship detected');
      }
      const parentNode: any = await this.prisma.category.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      });
      if (!parentNode) break;
      currentParentId = parentNode.parentId;
    }
  }

  private async logAudit(companyId: string, userId: string, action: string, entityId: string) {
    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action,
        entity: 'Category',
        entityId,
      },
    }).catch((e: any) => console.error('Failed to log audit:', e));
  }
}
