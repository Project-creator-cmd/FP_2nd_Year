import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Calendar, Download } from 'lucide-react'

export default function DeptHeadEvents() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/events')
      .then(r => setEvents(r.data.events || []))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Department Events</h1>
        <p className="text-slate-500 text-sm mt-1">{user.department} - Events uploaded by organizers</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" /></div>
      ) : events.length === 0 ? (
        <div className="card p-16 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-600">No events yet</p>
          <p className="text-sm text-slate-400 mt-1">Events created by organizers for your department will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 animate-stagger">
          {events.map(e => (
            <div key={e._id} className="card p-5 hover-lift">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-2">
                    <h3 className="font-bold text-slate-900">{e.title}</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg capitalize bg-brand-50 text-brand-700 border border-brand-100">{e.category}</span>
                    <span className={e.status === 'active' ? 'text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700' : 'text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500'}>{e.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-2">
                    <span>{new Date(e.eventDate).toLocaleDateString()}</span>
                    <span className="capitalize">{e.level}</span>
                    {e.organizingBody && <span>{e.organizingBody}</span>}
                    <span>Organizer: {e.organizer?.name}</span>
                  </div>
                  {e.description && <p className="text-xs text-slate-500 line-clamp-2">{e.description}</p>}
                </div>
                {e.participantFileUrl && (
                  <a href={e.participantFileUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs gap-1.5 flex-shrink-0">
                    <Download className="w-3.5 h-3.5" /> Participants
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
