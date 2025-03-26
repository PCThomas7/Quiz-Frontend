import React from 'react';
import { QuestionTypePerformance } from '../../types/reportTypes';
import { PerformanceBarChart } from './PerformanceBarChart';
import { PerformancePieChart } from './PerformancePieChart';

interface QuestionTypePerformanceProps {
  questionTypeData: QuestionTypePerformance[];
}

export const QuestionTypePerformanceChart: React.FC<QuestionTypePerformanceProps> = ({ questionTypeData }) => {
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

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <PerformanceBarChart data={chartData} title="Question Type Performance" />
        <PerformancePieChart 
          data={pieData} 
          title="Question Distribution by Type" 
          colors={['#8b5cf6', '#ec4899']}
        />
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