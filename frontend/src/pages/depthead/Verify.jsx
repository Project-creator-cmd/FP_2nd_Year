import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, ExternalLink, Loader, CheckSquare, X } from 'lucide-react'

function ActionModal({ achievement, action, onClose, onDone }) {
  const [remarks, setRemarks] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      await api.put(`/achievements/${achievement._id}/verify`, { action, rejectionReason: reason, remarks })
      toast.success(action === 'verify' ? 'Achievement verified!' : 'Achievement rejected')
      onDone(); onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-soft-xl w-full max-w-md animate-fade-in-scale p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-base font-bold ${action === 'verify' ? 'text-emerald-700' : 'text-red-700'}`}>
            {action === 'verify' ? 'Verify Achievement' : 'Reject Achievement'}
          </h2>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-1">
          <p className="font-bold text-slate-800 text-sm">{achievement.title}</p>
          <p className="text-xs text-slate-500 capitalize">{achievement.category} - {achievement.level} - {achievement.position}</p>
          <p className="text-xs text-slate-500">By <span className="font-semibold">{achievement.userId?.name}</span> ({achievement.userRole})</p>
        </div>
        {action === 'verify' ? (
          <div className="mb-4">
            <label className="label">Remarks (optional)</label>
            <textarea className="input resize-none" rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add any remarks..." />
          </div>
        ) : (
          <div className="mb-4">
            <label className="label">Rejection Reason *</label>
            <textarea className="input resize-none" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why this is being rejected..." />
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={loading || (action === 'reject' && !reason)}
            className={`flex-1 flex items-center justify-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 text-white ${action === 'verify' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : action === 'verify' ? 'Confirm Verify' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DeptHeadVerify() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [userRoleFilter, setUserRoleFilter] = useState('')
  const [modal, setModal] = useState(null)

  const fetchAchievements = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter) params.status = filter
      if (userRoleFilter) params.userRole = userRoleFilter
      const { data } = await api.get('/achievements/department', { params })
      setAchievements(data.achievements || [])
    } catch { toast.error('Failed to load achievements') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAchievements() }, [filter, userRoleFilter])

  return (
    <div className="space-y-6 animate-fade-in">
      {modal && <ActionModal achievement={modal.achievement} action={modal.action} onClose={() => setModal(null)} onDone={fetchAchievements} />}

      <div>
        <h1 className="page-title flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-brand-600" /> Verify Achievements
        </h1>
        <p className="text-slate-500 text-sm mt-1">Review student and faculty achievements in your department</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['pending', 'verified', 'rejected', ''].map((f, i) => (
          <button key={i} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filter === f ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {f || 'All'}
          </button>
        ))}
        <select className="input w-36 text-sm" value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="faculty">Faculty</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        </div>
      ) : achievements.length === 0 ? (
        <div className="card p-16 text-center">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-600">No achievements found</p>
        </div>
      ) : (
        <div className="space-y-3 animate-stagger">
          {achievements.map(a => (
            <div key={a._id} className="card p-5 hover-lift border-l-4"
              style={{ borderLeftColor: a.status === 'verified' ? '#10b981' : a.status === 'rejected' ? '#f43f5e' : '#f59e0b' }}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <h3 className="font-bold text-slate-900 text-sm">{a.title}</h3>
                    <span className={a.status === 'verified' ? 'badge-verified' : a.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}>
                      {a.status}
                    </span>
                    {a.score > 0 && <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">{a.score} pts</span>}
                    {a.matchStatus === 'auto-matched' && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">Auto-matched</span>
                    )}
                    {a.matchStatus === 'manual-review' && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-100">Manual Review</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    {a.userId?.name}
                    <span className="ml-2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium capitalize">{a.userRole}</span>
                    {a.userId?.rollNumber && <span className="ml-1 text-slate-400">- {a.userId.rollNumber}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="capitalize bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">{a.category}</span>
                    <span className="capitalize bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">{a.level}</span>
                    <span className="capitalize bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">{a.position}</span>
                    <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">{new Date(a.date).toLocaleDateString()}</span>
                  </div>
                  {a.rejectionReason && (
                    <div className="mt-2 text-xs bg-red-50 border border-red-100 text-red-700 rounded-xl px-3 py-2">
                      Reason: {a.rejectionReason}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {a.certificateUrl && (
                    <a href={a.certificateUrl} target="_blank" rel="noreferrer" className="btn-icon text-slate-400 hover:text-brand-600">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {a.status === 'pending' && (
                    <>
                      <button onClick={() => setModal({ achievement: a, action: 'verify' })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> Verify
                      </button>
                      <button onClick={() => setModal({ achievement: a, action: 'reject' })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}