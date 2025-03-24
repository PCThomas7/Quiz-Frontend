import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionBulkUploader } from '../../components/admin/QuestionBulkUploader/QuestionBulkUploader';
import { Question, TagSystem } from '../../types/types';
import { questionService } from '../../services/questionService';
import { tagService } from '../../services/tagService';

export default function QuestionBulkUploadPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]); // Initialize as empty array
  const [tagSystem, setTagSystem] = useState<TagSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsData, tagsData] = await Promise.all([
          questionService.getAllQuestions(),
          tagService.getAllTags()
        ]);
        // Ensure questionsData is an array
        setQuestions(Array.isArray(questionsData) ? questionsData : []);
        setTagSystem(tagsData);
      } catch (err) {
        setError('Failed to load required data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleImport = (newQuestions: Question[]) => {
    setQuestions(prev => [...prev, ...newQuestions]);
    navigate('/admin/questions');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !tagSystem) {
    return <div>Error: {error || 'Failed to load tag system'}</div>;
  }

  return (
    <QuestionBulkUploader
      questions={questions}
      tagSystem={tagSystem}
      onImport={handleImport}
    />
  );
}