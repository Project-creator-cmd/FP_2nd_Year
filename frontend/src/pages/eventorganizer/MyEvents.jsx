import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../utils/api"
import toast from "react-hot-toast"
import { Calendar, Download, Trash2, Plus, FileText } from "lucide-react"

const CATEGORY_COLORS = {
  academic: "bg-blue-50 text-blue-700 border-blue-100",
  technical: "bg-brand-50 text-brand-700 border-brand-100",
  sports: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cultural: "bg-pink-50 text-pink-700 border-pink-100",
  internship: "bg-orange-50 text-orange-700 border-orange-100",
  certification: "bg-purple-50 text-purple-700 border-purple-100",
  research: "bg-teal-50 text-teal-700 border-teal-100",
  other: "bg-slate-50 text-slate-700 border-slate-100",
}

function fmtDate(d) {
  if (!d) return "-"
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function liveStatus(e) {
  return e.endDate && new Date() > new Date(e.endDate) ? "closed" : "active"
}

export default function OrganizerMyEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    try {
      const { data } = await api.get("/events/mine")
      setEvents(data.events || [])
    } catch { toast.error("Failed to load events") }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEvents() }, [])

  const handleDelete = async id => {
    if (!confirm("Delete this event? This cannot be undone.")) return
    try {
      await api.delete(`/events/${id}`)
      setEvents(prev => prev.filter(e => e._id !== id))
      toast.success("Event deleted")
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed") }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sky-500" /> My Events
          </h1>
          <p className="text-slate-500 text-sm mt-1">{events.length} event{events.length !== 1 ? "s" : ""} uploaded</p>
        </div>
        <Link to="/organizer/upload" className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Upload Event
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" /></div>
      ) : events.length === 0 ? (
        <div className="card p-16 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-600 mb-1">No events yet</p>
          <p className="text-sm text-slate-400 mb-5">Upload your first event to get started.</p>
          <Link to="/organizer/upload" className="btn-primary gap-2 text-sm"><Plus className="w-4 h-4" /> Upload Event</Link>
        </div>
      ) : (
        <div className="grid gap-4 animate-stagger">
          {events.map(e => {
            const catStyle = CATEGORY_COLORS[e.category] || CATEGORY_COLORS.other
            const status = liveStatus(e)
            return (
              <div key={e._id} className="card p-5 hover-lift border-l-4"
                style={{ borderLeftColor: status === "active" ? "#10b981" : "#94a3b8" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-2">
                      <h3 className="font-bold text-slate-900">{e.title}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize border ${catStyle}`}>{e.category}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{status}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fmtDate(e.startDate)} to {fmtDate(e.endDate)}
                      </span>
                      <span className="capitalize">{e.level}</span>
                      <span>{e.department}</span>
                      {e.organizingBody && <span>{e.organizingBody}</span>}
                    </div>
                    {e.description && <p className="text-xs text-slate-500 line-clamp-2">{e.description}</p>}
                    {e.participantListUrl && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-medium">
                        <FileText className="w-3.5 h-3.5" /> Participant list uploaded
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {e.participantListUrl && (
                      <a href={e.participantListUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    )}
                    <button onClick={() => handleDelete(e._id)} className="btn-icon text-slate-400 hover:text-red-600 hover:bg-red-50" title="Delete event">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}