import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApprovalRecord, ApprovalStatus } from './approval.entity';
import { ApprovalWorkflowService } from './approval-workflow.service';

@Injectable()
export class AiApprovalsService {
  private readonly logger = new Logger(AiApprovalsService.name);
  private readonly memoryStore: Map<string, ApprovalRecord> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: ApprovalWorkflowService,
  ) {}

  async createApproval(
    sessionId: string,
    actionName: string,
    payload: any,
    requestedBy: string = 'AI_OPERATIONS_MANAGER',
  ): Promise<ApprovalRecord> {
    const id = `APP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const record: ApprovalRecord = {
      id,
      sessionId,
      actionName,
      payload,
      status: 'PENDING',
      requestedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.memoryStore.set(id, record);

    // Save to Prisma if AI message context exists
    try {
      await (this.prisma as any).aiApproval?.create({
        data: {
          actionName,
          payload: JSON.stringify(payload),
          status: 'PENDING',
          aiMessageId: sessionId.length === 36 ? sessionId : undefined,
        },
      });
    } catch {
      // Memory store fallback
    }

    return record;
  }

  async getPendingApprovals(): Promise<ApprovalRecord[]> {
    return Array.from(this.memoryStore.values()).filter(
      (a) => a.status === 'PENDING',
    );
  }

  async approve(id: string, approvedBy: string): Promise<ApprovalRecord> {
    const record = this.memoryStore.get(id);
    if (!record) {
      throw new NotFoundException(`Approval record '${id}' not found.`);
    }

    const updated = this.workflowService.transition(record, 'APPROVED', approvedBy);
    this.memoryStore.set(id, updated);
    return updated;
  }

  async reject(id: string, rejectedBy: string, reason?: string): Promise<ApprovalRecord> {
    const record = this.memoryStore.get(id);
    if (!record) {
      throw new NotFoundException(`Approval record '${id}' not found.`);
    }

    const updated = this.workflowService.transition(record, 'REJECTED', rejectedBy, reason);
    this.memoryStore.set(id, updated);
    return updated;
  }

  async markExecuted(id: string, executedBy: string): Promise<ApprovalRecord> {
    const record = this.memoryStore.get(id);
    if (!record) {
      throw new NotFoundException(`Approval record '${id}' not found.`);
    }

    const updated = this.workflowService.transition(record, 'EXECUTED', executedBy);
    this.memoryStore.set(id, updated);
    return updated;
  }
}
