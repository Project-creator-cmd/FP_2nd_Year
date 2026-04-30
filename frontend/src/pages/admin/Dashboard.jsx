import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import {
  Users, Trophy, CheckCircle, Clock, TrendingUp, Building,
  AlertTriangle, ArrowUpRight, Sparkles, BarChart3, Zap
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-soft-lg">
        <p className="text-xs font-bold text-slate-500 mb-1">{label}</p>
        <p className="text-base font-extrabold text-slate-900">{payload[0].value} <span className="text-xs font-normal text-slate-400">students</span></p>
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/overview')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
  if (!data) return null

  const { globalStats: g, departmentStats: depts } = data

  const STAT_CARDS = [
    { label: 'Total Users', value: g.totalUsers, icon: Users, bg: 'bg-blue-50', color: 'text-blue-600', gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Total Students', value: g.totalStudents, icon: Users, bg: 'bg-brand-50', color: 'text-brand-600', gradient: 'from-brand-500 to-violet-500' },
    { label: 'Total Faculty', value: g.totalFaculty, icon: Building, bg: 'bg-indigo-50', color: 'text-indigo-600', gradient: 'from-indigo-500 to-blue-500' },
    { label: 'Verified', value: g.verified, icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Pending', value: g.pending, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600', gradient: 'from-amber-400 to-orange-500' },
    { label: 'Placement Ready', value: g.placementReady, icon: TrendingUp, bg: 'bg-purple-50', color: 'text-purple-600', gradient: 'from-purple-500 to-pink-500' },
    { label: 'Total Achievements', value: g.totalAchievements, icon: Trophy, bg: 'bg-rose-50', color: 'text-rose-600', gradient: 'from-rose-500 to-pink-500' },
    { label: 'Pending Relaxations', value: g.pendingRelaxations, icon: AlertTriangle, bg: 'bg-orange-50', color: 'text-orange-600', gradient: 'from-orange-400 to-red-500' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            Admin Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">System-wide overview · Live data</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-700">Live</span>
        </div>
      </div>

      {/* Alert */}
      {g.pendingRelaxations > 0 && (
        <div className="relative overflow-hidden rounded-2xl p-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(251,191,36,0.05))', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600" style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <p className="text-amber-800 font-bold text-sm">
                {g.pendingRelaxations} relaxation request{g.pendingRelaxations > 1 ? 's' : ''} awaiting approval
              </p>
              <p className="text-amber-600 text-xs">Review and take action to keep students on track</p>
            </div>
          </div>
          <Link to="/admin/relaxation"
            className="flex items-center gap-1.5 text-amber-700 font-bold text-sm hover:text-amber-800 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-colors flex-shrink-0">
            Review <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
        {STAT_CARDS.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="stat-card group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card p-6 hover-lift">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-500" />
            Placement Readiness by Department
          </h2>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={depts} barSize={36} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="department" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} dy={8} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} dx={-8} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)', radius: 8 }} />
            <Bar dataKey="placementReady" name="Placement Ready" radius={[8, 8, 0, 0]} animationDuration={1200}>
              {depts.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]}
                  style={{ filter: `drop-shadow(0 4px 8px ${COLORS[i % COLORS.length]}40)` }} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department Table */}
      <div className="card overflow-hidden hover-lift">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="section-title">Department Summary</h2>
          <span className="text-xs text-slate-400 font-medium">{depts.length} departments</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80">
              <tr>
                {['Department', 'Students', 'Faculty', 'Achievements', 'Placement Ready', 'Rate'].map(h => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {depts.map((d, i) => {
                const rate = d.students ? Math.round(d.placementReady / d.students * 100) : 0
                return (
                  <tr key={d.department} className="table-row-hover">
                    <td className="td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="font-bold text-slate-800">{d.department}</span>
                      </div>
                    </td>
                    <td className="td text-slate-600">{d.students}</td>
                    <td className="td text-slate-600">{d.faculty}</td>
                    <td className="td text-slate-600">{d.achievements}</td>
                    <td className="td">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg text-xs">{d.placementReady}</span>
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${rate}%`, background: COLORS[i % COLORS.length] }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-8 text-right">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
