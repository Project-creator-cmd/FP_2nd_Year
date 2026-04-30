import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import {
  Trophy, Upload, Trash2, ExternalLink, Plus, X, Loader,
  FileText, Image, CheckCircle, Clock, XCircle, Sparkles, Award
} from 'lucide-react'

const CATEGORIES = ['academic', 'technical', 'sports', 'cultural', 'internship', 'certification', 'research', 'other']
const LEVELS = ['international', 'national', 'state', 'university', 'college', 'department']
const POSITIONS = ['1st', '2nd', '3rd', 'participant', 'winner', 'runner-up', 'completed', 'published']

const CATEGORY_COLORS = {
  academic: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  technical: { bg: 'bg-brand-50', text: 'text-brand-700', border: 'border-brand-100' },
  sports: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  cultural: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100' },
  internship: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  certification: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  research: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100' },
  other: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100' },
}

function UploadModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'technical',
    level: 'college', position: 'participant', date: '', organizingBody: ''
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const onDrop = useCallback(files => { if (files[0]) setFile(files[0]) }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v))
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-soft-xl w-full max-w-xl max-h-[92vh] overflow-y-auto animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Upload className="w-4.5 h-4.5 text-brand-600" style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Upload Achievement</h2>
              <p className="text-xs text-slate-500">Submit for faculty verification</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="e.g. Won National Hackathon 2024"
              value={form.title} onChange={set('title')} required />
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
              <label className="label">Position / Result *</label>
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
            <input className="input" placeholder="e.g. IEEE, NASSCOM, College Name"
              value={form.organizingBody} onChange={set('organizingBody')} />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3}
              placeholder="Brief description of the achievement..."
              value={form.description} onChange={set('description')} />
          </div>

          {/* Dropzone */}
          <div>
            <label className="label">Certificate (JPG, PNG, PDF — max 10MB)</label>
            <div {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-brand-500 bg-brand-50 scale-[1.01]'
                  : file
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50'
              }`}>
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-center gap-3 text-emerald-700">
                  {file.type.includes('pdf')
                    ? <FileText className="w-6 h-6 text-emerald-600" />
                    : <Image className="w-6 h-6 text-emerald-600" />
                  }
                  <div className="text-left">
                    <p className="text-sm font-semibold">{file.name}</p>
                    <p className="text-xs text-emerald-600">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button type="button"
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="ml-auto p-1 hover:bg-red-100 rounded-lg text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-slate-400">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">
                    {isDragActive ? 'Drop it here!' : 'Drop file here or '}
                    {!isDragActive && <span className="text-brand-600 font-bold">browse</span>}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, PDF up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 gap-2">
              {loading
                ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
                : <><Upload className="w-4 h-4" /> Submit Achievement</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const STATUS_CONFIG = {
  verified: { icon: CheckCircle, label: 'Verified', class: 'badge-verified' },
  pending: { icon: Clock, label: 'Pending', class: 'badge-pending' },
  rejected: { icon: XCircle, label: 'Rejected', class: 'badge-rejected' },
}

export default function StudentAchievements() {
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

  const counts = {
    all: achievements.length,
    pending: achievements.filter(a => a.status === 'pending').length,
    verified: achievements.filter(a => a.status === 'verified').length,
    rejected: achievements.filter(a => a.status === 'rejected').length,
  }

  const totalScore = achievements.filter(a => a.status === 'verified').reduce((s, a) => s + (a.score || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {showModal && <UploadModal onClose={() => setShowModal(false)} onSuccess={fetchAchievements} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Trophy className="w-6 h-6 text-purple-500" />
            My Achievements
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {achievements.length} total · {counts.verified} verified · {totalScore} pts earned
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Upload Achievement
        </button>
      </div>

      {/* Score summary */}
      {achievements.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Score', value: `${totalScore} pts`, icon: Award, color: 'text-brand-600', bg: 'bg-brand-50' },
            { label: 'Verified', value: counts.verified, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending', value: counts.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Rejected', value: counts.rejected, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900 leading-tight">{value}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'verified', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-200 ${
              filter === f
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}>
            {f} <span className={`ml-1 text-xs ${filter === f ? 'text-brand-200' : 'text-slate-400'}`}>({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-bold text-slate-700 mb-1">No achievements found</p>
          <p className="text-sm text-slate-400 mb-6">
            {filter === 'all' ? 'Upload your first achievement to get started.' : `No ${filter} achievements yet.`}
          </p>
          {filter === 'all' && (
            <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
              <Plus className="w-4 h-4" /> Upload Achievement
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 animate-stagger">
          {filtered.map(a => {
            const catStyle = CATEGORY_COLORS[a.category] || CATEGORY_COLORS.other
            const statusConf = STATUS_CONFIG[a.status]
            const StatusIcon = statusConf.icon

            return (
              <div key={a._id}
                className="card p-5 hover-lift group border-l-4 transition-all duration-200"
                style={{
                  borderLeftColor: a.status === 'verified' ? '#10b981' : a.status === 'rejected' ? '#f43f5e' : '#f59e0b'
                }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-center gap-2.5 flex-wrap mb-2">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-700 transition-colors">
                        {a.title}
                      </h3>
                      <span className={statusConf.class}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConf.label}
                      </span>
                      {a.status === 'verified' && (
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> +{a.score} pts
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}>
                        {a.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg capitalize">
                        {a.level}
                      </span>
                      <span className="text-xs text-slate-500 font-medium px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg capitalize">
                        {a.position}
                      </span>
                      {a.organizingBody && (
                        <span className="text-xs text-slate-500 font-medium px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                          {a.organizingBody}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-medium px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                        {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {a.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{a.description}</p>
                    )}

                    {a.status === 'rejected' && a.rejectionReason && (
                      <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl px-3 py-2.5">
                        <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span><span className="font-bold">Reason:</span> {a.rejectionReason}</span>
                      </div>
                    )}
                    {a.status === 'verified' && a.verifiedBy && (
                      <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified by {a.verifiedBy.name}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {a.certificateUrl && (
                      <a href={a.certificateUrl} target="_blank" rel="noreferrer"
                        className="btn-icon text-slate-400 hover:text-brand-600 hover:bg-brand-50">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {a.status === 'pending' && (
                      <button onClick={() => handleDelete(a._id)}
                        className="btn-icon text-slate-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
