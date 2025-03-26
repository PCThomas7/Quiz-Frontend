import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Quiz } from '../../types/types';
import { QuizTaker } from '../../components/admin/QuizTaker/QuizTaker';
import { quizService } from '../../services/quizService';
import toast from 'react-hot-toast';

export default function StudentQuizTakerPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (quizId) {
        try {
          setLoading(true);
          const data = await quizService.getQuiz(quizId);
          setQuiz(data.quiz);
        } catch (error) {
          console.error('Error fetching quiz:', error);
          toast.error('Failed to load quiz');
          navigate('/student/quizzes');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchQuiz();
  }, [quizId, navigate]);

  const handleSubmit = async (answers: Record<string, string[]>) => {
    try {
      // Changed from submitQuiz to submitQuizAttempt
      await quizService.submitQuizAttempt(quizId!, {
        answers,
        completed: true,
        timeSpent: quiz?.timeLimit ? quiz.timeLimit * 60 : 0
      });
      
      toast.success('Quiz submitted successfully!');
      navigate(`/quiz-report/${quizId}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    }
  };

  if (loading || !quiz) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <QuizTaker
      quiz={quiz}
      onSubmit={handleSubmit}
      onBackToDashboard={() => navigate('/student/quizzes')}
    />
  );
}