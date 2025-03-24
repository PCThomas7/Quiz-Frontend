import { useNavigate, useParams } from 'react-router-dom';
import { QuizBuilder } from '../../components/admin/QuizBuilder/QuizBuilder';
import { Quiz, Question } from '../../types/types';

export default function QuizBuilderPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const handleSaveQuiz = async (quiz: Quiz, updatedQuestions?: Question[]) => {
    // Save quiz logic here
    navigate('/admin/quizzes');
  };

  return (
    <QuizBuilder
      quizId={quizId}
      onSave={handleSaveQuiz}
      onCancel={() => navigate('/admin/quizzes')}
    />
  );
}