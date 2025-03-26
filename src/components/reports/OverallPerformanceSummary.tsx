import React from 'react';
import { DetailedQuizReport } from '../../types/reportTypes';
import { PerformancePieChart } from './PerformancePieChart';

interface OverallPerformanceSummaryProps {
  report: DetailedQuizReport;
}

export const OverallPerformanceSummary: React.FC<OverallPerformanceSummaryProps> = ({ report }) => {
  const { overallPerformance } = report;
  
  const pieData = [
    { name: 'Correct', value: overallPerformance.correctAnswers },
    { name: 'Incorrect', value: overallPerformance.incorrectAnswers },
    { name: 'Unattempted', value: overallPerformance.unattempted },
  ];
  
  // Format time spent
  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Overall Performance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Score Summary</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Total Score</p>
              <p className="text-2xl font-bold">{overallPerformance.score}/{overallPerformance.maxScore}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Percentage</p>
              <p className="text-2xl font-bold">{overallPerformance.percentage.toFixed(2)}%</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Time Spent</p>
              <p className="text-2xl font-bold">{formatTimeSpent(overallPerformance.timeSpent)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Total Questions</p>
              <p className="text-2xl font-bold">{overallPerformance.totalQuestions}</p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
                <span className="text-lg font-bold">{overallPerformance.correctAnswers}</span>
              </div>
              <p className="text-sm">Correct</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-2">
                <span className="text-lg font-bold">{overallPerformance.incorrectAnswers}</span>
              </div>
              <p className="text-sm">Incorrect</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-600 mb-2">
                <span className="text-lg font-bold">{overallPerformance.unattempted}</span>
              </div>
              <p className="text-sm">Unattempted</p>
            </div>
          </div>
        </div>
        
        <PerformancePieChart 
          data={pieData} 
          title="Question Response Distribution" 
          colors={['#4ade80', '#f87171', '#94a3b8']}
        />
      </div>
    </div>
  );
};