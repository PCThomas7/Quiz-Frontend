import { useNavigate, useParams } from 'react-router-dom';
import { QuestionCreator } from '../../components/admin/QuestionCreator/QuestionCreator';
import { Question } from '../../types/types';

export default function QuestionCreatorPage() {
  const navigate = useNavigate();
  const { questionId } = useParams();

  const handleSaveQuestion = (question: Question) => {
    // Save question logic here
    navigate('/admin/questions');
  };

  return (
    <QuestionCreator
      questionId={questionId}
      onSave={handleSaveQuestion}
      onCancel={() => navigate('/admin/questions')}
    />
  );
}