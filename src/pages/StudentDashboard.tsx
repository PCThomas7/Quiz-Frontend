import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Quiz } from '../types/types';
import { quizService } from '../services/quizService';
import { FaClock } from 'react-icons/fa'; // Import clock icon for scheduled quizzes

export default function StudentDashboard() {
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<Quiz[]>([]);
  const [recentLength, setRecentLength] = useState<Number>(0);
  const [upcomingLength, setUpcomingLength] = useState<Number>(0);
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

        const recentLength = response.quizzes?.filter((q: Quiz) => 
          q.attempted
        ).length || [].length;
        
        // Sort upcoming quizzes by scheduled date if available
        const upcoming = response.quizzes?.filter((q: Quiz) => 
          !q.attempted
        ) || [];
        
        // Sort upcoming quizzes: scheduled ones first (by start date), then non-scheduled
        const sortedUpcoming = sortUpcomingQuizzes(upcoming).slice(0, 3);
        
        const upcomingLength = response.quizzes?.filter((q: Quiz) => 
          !q.attempted
        ).length || [].length;
        
        setRecentQuizzes(recent);
        setUpcomingQuizzes(sortedUpcoming);
        setRecentLength(recentLength);
        setUpcomingLength(upcomingLength);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to sort upcoming quizzes
  const sortUpcomingQuizzes = (quizzes: Quiz[]) => {
    const now = new Date();
    
    return [...quizzes].sort((a, b) => {
      // If both quizzes are scheduled
      if (a.isScheduled && b.isScheduled) {
        const aStartDate = a.startDate ? new Date(a.startDate) : null;
        const bStartDate = b.startDate ? new Date(b.startDate) : null;
        
        // If both have start dates, sort by earliest first
        if (aStartDate && bStartDate) {
          return aStartDate.getTime() - bStartDate.getTime();
        }
        
        // If only one has a start date, prioritize it
        if (aStartDate) return -1;
        if (bStartDate) return 1;
      }
      
      // If only one quiz is scheduled, prioritize it
      if (a.isScheduled && !b.isScheduled) return -1;
      if (!a.isScheduled && b.isScheduled) return 1;
      
      // If neither is scheduled, keep original order
      return 0;
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if a quiz is available based on schedule
  const isQuizAvailable = (quiz: Quiz) => {
    if (!quiz.isScheduled) return true;
    
    const now = new Date();
    const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
    const endDate = quiz.endDate ? new Date(quiz.endDate) : null;
    
    return !startDate || !endDate || (now >= startDate && now <= endDate);
  };

  const handleViewAllQuizzes = () => {
    navigate('/student/quizzes');
  };

  const handleViewAnalytics = () => {
    navigate('/student/analytics');
  };

  const handleTakeQuiz = (quizId: string) => {
    // Find the quiz
    const quiz = upcomingQuizzes.find(q => q.id === quizId);
    
    // Check if quiz is available based on schedule
    if (quiz && quiz.isScheduled) {
      const now = new Date();
      const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
      
      if (startDate && now < startDate) {
        // Quiz is not available yet
        return;
      }
    }
    
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
            {recentLength}
           
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
            {upcomingLength}
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
                
                {/* Show scheduled info if quiz is scheduled */}
                {quiz.isScheduled && quiz.startDate && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <FaClock className="mr-1 text-indigo-500" />
                    <span>
                      {formatDate(quiz.startDate)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <span>Duration: {quiz.timeLimit || quiz.total_duration} min</span>
                  <span>{quiz.sections.reduce((acc, section) => acc + section.questions.length, 0)} questions</span>
                </div>
                
                <button
                  onClick={() => handleTakeQuiz(quiz.id)}
                  disabled={quiz.isScheduled && !isQuizAvailable(quiz)}
                  className={`w-full mt-2 py-2 px-3 rounded transition-colors ${
                    (!quiz.isScheduled || isQuizAvailable(quiz))
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {quiz.isScheduled && !isQuizAvailable(quiz) 
                    ? "Coming Soon" 
                    : "Start Quiz"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
