import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { DashboardStatus, Prisma } from '@nrt-ai-workforce/database';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateDashboardDto) {
    const existing = await this.prisma.dashboard.findUnique({
      where: { companyId_code: { companyId, code: dto.code } },
    });
    if (existing)
      throw new ConflictException(
        `Dashboard with code ${dto.code} already exists`,
      );

    const dashboard = await this.prisma.dashboard.create({
      data: {
        ...dto,
        companyId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'CREATE_DASHBOARD', dashboard.id);
    return dashboard;
  }

  async findAll(companyId: string, query: DashboardFilterDto) {
    const { page = 1, limit = 10, search, module, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.DashboardWhereInput = {
      companyId,
      deletedAt: null,
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (module) where.module = module;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboard.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string, userId: string) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { widgets: { orderBy: { createdAt: 'asc' } } },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');

    // Generate Audit Log: Dashboard Viewed
    await this.logAudit(companyId, userId, 'DASHBOARD_VIEWED', dashboard.id);

    return dashboard;
  }

  async update(
    companyId: string,
    id: string,
    userId: string,
    dto: UpdateDashboardDto,
  ) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');

    if (dto.code && dto.code !== dashboard.code) {
      const existing = await this.prisma.dashboard.findUnique({
        where: { companyId_code: { companyId, code: dto.code } },
      });
      if (existing)
        throw new ConflictException(
          `Dashboard with code ${dto.code} already exists`,
        );
    }

    const updated = await this.prisma.dashboard.update({
      where: { id },
      data: { ...dto, updatedBy: userId },
    });

    await this.logAudit(companyId, userId, 'UPDATE_DASHBOARD', updated.id);
    return updated;
  }

  async remove(companyId: string, id: string, userId: string) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');

    const deleted = await this.prisma.dashboard.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
        status: DashboardStatus.INACTIVE,
      },
    });

    await this.logAudit(companyId, userId, 'DELETE_DASHBOARD', deleted.id);
    return deleted;
  }

  // Dashboard Widgets CRUD
  async addWidget(
    companyId: string,
    dashboardId: string,
    userId: string,
    dto: CreateWidgetDto,
  ) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, companyId, deletedAt: null },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');

    const widget = await this.prisma.dashboardWidget.create({
      data: {
        ...dto,
        dashboardId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.logAudit(
      companyId,
      userId,
      'CREATE_DASHBOARD_WIDGET',
      widget.id,
    );
    return widget;
  }

  async updateWidget(
    companyId: string,
    dashboardId: string,
    widgetId: string,
    userId: string,
    dto: UpdateWidgetDto,
  ) {
    const widget = await this.prisma.dashboardWidget.findFirst({
      where: {
        id: widgetId,
        dashboardId,
        dashboard: { companyId, deletedAt: null },
      },
    });
    if (!widget) throw new NotFoundException('Dashboard widget not found');

    const updated = await this.prisma.dashboardWidget.update({
      where: { id: widgetId },
      data: { ...dto, updatedBy: userId },
    });

    await this.logAudit(
      companyId,
      userId,
      'UPDATE_DASHBOARD_WIDGET',
      updated.id,
    );
    return updated;
  }

  async removeWidget(
    companyId: string,
    dashboardId: string,
    widgetId: string,
    userId: string,
  ) {
    const widget = await this.prisma.dashboardWidget.findFirst({
      where: {
        id: widgetId,
        dashboardId,
        dashboard: { companyId, deletedAt: null },
      },
    });
    if (!widget) throw new NotFoundException('Dashboard widget not found');

    await this.prisma.dashboardWidget.delete({
      where: { id: widgetId },
    });

    await this.logAudit(companyId, userId, 'DELETE_DASHBOARD_WIDGET', widgetId);
    return { success: true };
  }

  private async logAudit(
    companyId: string,
    userId: string,
    action: string,
    entityId: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action,
        entity: 'Dashboard',
        entityId,
      },
    });
  }
}
