import React, { useState, useEffect } from 'react';
import { FiUsers, FiFileText, FiCheckSquare, FiActivity, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';
import { API_URL } from '../../config';

interface DashboardStats {
  totalUsers: number;
  totalQuizzes: number;
  totalQuestions: number;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    date: string;
  }>;
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalQuizzes: 0,
    totalQuestions: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is a placeholder. In a real app, you would fetch actual data
    // from your backend API
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Uncomment and modify this when you have the actual API endpoint
        // const response = await axios.get(`${API_URL}/admin/dashboard-stats`);
        // setStats(response.data);
        
        // For now, we'll use mock data
        setTimeout(() => {
          setStats({
            totalUsers: 125,
            totalQuizzes: 48,
            totalQuestions: 342,
            recentActivity: [
              { id: '1', type: 'quiz', title: 'JavaScript Basics Quiz created', date: '2023-10-15' },
              { id: '2', type: 'user', title: 'New user John Doe registered', date: '2023-10-14' },
              { id: '3', type: 'question', title: '15 new questions added', date: '2023-10-13' },
              { id: '4', type: 'quiz', title: 'React Fundamentals Quiz updated', date: '2023-10-12' },
              { id: '5', type: 'user', title: 'User Jane Smith completed 3 quizzes', date: '2023-10-11' },
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ icon, title, value, color, bgColor }: { icon: React.ReactNode, title: string, value: number, color: string, bgColor: string }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition-shadow duration-300`}>
      <div className="flex items-center">
        <div className={`mr-4 p-3 rounded-full ${bgColor}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="text-sm text-gray-500 flex items-center">
          <FiTrendingUp className="mr-1" /> Last updated: Today
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<FiUsers className="h-6 w-6 text-blue-600" />} 
          title="Total Users" 
          value={stats.totalUsers} 
          color="border-blue-500"
          bgColor="bg-blue-100" 
        />
        <StatCard 
          icon={<FiFileText className="h-6 w-6 text-green-600" />} 
          title="Total Quizzes" 
          value={stats.totalQuizzes} 
          color="border-green-500"
          bgColor="bg-green-100" 
        />
        <StatCard 
          icon={<FiCheckSquare className="h-6 w-6 text-indigo-600" />} 
          title="Total Questions" 
          value={stats.totalQuestions} 
          color="border-indigo-500"
          bgColor="bg-indigo-100" 
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-blue-100 mr-2">
            <FiActivity className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="py-3 hover:bg-gray-50 px-2 rounded-md transition-colors duration-150">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.date}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {activity.type === 'quiz' ? 'Quiz' : activity.type === 'user' ? 'User' : 'Question'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;