import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Quiz } from '../types/types';
import { quizService } from '../services/quizService';
import { FaCalendarCheck, FaHistory, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { DashboardCard } from '../components/student/dashboard/DashboardCard';
import { QuizList } from '../components/student/dashboard/QuizList';
import { WelcomeCard } from '../components/student/dashboard/WelcomeCard';

export default function StudentDashboard() {
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<Quiz[]>([]);
  const [recentLength, setRecentLength] = useState<number>(0);
  const [upcomingLength, setUpcomingLength] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await quizService.getStudentQuizzes();
        
        // Filter for recent and upcoming quizzes
        const recent = response.quizzes?.filter((q: Quiz) => 
          q.attempted
        ).slice(0, 3) || [];

        const recentLength = response.quizzes?.filter((q: Quiz) => 
          q.attempted
        ).length || 0;
        
        // Sort upcoming quizzes by scheduled date if available
        const upcoming = response.quizzes?.filter((q: Quiz) => 
          !q.attempted
        ) || [];
        
        // Sort upcoming quizzes: scheduled ones first (by start date), then non-scheduled
        const sortedUpcoming = sortUpcomingQuizzes(upcoming).slice(0, 3);
        
        const upcomingLength = response.quizzes?.filter((q: Quiz) => 
          !q.attempted
        ).length || 0;
        
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

  const handleViewAnalytics = () => {
    navigate('/student/analytics');
  };

  const handleViewAllQuizzes = () => {
    navigate('/student/quizzes');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeCard userName={user?.name || 'Student'} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2"
        >
          <DashboardCard 
            title="Upcoming Quizzes" 
            icon={<FaCalendarCheck className="h-5 w-5" />}
            className="h-full"
          >
            <QuizList 
              quizzes={upcomingQuizzes}
              emptyMessage="No upcoming quizzes available."
              onQuizClick={handleTakeQuiz}
            />
            
            {upcomingLength > 3 && (
              <div className="mt-4 text-center">
                <button 
                  onClick={handleViewAllQuizzes}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  View all {upcomingLength} upcoming quizzes
                </button>
              </div>
            )}
          </DashboardCard>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DashboardCard 
            title="Performance" 
            icon={<FaChartLine className="h-5 w-5" />}
            className="h-full"
          >
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {recentLength}
              </div>
              <p className="text-gray-500 text-center mb-6">Quizzes completed</p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleViewAnalytics}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md shadow-sm hover:shadow transition-all duration-200"
              >
                View Analytics
              </motion.button>
            </div>
          </DashboardCard>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <DashboardCard 
          title="Recent Quizzes" 
          icon={<FaHistory className="h-5 w-5" />}
        >
          <QuizList 
            quizzes={recentQuizzes}
            emptyMessage="You haven't taken any quizzes yet."
            onQuizClick={handleViewReport}
            isRecent={true}
          />
          
          {recentLength > 3 && (
            <div className="mt-4 text-center">
              <button 
                onClick={handleViewAllQuizzes}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View all {recentLength} completed quizzes
              </button>
            </div>
          )}
        </DashboardCard>
      </motion.div>
    </div>
  );
}
