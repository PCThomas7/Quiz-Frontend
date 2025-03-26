
import { api } from './api';
import { Question } from '../types/types';

export const questionService = {
  getAllQuestions: async () => {
    const response = await api.get('/questions');
    return response.data;
  },

  fetchQuestions: async (params) => {
    const response = await api.get('/questions', { params });
    return response.data;
  },
  
  bulkUpload: async (questions: Question[]) => {
    // Remove _id from questions before sending to backend
    const questionsToUpload = questions.map(({ _id, ...rest }) => ({
      id: _id, // Convert _id to id for backend
      ...rest
    }));
    
    const response = await api.post('/questions/bulk', questionsToUpload);
    return response.data;
  },
  
  deleteQuestion: async (questionId: string) => {
    const response = await api.delete(`/questions/${questionId}`);
    return response.data;
  },
  
  bulkUpdateQuestions: async (questions: Question[]) => {
    const response = await api.patch('/questions/bulk-update', { questions });
    return response.data;
  },
  
  // Add new service method
  updateQuizUsage: async (quizId: string, questionIds: string[]) => {
    const response = await api.post('/quizzes/update-quiz-usage', {
      quizId,
      questionIds
    });
    return response.data;
  },
  
  // Add this to your existing questionService
  getTagSystem: async () => {
    try {
      const response = await api.get('/questions/tag-system');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tag system');
    }
  }
};