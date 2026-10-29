import React from 'react'
import { X, Calendar, Clock, MapPin, Users, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react'
import { CollegeEvent } from '../types'
import { ChaiButton } from './ChaiButton'
import { StatusChip } from './StatusChip'

export interface EventDetailModalProps {
  event: CollegeEvent | null
  isRegistered: boolean
  onClose: () => void
  onRegister: (event: CollegeEvent) => void
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isRegistered,
  onClose,
  onRegister,
}) => {
  if (!event) return null

  const spotsLeft = Math.max(0, event.capacity - event.registeredCount)
  const isFull = spotsLeft === 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-card p-6 text-foreground relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-4 right-4 z-20 rounded-full p-2 bg-black/60 text-white hover:bg-black/80 transition-colors shadow-md backdrop-blur-sm cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Header Image */}
        <div className="relative -mx-6 -mt-6 mb-6 h-52 overflow-hidden rounded-t-2xl">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-3 left-6 right-6 flex items-end justify-between">
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded border border-white/20 bg-black/40 text-neutral-200">
              {event.category}
            </span>
            <StatusChip status={event.status} />
          </div>
        </div>

        {/* Title & Organizer */}
        <div className="space-y-1">
          <h2 id="event-modal-title" className="font-montserrat text-xl sm:text-2xl font-bold text-foreground">
            {event.title}
          </h2>
          <p className="text-xs text-muted-foreground font-sans">
            Hosted by <span className="font-medium text-foreground">{event.organizer}</span>
          </p>
        </div>

        {/* Quick Details Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 py-4 border-y border-border text-xs">
          <div className="flex items-start gap-2">
            <Calendar className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-mono text-[11px] text-muted-foreground uppercase">Date</p>
              <p className="font-medium text-foreground">{event.date}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-mono text-[11px] text-muted-foreground uppercase">Schedule</p>
              <p className="font-medium text-foreground">{event.time}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-mono text-[11px] text-muted-foreground uppercase">Venue</p>
              <p className="font-medium text-foreground">{event.venue}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-mono text-[11px] text-muted-foreground uppercase">Slots</p>
              <p className="font-medium text-foreground">
                {event.registeredCount} / {event.capacity}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4 text-sm font-sans">
          <div>
            <h4 className="font-montserrat text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
              Event Overview
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Rules & Guidelines */}
          {event.rules && event.rules.length > 0 && (
            <div>
              <h4 className="font-montserrat text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Rules and Guidelines
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                {event.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          )}


          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="size-3.5" />
            <span>Questions: {event.organizerEmail}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-muted-foreground">Registration deadline: </span>
            <span className="font-medium text-foreground">{event.registrationDeadline}</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ChaiButton variant="outline" size="sm" iconRight={null} onClick={onClose}>
              Close
            </ChaiButton>

            {isRegistered ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-500/30 text-emerald-500 text-xs font-medium">
                <CheckCircle2 className="size-4" />
                Registered
              </div>
            ) : isFull ? (
              <ChaiButton variant="soft" size="sm" disabled>
                Registration full
              </ChaiButton>
            ) : (
              <ChaiButton
                variant="solid"
                size="sm"
                onClick={() => onRegister(event)}
              >
                1-click register
              </ChaiButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
