import React, { useState } from 'react'
import { Calendar, MapPin, Clock, Trash2, QrCode, Award, ArrowUpRight } from 'lucide-react'
import { Registration } from '../types'
import { ChaiButton } from '../components/ChaiButton'
import { StatusChip } from '../components/StatusChip'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Highlight } from '../components/Highlight'

export interface MyRegistrationsPageProps {
  registrations: Registration[]
  onCancelRegistration: (regId: string) => void
  onNavigate: (view: string) => void
}

export const MyRegistrationsPage: React.FC<MyRegistrationsPageProps> = ({
  registrations,
  onCancelRegistration,
  onNavigate,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const filteredRegistrations = registrations.filter((reg) => {
    if (activeFilter === 'all') return true
    return reg.status === activeFilter
  })

  const targetReg = registrations.find((r) => r.id === cancellingId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
            My event registrations
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-sans">
            Track enrollment approval status and <Highlight>venue check-in milestones</Highlight> in one place.
          </p>
        </div>

        <ChaiButton
          variant="solid"
          size="sm"
          onClick={() => onNavigate('events')}
        >
          Enroll in new event
        </ChaiButton>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-lg border border-border bg-neutral-100/50 dark:bg-black/40 text-xs">
        {['all', 'approved', 'pending', 'attended', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 rounded-md font-montserrat uppercase text-[11px] font-medium transition-colors ${
              activeFilter === tab
                ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Registrations List */}
      {filteredRegistrations.length === 0 ? (
        <div className="card-chai p-12 text-center space-y-3">
          <p className="font-montserrat text-base font-semibold text-foreground">
            No registrations found in this category
          </p>
          <p className="text-xs text-muted-foreground">
            Explore the events directory to join upcoming competitions or workshops.
          </p>
          <ChaiButton
            variant="outline"
            size="sm"
            iconRight={null}
            onClick={() => onNavigate('events')}
          >
            Browse all events
          </ChaiButton>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRegistrations.map((reg) => (
            <div
              key={reg.id}
              className="card-chai p-5 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded border border-border text-muted-foreground">
                    {reg.eventCategory}
                  </span>
                  <StatusChip status={reg.status} />
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Reg #{reg.id}
                  </span>
                </div>

                <h3 className="font-montserrat text-base sm:text-lg font-bold text-foreground">
                  {reg.eventTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    <span>{reg.eventDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    <span>{reg.eventTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    <span>{reg.eventVenue}</span>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground font-sans pt-1">
                  Enrolled on <span className="font-mono">{reg.registeredAt}</span> for Student ID <span className="font-mono">{reg.rollNumber}</span>
                  {reg.checkInTime && (
                    <span className="text-emerald-500 font-mono ml-2">
                      · Checked in at {reg.checkInTime}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Right */}
              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                {reg.status === 'attended' && (
                  <ChaiButton
                    variant="soft"
                    size="sm"
                    iconRight={<Award className="size-3.5 ml-1" />}
                    onClick={() => onNavigate('certificates')}
                  >
                    View certificate
                  </ChaiButton>
                )}

                {reg.status === 'approved' && (
                  <ChaiButton
                    variant="soft"
                    size="sm"
                    iconRight={<QrCode className="size-3.5 ml-1" />}
                    onClick={() => onNavigate('student-pass')}
                  >
                    Check-in pass
                  </ChaiButton>
                )}

                {reg.status !== 'cancelled' && reg.status !== 'attended' && (
                  <ChaiButton
                    variant="ghost"
                    size="sm"
                    iconRight={null}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => setCancellingId(reg.id)}
                  >
                    <Trash2 className="size-3.5 mr-1" />
                    Cancel
                  </ChaiButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      <ConfirmDialog
        open={cancellingId !== null}
        title="Cancel event registration?"
        description={`Are you sure you want to cancel your slot for "${targetReg?.eventTitle}"? Your registration slot will be made available for waitlisted students.`}
        confirmLabel="Yes, cancel enrolment"
        cancelLabel="Keep my slot"
        tone="danger"
        onConfirm={() => {
          if (cancellingId) {
            onCancelRegistration(cancellingId)
            setCancellingId(null)
          }
        }}
        onCancel={() => setCancellingId(null)}
      />
    </div>
  )
}
