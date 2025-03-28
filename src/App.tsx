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

import QuizReportPage from "./pages/QuizReportPage";
// Import admin pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import QuestionListPage from "./pages/admin/QuestionListPage";
import QuestionCreatorPage from "./pages/admin/QuestionCreatorPage";
import QuestionBulkUploadPage from "./pages/admin/QuestionBulkUploadPage";
import QuizBuilderPage from "./pages/admin/QuizBuilderPage";
import QuizListPage from "./pages/admin/QuizListPage";
import TagManagerPage from "./pages/admin/TagManagerPage";
import QuizTakerPage from "./pages/admin/QuizTakerPage";
import UserManagement from "./pages/admin/UserManagement";
// Import community pages
import CommunityApp from "./pages/admin/CommunityApp";
import CommunityCreatePost from "./pages/admin/CommunityCreatePost";
import CommunityEditPost from "./pages/admin/CommunityEditPost";
import CommunityPostDetail from "./pages/admin/CommunityPostDetail";
// Import student pages
import StudentQuizListPage from "./pages/student/StudentQuizListPage";
import StudentQuizTakerPage from "./pages/student/StudentQuizTakerPage";
import StudentQuizBuilderPage from "./pages/student/StudentQuizBuilderPage";
// Import layouts
import { StudentLayout } from "./components/layouts/StudentLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";

// Add this import
import StudentAnalyticsPage from "./pages/student/StudentAnalyticsPage";

function App() {
  return (
    <RecoilRoot>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-center" />
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
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="questions" element={<QuestionListPage />} />
              <Route path="questions/create" element={<QuestionCreatorPage />} />
              <Route path="questions/edit/:questionId" element={<QuestionCreatorPage />} />
              <Route path="questions/upload" element={<QuestionBulkUploadPage />} />
              <Route path="quizzes" element={<QuizListPage />} />
              <Route path="quizzes/create" element={<QuizBuilderPage />} />
              <Route path="quizzes/edit/:quizId" element={<QuizBuilderPage />} />
              <Route path="quizzes/take/:quizId" element={<QuizTakerPage />} />
              <Route path="tags" element={<TagManagerPage />} />
              <Route path="users" element={<UserManagement />} />
              {/* Community routes */}
              <Route path="community" element={<CommunityApp />} />
              <Route path="community/create" element={<CommunityCreatePost />} />
              <Route path="community/edit/:postId" element={<CommunityEditPost />} />
              <Route path="community/:postId" element={<CommunityPostDetail />} />
            </Route>

            {/* Student routes */}
            <Route
              path="/student/*"
              element={
                <ProtectedRoute requiredRole={["Student"]}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="quizzes" element={<StudentQuizListPage />} />
              <Route path="quizzes/create" element={<StudentQuizBuilderPage />} />
              <Route path="quizzes/take/:quizId" element={<StudentQuizTakerPage />} />
              <Route path="analytics" element={<StudentAnalyticsPage/>} />
            </Route>

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
        </BrowserRouter>
      </AuthProvider>
    </RecoilRoot>
  );
}

export default App;
