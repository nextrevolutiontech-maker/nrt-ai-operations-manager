import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (e) {
      console.warn(`PrismaService connection warning: ${e}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (e) {
      // Ignore disconnect error on serverless tear-down
    }
  }
}
