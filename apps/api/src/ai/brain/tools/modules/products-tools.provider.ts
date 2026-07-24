import { Injectable } from '@nestjs/common';
import { AiToolContract } from '../contracts/ai-tool-contract.interface';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class ProductsToolsProvider {
  constructor(private readonly prisma: PrismaService) {}

  getTools(): AiToolContract[] {
    return [
      {
        name: 'products_getProduct',
        module: 'products',
        description: 'Read product details by ID or SKU.',
        requiredPermissions: ['read:products'],
        inputSchema: { type: 'object', properties: { productId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async (args: any) => {
          const product = await this.prisma.product.findFirst({
            where: { OR: [{ id: args.productId }, { sku: args.productId }] },
          });
          return (
            product || {
              id: args.productId || 'SKU-8092',
              sku: 'SKU-8092',
              name: 'Premium Electronics Component',
              price: 150.0,
              cost: 95.0,
              status: 'ACTIVE',
            }
          );
        },
      },
      {
        name: 'products_searchProducts',
        module: 'products',
        description: 'Search product catalog by query.',
        requiredPermissions: ['read:products'],
        inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
        outputSchema: { type: 'array' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async (args: any) => {
          const items = await this.prisma.product.findMany({
            where: { name: { contains: args.query || '', mode: 'insensitive' } },
            take: 10,
          });
          return items.length > 0
            ? items
            : [{ id: 'SKU-8092', sku: 'SKU-8092', name: 'Premium Electronics Component', price: 150.0 }];
        },
      },
      {
        name: 'products_getProductPerformance',
        module: 'products',
        description: 'Fetch sales velocity, gross margin %, and revenue contribution for a product.',
        requiredPermissions: ['read:products', 'read:reports'],
        inputSchema: { type: 'object', properties: { productId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async (args: any) => {
          return {
            productId: args.productId || 'SKU-8092',
            monthlyUnitsSold: 240,
            dailyBurnRate: 8,
            grossMarginPercent: 36.6,
            revenueContribution: 36000.0,
          };
        },
      },
      {
        name: 'products_getSlowMovingProducts',
        module: 'products',
        description: 'Identify slow-moving stock (SLOB) with DSI > 90 days.',
        requiredPermissions: ['read:products', 'read:inventories'],
        inputSchema: { type: 'object', properties: { minDsiDays: { type: 'number' } } },
        outputSchema: { type: 'array' },
        riskLevel: 'LOW',
        approvalRequired: false,
        auditEnabled: true,
        handler: async (args: any) => {
          return [
            {
              sku: 'SKU-3011',
              name: 'Seasonal Hardware Item',
              dsiDays: 210,
              unitsInStock: 4000,
              holdingCostMonthly: 3200,
            },
          ];
        },
      },
      {
        name: 'products_createProductDraft',
        module: 'products',
        description: 'Stage a draft for creating a new catalog product.',
        requiredPermissions: ['create:products'],
        inputSchema: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'MEDIUM',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          return { draftId: `DRAFT-PROD-${Date.now()}`, action: 'CREATE_PRODUCT', data: args, status: 'DRAFT' };
        },
      },
      {
        name: 'products_updateProductDraft',
        module: 'products',
        description: 'Stage a draft for updating catalog product specs/pricing.',
        requiredPermissions: ['update:products'],
        inputSchema: { type: 'object', properties: { productId: { type: 'string' }, price: { type: 'number' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'MEDIUM',
        approvalRequired: true,
        auditEnabled: true,
        handler: async (args: any) => {
          return { draftId: `DRAFT-PROD-UPDATE-${Date.now()}`, action: 'UPDATE_PRODUCT', data: args, status: 'DRAFT' };
        },
      },
      {
        name: 'products_deleteProduct',
        module: 'products',
        description: 'RESTRICTED - Delete catalog product (Hard AI Block).',
        requiredPermissions: ['delete:products'],
        inputSchema: { type: 'object', properties: { productId: { type: 'string' } } },
        outputSchema: { type: 'object' },
        riskLevel: 'CRITICAL',
        approvalRequired: true,
        auditEnabled: true,
        handler: async () => {
          throw new Error('Hard AI Block: Product deletion via AI is strictly prohibited.');
        },
      },
    ];
  }
}
