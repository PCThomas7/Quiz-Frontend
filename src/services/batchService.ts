// src/services/batchService.js
import { api } from './api';
import { Batch } from '../types/types';

export const batchService = {
  // Batch CRUD Operations
  getBatches: async () => {
    try {
      const response = await api.get('/batches');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch batches');
    }
  },
  
  getBatch: async (batchId) => {
    try {
      const response = await api.get(`/batches/${batchId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch batch details');
    }
  },
  
  createBatch: async (batchData) => {
    try {
      const response = await api.post('/batches', batchData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create batch');
    }
  },
  
  updateBatch: async (batchId, batchData) => {
    try {
      const response = await api.put(`/batches/${batchId}`, batchData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update batch');
    }
  },
  
  deleteBatch: async (batchId) => {
    try {
      const response = await api.delete(`/batches/${batchId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete batch');
    }
  },
  
  // Quiz-Batch Assignment Operations
  assignQuizToBatches: async (quizId, batchAssignment, batchIds) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/batches`, {
        batchAssignment,
        batchIds
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign quiz to batches');
    }
  },
  
  getQuizBatches: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/batches`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz batches');
    }
  },
  
  getBatchQuizzes: async (batchId) => {
    try {
      const response = await api.get(`/batches/${batchId}/quizzes`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch batch quizzes');
    }
  }
};

export default batchService;