import { api } from './api';

export interface ReportSummary {
  title: string;
  description: string;
  endpoint: string;
  category: 'INVENTORY' | 'SALES' | 'PROCUREMENT' | 'FINANCE';
}

export const reportsService = {
  getInventoryValuation: async () => {
    const { data } = await api.get('/analytics/inventory');
    return data;
  },
  
  getLowStockAlerts: async () => {
    const { data } = await api.get('/analytics/inventory');
    return data;
  },

  getSalesPerformance: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get('/analytics/sales', {
      params: { startDate, endDate }
    });
    return data;
  },

  getProfitAndLoss: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get('/analytics/finance', {
      params: { startDate, endDate }
    });
    return data;
  },

  getPurchaseHistory: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get('/analytics/procurement', {
      params: { startDate, endDate }
    });
    return data;
  }
};
