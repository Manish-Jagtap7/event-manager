import React, { useState } from 'react'
import { Lock, Mail, User, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { UserRole, User as UserType } from '../types'
import { ChaiButton } from '../components/ChaiButton'
import { Highlight } from '../components/Highlight'
import { api } from '../services/api'

export interface AuthPageProps {
  onAuthSuccess: (user: UserType) => void
  onNavigate?: (view: string) => void
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  // First visit MUST default to sign up as requested
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup')
  const [role, setRole] = useState<UserRole>('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [department, setDepartment] = useState('Computer Science & Engineering')
  const [semester, setSemester] = useState('6th Semester')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (authMode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name.')
        if (!email.trim()) throw new Error('Please enter your college email.')
        if (password.length < 6) throw new Error('Password must be at least 6 characters.')
        if (role === 'student' && !rollNumber.trim()) throw new Error('Student roll number is required.')

        const res = await api.auth.register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          rollNumber: role === 'student' ? rollNumber.trim() : undefined,
          department: department.trim(),
          semester: role === 'student' ? semester : undefined,
        })
        setSuccessMessage('Account created successfully! Loading your portal...')
        setTimeout(() => {
          onAuthSuccess(res.user)
        }, 600)
      } else {
        if (!email.trim() || !password) throw new Error('Email and password are required.')
        const res = await api.auth.login({
          email: email.trim(),
          password,
        })
        setSuccessMessage('Signed in successfully! Loading your portal...')
        setTimeout(() => {
          onAuthSuccess(res.user)
        }, 600)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pt-4 pb-12">
      {/* Brand & Greeting */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 font-brand text-2xl font-bold tracking-tight text-foreground">
          <span className="flex size-8 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-brand">
            <ShieldCheck className="size-5 text-orange-500" />
          </span>
          <span>
            Event<span className="text-brand">Hub</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
          {authMode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans">
          {authMode === 'signup'
            ? 'Sign up to register for campus events or manage college competitions.'
            : 'Sign in to access your customized student or organizer dashboard.'}
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="card-chai p-6 sm:p-8 space-y-5">
        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-500 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {authMode === 'signup' && (
            <>
              {/* Account Type Selector: Student or Organizer */}
              <div className="space-y-1.5 pb-2 border-b border-border">
                <span className="font-mono text-[10px] uppercase text-muted-foreground block">
                  Select your role *
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 rounded-md border text-center transition-all ${
                      role === 'student'
                        ? 'border-orange-500/50 bg-neutral-200/60 dark:bg-neutral-800 font-semibold text-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('organizer')}
                    className={`py-2 px-3 rounded-md border text-center transition-all ${
                      role === 'organizer'
                        ? 'border-orange-500/50 bg-neutral-200/60 dark:bg-neutral-800 font-semibold text-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Event Manager
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
                  Full name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder={role === 'student' ? 'e.g. Aarav Sharma' : 'e.g. Prof. Rajesh Kulkarni'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Student specific fields */}
              {role === 'student' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
                      Roll number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 21CS042"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-foreground font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
                      Semester
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full h-9 px-2 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none"
                    >
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                      <option value="3rd Semester">3rd Semester</option>
                      <option value="4th Semester">4th Semester</option>
                      <option value="5th Semester">5th Semester</option>
                      <option value="6th Semester">6th Semester (Final Year)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Department */}
              <div>
                <label className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
                  {role === 'student' ? 'Academic department' : 'Host department / Committee'}
                </label>
                <input
                  type="text"
                  placeholder={role === 'student' ? 'e.g. Computer Science & Engineering' : 'e.g. Campus Event Coordination Committee'}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
              College email address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="name@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <ChaiButton
              type="submit"
              variant="solid"
              size="md"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : authMode === 'signup'
                ? 'Create account'
                : 'Sign in to portal'}
            </ChaiButton>
          </div>
        </form>

        {/* Login Option at Bottom (As explicitly requested by user) */}
        <div className="pt-4 border-t border-border text-center text-xs text-muted-foreground">
          {authMode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin')
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className="font-medium text-foreground underline hover:text-brand transition-colors cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          ) : (
            <p>
              Do not have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup')
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className="font-medium text-foreground underline hover:text-brand transition-colors cursor-pointer"
              >
                Sign up here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
