// src/services/courseService.js
import { api } from './api';

 const courseService = {
  // Course CRUD Operations
  getCourses: async () => {
    try {
      const response = await api.get('/courses');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch courses');
    }
  },
  
  getCourse: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course details');
    }
  },
  
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/courses', courseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create course');
    }
  },
  
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await api.put(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update course');
    }
  },
  
  deleteCourse: async (courseId) => {
    try {
      const response = await api.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete course');
    }
  },
  
  // Section Operations
  createSection: async (courseId, sectionData) => {
    try {
      const response = await api.post(`/courses/${courseId}/sections`, sectionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create section');
    }
  },
  
  updateSection: async (sectionId, sectionData) => {
    try {
      const response = await api.put(`/sections/${sectionId}`, sectionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update section');
    }
  },
  
  deleteSection: async (sectionId) => {
    try {
      const response = await api.delete(`/sections/${sectionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete section');
    }
  },
  
  reorderSections: async (courseId, sections) => {
    try {
      const response = await api.post(`/courses/${courseId}/sections/reorder`, { sections });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reorder sections');
    }
  },
  
  // Chapter Operations
  createChapter: async (sectionId, chapterData) => {
    try {
      const response = await api.post(`/sections/${sectionId}/chapters`, chapterData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create chapter');
    }
  },
  
  updateChapter: async (chapterId, chapterData) => {
    try {
      const response = await api.put(`/chapters/${chapterId}`, chapterData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update chapter');
    }
  },
  
  deleteChapter: async (chapterId) => {
    try {
      const response = await api.delete(`/chapters/${chapterId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete chapter');
    }
  },
  
  reorderChapters: async (sectionId, chapters) => {
    try {
      const response = await api.post(`/sections/${sectionId}/chapters/reorder`, { chapters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reorder chapters');
    }
  },
  
  // Lesson Operations
  createLesson: async (chapterId, lessonData) => {
    try {
      const response = await api.post(`/chapters/${chapterId}/lessons`, lessonData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create lesson');
    }
  },
  
  updateLesson: async (lessonId, lessonData) => {
    try {
      const response = await api.put(`/lessons/${lessonId}`, lessonData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update lesson');
    }
  },
  
  deleteLesson: async (lessonId) => {
    try {
      const response = await api.delete(`/lessons/${lessonId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete lesson');
    }
  },
  
  reorderLessons: async (chapterId, lessons) => {
    try {
      const response = await api.post(`/chapters/${chapterId}/lessons/reorder`, { lessons });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reorder lessons');
    }
  },
  
  // Course Pricing & Access
  updateCoursePricing: async (courseId, pricingData) => {
    try {
      const response = await api.put(`/courses/${courseId}/pricing`, pricingData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update course pricing');
    }
  },
  
  assignCourseToBatches: async (courseId, batchIds) => {
    try {
      const response = await api.post(`/courses/${courseId}/batches`, { batchIds });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign course to batches');
    }
  },
  
  // Enrollment and Purchase
  enrollCourse: async (courseId) => {
    try {
      const response = await api.post(`/courses/${courseId}/enroll`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to enroll in course');
    }
  },
  
  verifyPayment: async (paymentData) => {
    try {
      const response = await api.post(`/payment/verify`, paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  },
  
  // Progress Tracking
  trackProgress: async (lessonId, progressData) => {
    try {
      const response = await api.post(`/lessons/${lessonId}/progress`, progressData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to track progress');
    }
  },
  
  getCourseProgress: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/progress`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course progress');
    }
  }
};


export default courseService;
