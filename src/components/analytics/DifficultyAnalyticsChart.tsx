import React from 'react';
import { DifficultyPerformance } from '../../types/analyticsTypes';
import { PerformanceBarChart } from '../reports/PerformanceBarChart';
import { PerformancePieChart } from '../reports/PerformancePieChart';

interface DifficultyAnalyticsChartProps {
  difficultyData: DifficultyPerformance[];
}

export const DifficultyAnalyticsChart: React.FC<DifficultyAnalyticsChartProps> = ({ difficultyData }) => {
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

  // Sort difficulties by standard order: Easy, Medium, Hard
  const difficultyOrder = ['Easy', 'Medium', 'Hard'];
  const sortedDifficulties = [...difficultyData].sort((a, b) => 
    difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty)
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Difficulty-wise Performance Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <PerformanceBarChart data={chartData} title="Performance by Difficulty Level" />
        <PerformancePieChart 
          data={pieData} 
          title="Question Distribution by Difficulty" 
          colors={['#10b981', '#f59e0b', '#ef4444']}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Performance Across Difficulty Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedDifficulties.map((difficulty, index) => (
            <div key={index} className={`p-4 rounded-lg ${
              difficulty.difficulty === 'Easy' ? 'bg-green-50' : 
              difficulty.difficulty === 'Medium' ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <h4 className="font-medium mb-2">{difficulty.difficulty}</h4>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Score:</span>
                <span className="font-semibold">{difficulty.percentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Correct:</span>
                <span className="text-green-600">{difficulty.correctAnswers}/{difficulty.totalQuestions}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Incorrect:</span>
                <span className="text-red-600">{difficulty.incorrectAnswers}/{difficulty.totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Unattempted:</span>
                <span className="text-gray-600">{difficulty.unattempted}/{difficulty.totalQuestions}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Difficulty</th>
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