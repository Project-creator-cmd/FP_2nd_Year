import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Upload, FileText, X, Loader, Calendar, ArrowRight } from 'lucide-react'

const CATEGORIES = ['academic', 'technical', 'sports', 'cultural', 'internship', 'certification', 'research', 'other']
const LEVELS = ['international', 'national', 'state', 'university', 'college', 'department']

export default function OrganizerCreateEvent() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'technical',
    level: 'college',
    eventDate: '',
    organizingBody: '',
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

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
    if (!form.title || !form.eventDate) {
      toast.error('Title and event date are required')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      // Always use the organizer's own department
      fd.append('department', user.department)
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      if (file) fd.append('participantFile', file)
      await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Event created successfully!')
      navigate('/organizer/events')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Calendar className="w-6 h-6 text-sky-500" /> Create Event
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Fill in the event details and optionally upload a participant list
        </p>
      </div>

      {/* Department badge — read-only, always the organizer's dept */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 border border-sky-100 w-fit">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wide">Department</span>
        <span className="text-sm font-bold text-slate-800">{user.department}</span>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Event Title *</label>
            <input
              className="input"
              placeholder="e.g. National Hackathon 2025"
              value={form.title}
              onChange={set('title')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Level *</label>
              <select className="input" value={form.level} onChange={set('level')}>
                {LEVELS.map(l => (
                  <option key={l} value={l} className="capitalize">{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Event Date *</label>
              <input
                className="input"
                type="date"
                value={form.eventDate}
                onChange={set('eventDate')}
                required
              />
            </div>
            <div>
              <label className="label">Organizing Body</label>
              <input
                className="input"
                placeholder="e.g. IEEE, NASSCOM"
                value={form.organizingBody}
                onChange={set('organizingBody')}
              />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Brief description of the event..."
              value={form.description}
              onChange={set('description')}
            />
          </div>

          {/* File upload */}
          <div>
            <label className="label">
              Participant List <span className="text-slate-400 font-normal">(PDF, Excel, CSV — max 20MB, optional)</span>
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-sky-500 bg-sky-50 scale-[1.01]'
                  : file
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-200 hover:border-sky-400 hover:bg-slate-50'
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
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="ml-auto p-1 hover:bg-red-100 rounded-lg text-red-500 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-slate-400">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">
                    {isDragActive
                      ? 'Drop it here!'
                      : <><span>Drop file here or </span><span className="text-sky-600 font-bold">browse</span></>
                    }
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PDF, Excel (.xlsx), or CSV up to 20MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/organizer/events')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 gap-2">
              {loading
                ? <><Loader className="w-4 h-4 animate-spin" /> Creating...</>
                : <><span>Create Event</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
