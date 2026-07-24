import { Injectable, OnModuleInit } from '@nestjs/common';
import { ToolRegistryService } from './tool-registry.service';
import { IToolHandler } from './tool.interface';
import { CustomersService } from '../../customers/customers.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AddCustomerTool implements IToolHandler, OnModuleInit {
  name = 'AddCustomerTool';
  description = 'Creates a new customer/client record in the system.';
  module = 'Master Data';
  requiredPermission = 'PUBLIC'; // Or 'write:customers'

  inputSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'The name of the customer' },
      email: { type: 'string', description: 'Customer email address (optional)' },
      phone: { type: 'string', description: 'Customer phone number (optional)' },
      address: { type: 'string', description: 'Customer physical address (optional)' },
    },
    required: ['name'],
  };

  outputSchema = {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      customerId: { type: 'string' },
      message: { type: 'string' },
    },
  };

  constructor(
    private readonly registry: ToolRegistryService,
    private readonly customersService: CustomersService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.registry.registerTool(this);
  }

  async execute(args: { name: string; email?: string; phone?: string; address?: string }, context: any): Promise<any> {
    try {
      const newCustomer = await this.customersService.create(
        context.companyId,
        context.userId,
        {
          companyName: args.name,
          email: args.email || undefined,
          phone: args.phone || undefined,
          address: args.address || undefined,
        }
      );

      // Approval is now handled via Workflows or AiApprovalsService

      return {
        success: true,
        customerId: newCustomer.id,
        message: `Customer '${args.name}' drafted successfully and sent for Approval.`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to create customer: ${error.message}`,
      };
    }
  }
}
