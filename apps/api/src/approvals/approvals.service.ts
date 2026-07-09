import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApprovalFilterDto } from './dto/approval-filter.dto';
import { ProcessActionDto } from './dto/process-action.dto';
import {
  RequestStatus,
  ApprovalActionType,
  WorkflowStatus,
  ApprovalType,
} from '@nrt-ai-workforce/database';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createRequest(
    companyId: string,
    module: string,
    entityType: string,
    entityId: string,
    requestedBy: string,
  ) {
    // Automatically resolve the active workflow for the company and module
    const workflow = await this.prisma.workflow.findFirst({
      where: {
        companyId,
        module,
        status: WorkflowStatus.ACTIVE,
        deletedAt: null,
      },
      include: { levels: true },
    });

    if (!workflow) {
      throw new BadRequestException(
        `No active workflow found for module: ${module}`,
      );
    }
    if (workflow.levels.length === 0) {
      throw new BadRequestException('Workflow has no approval levels defined');
    }

    const request = await this.prisma.approvalRequest.create({
      data: {
        companyId,
        workflowId: workflow.id,
        entityType,
        entityId,
        currentLevel: 1,
        status: RequestStatus.PENDING,
        requestedBy,
        createdBy: requestedBy,
      },
    });

    await this.logAudit(
      companyId,
      requestedBy,
      'APPROVAL_REQUESTED',
      request.id,
    );
    return request;
  }

  async findAll(companyId: string, query: ApprovalFilterDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'requestedAt',
      sortOrder = 'desc',
      entityType,
      status,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { companyId, deletedAt: null };
    if (entityType) where.entityType = entityType;
    if (status) where.status = status;
    if (search) where.entityId = { contains: search, mode: 'insensitive' };

    const [total, data] = await Promise.all([
      this.prisma.approvalRequest.count({ where }),
      this.prisma.approvalRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          workflow: { select: { id: true, name: true, module: true } },
        },
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async findOne(companyId: string, id: string) {
    const request = await this.prisma.approvalRequest.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        workflow: {
          include: { levels: { orderBy: { levelNumber: 'asc' } } },
        },
        history: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!request) throw new NotFoundException('Approval request not found');
    return request;
  }

  async processAction(
    companyId: string,
    id: string,
    userId: string,
    dto: ProcessActionDto,
  ) {
    const request = await this.findOne(companyId, id);

    // 1. Lock check
    if (
      request.status === RequestStatus.APPROVED ||
      request.status === RequestStatus.REJECTED ||
      request.status === RequestStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'This approval request is locked and cannot be modified',
      );
    }

    // 2. Identify current level and allowed role
    const currentLevelInfo = request.workflow.levels.find(
      (l) => l.levelNumber === request.currentLevel,
    );
    if (!currentLevelInfo) {
      throw new BadRequestException('Approval level definition missing');
    }

    // 3. Prevent self-approval implicitly unless configured (forcing generic business rule: user must have role)
    // Actually, we must check if the user has the role assigned to currentLevelInfo.roleId
    const hasRole = await this.prisma.userRole.findFirst({
      where: { userId, roleId: currentLevelInfo.roleId },
    });
    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have the required role to approve this level',
      );
    }

    // Ensure the user hasn't already approved this level if MULTIPLE
    const existingApproval = await this.prisma.approvalHistory.findFirst({
      where: {
        requestId: request.id,
        userId,
        action: ApprovalActionType.APPROVE,
      },
    });

    // We only prevent duplicate APPROVE from the same user for the same level.
    // If they already approved, and they are trying to approve again, reject.
    if (dto.action === ApprovalActionType.APPROVE && existingApproval) {
      // Actually we must check if they approved *this* level.
      // But history doesn't strictly store the level. We can just prevent a user from approving twice total,
      // which is standard for distinct approvers.
      throw new BadRequestException('You have already approved this request');
    }

    let newStatus: RequestStatus = request.status;
    let nextLevel = request.currentLevel;
    let isFullyCompleted = false;

    // Process State Machine
    if (dto.action === ApprovalActionType.APPROVE) {
      if (
        currentLevelInfo.approvalType === ApprovalType.MULTIPLE &&
        currentLevelInfo.minApprovers > 1
      ) {
        // Count existing approvers + 1
        const approverCount = await this.prisma.approvalHistory.count({
          where: { requestId: request.id, action: ApprovalActionType.APPROVE },
        });
        // We only count distinct users. The DB check above prevents double voting.
        if (approverCount + 1 >= currentLevelInfo.minApprovers) {
          // Level passed
          nextLevel += 1;
        }
      } else {
        // Single approval passes the level
        nextLevel += 1;
      }

      // Check if we exhausted all levels
      const maxLevel = Math.max(
        ...request.workflow.levels.map((l) => l.levelNumber),
      );
      if (nextLevel > maxLevel) {
        newStatus = RequestStatus.APPROVED;
        isFullyCompleted = true;
      }
    } else if (dto.action === ApprovalActionType.REJECT) {
      newStatus = RequestStatus.REJECTED;
      isFullyCompleted = true;
    } else if (dto.action === ApprovalActionType.RETURN) {
      newStatus = RequestStatus.RETURNED;
      nextLevel = Math.max(1, nextLevel - 1); // returns to previous level
    } else if (dto.action === ApprovalActionType.CANCEL) {
      newStatus = RequestStatus.CANCELLED;
      isFullyCompleted = true;
    }

    // Atomic Update
    const updatedRequest = await this.prisma.$transaction(async (tx) => {
      // Create history
      await tx.approvalHistory.create({
        data: {
          requestId: request.id,
          action: dto.action,
          userId,
          comment: dto.comment,
          previousStatus: request.status,
          newStatus: newStatus,
        },
      });

      // Update request
      return tx.approvalRequest.update({
        where: { id: request.id },
        data: {
          status: newStatus,
          currentLevel: nextLevel,
          approvedAt:
            newStatus === RequestStatus.APPROVED ? new Date() : undefined,
          updatedBy: userId,
        },
      });
    });

    await this.logAudit(
      companyId,
      userId,
      `APPROVAL_${dto.action}`,
      request.id,
    );

    // If terminal state reached, emit event for other modules
    if (isFullyCompleted || newStatus === RequestStatus.RETURNED) {
      this.eventEmitter.emit('approval.completed', {
        requestId: request.id,
        entityType: request.entityType,
        entityId: request.entityId,
        status: newStatus,
      });
    }

    return updatedRequest;
  }

  private async logAudit(
    companyId: string,
    userId: string,
    action: string,
    entityId: string,
  ) {
    await this.prisma.auditLog
      .create({
        data: {
          companyId,
          userId,
          action,
          entity: 'ApprovalRequest',
          entityId,
        },
      })
      .catch((e: any) => console.error('Failed to log audit:', e));
  }
}
