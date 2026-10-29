import React from 'react'
import { Calendar, Users, CheckCircle2, Award, PlusCircle, Bell, BarChart3, QrCode, ArrowUpRight } from 'lucide-react'
import { CollegeEvent, Registration, User } from '../types'
import { ChaiButton } from '../components/ChaiButton'
import { StatusChip } from '../components/StatusChip'
import { Highlight } from '../components/Highlight'

export interface OrganizerDashboardPageProps {
  user: User
  events: CollegeEvent[]
  registrations: Registration[]
  onNavigate: (view: string) => void
  onSelectEventForRoster: (eventId: string) => void
  onEditEvent?: (event: CollegeEvent) => void
}

export const OrganizerDashboardPage: React.FC<OrganizerDashboardPageProps> = ({
  user,
  events,
  registrations,
  onNavigate,
  onSelectEventForRoster,
  onEditEvent,
}) => {
  const totalRegistrations = registrations.length
  const totalCheckedIn = registrations.filter((r) => r.status === 'attended').length
  const attendanceRate = totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0

  return (
    <div className="space-y-10">
      {/* Organizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded border border-border text-muted-foreground">
              ORGANIZER CONTROL PANEL
            </span>
            <span className="text-xs text-muted-foreground font-sans">{user.department}</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-medium text-foreground">
            Event coordinator workspace
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-sans">
            Manage registrations, perform live venue check-ins, and <Highlight>export verified campus analytics</Highlight> without paperwork.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ChaiButton
            variant="solid"
            size="sm"
            iconRight={<PlusCircle className="size-4 -ml-0.5" />}
            onClick={() => onNavigate('create-event')}
          >
            Create new event
          </ChaiButton>
        </div>
      </div>

      {/* Organizer Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-chai p-4 space-y-1">
          <p className="font-mono text-xs uppercase text-muted-foreground">Active Events</p>
          <div className="font-montserrat text-2xl sm:text-3xl font-bold text-foreground">
            {events.length}
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">Published on campus portal</p>
        </div>

        <div className="card-chai p-4 space-y-1">
          <p className="font-mono text-xs uppercase text-muted-foreground">Total Enrolled</p>
          <div className="font-montserrat text-2xl sm:text-3xl font-bold text-foreground">
            {totalRegistrations}
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">Registered student records</p>
        </div>

        <div className="card-chai p-4 space-y-1">
          <p className="font-mono text-xs uppercase text-muted-foreground">Check-in Turnout</p>
          <div className="font-montserrat text-2xl sm:text-3xl font-bold text-foreground">
            {attendanceRate}%
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">
            {totalCheckedIn} attendees verified
          </p>
        </div>

        <div className="card-chai p-4 space-y-1">
          <p className="font-mono text-xs uppercase text-muted-foreground">System Status</p>
          <div className="font-montserrat text-2xl sm:text-3xl font-bold text-emerald-500">
            Live
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">Ready for venue check-ins</p>
        </div>
      </div>

      {/* Quick Operations Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('live-attendance')}
          className="card-chai p-5 text-left group hover:border-orange-500/30 transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Module 04</span>
            <h3 className="font-montserrat text-sm font-semibold text-foreground group-hover:text-brand transition-colors">
              Open live check-in desk
            </h3>
            <p className="text-xs text-muted-foreground">Instant 1-click roll number verification at door</p>
          </div>
          <QrCode className="size-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-3" />
        </button>

        <button
          onClick={() => onNavigate('broadcast-notice')}
          className="card-chai p-5 text-left group hover:border-orange-500/30 transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Module 05</span>
            <h3 className="font-montserrat text-sm font-semibold text-foreground group-hover:text-brand transition-colors">
              Broadcast event notice
            </h3>
            <p className="text-xs text-muted-foreground">Send real-time alerts to registered student batches</p>
          </div>
          <Bell className="size-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-3" />
        </button>

        <button
          onClick={() => onNavigate('analytics-reports')}
          className="card-chai p-5 text-left group hover:border-orange-500/30 transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Module 08</span>
            <h3 className="font-montserrat text-sm font-semibold text-foreground group-hover:text-brand transition-colors">
              Analytics and exports
            </h3>
            <p className="text-xs text-muted-foreground">Department-wise participation reports and CSVs</p>
          </div>
          <BarChart3 className="size-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-3" />
        </button>
      </div>

      {/* Managed Events Master Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-montserrat text-lg font-semibold text-foreground">
            Managed campus events
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            Showing {events.length} listings
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-border text-[11px] font-mono uppercase text-muted-foreground">
              <tr>
                <th className="p-3.5 pl-4">Event title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Date & Venue</th>
                <th className="p-3.5">Enrolment ratio</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Desk actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <p className="font-montserrat text-sm font-semibold text-foreground">
                      No campus events created yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Publish your first college competition, hackathon, or workshop using the button below.
                    </p>
                    <div className="pt-3">
                      <ChaiButton
                        variant="outline"
                        size="sm"
                        iconRight={<PlusCircle className="size-3.5" />}
                        onClick={() => onNavigate('create-event')}
                      >
                        Publish new event
                      </ChaiButton>
                    </div>
                  </td>
                </tr>
              ) : (
                events.map((evt) => {
                  const percent = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100))
                  return (
                    <tr key={evt.id} className="hover:bg-neutral-100/30 dark:hover:bg-neutral-900/30 transition-colors">
                      <td className="p-3.5 pl-4">
                        <p className="font-semibold text-foreground">{evt.title}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">ID: {evt.id}</p>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border border-border">
                          {evt.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        <p className="text-foreground">{evt.date}</p>
                        <p className="text-[11px] truncate max-w-[180px]">{evt.venue}</p>
                      </td>
                      <td className="p-3.5 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-medium">
                            {evt.registeredCount} / {evt.capacity}
                          </span>
                          <span className="text-[10px] text-muted-foreground">({percent}%)</span>
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 mt-1 overflow-hidden">
                          <div
                            className="h-full bg-neutral-500 dark:bg-neutral-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-3.5">
                        <StatusChip status={evt.status} />
                      </td>
                      <td className="p-3.5 pr-4 text-right space-x-1.5">
                        {onEditEvent && (
                          <button
                            onClick={() => onEditEvent(evt)}
                            className="px-2 py-1 rounded text-[11px] text-muted-foreground hover:text-foreground font-mono transition-colors"
                          >
                            Edit
                          </button>
                        )}

                        <ChaiButton
                          variant="ghost"
                          size="sm"
                          iconRight={null}
                          onClick={() => {
                            onSelectEventForRoster(evt.id)
                            onNavigate('participants-roster')
                          }}
                        >
                          Roster
                        </ChaiButton>

                        <ChaiButton
                          variant="soft"
                          size="sm"
                          iconRight={null}
                          onClick={() => {
                            onSelectEventForRoster(evt.id)
                            onNavigate('live-attendance')
                          }}
                        >
                          Check-in
                        </ChaiButton>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
