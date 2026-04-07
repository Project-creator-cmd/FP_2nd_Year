import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Eye, EyeOff, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      const map = { student: '/student', faculty: '/faculty', admin: '/admin', placement: '/placement' }
      navigate(map[user.role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const fill = (email, password) => setForm({ email, password })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl shadow-lg mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Acadex</h1>
          <p className="text-slate-500 mt-1">Smart Academic Achievement Portal</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input className="input" type="email" placeholder="you@college.edu" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-11" type={show ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Student', email: 'student@demo.com', pw: 'demo123' },
                { label: 'Faculty', email: 'faculty@demo.com', pw: 'demo123' },
                { label: 'Admin', email: 'admin@demo.com', pw: 'demo123' },
                { label: 'Placement', email: 'placement@demo.com', pw: 'demo123' },
              ].map(d => (
                <button key={d.label} onClick={() => fill(d.email, d.pw)}
                  className="text-xs px-3 py-2 rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-600 font-medium border border-slate-200 transition-colors">
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Don't have an account? <Link to="/register" className="text-brand-600 font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}
