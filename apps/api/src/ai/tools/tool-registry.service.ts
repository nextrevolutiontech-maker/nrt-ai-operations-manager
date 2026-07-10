import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { IToolHandler } from './tool.interface';

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);
  private readonly tools = new Map<string, IToolHandler>();

  registerTool(tool: IToolHandler) {
    if (this.tools.has(tool.name)) {
      this.logger.warn(`Tool ${tool.name} is already registered. Overwriting.`);
    }
    this.tools.set(tool.name, tool);
    this.logger.log(`Registered AI Tool: ${tool.name} [${tool.module}]`);
  }

  getTool(name: string): IToolHandler | undefined {
    return this.tools.get(name);
  }

  getAllToolsDefinitions() {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
  }

  async executeTool(name: string, args: any, context: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    // RBAC validation
    const hasPermission = context.permissions?.includes(
      tool.requiredPermission,
    );
    if (!hasPermission && tool.requiredPermission !== 'PUBLIC') {
      this.logger.error(
        `User ${context.userId} lacks permission ${tool.requiredPermission} for tool ${name}`,
      );
      throw new ForbiddenException(
        `Missing permission: ${tool.requiredPermission} to execute ${name}`,
      );
    }

    this.logger.log(
      `Executing tool ${name} with context userId=${context.userId}`,
    );
    return tool.execute(args, context);
  }
}
