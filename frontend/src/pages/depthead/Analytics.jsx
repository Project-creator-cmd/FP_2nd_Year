import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { Users, Trophy, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

export default function DeptHeadAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/department')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
    </div>
  )
  if (!data) return null

  const { summary: s, byCategory, byLevel, topStudents, scoreDistribution } = data
  const catData = (byCategory || []).map(c => ({ name: c._id, value: c.count }))
  const levelData = (byLevel || []).map(l => ({ name: l._id, value: l.count }))
  const distData = (scoreDistribution || []).map(d => ({ name: d._id, value: d.count }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-600" /> Department Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1">Performance overview for your department</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-stagger">
        {[
          { label: 'Total Students', value: s?.totalStudents ?? 0, icon: Users, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Total Achievements', value: s?.totalAchievements ?? 0, icon: Trophy, bg: 'bg-purple-50', color: 'text-purple-600' },
          { label: 'Verified', value: s?.verifiedAchievements ?? 0, icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Pending', value: s?.pendingAchievements ?? 0, icon: Trophy, bg: 'bg-amber-50', color: 'text-amber-600' },
          { label: 'Placement Ready', value: s?.placementReady ?? 0, icon: TrendingUp, bg: 'bg-brand-50', color: 'text-brand-600' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5 hover-lift">
          <h2 className="section-title mb-4">Achievements by Category</h2>
          {catData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catData} barSize={28} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} dy={6} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 13 }} />
                <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]} animationDuration={1000}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5 hover-lift">
          <h2 className="section-title mb-4">Achievements by Level</h2>
          {levelData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={levelData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                  {levelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5 hover-lift">
          <h2 className="section-title mb-4">Score Distribution</h2>
          {distData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={distData} barSize={32} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
                <Bar dataKey="value" name="Students" radius={[6, 6, 0, 0]} fill="#6366f1" animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5 hover-lift">
          <h2 className="section-title mb-4">Top 5 Students</h2>
          {!topStudents || topStudents.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No student data yet</div>
          ) : (
            <div className="space-y-2">
              {topStudents.map((st, i) => (
                <div key={st._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-700'}`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{st.name}</p>
                    <p className="text-xs text-slate-500">{st.rollNumber} - Year {st.year}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-brand-700">{st.totalScore} pts</p>
                    {st.placementReady && <p className="text-xs text-emerald-600 font-bold">Ready</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}