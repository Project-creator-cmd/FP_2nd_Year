import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import { Users, Trophy, TrendingUp, CheckCircle } from 'lucide-react'

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899']

export default function AdminAnalytics() {
  const [overview, setOverview] = useState(null)
  const [deptDetail, setDeptDetail] = useState(null)
  const [selDept, setSelDept] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/overview')
      .then(r => { setOverview(r.data.data); if (r.data.data.departmentStats[0]) setSelDept(r.data.data.departmentStats[0].department) })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selDept) return
    api.get('/analytics/department', { params: { department: selDept } })
      .then(r => setDeptDetail(r.data.data))
      .catch(() => {})
  }, [selDept])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>
  if (!overview) return null

  const { globalStats: g, departmentStats: depts } = overview

  const deptPlacementData = depts.map(d => ({ name: d.department.split(' ')[0], students: d.students, ready: d.placementReady }))

  const catData = deptDetail?.byCategory?.map(c => ({ name: c._id, value: c.count })) || []
  const levelData = deptDetail?.byLevel?.map(l => ({ name: l._id, value: l.count })) || []

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-title">System Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Students', value:g.totalStudents, icon:Users, bg:'bg-blue-50', color:'text-blue-600' },
          { label:'Total Achievements', value:g.totalAchievements, icon:Trophy, bg:'bg-purple-50', color:'text-purple-600' },
          { label:'Verified', value:g.verified, icon:CheckCircle, bg:'bg-green-50', color:'text-green-600' },
          { label:'Placement Ready', value:g.placementReady, icon:TrendingUp, bg:'bg-brand-50', color:'text-brand-600' },
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

      {/* Dept comparison */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Students vs Placement Ready by Department</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={deptPlacementData} barGap={4}>
            <XAxis dataKey="name" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
            <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false}/>
            <Tooltip contentStyle={{borderRadius:12,border:'none',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',fontSize:13}}/>
            <Legend wrapperStyle={{fontSize:12}}/>
            <Bar dataKey="students" name="Total Students" fill="#e0e7ff" radius={[4,4,0,0]} barSize={20}/>
            <Bar dataKey="ready" name="Placement Ready" fill="#6366f1" radius={[4,4,0,0]} barSize={20}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dept drill-down */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="section-title">Department Deep-Dive</h2>
          <select className="input w-52" value={selDept} onChange={e=>setSelDept(e.target.value)}>
            {depts.map(d=><option key={d.department} value={d.department}>{d.department}</option>)}
          </select>
        </div>
        {deptDetail && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-3">By Category</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={catData} barSize={24}>
                  <XAxis dataKey="name" tick={{fontSize:10}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={{borderRadius:12,border:'none',fontSize:13}}/>
                  <Bar dataKey="value" radius={[4,4,0,0]}>
                    {catData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-3">By Level</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={levelData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name,value})=>`${name}:${value}`} labelLine={false} fontSize={10}>
                    {levelData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius:12,border:'none',fontSize:13}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
