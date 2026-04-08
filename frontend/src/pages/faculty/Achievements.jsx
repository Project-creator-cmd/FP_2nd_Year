import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Trophy, Upload, Trash2, ExternalLink, Plus, X, Loader, FileText, Image } from 'lucide-react'

const CATEGORIES = ['academic','technical','sports','cultural','internship','certification','research','other']
const LEVELS = ['international','national','state','university','college','department']
const POSITIONS = ['1st','2nd','3rd','participant','winner','runner-up','completed','published']

const STATUS_LABELS = { pending: 'Pending', verified: 'Verified', rejected: 'Rejected' }

function UploadModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title:'', description:'', category:'technical', level:'college', position:'participant', date:'', organizingBody:'' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const onDrop = useCallback(files => { if (files[0]) setFile(files[0]) }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [], 'application/pdf': [] }, maxFiles: 1, maxSize: 10*1024*1024 })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => v && fd.append(k, v))
      if (file) fd.append('certificate', file)
      await api.post('/achievements', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Achievement submitted for verification!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Upload Achievement</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="e.g. Won National Hackathon 2024" value={form.title} onChange={set('title')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Level *</label>
              <select className="input" value={form.level} onChange={set('level')}>
                {LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Position/Result *</label>
              <select className="input" value={form.position} onChange={set('position')}>
                {POSITIONS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date *</label>
              <input className="input" type="date" value={form.date} onChange={set('date')} required />
            </div>
          </div>
          <div>
            <label className="label">Organizing Body</label>
            <input className="input" placeholder="e.g. IEEE, NASSCOM, College Name" value={form.organizingBody} onChange={set('organizingBody')} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Brief description of the achievement..." value={form.description} onChange={set('description')} />
          </div>
          <div>
            <label className="label">Certificate (JPG, PNG, PDF — max 10MB)</label>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-400'}`}>
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-brand-700">
                  {file.type.includes('pdf') ? <FileText className="w-5 h-5" /> : <Image className="w-5 h-5" />}
                  <span className="text-sm font-medium">{file.name}</span>
                  <button type="button" onClick={e => { e.stopPropagation(); setFile(null) }} className="ml-1 text-red-500"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="text-slate-400">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Drop file here or <span className="text-brand-600 font-medium">browse</span></p>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <><Loader className="w-4 h-4 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4" />Submit</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function FacultyAchievements() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')

  const fetchAchievements = async () => {
    try {
      const { data } = await api.get('/achievements/my')
      setAchievements(data.achievements)
    } catch { toast.error('Failed to load achievements') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAchievements() }, [])

  const handleDelete = async id => {
    if (!confirm('Delete this achievement?')) return
    try {
      await api.delete(`/achievements/${id}`)
      toast.success('Deleted')
      setAchievements(prev => prev.filter(a => a._id !== id))
    } catch { toast.error('Delete failed') }
  }

  const filtered = filter === 'all' ? achievements : achievements.filter(a => a.status === filter)

  return (
    <div className="space-y-6 animate-fade-in">
      {showModal && <UploadModal onClose={() => setShowModal(false)} onSuccess={fetchAchievements} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Achievements</h1>
          <p className="text-slate-500 text-sm mt-1">{achievements.length} total · {achievements.filter(a=>a.status==='verified').length} verified</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Upload Achievement
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all','pending','verified','rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter===f ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {f} {f==='all' ? `(${achievements.length})` : `(${achievements.filter(a=>a.status===f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No achievements found</p>
          <button onClick={() => setShowModal(true)} className="mt-4 btn-primary text-sm">Upload Your First Achievement</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(a => (
            <div key={a._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="font-bold text-slate-900">{a.title}</h3>
                    <span className={a.status==='verified'?'badge-verified':a.status==='rejected'?'badge-rejected':'badge-pending'}>
                      {STATUS_LABELS[a.status]}
                    </span>
                    {a.status==='verified' && <span className="text-sm font-bold text-brand-600">+{a.score} pts</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                    <span className="capitalize font-medium">{a.category}</span>
                    <span className="capitalize">{a.level}</span>
                    <span className="capitalize">{a.position}</span>
                    {a.organizingBody && <span>{a.organizingBody}</span>}
                    <span>{new Date(a.date).toLocaleDateString()}</span>
                  </div>
                  {a.description && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{a.description}</p>}
                  {a.status==='rejected' && a.rejectionReason && (
                    <div className="mt-2 bg-red-50 text-red-700 text-xs rounded-lg px-3 py-2 font-medium">
                      Rejection reason: {a.rejectionReason}
                    </div>
                  )}
                  {a.status==='verified' && a.verifiedBy && (
                    <p className="text-xs text-green-600 mt-1">Verified by {a.verifiedBy.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {a.certificateUrl && (
                    <a href={a.certificateUrl} target="_blank" rel="noreferrer"
                      className="p-2 hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-colors text-slate-400">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {a.status === 'pending' && (
                    <button onClick={() => handleDelete(a._id)}
                      className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-slate-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
