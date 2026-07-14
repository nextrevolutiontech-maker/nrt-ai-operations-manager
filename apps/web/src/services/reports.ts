import { api } from './api';

export interface ReportSummary {
  title: string;
  description: string;
  endpoint: string;
  category: 'INVENTORY' | 'SALES' | 'PROCUREMENT' | 'FINANCE';
}

export const reportsService = {
  getInventoryValuation: async () => {
    const { data } = await api.get('/reports/inventory/valuation');
    return data;
  },
  
  getLowStockAlerts: async () => {
    const { data } = await api.get('/reports/inventory/low-stock');
    return data;
  },

  getSalesPerformance: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get('/reports/sales/performance', {
      params: { startDate, endDate }
    });
    return data;
  },

  getProfitAndLoss: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get('/reports/finance/profit-loss', {
      params: { startDate, endDate }
    });
    return data;
  },

  getPurchaseHistory: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get('/reports/procurement/purchase-history', {
      params: { startDate, endDate }
    });
    return data;
  }
};
