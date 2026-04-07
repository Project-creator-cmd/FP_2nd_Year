import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { CheckSquare, Clock, Users, BarChart2, TrendingUp } from 'lucide-react'

export default function FacultyDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/department'),
      api.get('/achievements/department', { params: { status: 'pending' } })
    ]).then(([a, ach]) => {
      setStats(a.data.data)
      setPending(ach.data.achievements.slice(0, 5))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>

  const s = stats?.summary || {}

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Faculty Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">{user?.department} Department</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: s.totalStudents||0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Verify', value: s.pendingAchievements||0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Verified', value: s.verifiedAchievements||0, icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Placement Ready', value: s.placementReady||0, icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50' },
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

      {/* Pending achievements */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Pending Verifications</h2>
          <Link to="/faculty/verify" className="text-sm text-brand-600 font-semibold hover:underline">View all</Link>
        </div>
        {pending.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>All caught up! No pending verifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {pending.map(a => (
              <div key={a._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.student?.name} · {a.student?.rollNumber} · <span className="capitalize">{a.category} · {a.level}</span></p>
                </div>
                <span className="badge-pending">Pending</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
