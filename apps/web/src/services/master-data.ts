import { api } from './api';

const handleResponse = (res: any) => res.data.data;

export const categoryService = {
  getAll: async (params?: any) => handleResponse(await api.get('/categories', { params })),
  getById: async (id: string) => handleResponse(await api.get(`/categories/${id}`)),
  create: async (data: any) => handleResponse(await api.post('/categories', data)),
  update: async (id: string, data: any) => handleResponse(await api.patch(`/categories/${id}`, data)),
  delete: async (id: string) => handleResponse(await api.delete(`/categories/${id}`)),
};

export const brandService = {
  getAll: async (params?: any) => handleResponse(await api.get('/brands', { params })),
  getById: async (id: string) => handleResponse(await api.get(`/brands/${id}`)),
  create: async (data: any) => handleResponse(await api.post('/brands', data)),
  update: async (id: string, data: any) => handleResponse(await api.patch(`/brands/${id}`, data)),
  delete: async (id: string) => handleResponse(await api.delete(`/brands/${id}`)),
};

export const unitService = {
  getAll: async (params?: any) => handleResponse(await api.get('/units', { params })),
  getById: async (id: string) => handleResponse(await api.get(`/units/${id}`)),
  create: async (data: any) => handleResponse(await api.post('/units', data)),
  update: async (id: string, data: any) => handleResponse(await api.patch(`/units/${id}`, data)),
  delete: async (id: string) => handleResponse(await api.delete(`/units/${id}`)),
};

export const productService = {
  getAll: async (params?: any) => handleResponse(await api.get('/products', { params })),
  getById: async (id: string) => handleResponse(await api.get(`/products/${id}`)),
  create: async (data: any) => handleResponse(await api.post('/products', data)),
  update: async (id: string, data: any) => handleResponse(await api.patch(`/products/${id}`, data)),
  delete: async (id: string) => handleResponse(await api.delete(`/products/${id}`)),
};
