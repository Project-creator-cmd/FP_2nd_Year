import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Settings, Plus, Trash2, Save, RefreshCw, Loader, Zap, X } from 'lucide-react'

const CATEGORIES = ['academic', 'technical', 'sports', 'cultural', 'internship', 'certification', 'research', 'other']
const LEVELS = ['international', 'national', 'state', 'university', 'college', 'department']
const POSITIONS = ['1st', '2nd', '3rd', 'participant', 'winner', 'runner-up', 'completed', 'published']

function AddRuleModal({ onClose, onSuccess, department }) {
  const [form, setForm] = useState({ category: 'technical', level: 'college', position: '1st', points: 25 })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/scoring', { ...form, department, points: Number(form.points) })
      toast.success('Rule created!')
      onSuccess(); onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-soft-xl w-full max-w-md animate-fade-in-scale p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-800">Add Scoring Rule</h2>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-slate-500 mb-4 bg-slate-50 rounded-xl px-3 py-2">
          Department: <span className="font-bold text-slate-700">{department}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select className="input" value={form.level} onChange={set('level')}>
                {LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Position</label>
              <select className="input" value={form.position} onChange={set('position')}>
                {POSITIONS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Points</label>
              <input className="input" type="number" min="0" max="200" value={form.points} onChange={set('points')} required />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 gap-2">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DeptHeadScoring() {
  const { user } = useAuth()
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const fetchRules = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/scoring', { params: { department: user.department } })
      setRules(data.rules || [])
    } catch { toast.error('Failed to load rules') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRules() }, [])

  const handleDelete = async id => {
    if (!confirm('Delete this rule?')) return
    try {
      await api.delete(`/scoring/${id}`)
      setRules(prev => prev.filter(r => r._id !== id))
      toast.success('Rule removed')
    } catch { toast.error('Failed') }
  }

  const handleRecalculate = async () => {
    setRecalculating(true)
    try {
      await api.post('/scoring/recalculate', { department: user.department })
      toast.success('Scores recalculated!')
    } catch { toast.error('Recalculation failed') }
    finally { setRecalculating(false) }
  }

  const handleSeed = async () => {
    if (!confirm(`Seed default rules for ${user.department}?`)) return
    setSeeding(true)
    try {
      await api.post('/scoring/seed', { department: user.department })
      toast.success('Default rules seeded!')
      fetchRules()
    } catch { toast.error('Seeding failed') }
    finally { setSeeding(false) }
  }

  const grouped = rules.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {})

  return (
    <div className="space-y-6 animate-fade-in">
      {showModal && <AddRuleModal onClose={() => setShowModal(false)} onSuccess={fetchRules} department={user.department} />}

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-500" /> Scoring Rules
          </h1>
          <p className="text-slate-500 text-sm mt-1">{user.department} - {rules.length} active rules</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleSeed} disabled={seeding} className="btn-secondary gap-2 text-sm">
            {seeding ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Seed Defaults
          </button>
          <button onClick={handleRecalculate} disabled={recalculating} className="btn-secondary gap-2 text-sm">
            {recalculating ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Recalculate
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Rule
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        </div>
      ) : rules.length === 0 ? (
        <div className="card p-16 text-center">
          <Settings className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-600 mb-1">No scoring rules yet</p>
          <p className="text-sm text-slate-400 mb-5">Seed defaults or add rules manually.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleSeed} className="btn-secondary gap-2 text-sm"><Zap className="w-4 h-4" /> Seed Defaults</button>
            <button onClick={() => setShowModal(true)} className="btn-primary gap-2 text-sm"><Plus className="w-4 h-4" /> Add Rule</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, catRules]) => (
            <div key={cat} className="card overflow-hidden hover-lift">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-700 capitalize text-sm">{cat}</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    {['Level', 'Position', 'Points', ''].map(h => (
                      <th key={h} className="th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {catRules.map(r => (
                    <tr key={r._id} className="table-row-hover">
                      <td className="td font-medium capitalize">{r.level}</td>
                      <td className="td capitalize text-slate-600">{r.position}</td>
                      <td className="td font-extrabold text-brand-600">{r.points} pts</td>
                      <td className="td">
                        <button onClick={() => handleDelete(r._id)} className="btn-icon text-slate-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}