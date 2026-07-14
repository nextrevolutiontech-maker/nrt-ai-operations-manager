import { api } from './api';

const handleResponse = (res: any) => res.data.data;

export const supplierService = {
  getAll: async (params?: any) => handleResponse(await api.get('/suppliers', { params })),
  getById: async (id: string) => handleResponse(await api.get(`/suppliers/${id}`)),
  create: async (data: any) => handleResponse(await api.post('/suppliers', data)),
  update: async (id: string, data: any) => handleResponse(await api.patch(`/suppliers/${id}`, data)),
  delete: async (id: string) => handleResponse(await api.delete(`/suppliers/${id}`)),
};

export const purchaseOrderService = {
  getAll: async (params?: any) => handleResponse(await api.get('/purchase-orders', { params })),
  getById: async (id: string) => handleResponse(await api.get(`/purchase-orders/${id}`)),
  create: async (data: any) => handleResponse(await api.post('/purchase-orders', data)),
  update: async (id: string, data: any) => handleResponse(await api.patch(`/purchase-orders/${id}`, data)),
  delete: async (id: string) => handleResponse(await api.delete(`/purchase-orders/${id}`)),
  submitForApproval: async (id: string) => handleResponse(await api.post(`/purchase-orders/${id}/submit`)),
  receiveItems: async (id: string, data: any) => handleResponse(await api.post(`/purchase-orders/${id}/receive`, data)),
};
