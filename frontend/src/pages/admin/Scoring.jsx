import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Settings, Plus, Trash2, Save, RefreshCw, Loader, Zap, X } from 'lucide-react'

const CATEGORIES = ['academic','technical','sports','cultural','internship','certification','research','other']
const LEVELS = ['international','national','state','university','college','department']
const POSITIONS = ['1st','2nd','3rd','participant','winner','runner-up','completed','published']
const DEPARTMENTS = ['Computer Science','Electronics','Mechanical','Civil','Chemical','Mathematics','Physics']

function AddRuleModal({ onClose, onSuccess, department }) {
  const [form, setForm] = useState({ department: department||'', category:'technical', level:'college', position:'1st', points:25 })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p => ({...p, [k]: e.target.value}))

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/scoring', {...form, points: Number(form.points)})
      toast.success('Rule created!')
      onSuccess(); onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">Add Scoring Rule</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={set('department')} required>
              <option value="">Select...</option>
              {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c=><option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select className="input" value={form.level} onChange={set('level')}>
                {LEVELS.map(l=><option key={l} value={l} className="capitalize">{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Position</label>
              <select className="input" value={form.position} onChange={set('position')}>
                {POSITIONS.map(p=><option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Points</label>
              <input className="input" type="number" min="0" max="200" value={form.points} onChange={set('points')} required />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <Loader className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
              Save Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminScoring() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deptFilter, setDeptFilter] = useState('Computer Science')
  const [recalculating, setRecalculating] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/scoring', { params: { department: deptFilter } })
      setRules(data.rules)
    } catch { toast.error('Failed to load rules') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [deptFilter])

  const handleDelete = async id => {
    if (!confirm('Delete this rule?')) return
    try {
      await api.delete(`/scoring/${id}`)
      setRules(prev => prev.filter(r => r._id!==id))
      toast.success('Rule removed')
    } catch { toast.error('Failed') }
  }

  const handleRecalculate = async () => {
    setRecalculating(true)
    try {
      await api.post('/scoring/recalculate', { department: deptFilter })
      toast.success('Scores recalculated for all students!')
    } catch { toast.error('Recalculation failed') }
    finally { setRecalculating(false) }
  }

  const handleSeed = async () => {
    if (!confirm(`Seed default rules for ${deptFilter}?`)) return
    setSeeding(true)
    try {
      await api.post('/scoring/seed', { department: deptFilter })
      toast.success('Default rules seeded!')
      fetch()
    } catch { toast.error('Seeding failed') }
    finally { setSeeding(false) }
  }

  const groupedRules = rules.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {})

  return (
    <div className="space-y-6 animate-fade-in">
      {showModal && <AddRuleModal onClose={()=>setShowModal(false)} onSuccess={fetch} department={deptFilter}/>}

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Scoring Rules</h1>
          <p className="text-slate-500 text-sm mt-1">Configure achievement scoring for each department</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleSeed} disabled={seeding} className="btn-ghost flex items-center gap-2 border border-slate-200 text-sm">
            {seeding ? <Loader className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4"/>} Seed Defaults
          </button>
          <button onClick={handleRecalculate} disabled={recalculating} className="btn-secondary flex items-center gap-2 text-sm">
            {recalculating ? <Loader className="w-4 h-4 animate-spin"/> : <RefreshCw className="w-4 h-4"/>} Recalculate
          </button>
          <button onClick={()=>setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4"/> Add Rule
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {DEPARTMENTS.map(d => (
          <button key={d} onClick={()=>setDeptFilter(d)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${deptFilter===d?'bg-brand-600 text-white':'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {d}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : rules.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <Settings className="w-12 h-12 mx-auto mb-3 opacity-30"/>
          <p className="font-medium">No scoring rules for {deptFilter}</p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={handleSeed} className="btn-secondary text-sm flex items-center gap-2"><Zap className="w-4 h-4"/>Seed Defaults</button>
            <button onClick={()=>setShowModal(true)} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4"/>Add Rule</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedRules).map(([cat, catRules]) => (
            <div key={cat} className="card overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-700 capitalize">{cat}</h3>
              </div>
              <table className="w-full">
                <thead className="text-xs text-slate-400 uppercase tracking-wide">
                  <tr>
                    {['Level','Position','Points',''].map(h=>(
                      <th key={h} className="text-left px-5 py-2.5 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {catRules.map(r => (
                    <tr key={r._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 text-sm font-medium text-slate-700 capitalize">{r.level}</td>
                      <td className="px-5 py-3 text-sm text-slate-600 capitalize">{r.position}</td>
                      <td className="px-5 py-3 font-bold text-brand-600">{r.points} pts</td>
                      <td className="px-5 py-3">
                        <button onClick={()=>handleDelete(r._id)} className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4"/>
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
