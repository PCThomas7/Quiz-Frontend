import React from 'react';
import { Quiz } from '../../../types/types';

interface QuizCardProps {
  quiz: Quiz;
  onTakeQuiz: (quizId: string) => void;
  onViewReport: (quizId: string) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onTakeQuiz, onViewReport }) => {
  const totalQuestions = quiz.sections.reduce(
    (acc, section) => acc + section.questions.length, 
    0
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <span>Duration: {quiz.timeLimit} minutes</span>
          <span>{totalQuestions} questions</span>
        </div>
        
        {quiz.attempted ? (
          <div className="mt-4 flex space-x-2">
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
      </div>
    </div>
  );
};