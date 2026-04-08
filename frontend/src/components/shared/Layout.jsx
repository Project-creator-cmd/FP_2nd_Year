import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Trophy, Users, BarChart2, Settings,
  LogOut, CheckSquare, UserCheck, ClipboardList, Star,
  GraduationCap, Menu, X, Bell, ChevronDown, Award
} from 'lucide-react'
import { useState } from 'react'

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
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/verify', label: 'Verify Achievements', icon: CheckSquare },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/scoring', label: 'Scoring Rules', icon: Settings },
    { to: '/admin/relaxation', label: 'Relaxation Approvals', icon: ClipboardList },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  ],
  placement: [
    { to: '/placement', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/placement/students', label: 'Placement Ready', icon: UserCheck },
  ]
}

const ROLE_COLORS = {
  student: 'bg-blue-100 text-blue-800',
  faculty: 'bg-purple-100 text-purple-800',
  admin: 'bg-rose-100 text-rose-800',
  placement: 'bg-green-100 text-green-800'
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const links = NAV[user?.role] || []

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  }
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none">Acadex</h1>
            <p className="text-xs text-slate-400 mt-0.5">{user?.department}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}>
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full capitalize ${ROLE_COLORS[user?.role]}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm text-slate-500">Welcome back, <span className="font-semibold text-slate-800">{user?.name?.split(' ')[0]}</span></p>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
            {(user?.role === 'student' || user?.role === 'faculty') && (
              <div className="hidden sm:flex items-center gap-2 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-xl shadow-sm">
                <Award className="w-4 h-4 text-brand-600" />
                <span className="text-sm font-bold text-brand-700">{user?.totalScore || 0} pts</span>
              </div>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
