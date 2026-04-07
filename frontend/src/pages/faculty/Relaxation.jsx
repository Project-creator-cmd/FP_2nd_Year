import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { ClipboardList, CheckCircle, XCircle, Loader, X } from 'lucide-react'

function ActionModal({ req, action, onClose, onDone }) {
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      await api.put(`/relaxation/${req._id}/faculty`, { action, remarks })
      toast.success(action === 'recommend' ? 'Recommended to admin!' : 'Request rejected')
      onDone(); onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${action==='recommend'?'text-green-700':'text-red-700'}`}>
            {action==='recommend' ? 'Recommend to Admin' : 'Reject Request'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4"/></button>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 mb-4 text-sm space-y-1">
          <p className="font-semibold text-slate-800">{req.student?.name} ({req.student?.rollNumber})</p>
          <p className="text-slate-500">Achievement: {req.achievement?.title}</p>
          <p className="text-slate-500">Requested: <strong>{req.requestedRelaxation}%</strong> · Current Attendance: <strong>{req.currentAttendance}%</strong></p>
          <p className="text-slate-600 mt-2">"{req.reason}"</p>
        </div>
        <div className="mb-4">
          <label className="label">Remarks</label>
          <textarea className="input resize-none" rows={3} value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Add faculty remarks..." />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-all ${action==='recommend'?'bg-green-600 hover:bg-green-700 text-white':'bg-red-600 hover:bg-red-700 text-white'} disabled:opacity-50`}>
            {loading ? <Loader className="w-4 h-4 animate-spin"/> : action==='recommend' ? 'Recommend' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FacultyRelaxation() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [filter, setFilter] = useState('pending_faculty')

  const fetch = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/relaxation/department', { params: { status: filter } })
      setRequests(data.requests)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [filter])

  const STATUS_MAP = { pending_faculty:'Awaiting Faculty', pending_admin:'With Admin', approved:'Approved', rejected:'Rejected' }

  return (
    <div className="space-y-6 animate-fade-in">
      {modal && <ActionModal req={modal.req} action={modal.action} onClose={()=>setModal(null)} onDone={fetch} />}

      <div>
        <h1 className="page-title">Relaxation Requests</h1>
        <p className="text-slate-500 text-sm mt-1">Review and recommend attendance relaxation requests</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(STATUS_MAP).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter===k?'bg-brand-600 text-white':'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {v}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : requests.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No {STATUS_MAP[filter]?.toLowerCase()} requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold text-slate-800">{r.student?.name}</p>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{r.student?.rollNumber}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Year {r.student?.year}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">Achievement: <span className="font-medium">{r.achievement?.title}</span></p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>Requested: <strong className="text-slate-700">{r.requestedRelaxation}%</strong></span>
                    <span>Current: <strong className="text-slate-700">{r.currentAttendance}%</strong></span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 italic">"{r.reason}"</p>
                </div>
                {r.status === 'pending_faculty' && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={()=>setModal({req:r,action:'recommend'})}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-xs font-semibold transition-colors">
                      <CheckCircle className="w-3.5 h-3.5"/>Recommend
                    </button>
                    <button onClick={()=>setModal({req:r,action:'reject'})}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-semibold transition-colors">
                      <XCircle className="w-3.5 h-3.5"/>Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
