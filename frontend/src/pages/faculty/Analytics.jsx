import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts'
import { TrendingUp, Users, Trophy, Award } from 'lucide-react'

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#0ea5e9']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function FacultyAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/department')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>
  if (!data) return null

  const { summary: s, byCategory, byLevel, byMonth, topStudents, scoreDistribution } = data

  const monthlyData = byMonth.map(m => ({ name: MONTHS[m._id.month-1], count: m.count }))
  const catData = byCategory.map(c => ({ name: c._id, value: c.count, score: c.totalScore }))
  const levelData = byLevel.map(l => ({ name: l._id, value: l.count }))
  const distData = scoreDistribution.map(d => ({ name: d._id, count: d.count })).sort((a,b) => {
    const order = ['0-24','25-49','50-74','75-99','100+']
    return order.indexOf(a.name) - order.indexOf(b.name)
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-title">Department Analytics</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: s.totalStudents, icon: Users, bg:'bg-blue-50', color:'text-blue-600' },
          { label: 'Verified Achievements', value: s.verifiedAchievements, icon: Trophy, bg:'bg-green-50', color:'text-green-600' },
          { label: 'Pending Review', value: s.pendingAchievements, icon: Award, bg:'bg-amber-50', color:'text-amber-600' },
          { label: 'Placement Ready', value: s.placementReady, icon: TrendingUp, bg:'bg-brand-50', color:'text-brand-600' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly trend */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Monthly Achievements</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="name" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={{borderRadius:12,border:'none',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',fontSize:13}}/>
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{fill:'#6366f1',r:4}} activeDot={{r:6}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* By Category */}
        <div className="card p-5">
          <h2 className="section-title mb-4">By Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catData} barSize={28}>
              <XAxis dataKey="name" tick={{fontSize:10}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={{borderRadius:12,border:'none',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',fontSize:13}}/>
              <Bar dataKey="value" radius={[6,6,0,0]}>
                {catData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score distribution */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Score Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={distData} barSize={36}>
              <XAxis dataKey="name" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={{borderRadius:12,border:'none',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',fontSize:13}}/>
              <Bar dataKey="count" fill="#6366f1" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Level breakdown */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Achievement Levels</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={levelData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" label={({name,value})=>`${name}: ${value}`} labelLine={false} fontSize={10}>
                {levelData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{borderRadius:12,border:'none',fontSize:13}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top students */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Top Students</h2>
        <div className="divide-y divide-slate-50">
          {topStudents.map((s, i) => (
            <div key={s._id} className="flex items-center gap-4 py-3">
              <span className="w-6 text-center text-sm font-bold text-slate-400">#{i+1}</span>
              <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                {s.name?.slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                <p className="text-xs text-slate-400">{s.rollNumber} · Year {s.year}</p>
              </div>
              {s.placementReady && <span className="badge-verified">Ready</span>}
              <span className="font-bold text-brand-600">{s.totalScore} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
