import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create a Default Company
  const company = await prisma.company.upsert({
    where: { slug: 'default-company' },
    update: {},
    create: {
      name: 'Default Company',
      slug: 'default-company',
    },
  });
  console.log(`Company created: ${company.name}`);

  // 2. Create Global Units
  const unitsToCreate = [
    { name: 'Piece', symbol: 'pcs' },
    { name: 'Kilogram', symbol: 'kg' },
    { name: 'Meter', symbol: 'm' },
    { name: 'Liter', symbol: 'L' },
  ];

  for (const u of unitsToCreate) {
    const existing = await prisma.unit.findFirst({
      where: { companyId: null, symbol: u.symbol },
    });
    if (!existing) {
      await prisma.unit.create({
        data: { name: u.name, symbol: u.symbol, companyId: null },
      });
    }
  }
  console.log('Units created.');

  // 3. Create Admin Role
  const adminRole = await prisma.role.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Admin' } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Admin',
      description: 'Administrator with full access',
    },
  });
  console.log('Admin role created.');

  // 4. Create Global Permissions
  const permissionsToCreate = [
    { name: 'users:manage', description: 'Manage users' },
    { name: 'roles:manage', description: 'Manage roles and permissions' },
    { name: 'inventory:read', description: 'View inventory' },
    { name: 'inventory:write', description: 'Manage inventory' },
    { name: 'products:read', description: 'View products' },
    { name: 'products:write', description: 'Manage products' },
    { name: 'procurement:read', description: 'View purchase orders' },
    { name: 'procurement:write', description: 'Manage purchase orders' },
  ];

  for (const p of permissionsToCreate) {
    let permission = await prisma.permission.findFirst({
      where: { companyId: null, name: p.name },
    });
    if (!permission) {
      permission = await prisma.permission.create({
        data: { name: p.name, description: p.description, companyId: null },
      });
    }

    // Assign to Admin Role
    const existingRolePerm = await prisma.rolePermission.findFirst({
      where: { roleId: adminRole.id, permissionId: permission.id },
    });
    if (!existingRolePerm) {
      await prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: permission.id },
      });
    }
  }
  console.log('Permissions created and assigned.');

  // 5. Create Default Admin User
  const adminUser = await prisma.user.upsert({
    where: { companyId_email: { companyId: company.id, email: 'admin@example.com' } },
    update: {},
    create: {
      companyId: company.id,
      email: 'admin@example.com',
      passwordHash: 'hashed_password_placeholder', // Must be replaced with real hash in production
      firstName: 'System',
      lastName: 'Admin',
    },
  });

  const existingUserRole = await prisma.userRole.findFirst({
    where: { userId: adminUser.id, roleId: adminRole.id },
  });
  if (!existingUserRole) {
    await prisma.userRole.create({
      data: { userId: adminUser.id, roleId: adminRole.id },
    });
  }
  console.log('Admin user created and assigned to Admin role.');

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
