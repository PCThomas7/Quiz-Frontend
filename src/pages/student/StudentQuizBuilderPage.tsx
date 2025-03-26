import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz, Question, TagSystem } from '../../types/types';
import { toast } from 'react-hot-toast';
import { quizService } from '../../services/quizService';
import { questionService } from '../../services/questionService';
import { QuizGeneratorWizard } from '../../components/admin/QuizBuilder/QuizGeneratorWizard';

export default function StudentQuizBuilderPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tagSystem, setTagSystem] = useState<TagSystem | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  // Fetch questions and tag system based on student's batch
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        // Fetch questions available for the student
        const response = await quizService.getStudentQuizzes();
        const availableQuestions = response.questions || [];
        setQuestions(availableQuestions);

        // Fetch tag system based on student's batch and exams
        const tagResponse = await questionService.getTagSystem();
        setTagSystem(tagResponse.tagSystem);
      } catch (error) {
        console.error('Error fetching student data:', error);
        toast.error('Failed to load quiz data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const handleGenerateQuiz = () => {
    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }
    setShowWizard(true);
  };

  const handleWizardGenerate = async (sections) => {
    try {
      setIsLoading(true);
      
      const newQuiz: Partial<Quiz> = {
        title: title.trim(),
        total_duration: duration,
        sections: sections,
        header: [],
        instructions: [],
        footer: [],
        watermark: {},
      };
      
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

  if (showWizard && tagSystem) {
    return (
      <QuizGeneratorWizard
        questions={questions}
        tagSystem={tagSystem}
        onGenerate={handleWizardGenerate}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

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
                  'Continue to Quiz Generator'
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
          <li>Use the quiz generator to customize your questions</li>
          <li>Questions will be filtered based on your batch and learning level</li>
        </ul>
      </div>
    </div>
  );
}