import { Injectable, Logger } from '@nestjs/common';
import { ApprovalRecord, ApprovalStatus } from './approval.entity';

@Injectable()
export class ApprovalWorkflowService {
  private readonly logger = new Logger(ApprovalWorkflowService.name);
  private readonly approvalHistory: Array<{
    approvalId: string;
    fromState: ApprovalStatus;
    toState: ApprovalStatus;
    actionBy: string;
    timestamp: Date;
    reason?: string;
  }> = [];

  transition(
    record: ApprovalRecord,
    toState: ApprovalStatus,
    actionBy: string,
    reason?: string,
  ): ApprovalRecord {
    const fromState = record.status;

    // Validate state transitions
    if (fromState === 'EXECUTED' || fromState === 'REJECTED') {
      throw new Error(`Cannot transition approval ${record.id} from terminal state '${fromState}'.`);
    }

    record.status = toState;
    record.updatedAt = new Date();

    if (toState === 'APPROVED') record.approvedBy = actionBy;
    if (toState === 'REJECTED') {
      record.rejectedBy = actionBy;
      record.rejectionReason = reason;
    }
    if (toState === 'EXECUTED') record.executedAt = new Date();

    // Log immutable history
    this.approvalHistory.push({
      approvalId: record.id,
      fromState,
      toState,
      actionBy,
      timestamp: new Date(),
      reason,
    });

    this.logger.log(
      `[APPROVAL TRANSITION] ${record.id} | ${fromState} -> ${toState} | By: ${actionBy}`,
    );

    return record;
  }

  getAuditHistory(approvalId?: string) {
    if (approvalId) {
      return this.approvalHistory.filter((h) => h.approvalId === approvalId);
    }
    return this.approvalHistory;
  }
}
