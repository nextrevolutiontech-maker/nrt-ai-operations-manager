import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DynamicAiContext {
  company: {
    id: string;
    name: string;
    currency: string;
    timezone: string;
    fiscalYear: string;
  };
  user: {
    id: string;
    name: string;
    role: string;
    permissions: string[];
  };
  operationalState: {
    activeWarehouseCount: number;
    totalProductsCount: number;
    totalAvailableStock: number;
    salesOrdersCount: number;
    purchaseOrdersCount: number;
    activeIndustry: string;
    language: string;
  };
  liveKpis: {
    lowStockCount: number;
    pendingApprovalsCount: number;
    openOrdersCount: number;
    dailyRevenue: number;
  };
  details: {
    productsList: Array<{ sku: string; name: string; price: number; stock: number; category?: string }>;
    salesList: Array<{ salesNumber: string; customer: string; amount: number; status: string }>;
    purchaseList: Array<{ orderNumber: string; supplier: string; amount: number; status: string }>;
    lowStockList: Array<{ sku: string; name: string; availableStock: number; minStockLevel: number }>;
    warehousesList: Array<{ name: string; location?: string }>;
  };
  activeAlerts: Array<{ id: string; severity: string; message: string }>;
}

@Injectable()
export class AiContextEngineService {
  private readonly logger = new Logger(AiContextEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async buildContext(
    companyId: string,
    userId: string,
    industryId?: string,
  ): Promise<DynamicAiContext> {
    let user: any = null;
    let company: any = null;

    try {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });
    } catch (e) {
      this.logger.warn(`Failed to fetch user context: ${e}`);
    }

    try {
      if (companyId) {
        company = await this.prisma.company.findUnique({
          where: { id: companyId },
        });
      }
    } catch (e) {
      this.logger.warn(`Failed to fetch company context: ${e}`);
    }

    // Parallel fetch of all ERP module details
    let productsCount = 0;
    let totalStockSum = 0;
    let warehousesCount = 0;
    let salesOrdersCount = 0;
    let purchaseOrdersCount = 0;
    let pendingApprovalsCount = 0;
    let totalSalesRevenue = 0;

    let productsList: any[] = [];
    let salesList: any[] = [];
    let purchaseList: any[] = [];
    let lowStockList: any[] = [];
    let warehousesList: any[] = [];

    try {
      const [
        prodCount,
        stockAgg,
        whCount,
        soCount,
        poCount,
        apprCount,
        revAgg,
        dbProducts,
        dbSales,
        dbPurchases,
        dbInventories,
        dbWarehouses,
      ] = await Promise.all([
        this.prisma.product.count(),
        this.prisma.inventory.aggregate({ _sum: { availableStock: true } }),
        this.prisma.warehouse.count(),
        this.prisma.salesOrder.count(),
        this.prisma.purchaseOrder.count(),
        this.prisma.approvalRequest.count({ where: { status: 'PENDING' } }),
        this.prisma.salesOrder.aggregate({ _sum: { totalAmount: true } }),
        this.prisma.product.findMany({
          take: 10,
          select: { sku: true, name: true, price: true, category: { select: { name: true } } },
        }),
        this.prisma.salesOrder.findMany({
          take: 10,
          select: { salesNumber: true, totalAmount: true, status: true, customer: { select: { companyName: true } } },
        }),
        this.prisma.purchaseOrder.findMany({
          take: 10,
          select: { orderNumber: true, totalAmount: true, status: true, supplier: { select: { name: true } } },
        }),
        this.prisma.inventory.findMany({
          include: { product: true },
        }),
        this.prisma.warehouse.findMany({
          select: { name: true, location: true },
        }),
      ]);

      productsCount = typeof prodCount === 'number' ? prodCount : 0;
      totalStockSum = dbInventories.reduce((acc, inv) => acc + Number(inv.availableStock || 0), 0);
      warehousesCount = typeof whCount === 'number' ? whCount : 0;
      salesOrdersCount = typeof soCount === 'number' ? soCount : 0;
      purchaseOrdersCount = typeof poCount === 'number' ? poCount : 0;
      pendingApprovalsCount = typeof apprCount === 'number' ? apprCount : 0;
      totalSalesRevenue = revAgg?._sum?.totalAmount ? Number(revAgg._sum.totalAmount) : 0;

      warehousesList = dbWarehouses || [];
      productsList = dbProducts.map((p) => ({
        sku: p.sku,
        name: p.name,
        price: Number(p.price),
        category: p.category?.name,
      }));

      salesList = dbSales.map((s) => ({
        salesNumber: s.salesNumber,
        customer: s.customer?.companyName || 'Customer',
        amount: Number(s.totalAmount),
        status: s.status,
      }));

      purchaseList = dbPurchases.map((p) => ({
        orderNumber: p.orderNumber,
        supplier: p.supplier?.name || 'Supplier',
        amount: Number(p.totalAmount),
        status: p.status,
      }));

      lowStockList = dbInventories
        .filter((inv) => Number(inv.availableStock) <= Number(inv.product?.minStockLevel || 0) && Number(inv.product?.minStockLevel || 0) > 0)
        .map((inv) => ({
          sku: inv.product?.sku || 'N/A',
          name: inv.product?.name || 'Unknown Item',
          availableStock: Number(inv.availableStock || 0),
          minStockLevel: Number(inv.product?.minStockLevel || 0),
        }));
    } catch (e) {
      this.logger.warn(`Prisma metrics collection: ${e}`);
    }

    const userRoles = user?.userRoles || [];
    const firstRole = userRoles[0]?.role;
    const userPermissions =
      firstRole?.rolePermissions?.map((rp: any) => rp.permission.name) || [
        'read:inventory',
        'read:procurement',
        'read:sales',
        'read:finance',
        'read:dashboard',
      ];

    return {
      company: {
        id: companyId || 'COMP-01',
        name: company?.name || 'NRT Enterprise Solutions',
        currency: company?.currency || 'PKR',
        timezone: company?.timezone || 'Asia/Karachi',
        fiscalYear: '2026',
      },
      user: {
        id: userId || 'USER-01',
        name: user ? `${user.firstName} ${user.lastName}` : 'Operations Manager',
        role: firstRole?.name || 'Admin',
        permissions: userPermissions,
      },
      operationalState: {
        activeWarehouseCount: warehousesCount,
        totalProductsCount: productsCount,
        totalAvailableStock: totalStockSum,
        salesOrdersCount: salesOrdersCount,
        purchaseOrdersCount: purchaseOrdersCount,
        activeIndustry: industryId || 'operations',
        language: 'en',
      },
      liveKpis: {
        lowStockCount: lowStockList.length,
        pendingApprovalsCount,
        openOrdersCount: salesOrdersCount,
        dailyRevenue: totalSalesRevenue,
      },
      details: {
        productsList,
        salesList,
        purchaseList,
        lowStockList,
        warehousesList,
      },
      activeAlerts: [
        {
          id: 'ALT-01',
          severity: lowStockList.length > 0 ? 'HIGH' : 'LOW',
          message: lowStockList.length > 0
            ? `LOW STOCK WARNING: SKU ${lowStockList[0]?.sku} (${lowStockList[0]?.name}) stock is ${lowStockList[0]?.availableStock} units.`
            : `System Nominal: ${productsCount} Products | ${totalStockSum} Stock Units across ${warehousesCount} Warehouses`,
        },
      ],
    };
  }
}
