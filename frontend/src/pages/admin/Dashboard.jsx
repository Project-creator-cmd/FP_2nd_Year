import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { Users, Trophy, CheckCircle, Clock, TrendingUp, Building, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444']

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/overview')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>
  if (!data) return null

  const { globalStats: g, departmentStats: depts } = data

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">System-wide overview</p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: g.totalUsers, icon: Users, bg:'bg-blue-50', color:'text-blue-600' },
          { label: 'Total Students', value: g.totalStudents, icon: Users, bg:'bg-brand-50', color:'text-brand-600' },
          { label: 'Verified Achievements', value: g.verified, icon: CheckCircle, bg:'bg-green-50', color:'text-green-600' },
          { label: 'Pending Achievements', value: g.pending, icon: Clock, bg:'bg-amber-50', color:'text-amber-600' },
          { label: 'Placement Ready', value: g.placementReady, icon: TrendingUp, bg:'bg-purple-50', color:'text-purple-600' },
          { label: 'Total Achievements', value: g.totalAchievements, icon: Trophy, bg:'bg-rose-50', color:'text-rose-600' },
          { label: 'Pending Relaxations', value: g.pendingRelaxations, icon: AlertTriangle, bg:'bg-orange-50', color:'text-orange-600' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-5 h-5 ${color}`}/>
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending alerts */}
      {g.pendingRelaxations > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800 font-semibold text-sm">{g.pendingRelaxations} relaxation request{g.pendingRelaxations>1?'s':''} awaiting your approval</p>
          </div>
          <Link to="/admin/relaxation" className="text-amber-700 font-bold text-sm hover:underline">Review →</Link>
        </div>
      )}

      {/* Dept chart */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Placement Readiness by Department</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={depts} barSize={32}>
            <XAxis dataKey="department" tick={{fontSize:10}} tickLine={false} axisLine={false}/>
            <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false}/>
            <Tooltip contentStyle={{borderRadius:12,border:'none',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',fontSize:13}}/>
            <Bar dataKey="placementReady" name="Placement Ready" radius={[6,6,0,0]}>
              {depts.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dept table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="section-title">Department Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                {['Department','Students','Achievements','Placement Ready','Rate'].map(h=>(
                  <th key={h} className="text-left px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {depts.map(d => (
                <tr key={d.department} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-800">{d.department}</td>
                  <td className="px-5 py-3 text-slate-600">{d.students}</td>
                  <td className="px-5 py-3 text-slate-600">{d.achievements}</td>
                  <td className="px-5 py-3 text-green-700 font-semibold">{d.placementReady}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{width:`${d.students?Math.round(d.placementReady/d.students*100):0}%`}}/>
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-10">
                        {d.students ? Math.round(d.placementReady/d.students*100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
