import React from 'react';
import { ChapterPerformance } from '../../types/reportTypes';
import { PerformanceBarChart } from './PerformanceBarChart';

interface ChapterWisePerformanceProps {
  chapterData: ChapterPerformance[];
}

export const ChapterWisePerformanceChart: React.FC<ChapterWisePerformanceProps> = ({ chapterData }) => {
  // Group chapters by subject
  const subjectGroups = chapterData.reduce((groups, chapter) => {
    const subject = chapter.subject;
    if (!groups[subject]) {
      groups[subject] = [];
    }
    groups[subject].push(chapter);
    return groups;
  }, {} as Record<string, ChapterPerformance[]>);

  return (
    <div className="space-y-8">
      {Object.entries(subjectGroups).map(([subject, chapters]) => {
        const chartData = chapters.map((chapter) => ({
          name: chapter.chapter,
          correct: chapter.correctAnswers,
          incorrect: chapter.incorrectAnswers,
          unattempted: chapter.unattempted,
          percentage: chapter.percentage,
        }));

        return (
          <div key={subject} className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">{subject} - Chapter Performance</h2>
            
            <PerformanceBarChart data={chartData} title={`${subject} Chapters Performance`} />
            
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Chapter</th>
                    <th className="py-2 px-4 border-b text-center">Total Questions</th>
                    <th className="py-2 px-4 border-b text-center">Correct</th>
                    <th className="py-2 px-4 border-b text-center">Incorrect</th>
                    <th className="py-2 px-4 border-b text-center">Unattempted</th>
                    <th className="py-2 px-4 border-b text-center">Score</th>
                    <th className="py-2 px-4 border-b text-center">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {chapters.map((chapter, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-4 border-b">{chapter.chapter}</td>
                      <td className="py-2 px-4 border-b text-center">{chapter.totalQuestions}</td>
                      <td className="py-2 px-4 border-b text-center text-green-600">
                        {chapter.correctAnswers}
                      </td>
                      <td className="py-2 px-4 border-b text-center text-red-600">
                        {chapter.incorrectAnswers}
                      </td>
                      <td className="py-2 px-4 border-b text-center text-gray-500">
                        {chapter.unattempted}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {chapter.score}/{chapter.maxScore}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {chapter.percentage.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};