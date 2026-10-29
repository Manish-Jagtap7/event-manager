import React, { useState } from 'react'
import { Calendar, Award, CheckCircle, Bell, ArrowUpRight, QrCode, MapPin, Clock, ArrowRight, UserCheck, X, ShieldCheck } from 'lucide-react'
import { User, Registration, CertificateItem, NotificationItem } from '../types'
import { Highlight } from '../components/Highlight'
import { ChaiButton } from '../components/ChaiButton'
import { StatusChip } from '../components/StatusChip'

export interface StudentDashboardPageProps {
  user: User
  registrations: Registration[]
  certificates: CertificateItem[]
  notifications: NotificationItem[]
  onNavigate: (view: string) => void
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({
  user,
  registrations,
  certificates,
  notifications,
  onNavigate,
}) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const activeRegistrations = registrations.filter((r) => r.status !== 'cancelled')
  const verifiedAttendances = registrations.filter((r) => r.status === 'attended')
  const nextEvent = registrations.find((r) => r.status === 'approved')

  return (
    <div className="space-y-10">
      {/* Student Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded border border-border text-muted-foreground">
              {user.rollNumber}
            </span>
            <span className="text-xs text-muted-foreground font-sans">{user.department}</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-medium text-foreground">
            Welcome back, {user.name}
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-sans">
            Review active enrolments and <Highlight>access verified digital certificates</Highlight> instantly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ChaiButton
            variant="solid"
            size="sm"
            onClick={() => onNavigate('events')}
          >
            Find new events
          </ChaiButton>
        </div>
      </div>

      {/* Metric Counters Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-chai p-4 space-y-1">
          <p className="font-mono text-xs uppercase text-muted-foreground">My Registrations</p>
          <div className="font-montserrat text-2xl sm:text-3xl font-bold text-foreground">
            {activeRegistrations.length}
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">Enrolled campus activities</p>
        </div>

        <div className="card-chai p-4 space-y-1">
          <p className="font-mono text-xs uppercase text-muted-foreground">Verified Attendance</p>
          <div className="font-montserrat text-2xl sm:text-3xl font-bold text-foreground">
            {verifiedAttendances.length}
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">Live venue check-ins</p>
        </div>

        <div className="card-chai p-4 space-y-1">
          <p className="font-mono text-xs uppercase text-muted-foreground">Digital Certificates</p>
          <div className="font-montserrat text-2xl sm:text-3xl font-bold text-foreground">
            {certificates.length}
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">Ready for download</p>
        </div>

        <div className="card-chai p-4 space-y-1">
          <p className="font-mono text-xs uppercase text-muted-foreground">Active Notices</p>
          <div className="font-montserrat text-2xl sm:text-3xl font-bold text-foreground">
            {notifications.filter((n) => !n.read).length}
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">Unread campus updates</p>
        </div>
      </div>

      {/* Main Grid: Next Event & Quick Pass + Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Upcoming Event Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-montserrat text-base sm:text-lg font-semibold text-foreground">
              Next scheduled event
            </h2>
            <button
              onClick={() => onNavigate('my-registrations')}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono"
            >
              All registrations <ArrowUpRight className="size-3" />
            </button>
          </div>

          {nextEvent ? (
            <div className="card-chai p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded border border-border text-muted-foreground">
                    {nextEvent.eventCategory}
                  </span>
                  <h3 className="mt-2 font-montserrat text-lg font-bold text-foreground">
                    {nextEvent.eventTitle}
                  </h3>
                </div>
                <StatusChip status={nextEvent.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 border-y border-border text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 shrink-0" />
                  <span>{nextEvent.eventDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 shrink-0" />
                  <span>{nextEvent.eventTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">{nextEvent.eventVenue}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <QrCode className="size-4 text-emerald-500" />
                  <span>Digital Pass verified: {nextEvent.rollNumber}</span>
                </div>

                <div className="flex items-center gap-2">
                  <ChaiButton
                    variant="soft"
                    size="sm"
                    iconRight={null}
                    onClick={() => onNavigate('student-pass')}
                  >
                    View check-in QR
                  </ChaiButton>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-chai p-8 text-center space-y-2">
              <p className="text-sm text-foreground font-montserrat">No upcoming event registered</p>
              <p className="text-xs text-muted-foreground">Browse the campus catalogue to enroll in hackathons or workshops.</p>
              <ChaiButton
                variant="outline"
                size="sm"
                iconRight={null}
                onClick={() => onNavigate('events')}
              >
                Browse directory
              </ChaiButton>
            </div>
          )}

          {/* Registrations List Preview */}
          <div className="space-y-3 pt-4">
            <h3 className="font-montserrat text-sm font-semibold text-foreground">
              Enrolment status log
            </h3>
            <div className="space-y-2">
              {registrations.length === 0 ? (
                <div className="card-chai p-5 text-center text-xs text-muted-foreground">
                  No event registrations yet. Browse the directory to enroll.
                </div>
              ) : (
                registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="card-chai p-3.5 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{reg.eventTitle}</p>
                      <p className="text-[11px] text-muted-foreground">{reg.eventDate} · {reg.eventVenue}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusChip status={reg.status} />
                      {reg.status === 'attended' && (
                        <button
                          onClick={() => onNavigate('certificates')}
                          className="text-emerald-500 hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          <Award className="size-3" /> Certificate
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Broadcast Alerts & Quick Actions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-montserrat text-base sm:text-lg font-semibold text-foreground">
              Event notices
            </h2>
            <button
              onClick={() => onNavigate('notifications')}
              className="text-xs text-muted-foreground hover:text-foreground font-mono"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="card-chai p-5 text-center text-xs text-muted-foreground">
                No active notices. Broadcasts and venue updates will appear here.
              </div>
            ) : (
              notifications.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  className={`card-chai p-4 space-y-1.5 transition-colors ${
                    !n.read ? 'border-amber-500/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span className="uppercase">{n.category}</span>
                    <span>{n.timestamp}</span>
                  </div>
                  <h4 className="font-montserrat text-xs font-semibold text-foreground">
                    {n.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Quick Access Card */}
          <div className="card-chai p-5 space-y-3">
            <h3 className="font-montserrat text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Quick tools
            </h3>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => onNavigate('student-pass')}
                className="w-full p-2.5 rounded-md border border-border flex items-center justify-between hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors text-left"
              >
                <span className="flex items-center gap-2">
                  <QrCode className="size-4 text-muted-foreground" />
                  <span>Show entry check-in badge</span>
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="w-full p-2.5 rounded-md border border-border flex items-center justify-between hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors text-left"
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="size-4 text-muted-foreground" />
                  <span>Verified student profile</span>
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Student Profile Dialog */}
      {profileModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setProfileModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-card p-6 text-foreground space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md border border-border bg-neutral-100 dark:bg-neutral-900 text-emerald-500">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <h3 className="font-montserrat text-sm font-semibold text-foreground">
                    Verified Student Record
                  </h3>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    CAMPUS IDENTITY CREDENTIAL
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground font-mono uppercase text-[10px]">Student name:</span>
                <span className="font-semibold text-foreground">{user.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground font-mono uppercase text-[10px]">Roll number:</span>
                <span className="font-mono font-bold text-foreground">{user.rollNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground font-mono uppercase text-[10px]">Department:</span>
                <span className="text-foreground">{user.department}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground font-mono uppercase text-[10px]">Academic level:</span>
                <span className="text-foreground">{user.semester || '6th Semester'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground font-mono uppercase text-[10px]">Institutional email:</span>
                <span className="font-mono text-foreground">{user.email}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground font-mono uppercase text-[10px]">Account status:</span>
                <span className="text-emerald-500 font-mono font-medium">Verified Active</span>
              </div>
            </div>

            <div className="pt-2">
              <ChaiButton
                variant="outline"
                size="sm"
                iconRight={null}
                className="w-full"
                onClick={() => setProfileModalOpen(false)}
              >
                Close profile
              </ChaiButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
