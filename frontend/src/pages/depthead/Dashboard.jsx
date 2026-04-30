import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../utils/api"
import { CheckSquare, Clock, Users, Trophy, TrendingUp, ArrowUpRight, Sparkles, ClipboardList, Calendar, Download } from "lucide-react"

function fmtDate(d) {
  if (!d) return "-"
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function liveStatus(e) {
  return e.endDate && new Date() > new Date(e.endDate) ? "closed" : "active"
}

const CATEGORY_COLORS = {
  academic: "bg-blue-50 text-blue-700", technical: "bg-brand-50 text-brand-700",
  sports: "bg-emerald-50 text-emerald-700", cultural: "bg-pink-50 text-pink-700",
  internship: "bg-orange-50 text-orange-700", certification: "bg-purple-50 text-purple-700",
  research: "bg-teal-50 text-teal-700", other: "bg-slate-50 text-slate-600",
}

export default function DeptHeadDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get("/analytics/department").catch(() => ({ data: { data: null } })),
      api.get("/achievements/department", { params: { status: "pending" } }).catch(() => ({ data: { achievements: [] } })),
      api.get("/relaxation/department", { params: { status: "pending_admin" } }).catch(() => ({ data: { requests: [] } })),
      api.get("/events/department").catch(() => ({ data: { events: [] } })),
    ]).then(([analytics, pending, relaxations, ev]) => {
      setData({
        analytics: analytics.data?.data,
        pendingAchievements: pending.data?.achievements || [],
        pendingRelaxations: relaxations.data?.requests || [],
      })
      setEvents(ev.data?.events || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
    </div>
  )

  const { analytics, pendingAchievements, pendingRelaxations } = data || {}
  const s = analytics?.summary

  const now = new Date()
  const thisMonthEvents = events.filter(e => {
    const d = new Date(e.createdAt || e.startDate)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const CARDS = [
    { label: "Total Students",       value: s?.totalStudents ?? "-",           icon: Users,        bg: "bg-blue-50",    color: "text-blue-600",   to: "/depthead/users" },
    { label: "Pending Achievements", value: s?.pendingAchievements ?? pendingAchievements?.length ?? 0, icon: Clock, bg: "bg-amber-50",   color: "text-amber-600",  to: "/depthead/verify" },
    { label: "Verified",             value: s?.verifiedAchievements ?? "-",    icon: Trophy,       bg: "bg-purple-50",  color: "text-purple-600", to: "/depthead/verify" },
    { label: "Placement Ready",      value: s?.placementReady ?? "-",          icon: TrendingUp,   bg: "bg-emerald-50", color: "text-emerald-600",to: "/depthead/analytics" },
    { label: "Pending Relaxations",  value: pendingRelaxations?.length ?? 0,   icon: ClipboardList,bg: "bg-rose-50",    color: "text-rose-600",   to: "/depthead/relaxation" },
    { label: "Events This Month",    value: thisMonthEvents,                   icon: Calendar,     bg: "bg-sky-50",     color: "text-sky-600",    to: "/depthead/events" },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 60%, #0f0f1e 100%)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
        <div className="absolute top-[-30%] right-[-5%] w-64 h-64 rounded-full opacity-20 animate-blob pointer-events-none"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Department Head</span>
            <span className="w-1 h-1 rounded-full bg-amber-500" />
            <span className="text-xs text-slate-500">{user?.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
            Welcome, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-400 text-sm">Manage your department achievements, scoring, and relaxation requests.</p>
        </div>
      </div>

      {/* Stats grid — 6 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-stagger">
        {CARDS.map(({ label, value, icon: Icon, bg, color, to }) => (
          <Link key={label} to={to} className="stat-card group hover:no-underline">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5 leading-tight">{label}</p>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 absolute top-4 right-4 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Pending verifications + Top students */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-brand-500" /> Pending Verifications
            </h2>
            <Link to="/depthead/verify" className="text-xs font-bold text-brand-600 hover:text-brand-700 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors">View All</Link>
          </div>
          {!pendingAchievements || pendingAchievements.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No pending verifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingAchievements.slice(0, 5).map(a => (
                <div key={a._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.userId?.name} - <span className="capitalize">{a.userRole}</span></p>
                  </div>
                  <span className="badge-pending ml-3 flex-shrink-0">Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Top Students
            </h2>
            <Link to="/depthead/analytics" className="text-xs font-bold text-brand-600 hover:text-brand-700 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors">Analytics</Link>
          </div>
          {!analytics?.topStudents || analytics.topStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Trophy className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No student data yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {analytics.topStudents.map((st, i) => (
                <div key={st._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-100 text-slate-600" : "bg-orange-50 text-orange-700"}`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{st.name}</p>
                    <p className="text-xs text-slate-500">{st.rollNumber} - Year {st.year}</p>
                  </div>
                  <span className="text-sm font-extrabold text-brand-700">{st.totalScore} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Department Events */}
      <div className="card p-5 hover-lift">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-500" /> Department Events
          </h2>
          <Link to="/depthead/events" className="text-xs font-bold text-brand-600 hover:text-brand-700 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors">View All</Link>
        </div>
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No events uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["Event Title", "Category", "Dates", "Status", "Organizer", "Linked", "Participants"].map(h => (
                    <th key={h} className="th whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {events.slice(0, 8).map(e => {
                  const status = liveStatus(e)
                  return (
                    <tr key={e._id} className="table-row-hover">
                      <td className="td">
                        <p className="font-semibold text-slate-800 text-sm">{e.title}</p>
                        {e.organizingBody && <p className="text-xs text-slate-400">{e.organizingBody}</p>}
                      </td>
                      <td className="td">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md capitalize ${CATEGORY_COLORS[e.category] || CATEGORY_COLORS.other}`}>{e.category}</span>
                      </td>
                      <td className="td text-xs text-slate-600 whitespace-nowrap">{fmtDate(e.startDate)} to {fmtDate(e.endDate)}</td>
                      <td className="td">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{status}</span>
                      </td>
                      <td className="td text-xs text-slate-600">{e.organizer?.name || "-"}</td>
                      <td className="td">
                        {e.linkedAchievements > 0 ? (
                          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">{e.linkedAchievements}</span>
                        ) : <span className="text-xs text-slate-400">0</span>}
                      </td>
                      <td className="td">
                        {e.participantListUrl ? (
                          <a href={e.participantListUrl} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
                            <Download className="w-3.5 h-3.5" /> View
                          </a>
                        ) : <span className="text-xs text-slate-400">-</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}