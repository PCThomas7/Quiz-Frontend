import { api } from './api';

export const reportService = {
  // Get detailed quiz attempt report
  getQuizAttemptReport: async (quizId: string) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/attempts/me/report`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz attempt report:', error);
      throw error;
    }
  },

  // Get subject-wise performance for a quiz attempt
  getSubjectWiseReport: async (quizId: string, attemptId: string) => {
    try {
      const response = await api.get(
        `/quizzes/${quizId}/attempts/${attemptId}/subjects`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching subject-wise report:', error);
      throw error;
    }
  },

  // Get chapter-wise performance for a quiz attempt
  getChapterWiseReport: async (quizId: string, attemptId: string) => {
    try {
      const response = await api.get(
        `/quizzes/${quizId}/attempts/${attemptId}/chapters`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching chapter-wise report:', error);
      throw error;
    }
  },

  // Get topic-wise performance for a quiz attempt
  getTopicWiseReport: async (quizId: string, attemptId: string) => {
    try {
      const response = await api.get(
        `/quizzes/${quizId}/attempts/${attemptId}/topics`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching topic-wise report:', error);
      throw error;
    }
  },

  // Get difficulty-wise performance for a quiz attempt
  getDifficultyWiseReport: async (quizId: string, attemptId: string) => {
    try {
      const response = await api.get(
        `/quizzes/${quizId}/attempts/${attemptId}/difficulty`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching difficulty-wise report:', error);
      throw error;
    }
  }
};