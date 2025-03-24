import { useState, useEffect, useCallback } from 'react';
import TagManager from '../../components/admin/TagManager/TagManager';
import { TagSystem, DifficultyLevel, Question } from '../../types/types';
import { tagService } from '../../services/tagService';

export default function TagManagerPage() {
  const [tagSystem, setTagSystem] = useState<TagSystem>({
    id: crypto.randomUUID(),
    name: 'Default Tag System',
    tags: [],
    exam_types: [],
    subjects: {},
    chapters: {},
    topics: {},
    difficulty_levels: ['Easy', 'Medium', 'Hard'] as DifficultyLevel[],
    question_types: ['MCQ', 'MMCQ', 'Numerical', 'MSQ'],
    sources: []
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the update function
  const handleUpdateTagSystem = useCallback((newTagSystem: TagSystem) => {
    setTagSystem(newTagSystem);
  }, []);

  // Move the initial tag fetching to the parent component
  useEffect(() => {
    const fetchInitialTags = async () => {
      try {
        setLoading(true);
        const updatedTags = await tagService.getAllTags();
        setTagSystem(updatedTags);
      } catch (error) {
        console.error('Error fetching initial tags:', error);
        setError('Failed to fetch tags from server');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialTags();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <TagManager
      tagSystem={tagSystem}
      questions={questions}
      onUpdateTagSystem={handleUpdateTagSystem}
    />
  );
}