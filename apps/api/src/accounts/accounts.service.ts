import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountFilterDto } from './dto/account-filter.dto';
import { AccountStatus, Prisma } from '@nrt-ai-workforce/database';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateAccountDto) {
    if (dto.parentId) {
      const parent = await this.prisma.account.findFirst({
        where: { id: dto.parentId, companyId },
      });
      if (!parent) throw new BadRequestException('Parent account not found');
    }

    const existingCode = await this.prisma.account.findFirst({
      where: { companyId, accountCode: dto.accountCode },
    });
    if (existingCode)
      throw new BadRequestException('Account code already exists');

    const account = await this.prisma.account.create({
      data: {
        ...dto,
        companyId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'ACCOUNT_CREATED', account.id);
    return account;
  }

  async findAll(companyId: string, query: AccountFilterDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      accountType,
      parentId,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AccountWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (status) where.status = status;
    if (accountType) where.accountType = accountType;
    if (parentId !== undefined) {
      where.parentId = parentId === 'null' ? null : parentId;
    }

    if (search) {
      where.OR = [
        { accountName: { contains: search, mode: 'insensitive' } },
        { accountCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { accountCode: 'asc' },
        include: { _count: { select: { children: true } } },
      }),
      this.prisma.account.count({ where }),
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
    const account = await this.prisma.account.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { children: true, parent: true },
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async update(
    companyId: string,
    id: string,
    userId: string,
    dto: UpdateAccountDto,
  ) {
    const account = await this.findOne(companyId, id);

    if (dto.parentId) {
      if (dto.parentId === id)
        throw new BadRequestException('Account cannot be its own parent');
      const parent = await this.prisma.account.findFirst({
        where: { id: dto.parentId, companyId },
      });
      if (!parent) throw new BadRequestException('Parent account not found');
    }

    if (dto.accountCode && dto.accountCode !== account.accountCode) {
      const existingCode = await this.prisma.account.findFirst({
        where: { companyId, accountCode: dto.accountCode },
      });
      if (existingCode)
        throw new BadRequestException('Account code already exists');
    }

    const updated = await this.prisma.account.update({
      where: { id: account.id },
      data: {
        ...dto,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'ACCOUNT_UPDATED', updated.id);
    return updated;
  }

  async remove(companyId: string, id: string, userId: string) {
    const account = await this.findOne(companyId, id);

    const deleted = await this.prisma.account.update({
      where: { id: account.id },
      data: {
        deletedAt: new Date(),
        status: AccountStatus.INACTIVE,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'ACCOUNT_DELETED', deleted.id);
    return deleted;
  }

  async restore(companyId: string, id: string, userId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, companyId, deletedAt: { not: null } },
    });
    if (!account) throw new NotFoundException('Account not found');

    const restored = await this.prisma.account.update({
      where: { id: account.id },
      data: {
        deletedAt: null,
        status: AccountStatus.ACTIVE,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'ACCOUNT_RESTORED', restored.id);
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
        entity: 'Account',
        entityId,
      },
    });
  }
}
