import { api } from '../services/api';

export const lessonService = {
  getLesson: async (lessonId: string) => {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
  }
};