import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
    { name: 'read:inventory', description: 'View inventory' },
    { name: 'manage:inventory', description: 'Manage inventory' },
    { name: 'read:catalog', description: 'View catalog' },
    { name: 'manage:catalog', description: 'Manage catalog' },
    { name: 'read:procurement', description: 'View procurement' },
    { name: 'manage:procurement', description: 'Manage procurement' },
    { name: 'read:sales', description: 'View sales' },
    { name: 'manage:sales', description: 'Manage sales' },
    { name: 'read:finance', description: 'View finance' },
    { name: 'manage:finance', description: 'Manage finance' },
    { name: 'read:workflows', description: 'View workflows' },
    { name: 'manage:workflows', description: 'Manage workflows' },
    { name: 'read:report', description: 'View reports' },
    { name: 'manage:report', description: 'Manage reports' },
    { name: 'export:report', description: 'Export reports' },
    { name: 'manage:notifications', description: 'Manage notifications' },
    { name: 'create:dashboard', description: 'Manage dashboard' },
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
      passwordHash: '$2b$12$3H/4c1DEy494cgheuLf5ueTCTenbzPlG7VNgwwufpmfaT1FtJLFQy', // admin123
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

  // --- DUMMY MASTER DATA SEEDING ---
  console.log('Seeding dummy Master Data...');

  // Categories
  const categoryNames = ['Electronics', 'Accessories', 'Office Supplies', 'Furniture'];
  const categories = [];
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { companyId_name: { companyId: company.id, name } },
      update: {},
      create: { companyId: company.id, name, description: `Dummy category for ${name}` },
    });
    categories.push(cat);
  }

  // Brands
  const brandNames = ['NRT Tech', 'Samsung', 'Apple', 'Dell'];
  const brands = [];
  for (const name of brandNames) {
    const brand = await prisma.brand.upsert({
      where: { companyId_name: { companyId: company.id, name } },
      update: {},
      create: { companyId: company.id, name, description: `Official ${name} products` },
    });
    brands.push(brand);
  }

  // Fetch a unit to use
  const pcsUnit = await prisma.unit.findFirst({ where: { symbol: 'pcs' } });

  // Products
  if (pcsUnit && categories.length > 0 && brands.length > 0) {
    const productsToCreate = [
      { name: 'NRT AI Server Box', sku: 'NRT-SRV-001', price: 5000, cost: 3500, catId: categories[0].id, brandId: brands[0].id },
      { name: 'Samsung 27" Monitor', sku: 'SAM-MON-27', price: 300, cost: 210, catId: categories[0].id, brandId: brands[1].id },
      { name: 'Apple Magic Keyboard', sku: 'APP-KBD-01', price: 150, cost: 90, catId: categories[1].id, brandId: brands[2].id },
      { name: 'Dell XPS 15 Laptop', sku: 'DEL-XPS-15', price: 2000, cost: 1600, catId: categories[0].id, brandId: brands[3].id },
      { name: 'Ergonomic Office Chair', sku: 'FURN-CHR-01', price: 250, cost: 120, catId: categories[3].id, brandId: brands[0].id },
    ];

    for (const p of productsToCreate) {
      await prisma.product.upsert({
        where: { companyId_sku: { companyId: company.id, sku: p.sku } },
        update: {},
        create: {
          companyId: company.id,
          name: p.name,
          sku: p.sku,
          price: p.price,
          cost: p.cost,
          categoryId: p.catId,
          brandId: p.brandId,
          unitId: pcsUnit.id,
          minStockLevel: 10,
        },
      });
    }
  }
  console.log('Dummy Master Data seeded.');

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
