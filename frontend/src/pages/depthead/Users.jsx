import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Users, Search, ToggleLeft, ToggleRight } from 'lucide-react'

const ROLE_COLORS = {
  student: 'bg-blue-100 text-blue-800',
  faculty: 'bg-purple-100 text-purple-800',
}

export default function DeptHeadUsers() {
  const { user } = useAuth()
  const [userList, setUserList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const fetchUsers = async () => {
    try {
      const params = {}
      if (roleFilter) params.role = roleFilter
      const { data } = await api.get('/users/my-department', { params })
      setUserList(data.users || [])
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [roleFilter])

  const handleToggle = async (id, current) => {
    try {
      await api.put(`/users/${id}/toggle`)
      setUserList(prev => prev.map(u => u._id === id ? { ...u, isActive: !current } : u))
      toast.success(current ? 'User deactivated' : 'User activated')
    } catch { toast.error('Failed') }
  }

  const filtered = userList.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.rollNumber && u.rollNumber.includes(search))
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">{user.department} - Users</h1>
        <p className="text-slate-500 text-sm mt-1">{userList.length} members</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-9" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-36" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="faculty">Faculty</option>
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>{['User', 'Role', 'Score', 'Status', 'Action'].map(h => <th key={h} className="th">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => (
                  <tr key={u._id} className={`table-row-hover ${!u.isActive ? 'opacity-50' : ''}`}>
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">{u.name?.slice(0,2).toUpperCase()}</div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                          {u.rollNumber && <p className="text-xs text-slate-400">{u.rollNumber}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="td"><span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-700'}`}>{u.role}</span></td>
                    <td className="td font-extrabold text-brand-600">{u.totalScore || 0}</td>
                    <td className="td"><span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="td">
                      <button onClick={() => handleToggle(u._id, u.isActive)} className={`btn-icon ${u.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                        {u.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-12 text-slate-400"><Users className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No users found</p></div>}
          </div>
        </div>
      )}
    </div>
  )
}