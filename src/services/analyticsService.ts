import { api } from './api';

export const analyticsService = {
  getStudentAnalytics: async () => {
    try {
      const response = await api.get('/student/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching student analytics:', error);
      throw error;
    }
  }
};