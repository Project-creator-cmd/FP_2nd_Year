import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { Trophy, Star, TrendingUp, Award, CheckCircle, ArrowUpRight, Plus, Rocket } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'

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

  const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899']

  const placementPct = Math.min(100, Math.round((user?.totalScore || 0) / 100 * 100))
  const isPlacementReady = user?.placementReady || user?.totalScore >= 100

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-white border border-slate-200/60 rounded-2xl p-6 sm:p-8 shadow-soft">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-brand-400/20 to-purple-400/20 rounded-full blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-gradient-to-tr from-blue-400/20 to-teal-400/20 rounded-full blur-3xl mix-blend-multiply"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-lg">
              {user?.department} · {user?.rollNumber} · Year {user?.year}
            </p>
          </div>
          {isPlacementReady && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle className="w-5 h-5" /> Placement Ready
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Total Score', value: user?.totalScore || 0, icon: Award, color: 'text-brand-600', bg: 'bg-brand-50', trend: '+12 pts' },
          { label: 'Dept Rank', value: rank ? `#${rank.rank}` : '—', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Top 5%' },
          { label: 'Achievements', value: achievements.length, icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+2 new' },
          { label: 'Attendance', value: `${user?.attendance || 75}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Stable' },
        ].map(({ label, value, icon: Icon, color, bg, trend }, i) => (
          <div key={label} className="stat-card hover-lift group">
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">{value}</p>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> {trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Placement Progress Chart / Bar */}
        <div className="card p-6 flex flex-col hover-lift">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Career Readiness</h2>
            <Rocket className="w-5 h-5 text-brand-500" />
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">Target: 100 points</span>
              <span className="text-2xl font-bold text-slate-900">{user?.totalScore || 0}<span className="text-sm text-slate-400 font-normal">/100</span></span>
            </div>
            
            {/* Thick Progress Bar */}
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-4 shadow-inner relative">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-500 via-purple-500 to-brand-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${placementPct}%` }} />
            </div>

            {isPlacementReady
              ? <div className="bg-emerald-50 rounded-xl p-3 text-emerald-700 text-sm font-medium flex items-center gap-2 mb-4 ring-1 ring-emerald-200/50"><CheckCircle className="w-4 h-4" /> You're ready for placement drives!</div>
              : <p className="text-slate-500 text-sm mb-4">Complete more achievements to unlock placement opportunities.</p>
            }
            
            <div className="mt-auto grid grid-cols-3 gap-2">
              <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                <p className="text-xl font-bold text-emerald-600 mb-0.5">{verified.length}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Verified</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                <p className="text-xl font-bold text-amber-500 mb-0.5">{pending.length}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Pending</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                <p className="text-xl font-bold text-rose-500 mb-0.5">{rejected.length}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Score by Category Bar Chart */}
        <div className="card p-6 col-span-2 hover-lift flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Score Distribution</h2>
          </div>
          
          <div className="flex-1 min-h-[240px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} dy={10} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '8px 12px' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: '14px' }}
                    formatter={(val) => [`${val} points`, 'Score']}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1000}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <BarChart className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium text-sm">No verified data yet to generate chart.</p>
                <p className="text-slate-400 text-xs mt-1">Submit achievements to see your progress here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent achievements */}
      <div className="card p-6 hover-lift">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Recent Activity</h2>
          <Link to="/student/achievements" className="text-sm text-brand-600 font-semibold hover:text-brand-700 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            View All
          </Link>
        </div>
        
        {achievements.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-slate-50/50 group-hover:bg-slate-50 transition-colors"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-8 h-8 text-brand-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Start Building Your Profile</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Upload your first achievement certificates to earn points and boost your placement readiness score.</p>
              <Link to="/student/achievements" className="inline-flex items-center gap-2 btn-primary shadow-brand-500/20 group-hover:shadow-brand-500/40">
                <Plus className="w-4 h-4" /> Add Achievement
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {achievements.slice(0, 5).map((a, i) => (
              <div key={a._id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="hidden sm:flex w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center text-slate-400 group-hover:text-brand-500 group-hover:border-brand-200 transition-colors">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-brand-700 transition-colors text-sm">{a.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded capitalize">{a.category}</span>
                      <span className="text-xs text-slate-400">&bull;</span>
                      <span className="text-xs text-slate-500 capitalize">{a.level}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {a.status === 'verified' && <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+{a.score} pts</span>}
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
