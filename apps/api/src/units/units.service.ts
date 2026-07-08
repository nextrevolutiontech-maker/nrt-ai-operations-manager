import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateUnitDto) {
    const existing = await this.prisma.unit.findFirst({
      where: {
        symbol: dto.symbol,
        OR: [{ companyId }, { companyId: null }],
      },
    });
    if (existing) {
      throw new ConflictException(
        'A unit with this symbol already exists (either globally or in your company)',
      );
    }

    const unit = await this.prisma.unit.create({
      data: {
        ...dto,
        companyId,
        createdBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'CREATE_UNIT', unit.id);
    return unit;
  }

  async findAll(companyId: string, query: PaginationQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeDeleted,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [{ companyId }, { companyId: null }],
    };

    if (!includeDeleted) where.deletedAt = null;
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { symbol: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.unit.count({ where }),
      this.prisma.unit.findMany({
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
    const unit = await this.prisma.unit.findFirst({
      where: {
        id,
        OR: [{ companyId }, { companyId: null }],
        deletedAt: null,
      },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async update(
    companyId: string,
    id: string,
    userId: string,
    dto: UpdateUnitDto,
  ) {
    const unit = await this.findOne(companyId, id);
    if (unit.companyId === null) {
      throw new ForbiddenException('Cannot modify a global system unit');
    }

    if (dto.symbol && dto.symbol !== unit.symbol) {
      const existing = await this.prisma.unit.findFirst({
        where: { symbol: dto.symbol, OR: [{ companyId }, { companyId: null }] },
      });
      if (existing)
        throw new ConflictException('A unit with this symbol already exists');
    }

    const updated = await this.prisma.unit.update({
      where: { id },
      data: { ...dto, updatedBy: userId },
    });

    await this.logAudit(companyId, userId, 'UPDATE_UNIT', id);
    return updated;
  }

  async remove(companyId: string, id: string, userId: string) {
    const unit = await this.findOne(companyId, id);
    if (unit.companyId === null) {
      throw new ForbiddenException('Cannot delete a global system unit');
    }

    await this.prisma.unit.update({
      where: { id: unit.id },
      data: { deletedAt: new Date(), updatedBy: userId },
    });

    await this.logAudit(companyId, userId, 'DELETE_UNIT', id);
    return { message: 'Unit softly deleted' };
  }

  async restore(companyId: string, id: string, userId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, companyId, deletedAt: { not: null } },
    });
    if (!unit) throw new NotFoundException('Deleted unit not found');

    await this.prisma.unit.update({
      where: { id },
      data: { deletedAt: null, updatedBy: userId },
    });

    await this.logAudit(companyId, userId, 'RESTORE_UNIT', id);
    return { message: 'Unit restored successfully' };
  }

  private async logAudit(
    companyId: string,
    userId: string,
    action: string,
    entityId: string,
  ) {
    await this.prisma.auditLog
      .create({
        data: { companyId, userId, action, entity: 'Unit', entityId },
      })
      .catch((e: any) => console.error('Failed to log audit:', e));
  }
}
