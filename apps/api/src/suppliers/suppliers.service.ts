import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { SupplierStatus } from '@nrt-ai-workforce/database';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    companyId: string,
    userId: string,
    createSupplierDto: CreateSupplierDto,
  ) {
    // Check for unique name
    const existingName = await this.prisma.supplier.findUnique({
      where: {
        companyId_name: {
          companyId,
          name: createSupplierDto.name,
        },
      },
    });

    if (existingName) {
      throw new ConflictException(
        `Supplier with name ${createSupplierDto.name} already exists.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.create({
        data: {
          companyId,
          createdBy: userId,
          updatedBy: userId,
          ...createSupplierDto,
        },
      });

      await tx.auditLog.create({
        data: {
          companyId,
          userId,
          action: 'CREATE_SUPPLIER',
          entity: 'Supplier',
          entityId: supplier.id,
          details: { name: supplier.name },
        },
      });

      this.eventEmitter.emit('supplier.created', {
        companyId,
        userId,
        entityId: supplier.id,
        supplierName: supplier.name,
      });

      return supplier;
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto & { status?: SupplierStatus; search?: string },
  ) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { companyId, deletedAt: null };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { taxNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supplier.count({ where }),
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
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found.`);
    }

    return supplier;
  }

  async update(
    companyId: string,
    id: string,
    userId: string,
    updateSupplierDto: UpdateSupplierDto,
  ) {
    const supplier = await this.findOne(companyId, id);

    if (updateSupplierDto.name && updateSupplierDto.name !== supplier.name) {
      const existingName = await this.prisma.supplier.findUnique({
        where: {
          companyId_name: {
            companyId,
            name: updateSupplierDto.name,
          },
        },
      });

      if (existingName) {
        throw new ConflictException(
          `Supplier with name ${updateSupplierDto.name} already exists.`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.supplier.update({
        where: { id },
        data: {
          ...updateSupplierDto,
          updatedBy: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          companyId,
          userId,
          action: 'UPDATE_SUPPLIER',
          entity: 'Supplier',
          entityId: supplier.id,
          details: { changes: updateSupplierDto as any },
        },
      });

      return updated;
    });
  }

  async remove(companyId: string, id: string, userId: string) {
    const supplier = await this.findOne(companyId, id);

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.supplier.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          updatedBy: userId,
          status: SupplierStatus.INACTIVE,
        },
      });

      await tx.auditLog.create({
        data: {
          companyId,
          userId,
          action: 'DELETE_SUPPLIER',
          entity: 'Supplier',
          entityId: supplier.id,
        },
      });

      return deleted;
    });
  }

  async restore(companyId: string, id: string, userId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, companyId, deletedAt: { not: null } },
    });

    if (!supplier) {
      throw new NotFoundException(`Deleted Supplier with ID ${id} not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const restored = await tx.supplier.update({
        where: { id },
        data: {
          deletedAt: null,
          updatedBy: userId,
          status: SupplierStatus.ACTIVE,
        },
      });

      await tx.auditLog.create({
        data: {
          companyId,
          userId,
          action: 'RESTORE_SUPPLIER',
          entity: 'Supplier',
          entityId: supplier.id,
        },
      });

      return restored;
    });
  }
}
