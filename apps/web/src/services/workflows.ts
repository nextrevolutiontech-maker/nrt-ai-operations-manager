import { api } from './api';

export interface PaginatedResponse<T> {
  data: T[];
  meta: any;
}

export interface WorkflowLevel {
  id?: string;
  roleId?: string;
  userId?: string;
  sequence: number;
}

export interface Workflow {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  entityType: string;
  minAmount?: number;
  maxAmount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  levels?: WorkflowLevel[];
}

export interface CreateWorkflowDto {
  name: string;
  description?: string;
  entityType: string;
  minAmount?: number;
  maxAmount?: number;
  isActive?: boolean;
  levels: {
    roleId?: string;
    userId?: string;
    sequence: number;
  }[];
}

export interface UpdateWorkflowDto extends Partial<CreateWorkflowDto> {}

export const workflowService = {
  getAll: async (params?: Record<string, any>) => {
    const { data } = await api.get<PaginatedResponse<Workflow>>('/workflows', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Workflow>(`/workflows/${id}`);
    return data;
  },

  create: async (payload: CreateWorkflowDto) => {
    const { data } = await api.post<Workflow>('/workflows', payload);
    return data;
  },

  update: async (id: string, payload: UpdateWorkflowDto) => {
    const { data } = await api.patch<Workflow>(`/workflows/${id}`, payload);
    return data;
  },

  activate: async (id: string) => {
    const { data } = await api.post<Workflow>(`/workflows/${id}/activate`);
    return data;
  },

  deactivate: async (id: string) => {
    const { data } = await api.post<Workflow>(`/workflows/${id}/deactivate`);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete<Workflow>(`/workflows/${id}`);
    return data;
  },
};
