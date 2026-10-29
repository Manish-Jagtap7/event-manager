import React, { useState } from 'react'
import { QrCode, Search, CheckCircle2, XCircle, ArrowLeft, Users, Clock, ShieldCheck, Sparkles } from 'lucide-react'
import { CollegeEvent, Registration } from '../types'
import { ChaiButton } from '../components/ChaiButton'
import { StatusChip } from '../components/StatusChip'
import { Highlight } from '../components/Highlight'

export interface LiveAttendanceDeskPageProps {
  events: CollegeEvent[]
  selectedEventId: string
  onSelectEvent: (eventId: string) => void
  registrations: Registration[]
  onToggleAttendance: (regId: string) => void
  onNavigate: (view: string) => void
}

export const LiveAttendanceDeskPage: React.FC<LiveAttendanceDeskPageProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  registrations,
  onToggleAttendance,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterView, setFilterView] = useState<'all' | 'present' | 'absent'>('all')
  const [lastCheckedStudent, setLastCheckedStudent] = useState<string | null>(null)

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0]
  const eventRegistrations = registrations.filter((r) => r.eventId === currentEvent?.id)

  const total = eventRegistrations.length
  const checkedInCount = eventRegistrations.filter((r) => r.status === 'attended').length
  const pendingCount = total - checkedInCount
  const attendanceRate = total > 0 ? Math.round((checkedInCount / total) * 100) : 0

  const filteredList = eventRegistrations.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())

    if (filterView === 'present') return matchesSearch && r.status === 'attended'
    if (filterView === 'absent') return matchesSearch && r.status !== 'attended'
    return matchesSearch
  })

  const handleQuickCheckIn = (reg: Registration) => {
    onToggleAttendance(reg.id)
    if (reg.status !== 'attended') {
      setLastCheckedStudent(`${reg.studentName} (${reg.rollNumber})`)
      setTimeout(() => setLastCheckedStudent(null), 3000)
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('organizer-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono"
        >
          <ArrowLeft className="size-3.5" /> Back to dashboard
        </button>

        <span className="font-mono text-xs text-muted-foreground uppercase">
          Module 04 Live Attendance Desk
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
            Live venue check-in desk
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-sans">
            Verify attendees at the entrance, eliminate proxy attendance, and <Highlight>instantly unlock post-event certificates</Highlight>.
          </p>
        </div>

        {/* Event Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="checkin-evt" className="text-xs text-muted-foreground font-mono uppercase shrink-0">
            Active Event:
          </label>
          <select
            id="checkin-evt"
            value={selectedEventId}
            onChange={(e) => onSelectEvent(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none"
            disabled={events.length === 0}
          >
            {events.length === 0 ? (
              <option value="">No events published</option>
            ) : (
              events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Real-time Turnout Meter Banner */}
      <div className="card-chai p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded border border-border text-muted-foreground">
              {currentEvent ? `${currentEvent.category} · ${currentEvent.venue}` : 'No Active Event'}
            </span>
            <h2 className="mt-2 font-montserrat text-lg font-bold text-foreground">
              {currentEvent ? currentEvent.title : 'No campus events created yet'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-mono text-xs uppercase text-muted-foreground">Attendance Turnout</p>
              <p className="font-montserrat text-3xl font-bold text-foreground">{attendanceRate}%</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${attendanceRate}%` }}
          />
        </div>

        {/* Key Metrics Counters */}
        <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs border-t border-border">
          <div>
            <span className="font-mono uppercase text-muted-foreground text-[10px]">Total Enrolled</span>
            <p className="font-montserrat text-lg font-bold text-foreground">{total}</p>
          </div>
          <div>
            <span className="font-mono uppercase text-muted-foreground text-[10px]">Verified Present</span>
            <p className="font-montserrat text-lg font-bold text-emerald-500">{checkedInCount}</p>
          </div>
          <div>
            <span className="font-mono uppercase text-muted-foreground text-[10px]">Awaiting Arrival</span>
            <p className="font-montserrat text-lg font-bold text-amber-500">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Live Toast Confirmation */}
      {lastCheckedStudent && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>Attendance successfully verified for <strong className="text-white">{lastCheckedStudent}</strong>!</span>
          </div>
          <span className="font-mono text-[11px]">e-Certificate unlocked</span>
        </div>
      )}

      {/* Rapid Check-in Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Type Roll Number (e.g. 21CS042) or student name for rapid check-in..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex rounded-md border border-border p-0.5 bg-neutral-100/50 dark:bg-black/40 text-xs">
          <button
            onClick={() => setFilterView('all')}
            className={`px-3 py-1.5 rounded transition-colors ${
              filterView === 'all'
                ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({total})
          </button>
          <button
            onClick={() => setFilterView('present')}
            className={`px-3 py-1.5 rounded transition-colors ${
              filterView === 'present'
                ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Present ({checkedInCount})
          </button>
          <button
            onClick={() => setFilterView('absent')}
            className={`px-3 py-1.5 rounded transition-colors ${
              filterView === 'absent'
                ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Awaiting ({pendingCount})
          </button>
        </div>
      </div>

      {/* Attendee Live Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-border text-[11px] font-mono uppercase text-muted-foreground">
            <tr>
              <th className="p-3.5 pl-4">Student roll no</th>
              <th className="p-3.5">Attendee name</th>
              <th className="p-3.5">Department</th>
              <th className="p-3.5">Check-in timestamp</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 pr-4 text-right">Gate action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-sans">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No participants matching current search query.
                </td>
              </tr>
            ) : (
              filteredList.map((r) => {
                const isAttended = r.status === 'attended'
                return (
                  <tr
                    key={r.id}
                    className={`transition-colors ${
                      isAttended
                        ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                        : 'hover:bg-neutral-100/30 dark:hover:bg-neutral-900/30'
                    }`}
                  >
                    <td className="p-3.5 pl-4 font-mono font-bold text-foreground">
                      {r.rollNumber}
                    </td>
                    <td className="p-3.5">
                      <p className="font-medium text-foreground">{r.studentName}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{r.email}</p>
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {r.department}
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground">
                      {r.checkInTime ? (
                        <span className="text-emerald-500 font-medium">
                          {r.checkInTime}
                        </span>
                      ) : (
                        <span className="text-neutral-500 text-[11px]">Not arrived</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <StatusChip status={r.status} />
                    </td>
                    <td className="p-3.5 pr-4 text-right">
                      {isAttended ? (
                        <button
                          onClick={() => handleQuickCheckIn(r)}
                          className="text-[11px] text-muted-foreground hover:text-red-400 font-mono transition-colors"
                        >
                          Revoke check-in
                        </button>
                      ) : (
                        <ChaiButton
                          variant="soft"
                          size="sm"
                          iconRight={<CheckCircle2 className="size-3.5 ml-1" />}
                          onClick={() => handleQuickCheckIn(r)}
                        >
                          Check in
                        </ChaiButton>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
