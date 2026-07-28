import 'dotenv/config';
import { PrismaClient } from '@nrt-ai-workforce/database';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL as string;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Comprehensive Real Database Seeding for NRT Operations Manager...');

  // 1. Get or Create Company
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'NRT Enterprise Solutions',
        slug: 'nrt-enterprise',
      },
    });
    console.log('✅ Created Company:', company.name);
  } else {
    console.log('ℹ️ Found Existing Company:', company.name);
  }

  const companyId = company.id;

  // Find or Create System User
  let user = await prisma.user.findFirst({ where: { companyId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        companyId,
        email: 'admin@nrt-enterprise.com',
        passwordHash: 'hashed_admin_pass',
        firstName: 'System',
        lastName: 'Admin',
      },
    });
  }
  const userId = user.id;

  // 2. Units
  const unitPcs = await prisma.unit.upsert({
    where: { companyId_symbol: { companyId, symbol: 'pcs' } },
    update: {},
    create: {
      companyId,
      name: 'Pieces',
      symbol: 'pcs',
    },
  });

  // 3. Categories
  const catMobiles = await prisma.category.upsert({
    where: { companyId_name: { companyId, name: 'Mobiles & Smartphones' } },
    update: {},
    create: { companyId, name: 'Mobiles & Smartphones', description: 'Flagship & Mid-range Smartphones' },
  });

  const catLaptops = await prisma.category.upsert({
    where: { companyId_name: { companyId, name: 'Laptops & Computers' } },
    update: {},
    create: { companyId, name: 'Laptops & Computers', description: 'High performance laptops & workstations' },
  });

  const catAudio = await prisma.category.upsert({
    where: { companyId_name: { companyId, name: 'Audio & Accessories' } },
    update: {},
    create: { companyId, name: 'Audio & Accessories', description: 'Noise cancelling headphones & peripherals' },
  });

  // 4. Brands
  const brandApple = await prisma.brand.upsert({
    where: { companyId_name: { companyId, name: 'Apple' } },
    update: {},
    create: { companyId, name: 'Apple' },
  });

  const brandSamsung = await prisma.brand.upsert({
    where: { companyId_name: { companyId, name: 'Samsung' } },
    update: {},
    create: { companyId, name: 'Samsung' },
  });

  const brandDell = await prisma.brand.upsert({
    where: { companyId_name: { companyId, name: 'Dell' } },
    update: {},
    create: { companyId, name: 'Dell' },
  });

  const brandSony = await prisma.brand.upsert({
    where: { companyId_name: { companyId, name: 'Sony' } },
    update: {},
    create: { companyId, name: 'Sony' },
  });

  const brandLogitech = await prisma.brand.upsert({
    where: { companyId_name: { companyId, name: 'Logitech' } },
    update: {},
    create: { companyId, name: 'Logitech' },
  });

  // 5. Warehouses
  const whKarachi = await prisma.warehouse.upsert({
    where: { companyId_name: { companyId, name: 'Karachi Central Warehouse (WH-KHI-01)' } },
    update: {},
    create: {
      companyId,
      name: 'Karachi Central Warehouse (WH-KHI-01)',
      location: 'Site Area, Karachi',
      status: 'ACTIVE',
    },
  });

  const whLahore = await prisma.warehouse.upsert({
    where: { companyId_name: { companyId, name: 'Lahore Logistics Hub (WH-LHR-01)' } },
    update: {},
    create: {
      companyId,
      name: 'Lahore Logistics Hub (WH-LHR-01)',
      location: 'Sundar Industrial Estate, Lahore',
      status: 'ACTIVE',
    },
  });

  // 6. Products
  const productsData = [
    {
      sku: 'APL-IP15P-256',
      name: 'iPhone 15 Pro Max (256GB Natural Titanium)',
      description: 'Apple flagship smartphone with A17 Pro chip & Titanium chassis',
      price: 450000,
      cost: 410000,
      minStockLevel: 5,
      reorderLevel: 10,
      categoryId: catMobiles.id,
      brandId: brandApple.id,
      unitId: unitPcs.id,
      stockKHI: 25,
      stockLHR: 10,
    },
    {
      sku: 'SAM-S24U-512',
      name: 'Samsung Galaxy S24 Ultra (512GB Titanium Black)',
      description: 'Galaxy AI smartphone with S-Pen & 200MP Quad Camera System',
      price: 420000,
      cost: 380000,
      minStockLevel: 4,
      reorderLevel: 8,
      categoryId: catMobiles.id,
      brandId: brandSamsung.id,
      unitId: unitPcs.id,
      stockKHI: 18,
      stockLHR: 8,
    },
    {
      sku: 'DEL-XPS15-i9',
      name: 'Dell XPS 15 Laptop (Intel i9, 32GB RAM, 1TB SSD)',
      description: 'Premium creator laptop with 3.5K OLED touch display',
      price: 550000,
      cost: 490000,
      minStockLevel: 2,
      reorderLevel: 5,
      categoryId: catLaptops.id,
      brandId: brandDell.id,
      unitId: unitPcs.id,
      stockKHI: 8,
      stockLHR: 4,
    },
    {
      sku: 'SNY-WH1000XM5',
      name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
      description: 'Industry-leading noise cancellation headphones with 30-hour battery',
      price: 95000,
      cost: 80000,
      minStockLevel: 10,
      reorderLevel: 15,
      categoryId: catAudio.id,
      brandId: brandSony.id,
      unitId: unitPcs.id,
      stockKHI: 35,
      stockLHR: 15,
    },
    {
      sku: 'LOG-MXM3S',
      name: 'Logitech MX Master 3S Wireless Performance Mouse',
      description: 'Quiet click ergonomic mouse with 8K DPI tracking for power users',
      price: 28000,
      cost: 22000,
      minStockLevel: 8,
      reorderLevel: 12,
      categoryId: catAudio.id,
      brandId: brandLogitech.id,
      unitId: unitPcs.id,
      stockKHI: 3, // LOW STOCK ALERT!
      stockLHR: 2,
    },
    {
      sku: 'APL-MBP16-M3',
      name: 'MacBook Pro 16-inch M3 Max (36GB RAM, 1TB SSD)',
      description: 'Pro workstation laptop for developers & video editors',
      price: 890000,
      cost: 810000,
      minStockLevel: 3,
      reorderLevel: 5,
      categoryId: catLaptops.id,
      brandId: brandApple.id,
      unitId: unitPcs.id,
      stockKHI: 6,
      stockLHR: 2,
    },
  ];

  console.log('📦 Seeding Products & Inventory Stock...');

  for (const item of productsData) {
    const product = await prisma.product.upsert({
      where: { companyId_sku: { companyId, sku: item.sku } },
      update: {
        price: item.price,
        cost: item.cost,
        name: item.name,
      },
      create: {
        companyId,
        sku: item.sku,
        name: item.name,
        description: item.description,
        price: item.price,
        cost: item.cost,
        minStockLevel: item.minStockLevel,
        reorderLevel: item.reorderLevel,
        categoryId: item.categoryId,
        brandId: item.brandId,
        unitId: item.unitId,
        status: 'ACTIVE',
      },
    });

    // Inventory Karachi
    await prisma.inventory.upsert({
      where: {
        companyId_warehouseId_productId: {
          companyId,
          warehouseId: whKarachi.id,
          productId: product.id,
        },
      },
      update: {
        currentStock: item.stockKHI,
        availableStock: item.stockKHI,
      },
      create: {
        companyId,
        warehouseId: whKarachi.id,
        productId: product.id,
        currentStock: item.stockKHI,
        availableStock: item.stockKHI,
      },
    });

    // Inventory Lahore
    await prisma.inventory.upsert({
      where: {
        companyId_warehouseId_productId: {
          companyId,
          warehouseId: whLahore.id,
          productId: product.id,
        },
      },
      update: {
        currentStock: item.stockLHR,
        availableStock: item.stockLHR,
      },
      create: {
        companyId,
        warehouseId: whLahore.id,
        productId: product.id,
        currentStock: item.stockLHR,
        availableStock: item.stockLHR,
      },
    });

    // Stock Movements
    await prisma.stockMovement.create({
      data: {
        companyId,
        warehouseId: whKarachi.id,
        productId: product.id,
        type: 'OPENING_STOCK',
        quantity: item.stockKHI,
        previousStock: 0,
        newStock: item.stockKHI,
        reference: `INIT-${item.sku}`,
        notes: `Initial stock deposit for ${item.name}`,
        createdBy: userId,
      },
    });
  }

  // 7. Suppliers
  console.log('🤝 Seeding Suppliers...');
  const suppApple = await prisma.supplier.upsert({
    where: { companyId_name: { companyId, name: 'Apple Distribution Pakistan' } },
    update: {},
    create: {
      companyId,
      name: 'Apple Distribution Pakistan',
      contactPerson: 'Tariq Mahmood',
      email: 'supply@apple-dist.pk',
      phone: '+92 21 35891100',
      city: 'Karachi',
      country: 'Pakistan',
    },
  });

  const suppLogitech = await prisma.supplier.upsert({
    where: { companyId_name: { companyId, name: 'Logitech Peripheral Supplies' } },
    update: {},
    create: {
      companyId,
      name: 'Logitech Peripheral Supplies',
      contactPerson: 'Kashif Raza',
      email: 'orders@logitech-dist.pk',
      phone: '+92 51 2289400',
      city: 'Islamabad',
      country: 'Pakistan',
    },
  });

  // 8. Customers
  console.log('👤 Seeding Customers...');
  const custHaroon = await prisma.customer.findFirst({
    where: { companyId, companyName: 'Haroon Traders' },
  }) || await prisma.customer.create({
    data: {
      companyId,
      companyName: 'Haroon Traders',
      contactPerson: 'Haroon Rasheed',
      email: 'haroon@traders.com',
      phone: '+92 321 9876543',
      city: 'Karachi',
    },
  });

  const custMetropolis = await prisma.customer.findFirst({
    where: { companyId, companyName: 'Metropolis Tech Solutions' },
  }) || await prisma.customer.create({
    data: {
      companyId,
      companyName: 'Metropolis Tech Solutions',
      contactPerson: 'Usman Ali',
      email: 'procurement@metropolistech.io',
      phone: '+92 300 4455667',
      city: 'Lahore',
    },
  });

  // 9. Sales Orders
  console.log('🛒 Seeding Sales Orders...');
  const existingSO1 = await prisma.salesOrder.findFirst({
    where: { companyId, salesNumber: 'SO-2026-001' },
  });

  if (!existingSO1) {
    await prisma.salesOrder.create({
      data: {
        companyId,
        customerId: custHaroon.id,
        warehouseId: whKarachi.id,
        salesNumber: 'SO-2026-001',
        orderDate: new Date(),
        status: 'COMPLETED',
        totalAmount: 900000,
        notes: '2x iPhone 15 Pro Max purchased by Haroon Traders',
      },
    });
  }

  const existingSO2 = await prisma.salesOrder.findFirst({
    where: { companyId, salesNumber: 'SO-2026-002' },
  });

  if (!existingSO2) {
    await prisma.salesOrder.create({
      data: {
        companyId,
        customerId: custMetropolis.id,
        warehouseId: whLahore.id,
        salesNumber: 'SO-2026-002',
        orderDate: new Date(),
        status: 'APPROVED',
        totalAmount: 550000,
        notes: '1x Dell XPS 15 Laptop for Metropolis Workstation Upgrade',
      },
    });
  }

  // 10. Purchase Orders
  console.log('📋 Seeding Purchase Orders...');
  const existingPO1 = await prisma.purchaseOrder.findFirst({
    where: { companyId, orderNumber: 'PO-2026-001' },
  });

  if (!existingPO1) {
    await prisma.purchaseOrder.create({
      data: {
        companyId,
        supplierId: suppLogitech.id,
        warehouseId: whKarachi.id,
        orderNumber: 'PO-2026-001',
        orderDate: new Date(),
        status: 'PENDING_APPROVAL',
        totalAmount: 220000,
        notes: 'Reorder 10x Logitech MX Master 3S Mouse to solve low stock',
      },
    });
  }

  // 11. Finance Accounts
  console.log('💰 Seeding Financial Accounts...');
  const accountsData = [
    { code: '1010', name: 'Cash & Bank Account', type: 'ASSET' },
    { code: '1020', name: 'Accounts Receivable', type: 'ASSET' },
    { code: '1030', name: 'Inventory Asset Account', type: 'ASSET' },
    { code: '2010', name: 'Accounts Payable', type: 'LIABILITY' },
    { code: '3010', name: 'Owners Equity', type: 'EQUITY' },
    { code: '4010', name: 'Sales Revenue Account', type: 'REVENUE' },
    { code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'EXPENSE' },
  ];

  for (const acc of accountsData) {
    await prisma.account.upsert({
      where: { companyId_accountCode: { companyId, accountCode: acc.code } },
      update: { accountName: acc.name },
      create: {
        companyId,
        accountCode: acc.code,
        accountName: acc.name,
        accountType: acc.type as any,
        status: 'ACTIVE',
      },
    });
  }

  // 12. Workflows
  console.log('⚙️ Seeding Workflows...');
  await prisma.workflow.upsert({
    where: { companyId_code: { companyId, code: 'WF-PROC-01' } },
    update: {},
    create: {
      companyId,
      name: 'Procurement PO Approval Workflow',
      code: 'WF-PROC-01',
      module: 'PROCUREMENT',
      description: 'Requires Ops Manager sign-off for PO over 100k PKR',
      status: 'ACTIVE',
    },
  });

  // 13. Notifications
  console.log('🔔 Seeding System Notifications...');
  const notifCount = await prisma.notification.count({ where: { companyId } });
  if (notifCount === 0) {
    await prisma.notification.create({
      data: {
        companyId,
        userId,
        title: 'Low Stock Warning',
        message: 'Logitech MX Master 3S Mouse stock is 3 units (below minimum threshold 8).',
        type: 'WARNING',
        priority: 'HIGH',
        module: 'Inventory',
      },
    });

    await prisma.notification.create({
      data: {
        companyId,
        userId,
        title: 'Pending Purchase Order Approval',
        message: 'Purchase Order PO-2026-001 (PKR 220,000) is waiting for executive sign-off.',
        type: 'INFO',
        priority: 'MEDIUM',
        module: 'Procurement',
      },
    });
  }

  console.log('🎉 Full Comprehensive Seeding Completed Successfully! All Sidebar Modules now active with real data in PostgreSQL DB.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
