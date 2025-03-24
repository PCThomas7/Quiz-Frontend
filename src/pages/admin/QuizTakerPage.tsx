import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QuizTaker } from '../../components/admin/QuizTaker/QuizTaker';
import { Quiz } from '../../types/types';
import { quizService } from '../../services/quizService';

export default function QuizTakerPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (quizId) {
        try {
          const data = await quizService.getQuiz(quizId);
          setQuiz(data.quiz);
        } catch (error) {
          console.error('Error fetching quiz:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleSubmit = (answers: Record<string, string[]>) => {
    // Handle quiz submission
    navigate('/admin/quizzes');
  };

  if (loading || !quiz) {
    return <div>Loading...</div>;
  }

  return (
    <QuizTaker
      quiz={quiz}
      onSubmit={handleSubmit}
      onBackToDashboard={() => navigate('/admin/quizzes')}
    />
  );
}