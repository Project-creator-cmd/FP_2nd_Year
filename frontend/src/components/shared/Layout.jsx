import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Trophy, Users, BarChart2, Settings,
  LogOut, CheckSquare, UserCheck, ClipboardList, Star,
  GraduationCap, Menu, X, Bell, Award, ChevronRight,
  Zap, TrendingUp, Sparkles, Calendar, Upload
} from 'lucide-react'
import { useState, useEffect } from 'react'
import NotificationBell from './NotificationBell'

const NAV = {
  student: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/achievements', label: 'My Achievements', icon: Trophy },
    { to: '/student/leaderboard', label: 'Leaderboard', icon: Star },
    { to: '/student/relaxation', label: 'Attendance Relief', icon: ClipboardList },
    { to: '/student/profile', label: 'Profile', icon: Users },
  ],
  faculty: [
    { to: '/faculty', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/faculty/achievements', label: 'My Achievements', icon: Trophy },
    { to: '/faculty/verify', label: 'Verify Achievements', icon: CheckSquare },
    { to: '/faculty/relaxation', label: 'Relaxation Requests', icon: ClipboardList },
    { to: '/faculty/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/faculty/leaderboard', label: 'Leaderboard', icon: Star },
    { to: '/faculty/profile', label: 'Profile', icon: Users },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/verify', label: 'Verify Achievements', icon: CheckSquare },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/scoring', label: 'Scoring Rules', icon: Settings },
    { to: '/admin/relaxation', label: 'Relaxation Approvals', icon: ClipboardList },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/admin/leaderboard', label: 'Leaderboard', icon: Star },
    { to: '/admin/profile', label: 'Profile', icon: Users },
  ],
  placement: [
    { to: '/placement', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/placement/students', label: 'Placement Ready', icon: UserCheck },
    { to: '/placement/leaderboard', label: 'Leaderboard', icon: Star },
    { to: '/placement/profile', label: 'Profile', icon: Users },
  ],
  dept_head: [
    { to: '/depthead', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/depthead/verify', label: 'Verify Achievements', icon: CheckSquare },
    { to: '/depthead/users', label: 'Department Users', icon: Users },
    { to: '/depthead/scoring', label: 'Scoring Rules', icon: Settings },
    { to: '/depthead/relaxation', label: 'Relaxation Approvals', icon: ClipboardList },
    { to: '/depthead/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/depthead/events', label: 'Events', icon: Calendar },
    { to: '/depthead/leaderboard', label: 'Leaderboard', icon: Star },
    { to: '/depthead/profile', label: 'Profile', icon: Users },
  ],
  event_organizer: [
    { to: '/organizer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/organizer/upload', label: 'Upload Event', icon: Upload },
    { to: '/organizer/events', label: 'My Events', icon: Calendar },
    { to: '/organizer/profile', label: 'Profile', icon: Users },
  ],
}

const ROLE_CONFIG = {
  student:         { label: 'Student',           gradient: 'from-blue-500 to-cyan-500',     accent: '#3b82f6', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
  faculty:         { label: 'Faculty',           gradient: 'from-purple-500 to-violet-500', accent: '#8b5cf6', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
  admin:           { label: 'Administrator',     gradient: 'from-rose-500 to-pink-500',     accent: '#f43f5e', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
  placement:       { label: 'Placement Officer', gradient: 'from-emerald-500 to-teal-500',  accent: '#10b981', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  dept_head:       { label: 'Dept Head',         gradient: 'from-amber-500 to-orange-500',  accent: '#f59e0b', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
  event_organizer: { label: 'Event Organizer',   gradient: 'from-sky-500 to-blue-500',      accent: '#0ea5e9', badge: 'bg-sky-500/15 text-sky-300 border-sky-500/25' },
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const links = NAV[user?.role] || []
  const roleConf = ROLE_CONFIG[user?.role] || ROLE_CONFIG.student

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout()
      navigate('/login')
    }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  const placementPct = Math.min(100, user?.totalScore || 0)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Sidebar Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col
        sidebar-bg border-r border-white/5
        transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top glow */}
        <div className="sidebar-glow-top absolute top-0 left-0 right-0 h-48 pointer-events-none" />
        {/* Animated accent line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${roleConf.accent}80, transparent)` }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className={`relative w-9 h-9 bg-gradient-to-br ${roleConf.gradient} rounded-xl flex items-center justify-center shadow-lg`}
            style={{ boxShadow: `0 0 20px ${roleConf.accent}40` }}>
            <GraduationCap className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-xl animate-pulse opacity-30"
              style={{ background: `radial-gradient(circle, ${roleConf.accent}60, transparent)` }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none tracking-tight">Acadex</h1>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[120px]">{user?.department || 'Portal'}</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto no-scrollbar p-3 pt-4">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] px-3.5 mb-3">Menu</p>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">
                <Icon className="w-4 h-4" />
              </span>
              <span className="flex-1 text-sm">{label}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
              <span className="link-indicator" />
            </NavLink>
          ))}
        </nav>

        {/* Score pill (students only) */}
        {user?.role === 'student' && (
          <div className="mx-3 mb-3 p-4 rounded-xl border border-white/10 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)' }}>
            <div className="absolute inset-0 opacity-30"
              style={{ background: 'radial-gradient(circle at 80% 20%, rgba(99,102,241,0.3), transparent 60%)' }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Career Score</span>
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              </div>
              <div className="flex items-end gap-1 mb-2.5">
                <span className="text-2xl font-bold text-white">{user?.totalScore || 0}</span>
                <span className="text-xs text-slate-500 mb-1">/100 pts</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${placementPct}%`,
                    background: `linear-gradient(90deg, ${roleConf.accent}, #8b5cf6)`,
                    boxShadow: `0 0 8px ${roleConf.accent}60`
                  }}
                />
              </div>
              {user?.placementReady && (
                <p className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Placement Ready
                </p>
              )}
            </div>
          </div>
        )}

        {/* User profile */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleConf.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
              style={{ boxShadow: `0 0 12px ${roleConf.accent}30` }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">{user?.name}</p>
              <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border font-semibold mt-0.5 ${roleConf.badge}`}>
                {roleConf.label}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Main content Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className={`
          flex items-center gap-4 px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-md
          border-b border-slate-200/60 flex-shrink-0 z-10 transition-all duration-200
          ${scrolled ? 'shadow-soft' : ''}
        `}>
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800 capitalize">{user?.role} Portal</span>
              <span className="text-slate-300">Ã‚·</span>
              <span className="text-xs text-slate-400 truncate">{user?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'student' && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-100/80">
                <Award className="w-3.5 h-3.5 text-brand-600" />
                <span className="text-xs font-bold text-brand-700">{user?.totalScore || 0} pts</span>
              </div>
            )}

            {user?.placementReady && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700">Placement Ready</span>
              </div>
            )}

            <NotificationBell />

            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${roleConf.gradient} flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:shadow-md transition-shadow`}>
              {initials}
            </div>

            {/* Topbar logout button â€” always visible */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-xl hover:bg-red-50 hover:text-red-600 text-slate-500 transition-all duration-200 border border-transparent hover:border-red-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-mesh">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
