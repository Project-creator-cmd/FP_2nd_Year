import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { Trophy, Star, TrendingUp, Award, CheckCircle, ArrowUpRight, Plus, Rocket, Sparkles, Zap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

function AnimatedNumber({ value, duration = 1000 }) {
  const [display, setDisplay] = useState(0)
  const start = useRef(null)
  const target = typeof value === 'number' ? value : 0

  useEffect(() => {
    if (target === 0) { setDisplay(0); return }
    start.current = null
    const step = (ts) => {
      if (!start.current) start.current = ts
      const progress = Math.min((ts - start.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])

  return <>{display}</>
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-soft-lg">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-lg font-extrabold text-slate-900">{payload[0].value} <span className="text-xs font-normal text-slate-400">pts</span></p>
      </div>
    )
  }
  return null
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [rank, setRank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/achievements/my').catch(() => ({ data: { achievements: [] } })),
      api.get('/leaderboard/my-rank').catch(() => ({ data: { data: null } }))
    ]).then(([a, r]) => {
      setAchievements(a.data?.achievements || [])
      setRank(r.data?.data || null)
    }).finally(() => setLoading(false))
  }, [])

  const verified = achievements.filter(a => a.status === 'verified')
  const pending = achievements.filter(a => a.status === 'pending')
  const rejected = achievements.filter(a => a.status === 'rejected')

  const categoryData = verified.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + (a.score || 0)
    return acc
  }, {})
  const chartData = Object.entries(categoryData).map(([name, score]) => ({ name, score }))

  const placementPct = Math.min(100, Math.round((user?.totalScore || 0) / 100 * 100))
  const isPlacementReady = user?.placementReady || user?.totalScore >= 100

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-brand-500" />
        </div>
      </div>
    </div>
  )

  const STAT_CARDS = [
    {
      label: 'Total Score', value: user?.totalScore || 0, numeric: true,
      icon: Award, gradient: 'from-brand-500 to-violet-600',
      bg: 'bg-brand-50', color: 'text-brand-600',
      trend: '+12 pts', trendUp: true,
      glow: 'rgba(99,102,241,0.15)',
    },
    {
      label: 'Dept Rank', value: rank ? rank.rank : null, display: rank ? `#${rank.rank}` : '—',
      icon: Star, gradient: 'from-amber-400 to-orange-500',
      bg: 'bg-amber-50', color: 'text-amber-600',
      trend: 'Top 5%', trendUp: true,
      glow: 'rgba(245,158,11,0.15)',
    },
    {
      label: 'Achievements', value: achievements.length, numeric: true,
      icon: Trophy, gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50', color: 'text-purple-600',
      trend: `${verified.length} verified`, trendUp: true,
      glow: 'rgba(139,92,246,0.15)',
    },
    {
      label: 'Attendance', value: null, display: `${user?.attendance || 75}%`,
      icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50', color: 'text-emerald-600',
      trend: 'Stable', trendUp: true,
      glow: 'rgba(16,185,129,0.15)',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 60%, #0f0f1e 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }}>
        {/* Animated orbs */}
        <div className="absolute top-[-30%] right-[-5%] w-64 h-64 rounded-full opacity-20 animate-blob pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-[-30%] left-[-5%] w-48 h-48 rounded-full opacity-15 animate-blob animation-delay-2000 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">Student Portal</span>
              <span className="w-1 h-1 rounded-full bg-brand-500" />
              <span className="text-xs text-slate-500">{user?.department}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-400 text-sm">
              {user?.rollNumber} · Year {user?.year} · {user?.section && `Section ${user.section}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isPlacementReady && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 16px rgba(16,185,129,0.3)' }}>
                <CheckCircle className="w-4 h-4" /> Placement Ready
              </div>
            )}
            <Link to="/student/achievements"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors">
              <Plus className="w-4 h-4" /> Add Achievement
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
        {STAT_CARDS.map(({ label, value, display, numeric, icon: Icon, gradient, bg, color, trend, trendUp, glow }) => (
          <div key={label} className="stat-card group" style={{ '--glow': glow }}>
            <div className="stat-card-accent bg-gradient-to-r" style={{
              background: `linear-gradient(90deg, transparent, ${glow?.replace('0.15', '0.6')}, transparent)`
            }} />
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${trendUp ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                <ArrowUpRight className="w-3 h-3" /> {trend}
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
              {display ?? (numeric ? <AnimatedNumber value={value} /> : value)}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Career Readiness */}
        <div className="card p-6 flex flex-col hover-lift">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Career Readiness</h2>
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-brand-600" />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-5">
            {/* Score display */}
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" strokeWidth="10"
                    stroke="url(#scoreGrad)"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - placementPct / 100)}`}
                    style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-slate-900">{user?.totalScore || 0}</span>
                  <span className="text-xs text-slate-400 font-medium">/100 pts</span>
                </div>
              </div>
            </div>

            {isPlacementReady
              ? <div className="flex items-center gap-2 p-3 rounded-xl text-emerald-700 text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <CheckCircle className="w-4 h-4 flex-shrink-0" /> You're ready for placement drives!
                </div>
              : <p className="text-slate-500 text-sm text-center">
                  {100 - (user?.totalScore || 0)} more points to unlock placement opportunities.
                </p>
            }

            <div className="grid grid-cols-3 gap-2">
              {[
                { count: verified.length, label: 'Verified', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { count: pending.length, label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                { count: rejected.length, label: 'Rejected', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
              ].map(({ count, label, color, bg, border }) => (
                <div key={label} className={`${bg} border ${border} rounded-xl p-3 text-center`}>
                  <p className={`text-xl font-extrabold ${color}`}>{count}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Score Distribution Chart */}
        <div className="card p-6 col-span-2 hover-lift flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Score by Category</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Zap className="w-3.5 h-3.5 text-brand-500" />
              {verified.length} verified
            </div>
          </div>

          <div className="flex-1 min-h-[220px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} dy={8} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} dx={-8} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)', radius: 8 }} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={36} animationDuration={1200} animationEasing="ease-out">
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]}
                        style={{ filter: `drop-shadow(0 4px 8px ${COLORS[i % COLORS.length]}40)` }} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-600 font-semibold text-sm">No chart data yet</p>
                <p className="text-slate-400 text-xs mt-1 mb-5">Submit achievements to see your score distribution.</p>
                <Link to="/student/achievements" className="btn-primary text-xs gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add Achievement
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="card p-6 hover-lift">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">Recent Activity</h2>
          <Link to="/student/achievements"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {achievements.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-100 p-12 text-center group hover:border-brand-200 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50/30 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white shadow-soft border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-8 h-8 text-brand-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Start Building Your Profile</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Upload your first achievement certificates to earn points and boost your placement readiness score.</p>
              <Link to="/student/achievements" className="btn-primary gap-2">
                <Plus className="w-4 h-4" /> Add Achievement
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-1 animate-stagger">
            {achievements.slice(0, 5).map((a) => (
              <div key={a._id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-100 hover:-translate-y-0.5">
                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                  <div className="hidden sm:flex w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm items-center justify-center text-slate-400 group-hover:text-brand-500 group-hover:border-brand-200 transition-all">
                    <Trophy className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm group-hover:text-brand-700 transition-colors">{a.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-md capitalize">{a.category}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 capitalize">{a.level}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {a.status === 'verified' && (
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                      +{a.score} pts
                    </span>
                  )}
                  <span className={
                    a.status === 'verified' ? 'badge-verified' :
                    a.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                  }>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
