import { api } from './api';

const handleResponse = (res: any) => res.data.data;

export const warehouseService = {
  getAll: async (params?: any) => handleResponse(await api.get('/warehouses', { params })),
  getById: async (id: string) => handleResponse(await api.get(`/warehouses/${id}`)),
  create: async (data: any) => handleResponse(await api.post('/warehouses', data)),
  update: async (id: string, data: any) => handleResponse(await api.patch(`/warehouses/${id}`, data)),
  delete: async (id: string) => handleResponse(await api.delete(`/warehouses/${id}`)),
};

export const inventoryService = {
  // Get stock levels across warehouses
  getAll: async (params?: any) => handleResponse(await api.get('/inventories', { params })),
};

export const stockMovementService = {
  getAll: async (params?: any) => handleResponse(await api.get('/stock-movements', { params })),
  getById: async (id: string) => handleResponse(await api.get(`/stock-movements/${id}`)),
  create: async (data: any) => handleResponse(await api.post('/stock-movements', data)),
};
