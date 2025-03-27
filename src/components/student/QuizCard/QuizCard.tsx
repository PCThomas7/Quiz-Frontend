import React from 'react';
import { Quiz } from '../../../types/types';
import { FaClock } from 'react-icons/fa'; // Import clock icon

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

  // Check if quiz is scheduled and determine if it's available
  const isScheduled = quiz.isScheduled;
  const now = new Date();
  const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
  const endDate = quiz.endDate ? new Date(quiz.endDate) : null;
  
  // Quiz is available if:
  // 1. It's not scheduled, OR
  // 2. Current time is between start and end dates
  const isAvailable = !isScheduled || 
    (startDate && endDate && now >= startDate && now <= endDate);
  
  // Quiz is upcoming if it's scheduled but hasn't started yet
  const isUpcoming = isScheduled && startDate && now < startDate;
  
  // Quiz is expired if it's scheduled and end date has passed
  const isExpired = isScheduled && endDate && now > endDate;

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <span>Duration: {quiz.timeLimit} minutes</span>
          <span>{totalQuestions} questions</span>
        </div>
        
        {/* Display scheduling information if quiz is scheduled */}
        {isScheduled && startDate && endDate && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center text-gray-700 mb-1">
              <FaClock className="mr-2 text-indigo-500" />
              <span className="font-medium">Scheduled Quiz</span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Start: {formatDate(startDate)}</div>
              <div>End: {formatDate(endDate)}</div>
              {isUpcoming && (
                <div className="mt-1 text-yellow-600 font-medium">
                  Available in {Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60))} hours
                </div>
              )}
              {isExpired && (
                <div className="mt-1 text-red-600 font-medium">
                  Quiz has ended
                </div>
              )}
            </div>
          </div>
        )}
        
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
              disabled={!isAvailable}
              className={`flex-1 py-2 px-4 rounded transition-colors ${
                isAvailable 
                  ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Retake Quiz
            </button>
          </div>
        ) : (
          <button
            onClick={() => onTakeQuiz(quiz.id)}
            disabled={!isAvailable}
            className={`w-full py-2 px-4 rounded transition-colors ${
              isAvailable 
                ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isUpcoming ? "Coming Soon" : isExpired ? "Expired" : "Start Quiz"}
          </button>
        )}
      </div>
    </div>
  );
};