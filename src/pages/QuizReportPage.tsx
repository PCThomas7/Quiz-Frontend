import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Quiz } from "../types/types";
import { QuizReport } from "../components/admin/QuizReport/QuizReport";
import { quizService } from "../services/quizService";
import { useAuth } from "../contexts/AuthContext";

const QuizReportPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizAndAttempt = async () => {
      if (!quizId) {
        setError("Quiz ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch the quiz data
        const quizData = await quizService.getQuiz(quizId);
        setQuiz(quizData);
        
        // Fetch the user's most recent attempt for this quiz
        const attemptsData = await quizService.getUserQuizAttempts(quizId);
        
        if (attemptsData.attempts && attemptsData.attempts.length > 0) {
          // Get the most recent attempt
          const latestAttempt = attemptsData.attempts.sort(
            (a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          )[0];
          
          // Set the user's answers from the attempt
          setUserAnswers(latestAttempt.answers || {});
        } else {
          setError("No quiz attempts found");
        }
      } catch (err) {
        console.error("Error fetching quiz report data:", err);
        setError("Failed to load quiz report. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAndAttempt();
  }, [quizId]);

  const handleBackToDashboard = () => {
    // Navigate back to the appropriate dashboard based on user role
    if (user?.role === "Admin") {
      navigate("/dashboard");
    } else {
      navigate("/student/dashboard");
    }
  };

  const handleRetakeQuiz = () => {
    // Navigate to take the quiz again
    navigate(`/dashboard/take-quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-3 text-lg text-gray-700">Loading quiz report...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white shadow rounded-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error || "Failed to load quiz report"}</p>
          <button
            onClick={handleBackToDashboard}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <QuizReport
      quiz={quiz}
      userAnswers={userAnswers}
      onRetake={handleRetakeQuiz}
      onBackToDashboard={handleBackToDashboard}
    />
  );
};

export default QuizReportPage;