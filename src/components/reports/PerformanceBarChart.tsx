import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PerformanceData {
  name: string;
  correct: number;
  incorrect: number;
  unattempted: number;
  percentage: number;
}

interface PerformanceBarChartProps {
  data: PerformanceData[];
  title: string;
}

export const PerformanceBarChart: React.FC<PerformanceBarChartProps> = ({ data, title }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="correct" name="Correct" fill="#4ade80" />
          <Bar yAxisId="left" dataKey="incorrect" name="Incorrect" fill="#f87171" />
          <Bar yAxisId="left" dataKey="unattempted" name="Unattempted" fill="#94a3b8" />
          <Bar yAxisId="right" dataKey="percentage" name="Percentage (%)" fill="#60a5fa" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};