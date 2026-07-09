import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dashboards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Post()
  @Permissions('create:dashboard')
  @ApiOperation({ summary: 'Create a new dashboard' })
  create(@Req() req: any, @Body() dto: CreateDashboardDto) {
    return this.dashboardsService.create(req.user.companyId, req.user.id, dto);
  }

  @Get()
  @Permissions('read:dashboard')
  @ApiOperation({ summary: 'List all dashboards' })
  findAll(@Req() req: any, @Query() query: DashboardFilterDto) {
    return this.dashboardsService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @Permissions('read:dashboard')
  @ApiOperation({ summary: 'Get dashboard details by ID' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.dashboardsService.findOne(req.user.companyId, id, req.user.id);
  }

  @Patch(':id')
  @Permissions('update:dashboard')
  @ApiOperation({ summary: 'Update a dashboard' })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardsService.update(
      req.user.companyId,
      id,
      req.user.id,
      dto,
    );
  }

  @Delete(':id')
  @Permissions('delete:dashboard')
  @ApiOperation({ summary: 'Delete a dashboard' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.dashboardsService.remove(req.user.companyId, id, req.user.id);
  }

  @Post(':id/widgets')
  @Permissions('update:dashboard')
  @ApiOperation({ summary: 'Add a widget to a dashboard' })
  addWidget(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateWidgetDto,
  ) {
    return this.dashboardsService.addWidget(
      req.user.companyId,
      id,
      req.user.id,
      dto,
    );
  }

  @Patch(':id/widgets/:widgetId')
  @Permissions('update:dashboard')
  @ApiOperation({ summary: 'Update a dashboard widget' })
  updateWidget(
    @Req() req: any,
    @Param('id') id: string,
    @Param('widgetId') widgetId: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.dashboardsService.updateWidget(
      req.user.companyId,
      id,
      widgetId,
      req.user.id,
      dto,
    );
  }

  @Delete(':id/widgets/:widgetId')
  @Permissions('update:dashboard')
  @ApiOperation({ summary: 'Delete a dashboard widget' })
  removeWidget(
    @Req() req: any,
    @Param('id') id: string,
    @Param('widgetId') widgetId: string,
  ) {
    return this.dashboardsService.removeWidget(
      req.user.companyId,
      id,
      widgetId,
      req.user.id,
    );
  }
}
