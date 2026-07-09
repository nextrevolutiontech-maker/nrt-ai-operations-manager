import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpi-summary')
  @Permissions('read:analytics')
  @ApiOperation({ summary: 'Get high-level KPI summary' })
  getKpiSummary(@Req() req: any, @Query() query: AnalyticsFilterDto) {
    return this.analyticsService.getKpiSummary(
      req.user.companyId,
      req.user.id,
      query,
    );
  }

  @Get('inventory')
  @Permissions('read:analytics')
  @ApiOperation({ summary: 'Get inventory analytics' })
  getInventoryAnalytics(@Req() req: any, @Query() query: AnalyticsFilterDto) {
    return this.analyticsService.getInventoryAnalytics(req.user.companyId, req.user.id, query);
  }

  @Get('procurement')
  @Permissions('read:analytics')
  @ApiOperation({ summary: 'Get procurement analytics' })
  getProcurementAnalytics(@Req() req: any, @Query() query: AnalyticsFilterDto) {
    return this.analyticsService.getProcurementAnalytics(req.user.companyId, req.user.id, query);
  }

  @Get('warehouses')
  @Permissions('read:analytics')
  @ApiOperation({ summary: 'Get warehouse analytics' })
  getWarehouseAnalytics(@Req() req: any, @Query() query: AnalyticsFilterDto) {
    return this.analyticsService.getWarehouseAnalytics(req.user.companyId, req.user.id, query);
  }

  @Get('workflows')
  @Permissions('read:analytics')
  @ApiOperation({ summary: 'Get workflow analytics' })
  getWorkflowAnalytics(@Req() req: any, @Query() query: AnalyticsFilterDto) {
    return this.analyticsService.getWorkflowAnalytics(req.user.companyId, req.user.id, query);
  }

  @Get('notifications')
  @Permissions('read:analytics')
  @ApiOperation({ summary: 'Get notification analytics' })
  getNotificationAnalytics(@Req() req: any, @Query() query: AnalyticsFilterDto) {
    return this.analyticsService.getNotificationAnalytics(
      req.user.companyId,
      req.user.id,
      query,
    );
  }
}
