import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { ClipboardList, CheckCircle, XCircle, Loader, X } from 'lucide-react'

function AdminActionModal({ req, onClose, onDone }) {
  const [action, setAction] = useState('approve')
  const [grantedRelaxation, setGrantedRelaxation] = useState(req.requestedRelaxation)
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      await api.put(`/relaxation/${req._id}/admin`, { action, grantedRelaxation: Number(grantedRelaxation), remarks })
      toast.success(action==='approve' ? `Approved! ${grantedRelaxation}% relaxation granted.` : 'Request rejected')
      onDone(); onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">Admin Decision</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4"/></button>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-1 text-sm">
          <p className="font-bold text-slate-800">{req.student?.name} ({req.student?.rollNumber})</p>
          <p className="text-slate-600">Achievement: <span className="font-medium">{req.achievement?.title}</span></p>
          <p className="text-slate-500">Current Attendance: <strong>{req.currentAttendance}%</strong></p>
          <p className="text-slate-500">Requested: <strong>{req.requestedRelaxation}%</strong></p>
          {req.facultyRemarks && <p className="text-purple-600 text-xs pt-1">Faculty: "{req.facultyRemarks}"</p>}
        </div>
        <div className="flex gap-3 mb-4">
          <button onClick={()=>setAction('approve')} className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all ${action==='approve'?'bg-green-600 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            Approve
          </button>
          <button onClick={()=>setAction('reject')} className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all ${action==='reject'?'bg-red-600 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            Reject
          </button>
        </div>
        {action === 'approve' && (
          <div className="mb-4">
            <label className="label">Grant Relaxation (%)</label>
            <input className="input" type="number" min="1" max="10" value={grantedRelaxation}
              onChange={e=>setGrantedRelaxation(e.target.value)} />
            <p className="text-xs text-slate-400 mt-1">Can adjust the relaxation amount</p>
          </div>
        )}
        <div className="mb-4">
          <label className="label">Admin Remarks</label>
          <textarea className="input resize-none" rows={2} value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Optional remarks..."/>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-all ${action==='approve'?'bg-green-600 hover:bg-green-700':'bg-red-600 hover:bg-red-700'} text-white disabled:opacity-50`}>
            {loading ? <Loader className="w-4 h-4 animate-spin"/> : action==='approve' ? 'Confirm Approve' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminRelaxation() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [filter, setFilter] = useState('pending_admin')

  const fetch = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/relaxation/department', { params: { status: filter } })
      setRequests(data.requests)
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [filter])

  const STATUS_MAP = { pending_admin:'Awaiting Admin', pending_faculty:'Pending Faculty', approved:'Approved', rejected:'Rejected' }

  return (
    <div className="space-y-6 animate-fade-in">
      {modal && <AdminActionModal req={modal} onClose={()=>setModal(null)} onDone={fetch}/>}

      <div>
        <h1 className="page-title">Relaxation Approvals</h1>
        <p className="text-slate-500 text-sm mt-1">Final approval for attendance relaxation requests</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(STATUS_MAP).map(([k, v]) => (
          <button key={k} onClick={()=>setFilter(k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter===k?'bg-brand-600 text-white':'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {v}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : requests.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30"/>
          <p className="font-medium">No {STATUS_MAP[filter]?.toLowerCase()} requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <p className="font-bold text-slate-800">{r.student?.name}</p>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{r.student?.rollNumber}</span>
                    <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">{r.department}</span>
                  </div>
                  <p className="text-sm text-slate-600">Achievement: <span className="font-medium">{r.achievement?.title}</span></p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
                    <span>Current: <strong>{r.currentAttendance}%</strong></span>
                    <span>Requested: <strong>{r.requestedRelaxation}%</strong></span>
                    {r.status==='approved' && <span className="text-green-700">Granted: <strong>{r.grantedRelaxation}%</strong></span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-2 italic">"{r.reason}"</p>
                  {r.facultyRemarks && <div className="mt-2 bg-purple-50 text-purple-800 text-xs rounded-lg px-3 py-2">Faculty: {r.facultyRemarks}</div>}
                  {r.adminRemarks && <div className="mt-1 bg-blue-50 text-blue-800 text-xs rounded-lg px-3 py-2">Admin: {r.adminRemarks}</div>}
                </div>
                {r.status === 'pending_admin' && (
                  <button onClick={()=>setModal(r)} className="btn-primary text-sm flex-shrink-0 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4"/> Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
