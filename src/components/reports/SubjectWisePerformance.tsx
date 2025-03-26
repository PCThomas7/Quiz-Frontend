import React from 'react';
import { SubjectPerformance } from '../../types/reportTypes';
import { PerformanceBarChart } from './PerformanceBarChart';

interface SubjectWisePerformanceProps {
  subjectData: SubjectPerformance[];
}

export const SubjectWisePerformanceChart: React.FC<SubjectWisePerformanceProps> = ({ subjectData }) => {
  const chartData = subjectData.map((subject) => ({
    name: subject.subject,
    correct: subject.correctAnswers,
    incorrect: subject.incorrectAnswers,
    unattempted: subject.unattempted,
    percentage: subject.percentage,
  }));

  return (
    <div className="mb-8">
      <PerformanceBarChart data={chartData} title="Subject-wise Performance" />
      
      <div className="mt-6 overflow-x-auto">
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