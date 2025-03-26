// src/services/quizService.js
import { api } from './api';

// Add these methods to your existing quizService.ts file

// Update the quizService object to include batch assignment methods
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
    return {
      data: {
        quiz: response.data.quiz,
        id: response.data.quiz.id
      }
    };
  },
  
  updateQuiz: async (quizId, quizData) => {
    const response = await api.put(`/quizzes/${quizId}`, quizData);
    return response.data;
  },
  
  deleteQuiz: async (quizId: string) => {
    try {
        const response = await api.delete(`/quizzes/${quizId}`);
        if (!response.data) {
            throw new Error('No response from server');
        }
        return response.data;
    } catch (error: any) {
        console.error('Error deleting quiz:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete quiz');
    }
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
  // Make sure the submitQuizAttempt function is properly implemented
  // Update the submitQuizAttempt function to include userId
  submitQuizAttempt: async (quizId: string, attemptData: any) => {
    try {
      // Make sure userId is included in attemptData
      if (!attemptData.userId) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        attemptData.userId = userInfo.id || userInfo._id;
      }
      
      const response = await api.post(`/quizzes/${quizId}/attempts`, attemptData);
      return response.data;
    } catch (error) {
      console.error("Error submitting quiz attempt:", error);
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
  },


  //Batch Assignment Operations
  assignBatches: async (quizId, batchAssignment, batchIds) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/batches`, {
        batchAssignment,
        batchIds
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning batches:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign batches to quiz');
    }
  },
  
  getQuizBatches: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/batches`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz batches:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz batches');
    }
  },
  
  getStudentQuizzes: async () => {
    try {
      const response = await api.get('/student/quizzes');
      return response.data;
    } catch (error) {
      console.error('Error fetching student quizzes:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch student quizzes');
    }
  },
  // Add this to your existing quizService
  generateStudentQuiz: async (quizData) => {
    try {
      const response = await api.post('/student/quizzes/generate', quizData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate student quiz');
    }
  },
  getStudentCreatedQuizzes: async () => {
    try {
      const response = await api.get('/student/my-quizzes');
      return response.data;
    } catch (error) {
      console.error('Error fetching student created quizzes:', error);
      throw error;
    }
  },
  
  deleteStudentQuiz: async (quizId: string) => {
    try {
      const response = await api.delete(`/student/my-quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting student quiz:', error);
      throw error;
    }
  }
};
export default quizService;
