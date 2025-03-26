import React from 'react';
import { QuestionTypePerformance } from '../../types/analyticsTypes';
import { PerformanceBarChart } from '../reports/PerformanceBarChart';
import { PerformancePieChart } from '../reports/PerformancePieChart';

interface QuestionTypeAnalyticsChartProps {
  questionTypeData: QuestionTypePerformance[];
}

export const QuestionTypeAnalyticsChart: React.FC<QuestionTypeAnalyticsChartProps> = ({ questionTypeData }) => {
  const chartData = questionTypeData.map((type) => ({
    name: type.questionType,
    correct: type.correctAnswers,
    incorrect: type.incorrectAnswers,
    unattempted: type.unattempted,
    percentage: type.percentage,
  }));

  const pieData = questionTypeData.map((type) => ({
    name: type.questionType,
    value: type.totalQuestions,
  }));

  // Sort question types by performance (highest to lowest)
  const sortedTypes = [...questionTypeData].sort((a, b) => b.percentage - a.percentage);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Question Type Performance Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <PerformanceBarChart data={chartData} title="Performance by Question Type" />
        <PerformancePieChart 
          data={pieData} 
          title="Question Distribution by Type" 
          colors={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ef4444']}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Question Type Strengths & Weaknesses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-700 mb-2">Best Performing Question Types</h4>
            <ul className="space-y-2">
              {sortedTypes.slice(0, 3).map((type, index) => (
                <li key={index} className="bg-green-50 p-3 rounded flex justify-between items-center">
                  <span>{type.questionType}</span>
                  <span className="font-semibold">{type.percentage.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-red-700 mb-2">Question Types Needing Improvement</h4>
            <ul className="space-y-2">
              {sortedTypes.slice(-3).reverse().map((type, index) => (
                <li key={index} className="bg-red-50 p-3 rounded flex justify-between items-center">
                  <span>{type.questionType}</span>
                  <span className="font-semibold">{type.percentage.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Question Type</th>
              <th className="py-2 px-4 border-b text-center">Total Questions</th>
              <th className="py-2 px-4 border-b text-center">Correct</th>
              <th className="py-2 px-4 border-b text-center">Incorrect</th>
              <th className="py-2 px-4 border-b text-center">Unattempted</th>
              <th className="py-2 px-4 border-b text-center">Score</th>
              <th className="py-2 px-4 border-b text-center">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {questionTypeData.map((type, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-2 px-4 border-b">{type.questionType}</td>
                <td className="py-2 px-4 border-b text-center">{type.totalQuestions}</td>
                <td className="py-2 px-4 border-b text-center text-green-600">{type.correctAnswers}</td>
                <td className="py-2 px-4 border-b text-center text-red-600">{type.incorrectAnswers}</td>
                <td className="py-2 px-4 border-b text-center text-gray-500">{type.unattempted}</td>
                <td className="py-2 px-4 border-b text-center">{type.score}/{type.maxScore}</td>
                <td className="py-2 px-4 border-b text-center">{type.percentage.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};