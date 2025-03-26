import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceBarChartProps {
  data: {
    name: string;
    correct: number;
    incorrect: number;
    unattempted: number;
    percentage?: number;
  }[];
  title: string;
}

export const PerformanceBarChart: React.FC<PerformanceBarChartProps> = ({ data, title }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="correct" name="Correct" fill="#10B981" />
            <Bar dataKey="incorrect" name="Incorrect" fill="#EF4444" />
            <Bar dataKey="unattempted" name="Unattempted" fill="#6B7280" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};