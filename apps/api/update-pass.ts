import 'dotenv/config';
import { PrismaClient } from '@nrt-ai-workforce/database';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.updateMany({
    where: { email: 'admin@example.com' },
    data: { passwordHash: '$2b$12$3H/4c1DEy494cgheuLf5ueTCTenbzPlG7VNgwwufpmfaT1FtJLFQy' }
  });
  console.log('Password updated successfully');
}
main().finally(() => prisma.$disconnect());
