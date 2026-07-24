export type AiTaskStatus =
  | 'DETECTED'
  | 'ANALYZED'
  | 'RECOMMENDATION_CREATED'
  | 'DRAFT_GENERATED'
  | 'APPROVAL_REQUESTED'
  | 'APPROVED'
  | 'EXECUTED'
  | 'VERIFIED'
  | 'CLOSED'
  | 'ARCHIVED';

export interface AiTaskRecord {
  id: string;
  title: string;
  description: string;
  recommendationId?: string;
  approvalId?: string;
  status: AiTaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: Date;
  updatedAt: Date;
}
