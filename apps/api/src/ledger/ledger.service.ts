import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerStatementDto } from './dto/ledger-statement.dto';
import { JournalStatus, AccountType } from '@nrt-ai-workforce/database';
import { Decimal } from 'decimal.js';

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatement(companyId: string, query: LedgerStatementDto) {
    const { accountId, startDate, endDate } = query;

    const account = await this.prisma.account.findFirst({
      where: { id: accountId, companyId },
    });

    if (!account) throw new NotFoundException('Account not found');

    // Determine normal balance logic (Debit increases vs Credit increases)
    const isDebitNormal =
      account.accountType === AccountType.ASSET ||
      account.accountType === AccountType.EXPENSE;

    // 1. Calculate Opening Balance (all POSTED entries strictly before startDate)
    const openingEntries = await this.prisma.journalEntry.findMany({
      where: {
        accountId,
        journal: {
          companyId,
          status: JournalStatus.POSTED,
          postingDate: { lt: new Date(startDate) },
        },
      },
    });

    let openingBalance = new Decimal(0);
    for (const entry of openingEntries) {
      if (isDebitNormal) {
        openingBalance = openingBalance.plus(entry.debit).minus(entry.credit);
      } else {
        openingBalance = openingBalance.plus(entry.credit).minus(entry.debit);
      }
    }

    // 2. Fetch Period Transactions (all POSTED entries between startDate and endDate)
    const periodEntries = await this.prisma.journalEntry.findMany({
      where: {
        accountId,
        journal: {
          companyId,
          status: JournalStatus.POSTED,
          postingDate: { gte: new Date(startDate), lte: new Date(endDate) },
        },
      },
      include: {
        journal: true,
      },
      orderBy: {
        journal: { postingDate: 'asc' },
      },
    });

    // 3. Compute Running Balance and format transactions
    let runningBalance = openingBalance;
    const transactions = periodEntries.map((entry) => {
      if (isDebitNormal) {
        runningBalance = runningBalance.plus(entry.debit).minus(entry.credit);
      } else {
        runningBalance = runningBalance.plus(entry.credit).minus(entry.debit);
      }

      return {
        date: entry.journal.postingDate,
        journalNumber: entry.journal.journalNumber,
        referenceType: entry.journal.referenceType,
        referenceId: entry.journal.referenceId,
        description: entry.description || entry.journal.description,
        debit: Number(entry.debit),
        credit: Number(entry.credit),
        balance: runningBalance.toNumber(),
      };
    });

    return {
      account: {
        code: account.accountCode,
        name: account.accountName,
        type: account.accountType,
      },
      period: {
        startDate,
        endDate,
      },
      openingBalance: openingBalance.toNumber(),
      closingBalance: runningBalance.toNumber(),
      transactions,
    };
  }
}
