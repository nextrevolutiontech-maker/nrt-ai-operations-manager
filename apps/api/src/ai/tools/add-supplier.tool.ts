import { Injectable, OnModuleInit } from '@nestjs/common';
import { ToolRegistryService } from './tool-registry.service';
import { IToolHandler } from './tool.interface';
import { SuppliersService } from '../../suppliers/suppliers.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AddSupplierTool implements IToolHandler, OnModuleInit {
  name = 'AddSupplierTool';
  description = 'Creates a new supplier/vendor record in the system.';
  module = 'Master Data';
  requiredPermission = 'PUBLIC';

  inputSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'The name of the supplier' },
      email: { type: 'string', description: 'Supplier email address (optional)' },
      phone: { type: 'string', description: 'Supplier phone number (optional)' },
      contactPerson: { type: 'string', description: 'Name of the contact person (optional)' },
    },
    required: ['name'],
  };

  outputSchema = {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      supplierId: { type: 'string' },
      message: { type: 'string' },
    },
  };

  constructor(
    private readonly registry: ToolRegistryService,
    private readonly suppliersService: SuppliersService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.registry.registerTool(this);
  }

  async execute(args: { name: string; email?: string; phone?: string; contactPerson?: string }, context: any): Promise<any> {
    try {
      const newSupplier = await this.suppliersService.create(
        context.companyId,
        context.userId,
        {
          name: args.name,
          email: args.email || undefined,
          phone: args.phone || undefined,
          contactPerson: args.contactPerson || undefined,
        }
      );

      // Approval is now handled via Workflows or AiApprovalsService

      return {
        success: true,
        supplierId: newSupplier.id,
        message: `Supplier '${args.name}' drafted successfully and sent for Approval.`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to create supplier: ${error.message}`,
      };
    }
  }
}
