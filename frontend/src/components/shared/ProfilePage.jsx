import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { User, Lock, Save, Loader, Eye, EyeOff, Mail, Shield, Building } from 'lucide-react'

// Role accent colors for avatar
const ROLE_GRADIENTS = {
  student:         'from-blue-500 to-cyan-500',
  faculty:         'from-purple-500 to-violet-500',
  admin:           'from-rose-500 to-pink-500',
  placement:       'from-emerald-500 to-teal-500',
  dept_head:       'from-amber-500 to-orange-500',
  event_organizer: 'from-sky-500 to-blue-500',
}

function PasswordField({ label, value, onChange, required, minLength }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          className="input pr-11"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  // Profile form — pre-fill from current user
  const [profile, setProfile] = useState({
    name:        user?.name        || '',
    phone:       user?.phone       || '',
    cgpa:        user?.cgpa        || '',
    year:        user?.year        || '',
    section:     user?.section     || '',
    designation: user?.designation || '',
  })
  const [saving, setSaving] = useState(false)

  // Password form
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  const role     = user?.role
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  const gradient = ROLE_GRADIENTS[role] || ROLE_GRADIENTS.student

  /* ── profile save ── */
  const handleProfileSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { name: profile.name, phone: profile.phone }
      if (role === 'student') {
        payload.cgpa    = profile.cgpa
        payload.year    = profile.year
        payload.section = profile.section
      }
      if (['faculty', 'dept_head'].includes(role)) {
        payload.designation = profile.designation
      }
      const { data } = await api.put('/auth/profile', payload)
      updateUser(data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  /* ── password save ── */
  const handlePasswordSave = async e => {
    e.preventDefault()
    if (pw.next !== pw.confirm) { setPwError('Passwords do not match'); return }
    if (pw.next.length < 6)     { setPwError('New password must be at least 6 characters'); return }
    setPwError('')
    setSavingPw(true)
    try {
      await api.put('/auth/password', { currentPassword: pw.current, newPassword: pw.next })
      toast.success('Password changed successfully!')
      setPw({ current: '', next: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="page-title">Profile &amp; Settings</h1>

      {/* Avatar card */}
      <div className="card p-6 flex items-center gap-5">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium capitalize">{user?.role?.replace('_', ' ')}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{user?.department}</span>
            {user?.rollNumber && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{user.rollNumber}</span>}
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="card p-6">
        <h2 className="section-title flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-brand-600" /> Edit Profile
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name</label>
              <input className="input" value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+91 XXXXX XXXXX" value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </div>

            {/* Student-only fields */}
            {role === 'student' && <>
              <div>
                <label className="label">CGPA <span className="text-slate-400 font-normal text-xs">(self-reported)</span></label>
                <input className="input" type="number" step="0.01" min="0" max="10" value={profile.cgpa}
                  onChange={e => setProfile(p => ({ ...p, cgpa: e.target.value }))} />
              </div>
              <div>
                <label className="label">Year</label>
                <select className="input" value={profile.year}
                  onChange={e => setProfile(p => ({ ...p, year: e.target.value }))}>
                  <option value="">Select year</option>
                  {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Section</label>
                <input className="input" placeholder="e.g. A" value={profile.section}
                  onChange={e => setProfile(p => ({ ...p, section: e.target.value }))} />
              </div>
            </>}

            {/* Faculty / Dept Head designation */}
            {['faculty', 'dept_head'].includes(role) && (
              <div>
                <label className="label">Designation</label>
                <input className="input" placeholder="e.g. Associate Professor" value={profile.designation}
                  onChange={e => setProfile(p => ({ ...p, designation: e.target.value }))} />
              </div>
            )}
          </div>

          {/* Read-only fields */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Cannot be changed</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-600 truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-600 capitalize">{user?.role?.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-600">{user?.department}</span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary gap-2">
            {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h2 className="section-title flex items-center gap-2 mb-5">
          <Lock className="w-5 h-5 text-brand-600" /> Change Password
        </h2>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <PasswordField label="Current Password" value={pw.current} required
            onChange={e => setPw(p => ({ ...p, current: e.target.value }))} />
          <PasswordField label="New Password" value={pw.next} required minLength={6}
            onChange={e => { setPw(p => ({ ...p, next: e.target.value })); setPwError('') }} />
          <PasswordField label="Confirm New Password" value={pw.confirm} required
            onChange={e => { setPw(p => ({ ...p, confirm: e.target.value })); setPwError('') }} />
          {pwError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{pwError}</p>
          )}
          <button type="submit" disabled={savingPw} className="btn-primary gap-2">
            {savingPw ? <><Loader className="w-4 h-4 animate-spin" /> Updating...</> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
