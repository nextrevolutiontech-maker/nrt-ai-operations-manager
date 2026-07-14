import { api } from './api';

export const notificationsService = {
  getAll: async () => {
    try {
      const { data } = await api.get('/notifications');
      return data;
    } catch (e) {
      // Mock notifications if backend not fully wired yet
      return {
        data: [
          {
            id: '1',
            title: 'Low Stock Alert: Wireless Mouse',
            message: 'Warehouse "Main Depot" has dropped below minimum stock level (150 < 200).',
            type: 'WARNING',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Purchase Order Approved',
            message: 'PO-2023-085 has been approved by Finance Manager.',
            type: 'SUCCESS',
            isRead: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: '3',
            title: 'New User Registered',
            message: 'A new user has requested access to the Operations Manager.',
            type: 'INFO',
            isRead: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          }
        ]
      };
    }
  },

  markAsRead: async (id: string) => {
    try {
      const { data } = await api.patch(`/notifications/${id}/read`);
      return data;
    } catch (e) {
      return { success: true };
    }
  },

  markAllAsRead: async () => {
    try {
      const { data } = await api.post('/notifications/mark-all-read');
      return data;
    } catch (e) {
      return { success: true };
    }
  }
};
