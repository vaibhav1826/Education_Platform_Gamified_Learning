import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Hyperspeed from './components/Hyperspeed.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import Login from './pages/Login.jsx';
import ChooseRole from './pages/ChooseRole.jsx';
import StudentSignup from './pages/signup/StudentSignup.jsx';
import TeacherSignup from './pages/signup/TeacherSignup.jsx';
import AdminSignup from './pages/signup/AdminSignup.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminCourses from './pages/admin/AdminCourses.jsx';
import AdminGamification from './pages/admin/AdminGamification.jsx';
import AdminLeaderboard from './pages/admin/AdminLeaderboard.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import CourseList from './pages/CourseList.jsx';
import CoursePage from './pages/CoursePage.jsx';
import Lesson from './pages/Lesson.jsx';
import QuizPage from './pages/QuizPage.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Profile from './pages/Profile.jsx';

const App = () => (
  <div className="relative min-h-screen bg-midnight text-white overflow-hidden">
    {/* Global hyperspeed background for all pages */}
    <Hyperspeed presetKey="neoAurora" />

    {/* Subtle overlay grid and glow on top of hyperspeed */}
    <div className="pointer-events-none absolute inset-0 bg-hero-grid opacity-30 [background-size:120px_120px]" aria-hidden />
    <div
      className="pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/30 via-accent/20 to-rose-500/30 blur-[140px]"
      aria-hidden
    />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-midnight/60 to-black/80" aria-hidden />

    <div className="relative z-10 flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/choose-role" element={<ChooseRole />} />
          <Route path="/signup" element={<Navigate to="/choose-role" replace />} />
          <Route path="/signup/student" element={<StudentSignup />} />
          <Route path="/signup/teacher" element={<TeacherSignup />} />
          <Route path="/signup/admin" element={<AdminSignup />} />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute roles={['teacher', 'admin']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="gamification" element={<AdminGamification />} />
            <Route path="leaderboard" element={<AdminLeaderboard />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:id"
            element={
              <ProtectedRoute>
                <Lesson />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:id"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  </div>
);

export default App;