import { api } from './api';

export const settingsService = {
  getCompanyProfile: async () => {
    // Fallback to dummy data if API not fully ready
    try {
      const { data } = await api.get('/settings/company');
      return data;
    } catch (e) {
      return {
        data: {
          name: 'NRT AI Operations',
          taxId: 'TX-987654321',
          email: 'admin@nrt.ai',
          phone: '+1 (555) 123-4567',
          address: '100 AI Boulevard, Tech City',
          currency: 'USD',
          timezone: 'America/New_York'
        }
      };
    }
  },
  
  updateCompanyProfile: async (payload: any) => {
    try {
      const { data } = await api.patch('/settings/company', payload);
      return data;
    } catch (e) {
      return { data: payload }; // Mock success
    }
  }
};
