import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../utils/api"
import { Calendar, Upload, FileText, ArrowUpRight, Plus, Sparkles } from "lucide-react"

const CATEGORY_COLORS = {
  academic: "bg-blue-50 text-blue-700", technical: "bg-brand-50 text-brand-700",
  sports: "bg-emerald-50 text-emerald-700", cultural: "bg-pink-50 text-pink-700",
  internship: "bg-orange-50 text-orange-700", certification: "bg-purple-50 text-purple-700",
  research: "bg-teal-50 text-teal-700", other: "bg-slate-50 text-slate-600",
}

function fmtDate(d) {
  if (!d) return "-"
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function liveStatus(event) {
  return event.endDate && new Date() > new Date(event.endDate) ? "closed" : "active"
}

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/events/mine")
      .then(r => setEvents(r.data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const active = events.filter(e => liveStatus(e) === "active").length
  const closed = events.filter(e => liveStatus(e) === "closed").length

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #0c1a2e 60%, #0f0f1e 100%)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
        <div className="absolute top-[-30%] right-[-5%] w-64 h-64 rounded-full opacity-20 animate-blob pointer-events-none"
          style={{ background: "radial-gradient(circle, #0ea5e9, transparent)" }} />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Event Organizer</span>
              <span className="w-1 h-1 rounded-full bg-sky-500" />
              <span className="text-xs text-slate-500">{user?.department}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Welcome, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-slate-400 text-sm">Upload events and participant lists for your department.</p>
          </div>
          <Link to="/organizer/upload" className="btn-primary gap-2 flex-shrink-0">
            <Plus className="w-4 h-4" /> Upload Event
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 animate-stagger">
        {[
          { label: "Total Events", value: events.length, icon: Calendar, bg: "bg-sky-50", color: "text-sky-600" },
          { label: "Active", value: active, icon: Sparkles, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "Closed", value: closed, icon: Calendar, bg: "bg-slate-100", color: "text-slate-500" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <Link key={label} to="/organizer/events" className="stat-card group hover:no-underline">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 absolute top-4 right-4 transition-colors" />
          </Link>
        ))}
      </div>

      <div className="card p-5 hover-lift">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Events</h2>
          <Link to="/organizer/events" className="text-xs font-bold text-brand-600 hover:text-brand-700 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors">View All</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="font-semibold text-slate-600 mb-1">No events yet</p>
            <p className="text-sm text-slate-400 mb-4">Upload your first event to get started.</p>
            <Link to="/organizer/upload" className="btn-primary gap-2 text-sm"><Plus className="w-4 h-4" /> Upload Event</Link>
          </div>
        ) : (
          <div className="space-y-2 animate-stagger">
            {events.slice(0, 6).map(e => {
              const status = liveStatus(e)
              return (
                <div key={e._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{e.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${CATEGORY_COLORS[e.category] || CATEGORY_COLORS.other}`}>{e.category}</span>
                      <span className="text-xs text-slate-400">{fmtDate(e.startDate)} to {fmtDate(e.endDate)}</span>
                      {e.participantListUrl && <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold"><FileText className="w-3 h-3" /> List uploaded</span>}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ml-3 flex-shrink-0 ${status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{status}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}