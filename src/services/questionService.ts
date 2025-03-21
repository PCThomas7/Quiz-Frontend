
import { api } from './api';

export const questionService = {
  fetchQuestions: async (params) => {
    const response = await api.get('/questions', { params });
    return response.data;
  },
  
  bulkUpload: async (questions) => {
    const response = await api.post('/questions/bulk', questions);
    return response.data;
  },
  
  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/questions/${questionId}`);
    return response.data;
  },
  
  bulkUpdateQuestions: async (questions: Question[]) => {
    const response = await api.patch('/questions/bulk-update', { questions });
    return response.data;
  }
};