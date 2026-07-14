import { api } from './api';

export interface PaginatedResponse<T> {
  data: T[];
  meta: any;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'CANCELLED';
export type ApprovalActionType = 'APPROVE' | 'REJECT' | 'RETURN' | 'CANCEL';

export interface ApprovalLevel {
  id: string;
  requestId: string;
  level: number;
  roleId?: string;
  userId?: string;
  status: ApprovalStatus;
  notes?: string;
  actedBy?: string;
  actedAt?: string;
}

export interface ApprovalRequest {
  id: string;
  companyId: string;
  entityType: string;
  entityId: string;
  entityRef?: string;
  workflowId?: string;
  status: ApprovalStatus;
  currentLevel: number;
  requesterId: string;
  requesterNotes?: string;
  createdAt: string;
  updatedAt: string;
  levels?: ApprovalLevel[];
  requester?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ProcessActionDto {
  action: ApprovalActionType;
  notes?: string;
}

export const approvalService = {
  getAll: async (params?: Record<string, any>) => {
    const { data } = await api.get<PaginatedResponse<ApprovalRequest>>('/approvals/requests', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApprovalRequest>(`/approvals/requests/${id}`);
    return data;
  },

  processAction: async (id: string, payload: ProcessActionDto) => {
    const { data } = await api.post<ApprovalRequest>(`/approvals/requests/${id}/action`, payload);
    return data;
  },
};
