import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { RecoilRoot } from "recoil";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import QuizDashboard from "./pages/QuizDashboard";
import StudentAnalyticsDashboard from "./pages/student-analytics-dashboard";
import QuizReportPage from "./pages/QuizReportPage";
// Import new pages
import QuestionListPage from "./pages/admin/QuestionListPage";
import QuestionCreatorPage from "./pages/admin/QuestionCreatorPage";
import QuestionBulkUploadPage from "./pages/admin/QuestionBulkUploadPage";
import QuizBuilderPage from "./pages/admin/QuizBuilderPage";
import QuizListPage from "./pages/admin/QuizListPage";
import TagManagerPage from "./pages/admin/TagManagerPage";
import QuizTakerPage from "./pages/admin/QuizTakerPage";

function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Admin routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole={["Admin"]}>
                  <QuizDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="questions" replace />} />
              <Route path="questions" element={<QuestionListPage />} />
              <Route path="questions/create" element={<QuestionCreatorPage />} />
              <Route path="questions/edit/:questionId" element={<QuestionCreatorPage />} />
              <Route path="questions/upload" element={<QuestionBulkUploadPage />} />
              <Route path="quizzes" element={<QuizListPage />} />
              <Route path="quizzes/create" element={<QuizBuilderPage />} />
              <Route path="quizzes/edit/:quizId" element={<QuizBuilderPage />} />
              <Route path="quizzes/take/:quizId" element={<QuizTakerPage />} />
              <Route path="tags" element={<TagManagerPage />} />
            </Route>

            {/* Student routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute requiredRole={["Student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/report"
              element={<StudentAnalyticsDashboard studentId="10" />}
            />

            {/* Quiz Report Route */}
            <Route
              path="/quiz-report/:quizId"
              element={
                <ProtectedRoute requiredRole={["Student", "Admin"]}>
                  <QuizReportPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
