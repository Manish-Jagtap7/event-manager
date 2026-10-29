import React, { useState } from 'react'
import { Search, Download, CheckCircle, Clock, Filter, ArrowLeft, UserCheck } from 'lucide-react'
import { CollegeEvent, Registration } from '../types'
import { ChaiButton } from '../components/ChaiButton'
import { StatusChip } from '../components/StatusChip'
import { Highlight } from '../components/Highlight'

export interface ParticipantsRosterPageProps {
  events: CollegeEvent[]
  selectedEventId: string
  onSelectEvent: (eventId: string) => void
  registrations: Registration[]
  onUpdateStatus: (regId: string, newStatus: 'approved' | 'pending' | 'attended') => void
  onNavigate: (view: string) => void
}

export const ParticipantsRosterPage: React.FC<ParticipantsRosterPageProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  registrations,
  onUpdateStatus,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Filter registrations by selected event
  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0]
  const eventRegistrations = registrations.filter((r) => r.eventId === currentEvent?.id)

  const filteredRoster = eventRegistrations.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDept =
      departmentFilter === 'All' || r.department.includes(departmentFilter)

    const matchesStatus =
      statusFilter === 'All' || r.status === statusFilter

    return matchesSearch && matchesDept && matchesStatus
  })

  // Export roster as clean CSV download
  const handleExportCSV = () => {
    const headers = ['Registration ID,Roll Number,Student Name,Department,Email,Status,Date Registered\n']
    const rows = filteredRoster.map(
      (r) => `${r.id},${r.rollNumber},"${r.studentName}","${r.department}",${r.email},${r.status},${r.registeredAt}\n`
    )
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${currentEvent?.title || 'Event'}_Participants_Roster.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          Module 03 Registration Roster
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
            Participant master roster
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-sans">
            Review student enrollments, manage approvals, and <Highlight>export verified attendance manifests</Highlight>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ChaiButton
            variant="outline"
            size="sm"
            iconRight={<Download className="size-3.5" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </ChaiButton>

          <ChaiButton
            variant="solid"
            size="sm"
            onClick={() => onNavigate('live-attendance')}
          >
            Live check-in desk
          </ChaiButton>
        </div>
      </div>

      {/* Event Selection & Filters Card */}
      <div className="card-chai p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="roster-evt" className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
              Select event roster
            </label>
            <select
              id="roster-evt"
              value={selectedEventId}
              onChange={(e) => onSelectEvent(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none"
              disabled={events.length === 0}
            >
              {events.length === 0 ? (
                <option value="">No events published yet</option>
              ) : (
                events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.registeredCount} enrolled)
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label htmlFor="dept-filter" className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
              Department filter
            </label>
            <select
              id="dept-filter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none"
            >
              <option value="All">All departments</option>
              <option value="Computer">Computer Science & IT</option>
              <option value="Electronics">Electronics & Comm</option>
              <option value="Mechanical">Mechanical Engineering</option>
            </select>
          </div>

          <div>
            <label htmlFor="stat-filter" className="block font-mono uppercase text-muted-foreground text-[10px] mb-1">
              Status filter
            </label>
            <select
              id="stat-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none"
            >
              <option value="All">All statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="attended">Attended</option>
            </select>
          </div>
        </div>

        {/* Live Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>Showing <strong className="text-foreground font-mono">{filteredRoster.length}</strong> participants</span>
          <span className="font-mono text-[11px]">{currentEvent?.venue}</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-border text-[11px] font-mono uppercase text-muted-foreground">
              <tr>
                <th className="p-3 pl-4">Roll number</th>
                <th className="p-3">Student name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Enrolled on</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-4 text-right">Approval toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No student registrations found for this filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRoster.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-100/30 dark:hover:bg-neutral-900/30 transition-colors">
                    <td className="p-3 pl-4 font-mono font-medium text-foreground">
                      {r.rollNumber}
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-foreground">{r.studentName}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{r.email}</p>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {r.department}
                    </td>
                    <td className="p-3 text-muted-foreground font-mono text-[11px]">
                      {r.registeredAt}
                    </td>
                    <td className="p-3">
                      <StatusChip status={r.status} />
                    </td>
                    <td className="p-3 pr-4 text-right">
                      {r.status === 'pending' ? (
                        <ChaiButton
                          variant="soft"
                          size="sm"
                          iconRight={null}
                          onClick={() => onUpdateStatus(r.id, 'approved')}
                        >
                          Approve
                        </ChaiButton>
                      ) : r.status === 'approved' ? (
                        <button
                          onClick={() => onUpdateStatus(r.id, 'pending')}
                          className="text-[11px] text-muted-foreground hover:text-foreground font-mono"
                        >
                          Mark pending
                        </button>
                      ) : (
                        <span className="text-emerald-500 font-mono text-[11px]">
                          Verified at door
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
