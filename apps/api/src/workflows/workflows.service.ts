import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowFilterDto } from './dto/workflow-filter.dto';
import { WorkflowStatus } from '@nrt-ai-workforce/database';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, userId: string, dto: CreateWorkflowDto) {
    // Check if workflow code already exists for company
    const existing = await this.prisma.workflow.findUnique({
      where: { companyId_code: { companyId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException('Workflow with this code already exists');
    }

    // Validate roles exist
    const roleIds = dto.levels.map((l) => l.roleId);
    const rolesCount = await this.prisma.role.count({
      where: { companyId, id: { in: roleIds } },
    });
    if (rolesCount !== new Set(roleIds).size) {
      throw new BadRequestException('One or more invalid roles provided');
    }

    const workflow = await this.prisma.workflow.create({
      data: {
        companyId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        module: dto.module,
        status: dto.status || WorkflowStatus.ACTIVE,
        createdBy: userId,
        levels: {
          create: dto.levels.map((level) => ({
            levelNumber: level.levelNumber,
            roleId: level.roleId,
            approvalType: level.approvalType,
            required: level.required,
            minApprovers: level.minApprovers,
            sequence: level.sequence,
            createdBy: userId,
          })),
        },
      },
      include: {
        levels: {
          orderBy: { levelNumber: 'asc' },
          include: { role: { select: { id: true, name: true } } },
        },
      },
    });

    await this.logAudit(companyId, userId, 'CREATE_WORKFLOW', workflow.id);
    return workflow;
  }

  async findAll(companyId: string, query: WorkflowFilterDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeDeleted,
      module,
      status,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (!includeDeleted) where.deletedAt = null;
    if (module) where.module = module;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.workflow.count({ where }),
      this.prisma.workflow.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          levels: {
            orderBy: { levelNumber: 'asc' },
            include: { role: { select: { id: true, name: true } } },
          },
        },
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async findOne(companyId: string, id: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        levels: {
          orderBy: { levelNumber: 'asc' },
          include: { role: { select: { id: true, name: true } } },
        },
      },
    });
    if (!workflow) throw new NotFoundException('Workflow not found');
    return workflow;
  }

  async update(
    companyId: string,
    id: string,
    userId: string,
    dto: UpdateWorkflowDto,
  ) {
    const workflow = await this.findOne(companyId, id);

    if (dto.code && dto.code !== workflow.code) {
      const existing = await this.prisma.workflow.findUnique({
        where: { companyId_code: { companyId, code: dto.code } },
      });
      if (existing) {
        throw new ConflictException('Workflow with this code already exists');
      }
    }

    if (dto.levels) {
      const roleIds = dto.levels.map((l) => l.roleId);
      const rolesCount = await this.prisma.role.count({
        where: { companyId, id: { in: roleIds } },
      });
      if (rolesCount !== new Set(roleIds).size) {
        throw new BadRequestException('One or more invalid roles provided');
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.levels) {
        await tx.approvalLevel.deleteMany({ where: { workflowId: id } });
      }

      return tx.workflow.update({
        where: { id },
        data: {
          name: dto.name,
          code: dto.code,
          description: dto.description,
          module: dto.module,
          status: dto.status,
          updatedBy: userId,
          ...(dto.levels && {
            levels: {
              create: dto.levels.map((level) => ({
                levelNumber: level.levelNumber,
                roleId: level.roleId,
                approvalType: level.approvalType,
                required: level.required,
                minApprovers: level.minApprovers,
                sequence: level.sequence,
                createdBy: userId,
              })),
            },
          }),
        },
        include: {
          levels: {
            orderBy: { levelNumber: 'asc' },
            include: { role: { select: { id: true, name: true } } },
          },
        },
      });
    });

    await this.logAudit(companyId, userId, 'UPDATE_WORKFLOW', id);
    return updated;
  }

  async remove(companyId: string, id: string, userId: string) {
    const workflow = await this.findOne(companyId, id);
    await this.prisma.workflow.update({
      where: { id: workflow.id },
      data: { deletedAt: new Date(), updatedBy: userId },
    });
    await this.logAudit(companyId, userId, 'DELETE_WORKFLOW', id);
    return { message: 'Workflow softly deleted' };
  }

  async restore(companyId: string, id: string, userId: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, companyId, deletedAt: { not: null } },
    });
    if (!workflow) throw new NotFoundException('Deleted workflow not found');
    await this.prisma.workflow.update({
      where: { id },
      data: { deletedAt: null, updatedBy: userId },
    });
    await this.logAudit(companyId, userId, 'RESTORE_WORKFLOW', id);
    return { message: 'Workflow restored successfully' };
  }

  async activate(companyId: string, id: string, userId: string) {
    const workflow = await this.findOne(companyId, id);
    await this.prisma.workflow.update({
      where: { id: workflow.id },
      data: { status: WorkflowStatus.ACTIVE, updatedBy: userId },
    });
    await this.logAudit(companyId, userId, 'ACTIVATE_WORKFLOW', id);
    return { message: 'Workflow activated' };
  }

  async deactivate(companyId: string, id: string, userId: string) {
    const workflow = await this.findOne(companyId, id);
    await this.prisma.workflow.update({
      where: { id: workflow.id },
      data: { status: WorkflowStatus.INACTIVE, updatedBy: userId },
    });
    await this.logAudit(companyId, userId, 'DEACTIVATE_WORKFLOW', id);
    return { message: 'Workflow deactivated' };
  }

  private async logAudit(
    companyId: string,
    userId: string,
    action: string,
    entityId: string,
  ) {
    await this.prisma.auditLog
      .create({
        data: { companyId, userId, action, entity: 'Workflow', entityId },
      })
      .catch((e: any) => console.error('Failed to log audit:', e));
  }
}
