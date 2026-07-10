import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateJournalDto,
  CreateJournalEntryDto,
} from './dto/create-journal.dto';
import { JournalFilterDto } from './dto/journal-filter.dto';
import { JournalStatus, Prisma } from '@nrt-ai-workforce/database';
import { Decimal } from 'decimal.js';

@Injectable()
export class JournalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateJournalDto) {
    // 1. Validation: Basic Empty Checks
    if (!dto.entries || dto.entries.length === 0) {
      throw new BadRequestException('Journal must contain entries');
    }

    // 2. Aggregate / Merge Strategy
    // Business Rule: We merge duplicate account entries within the same journal instruction.
    const aggregatedEntriesMap = new Map<string, CreateJournalEntryDto>();
    for (const entry of dto.entries) {
      if (aggregatedEntriesMap.has(entry.accountId)) {
        const existing = aggregatedEntriesMap.get(entry.accountId)!;
        existing.debit = new Decimal(existing.debit)
          .plus(new Decimal(entry.debit))
          .toNumber();
        existing.credit = new Decimal(existing.credit)
          .plus(new Decimal(entry.credit))
          .toNumber();
      } else {
        aggregatedEntriesMap.set(entry.accountId, { ...entry });
      }
    }
    const finalEntries = Array.from(aggregatedEntriesMap.values());

    // 3. Validation: Debit = Credit
    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    for (const entry of finalEntries) {
      totalDebit = totalDebit.plus(new Decimal(entry.debit));
      totalCredit = totalCredit.plus(new Decimal(entry.credit));
    }

    if (!totalDebit.equals(totalCredit)) {
      throw new BadRequestException(
        `Journal is unbalanced. Total Debit (${totalDebit.toString()}) does not equal Total Credit (${totalCredit.toString()})`,
      );
    }

    // 4. Validation: Verify all accounts exist, belong to company, and are leaf accounts.
    const accountIds = finalEntries.map((e) => e.accountId);
    const accounts = await this.prisma.account.findMany({
      where: { id: { in: accountIds }, companyId, deletedAt: null },
      include: { _count: { select: { children: true } } },
    });

    if (accounts.length !== accountIds.length) {
      throw new BadRequestException(
        'One or more accounts are invalid, do not exist, or do not belong to the company',
      );
    }

    const summaryAccounts = accounts.filter((a) => a._count.children > 0);
    if (summaryAccounts.length > 0) {
      throw new BadRequestException(
        `Cannot post to summary (parent) accounts: ${summaryAccounts.map((a) => a.accountCode).join(', ')}`,
      );
    }

    // Generate Journal Number
    const count = await this.prisma.journal.count({ where: { companyId } });
    const journalNumber = `JRNL-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    // 5. Create Journal
    const journal = await this.prisma.journal.create({
      data: {
        companyId,
        journalNumber,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        postingDate: dto.postingDate,
        description: dto.description,
        createdBy: userId,
        updatedBy: userId,
        entries: {
          create: finalEntries.map((e) => ({
            accountId: e.accountId,
            debit: e.debit,
            credit: e.credit,
            description: e.description,
          })),
        },
      },
      include: { entries: true },
    });

    await this.logAudit(companyId, userId, 'JOURNAL_CREATED', journal.id);
    return journal;
  }

  async postJournal(companyId: string, id: string, userId: string) {
    const journal = await this.prisma.journal.findFirst({
      where: { id, companyId },
    });

    if (!journal) throw new NotFoundException('Journal not found');
    if (journal.status === JournalStatus.POSTED) {
      throw new BadRequestException('Journal is already posted and immutable');
    }

    const posted = await this.prisma.journal.update({
      where: { id: journal.id },
      data: {
        status: JournalStatus.POSTED,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'JOURNAL_POSTED', posted.id);
    return posted;
  }

  async findAll(companyId: string, query: JournalFilterDto) {
    const { page = 1, limit = 10, referenceType, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.JournalWhereInput = { companyId };

    if (status) where.status = status;
    if (referenceType) where.referenceType = referenceType;

    const [data, total] = await Promise.all([
      this.prisma.journal.findMany({
        where,
        include: { entries: { include: { account: true } } },
        skip: Number(skip),
        take: Number(limit),
        orderBy: { postingDate: 'desc' },
      }),
      this.prisma.journal.count({ where }),
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

  async findOne(companyId: string, id: string, userId: string) {
    const journal = await this.prisma.journal.findFirst({
      where: { id, companyId },
      include: { entries: { include: { account: true } } },
    });
    if (!journal) throw new NotFoundException('Journal not found');

    // Fire & Forget Audit for Journal Viewed
    this.logAudit(companyId, userId, 'JOURNAL_VIEWED', journal.id).catch(
      () => {},
    );

    return journal;
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
        entity: 'Journal',
        entityId,
      },
    });
  }
}
