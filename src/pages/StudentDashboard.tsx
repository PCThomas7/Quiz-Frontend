import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Quiz } from '../types/types';
import { quizService } from '../services/quizService';

export default function StudentDashboard() {
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real app, these would be separate API calls
        const response = await quizService.getStudentQuizzes();
        
        // Filter for recent and upcoming quizzes
        // The backend now provides the attempted status
        const recent = response.quizzes?.filter((q: Quiz) => 
          q.attempted
        ).slice(0, 3) || [];
        
        const upcoming = response.quizzes?.filter((q: Quiz) => 
          !q.attempted
        ).slice(0, 3) || [];
        
        setRecentQuizzes(recent);
        setUpcomingQuizzes(upcoming);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleViewAllQuizzes = () => {
    navigate('/student/quizzes');
  };

  const handleViewAnalytics = () => {
    navigate('/student/analytics');
  };

  const handleTakeQuiz = (quizId: string) => {
    navigate(`/student/quizzes/take/${quizId}`);
  };

  const handleViewReport = (quizId: string) => {
    navigate(`/quiz-report/${quizId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'Student'}</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-indigo-800 mb-2">Quizzes Completed</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {recentQuizzes.length}
            {console.log(recentQuizzes)}
          </p>
          <button 
            onClick={handleViewAllQuizzes}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-800"
          >
            View all quizzes →
          </button>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-green-800 mb-2">Average Score</h3>
          <p className="text-3xl font-bold text-green-600">
            {recentQuizzes.length > 0 
              ? `${Math.round(recentQuizzes.reduce((acc, quiz) => acc + (quiz.userScore || 0), 0) / recentQuizzes.length)}%` 
              : 'N/A'}
          </p>
          <button 
            onClick={handleViewAnalytics}
            className="mt-4 text-sm text-green-600 hover:text-green-800"
          >
            View analytics →
          </button>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Upcoming Quizzes</h3>
          <p className="text-3xl font-bold text-blue-600">
            {upcomingQuizzes.length}
          </p>
          <button 
            onClick={handleViewAllQuizzes}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            View upcoming →
          </button>
        </div>
      </div>

      {/* Recent Quizzes */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Quizzes</h2>
          <button 
            onClick={handleViewAllQuizzes}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            View all →
          </button>
        </div>
        
        {recentQuizzes.length === 0 ? (
          <p className="text-gray-500 py-4">No recent quizzes found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentQuizzes.map((quiz) => (
              <div key={quiz.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-900 mb-2">{quiz.title}</h3>
                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <span>Score: {quiz.userScore || 0}%</span>
                  <span>{new Date(quiz.updatedAt).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => handleViewReport(quiz.id)}
                  className="w-full mt-2 bg-indigo-100 text-indigo-700 py-2 px-3 rounded hover:bg-indigo-200 transition-colors"
                >
                  View Report
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Quizzes */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Quizzes</h2>
          <button 
            onClick={handleViewAllQuizzes}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            View all →
          </button>
        </div>
        
        {upcomingQuizzes.length === 0 ? (
          <p className="text-gray-500 py-4">No upcoming quizzes found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingQuizzes.map((quiz) => (
              <div key={quiz.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-900 mb-2">{quiz.title}</h3>
                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <span>Duration: {quiz.total_duration} min</span>
                  <span>{quiz.sections.reduce((acc, section) => acc + section.questions.length, 0)} questions</span>
                </div>
                <button
                  onClick={() => handleTakeQuiz(quiz.id)}
                  className="w-full mt-2 bg-indigo-600 text-white py-2 px-3 rounded hover:bg-indigo-700 transition-colors"
                >
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
