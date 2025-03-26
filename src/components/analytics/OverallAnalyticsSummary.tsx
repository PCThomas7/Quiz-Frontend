import React from 'react';
import { StudentAnalytics } from '../../types/analyticsTypes';
import { PerformancePieChart } from '../reports/PerformancePieChart';

interface OverallAnalyticsSummaryProps {
  analytics: StudentAnalytics;
}

export const OverallAnalyticsSummary: React.FC<OverallAnalyticsSummaryProps> = ({ analytics }) => {
  const pieData = [
    { name: 'Correct', value: analytics.correctAnswers },
    { name: 'Incorrect', value: analytics.incorrectAnswers },
    { name: 'Unattempted', value: analytics.unattempted },
  ];
  
  // Format time spent
  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Overall Performance Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Quizzes</p>
              <p className="text-2xl font-bold text-indigo-700">{analytics.totalAttempts}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Average Score</p>
              <p className="text-2xl font-bold text-green-700">{analytics.averageScore.toFixed(2)}%</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Questions</p>
              <p className="text-2xl font-bold text-blue-700">{analytics.totalQuestions}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Time Spent</p>
              <p className="text-2xl font-bold text-purple-700">{formatTimeSpent(analytics.timeSpentAnalysis.totalTimeSpent)}</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Answer Distribution</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-500">Correct</p>
                <p className="text-xl font-bold text-green-600">{analytics.correctAnswers}</p>
                <p className="text-xs text-gray-500">
                  {analytics.totalQuestions > 0 
                    ? `${((analytics.correctAnswers / analytics.totalQuestions) * 100).toFixed(1)}%` 
                    : '0%'}
                </p>
              </div>
              
              <div className="bg-red-50 p-3 rounded">
                <p className="text-sm text-gray-500">Incorrect</p>
                <p className="text-xl font-bold text-red-600">{analytics.incorrectAnswers}</p>
                <p className="text-xs text-gray-500">
                  {analytics.totalQuestions > 0 
                    ? `${((analytics.incorrectAnswers / analytics.totalQuestions) * 100).toFixed(1)}%` 
                    : '0%'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Unattempted</p>
                <p className="text-xl font-bold text-gray-600">{analytics.unattempted}</p>
                <p className="text-xs text-gray-500">
                  {analytics.totalQuestions > 0 
                    ? `${((analytics.unattempted / analytics.totalQuestions) * 100).toFixed(1)}%` 
                    : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold mb-3">Answer Distribution</h3>
          <div className="flex-1 flex items-center justify-center">
            <PerformancePieChart 
              data={pieData} 
              title="" 
              colors={['#10B981', '#EF4444', '#6B7280']}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Time Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Total Time Spent</p>
            <p className="text-xl font-bold">{formatTimeSpent(analytics.timeSpentAnalysis.totalTimeSpent)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Average Time per Quiz</p>
            <p className="text-xl font-bold">{formatTimeSpent(analytics.timeSpentAnalysis.averageTimePerQuiz)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Average Time per Question</p>
            <p className="text-xl font-bold">{formatTimeSpent(analytics.timeSpentAnalysis.averageTimePerQuestion)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};