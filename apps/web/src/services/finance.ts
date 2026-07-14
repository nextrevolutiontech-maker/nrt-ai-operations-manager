import { api } from './api';

const handleResponse = (res: any) => res.data.data;

export const accountService = {
  getAll: async (params?: any) => handleResponse(await api.get('/accounts', { params })),
  getById: async (id: string) => handleResponse(await api.get(`/accounts/${id}`)),
  create: async (data: any) => handleResponse(await api.post('/accounts', data)),
  update: async (id: string, data: any) => handleResponse(await api.patch(`/accounts/${id}`, data)),
  delete: async (id: string) => handleResponse(await api.delete(`/accounts/${id}`)),
};

export const journalService = {
  getAll: async (params?: any) => handleResponse(await api.get('/journals', { params })),
  getById: async (id: string) => handleResponse(await api.get(`/journals/${id}`)),
  create: async (data: any) => handleResponse(await api.post('/journals', data)),
  // Note: Journals shouldn't be fully updated or deleted once posted, but we expose endpoints if the backend allows drafting or voiding.
};
