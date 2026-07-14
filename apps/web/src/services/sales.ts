import { api } from './api';

const handleResponse = (res: any) => res.data.data;

export const customerService = {
  getAll: async (params?: any) => handleResponse(await api.get('/customers', { params })),
  getById: async (id: string) => handleResponse(await api.get(`/customers/${id}`)),
  create: async (data: any) => handleResponse(await api.post('/customers', data)),
  update: async (id: string, data: any) => handleResponse(await api.patch(`/customers/${id}`, data)),
  delete: async (id: string) => handleResponse(await api.delete(`/customers/${id}`)),
};

export const salesOrderService = {
  getAll: async (params?: any) => handleResponse(await api.get('/sales-orders', { params })),
  getById: async (id: string) => handleResponse(await api.get(`/sales-orders/${id}`)),
  create: async (data: any) => handleResponse(await api.post('/sales-orders', data)),
  update: async (id: string, data: any) => handleResponse(await api.patch(`/sales-orders/${id}`, data)),
  issueGoods: async (id: string, data: any) => handleResponse(await api.post(`/sales-orders/${id}/issue`, data)),
};
