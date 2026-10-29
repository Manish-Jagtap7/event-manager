import React from 'react'
import { BarChart3, Download, Printer, ArrowLeft, TrendingUp, Users, CheckCircle, FileText } from 'lucide-react'
import { CollegeEvent, Registration } from '../types'
import { ChaiButton } from '../components/ChaiButton'
import { Highlight } from '../components/Highlight'

export interface AnalyticsReportsPageProps {
  events: CollegeEvent[]
  registrations: Registration[]
  onNavigate: (view: string) => void
}

export const AnalyticsReportsPage: React.FC<AnalyticsReportsPageProps> = ({
  events,
  registrations,
  onNavigate,
}) => {
  const totalRegistrations = registrations.length
  const totalAttended = registrations.filter((r) => r.status === 'attended').length
  const totalCertificates = totalAttended

  const departmentCounts: Record<string, number> = {
    'Computer Science & Engineering': 0,
    'Information Technology': 0,
    'Electronics & Communication': 0,
    'Mechanical Engineering': 0,
    'Other Branches': 0,
  }

  registrations.forEach((r) => {
    if (r.department.includes('Computer')) departmentCounts['Computer Science & Engineering']++
    else if (r.department.includes('Information')) departmentCounts['Information Technology']++
    else if (r.department.includes('Electronics')) departmentCounts['Electronics & Communication']++
    else if (r.department.includes('Mechanical')) departmentCounts['Mechanical Engineering']++
    else departmentCounts['Other Branches']++
  })

  // Export event master analytics CSV
  const handleExportSummaryCSV = () => {
    const headers = ['Event ID,Title,Category,Date,Capacity,Registered,Check-in Rate\n']
    const rows = events.map((e) => {
      const regForEvent = registrations.filter((r) => r.eventId === e.id)
      const attendedCount = regForEvent.filter((r) => r.status === 'attended').length
      const rate = regForEvent.length > 0 ? Math.round((attendedCount / regForEvent.length) * 100) : 0
      return `${e.id},"${e.title}",${e.category},${e.date},${e.capacity},${e.registeredCount},${rate}%\n`
    })
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'EventHub_Master_Analytics_Report.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export attendance check-in audit log CSV
  const handleExportAuditCSV = () => {
    const headers = ['Record ID,Event Title,Roll Number,Student Name,Department,Status,Verified Check-in Time\n']
    const rows = registrations.map(
      (r) => `${r.id},"${r.eventTitle}",${r.rollNumber},"${r.studentName}","${r.department}",${r.status},${r.checkInTime || 'N/A'}\n`
    )
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'EventHub_Attendance_Audit_Log.csv')
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
          Module 08 Analytics & Reports
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
            Event analytical reports
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-sans">
            Review participation turnaround ratios and <Highlight>export paperless accreditation audits</Highlight>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ChaiButton
            variant="outline"
            size="sm"
            iconRight={<Download className="size-3.5" />}
            onClick={handleExportAuditCSV}
          >
            Attendance audit CSV
          </ChaiButton>

          <ChaiButton
            variant="solid"
            size="sm"
            iconRight={<Download className="size-3.5" />}
            onClick={handleExportSummaryCSV}
          >
            Master summary CSV
          </ChaiButton>
        </div>
      </div>

      {/* Key Analytical Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-chai p-4 space-y-1">
          <p className="font-mono text-xs uppercase text-muted-foreground">Total Enrolments</p>
          <div className="font-montserrat text-2xl sm:text-3xl font-bold text-foreground">
            {totalRegistrations}
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">Students across all departments</p>
        </div>

        <div className="card-chai p-4 space-y-1">
          <p className="font-mono text-xs uppercase text-muted-foreground">Verified Turnout</p>
          <div className="font-montserrat text-2xl sm:text-3xl font-bold text-foreground">
            {totalAttended}
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">Live venue check-ins recorded</p>
        </div>

        <div className="card-chai p-4 space-y-1">
          <p className="font-mono text-xs uppercase text-muted-foreground">Digital Credentials</p>
          <div className="font-montserrat text-2xl sm:text-3xl font-bold text-foreground">
            {totalCertificates}
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">Automated certificates granted</p>
        </div>

        <div className="card-chai p-4 space-y-1">
          <p className="font-mono text-xs uppercase text-muted-foreground">Paper Savings</p>
          <div className="font-montserrat text-2xl sm:text-3xl font-bold text-emerald-500">
            100%
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">Zero physical sign-up sheets</p>
        </div>
      </div>

      {/* Department Breakdown & Category Turnout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Participation Breakdown */}
        <div className="card-chai p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-montserrat text-sm font-semibold text-foreground">
              Department participation distribution
            </h3>
            <span className="font-mono text-xs text-muted-foreground">BY ROSTER</span>
          </div>

          <div className="space-y-3 font-sans text-xs">
            {Object.entries(departmentCounts).map(([dept, count]) => {
              const share = totalRegistrations > 0 ? Math.round((count / totalRegistrations) * 100) : 0
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span className="truncate">{dept}</span>
                    <span className="font-mono text-foreground">{count} ({share}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-neutral-600 dark:bg-neutral-300"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Performance Matrix */}
        <div className="card-chai p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-montserrat text-sm font-semibold text-foreground">
              Event category performance
            </h3>
            <span className="font-mono text-xs text-muted-foreground">CAPACITY RATIO</span>
          </div>

          <div className="space-y-3 font-sans text-xs">
            {['Technical', 'Cultural', 'Sports', 'Hackathon', 'Workshop'].map((cat) => {
              const catEvents = events.filter((e) => e.category === cat)
              const catCap = catEvents.reduce((acc, e) => acc + e.capacity, 0)
              const catReg = catEvents.reduce((acc, e) => acc + e.registeredCount, 0)
              const fillRate = catCap > 0 ? Math.min(100, Math.round((catReg / catCap) * 100)) : 0

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{cat} ({catEvents.length} events)</span>
                    <span className="font-mono text-foreground">{catReg} / {catCap} ({fillRate}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-neutral-600 dark:bg-neutral-300"
                      style={{ width: `${fillRate}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Analytical Event Summary Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-montserrat text-sm font-semibold text-foreground">
            Campus event audit table
          </h3>
          <button
            onClick={() => window.print()}
            className="text-xs text-muted-foreground hover:text-foreground font-mono inline-flex items-center gap-1"
          >
            <Printer className="size-3" /> Print report view
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-border text-[11px] font-mono uppercase text-muted-foreground">
              <tr>
                <th className="p-3 pl-4">Event title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Date</th>
                <th className="p-3">Enrolled</th>
                <th className="p-3">Capacity</th>
                <th className="p-3 pr-4 text-right">Turnout status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-neutral-100/30 dark:hover:bg-neutral-900/30">
                  <td className="p-3 pl-4 font-medium text-foreground">
                    {evt.title}
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border border-border">
                      {evt.category}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground font-mono text-[11px]">
                    {evt.date}
                  </td>
                  <td className="p-3 font-mono font-medium text-foreground">
                    {evt.registeredCount}
                  </td>
                  <td className="p-3 font-mono text-muted-foreground">
                    {evt.capacity}
                  </td>
                  <td className="p-3 pr-4 text-right font-mono">
                    <span className={evt.status === 'completed' ? 'text-emerald-500' : 'text-neutral-400'}>
                      {evt.status === 'completed' ? 'Archived (100% Verified)' : 'Live Enrolment'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
