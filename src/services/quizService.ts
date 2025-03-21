// src/services/quizService.js
import { api } from './api';

export const quizService = {
  // Quiz CRUD Operations
  getQuizzes: async () => {
    const response = await api.get('/quizzes');
    return response.data;
  },
  
  getQuiz: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  },
  
  createQuiz: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response.data;
  },
  
  updateQuiz: async (quizId, quizData) => {
    const response = await api.put(`/quizzes/${quizId}`, quizData);
    return response.data;
  },
  
  deleteQuiz: async (quizId) => {
    const response = await api.delete(`/quizzes/${quizId}`);
    return response.data;
  },
  
  // Question Operations
  getQuizQuestions: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/questions`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz questions');
    }
  },
  
  createQuestion: async (quizId, questionData) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/questions`, questionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create question');
    }
  },
  
  updateQuestion: async (questionId, questionData) => {
    try {
      const response = await api.put(`/questions/${questionId}`, questionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update question');
    }
  },
  
  deleteQuestion: async (questionId) => {
    try {
      const response = await api.delete(`/questions/${questionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete question');
    }
  },
  
  reorderQuestions: async (quizId, questionIds) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/questions/reorder`, { questionIds });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reorder questions');
    }
  },
  
  // Quiz Attempt Operations
  submitQuizAttempt: async (quizId, attemptData) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/attempts`, attemptData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit quiz attempt');
    }
  },
  
  getUserQuizAttempts: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/attempts/me`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz attempts');
    }
  },
  
  getAllQuizAttempts: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/attempts`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch all quiz attempts');
    }
  },
  
  getQuizAttemptDetails: async (attemptId) => {
    try {
      const response = await api.get(`/quiz-attempts/${attemptId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch attempt details');
    }
  },
  
  // Quiz Statistics
  getQuizStatistics: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/statistics`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz statistics');
    }
  },
  
  getQuestionStatistics: async (questionId) => {
    try {
      const response = await api.get(`/questions/${questionId}/statistics`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch question statistics');
    }
  }
};
export default quizService;
