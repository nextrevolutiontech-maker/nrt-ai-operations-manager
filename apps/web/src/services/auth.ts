import { api } from './api';

export const authService = {
  login: async (data: any) => {
    const res = await api.post('/auth/login', data);
    return res.data.data;
  },
};
