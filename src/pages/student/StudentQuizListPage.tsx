import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Quiz } from '../../types/types';
import { quizService } from '../../services/quizService';
import toast from 'react-hot-toast';
import { QuizCard } from '../../components/student/QuizCard/QuizCard';
import { StudentCreatedQuizCard } from '../../components/student/StudentCreatedQuizCard';

export default function StudentQuizListPage() {
  const [activeTab, setActiveTab] = useState<'assigned' | 'created'>('assigned');
  const [assignedQuizzes, setAssignedQuizzes] = useState<Quiz[]>([]);
  const [createdQuizzes, setCreatedQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        
        // Fetch assigned quizzes
        const assignedResponse = await quizService.getStudentQuizzes();
        setAssignedQuizzes(assignedResponse.quizzes);
        
        // Fetch created quizzes
        const createdResponse = await quizService.getStudentCreatedQuizzes();
        setCreatedQuizzes(createdResponse.quizzes);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleTakeQuiz = (quizId: string) => {
    navigate(`/student/quizzes/take/${quizId}`);
  };

  const handleViewReport = (quizId: string) => {
    navigate(`/quiz-report/${quizId}`);
  };

  const handleCreateQuiz = () => {
    navigate('/student/quizzes/create');
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await quizService.deleteStudentQuiz(quizId);
      toast.success('Quiz deleted successfully');
      // Update the created quizzes list
      setCreatedQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizId));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Quizzes</h1>
        <button
          onClick={handleCreateQuiz}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Practice Quiz
        </button>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`${
              activeTab === 'assigned'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Assigned Quizzes
          </button>
          <button
            onClick={() => setActiveTab('created')}
            className={`${
              activeTab === 'created'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Created Quizzes
          </button>
        </nav>
      </div>
      
      {/* Assigned Quizzes Tab */}
      {activeTab === 'assigned' && (
        <>
          {assignedQuizzes.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">No assigned quizzes available at the moment.</p>
              <button
                onClick={handleCreateQuiz}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Your First Quiz
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedQuizzes.map((quiz) => (
                <QuizCard 
                  key={quiz.id}
                  quiz={quiz}
                  onTakeQuiz={handleTakeQuiz}
                  onViewReport={handleViewReport}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Created Quizzes Tab */}
      {activeTab === 'created' && (
        <>
          {createdQuizzes.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">You haven't created any quizzes yet.</p>
              <button
                onClick={handleCreateQuiz}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Your First Quiz
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdQuizzes.map((quiz) => (
                <StudentCreatedQuizCard 
                  key={quiz.id}
                  quiz={quiz}
                  onDelete={handleDeleteQuiz}
                  onTakeQuiz={handleTakeQuiz}
                  onViewReport={handleViewReport}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}