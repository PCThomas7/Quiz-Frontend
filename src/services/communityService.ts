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

  // Get popular posts
  getPopularPosts: async () => {
    try {
      const response = await api.get('/community/posts/popular');
      return response.data;
    } catch (error) {
      console.error('Error fetching popular posts:', error);
      throw error;
    }
  },

  // Get recent posts
  getRecentPosts: async () => {
    try {
      const response = await api.get('/community/posts/recent');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      throw error;
    }
  },

  // Search posts
  searchPosts: async (query: string) => {
    try {
      const response = await api.get(`/community/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  },

  // Get posts by tag
  getPostsByTag: async (tagName: string) => {
    try {
      const response = await api.get(`/community/posts/tag/${encodeURIComponent(tagName)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching posts by tag:', error);
      throw error;
    }
  },

  // Like a post
  likePost: async (postId: string) => {
    try {
      const response = await api.post(`/community/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  // Add a comment to a post
  addComment: async (postId: string, content: string) => {
    try {
      const response = await api.post(`/community/posts/${postId}/comments`, { content });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
};