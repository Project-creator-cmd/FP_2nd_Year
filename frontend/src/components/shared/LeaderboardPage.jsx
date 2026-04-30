import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Trophy, Crown, Medal, TrendingUp, Search, Download, Users, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const DIST_COLORS = ['#ef4444', '#f59e0b', '#6366f1', '#8b5cf6', '#10b981']

function RankIcon({ rank }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />
  return <span className="text-sm font-bold text-slate-400 w-5 text-center">#{rank}</span>
}

/**
 * Shared leaderboard page used by faculty, dept_head, admin, placement.
 *
 * Props:
 *  mode: 'department' | 'global'
 *  showDeptFilter: boolean  (admin/placement can switch departments)
 *  showDistChart: boolean   (dept_head gets score distribution chart)
 *  showPlacementFilter: boolean  (placement officer can filter by placementReady)
 *  showExport: boolean
 *  showContactCols: boolean  (placement officer sees email/phone)
 *  title: string
 */
export default function LeaderboardPage({
  mode = 'department',
  showDeptFilter = false,
  showDistChart = false,
  showPlacementFilter = false,
  showExport = false,
  showContactCols = false,
  title = 'Leaderboard',
}) {
  const { user } = useAuth()

  const [students,   setStudents]   = useState([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [exporting,  setExporting]  = useState(false)

  const [search,          setSearch]          = useState('')
  const [yearFilter,      setYearFilter]       = useState('')
  const [deptFilter,      setDeptFilter]       = useState('')
  const [placementFilter, setPlacementFilter]  = useState('')
  const [page,            setPage]             = useState(1)
  const [departments,     setDepartments]      = useState([])

  const LIMIT = 50

  // Fetch available departments for filter dropdown
  useEffect(() => {
    if (showDeptFilter) {
      api.get('/analytics/overview').then(r => {
        const depts = (r.data.data?.departmentStats || []).map(d => d.department)
        setDepartments(depts)
      }).catch(() => {})
    }
  }, [showDeptFilter])

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT }
      if (yearFilter)      params.year           = yearFilter
      if (search)          params.search         = search
      if (placementFilter) params.placementReady = placementFilter

      let endpoint = '/leaderboard'
      if (mode === 'global') {
        endpoint = '/leaderboard/global'
        if (deptFilter) params.department = deptFilter
      } else {
        // department mode — use own dept unless admin with filter
        params.department = deptFilter || user.department
      }

      const { data } = await api.get(endpoint, { params })
      setStudents(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.pages || 1)
    } catch {
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }, [page, yearFilter, search, deptFilter, placementFilter, mode, user.department])

  useEffect(() => { fetchStudents() }, [fetchStudents])
  useEffect(() => { setPage(1) }, [yearFilter, search, deptFilter, placementFilter])

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = {}
      if (yearFilter)      params.year           = yearFilter
      if (deptFilter)      params.department     = deptFilter || user.department
      if (placementFilter) params.placementReady = placementFilter
      const res = await api.get('/leaderboard/export', { params, responseType: 'blob' })
      const url  = URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.download = 'leaderboard.csv'
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Exported!')
    } catch { toast.error('Export failed') }
    finally { setExporting(false) }
  }

  // Summary stats
  const readyCount = students.filter(s => s.placementReady).length
  const avgScore   = students.length ? Math.round(students.reduce((s, x) => s + x.totalScore, 0) / students.length) : 0
  const highScore  = students.length ? Math.max(...students.map(s => s.totalScore)) : 0

  // Score distribution for dept_head chart
  const distData = showDistChart ? [
    { range: '0-24',  count: students.filter(s => s.totalScore < 25).length },
    { range: '25-49', count: students.filter(s => s.totalScore >= 25 && s.totalScore < 50).length },
    { range: '50-74', count: students.filter(s => s.totalScore >= 50 && s.totalScore < 75).length },
    { range: '75-99', count: students.filter(s => s.totalScore >= 75 && s.totalScore < 100).length },
    { range: '100+',  count: students.filter(s => s.totalScore >= 100).length },
  ] : []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> {title}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{total} students</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {showExport && (
            <button onClick={handleExport} disabled={exporting} className="btn-secondary gap-2 text-sm">
              <Download className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Students',   value: total,      icon: Users,      bg: 'bg-blue-50',    color: 'text-blue-600' },
          { label: 'Placement Ready',  value: readyCount, icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Avg Score',        value: avgScore,   icon: Star,       bg: 'bg-brand-50',   color: 'text-brand-600' },
          { label: 'Highest Score',    value: highScore,  icon: Crown,      bg: 'bg-amber-50',   color: 'text-amber-600' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: '18px', height: '18px' }} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Score distribution chart (dept_head only) */}
      {showDistChart && distData.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Score Distribution</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={distData} barSize={36} margin={{ left: -20 }}>
              <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
              <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]} animationDuration={800}>
                {distData.map((_, i) => <Cell key={i} fill={DIST_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-9 text-sm" placeholder="Search by name or roll number..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-32 text-sm" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
          <option value="">All Years</option>
          {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
        </select>
        {showDeptFilter && (
          <select className="input w-48 text-sm" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
        {showPlacementFilter && (
          <select className="input w-44 text-sm" value={placementFilter} onChange={e => setPlacementFilter(e.target.value)}>
            <option value="">All Students</option>
            <option value="true">Placement Ready Only</option>
          </select>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="card p-16 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-600">No students found in this department</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th w-12">Rank</th>
                  <th className="th">Student</th>
                  {showDeptFilter && <th className="th">Department</th>}
                  <th className="th">Year</th>
                  <th className="th">Section</th>
                  <th className="th">Score</th>
                  <th className="th">Achievements</th>
                  {showContactCols && <th className="th">CGPA</th>}
                  <th className="th">Status</th>
                  {showContactCols && <th className="th">Contact</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map(s => (
                  <tr key={s._id} className="table-row-hover">
                    <td className="td">
                      <div className="flex items-center justify-center">
                        <RankIcon rank={s.rank} />
                      </div>
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
                          {s.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.rollNumber}</p>
                        </div>
                      </div>
                    </td>
                    {showDeptFilter && <td className="td text-sm text-slate-600">{s.department}</td>}
                    <td className="td text-sm text-slate-600">Year {s.year}</td>
                    <td className="td text-sm text-slate-600">{s.section || '-'}</td>
                    <td className="td font-extrabold text-brand-700">{s.totalScore}</td>
                    <td className="td text-sm text-slate-600">{s.achievementCount ?? '-'}</td>
                    {showContactCols && <td className="td text-sm text-slate-600">{s.cgpa || '-'}</td>}
                    <td className="td">
                      {s.placementReady
                        ? <span className="badge-verified flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Ready</span>
                        : <span className="text-xs text-slate-400">-</span>
                      }
                    </td>
                    {showContactCols && (
                      <td className="td">
                        <div className="flex gap-2">
                          {s.email && <a href={`mailto:${s.email}`} className="text-xs text-brand-600 hover:underline">Email</a>}
                          {s.phone && <a href={`tel:${s.phone}`} className="text-xs text-emerald-600 hover:underline">Call</a>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary text-sm disabled:opacity-40">Previous</button>
              <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-secondary text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
