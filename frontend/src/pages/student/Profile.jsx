import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { User, Lock, Save, Loader } from 'lucide-react'

export default function StudentProfile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState({ name: user?.name||'', phone: user?.phone||'', cgpa: user?.cgpa||'', attendance: user?.attendance||75 })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const handleProfileSave = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const { data } = await api.put('/auth/profile', profile)
      updateUser(data.user)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
    finally { setSaving(false) }
  }

  const handlePasswordSave = async e => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirm) { toast.error('Passwords do not match'); return }
    setSavingPw(true)
    try {
      await api.put('/auth/password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      toast.success('Password changed!')
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSavingPw(false) }
  }

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="page-title">Profile</h1>

      {/* Avatar / info */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium">{user?.department}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{user?.rollNumber}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Year {user?.year} · Sec {user?.section}</span>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="card p-6">
        <h2 className="section-title flex items-center gap-2 mb-5"><User className="w-5 h-5 text-brand-600"/>Edit Profile</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name</label>
              <input className="input" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+91 XXXXX XXXXX" value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} />
            </div>
            <div>
              <label className="label">CGPA</label>
              <input className="input" type="number" step="0.01" min="0" max="10" value={profile.cgpa} onChange={e=>setProfile(p=>({...p,cgpa:e.target.value}))} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><Loader className="w-4 h-4 animate-spin"/>Saving...</> : <><Save className="w-4 h-4"/>Save Changes</>}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h2 className="section-title flex items-center gap-2 mb-5"><Lock className="w-5 h-5 text-brand-600"/>Change Password</h2>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input className="input" type="password" value={passwords.currentPassword} onChange={e=>setPasswords(p=>({...p,currentPassword:e.target.value}))} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" value={passwords.newPassword} onChange={e=>setPasswords(p=>({...p,newPassword:e.target.value}))} required minLength={6} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input className="input" type="password" value={passwords.confirm} onChange={e=>setPasswords(p=>({...p,confirm:e.target.value}))} required />
          </div>
          <button type="submit" disabled={savingPw} className="btn-primary flex items-center gap-2">
            {savingPw ? <><Loader className="w-4 h-4 animate-spin"/>Updating...</> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
