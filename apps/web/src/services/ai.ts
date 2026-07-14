import { api } from './api';

export const aiService = {
  chat: async (prompt: string, sessionId?: string): Promise<{ sessionId: string; response: string }> => {
    const { data } = await api.post('/ai/chat', { prompt, sessionId });
    return data;
  },

  getSessionHistory: async (sessionId: string) => {
    const { data } = await api.get(`/ai/sessions/${sessionId}/history`);
    return data;
  }
};
