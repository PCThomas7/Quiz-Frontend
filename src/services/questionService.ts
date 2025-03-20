
import { Question, ApiResponse } from '../types/types';
import { api } from './api';
import { Tags } from '../types/types';
import axios from 'axios';

interface FetchQuestionsParams {
  page: number;
  limit: number;
  filters: Partial<Tags>;
  searchQuery?: string;
}

interface QuestionsResponse {
  questions: Question[];
  totalCount: number;
}

export const questionService = {
  bulkUpload: async (questions: Question[]) => {
    try {
      const response = await api.post(`/questions/bulk`, questions, {
        headers: {
          'Content-Type': 'application/json',
          // Add your authentication header if required
          // 'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to upload questions');
    }
  },
  fetchQuestions: async (params: {
    page: number;
    limit: number;
    filters: any;
    searchQuery?: string;
  }) => {
    try {
      const response = await api.get<ApiResponse>(`/questions`, {
        params: {
          page: params.page,
          limit: params.limit,
          search: params.searchQuery,
          ...params.filters
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to fetch questions'
        : 'Failed to fetch questions');
    }
  },
  // Add this method to questionService
  deleteQuestion: async (questionId: string) => {
    try {
      const response = await api.delete(`/questions/${questionId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete question');
    }
  },
};