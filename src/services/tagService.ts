import { api } from './api';

export class TagService {
  async getAllTags() {
    try {
      const response = await api.get('/tags');
      return response.data;
    } catch (error) {
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
        return {
          success: response.data.success,
          message: response.data.message,
          counts: response.data.counts
        };
      } catch (error: any) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw new Error('Failed to upload CSV');
      }
    }
}

export const tagService = new TagService();