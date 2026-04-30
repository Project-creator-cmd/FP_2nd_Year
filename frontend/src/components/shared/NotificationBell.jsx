import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCheck, X, Trophy, CheckCircle, XCircle, Calendar, Info } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const TYPE_CONFIG = {
  achievement_verified: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  achievement_rejected: { icon: XCircle,     color: 'text-red-600',     bg: 'bg-red-50' },
  relaxation_approved:  { icon: CheckCircle, color: 'text-blue-600',    bg: 'bg-blue-50' },
  relaxation_rejected:  { icon: XCircle,     color: 'text-orange-600',  bg: 'bg-orange-50' },
  new_event:            { icon: Calendar,    color: 'text-purple-600',  bg: 'bg-purple-50' },
  general:              { icon: Info,        color: 'text-slate-600',   bg: 'bg-slate-50' },
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function NotificationBell() {
  const [open,          setOpen]          = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread,        setUnread]        = useState(0)
  const [loading,       setLoading]       = useState(false)
  const panelRef = useRef(null)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/notifications', { params: { limit: 20 } })
      setNotifications(data.notifications || [])
      setUnread(data.unread || 0)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 60 seconds for new notifications
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  // Close panel on outside click
  useEffect(() => {
    const handler = e => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch { /* silent */ }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnread(0)
      toast.success('All notifications marked as read')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications() }}
        className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-soft-xl border border-slate-200/60 z-50 animate-fade-in-scale overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="btn-icon p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 rounded-full border-2 border-brand-100 border-t-brand-600 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                <p className="text-sm text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const conf = TYPE_CONFIG[n.type] || TYPE_CONFIG.general
                const Icon = conf.icon
                return (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markRead(n._id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors ${n.isRead ? 'opacity-60' : 'hover:bg-slate-50'}`}
                  >
                    <div className={`w-8 h-8 rounded-xl ${conf.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${conf.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${n.isRead ? 'text-slate-500' : 'text-slate-800 font-medium'}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
