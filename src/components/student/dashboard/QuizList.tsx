import React from 'react';
import { motion } from 'framer-motion';
import { Quiz } from '../../../types/types';
import { FaClock, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';

interface QuizListProps {
  quizzes: Quiz[];
  emptyMessage: string;
  onQuizClick: (quizId: string) => void;
  isRecent?: boolean;
}

export const QuizList: React.FC<QuizListProps> = ({ 
  quizzes, 
  emptyMessage, 
  onQuizClick,
  isRecent = false
}) => {
  if (quizzes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      {quizzes.map((quiz) => {
        const isScheduled = quiz.isScheduled;
        const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
        const now = new Date();
        const isUpcoming = isScheduled && startDate && now < startDate;
        
        return (
          <motion.div
            key={quiz.id}
            variants={item}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => onQuizClick(quiz.id)}
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{quiz.title}</h4>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaClock className="mr-1 text-gray-400" />
                    <span>{quiz.timeLimit} minutes</span>
                    
                    {isRecent && quiz.score !== undefined && (
                      <div className="ml-4 flex items-center">
                        <FaCheckCircle className="mr-1 text-green-500" />
                        <span>Score: {quiz.score}%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {isUpcoming && (
                  <div className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
                    <FaCalendarAlt className="mr-1" />
                    {startDate && formatDate(startDate.toString())}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};