import { api } from './api';

export interface DashboardWidget {
  id: string;
  type: 'CHART' | 'METRIC' | 'TABLE';
  title: string;
  dataSource: string;
  config: any;
  position: any;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
}

export const dashboardsService = {
  findAll: async () => {
    const { data } = await api.get('/dashboards');
    return data;
  },
  findOne: async (id: string) => {
    const { data } = await api.get(`/dashboards/${id}`);
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post('/dashboards', payload);
    return data;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.patch(`/dashboards/${id}`, payload);
    return data;
  },
  addWidget: async (dashboardId: string, payload: any) => {
    const { data } = await api.post(`/dashboards/${dashboardId}/widgets`, payload);
    return data;
  },
  removeWidget: async (dashboardId: string, widgetId: string) => {
    const { data } = await api.delete(`/dashboards/${dashboardId}/widgets/${widgetId}`);
    return data;
  }
};
