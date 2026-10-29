import React, { useState, useMemo } from 'react'
import { Search, Calendar, MapPin, Users, Filter, CheckCircle2 } from 'lucide-react'
import { CollegeEvent, EventCategory } from '../types'
import { ChaiButton } from '../components/ChaiButton'
import { StatusChip } from '../components/StatusChip'
import { Highlight } from '../components/Highlight'

export interface EventsDirectoryPageProps {
  events: CollegeEvent[]
  registeredEventIds: string[]
  onOpenDetails: (event: CollegeEvent) => void
  onQuickRegister: (event: CollegeEvent) => void
}

export const EventsDirectoryPage: React.FC<EventsDirectoryPageProps> = ({
  events,
  registeredEventIds,
  onOpenDetails,
  onQuickRegister,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  const categories: (EventCategory | 'All')[] = [
    'All',
    'Technical',
    'Cultural',
    'Sports',
    'Hackathon',
    'Workshop',
  ]

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesSearch =
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        selectedCategory === 'All' || evt.category === selectedCategory

      const matchesStatus =
        statusFilter === 'All' || evt.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [events, searchQuery, selectedCategory, statusFilter])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
          Campus events directory
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-sans">
          Discover competitions, technical hackathons, and cultural fests with <Highlight>paperless student self-registration</Highlight>.
        </p>
      </div>

      {/* Search and Category Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              aria-label="Search campus events"
              placeholder="Search by event title, organizer, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter by event status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="All">All statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* ChaiUI Segmented Category Selector */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-lg border border-border bg-neutral-100/50 dark:bg-black/40">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-montserrat font-medium transition-colors ${
                  isSelected
                    ? 'bg-orange-100 text-orange-950 dark:bg-orange-950/60 dark:text-orange-100 border border-orange-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between py-2 border-b border-border text-xs text-muted-foreground">
        <div>
          Showing <span className="font-semibold text-foreground font-mono">{filteredEvents.length}</span> events
        </div>
        <div className="font-sans">
          {selectedCategory !== 'All' ? `Filtered by ${selectedCategory}` : 'All categories'}
        </div>
      </div>

      {/* Grid of Event Cards */}
      {filteredEvents.length === 0 ? (
        <div className="card-chai p-12 text-center space-y-3">
          <Calendar className="size-8 mx-auto text-muted-foreground" />
          <p className="font-montserrat text-base font-semibold text-foreground">
            {events.length === 0
              ? 'No campus events scheduled yet'
              : 'No events found matching your filter'}
          </p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {events.length === 0
              ? 'When event organizers publish upcoming competitions, workshops, and hackathons, they will be listed here for student self-registration.'
              : 'Try adjusting your keywords or clearing selected category filters.'}
          </p>
          {events.length > 0 && (
            <ChaiButton
              variant="outline"
              size="sm"
              iconRight={null}
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
                setStatusFilter('All')
              }}
            >
              Reset all filters
            </ChaiButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const isRegistered = registeredEventIds.includes(evt.id)
            const spotsLeft = Math.max(0, evt.capacity - evt.registeredCount)

            return (
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

                  {/* Meta details */}
                  <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 shrink-0" />
                      <span>{evt.date} · {evt.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {evt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-border">
                    <div className="text-[11px] font-mono text-muted-foreground">
                      <span className="font-semibold text-foreground">{spotsLeft}</span> spots left
                    </div>

                    <div className="flex items-center gap-2">
                      <ChaiButton
                        variant="ghost"
                        size="sm"
                        iconRight={null}
                        onClick={() => onOpenDetails(evt)}
                      >
                        Details
                      </ChaiButton>

                      {isRegistered ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono border border-emerald-500/30 text-emerald-500">
                          <CheckCircle2 className="size-3.5" />
                          Joined
                        </div>
                      ) : (
                        <ChaiButton
                          variant="soft"
                          size="sm"
                          iconRight={null}
                          onClick={() => onQuickRegister(evt)}
                        >
                          Register
                        </ChaiButton>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
