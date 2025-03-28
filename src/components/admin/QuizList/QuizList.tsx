import { useState, useEffect } from 'react';
import { Quiz } from '../../../types/types';
import { PrintView } from '../PrintView/PrintView';
import { quizService } from '../../../services/quizService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Add this import
import './QuizList.css';

interface QuizListProps {
  onEditQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: string) => void;
  onDuplicateQuiz: (quiz: Quiz) => void;
  onTakeQuiz: (quiz: Quiz) => void;
  onCreateQuiz: () => void;
}

export function QuizList({ 
  onEditQuiz,
  onDeleteQuiz,  // Add this prop
  onDuplicateQuiz, 
  onTakeQuiz,
  onCreateQuiz
}: QuizListProps) {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuizForPrint, setSelectedQuizForPrint] = useState<Quiz | null>(null);
  const [showPrintView, setShowPrintView] = useState(false);

// Helper function to calculate total marks if not provided
// Update the calculateTotalMarks function to handle populated questions
function calculateTotalMarks(quiz: Quiz): number {
  if (!quiz.sections) return 0;
  
  return quiz.sections.reduce((total, section) => {
    // Handle both string IDs and populated question objects
    const sectionMarks = section.questions?.reduce((sum, q) => {
      // Check if q is a string (ID) or an object (populated question)
      if (typeof q === 'string') {
        return sum + (section.marks || 0); // Use section marks as fallback
      } else {
        // q is a populated question object
        return sum + (q.score || q.marks || section.marks || 0);
      }
    }, 0) || 0;
    
    return total + sectionMarks;
  }, 0);
}

// Update the useEffect for fetching quizzes
useEffect(() => {
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuizzes();
      
      // Check if we have quizzes data with populated questions
      if (response.quizzes) {
        // Ensure each quiz has required properties
        const processedQuizzes = response.quizzes.map(quiz => ({
          ...quiz,
          id: quiz.id || quiz._id,
          header: quiz.header || [],        // Initialize empty array if header is undefined
          instructions: quiz.instructions || [], // Initialize empty array if instructions is undefined
          footer: quiz.footer || [],        // Initialize empty array if footer is undefined
          sections: quiz.sections || [],    // Initialize empty array if sections is undefined
          watermark: quiz.watermark || {}   // Initialize empty object if watermark is undefined
        }));
        
        setQuizzes(processedQuizzes);
      } else {
        // Process the response if it's directly an array
        const processedQuizzes = response.map(quiz => ({
          ...quiz,
          id: quiz.id || quiz._id,
          header: quiz.header || [],
          instructions: quiz.instructions || [],
          footer: quiz.footer || [],
          sections: quiz.sections || [],
          watermark: quiz.watermark || {}
        }));
        setQuizzes(processedQuizzes);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  fetchQuizzes();
}, []);

// Update the onEditQuiz handler to ensure all required properties exist
const handleEditQuiz = (quiz: Quiz) => {
  const preparedQuiz = {
    ...quiz,
    header: quiz.header || [],
    instructions: quiz.instructions || [],
    footer: quiz.footer || [],
    sections: quiz.sections || [],
    watermark: quiz.watermark || {}
  };
  onEditQuiz(preparedQuiz);
};

// Update the button onClick to use the new handler
<button
  onClick={() => handleEditQuiz(quiz)}
  className="text-indigo-600 hover:text-indigo-900"
>
  Edit
</button>

  const handlePrintQuiz = (quiz: Quiz) => {
    setSelectedQuizForPrint(quiz);
    setShowPrintView(true);
    // Hide the navbar when showing print view
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.style.display = 'none';
    }
  };

  const handleBack = () => {
    setShowPrintView(false);
    setSelectedQuizForPrint(null);
    // Show the navbar when returning to list view
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.style.display = 'flex';
    }
  };

  // Handle quiz deletion with backend integration
  // Update the handleDeleteQuiz function
  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This will also delete all attempts and cannot be undone.')) {
        return;
    }

    try {
        setLoading(true);
        const specificQuiz = quizzes.find(q => q.id === quizId);
        if (!specificQuiz) {
            throw new Error('Quiz not found');
        }

        await quizService.deleteQuiz(quizId);
        
        // Update local state only for the specific quiz
        setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizId));
        toast.success('Quiz deleted successfully');
        
        // Notify parent component
        onDeleteQuiz(quizId);
    } catch (error: any) {
        console.error('Error deleting quiz:', error);
        toast.error(error.message || 'Failed to delete quiz. Please try again.');
    } finally {
        setLoading(false);
    }
};

// Update the delete button in the table
<button
  onClick={() => handleDeleteQuiz(quiz.id)}
  className="text-red-600 hover:text-red-900 disabled:opacity-50"
  disabled={loading}
>
  {loading ? 'Deleting...' : 'Delete'}
</button>

  // Add a function to navigate to the quiz report
  const handleViewReport = (quizId: string) => {
    navigate(`/quiz-report/${quizId}`);
  };

  if (showPrintView && selectedQuizForPrint) {
    return (
      <div className="print-container">
        <div className="print-controls fixed top-4 right-4 flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Print
          </button>
          <button
            onClick={handleBack}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back
          </button>
        </div>

        <PrintView
          quiz={selectedQuizForPrint}
          instituteDetails={{
            name: selectedQuizForPrint.header?.[0] || "PROF. P.C.THOMAS CLASSES & CHAITHANYA CLASSES",
            tagline: "To God, through Education",
          }}
          testDetails={{
            title: selectedQuizForPrint.title,
            batch: `${selectedQuizForPrint.title} - ${new Date(selectedQuizForPrint.createdAt).toLocaleDateString('en-GB')}`,
            date: new Date(selectedQuizForPrint.createdAt).toLocaleDateString('en-GB'),
            subject: selectedQuizForPrint.sections[0].name
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Quizzes</h1>
              <p className="mt-2 text-sm text-gray-700">A list of all quizzes in your question bank.</p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                onClick={onCreateQuiz}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Create Quiz
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
              {error}
            </div>
          )}

          {!loading && !error && quizzes.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No quizzes found. Create your first quiz!</p>
            </div>
          )}

          {!loading && quizzes.length > 0 && (
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          Title
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Duration
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Total Marks
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Sections
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quizzes.map((quiz) => (
                        <tr key={quiz.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                            {quiz.title}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {quiz.timeLimit || quiz.totalDuration} minutes
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {quiz.totalMarks || calculateTotalMarks(quiz)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {quiz.sections?.length || 0}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handlePrintQuiz(quiz)}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Print Quiz
                              </button>
                              <button
                                onClick={() => onTakeQuiz(quiz)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Take Quiz
                              </button>
                              <button
                                onClick={() => handleViewReport(quiz.id)}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                View Report
                              </button>
                              <button
                                onClick={() => handleEditQuiz(quiz)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => onDuplicateQuiz(quiz)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Duplicate
                              </button>
                              <button
                                onClick={() => handleDeleteQuiz(quiz.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


