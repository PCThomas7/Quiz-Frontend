import React from 'react';
import { DifficultyPerformance } from '../../types/reportTypes';
import { PerformanceBarChart } from './PerformanceBarChart';
import { PerformancePieChart } from './PerformancePieChart';

interface DifficultyWisePerformanceProps {
  difficultyData: DifficultyPerformance[];
}

export const DifficultyWisePerformanceChart: React.FC<DifficultyWisePerformanceProps> = ({ difficultyData }) => {
  const chartData = difficultyData.map((difficulty) => ({
    name: difficulty.difficulty,
    correct: difficulty.correctAnswers,
    incorrect: difficulty.incorrectAnswers,
    unattempted: difficulty.unattempted,
    percentage: difficulty.percentage,
  }));

  const pieData = difficultyData.map((difficulty) => ({
    name: difficulty.difficulty,
    value: difficulty.totalQuestions,
  }));

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <PerformanceBarChart data={chartData} title="Difficulty-wise Performance" />
        <PerformancePieChart 
          data={pieData} 
          title="Question Distribution by Difficulty" 
          colors={['#60a5fa', '#f59e0b', '#ef4444']}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Difficulty Level</th>
              <th className="py-2 px-4 border-b text-center">Total Questions</th>
              <th className="py-2 px-4 border-b text-center">Correct</th>
              <th className="py-2 px-4 border-b text-center">Incorrect</th>
              <th className="py-2 px-4 border-b text-center">Unattempted</th>
              <th className="py-2 px-4 border-b text-center">Score</th>
              <th className="py-2 px-4 border-b text-center">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {difficultyData.map((difficulty, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-2 px-4 border-b">{difficulty.difficulty}</td>
                <td className="py-2 px-4 border-b text-center">{difficulty.totalQuestions}</td>
                <td className="py-2 px-4 border-b text-center text-green-600">{difficulty.correctAnswers}</td>
                <td className="py-2 px-4 border-b text-center text-red-600">{difficulty.incorrectAnswers}</td>
                <td className="py-2 px-4 border-b text-center text-gray-500">{difficulty.unattempted}</td>
                <td className="py-2 px-4 border-b text-center">{difficulty.score}/{difficulty.maxScore}</td>
                <td className="py-2 px-4 border-b text-center">{difficulty.percentage.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};