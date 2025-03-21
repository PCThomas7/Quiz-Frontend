import { api } from './api';
import { TagSystem } from '../types/types';

export class TagService {
  async getAllTags(): Promise<TagSystem> {
    try {
      const response = await api.get('/tags');
      
      // Ensure topics are properly processed
      const data = response.data;
      
      // Convert topics from object to Map if needed
      if (data.topics && typeof data.topics === 'object' && !Array.isArray(data.topics)) {
        console.log('Processing topics from backend response:', Object.keys(data.topics).length);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw new Error('Failed to fetch tags');
    }
  }

  async addTag(category: string, data: { examType?: string; subject?: string; chapter?: string; tag: string }) {
    try {
      const response = await api.post(`/tags/${category}`, data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to add tag');
    }
  }

  async updateTag(category: string, oldValue: string, newValue: string) {
    try {
      const response = await api.put(`/tags/${category}`, { oldValue, newValue });
      return response.data;
    } catch (error) {
      throw new Error('Failed to update tag');
    }
  }

  async deleteTag(category: string, value: string) {
    try {
      const response = await api.delete(`/tags/${category}/${value}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete tag');
    }
  }

  async uploadTagsCsv(parsedData: Array<{
      exam_type: string;
      subject: string;
      chapter: string;
      topic: string;
    }>) {
      try {
        // More aggressive data cleaning and validation
        const formattedData = parsedData
          .map(row => {
            // Clean all fields
            const exam_type = String(row.exam_type || '').trim();
            const subject = String(row.subject || '').trim();
            const chapter = String(row.chapter || '').trim();
            const topic = String(row.topic || '').trim();
            
            return { exam_type, subject, chapter, topic };
          })
          .filter(row => {
            // Filter out rows with empty values
            if (!row.exam_type || !row.subject || !row.chapter || !row.topic) {
              return false;
            }
            
            // Filter out rows with JSON-like structures
            if (row.chapter.includes('{') || row.chapter.includes('[') || 
                row.chapter.includes('\\n') || row.chapter.includes('\\t')) {
              return false;
            }
            
            return true;
          });

        if (formattedData.length === 0) {
          throw new Error('No valid data found in CSV');
        }

        const response = await api.post('/tags/upload', formattedData);
        
        // Log the response to help with debugging
        console.log('CSV upload response:', {
          success: response.data.success,
          message: response.data.message,
          topicsSize: response.data.topics ? Object.keys(response.data.topics).length : 0
        });
        
        return {
          success: response.data.success,
          message: response.data.message,
          counts: response.data.counts,
          // Include the updated tag system in the response
          tagSystem: {
            hierarchy: response.data.hierarchy,
            subjects: response.data.subjects,
            chapters: response.data.chapters,
            topics: response.data.topics
          }
        };
      } catch (error: any) {
        console.error('Error uploading CSV:', error);
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw new Error('Failed to upload CSV');
      }
    }
    
  // Add a debug method to help troubleshoot tag system issues
  async debugTagSystem() {
    try {
      const response = await api.get('/tags/debug');
      return response.data;
    } catch (error) {
      console.error('Error debugging tag system:', error);
      throw new Error('Failed to debug tag system');
    }
  }
}

export const tagService = new TagService();