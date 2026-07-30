import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@nrt-ai-workforce/database';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ adapter });
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
