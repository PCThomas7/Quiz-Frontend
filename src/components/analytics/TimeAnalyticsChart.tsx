import React from 'react';
import { TimeSpentAnalysis } from '../../types/analyticsTypes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TimeAnalyticsChartProps {
  timeData: TimeSpentAnalysis;
  totalQuizzes: number;
}

export const TimeAnalyticsChart: React.FC<TimeAnalyticsChartProps> = ({ timeData, totalQuizzes }) => {
  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format time for chart (convert to minutes for better visualization)
  const formatTimeForChart = (seconds: number) => {
    return Math.round(seconds / 60 * 10) / 10; // Convert to minutes with 1 decimal place
  };

  const chartData = [
    {
      name: 'Avg. Time per Quiz',
      minutes: formatTimeForChart(timeData.averageTimePerQuiz),
      label: formatTime(timeData.averageTimePerQuiz)
    },
    {
      name: 'Avg. Time per Question',
      minutes: formatTimeForChart(timeData.averageTimePerQuestion),
      label: formatTime(timeData.averageTimePerQuestion)
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Time Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-purple-800 mb-2">Total Time Spent</h3>
          <p className="text-2xl font-bold text-purple-700">
            {formatTime(timeData.totalTimeSpent)}
          </p>
          <p className="text-sm text-purple-600 mt-1">
            Across {totalQuizzes} quizzes
          </p>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-indigo-800 mb-2">Average Time per Quiz</h3>
          <p className="text-2xl font-bold text-indigo-700">
            {formatTime(timeData.averageTimePerQuiz)}
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Average Time per Question</h3>
          <p className="text-2xl font-bold text-blue-700">
            {formatTime(timeData.averageTimePerQuestion)}
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Time Metrics Comparison</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => [`${value} minutes`, 'Time']}
                labelFormatter={(label) => label}
              />
              <Legend />
              <Bar dataKey="minutes" name="Time (minutes)" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-3">Time Management Insights</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-1">Total Quiz Time</h4>
            <p className="text-gray-600">
              You've spent a total of {formatTime(timeData.totalTimeSpent)} taking quizzes.
              {timeData.totalTimeSpent > 3600 && ' That\'s more than an hour of focused learning!'}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-1">Quiz Completion Speed</h4>
            <p className="text-gray-600">
              On average, you spend {formatTime(timeData.averageTimePerQuiz)} on each quiz.
              {timeData.averageTimePerQuiz < 600 
                ? ' You tend to complete quizzes quickly, which could be a sign of confidence or rushing.'
                : ' You take your time with quizzes, which often leads to better accuracy.'}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-1">Question Response Time</h4>
            <p className="text-gray-600">
              Your average time per question is {formatTime(timeData.averageTimePerQuestion)}.
              {timeData.averageTimePerQuestion < 30 
                ? ' Quick responses can be good, but make sure you\'re reading questions thoroughly.'
                : ' You take time to consider each question, which often leads to better results.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};