import React, { useState } from 'react'
import { Bell, Send, CheckCircle, ArrowLeft, Megaphone, Users, History } from 'lucide-react'
import { CollegeEvent, NotificationItem } from '../types'
import { ChaiButton } from '../components/ChaiButton'
import { Highlight } from '../components/Highlight'

export interface BroadcastNoticePageProps {
  events: CollegeEvent[]
  onBroadcastCreated: (notice: any) => Promise<void> | void
  notifications: NotificationItem[]
  onNavigate: (view: string) => void
}

export const BroadcastNoticePage: React.FC<BroadcastNoticePageProps> = ({
  events,
  onBroadcastCreated,
  notifications,
  onNavigate,
}) => {
  const [targetEventId, setTargetEventId] = useState<string>('all')
  const [category, setCategory] = useState<'announcement' | 'venue' | 'schedule'>('venue')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const selectedEvent = events.find((e) => e.id === targetEventId)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return

    setErrorMsg(null)
    setSubmitting(true)
    try {
      await onBroadcastCreated({
        targetEventId: targetEventId === 'all' ? null : targetEventId,
        title: title.trim(),
        message: message.trim(),
        category,
        eventTitle: targetEventId === 'all' ? 'All Campus Events' : selectedEvent?.title,
      })
      setSentSuccess(true)
      setTitle('')
      setMessage('')
      setTimeout(() => setSentSuccess(false), 3500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch broadcast notice.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('organizer-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono"
        >
          <ArrowLeft className="size-3.5" /> Back to dashboard
        </button>

        <span className="font-mono text-xs text-muted-foreground uppercase">
          Module 05 Campus Broadcast Engine
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
          Broadcast event notification
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-sans">
          Send instant push alerts to registered students for <Highlight>venue alterations and schedule updates</Highlight>.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-500 text-xs flex items-center gap-2">
          <span>{errorMsg}</span>
        </div>
      )}

      {sentSuccess && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="size-4 shrink-0" />
          <span>Broadcast successfully delivered to registered student portals and notification trays!</span>
        </div>
      )}

      {/* Broadcast Compose Form */}
      <form onSubmit={handleSend} className="card-chai p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Megaphone className="size-4 text-muted-foreground" />
          <h3 className="font-montserrat text-sm font-semibold text-foreground">
            Compose broadcast notice
          </h3>
        </div>

        <div className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="target-audience" className="block font-mono uppercase text-muted-foreground text-[10px] mb-1.5">
                Target audience
              </label>
              <select
                id="target-audience"
                value={targetEventId}
                onChange={(e) => setTargetEventId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none"
              >
                <option value="all">All campus registered students</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.registeredCount} enrolled)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notice-category" className="block font-mono uppercase text-muted-foreground text-[10px] mb-1.5">
                Notice classification
              </label>
              <select
                id="notice-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none"
              >
                <option value="venue">Venue shift / relocation alert</option>
                <option value="schedule">Timetable / schedule alteration</option>
                <option value="announcement">General important announcement</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="notice-title" className="block font-mono uppercase text-muted-foreground text-[10px] mb-1.5">
              Subject line *
            </label>
            <input
              id="notice-title"
              type="text"
              required
              placeholder="e.g. Venue Shift: HackTech 2026 Reporting Hall Moved to Block C"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="notice-body" className="block font-mono uppercase text-muted-foreground text-[10px] mb-1.5">
              Notice content *
            </label>
            <textarea
              id="notice-body"
              rows={4}
              required
              placeholder="Specify the exact instructions, room numbers, reporting time changes, or items to bring..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-[11px] text-muted-foreground font-sans">
            Recipients will instantly receive this badge alert in their student trays.
          </p>

          <ChaiButton
            type="submit"
            variant="solid"
            size="md"
            iconRight={submitting ? null : <Send className="size-3.5 ml-1" />}
            disabled={submitting}
          >
            {submitting ? 'Dispatching notice...' : 'Send broadcast now'}
          </ChaiButton>
        </div>
      </form>

      {/* Broadcast History Log */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          <h3 className="font-montserrat text-sm font-semibold text-foreground">
            Recent broadcast dispatch logs
          </h3>
        </div>

        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="card-chai p-8 text-center text-xs text-muted-foreground">
              <Megaphone className="size-6 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold text-foreground text-sm">No broadcasts dispatched yet</p>
              <p className="text-xs text-muted-foreground mt-1">Announcements, venue shifts, or schedule updates sent using the form above will be logged here.</p>
            </div>
          ) : (
            notifications.slice(0, 4).map((n) => (
              <div
                key={n.id}
                className="card-chai p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                      {n.category}
                    </span>
                    <span className="font-semibold text-foreground">{n.title}</span>
                  </div>
                  <p className="text-muted-foreground text-xs line-clamp-1">{n.message}</p>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground shrink-0">
                  <span>{n.timestamp}</span>
                  <span className="text-emerald-500">Delivered</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
