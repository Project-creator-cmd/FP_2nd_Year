import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { UserCheck, Search, Mail, Phone, Award, Trophy, X } from 'lucide-react'

const DEPARTMENTS = ['','Computer Science','Electronics','Mechanical','Civil','Chemical','Mathematics','Physics']

function StudentDetailModal({ student, achievements, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Student Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-5">
          {/* Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl flex-shrink-0">
              {student.name?.slice(0,2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
              <p className="text-sm text-slate-500">{student.rollNumber} · {student.department}</p>
              <p className="text-sm text-slate-500">Year {student.year} · Section {student.section}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-brand-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-brand-700">{student.totalScore}</p>
              <p className="text-xs text-brand-600">Achievement Score</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-slate-700">{student.cgpa || 'N/A'}</p>
              <p className="text-xs text-slate-500">CGPA</p>
            </div>
          </div>
          <div className="space-y-2">
            {student.email && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400"/>{student.email}
              </div>
            )}
            {student.phone && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400"/>{student.phone}
              </div>
            )}
          </div>
          {/* Achievements */}
          <div>
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-brand-600"/>Verified Achievements ({achievements.length})
            </h4>
            <div className="space-y-2">
              {achievements.map(a => (
                <div key={a._id} className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{a.title}</p>
                    <p className="text-xs text-slate-400 capitalize">{a.category} · {a.level} · {a.position}</p>
                  </div>
                  <span className="font-bold text-brand-600 text-sm">+{a.score}</span>
                </div>
              ))}
              {achievements.length === 0 && <p className="text-slate-400 text-sm">No verified achievements</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PlacementStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [selAchievements, setSelAchievements] = useState([])

  const fetch = async () => {
    setLoading(true)
    try {
      const params = {}
      if (deptFilter) params.department = deptFilter
      if (yearFilter) params.year = yearFilter
      const { data } = await api.get('/placement', { params })
      setStudents(data.data)
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [deptFilter, yearFilter])

  const handleViewProfile = async (student) => {
    setSelected(student)
    try {
      const { data } = await api.get(`/placement/${student._id}`)
      setSelAchievements(data.achievements)
    } catch { setSelAchievements([]) }
  }

  const filtered = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNumber?.includes(search)
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {selected && <StudentDetailModal student={selected} achievements={selAchievements} onClose={()=>{setSelected(null);setSelAchievements([])}}/>}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Placement Ready Students</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} students placement eligible</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input className="input pl-9" placeholder="Search by name or roll number..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="input w-48" value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}>
          {DEPARTMENTS.map(d=><option key={d} value={d}>{d||'All Departments'}</option>)}
        </select>
        <select className="input w-32" value={yearFilter} onChange={e=>setYearFilter(e.target.value)}>
          <option value="">All Years</option>
          {[1,2,3,4].map(y=><option key={y} value={y}>Year {y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30"/>
          <p className="font-medium">No placement-ready students found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <tr>
                  {['#','Student','Department','Year','Score','CGPA','Achievements','Contact'].map(h=>(
                    <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((s, i) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={()=>handleViewProfile(s)}>
                    <td className="px-4 py-3 text-sm font-bold text-slate-400">#{i+1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs flex-shrink-0">
                          {s.name?.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.rollNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.department}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">Year {s.year}</td>
                    <td className="px-4 py-3 font-bold text-brand-600">{s.totalScore}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 font-medium">{s.cgpa || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.achievementCount || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {s.email && <a href={`mailto:${s.email}`} onClick={e=>e.stopPropagation()} className="p-1.5 hover:bg-brand-50 text-brand-500 rounded-lg" title={s.email}><Mail className="w-4 h-4"/></a>}
                        {s.phone && <a href={`tel:${s.phone}`} onClick={e=>e.stopPropagation()} className="p-1.5 hover:bg-green-50 text-green-500 rounded-lg" title={s.phone}><Phone className="w-4 h-4"/></a>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
