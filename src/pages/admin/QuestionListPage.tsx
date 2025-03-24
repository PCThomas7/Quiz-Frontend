import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionList } from '../../components/admin/QuestionList/QuestionList';
import { Question } from '../../types/types';

export default function QuestionListPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleEditQuestion = (question: Question) => {
    navigate(`/admin/questions/edit/${question.id}`);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  return (
    <QuestionList
      questions={questions}
      onEditQuestion={handleEditQuestion}
      onDeleteQuestion={handleDeleteQuestion}
      onCreateQuestion={() => navigate('/admin/questions/create')}
    />
  );
}