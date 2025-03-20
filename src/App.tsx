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
import Dashboard from "./pages/QuizDashboard";
import StudentAnalyticsDashboard from "./pages/student-analytics-dashboard";

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

            {/* Protected routes */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute requiredRole={["Admin"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

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

            {/* Quiz Dashboard
            <Route
              path="/quizzes"
              element={
                <ProtectedRoute requiredRole={["Admin"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            /> */}

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
