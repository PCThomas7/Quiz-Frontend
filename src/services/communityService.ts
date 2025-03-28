import { api } from './api';
import { CommunityPost, CommunityPostFormData } from '../types/communityTypes';

export const communityService = {
  // Get all community posts
  getPosts: async () => {
    try {
      const response = await api.get('/community/posts');
      return response.data;
    } catch (error) {
      console.error('Error fetching community posts:', error);
      throw error;
    }
  },

  // Get a single post by ID
  getPost: async (postId: string) => {
    try {
      const response = await api.get(`/community/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching community post:', error);
      throw error;
    }
  },

  // Create a new post
  createPost: async (postData: CommunityPostFormData) => {
    try {
      // Handle file uploads if any
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      
      if (postData.tags && postData.tags.length > 0) {
        formData.append('tags', JSON.stringify(postData.tags));
      }
      
      if (postData.attachments && postData.attachments.length > 0) {
        postData.attachments.forEach((file, index) => {
          formData.append(`attachments`, file);
        });
      }
      
      const response = await api.post('/community/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating community post:', error);
      throw error;
    }
  },

  // Update an existing post
  updatePost: async (postId: string, postData: Partial<CommunityPostFormData>) => {
    try {
      const formData = new FormData();
      
      if (postData.title) formData.append('title', postData.title);
      if (postData.content) formData.append('content', postData.content);
      
      if (postData.tags && postData.tags.length > 0) {
        formData.append('tags', JSON.stringify(postData.tags));
      }
      
      if (postData.attachments && postData.attachments.length > 0) {
        postData.attachments.forEach((file, index) => {
          formData.append(`attachments`, file);
        });
      }
      
      const response = await api.put(`/community/posts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating community post:', error);
      throw error;
    }
  },

  // Delete a post
  deletePost: async (postId: string) => {
    try {
      const response = await api.delete(`/community/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting community post:', error);
      throw error;
    }
  },

  // Like a post
  likePost: async (postId: string) => {
    try {
      const response = await api.post(`/community/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking community post:', error);
      throw error;
    }
  },

  // Add a comment to a post
  addComment: async (postId: string, content: string) => {
    try {
      const response = await api.post(`/community/posts/${postId}/comments`, { content });
      return response.data;
    } catch (error) {
      console.error('Error adding comment to community post:', error);
      throw error;
    }
  }
};