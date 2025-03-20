// src/services/batchService.js
import { api } from './api';

const batchService = {
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
  
  // Batch Course Management
  getBatchCourses: async (batchId) => {
    try {
      const response = await api.get(`/batches/${batchId}/courses`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch batch courses');
    }
  },
  
  assignCourseToBatch: async (batchId, courseIds) => {
    try {
      const response = await api.post(`/batches/${batchId}/courses`, { courseIds });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign courses to batch');
    }
  },
  
  removeCourseFromBatch: async (batchId, courseId) => {
    try {
      const response = await api.delete(`/batches/${batchId}/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove course from batch');
    }
  },
  
  // Batch User Management
  getBatchUsers: async (batchId) => {
    try {
      const response = await api.get(`/batches/${batchId}/users`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch batch users');
    }
  },
  
  assignUsersToBatch: async (batchId, userIds) => {
    try {
      const response = await api.post(`/batches/${batchId}/users`, { userIds });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign users to batch');
    }
  },
  
  removeUserFromBatch: async (batchId, userId) => {
    try {
      const response = await api.delete(`/batches/${batchId}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove user from batch');
    }
  },
  
  // Batch Subscription Management
  setBatchSubscription: async (batchId, expiryDate) => {
    try {
      const response = await api.post(`/batches/${batchId}/subscription`, { expiryDate });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to set batch subscription');
    }
  },
  
  // Email Management for Batches
  sendBatchEmail: async (batchId, emailData) => {
    try {
      const response = await api.post(`/batches/${batchId}/email`, emailData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send email to batch');
    }
  },
  
  // Batch Analytics
  getBatchAnalytics: async (batchId) => {
    try {
      const response = await api.get(`/batches/${batchId}/analytics`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch batch analytics');
    }
  }
};

export default batchService;