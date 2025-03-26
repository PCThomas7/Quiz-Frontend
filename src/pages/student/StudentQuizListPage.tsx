import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Quiz } from '../../types/types';
import { quizService } from '../../services/quizService';
import toast from 'react-hot-toast';

export default function StudentQuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await quizService.getStudentQuizzes();
        
        // Transform and filter quizzes if needed
        const availableQuizzes = response.quizzes.map(quiz => ({
          ...quiz,
          attempted: false, // You might want to check this from quiz attempts
          totalQuestions: quiz.sections.reduce(
            (acc, section) => acc + section.questions.length, 
            0
          )
        }));
        
        setQuizzes(availableQuizzes);
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
      
      {quizzes.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">No quizzes available at the moment.</p>
          <button
            onClick={handleCreateQuiz}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Your First Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>Duration: {quiz.timeLimit} minutes</span>
                  <span>{quiz.sections.reduce((acc, section) => acc + section.questions.length, 0)} questions</span>
                </div>
                
                {quiz.attempted ? (
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleViewReport(quiz.id)}
                      className="flex-1 bg-indigo-100 text-indigo-700 py-2 px-4 rounded hover:bg-indigo-200 transition-colors"
                    >
                      View Report
                    </button>
                    <button
                      onClick={() => handleTakeQuiz(quiz.id)}
                      className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
                    >
                      Retake Quiz
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleTakeQuiz(quiz.id)}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
                  >
                    Start Quiz
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}