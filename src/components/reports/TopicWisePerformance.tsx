import React from 'react';
import { TopicPerformance } from '../../types/reportTypes';
import { PerformanceBarChart } from './PerformanceBarChart';

interface TopicWisePerformanceProps {
  topicData: TopicPerformance[];
}

export const TopicWisePerformanceChart: React.FC<TopicWisePerformanceProps> = ({ topicData }) => {
  // Group topics by subject and chapter
  const subjectGroups = topicData.reduce((groups, topic) => {
    const subject = topic.subject;
    const chapter = topic.chapter;
    
    if (!groups[subject]) {
      groups[subject] = {};
    }
    if (!groups[subject][chapter]) {
      groups[subject][chapter] = [];
    }
    groups[subject][chapter].push(topic);
    return groups;
  }, {} as Record<string, Record<string, TopicPerformance[]>>);

  return (
    <div className="space-y-8">
      {Object.entries(subjectGroups).map(([subject, chapterGroups]) => (
        <div key={subject} className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">{subject}</h2>
          
          <div className="space-y-6">
            {Object.entries(chapterGroups).map(([chapter, topics]) => {
              const chartData = topics.map((topic) => ({
                name: topic.topic,
                correct: topic.correctAnswers,
                incorrect: topic.incorrectAnswers,
                unattempted: topic.unattempted,
                percentage: topic.percentage,
              }));

              return (
                <div key={chapter} className="border rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4">{chapter}</h3>
                  
                  <PerformanceBarChart 
                    data={chartData} 
                    title={`${chapter} - Topic Performance`} 
                  />
                  
                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-2 px-4 border-b text-left">Topic</th>
                          <th className="py-2 px-4 border-b text-center">Total Questions</th>
                          <th className="py-2 px-4 border-b text-center">Correct</th>
                          <th className="py-2 px-4 border-b text-center">Incorrect</th>
                          <th className="py-2 px-4 border-b text-center">Unattempted</th>
                          <th className="py-2 px-4 border-b text-center">Score</th>
                          <th className="py-2 px-4 border-b text-center">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topics.map((topic, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-2 px-4 border-b">{topic.topic}</td>
                            <td className="py-2 px-4 border-b text-center">{topic.totalQuestions}</td>
                            <td className="py-2 px-4 border-b text-center text-green-600">
                              {topic.correctAnswers}
                            </td>
                            <td className="py-2 px-4 border-b text-center text-red-600">
                              {topic.incorrectAnswers}
                            </td>
                            <td className="py-2 px-4 border-b text-center text-gray-500">
                              {topic.unattempted}
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                              {topic.score}/{topic.maxScore}
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                              {topic.percentage.toFixed(2)}%
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
        </div>
      ))}
    </div>
  );
};