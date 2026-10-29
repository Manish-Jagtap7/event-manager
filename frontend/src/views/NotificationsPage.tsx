import React, { useState } from 'react'
import { Bell, CheckCheck, MapPin, Calendar, Award, Megaphone } from 'lucide-react'
import { NotificationItem } from '../types'
import { ChaiButton } from '../components/ChaiButton'
import { Highlight } from '../components/Highlight'

export interface NotificationsPageProps {
  notifications: NotificationItem[]
  onMarkAllAsRead: () => void
  onToggleRead: (id: string) => void
  onClearNotifications: () => void
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  onMarkAllAsRead,
  onToggleRead,
  onClearNotifications,
}) => {
  const [filter, setFilter] = useState<string>('all')

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    return n.category === filter
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'venue':
        return <MapPin className="size-4 text-amber-500" />
      case 'schedule':
        return <Calendar className="size-4 text-blue-500" />
      case 'certificate':
        return <Award className="size-4 text-emerald-500" />
      default:
        return <Megaphone className="size-4 text-neutral-400" />
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
            Campus event alerts
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-sans">
            Stay updated on venue shifts, timetable changes, and <Highlight>unlocked digital certificate announcements</Highlight>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ChaiButton
            variant="outline"
            size="sm"
            iconRight={<CheckCheck className="size-3.5" />}
            onClick={onMarkAllAsRead}
          >
            Mark all read
          </ChaiButton>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-lg border border-border bg-neutral-100/50 dark:bg-black/40 text-xs">
        {['all', 'unread', 'venue', 'schedule', 'certificate', 'announcement'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-md font-montserrat uppercase text-[11px] font-medium transition-colors ${
              filter === tab
                ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      {filteredNotifications.length === 0 ? (
        <div className="card-chai p-12 text-center space-y-3">
          <Bell className="size-8 mx-auto text-muted-foreground" />
          <p className="font-montserrat text-base font-semibold text-foreground">
            No notifications in this feed
          </p>
          <p className="text-xs text-muted-foreground">
            You are all caught up with event announcements and schedule alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onToggleRead(notif.id)}
              className={`card-chai p-4 sm:p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                !notif.read ? 'border-amber-500/40 bg-neutral-100/40 dark:bg-neutral-900/40' : ''
              }`}
            >
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                {getCategoryIcon(notif.category)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                      {notif.category}
                    </span>
                    {notif.eventTitle && (
                      <span className="text-xs font-medium text-foreground">
                        {notif.eventTitle}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {notif.timestamp}
                  </span>
                </div>

                <h3 className="font-montserrat text-sm font-semibold text-foreground">
                  {notif.title}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  {notif.message}
                </p>
              </div>

              {!notif.read && (
                <span className="size-2 rounded-full bg-amber-500 shrink-0 mt-2" title="Unread alert" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
