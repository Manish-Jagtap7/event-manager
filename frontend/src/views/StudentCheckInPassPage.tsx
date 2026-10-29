import React, { useState } from 'react'
import { QrCode, Calendar, Clock, MapPin, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Registration, User } from '../types'
import { ChaiButton } from '../components/ChaiButton'
import { StatusChip } from '../components/StatusChip'
import { Highlight } from '../components/Highlight'

export interface StudentCheckInPassPageProps {
  user: User
  registrations: Registration[]
  onNavigate: (view: string) => void
}

export const StudentCheckInPassPage: React.FC<StudentCheckInPassPageProps> = ({
  user,
  registrations,
  onNavigate,
}) => {
  const activeRegistrations = registrations.filter((r) => r.status !== 'cancelled')
  const [selectedRegId, setSelectedRegId] = useState<string>(
    activeRegistrations[0]?.id || ''
  )

  const currentReg = activeRegistrations.find((r) => r.id === selectedRegId) || activeRegistrations[0]

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
          Digital venue entry pass
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
          Present this verified pass at the entrance to <Highlight>complete instant live attendance check-in</Highlight>.
        </p>
      </div>

      {/* Event Selector if student has multiple events */}
      {activeRegistrations.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground font-mono uppercase">Select pass:</span>
          <select
            aria-label="Select registered event pass"
            value={selectedRegId}
            onChange={(e) => setSelectedRegId(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none"
          >
            {activeRegistrations.map((r) => (
              <option key={r.id} value={r.id}>
                {r.eventTitle} ({r.eventDate})
              </option>
            ))}
          </select>
        </div>
      )}

      {!currentReg ? (
        <div className="card-chai p-12 text-center space-y-3">
          <p className="font-montserrat text-base font-semibold text-foreground">No active registration found</p>
          <p className="text-xs text-muted-foreground">Register for an event to generate your digital check-in pass.</p>
          <ChaiButton
            variant="solid"
            size="sm"
            onClick={() => onNavigate('events')}
          >
            Find upcoming events
          </ChaiButton>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Official Pass Card */}
          <div className="rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-card p-6 sm:p-8 space-y-6 text-foreground relative overflow-hidden">
            {/* Top Security Stripe */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md border border-border bg-neutral-100 dark:bg-neutral-900 text-foreground">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <h3 className="font-brand text-sm font-semibold text-foreground">
                    EventHub College Pass
                  </h3>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    AUTHENTICATED CAMPUS CREDENTIAL
                  </p>
                </div>
              </div>

              <StatusChip status={currentReg.status} />
            </div>

            {/* Event Specifics */}
            <div>
              <span className="font-mono text-xs uppercase px-2 py-0.5 rounded border border-border text-muted-foreground">
                {currentReg.eventCategory}
              </span>
              <h2 className="mt-2 font-montserrat text-xl sm:text-2xl font-bold text-foreground">
                {currentReg.eventTitle}
              </h2>
            </div>

            {/* Schedule & Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border bg-neutral-100/40 dark:bg-neutral-900/40 text-xs">
              <div className="space-y-1">
                <p className="font-mono uppercase text-muted-foreground text-[10px]">Date</p>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Calendar className="size-3.5" />
                  <span>{currentReg.eventDate}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-mono uppercase text-muted-foreground text-[10px]">Reporting Time</p>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Clock className="size-3.5" />
                  <span>{currentReg.eventTime}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-mono uppercase text-muted-foreground text-[10px]">Venue Location</p>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <MapPin className="size-3.5" />
                  <span className="truncate">{currentReg.eventVenue}</span>
                </div>
              </div>
            </div>

            {/* Student Identification & QR Verification Grid */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-border">
              <div className="space-y-2 text-center sm:text-left">
                <div>
                  <p className="font-mono uppercase text-[10px] text-muted-foreground">Attendee Name</p>
                  <p className="font-montserrat text-base font-bold text-foreground">{user.name}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-mono text-muted-foreground">
                  <span>ID: <strong className="text-foreground">{user.rollNumber}</strong></span>
                  <span>Dept: <strong className="text-foreground">{user.department}</strong></span>
                </div>
                <p className="text-[11px] text-neutral-500 font-sans">
                  Registration Code: <span className="font-mono text-foreground">{currentReg.id}</span>
                </p>
              </div>

              {/* Dynamic QR Mock Card */}
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-white text-black text-center shrink-0">
                <QrCode className="size-28" />
                <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-600 font-bold">
                  {currentReg.rollNumber}·{currentReg.id}
                </span>
              </div>
            </div>

            {/* Verification Status Notice */}
            <div className="pt-2 text-center text-xs text-muted-foreground font-sans">
              {currentReg.status === 'attended' ? (
                <span className="text-emerald-500 font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> Verified attendee. Check-in completed.
                </span>
              ) : (
                <span>Scan at gate entrance desk for instant roster check-in verification.</span>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-center gap-3">
            <ChaiButton
              variant="outline"
              size="sm"
              iconRight={<Printer className="size-3.5" />}
              onClick={() => window.print()}
            >
              Print pass
            </ChaiButton>

            <ChaiButton
              variant="soft"
              size="sm"
              iconRight={null}
              onClick={() => onNavigate('my-registrations')}
            >
              Back to registrations
            </ChaiButton>
          </div>
        </div>
      )}
    </div>
  )
}
