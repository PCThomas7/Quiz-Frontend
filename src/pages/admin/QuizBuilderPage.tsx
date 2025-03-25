import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QuizBuilder } from '../../components/admin/QuizBuilder/QuizBuilder';
import { Quiz, Question, TagSystem } from '../../types/types';
import { quizService } from '../../services/quizService';
import { questionService } from '../../services/questionService';
import { tagService } from '../../services/tagService';
import { toast } from 'react-hot-toast';

export default function QuizBuilderPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState<Quiz | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tagSystem, setTagSystem] = useState<TagSystem | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch tag system
        const tagsResponse = await tagService.getAllTags();
        setTagSystem(tagsResponse);

        // Fetch questions
        const questionsResponse = await questionService.fetchQuestions({
          page: 1,
          limit: 1000,
          filters: {},
          searchQuery: ''
        });
        setQuestions(questionsResponse.data.questions);

        // Fetch quizzes
        const quizzesResponse = await quizService.getQuizzes();
        setQuizzes(quizzesResponse.quizzes || []);

        // If editing an existing quiz, fetch its data
        if (quizId) {
          const quizResponse = await quizService.getQuiz(quizId);
          
          // Also fetch batch assignments if editing
          try {
            const batchResponse = await quizService.getQuizBatches(quizId);
            quizResponse.quiz.batchAssignment = batchResponse.batchAssignment || 'NONE';
            quizResponse.quiz.assignedBatches = batchResponse.assignedBatches || [];
          } catch (err) {
            console.error('Error fetching batch assignments:', err);
            // Continue even if batch fetch fails
          }
          
          setQuiz(quizResponse.quiz);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data');
        toast.error('Failed to load required data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [quizId]);

  const handleSaveQuiz = async (savedQuiz: Quiz, updatedQuestions?: Question[]) => {
    try {
      toast.success('Quiz saved successfully!');
      navigate('/admin/quizzes');
    } catch (err) {
      console.error('Error saving quiz:', err);
      toast.error('Failed to save quiz');
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  return (
    <QuizBuilder
      questions={questions}
      tagSystem={tagSystem || {
        exam_types: [],
        subjects: [],
        topics: [],
        difficulties: [],
        question_types: []
      }}
      onSave={handleSaveQuiz}
      initialQuiz={quiz}
      quizzes={quizzes}
    />
  );
}