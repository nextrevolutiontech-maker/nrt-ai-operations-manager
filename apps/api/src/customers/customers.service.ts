import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerFilterDto } from './dto/customer-filter.dto';
import { CustomerStatus, Prisma } from '@nrt-ai-workforce/database';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(companyId: string, userId: string, dto: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({
      data: {
        ...dto,
        companyId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'CUSTOMER_CREATED', customer.id);
    return customer;
  }

  async findAll(companyId: string, query: CustomerFilterDto) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { companyName: 'asc' },
      }),
      this.prisma.customer.count({ where }),
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
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(
    companyId: string,
    id: string,
    userId: string,
    dto: UpdateCustomerDto,
  ) {
    const customer = await this.findOne(companyId, id);

    const updated = await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        ...dto,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'CUSTOMER_UPDATED', updated.id);
    return updated;
  }

  async remove(companyId: string, id: string, userId: string) {
    const customer = await this.findOne(companyId, id);

    const deleted = await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        deletedAt: new Date(),
        status: CustomerStatus.INACTIVE,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'CUSTOMER_DELETED', deleted.id);
    return deleted;
  }

  async restore(companyId: string, id: string, userId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId, deletedAt: { not: null } },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const restored = await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        deletedAt: null,
        status: CustomerStatus.ACTIVE,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'CUSTOMER_RESTORED', restored.id);
    return restored;
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
        entity: 'Customer',
        entityId,
      },
    });
  }
}
