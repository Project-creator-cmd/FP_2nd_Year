import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/shared/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StudentDashboard from './pages/student/Dashboard'
import StudentAchievements from './pages/student/Achievements'
import StudentLeaderboard from './pages/student/Leaderboard'
import StudentRelaxation from './pages/student/Relaxation'
import StudentProfile from './pages/student/Profile'
import FacultyDashboard from './pages/faculty/Dashboard'
import FacultyAchievements from './pages/faculty/Achievements'
import FacultyVerify from './pages/faculty/Verify'
import FacultyRelaxation from './pages/faculty/Relaxation'
import FacultyAnalytics from './pages/faculty/Analytics'
import AdminDashboard from './pages/admin/Dashboard'
import AdminVerify from './pages/admin/Verify'
import AdminUsers from './pages/admin/Users'
import AdminScoring from './pages/admin/Scoring'
import AdminRelaxation from './pages/admin/Relaxation'
import AdminAnalytics from './pages/admin/Analytics'
import PlacementDashboard from './pages/placement/Dashboard'
import PlacementStudents from './pages/placement/Students'
import LandingPage from './pages/LandingPage'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const map = { student: '/student', faculty: '/faculty', admin: '/admin', placement: '/placement' }
  return <Navigate to={map[user.role] || '/login'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ className: 'font-sans text-sm', duration: 3500 }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<LandingPage />} />

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="achievements" element={<StudentAchievements />} />
            <Route path="leaderboard" element={<StudentLeaderboard />} />
            <Route path="relaxation" element={<StudentRelaxation />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Faculty */}
          <Route path="/faculty" element={<ProtectedRoute roles={['faculty']}><Layout /></ProtectedRoute>}>
            <Route index element={<FacultyDashboard />} />
            <Route path="achievements" element={<FacultyAchievements />} />
            <Route path="verify" element={<FacultyVerify />} />
            <Route path="relaxation" element={<FacultyRelaxation />} />
            <Route path="analytics" element={<FacultyAnalytics />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="verify" element={<AdminVerify />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="scoring" element={<AdminScoring />} />
            <Route path="relaxation" element={<AdminRelaxation />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Placement */}
          <Route path="/placement" element={<ProtectedRoute roles={['placement']}><Layout /></ProtectedRoute>}>
            <Route index element={<PlacementDashboard />} />
            <Route path="students" element={<PlacementStudents />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
