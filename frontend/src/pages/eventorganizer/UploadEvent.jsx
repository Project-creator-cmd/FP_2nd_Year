import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Upload, FileText, X, Loader, Calendar, ArrowRight, AlertCircle } from 'lucide-react'

const CATEGORIES = ['academic', 'technical', 'sports', 'cultural', 'internship', 'certification', 'research', 'other']
const LEVELS     = ['international', 'national', 'state', 'university', 'college', 'department']

export default function OrganizerUploadEvent() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [form, setForm] = useState({
    title: '', description: '', category: 'technical',
    level: 'college', startDate: '', endDate: '', organizingBody: '',
  })
  const [file,        setFile]        = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [uploadPct,   setUploadPct]   = useState(0)
  const [dateError,   setDateError]   = useState('')

  const set = k => e => {
    const val = e.target.value
    setForm(p => ({ ...p, [k]: val }))
    // Live end-date validation
    if (k === 'endDate' || k === 'startDate') {
      const start = k === 'startDate' ? val : form.startDate
      const end   = k === 'endDate'   ? val : form.endDate
      if (start && end && new Date(end) < new Date(start)) {
        setDateError('End Date cannot be earlier than Start Date')
      } else {
        setDateError('')
      }
    }
  }

  const onDrop = useCallback(files => { if (files[0]) setFile(files[0]) }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
      'application/vnd.ms-excel': [],
      'text/csv': [],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
  })

  const handleSubmit = async e => {
    e.preventDefault()
    if (dateError) { toast.error(dateError); return }
    if (!form.startDate || !form.endDate) { toast.error('Both Start Date and End Date are required'); return }

    setLoading(true)
    setUploadPct(0)
    try {
      const fd = new FormData()
      fd.append('department', user.department)
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      if (file) fd.append('participantList', file)

      await api.post('/events', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          if (e.total) setUploadPct(Math.round((e.loaded / e.total) * 100))
        },
      })

      toast.success('Event uploaded successfully!')
      navigate('/organizer/events')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload event')
    } finally {
      setLoading(false)
      setUploadPct(0)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Upload className="w-6 h-6 text-sky-500" /> Upload Event
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Fill in the event details and optionally upload a participant list
        </p>
      </div>

      {/* Department badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 border border-sky-100 w-fit">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wide">Department</span>
        <span className="text-sm font-bold text-slate-800">{user.department}</span>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="label">Event Title *</label>
            <input className="input" placeholder="e.g. National Hackathon 2025"
              value={form.title} onChange={set('title')} required />
          </div>

          {/* Category + Level */}
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
          </div>

          {/* Start Date + End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date *</label>
              <input className="input" type="date" value={form.startDate} onChange={set('startDate')} required />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input
                className={`input ${dateError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                type="date"
                value={form.endDate}
                onChange={set('endDate')}
                min={form.startDate || undefined}
                required
              />
            </div>
          </div>
          {dateError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 -mt-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {dateError}
            </div>
          )}

          {/* Organizing Body */}
          <div>
            <label className="label">Organizing Body</label>
            <input className="input" placeholder="e.g. IEEE, NASSCOM"
              value={form.organizingBody} onChange={set('organizingBody')} />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3}
              placeholder="Brief description of the event..."
              value={form.description} onChange={set('description')} />
          </div>

          {/* Participant list file upload */}
          <div>
            <label className="label">
              Participant List{' '}
              <span className="text-slate-400 font-normal">(PDF, Excel, CSV — max 20MB, optional)</span>
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragActive ? 'border-sky-500 bg-sky-50 scale-[1.01]'
                : file        ? 'border-emerald-400 bg-emerald-50'
                :               'border-slate-200 hover:border-sky-400 hover:bg-slate-50'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-center gap-3 text-emerald-700">
                  <FileText className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold truncate">{file.name}</p>
                    <p className="text-xs text-emerald-600">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button type="button"
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="ml-auto p-1 hover:bg-red-100 rounded-lg text-red-500 transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-slate-400">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">
                    {isDragActive ? 'Drop it here!' : <><span>Drop file here or </span><span className="text-sky-600 font-bold">browse</span></>}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PDF, Excel (.xlsx), or CSV up to 20MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload progress bar */}
          {loading && uploadPct > 0 && uploadPct < 100 && (
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Uploading...</span>
                <span>{uploadPct}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-brand-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/organizer/events')} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading || !!dateError} className="btn-primary flex-1 gap-2">
              {loading
                ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
                : <><span>Upload Event</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
