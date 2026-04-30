import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Users, Search, ToggleLeft, ToggleRight, Trash2, Plus, X, Loader } from 'lucide-react'

const ROLE_COLORS = {
  student: 'bg-blue-100 text-blue-800', faculty: 'bg-purple-100 text-purple-800',
  admin: 'bg-rose-100 text-rose-800', placement: 'bg-green-100 text-green-800',
  dept_head: 'bg-amber-100 text-amber-800', event_organizer: 'bg-sky-100 text-sky-800',
}
const DEPARTMENTS = ['Computer Science','Electronics','Mechanical','Civil','Chemical','Mathematics','Physics']

// Modal to create privileged users (admin / dept_head) — only accessible by admin
function CreatePrivilegedUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'dept_head', department: '' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/auth/create-user', form)
      toast.success(`${form.role === 'dept_head' ? 'Department Head' : 'Admin'} account created!`)
      onSuccess(); onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-soft-xl w-full max-w-md animate-fade-in-scale p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-800">Create Privileged User</h2>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800 font-medium mb-4">
          Admin and Dept Head accounts can only be created here — not via public registration.
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="email@college.edu" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="label">Password (leave blank to auto-generate)</label>
            <input className="input" type="password" placeholder="Min 6 chars or leave blank" value={form.password} onChange={set('password')} minLength={form.password ? 6 : 0} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={set('role')}>
                <option value="dept_head">Dept Head</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select className="input" value={form.department} onChange={set('department')} required>
                <option value="">Select...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 gap-2">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const fetchUsers = async () => {
    try {
      const params = {}
      if (roleFilter) params.role = roleFilter
      if (deptFilter) params.department = deptFilter
      const { data } = await api.get('/users', { params })
      setUsers(data.users)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [roleFilter, deptFilter])

  const handleToggle = async (id, current) => {
    try {
      await api.put(`/users/${id}/toggle`)
      setUsers(prev => prev.map(u => u._id===id ? {...u, isActive: !current} : u))
      toast.success(current ? 'User deactivated' : 'User activated')
    } catch { toast.error('Failed') }
  }

  const handleDelete = async id => {
    if (!confirm('Permanently delete this user?')) return
    try {
      await api.delete(`/users/${id}`)
      setUsers(prev => prev.filter(u => u._id!==id))
      toast.success('User deleted')
    } catch { toast.error('Delete failed') }
  }

  const departments = [...new Set(users.map(u => u.department))]
  const filtered = users.filter(u =>
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.rollNumber?.includes(search))
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {showCreate && <CreatePrivilegedUserModal onClose={() => setShowCreate(false)} onSuccess={fetchUsers} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} total users</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary gap-2 text-sm">
          <Plus className="w-4 h-4" /> Create Privileged User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input className="input pl-9" placeholder="Search by name, email, roll..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="input w-36" value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {['student','faculty','admin','placement','dept_head','event_organizer'].map(r=><option key={r} value={r} className="capitalize">{r}</option>)}
        </select>
        <select className="input w-44" value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d=><option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <tr>
                  {['User','Role','Department','Score','Status','Actions'].map(h=>(
                    <th key={h} className="text-left px-5 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => (
                  <tr key={u._id} className={`hover:bg-slate-50 transition-colors ${!u.isActive?'opacity-50':''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
                          {u.name?.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                          {u.rollNumber && <p className="text-xs text-slate-400">{u.rollNumber}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{u.department}</td>
                    <td className="px-5 py-3 font-bold text-brand-600">{u.totalScore || 0}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${u.isActive?'bg-green-100 text-green-800':'bg-slate-100 text-slate-500'}`}>
                        {u.isActive?'Active':'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={()=>handleToggle(u._id, u.isActive)}
                          className={`p-1.5 rounded-lg transition-colors ${u.isActive?'hover:bg-amber-50 text-amber-500':'hover:bg-green-50 text-green-500'}`}
                          title={u.isActive?'Deactivate':'Activate'}>
                          {u.isActive ? <ToggleRight className="w-4 h-4"/> : <ToggleLeft className="w-4 h-4"/>}
                        </button>
                        <button onClick={()=>handleDelete(u._id)} className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length===0 && (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                <p>No users found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
