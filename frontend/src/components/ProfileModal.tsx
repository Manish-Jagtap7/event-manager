import React, { useState, useEffect } from 'react'
import { User as UserIcon, Mail, BookOpen, GraduationCap, Hash, Lock, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { User } from '../types'
import { ChaiButton } from './ChaiButton'
import { api } from '../services/api'

export interface ProfileModalProps {
  open: boolean
  user: User
  onClose: () => void
  onProfileUpdated: (updatedUser: User) => void
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  user,
  onClose,
  onProfileUpdated,
}) => {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [department, setDepartment] = useState(user.department || '')
  const [rollNumber, setRollNumber] = useState(user.rollNumber || '')
  const [semester, setSemester] = useState(user.semester || '6th Semester')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(user.name)
      setEmail(user.email)
      setDepartment(user.department || '')
      setRollNumber(user.rollNumber || '')
      setSemester(user.semester || '6th Semester')
      setPassword('')
      setErrorMsg(null)
      setSuccessMsg(null)
    }
  }, [open, user])

  if (!open) return null

  const isStudent = user.role === 'student'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!name.trim()) {
      setErrorMsg('Full name is required.')
      return
    }
    if (!email.trim()) {
      setErrorMsg('College email is required.')
      return
    }
    if (isStudent && !rollNumber.trim()) {
      setErrorMsg('Roll number is required for student accounts.')
      return
    }
    if (password && password.length < 6) {
      setErrorMsg('New password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await api.auth.updateProfile({
        name: name.trim(),
        email: email.trim(),
        department: department.trim(),
        rollNumber: isStudent ? rollNumber.trim() : undefined,
        semester: isStudent ? semester.trim() : undefined,
        ...(password.trim() ? { password: password.trim() } : {}),
      })

      setSuccessMsg('Profile updated successfully!')
      onProfileUpdated(res.user)
      setTimeout(() => {
        onClose()
      }, 700)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-card p-6 sm:p-8 text-foreground relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground p-1 transition-colors"
          aria-label="Close profile modal"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md border border-border bg-neutral-100 dark:bg-neutral-900 text-foreground">
              <UserIcon className="size-4" />
            </span>
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded border border-border text-muted-foreground">
              {isStudent ? 'Student Profile' : 'Event Manager Profile'}
            </span>
          </div>
          <h2 id="profile-modal-title" className="font-montserrat text-xl sm:text-2xl font-bold text-foreground mt-2">
            Edit profile details
          </h2>
          <p className="text-xs text-muted-foreground font-sans">
            Update your registered account credentials and departmental records.
          </p>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-xs flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs font-sans">
          {/* Full Name */}
          <div>
            <label className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
              Full Name *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
              College Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
              Department *
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Student Specific Fields */}
          {isStudent && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
                  Roll Number *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
                  Semester
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Optional New Password */}
          <div>
            <label className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
              New Password (Leave blank to keep unchanged)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Enter new password (optional)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <ChaiButton
              type="button"
              variant="outline"
              size="sm"
              iconRight={null}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </ChaiButton>

            <ChaiButton
              type="submit"
              variant="solid"
              size="sm"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save changes'}
            </ChaiButton>
          </div>
        </form>
      </div>
    </div>
  )
}
