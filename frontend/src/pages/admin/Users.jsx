import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Users, Search, ToggleLeft, ToggleRight, Trash2, Filter } from 'lucide-react'

const ROLE_COLORS = { student:'bg-blue-100 text-blue-800', faculty:'bg-purple-100 text-purple-800', admin:'bg-rose-100 text-rose-800', placement:'bg-green-100 text-green-800' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')

  const fetch = async () => {
    try {
      const params = {}
      if (roleFilter) params.role = roleFilter
      if (deptFilter) params.department = deptFilter
      const { data } = await api.get('/users', { params })
      setUsers(data.users)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [roleFilter, deptFilter])

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input className="input pl-9" placeholder="Search by name, email, roll..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="input w-36" value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {['student','faculty','admin','placement'].map(r=><option key={r} value={r} className="capitalize">{r}</option>)}
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
