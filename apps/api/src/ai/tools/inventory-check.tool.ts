import { Injectable, OnModuleInit } from '@nestjs/common';
import { ToolRegistryService } from './tool-registry.service';
import { IToolHandler } from './tool.interface';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryCheckTool implements IToolHandler, OnModuleInit {
  name = 'InventoryCheckTool';
  description = 'Checks the current stock levels for a specific product by its name or SKU.';
  module = 'Inventory';
  requiredPermission = 'PUBLIC';

  inputSchema = {
    type: 'object',
    properties: {
      productName: { type: 'string', description: 'Name or SKU of the product to check' },
    },
    required: ['productName'],
  };

  outputSchema = {
    type: 'object',
    properties: {
      product: { type: 'string' },
      stock: { type: 'number' },
      status: { type: 'string' },
    },
  };

  constructor(
    private readonly registry: ToolRegistryService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.registry.registerTool(this);
  }

  async execute(args: { productName: string }, context: any): Promise<any> {
    try {
      const product = await this.prisma.product.findFirst({
        where: {
          companyId: context.companyId,
          deletedAt: null,
          OR: [
            { name: { contains: args.productName, mode: 'insensitive' } },
            { sku: { contains: args.productName, mode: 'insensitive' } }
          ]
        }
      });

      if (!product) {
        return { status: 'Not Found', message: `Could not find any product matching "${args.productName}"` };
      }

      const inventory = await this.prisma.inventory.aggregate({
        where: { companyId: context.companyId, productId: product.id },
        _sum: { availableStock: true }
      });

      const totalStock = Number(inventory._sum.availableStock || 0);

      return {
        product: product.name,
        sku: product.sku,
        stock: totalStock,
        status: totalStock > 0 ? 'In Stock' : 'Out of Stock',
      };
    } catch (error: any) {
      return { error: `Failed to check inventory: ${error.message}` };
    }
  }
}
