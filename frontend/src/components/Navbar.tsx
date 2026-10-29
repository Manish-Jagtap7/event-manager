import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Bell,
  Menu,
  X,
  UserCheck,
  Award,
  Layers,
  Users,
  BarChart3,
  PlusCircle,
  QrCode,
  LogOut,
  Compass,
} from 'lucide-react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { User } from '../types'

export interface NavbarProps {
  currentUser: User | null
  activeView: string
  onNavigate: (view: string) => void
  unreadCount: number
  onLogout: () => void
  onOpenProfile?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  onNavigate,
  unreadCount,
  onLogout,
  onOpenProfile,
}) => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Navigation items customized strictly by user role
  const isStudent = currentUser?.role === 'student'
  const isOrganizer = currentUser?.role === 'organizer'

  const studentLinks = [
    { id: 'student-dashboard', label: 'Dashboard', icon: Layers },
    { id: 'events', label: 'Browse Events', icon: Compass },
    { id: 'my-registrations', label: 'My Registrations', icon: UserCheck },
    { id: 'student-pass', label: 'Check-in Pass', icon: QrCode },
    { id: 'certificates', label: 'Certificates', icon: Award },
  ]

  const organizerLinks = [
    { id: 'organizer-dashboard', label: 'Overview', icon: Layers },
    { id: 'events', label: 'All Events', icon: Compass },
    { id: 'create-event', label: 'Create Event', icon: PlusCircle },
    { id: 'participants-roster', label: 'Roster', icon: Users },
    { id: 'live-attendance', label: 'Live Check-in', icon: UserCheck },
    { id: 'broadcast-notice', label: 'Broadcast', icon: Bell },
    { id: 'analytics-reports', label: 'Reports', icon: BarChart3 },
  ]

  const currentLinks = isStudent ? studentLinks : isOrganizer ? organizerLinks : []

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-[background-color,backdrop-filter,border-color] duration-300 ${
        scrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-12">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate(isOrganizer ? 'organizer-dashboard' : isStudent ? 'student-dashboard' : 'auth')}
            className="group flex items-center gap-2.5 text-left font-brand text-xl font-medium tracking-tight text-foreground cursor-pointer"
          >
            <span className="flex size-7 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-brand">
              <Calendar className="size-4 text-orange-500" />
            </span>
            <span>
              Event<span className="text-brand">Hub</span>
            </span>
          </button>

          {/* User Role Pill */}
          {currentUser && (
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-0.5 rounded border border-border text-muted-foreground">
              {isStudent ? (
                <>
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span>Student Portal · {currentUser.rollNumber || '21CS042'}</span>
                </>
              ) : (
                <>
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  <span>Faculty Event Manager</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {currentLinks.map((link) => {
            const isActive = activeView === link.id
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'font-medium text-foreground bg-neutral-200/50 dark:bg-neutral-800/60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40'
                }`}
              >
                {link.label}
              </button>
            )
          })}
        </nav>

        {/* Actions Right */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Notifications Button with Unread Badge */}
          {currentUser && (
            <button
              onClick={() => onNavigate('notifications')}
              aria-label="View notifications"
              className={`relative inline-flex size-8 items-center justify-center rounded-full border border-border transition-colors cursor-pointer ${
                activeView === 'notifications'
                  ? 'bg-neutral-200/60 dark:bg-neutral-800/80 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-mono font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Profile Edit Button */}
          {currentUser && onOpenProfile && (
            <button
              onClick={onOpenProfile}
              title="Edit account profile"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md border border-border text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <UserCheck className="size-3.5 text-orange-500" />
              <span className="hidden sm:inline font-mono text-[11px] max-w-[100px] truncate">{currentUser.name}</span>
            </button>
          )}

          {/* User Sign In / Logout Button */}
          {currentUser ? (
            <button
              onClick={onLogout}
              title="Sign out of portal"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-border text-muted-foreground hover:text-red-500 hover:border-red-500/40 transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Sign out</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="text-xs font-medium px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Sign in
            </button>
          )}

          {/* Mobile Menu Toggle */}
          {currentUser && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="md:hidden inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && currentUser && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-lg px-6 py-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
            <span className="font-mono text-muted-foreground">
              {currentUser.name} ({currentUser.role})
            </span>
            <div className="flex items-center gap-3">
              {onOpenProfile && (
                <button
                  onClick={() => {
                    onOpenProfile()
                    setMobileMenuOpen(false)
                  }}
                  className="text-foreground hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UserCheck className="size-3 text-orange-500" /> Profile
                </button>
              )}
              <button
                onClick={() => {
                  onLogout()
                  setMobileMenuOpen(false)
                }}
                className="text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="size-3" /> Sign out
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {currentLinks.map((link) => {
              const Icon = link.icon
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`flex items-center gap-2 p-2 rounded-md text-sm text-left ${
                    activeView === link.id
                      ? 'bg-neutral-200 dark:bg-neutral-800 font-medium text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{link.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
