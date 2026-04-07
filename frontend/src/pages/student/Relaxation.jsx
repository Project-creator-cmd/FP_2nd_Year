import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { ClipboardList, Plus, X, Loader, CheckCircle, Clock, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
  pending_faculty: { label: 'Awaiting Faculty', cls: 'badge-pending', icon: Clock },
  pending_admin:   { label: 'Awaiting Admin',   cls: 'badge-pending', icon: Clock },
  approved:        { label: 'Approved',          cls: 'badge-verified', icon: CheckCircle },
  rejected:        { label: 'Rejected',          cls: 'badge-rejected', icon: XCircle },
}

function RequestModal({ achievements, onClose, onSuccess }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ achievement: '', requestedRelaxation: 2, reason: '' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/relaxation', form)
      toast.success('Relaxation request submitted!')
      onSuccess(); onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Request failed') }
    finally { setLoading(false) }
  }

  const verified = achievements.filter(a => a.status === 'verified')

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Request Attendance Relaxation</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-3 text-sm">
            <span className="text-slate-500">Current Attendance: </span>
            <span className="font-bold text-slate-800">{user?.attendance || 75}%</span>
          </div>
          <div>
            <label className="label">Achievement *</label>
            <select className="input" value={form.achievement} onChange={set('achievement')} required>
              <option value="">Select verified achievement...</option>
              {verified.map(a => <option key={a._id} value={a._id}>{a.title} (+{a.score}pts)</option>)}
            </select>
            {verified.length === 0 && <p className="text-xs text-amber-600 mt-1">No verified achievements found</p>}
          </div>
          <div>
            <label className="label">Relaxation Requested (%)</label>
            <input className="input" type="number" min="1" max="10" value={form.requestedRelaxation} onChange={set('requestedRelaxation')} required />
            <p className="text-xs text-slate-400 mt-1">Max 10% relaxation allowed</p>
          </div>
          <div>
            <label className="label">Reason *</label>
            <textarea className="input resize-none" rows={3} placeholder="Explain why you need attendance relaxation..." value={form.reason} onChange={set('reason')} required />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading || verified.length===0} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <><Loader className="w-4 h-4 animate-spin" />Submitting...</> : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function StudentRelaxation() {
  const [requests, setRequests] = useState([])
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetch = async () => {
    try {
      const [r, a] = await Promise.all([api.get('/relaxation/my'), api.get('/achievements/my')])
      setRequests(r.data.requests)
      setAchievements(a.data.achievements)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      {showModal && <RequestModal achievements={achievements} onClose={() => setShowModal(false)} onSuccess={fetch} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Attendance Relaxation</h1>
          <p className="text-slate-500 text-sm mt-1">Request attendance relaxation based on achievements</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : requests.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No relaxation requests yet</p>
          <button onClick={() => setShowModal(true)} className="mt-4 btn-primary text-sm">Create Request</button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(r => {
            const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending_faculty
            const Icon = cfg.icon
            return (
              <div key={r._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-800">{r.achievement?.title || 'Achievement'}</h3>
                      <span className={cfg.cls}><Icon className="w-3 h-3" />{cfg.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
                      <span>Requested: <strong className="text-slate-700">{r.requestedRelaxation}%</strong></span>
                      <span>Current: <strong className="text-slate-700">{r.currentAttendance}%</strong></span>
                      {r.status === 'approved' && <span>Granted: <strong className="text-green-700">{r.grantedRelaxation}%</strong></span>}
                    </div>
                    <p className="text-sm text-slate-500 mt-2">{r.reason}</p>
                    {r.facultyRemarks && (
                      <div className="mt-2 bg-purple-50 text-purple-800 text-xs rounded-lg px-3 py-2">
                        Faculty: {r.facultyRemarks}
                      </div>
                    )}
                    {r.adminRemarks && (
                      <div className="mt-1 bg-blue-50 text-blue-800 text-xs rounded-lg px-3 py-2">
                        Admin: {r.adminRemarks}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
