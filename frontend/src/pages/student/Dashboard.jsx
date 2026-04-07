import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { Trophy, Star, ClipboardList, TrendingUp, Award, CheckCircle, Clock, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [rank, setRank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/achievements/my'),
      api.get('/leaderboard/my-rank')
    ]).then(([a, r]) => {
      setAchievements(a.data.achievements)
      setRank(r.data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const verified = achievements.filter(a => a.status === 'verified')
  const pending = achievements.filter(a => a.status === 'pending')
  const rejected = achievements.filter(a => a.status === 'rejected')

  const categoryData = verified.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + (a.score || 0)
    return acc
  }, {})
  const chartData = Object.entries(categoryData).map(([name, score]) => ({ name, score }))

  const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899']

  const placementPct = Math.min(100, Math.round((user?.totalScore || 0) / 100 * 100))
  const isPlacementReady = user?.placementReady

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">{user?.department} · {user?.rollNumber} · Year {user?.year}</p>
        </div>
        {isPlacementReady && (
          <span className="flex items-center gap-2 bg-green-100 text-green-800 font-semibold text-sm px-4 py-2 rounded-xl">
            <CheckCircle className="w-4 h-4" /> Placement Ready
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Score', value: user?.totalScore || 0, icon: Award, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Dept Rank', value: rank ? `#${rank.rank}` : '—', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Achievements', value: achievements.length, icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Attendance', value: `${user?.attendance || 75}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Placement Progress */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Placement Readiness</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Progress to 100 pts</span>
            <span className="font-bold text-brand-600">{user?.totalScore || 0}/100</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-700"
              style={{ width: `${placementPct}%` }} />
          </div>
          {isPlacementReady
            ? <p className="text-green-700 text-sm font-semibold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> You are placement ready!</p>
            : <p className="text-slate-500 text-sm">{100 - (user?.totalScore || 0)} more points needed</p>
          }
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 text-center">
            <div><p className="text-lg font-bold text-green-600">{verified.length}</p><p className="text-xs text-slate-500">Verified</p></div>
            <div><p className="text-lg font-bold text-amber-500">{pending.length}</p><p className="text-xs text-slate-500">Pending</p></div>
            <div><p className="text-lg font-bold text-red-500">{rejected.length}</p><p className="text-xs text-slate-500">Rejected</p></div>
          </div>
        </div>

        {/* Score by Category */}
        <div className="card p-5 col-span-2">
          <h2 className="section-title mb-4">Score by Category</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={v => [`${v} pts`]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 13 }} />
                <Bar dataKey="score" radius={[6,6,0,0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No verified achievements yet</div>
          )}
        </div>
      </div>

      {/* Recent achievements */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Achievements</h2>
          <Link to="/student/achievements" className="text-sm text-brand-600 font-semibold hover:underline">View all</Link>
        </div>
        {achievements.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Trophy className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No achievements uploaded yet</p>
            <Link to="/student/achievements" className="mt-3 inline-block btn-primary text-sm">Upload Achievement</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {achievements.slice(0, 5).map(a => (
              <div key={a._id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{a.title}</p>
                  <p className="text-xs text-slate-500 capitalize mt-0.5">{a.category} · {a.level} · {a.position}</p>
                </div>
                <div className="flex items-center gap-3">
                  {a.status === 'verified' && <span className="text-sm font-bold text-brand-600">+{a.score} pts</span>}
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
