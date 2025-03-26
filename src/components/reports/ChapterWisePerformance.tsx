import React, { useState } from 'react';
import { ChapterPerformance } from '../../types/reportTypes';
import { PerformanceBarChart } from './PerformanceBarChart';

interface ChapterWisePerformanceProps {
  chapterData: ChapterPerformance[];
}

export const ChapterWisePerformanceChart: React.FC<ChapterWisePerformanceProps> = ({ chapterData }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  
  const subjects = [...new Set(chapterData.map(item => item.subject))];
  
  const filteredChapters = selectedSubject === 'all' 
    ? chapterData 
    : chapterData.filter(chapter => chapter.subject === selectedSubject);
  
  const chartData = filteredChapters.map((chapter) => ({
    name: chapter.chapter,
    correct: chapter.correctAnswers,
    incorrect: chapter.incorrectAnswers,
    unattempted: chapter.unattempted,
    percentage: chapter.percentage,
  }));

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chapter-wise Performance</h2>
        <div>
          <label htmlFor="subject-filter" className="mr-2">Filter by Subject:</label>
          <select
            id="subject-filter"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>
      
      <PerformanceBarChart data={chartData} title="Chapter-wise Performance" />
      
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Subject</th>
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
            {filteredChapters.map((chapter, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-2 px-4 border-b">{chapter.subject}</td>
                <td className="py-2 px-4 border-b">{chapter.chapter}</td>
                <td className="py-2 px-4 border-b text-center">{chapter.totalQuestions}</td>
                <td className="py-2 px-4 border-b text-center text-green-600">{chapter.correctAnswers}</td>
                <td className="py-2 px-4 border-b text-center text-red-600">{chapter.incorrectAnswers}</td>
                <td className="py-2 px-4 border-b text-center text-gray-500">{chapter.unattempted}</td>
                <td className="py-2 px-4 border-b text-center">{chapter.score}/{chapter.maxScore}</td>
                <td className="py-2 px-4 border-b text-center">{chapter.percentage.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};