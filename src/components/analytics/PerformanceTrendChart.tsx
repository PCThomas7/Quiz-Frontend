import React from 'react';
import { RecentPerformance } from '../../types/analyticsTypes';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceTrendChartProps {
  performanceData: RecentPerformance[];
}

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({ performanceData }) => {
  const chartData = performanceData.map(item => ({
    name: new Date(item.submittedAt).toLocaleDateString(),
    score: Math.round(item.percentage),
    quizTitle: item.quizTitle
  }));

  // Calculate trend line data
  const calculateTrend = () => {
    if (performanceData.length < 2) return null;
    
    const n = performanceData.length;
    const indices = Array.from({ length: n }, (_, i) => i);
    const scores = performanceData.map(item => item.percentage);
    
    // Calculate slope and intercept for trend line
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = scores.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + x * scores[i], 0);
    const sumXX = indices.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Generate trend line data
    return indices.map(i => ({
      name: chartData[i].name,
      trend: Math.round(intercept + slope * i)
    }));
  };

  const trendData = calculateTrend();
  
  // Merge trend data with chart data if available
  const finalChartData = trendData 
    ? chartData.map((item, index) => ({
        ...item,
        trend: trendData[index].trend
      }))
    : chartData;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Performance Trend Analysis</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Score Trend Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={finalChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value, name) => [
                  `${value}${name === 'score' ? '%' : ''}`, 
                  name === 'score' ? 'Score' : 'Trend'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                name="Quiz Score"
              />
              {trendData && (
                <Line 
                  type="monotone" 
                  dataKey="trend" 
                  stroke="#82ca9d" 
                  strokeDasharray="5 5" 
                  name="Trend Line"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Date</th>
              <th className="py-2 px-4 border-b text-left">Quiz Title</th>
              <th className="py-2 px-4 border-b text-center">Score</th>
              <th className="py-2 px-4 border-b text-center">Max Score</th>
              <th className="py-2 px-4 border-b text-center">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {performanceData.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-2 px-4 border-b">{new Date(item.submittedAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{item.quizTitle}</td>
                <td className="py-2 px-4 border-b text-center">{item.score}</td>
                <td className="py-2 px-4 border-b text-center">{item.maxScore}</td>
                <td className="py-2 px-4 border-b text-center">{item.percentage.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};