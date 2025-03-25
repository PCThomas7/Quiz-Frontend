import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz } from '../../types/types';
import { toast } from 'react-hot-toast';
import { quizService } from '../../services/quizService';

export default function StudentQuizBuilderPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30); // Default 30 minutes
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create a basic quiz structure
      const newQuiz: Partial<Quiz> = {
        title: title.trim(),
        total_duration: duration,
        sections: [],
        header: [],
        instructions: [],
        footer: [],
        watermark: {},
      };
      
      // Call API to generate quiz
      const response = await quizService.generateStudentQuiz(newQuiz);
      
      toast.success('Quiz generated successfully!');
      navigate(`/student/quizzes/take/${response.quiz.id}`);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Create Practice Quiz</h1>
        <button
          onClick={() => navigate('/student/quizzes')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {/* Quiz Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Quiz Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter quiz title"
              />
            </div>

            {/* Quiz Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="5"
                max="180"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Generate Button */}
            <div className="pt-5">
              <button
                type="button"
                onClick={handleGenerateQuiz}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Quiz...
                  </>
                ) : (
                  'Generate Practice Quiz'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-2">How it works:</h3>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Enter a title for your practice quiz</li>
          <li>Set the duration in minutes</li>
          <li>Click "Generate Practice Quiz" to create a quiz with questions matching your learning level</li>
          <li>The quiz will be automatically generated based on your previous performance</li>
        </ul>
      </div>
    </div>
  );
}