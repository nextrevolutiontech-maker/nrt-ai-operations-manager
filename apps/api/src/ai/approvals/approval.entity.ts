export type ApprovalStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';

export interface ApprovalRecord {
  id: string;
  sessionId: string;
  actionName: string;
  payload: any;
  status: ApprovalStatus;
  requestedBy: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  executedAt?: Date;
}
