import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Loader, ArrowRight, User, Mail, Lock, BookOpen, Hash, Calendar, Layers } from 'lucide-react'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Mathematics', 'Physics']

const ROLE_CONFIG = {
  student:         { label: 'Student',         icon: '🎓', desc: 'Track achievements & placement' },
  faculty:         { label: 'Faculty',         icon: '👨‍🏫', desc: 'Verify & mentor students' },
  placement:       { label: 'Placement Officer', icon: '💼', desc: 'Manage placement drives' },
  event_organizer: { label: 'Event Organizer', icon: '🎪', desc: 'Create & manage events' },
  // admin and dept_head are excluded — must be created by admin via API
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    department: '', rollNumber: '', year: '', section: '', cgpa: ''
  })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form }
      if (form.role !== 'student') {
        delete payload.rollNumber; delete payload.year
        delete payload.section; delete payload.cgpa
      }
      const user = await register(payload)
      toast.success('Account created successfully!')
      const map = { student: '/student', faculty: '/faculty', admin: '/admin', placement: '/placement', dept_head: '/depthead', event_organizer: '/organizer' }
      navigate(map[user.role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed')
    } finally { setLoading(false) }
  }

  const selectedRole = ROLE_CONFIG[form.role]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-mesh relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent)' }} />
      <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.07), transparent)' }} />

      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg mb-3"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">Join Acadex — Academic Achievement Portal</p>
        </div>

        <div className="card p-7">
          {/* Role selector */}
          <div className="mb-5">
            <label className="label">I am a...</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ROLE_CONFIG).map(([role, conf]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, role }))}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                    form.role === role
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-xl">{conf.icon}</span>
                  <div>
                    <p className={`text-xs font-bold ${form.role === role ? 'text-brand-700' : 'text-slate-700'}`}>{conf.label}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">{conf.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input className="input pl-10" placeholder="Your full name"
                    value={form.name} onChange={set('name')} required />
                </div>
              </div>

              <div className="col-span-2">
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input className="input pl-10" type="email" placeholder="email@college.edu"
                    value={form.email} onChange={set('email')} required />
                </div>
              </div>

              <div className="col-span-2">
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input className="input pl-10" type="password" placeholder="Min 6 characters"
                    value={form.password} onChange={set('password')} required minLength={6} />
                </div>
              </div>

              <div className="col-span-2">
                <label className="label">Department</label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select className="input pl-10" value={form.department} onChange={set('department')} required>
                    <option value="">Select department...</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {form.role === 'student' && (
                <>
                  <div>
                    <label className="label">Roll Number</label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input className="input pl-10" placeholder="e.g. 21CS001"
                        value={form.rollNumber} onChange={set('rollNumber')} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Year</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select className="input pl-10" value={form.year} onChange={set('year')}>
                        <option value="">Select year...</option>
                        {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Section</label>
                    <div className="relative">
                      <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input className="input pl-10" placeholder="e.g. A"
                        value={form.section} onChange={set('section')} />
                    </div>
                  </div>
                  <div>
                    <label className="label">CGPA</label>
                    <input className="input" type="number" step="0.01" min="0" max="10"
                      placeholder="e.g. 8.5" value={form.cgpa} onChange={set('cgpa')} />
                  </div>
                </>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base gap-2 mt-2">
              {loading
                ? <><Loader className="w-4 h-4 animate-spin" /> Creating Account...</>
                : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-bold hover:text-brand-700 transition-colors">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
