import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@nrt-ai-workforce/database';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseFilterDto } from './dto/warehouse-filter.dto';
import { PaginatedResultDto } from '../common/dto/paginated-result.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class WarehousesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    companyId: string,
    userId: string,
    createWarehouseDto: CreateWarehouseDto,
  ) {
    const existing = await this.prisma.warehouse.findUnique({
      where: { companyId_name: { companyId, name: createWarehouseDto.name } },
    });
    if (existing)
      throw new ConflictException(
        `Warehouse with name '${createWarehouseDto.name}' already exists.`,
      );

    const warehouse = await this.prisma.warehouse.create({
      data: {
        ...createWarehouseDto,
        companyId,
        createdBy: userId,
      },
    });

    await this.logAudit(
      companyId,
      userId,
      'CREATE_WAREHOUSE',
      warehouse.id,
      createWarehouseDto,
    );

    this.eventEmitter.emit('warehouse.created', {
      companyId,
      userId,
      entityId: warehouse.id,
      warehouseName: warehouse.name,
    });

    return warehouse;
  }

  async findAll(
    companyId: string,
    query: WarehouseFilterDto,
  ): Promise<PaginatedResultDto<any>> {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.WarehouseWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.warehouse.count({ where }),
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
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  async update(
    companyId: string,
    id: string,
    userId: string,
    updateWarehouseDto: UpdateWarehouseDto,
  ) {
    await this.findOne(companyId, id);

    if (updateWarehouseDto.name) {
      const existing = await this.prisma.warehouse.findFirst({
        where: { companyId, name: updateWarehouseDto.name, id: { not: id } },
      });
      if (existing)
        throw new ConflictException(
          `Warehouse with name '${updateWarehouseDto.name}' already exists.`,
        );
    }

    const updated = await this.prisma.warehouse.update({
      where: { id },
      data: { ...updateWarehouseDto, updatedBy: userId },
    });

    await this.logAudit(
      companyId,
      userId,
      'UPDATE_WAREHOUSE',
      id,
      updateWarehouseDto,
    );
    return updated;
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id);
    const deleted = await this.prisma.warehouse.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    });
    await this.logAudit(companyId, userId, 'DELETE_WAREHOUSE', id, {});
    return deleted;
  }

  async restore(companyId: string, id: string, userId: string) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, companyId, deletedAt: { not: null } },
    });
    if (!warehouse) throw new NotFoundException('Deleted Warehouse not found');

    const restored = await this.prisma.warehouse.update({
      where: { id },
      data: { deletedAt: null, updatedBy: userId },
    });
    await this.logAudit(companyId, userId, 'RESTORE_WAREHOUSE', id, {});
    return restored;
  }

  private async logAudit(
    companyId: string,
    userId: string,
    action: string,
    entityId: string,
    details: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action,
        entity: 'Warehouse',
        entityId,
        details,
      },
    });
  }
}
