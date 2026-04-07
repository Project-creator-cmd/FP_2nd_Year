import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { UserCheck, Users, Building, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444']

export default function PlacementDashboard() {
  const [stats, setStats] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/placement/stats'),
      api.get('/placement', { params: { limit: 5 } })
    ]).then(([s, p]) => {
      setStats(s.data.data)
      setRecent(p.data.data.slice(0,5))
    }).catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false))
  }, [])

  const total = stats.reduce((s,d)=>s+d.total, 0)
  const ready = stats.reduce((s,d)=>s+d.ready, 0)
  const globalPct = total ? Math.round(ready/total*100) : 0

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Placement Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Track placement readiness across departments</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label:'Total Students', value:total, icon:Users, bg:'bg-blue-50', color:'text-blue-600' },
          { label:'Placement Ready', value:ready, icon:UserCheck, bg:'bg-green-50', color:'text-green-600' },
          { label:'Overall Rate', value:`${globalPct}%`, icon:TrendingUp, bg:'bg-brand-50', color:'text-brand-600' },
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

      {/* Dept chart */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Readiness by Department</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats} barSize={28}>
            <XAxis dataKey="department" tick={{fontSize:10}} tickLine={false} axisLine={false}
              tickFormatter={v=>v.split(' ')[0]}/>
            <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false}/>
            <Tooltip contentStyle={{borderRadius:12,border:'none',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',fontSize:13}}
              formatter={(v,n)=>[`${v} students`, n==='ready'?'Placement Ready':'Total']}/>
            <Bar dataKey="ready" name="ready" radius={[6,6,0,0]}>
              {stats.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department breakdown table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="section-title">Department Breakdown</h2>
          <Link to="/placement/students" className="text-sm text-brand-600 font-semibold hover:underline">View All Students →</Link>
        </div>
        <div className="divide-y divide-slate-50">
          {stats.map(d => (
            <div key={d.department} className="px-5 py-4 flex items-center gap-4">
              <Building className="w-5 h-5 text-slate-400 flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{d.department}</p>
                <p className="text-xs text-slate-400">{d.total} students total</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{width:`${d.percentage}%`}}/>
                </div>
                <span className="text-sm font-bold text-green-700 w-10">{d.percentage}%</span>
                <span className="text-sm text-slate-600">{d.ready} ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent placement-ready students */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recently Placement Ready</h2>
          <Link to="/placement/students" className="text-sm text-brand-600 font-semibold hover:underline">View all</Link>
        </div>
        <div className="space-y-3">
          {recent.map(s => (
            <div key={s._id} className="flex items-center gap-4 py-2">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                {s.name?.slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{s.name}</p>
                <p className="text-xs text-slate-400">{s.rollNumber} · {s.department}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-brand-600 text-sm">{s.totalScore} pts</p>
                <p className="text-xs text-slate-400">CGPA {s.cgpa}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
