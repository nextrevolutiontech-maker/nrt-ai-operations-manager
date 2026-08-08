const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*"(.*)"\s*$/) || line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) {
      process.env[match[1]] = match[2].trim();
    }
  });
}

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
console.log('Connecting to DATABASE_URL:', connectionString ? connectionString.substring(0, 45) + '...' : 'NONE');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting enterprise ERP seed script...');

  // 1. Default Company
  const company = await prisma.company.upsert({
    where: { slug: 'default-company' },
    update: {},
    create: {
      name: 'Default Company',
      slug: 'default-company',
    },
  });
  console.log(`Company: ${company.name} (${company.id})`);

  // 2. Global Units
  const unitsToCreate = [
    { name: 'Piece', symbol: 'pcs' },
    { name: 'Kilogram', symbol: 'kg' },
    { name: 'Meter', symbol: 'm' },
    { name: 'Liter', symbol: 'L' },
    { name: 'Box', symbol: 'box' },
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
  const pcsUnit = await prisma.unit.findFirst({ where: { symbol: 'pcs' } });

  // 3. Admin Role & Permissions
  const adminRole = await prisma.role.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Admin' } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Admin',
      description: 'Administrator with full operational and AI control',
    },
  });

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
    { name: 'read:operations', description: 'View operations' },
    { name: 'manage:operations', description: 'Manage operations' },
    { name: 'read:master-data', description: 'View master data' },
    { name: 'manage:notifications', description: 'Manage notifications' },
    { name: 'create:dashboard', description: 'Create dashboard' },
    { name: 'read:dashboard', description: 'View dashboards' },
    { name: 'read:analytics', description: 'View analytics' },
    { name: 'create:ai-sessions', description: 'Create AI sessions' },
    { name: 'read:ai-sessions', description: 'View AI sessions' },
    { name: 'read:ai-dashboard', description: 'View AI dashboard' },
    { name: 'manage:ai-demo', description: 'Manage AI demo scenarios' },
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
    const existingRolePerm = await prisma.rolePermission.findFirst({
      where: { roleId: adminRole.id, permissionId: permission.id },
    });
    if (!existingRolePerm) {
      await prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: permission.id },
      });
    }
  }

  // 4. Admin User
  const adminUser = await prisma.user.upsert({
    where: { companyId_email: { companyId: company.id, email: 'admin@example.com' } },
    update: {},
    create: {
      companyId: company.id,
      email: 'admin@example.com',
      passwordHash: '$2b$12$3H/4c1DEy494cgheuLf5ueTCTenbzPlG7VNgwwufpmfaT1FtJLFQy',
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

  // 5. Master Data Categories & Brands
  const categoryData = [
    { name: 'AI Hardware & Servers', description: 'High-performance AI compute boxes and GPU clusters' },
    { name: 'Laptops & Workstations', description: 'Enterprise employee laptops and engineering stations' },
    { name: 'Peripherals & Accessories', description: 'Keyboards, mice, monitors, and docks' },
    { name: 'Office Ergonomics', description: 'Ergonomic chairs, sit-stand desks, and accessories' },
  ];
  const categories = [];
  for (const c of categoryData) {
    const cat = await prisma.category.upsert({
      where: { companyId_name: { companyId: company.id, name: c.name } },
      update: {},
      create: { companyId: company.id, name: c.name, description: c.description },
    });
    categories.push(cat);
  }

  const brandData = [
    { name: 'NRT AI Systems', description: 'Next Revolution Tech Proprietary Hardware' },
    { name: 'Apple Enterprise', description: 'MacBooks, Displays, and Apple Silicon devices' },
    { name: 'Logitech Business', description: 'Professional input devices and video conferencing' },
    { name: 'Dell Technologies', description: 'Latitude & XPS enterprise laptops' },
  ];
  const brands = [];
  for (const b of brandData) {
    const brand = await prisma.brand.upsert({
      where: { companyId_name: { companyId: company.id, name: b.name } },
      update: {},
      create: { companyId: company.id, name: b.name, description: b.description },
    });
    brands.push(brand);
  }

  // 6. Products
  const productsToCreate = [
    { name: 'NRT AI Enterprise Compute Box', sku: 'NRT-SRV-900', price: 850000, cost: 620000, cat: categories[0].id, brand: brands[0].id, minStock: 5 },
    { name: 'MacBook Pro 16" M3 Max (64GB)', sku: 'APP-MBP-16', price: 950000, cost: 780000, cat: categories[1].id, brand: brands[1].id, minStock: 4 },
    { name: 'Logitech MX Master 3S Wireless Mouse', sku: 'LOG-MXM-3S', price: 32000, cost: 21000, cat: categories[2].id, brand: brands[2].id, minStock: 15 },
    { name: 'Dell XPS 15 OLED Touch Workstation', sku: 'DEL-XPS-15', price: 680000, cost: 520000, cat: categories[1].id, brand: brands[3].id, minStock: 6 },
    { name: 'NRT Ergonomic Executive Desk Chair', sku: 'NRT-CHR-EX', price: 85000, cost: 45000, cat: categories[3].id, brand: brands[0].id, minStock: 10 },
  ];

  const products = [];
  for (const p of productsToCreate) {
    const prod = await prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: p.sku } },
      update: { price: p.price, cost: p.cost },
      create: {
        companyId: company.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        cost: p.cost,
        categoryId: p.cat,
        brandId: p.brand,
        unitId: pcsUnit ? pcsUnit.id : null,
        minStockLevel: p.minStock,
      },
    });
    products.push(prod);
  }

  // 7. Warehouses
  const warehousesToCreate = [
    { name: 'Karachi Central Distribution Hub', location: 'Port Qasim Industrial Zone, Karachi' },
    { name: 'Lahore Logistics & Fulfillment Hub', location: 'Sundar Industrial Estate, Lahore' },
    { name: 'Islamabad Capital Technology Park', location: 'National Tech Park, Islamabad' },
  ];

  const warehouses = [];
  for (const w of warehousesToCreate) {
    const existing = await prisma.warehouse.findFirst({
      where: { companyId: company.id, name: w.name },
    });
    if (existing) {
      warehouses.push(existing);
    } else {
      const wh = await prisma.warehouse.create({
        data: {
          companyId: company.id,
          name: w.name,
          location: w.location,
        },
      });
      warehouses.push(wh);
    }
  }

  // 8. Inventories
  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    const wh = warehouses[i % warehouses.length];
    const available = (i + 1) * 12 + 4;
    const reserved = i * 2;

    const existingInv = await prisma.inventory.findFirst({
      where: { companyId: company.id, warehouseId: wh.id, productId: prod.id },
    });

    if (!existingInv) {
      await prisma.inventory.create({
        data: {
          companyId: company.id,
          warehouseId: wh.id,
          productId: prod.id,
          availableStock: available,
          reservedStock: reserved,
        },
      });
    }
  }

  // 9. Suppliers
  const supplierData = [
    { name: 'NRT Tech Global Direct', contactPerson: 'Asad Khan', email: 'supplies@nrt-tech.com', phone: '+92 300 1112233' },
    { name: 'Apple Wholesale Middle East', contactPerson: 'Sarah Jenkins', email: 'b2b@apple.me', phone: '+971 4 8009988' },
    { name: 'Logitech Authorized Distro', contactPerson: 'Bilal Ahmed', email: 'sales@logi-distro.pk', phone: '+92 42 35558899' },
  ];
  const suppliers = [];
  for (const s of supplierData) {
    const existing = await prisma.supplier.findFirst({
      where: { companyId: company.id, email: s.email },
    });
    if (existing) {
      suppliers.push(existing);
    } else {
      const sup = await prisma.supplier.create({
        data: {
          companyId: company.id,
          name: s.name,
          contactPerson: s.contactPerson,
          email: s.email,
          phone: s.phone,
        },
      });
      suppliers.push(sup);
    }
  }

  // 10. Customers
  const customerData = [
    { companyName: 'Haroon Traders', contactPerson: 'Haroon Rashid', email: 'contact@haroontraders.pk', phone: '+92 321 4445566', city: 'Karachi' },
    { companyName: 'Nexus AI Solutions', contactPerson: 'Dr. Tariq Mahmood', email: 'info@nexus-ai.io', phone: '+92 51 8887766', city: 'Islamabad' },
    { companyName: 'Apex Global Logistics', contactPerson: 'Zayn Malik', email: 'ops@apex-global.com', phone: '+92 42 37771122', city: 'Lahore' },
  ];
  const customers = [];
  for (const c of customerData) {
    const existing = await prisma.customer.findFirst({
      where: { companyId: company.id, companyName: c.companyName },
    });
    if (existing) {
      customers.push(existing);
    } else {
      const cust = await prisma.customer.create({
        data: {
          companyId: company.id,
          companyName: c.companyName,
          contactPerson: c.contactPerson,
          email: c.email,
          phone: c.phone,
          city: c.city,
          creditLimit: 5000000,
        },
      });
      customers.push(cust);
    }
  }

  // 11. Chart of Accounts
  const accountData = [
    { code: '1010', name: 'Meezan Bank Operations Account', type: 'ASSET' },
    { code: '1200', name: 'Accounts Receivable (Trade Debtors)', type: 'ASSET' },
    { code: '1300', name: 'Inventory Asset Account', type: 'ASSET' },
    { code: '2010', name: 'Accounts Payable (Trade Creditors)', type: 'LIABILITY' },
    { code: '3010', name: 'Owner Share Capital', type: 'EQUITY' },
    { code: '4010', name: 'Enterprise Hardware Sales Revenue', type: 'REVENUE' },
    { code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'EXPENSE' },
    { code: '6010', name: 'Logistics & Warehousing Expense', type: 'EXPENSE' },
  ];

  for (const acc of accountData) {
    await prisma.account.upsert({
      where: { companyId_accountCode: { companyId: company.id, accountCode: acc.code } },
      update: {},
      create: {
        companyId: company.id,
        accountCode: acc.code,
        accountName: acc.name,
        accountType: acc.type,
      },
    });
  }

  // 12. Purchase Orders
  const existingPO = await prisma.purchaseOrder.findFirst({ where: { companyId: company.id } });
  if (!existingPO && suppliers.length > 0 && warehouses.length > 0 && products.length > 0) {
    const po = await prisma.purchaseOrder.create({
      data: {
        companyId: company.id,
        supplierId: suppliers[0].id,
        warehouseId: warehouses[0].id,
        orderNumber: 'PO-2026-001',
        orderDate: new Date(),
        status: 'APPROVED',
        totalAmount: 1860000,
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 2,
              unitCost: 620000,
              totalPrice: 1240000,
            },
            {
              productId: products[2].id,
              quantity: 20,
              unitCost: 21000,
              totalPrice: 420000,
            },
          ],
        },
      },
    });
    console.log(`Created PO: ${po.orderNumber}`);
  }

  // 13. Sales Orders
  const existingSO = await prisma.salesOrder.findFirst({ where: { companyId: company.id } });
  if (!existingSO && customers.length > 0 && warehouses.length > 0 && products.length > 0) {
    const so = await prisma.salesOrder.create({
      data: {
        companyId: company.id,
        customerId: customers[0].id,
        warehouseId: warehouses[0].id,
        salesNumber: 'SO-2026-001',
        orderDate: new Date(),
        status: 'APPROVED',
        totalAmount: 2830000,
        items: {
          create: [
            {
              productId: products[1].id,
              quantity: 2,
              unitPrice: 950000,
              total: 1900000,
            },
            {
              productId: products[3].id,
              quantity: 1,
              unitPrice: 680000,
              total: 680000,
            },
          ],
        },
      },
    });
    console.log(`Created SO: ${so.salesNumber}`);
  }

  console.log('ERP Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
