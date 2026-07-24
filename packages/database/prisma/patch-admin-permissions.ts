import { PrismaClient } from '@prisma/client';
const { Pool } = require('pg');
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting permissions patch...');

  const company = await prisma.company.findFirst({
    where: { slug: 'default-company' },
  });

  if (!company) {
    console.error('Default company not found.');
    process.exit(1);
  }

  const adminRole = await prisma.role.findFirst({
    where: { companyId: company.id, name: 'Admin' },
  });

  if (!adminRole) {
    console.error('Admin role not found.');
    process.exit(1);
  }

  const permissionsToCreate = [
    { name: 'create:dashboard', description: 'Create dashboard' },
    { name: 'read:dashboard', description: 'View dashboards' },
    { name: 'update:dashboard', description: 'Update dashboards' },
    { name: 'delete:dashboard', description: 'Delete dashboards' },
    { name: 'read:analytics', description: 'View analytics' },
    { name: 'create:ai-sessions', description: 'Create AI sessions' },
    { name: 'read:ai-sessions', description: 'View AI sessions' },
    { name: 'create:ai-action-approvals', description: 'Request AI approvals' },
    { name: 'read:ai-action-approvals', description: 'View AI approvals' },
  ];

  for (const p of permissionsToCreate) {
    let permission = await prisma.permission.findFirst({
      where: { companyId: null, name: p.name },
    });
    
    if (!permission) {
      permission = await prisma.permission.create({
        data: { name: p.name, description: p.description, companyId: null },
      });
      console.log(`Created permission: ${p.name}`);
    }

    // Assign to Admin Role
    const existingRolePerm = await prisma.rolePermission.findFirst({
      where: { roleId: adminRole.id, permissionId: permission.id },
    });
    
    if (!existingRolePerm) {
      await prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: permission.id },
      });
      console.log(`Assigned permission to Admin: ${p.name}`);
    }
  }

  console.log('Patch completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
