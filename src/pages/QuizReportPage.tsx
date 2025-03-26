import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Quiz, QuizAttempt } from "../types/types";
import { QuizReport } from "../components/admin/QuizReport/QuizReport";
import { quizService } from "../services/quizService";
import { reportService } from "../services/reportService";
import { useAuth } from "../contexts/AuthContext";
import { DetailedQuizReport } from "../components/reports/DetailedQuizReport";
import { DetailedQuizReport as DetailedQuizReportType } from "../types/reportTypes";
import toast from "react-hot-toast";

const QuizReportPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [detailedReport, setDetailedReport] = useState<DetailedQuizReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'basic' | 'detailed'>('basic');
  const [reportLoading, setReportLoading] = useState(false);

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
        setQuiz(quizData.quiz);
        
        // Fetch the user's most recent attempt for this quiz
        const attemptsData = await quizService.getUserQuizAttempts(quizId);
        
        if (attemptsData.attempts && attemptsData.attempts.length > 0) {
          // Get the most recent attempt
          const latestAttempt = attemptsData.attempts.sort(
            (a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          )[0];
          
          setAttempt(latestAttempt);
          
          // Fetch detailed report data immediately
          fetchDetailedReport(quizId);
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

  const fetchDetailedReport = async (quizId: string) => {
    try {
      setReportLoading(true);
      const reportData = await reportService.getQuizAttemptReport(quizId);
      if (reportData && reportData.report) {
        setDetailedReport(reportData.report);
        console.log("Detailed report loaded:", reportData.report);
      } else {
        console.error("Invalid report data format:", reportData);
      }
    } catch (reportErr) {
      console.error("Error fetching detailed report:", reportErr);
      // Don't set error here, we'll still show the basic report
    } finally {
      setReportLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    // Navigate back to the appropriate dashboard based on user role
    if (user?.role === "Admin") {
      navigate("/admin/");
    } else {
      navigate("/student/dashboard");
    }
  };

  const handleRetakeQuiz = () => {
    // Navigate to take the quiz again
    navigate(`/admin/quizzes/take/${quizId}`);
  };

  const toggleViewMode = () => {
    if (viewMode === 'basic') {
      if (!detailedReport) {
        // If detailed report isn't loaded yet, try to fetch it
        if (!reportLoading) {
          toast.promise(
            fetchDetailedReport(quizId!),
            {
              loading: 'Loading detailed report...',
              success: () => {
                setViewMode('detailed');
                return 'Detailed report loaded';
              },
              error: 'Failed to load detailed report'
            }
          );
        } else {
          toast.loading("Loading detailed report...");
        }
        return;
      }
      setViewMode('detailed');
    } else {
      setViewMode('basic');
    }
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{quiz.title} - Report</h1>
        
        <div className="flex space-x-4">
          <button
            onClick={toggleViewMode}
            className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
            disabled={reportLoading}
          >
            {reportLoading ? 'Loading...' : viewMode === 'basic' ? 'View Detailed Report' : 'View Basic Report'}
          </button>
          
          <button
            onClick={handleBackToDashboard}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
          
          <button
            onClick={handleRetakeQuiz}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
          >
            Retake Quiz
          </button>
        </div>
      </div>
      
      {viewMode === 'basic' ? (
        <QuizReport
          quiz={quiz}
          attempt={attempt}
          onRetake={handleRetakeQuiz}
          onBackToDashboard={handleBackToDashboard}
        />
      ) : (
        detailedReport ? (
          <DetailedQuizReport report={detailedReport} quizTitle={quiz.title} />
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="ml-3 text-lg text-gray-700">Loading detailed report...</p>
          </div>
        )
      )}
    </div>
  );
};

export default QuizReportPage;