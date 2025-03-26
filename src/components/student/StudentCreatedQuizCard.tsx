import React from 'react';
import { Quiz } from '../../types/types';

interface StudentCreatedQuizCardProps {
  quiz: Quiz;
  onDelete: (quizId: string) => void;
  onTakeQuiz: (quizId: string) => void;
  onViewReport: (quizId: string) => void;
}

export const StudentCreatedQuizCard: React.FC<StudentCreatedQuizCardProps> = ({ 
  quiz, 
  onDelete,
  onTakeQuiz,
  onViewReport
}) => {
  const totalQuestions = quiz.sections.reduce(
    (acc, section) => acc + section.questions.length, 
    0
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      onDelete(quiz.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{quiz.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description || 'No description provided'}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span className="mr-4">
            <i className="fas fa-clock mr-1"></i>
            {quiz.timeLimit} min
          </span>
          <span>
            <i className="fas fa-question-circle mr-1"></i>
            {totalQuestions} questions
          </span>
        </div>
        
        <div className="flex flex-col space-y-2">
          {quiz.attempted ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onViewReport(quiz.id)}
                className="flex-1 bg-indigo-100 text-indigo-700 py-2 px-4 rounded hover:bg-indigo-200 transition-colors"
              >
                View Report
              </button>
              <button
                onClick={() => onTakeQuiz(quiz.id)}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
              >
                Retake Quiz
              </button>
            </div>
          ) : (
            <button
              onClick={() => onTakeQuiz(quiz.id)}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
            >
              Start Quiz
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Delete Quiz
          </button>
        </div>
      </div>
    </div>
  );
};