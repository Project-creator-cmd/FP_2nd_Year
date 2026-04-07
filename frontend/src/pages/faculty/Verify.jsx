import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, ExternalLink, Filter, Loader, CheckSquare } from 'lucide-react'

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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in p-6">
        <h2 className={`text-lg font-bold mb-4 ${action==='verify'?'text-green-700':'text-red-700'}`}>
          {action==='verify' ? '✓ Verify Achievement' : '✗ Reject Achievement'}
        </h2>
        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <p className="font-semibold text-slate-800">{achievement.title}</p>
          <p className="text-sm text-slate-500 mt-1 capitalize">{achievement.category} · {achievement.level} · {achievement.position}</p>
          <p className="text-sm text-slate-500">By {achievement.student?.name} ({achievement.student?.rollNumber})</p>
        </div>
        {action === 'verify' ? (
          <div className="mb-4">
            <label className="label">Remarks (optional)</label>
            <textarea className="input resize-none" rows={2} value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Add any remarks..." />
          </div>
        ) : (
          <div className="mb-4">
            <label className="label">Rejection Reason *</label>
            <textarea className="input resize-none" rows={3} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Explain why this is being rejected..." required />
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={loading || (action==='reject'&&!reason)}
            className={`flex-1 flex items-center justify-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-all ${action==='verify'?'bg-green-600 hover:bg-green-700 text-white':'bg-red-600 hover:bg-red-700 text-white'} disabled:opacity-50`}>
            {loading ? <Loader className="w-4 h-4 animate-spin"/> : action==='verify' ? 'Confirm Verify' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FacultyVerify() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [modal, setModal] = useState(null)
  const [catFilter, setCatFilter] = useState('')

  const fetch = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/achievements/department', { params: { status: filter || undefined, category: catFilter || undefined } })
      setAchievements(data.achievements)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [filter, catFilter])

  return (
    <div className="space-y-6 animate-fade-in">
      {modal && <ActionModal achievement={modal.achievement} action={modal.action} onClose={()=>setModal(null)} onDone={fetch} />}

      <div>
        <h1 className="page-title">Verify Achievements</h1>
        <p className="text-slate-500 text-sm mt-1">Review and verify student achievement submissions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {['pending','verified','rejected'].map(f => (
          <button key={f} onClick={()=>setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter===f?'bg-brand-600 text-white':'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {f}
          </button>
        ))}
        <select className="input w-44" value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {['academic','technical','sports','cultural','internship','certification','research','other'].map(c=>(
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : achievements.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No {filter} achievements found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map(a => (
            <div key={a._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="font-bold text-slate-900">{a.title}</h3>
                    <span className={a.status==='verified'?'badge-verified':a.status==='rejected'?'badge-rejected':'badge-pending'}>{a.status}</span>
                    {a.score > 0 && <span className="text-sm font-bold text-brand-600">{a.score} pts</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-slate-700">{a.student?.name} ({a.student?.rollNumber})</span>
                    <span>Year {a.student?.year} · Sec {a.student?.section}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="capitalize">{a.category} · {a.level} · {a.position}</span>
                    {a.organizingBody && <span>{a.organizingBody}</span>}
                    <span>{new Date(a.date).toLocaleDateString()}</span>
                  </div>
                  {a.description && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{a.description}</p>}
                  {a.rejectionReason && <div className="mt-2 bg-red-50 text-red-700 text-xs rounded-lg px-3 py-2">Reason: {a.rejectionReason}</div>}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {a.certificateUrl && (
                    <a href={a.certificateUrl} target="_blank" rel="noreferrer" className="btn-ghost text-xs flex items-center gap-1 py-1.5">
                      <ExternalLink className="w-3.5 h-3.5"/>View Cert
                    </a>
                  )}
                  {a.status === 'pending' && <>
                    <button onClick={()=>setModal({achievement:a,action:'verify'})}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-xs font-semibold transition-colors">
                      <CheckCircle className="w-3.5 h-3.5"/>Verify
                    </button>
                    <button onClick={()=>setModal({achievement:a,action:'reject'})}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-semibold transition-colors">
                      <XCircle className="w-3.5 h-3.5"/>Reject
                    </button>
                  </>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
