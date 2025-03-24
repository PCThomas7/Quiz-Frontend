import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizList } from '../../components/admin/QuizList/QuizList';
import { Quiz } from '../../types/types';

export default function QuizListPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const handleEditQuiz = (quiz: Quiz) => {
    navigate(`/admin/quizzes/edit/${quiz.id}`);
  };

  const handleDeleteQuiz = (quizId: string) => {
    setQuizzes(prev => prev.filter(q => q.id !== quizId));
  };

  const handleDuplicateQuiz = (quiz: Quiz) => {
    const now = new Date().toISOString();
    const duplicatedQuiz: Quiz = {
      ...quiz,
      id: crypto.randomUUID(),
      title: `${quiz.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };
    setQuizzes(prev => [...prev, duplicatedQuiz]);
  };

  const handleTakeQuiz = (quiz: Quiz) => {
    navigate(`/admin/quizzes/take/${quiz.id}`);
  };

  return (
    <QuizList
      onEditQuiz={handleEditQuiz}
      onDeleteQuiz={handleDeleteQuiz}
      onDuplicateQuiz={handleDuplicateQuiz}
      onTakeQuiz={handleTakeQuiz}
      onCreateQuiz={() => navigate('/admin/quizzes/create')}
    />
  );
}