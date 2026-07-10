import { Injectable, OnModuleInit } from '@nestjs/common';
import { ToolRegistryService } from './tool-registry.service';
import { IToolHandler } from './tool.interface';
import { ProductsService } from '../../products/products.service';

@Injectable()
export class ProductSearchTool implements IToolHandler, OnModuleInit {
  name = 'ProductSearchTool';
  description = 'Searches the product catalog for items matching a keyword.';
  module = 'Master Data';
  requiredPermission = 'read:products';

  inputSchema = {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'The search keyword' },
    },
    required: ['query'],
  };

  outputSchema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        code: { type: 'string' },
      },
    },
  };

  constructor(
    private readonly registry: ToolRegistryService,
    private readonly productsService: ProductsService,
  ) {}

  onModuleInit() {
    this.registry.registerTool(this);
  }

  async execute(args: { query: string }, context: any): Promise<any> {
    // We fetch using the existing ProductsService and context's companyId
    const result = await this.productsService.findAll(context.companyId, {
      search: args.query,
      page: 1,
      limit: 5,
    });

    return result.data.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.sku,
    }));
  }
}
