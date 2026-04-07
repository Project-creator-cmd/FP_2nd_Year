import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Mathematics', 'Physics']

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '', rollNumber: '', year: '', section: '', cgpa: '' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form }
      if (form.role !== 'student') { delete payload.rollNumber; delete payload.year; delete payload.section; delete payload.cgpa }
      const user = await register(payload)
      toast.success('Account created successfully!')
      const map = { student: '/student', faculty: '/faculty', admin: '/admin', placement: '/placement' }
      navigate(map[user.role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-600 rounded-2xl shadow-lg mb-3">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Join Acadex — Academic Achievement Portal</p>
        </div>

        <div className="card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name</label>
                <input className="input" placeholder="Your full name" value={form.name} onChange={set('name')} required />
              </div>
              <div className="col-span-2">
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="email@college.edu" value={form.email} onChange={set('email')} required />
              </div>
              <div className="col-span-2">
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={set('role')} required>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                  <option value="placement">Placement Officer</option>
                </select>
              </div>
              <div>
                <label className="label">Department</label>
                <select className="input" value={form.department} onChange={set('department')} required>
                  <option value="">Select...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {form.role === 'student' && <>
                <div>
                  <label className="label">Roll Number</label>
                  <input className="input" placeholder="e.g. 21CS001" value={form.rollNumber} onChange={set('rollNumber')} />
                </div>
                <div>
                  <label className="label">Year</label>
                  <select className="input" value={form.year} onChange={set('year')}>
                    <option value="">Select...</option>
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Section</label>
                  <input className="input" placeholder="e.g. A" value={form.section} onChange={set('section')} />
                </div>
                <div>
                  <label className="label">CGPA</label>
                  <input className="input" type="number" step="0.01" min="0" max="10" placeholder="e.g. 8.5" value={form.cgpa} onChange={set('cgpa')} />
                </div>
              </>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader className="w-4 h-4 animate-spin" /> Creating Account...</> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
