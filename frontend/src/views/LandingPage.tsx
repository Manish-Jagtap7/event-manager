import React from 'react'
import { Calendar, CheckCircle2, Shield, QrCode, ArrowUpRight, Award, Bell, Clock, Users, MapPin } from 'lucide-react'
import { AnimatedBadge } from '../components/AnimatedBadge'
import { Highlight } from '../components/Highlight'
import { ChaiButton } from '../components/ChaiButton'
import { StatusChip } from '../components/StatusChip'
import { CollegeEvent } from '../types'

export interface LandingPageProps {
  events: CollegeEvent[]
  onExploreEvents: () => void
  onOpenDetails: (event: CollegeEvent) => void
  onNavigate: (view: string) => void
}

export const LandingPage: React.FC<LandingPageProps> = ({
  events,
  onExploreEvents,
  onOpenDetails,
  onNavigate,
}) => {
  const featuredEvents = events.slice(0, 3)

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* Hero Section (One central element) */}
      <section className="pt-8 sm:pt-16 pb-6">
        <div className="flex flex-col items-start gap-4 max-w-3xl">
          <AnimatedBadge>
            Trusted campus platform: 1,800+ student registrations
          </AnimatedBadge>

          <h1 className="text-[42px] sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.08] text-foreground">
            Centralized college event management
          </h1>

          <p className="mt-2 text-base text-neutral-600 sm:text-xl dark:text-neutral-400 leading-relaxed font-sans">
            Replace tedious paperwork with <Highlight>one-click paperless event registration</Highlight> and automated campus workflows.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ChaiButton
              variant="solid"
              size="lg"
              onClick={onExploreEvents}
            >
              Explore upcoming events
            </ChaiButton>

            <ChaiButton
              variant="outline"
              size="lg"
              iconRight={null}
              onClick={() => onNavigate('organizer-dashboard')}
            >
              Organizer portal
            </ChaiButton>
          </div>
        </div>
      </section>

      {/* Campus Statistics Strip */}
      <section className="py-6 border-y border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="font-montserrat text-3xl sm:text-4xl font-bold text-foreground">48+</div>
            <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider">Campus events held</p>
          </div>
          <div className="space-y-1">
            <div className="font-montserrat text-3xl sm:text-4xl font-bold text-foreground">2,400+</div>
            <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider">Registered participants</p>
          </div>
          <div className="space-y-1">
            <div className="font-montserrat text-3xl sm:text-4xl font-bold text-foreground">99.4%</div>
            <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider">Check-in efficiency</p>
          </div>
          <div className="space-y-1">
            <div className="font-montserrat text-3xl sm:text-4xl font-bold text-foreground">1,600+</div>
            <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider">E-certificates issued</p>
          </div>
        </div>
      </section>

      {/* Featured Upcoming Events Showcase */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-[30px] font-medium text-foreground">
              Featured campus activities
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Participate in <Highlight>inter-department competitions and hackathons</Highlight> across college.
            </p>
          </div>

          <button
            onClick={onExploreEvents}
            className="inline-flex items-center gap-1.5 text-xs font-montserrat font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse all events <ArrowUpRight className="size-3.5" />
          </button>
        </div>

        {featuredEvents.length === 0 ? (
          <div className="card-chai p-12 text-center space-y-3">
            <Calendar className="size-8 mx-auto text-muted-foreground" />
            <p className="font-montserrat text-base font-semibold text-foreground">
              No campus events published yet
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Event coordinators can register as an organizer to schedule upcoming hackathons, workshops, and competitions.
            </p>
            <div className="pt-2">
              <ChaiButton
                variant="outline"
                size="sm"
                iconRight={null}
                onClick={() => onNavigate('organizer-dashboard')}
              >
                Go to organizer portal
              </ChaiButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((evt) => (
              <article
                key={evt.id}
                className="card-chai group flex flex-col overflow-hidden sm:opacity-95 sm:hover:opacity-100"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded border border-white/20 bg-black/60 text-white backdrop-blur-sm">
                      {evt.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusChip status={evt.status} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-montserrat text-base font-semibold text-foreground line-clamp-1">
                    {evt.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="mt-3 space-y-1.5 text-xs text-neutral-400 font-sans">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="size-3.5 shrink-0" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {evt.registeredCount} / {evt.capacity} slots
                    </span>

                    <ChaiButton
                      variant="soft"
                      size="sm"
                      iconRight={null}
                      onClick={() => onOpenDetails(evt)}
                    >
                      View details
                    </ChaiButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Core Challenges Solved (from Documentation) */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-[30px] font-medium text-foreground">
            Built to eliminate paper challenges
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Engineered to replace <Highlight>scattered spreadsheets and physical forms</Highlight> with complete automation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-chai p-5 space-y-3">
            <div className="size-9 rounded-lg border border-border flex items-center justify-center text-foreground">
              <CheckCircle2 className="size-5" />
            </div>
            <h3 className="font-montserrat text-sm font-semibold text-foreground">
              One-click registration
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Instant registration using pre-verified student roll numbers. No repetitive manual paper forms.
            </p>
          </div>

          <div className="card-chai p-5 space-y-3">
            <div className="size-9 rounded-lg border border-border flex items-center justify-center text-foreground">
              <QrCode className="size-5" />
            </div>
            <h3 className="font-montserrat text-sm font-semibold text-foreground">
              Live venue check-in
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Organizers verify arrivals at the door in real time. Eliminates proxy attendance and manual sign-in sheets.
            </p>
          </div>

          <div className="card-chai p-5 space-y-3">
            <div className="size-9 rounded-lg border border-border flex items-center justify-center text-foreground">
              <Bell className="size-5" />
            </div>
            <h3 className="font-montserrat text-sm font-semibold text-foreground">
              Instant notifications
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Broadcast critical venue shifts and schedule alterations straight to registered attendees.
            </p>
          </div>

          <div className="card-chai p-5 space-y-3">
            <div className="size-9 rounded-lg border border-border flex items-center justify-center text-foreground">
              <Award className="size-5" />
            </div>
            <h3 className="font-montserrat text-sm font-semibold text-foreground">
              Verified e-certificates
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Automated certificate generation following verified check-in. One click digital credential download.
            </p>
          </div>
        </div>
      </section>

      {/* System Pathway Flow (from Documentation Section 6) */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-[30px] font-medium text-foreground">
            End-to-end integration workflow
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Connect students and event hosts through a <Highlight>unified college operations pipeline</Highlight>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Pathway Card */}
          <div className="card-chai p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase px-2 py-0.5 rounded border border-border">
                  Module 01 - 03
                </span>
                <h3 className="font-montserrat text-base font-semibold text-foreground">
                  Student experience
                </h3>
              </div>
              <button
                onClick={() => onNavigate('student-dashboard')}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono"
              >
                Launch portal <ArrowUpRight className="size-3" />
              </button>
            </div>

            <ol className="space-y-3 text-xs font-sans">
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[10px] text-muted-foreground">
                  1
                </span>
                <span className="text-muted-foreground">
                  Log in with verified college credentials and roll number.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[10px] text-muted-foreground">
                  2
                </span>
                <span className="text-muted-foreground">
                  Browse categorized events (Technical, Cultural, Sports, Hackathons).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[10px] text-muted-foreground">
                  3
                </span>
                <span className="text-muted-foreground">
                  Enroll with 1-click registration and receive digital pass.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[10px] text-muted-foreground">
                  4
                </span>
                <span className="text-muted-foreground">
                  Mark attendance at the venue and instantly download verified e-certificate.
                </span>
              </li>
            </ol>
          </div>

          {/* Organizer Pathway Card */}
          <div className="card-chai p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase px-2 py-0.5 rounded border border-border">
                  Module 04 - 06
                </span>
                <h3 className="font-montserrat text-base font-semibold text-foreground">
                  Organizer control lifecycle
                </h3>
              </div>
              <button
                onClick={() => onNavigate('organizer-dashboard')}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono"
              >
                Launch portal <ArrowUpRight className="size-3" />
              </button>
            </div>

            <ol className="space-y-3 text-xs font-sans">
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[10px] text-muted-foreground">
                  1
                </span>
                <span className="text-muted-foreground">
                  Create and publish events with schedules, venues, and capacity limits.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[10px] text-muted-foreground">
                  2
                </span>
                <span className="text-muted-foreground">
                  Track real-time participant roster and approve pending applications.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[10px] text-muted-foreground">
                  3
                </span>
                <span className="text-muted-foreground">
                  Execute live venue check-in verification with instant attendee lookup.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[10px] text-muted-foreground">
                  4
                </span>
                <span className="text-muted-foreground">
                  Broadcast notices, unlock certificates, and export analytical CSV reports.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}
