import React from 'react';
import { SubjectPerformance } from '../../types/analyticsTypes';
import { PerformanceBarChart } from '../reports/PerformanceBarChart';
import { PerformancePieChart } from '../reports/PerformancePieChart';

interface SubjectAnalyticsChartProps {
  subjectData: SubjectPerformance[];
}

export const SubjectAnalyticsChart: React.FC<SubjectAnalyticsChartProps> = ({ subjectData }) => {
  const chartData = subjectData.map((subject) => ({
    name: subject.subject,
    correct: subject.correctAnswers,
    incorrect: subject.incorrectAnswers,
    unattempted: subject.unattempted,
    percentage: subject.percentage,
  }));

  const pieData = subjectData.map((subject) => ({
    name: subject.subject,
    value: subject.totalQuestions,
  }));

  // Sort subjects by performance (highest to lowest)
  const sortedSubjects = [...subjectData].sort((a, b) => b.percentage - a.percentage);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Subject-wise Performance Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <PerformanceBarChart data={chartData} title="Subject Performance" />
        <PerformancePieChart 
          data={pieData} 
          title="Question Distribution by Subject" 
          colors={['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Strongest & Weakest Subjects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-700 mb-2">Top Performing Subjects</h4>
            <ul className="space-y-2">
              {sortedSubjects.slice(0, 3).map((subject, index) => (
                <li key={index} className="bg-green-50 p-3 rounded flex justify-between items-center">
                  <span>{subject.subject}</span>
                  <span className="font-semibold">{subject.percentage.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-red-700 mb-2">Subjects Needing Improvement</h4>
            <ul className="space-y-2">
              {sortedSubjects.slice(-3).reverse().map((subject, index) => (
                <li key={index} className="bg-red-50 p-3 rounded flex justify-between items-center">
                  <span>{subject.subject}</span>
                  <span className="font-semibold">{subject.percentage.toFixed(1)}%</span>
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
              <th className="py-2 px-4 border-b text-left">Subject</th>
              <th className="py-2 px-4 border-b text-center">Total Questions</th>
              <th className="py-2 px-4 border-b text-center">Correct</th>
              <th className="py-2 px-4 border-b text-center">Incorrect</th>
              <th className="py-2 px-4 border-b text-center">Unattempted</th>
              <th className="py-2 px-4 border-b text-center">Score</th>
              <th className="py-2 px-4 border-b text-center">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {subjectData.map((subject, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-2 px-4 border-b">{subject.subject}</td>
                <td className="py-2 px-4 border-b text-center">{subject.totalQuestions}</td>
                <td className="py-2 px-4 border-b text-center text-green-600">{subject.correctAnswers}</td>
                <td className="py-2 px-4 border-b text-center text-red-600">{subject.incorrectAnswers}</td>
                <td className="py-2 px-4 border-b text-center text-gray-500">{subject.unattempted}</td>
                <td className="py-2 px-4 border-b text-center">{subject.score}/{subject.maxScore}</td>
                <td className="py-2 px-4 border-b text-center">{subject.percentage.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};