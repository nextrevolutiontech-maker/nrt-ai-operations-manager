import { Injectable, OnModuleInit } from '@nestjs/common';
import { ToolRegistryService } from './tool-registry.service';
import { IToolHandler } from './tool.interface';
import { AnalyticsService } from '../../analytics/analytics.service';

@Injectable()
export class GetReportTool implements IToolHandler, OnModuleInit {
  name = 'GetReportTool';
  description = 'Retrieves a summarized report of key performance indicators (KPIs) like total sales, pending orders, and inventory value.';
  module = 'Analytics';
  requiredPermission = 'PUBLIC';

  inputSchema = {
    type: 'object',
    properties: {
      reportType: { type: 'string', description: 'Type of report (e.g. kpi, sales, inventory)' },
    },
  };

  outputSchema = {
    type: 'object',
    properties: {
      data: { type: 'string', description: 'JSON string of the report data' },
      summary: { type: 'string' }
    },
  };

  constructor(
    private readonly registry: ToolRegistryService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  onModuleInit() {
    this.registry.registerTool(this);
  }

  async execute(args: { reportType?: string }, context: any): Promise<any> {
    try {
      const type = args.reportType?.toLowerCase() || 'kpi';
      let data;
      
      if (type === 'sales') {
        data = await this.analyticsService.getSalesAnalytics(context.companyId, context.userId, {});
      } else if (type === 'inventory') {
        data = await this.analyticsService.getInventoryAnalytics(context.companyId, context.userId, {});
      } else {
        data = await this.analyticsService.getKpiSummary(context.companyId, context.userId, {});
      }

      return {
        data: JSON.stringify(data),
        summary: `Successfully retrieved ${type} report.`,
      };
    } catch (error: any) {
      return {
        error: `Failed to generate report: ${error.message}`
      };
    }
  }
}
