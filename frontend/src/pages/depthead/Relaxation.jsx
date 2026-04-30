import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { ClipboardList, CheckCircle, Loader, X } from 'lucide-react'

function ActionModal({ req, onClose, onDone }) {
  const [action, setAction] = useState('approve')
  const [grantedRelaxation, setGrantedRelaxation] = useState(req.requestedRelaxation)
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      await api.put(`/relaxation/${req._id}/admin`, { action, grantedRelaxation: Number(grantedRelaxation), remarks })
      toast.success(action === 'approve' ? `Approved! ${grantedRelaxation}% relaxation granted.` : 'Request rejected')
      onDone(); onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-soft-xl w-full max-w-md animate-fade-in-scale p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">Review Relaxation Request</h2>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-1 text-sm">
          <p className="font-bold text-slate-800">{req.student?.name} <span className="text-slate-400 font-normal">({req.student?.rollNumber})</span></p>
          <p className="text-slate-600">Achievement: <span className="font-medium">{req.achievement?.title}</span></p>
          <p className="text-slate-500">Current Attendance: <strong>{req.currentAttendance}%</strong></p>
          <p className="text-slate-500">Requested: <strong>{req.requestedRelaxation}%</strong></p>
          {req.facultyRemarks && <p className="text-purple-600 text-xs pt-1 italic">Faculty: "{req.facultyRemarks}"</p>}
        </div>
        <div className="flex gap-3 mb-4">
          {['approve', 'reject'].map(a => (
            <button key={a} onClick={() => setAction(a)}
              className={`flex-1 py-2 rounded-xl font-bold text-sm capitalize transition-all ${action === a ? (a === 'approve' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white') : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {a}
            </button>
          ))}
        </div>
        {action === 'approve' && (
          <div className="mb-4">
            <label className="label">Grant Relaxation (%)</label>
            <input className="input" type="number" min="1" max="10" value={grantedRelaxation} onChange={e => setGrantedRelaxation(e.target.value)} />
          </div>
        )}
        <div className="mb-4">
          <label className="label">Remarks</label>
          <textarea className="input resize-none" rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional remarks..." />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 text-white ${action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : `Confirm ${action}`}
          </button>
        </div>
      </div>
    </div>
  )
}

const STATUS_MAP = {
  pending_admin: 'Awaiting Approval',
  pending_faculty: 'Pending Faculty',
  approved: 'Approved',
  rejected: 'Rejected'
}

export default function DeptHeadRelaxation() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [filter, setFilter] = useState('pending_admin')

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/relaxation/department', { params: { status: filter } })
      setRequests(data.requests || [])
    } catch { toast.error('Failed to load requests') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRequests() }, [filter])

  return (
    <div className="space-y-6 animate-fade-in">
      {modal && <ActionModal req={modal} onClose={() => setModal(null)} onDone={fetchRequests} />}

      <div>
        <h1 className="page-title flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-amber-500" /> Relaxation Approvals
        </h1>
        <p className="text-slate-500 text-sm mt-1">Final approval for attendance relaxation requests in your department</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(STATUS_MAP).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === k ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {v}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="card p-16 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-600">No {STATUS_MAP[filter]?.toLowerCase()} requests</p>
        </div>
      ) : (
        <div className="space-y-4 animate-stagger">
          {requests.map(r => (
            <div key={r._id} className="card p-5 hover-lift">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-slate-800">{r.student?.name}</p>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{r.student?.rollNumber}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Achievement: <span className="font-semibold">{r.achievement?.title}</span></p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>Current: <strong>{r.currentAttendance}%</strong></span>
                    <span>Requested: <strong>{r.requestedRelaxation}%</strong></span>
                    {r.status === 'approved' && <span className="text-emerald-700">Granted: <strong>{r.grantedRelaxation}%</strong></span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-2 italic">"{r.reason}"</p>
                  {r.facultyRemarks && <div className="mt-2 bg-purple-50 border border-purple-100 text-purple-800 text-xs rounded-xl px-3 py-2">Faculty: {r.facultyRemarks}</div>}
                  {r.adminRemarks && <div className="mt-1 bg-blue-50 border border-blue-100 text-blue-800 text-xs rounded-xl px-3 py-2">Decision: {r.adminRemarks}</div>}
                </div>
                {r.status === 'pending_admin' && (
                  <button onClick={() => setModal(r)} className="btn-primary text-sm flex-shrink-0 gap-2">
                    <CheckCircle className="w-4 h-4" /> Review
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