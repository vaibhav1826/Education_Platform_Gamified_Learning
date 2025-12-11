import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Hyperspeed from './components/Hyperspeed.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import LoginRoleSelect from './pages/LoginRoleSelect.jsx';
import StudentLogin from './pages/login/StudentLogin.jsx';
import TeacherLogin from './pages/login/TeacherLogin.jsx';
import AdminLogin from './pages/login/AdminLogin.jsx';
import ChooseRole from './pages/ChooseRole.jsx';
import StudentSignup from './pages/signup/StudentSignup.jsx';
import TeacherSignup from './pages/signup/TeacherSignup.jsx';
import AdminSignup from './pages/signup/AdminSignup.jsx';
import CourseManager from './pages/CourseManager.jsx';
import AssignmentGrading from './pages/teacher/AssignmentGrading.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import TeacherLayout from './components/teacher/TeacherLayout.jsx';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import Batches from './pages/teacher/Batches.jsx';
import BatchDetails from './pages/teacher/BatchDetails.jsx';
import CreateBatch from './pages/teacher/CreateBatch.jsx';
import BatchLeaderboard from './pages/teacher/BatchLeaderboard.jsx';
import Quizzes from './pages/teacher/Quizzes.jsx';
import CreateQuiz from './pages/teacher/CreateQuiz.jsx';
import QuizDetails from './pages/teacher/QuizDetails.jsx';
import SubmissionsList from './pages/teacher/SubmissionsList.jsx';
import SubmissionDetails from './pages/teacher/SubmissionDetails.jsx';
import GlobalLeaderboard from './pages/teacher/GlobalLeaderboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminCourses from './pages/admin/AdminCourses.jsx';
import AdminGamification from './pages/admin/AdminGamification.jsx';
import AdminLeaderboard from './pages/admin/AdminLeaderboard.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import AdminBatches from './pages/admin/AdminBatches.jsx';
import AdminQuizzes from './pages/admin/AdminQuizzes.jsx';
import AdminSubmissions from './pages/admin/AdminSubmissions.jsx';
import AdminAnnouncements from './pages/admin/AdminAnnouncements.jsx';
import AdminNotifications from './pages/admin/AdminNotifications.jsx';
import CourseList from './pages/CourseList.jsx';
import CoursePage from './pages/CoursePage.jsx';
import Lesson from './pages/Lesson.jsx';
import QuizPage from './pages/QuizPage.jsx';
import DiscussionDetail from './pages/DiscussionDetail.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import StudentBatches from './pages/StudentBatches.jsx';
import StudentBatchDetails from './pages/StudentBatchDetails.jsx';
import StudentTests from './pages/StudentTests.jsx';
import StudentTestDetails from './pages/StudentTestDetails.jsx';
import StudentTestStart from './pages/StudentTestStart.jsx';
import StudentTestResult from './pages/StudentTestResult.jsx';
import StudentLeaderboard from './pages/StudentLeaderboard.jsx';
import StudentCourses from './pages/StudentCourses.jsx';
import StudentProfile from './pages/StudentProfile.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import LandingPage from './pages/LandingPage.jsx';
import NotFound from './pages/NotFound.jsx';

const App = () => {
  const location = useLocation();
  const { user, loading } = useAuthContext();

  // ❌ Hide Navbar on all admin pages
  const hideNavbar = location.pathname.startsWith("/admin");

  return (
    <div className="relative min-h-screen bg-midnight text-white overflow-hidden">
      <Hyperspeed presetKey="neoAurora" />

      <div className="pointer-events-none absolute inset-0 bg-hero-grid opacity-30 [background-size:120px_120px]" aria-hidden />
      <div
        className="pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/30 via-accent/20 to-rose-500/30 blur-[140px]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-midnight/60 to-black/80" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col">

        {/* ✅ Navbar visible everywhere except admin pages */}
        {!hideNavbar && <Navbar />}

        <div className="flex-1">
          <Routes>

            {/* Auth Routes */}
            <Route path="/login" element={<LoginRoleSelect />} />
            <Route path="/login/student" element={<StudentLogin />} />
            <Route path="/login/teacher" element={<TeacherLogin />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/choose-role" element={<ChooseRole />} />
            <Route path="/signup" element={<Navigate to="/choose-role" replace />} />
            <Route path="/signup/student" element={<StudentSignup />} />
            <Route path="/signup/teacher" element={<TeacherSignup />} />
            <Route path="/signup/admin" element={<AdminSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/batches"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentBatches />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/batches/:batchId"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentBatchDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/tests"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentTests />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/tests/:quizId"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentTestDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/tests/:quizId/start"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentTestStart />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/tests/:quizId/result"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentTestResult />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/leaderboard"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentLeaderboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/courses"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentCourses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/profile"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute roles={['teacher', 'admin']}>
                  <TeacherLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="batches" element={<Batches />} />
              <Route path="batches/create" element={<CreateBatch />} />
              <Route path="batches/:id" element={<BatchDetails />} />
              <Route path="batches/:id/leaderboard" element={<BatchLeaderboard />} />
              <Route path="quizzes" element={<Quizzes />} />
              <Route path="quizzes/create" element={<CreateQuiz />} />
              <Route path="quizzes/:id" element={<QuizDetails />} />
              <Route path="quizzes/:quizId/submissions" element={<SubmissionsList />} />
              <Route path="submissions/:id" element={<SubmissionDetails />} />
              <Route path="leaderboard" element={<GlobalLeaderboard />} />
              <Route path="course/:id/edit" element={<CourseManager />} />
              <Route path="assignments/:assignmentId/grading" element={<AssignmentGrading />} />
            </Route>

            {/* Admin Routes (NO NAVBAR HERE) */}
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
              <Route path="batches" element={<AdminBatches />} />
              <Route path="quizzes" element={<AdminQuizzes />} />
              <Route path="submissions" element={<AdminSubmissions />} />
              <Route path="gamification" element={<AdminGamification />} />
              <Route path="leaderboard" element={<AdminLeaderboard />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Common Routes */}
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
              path="/discussions/:id"
              element={
                <ProtectedRoute>
                  <DiscussionDetail />
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
                  <StudentProfile />
                </ProtectedRoute>
              }
            />

            {/* Default Routes */}
            <Route
              path="/"
              element={
                loading ? null : user ? (
                  <Navigate to={
                    user.role === 'admin' ? '/admin/dashboard' :
                      user.role === 'teacher' ? '/teacher/dashboard' :
                        '/student/dashboard'
                  } replace />
                ) : (
                  <LandingPage />
                )
              }
            />
            <Route path="*" element={<NotFound />} />

          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
