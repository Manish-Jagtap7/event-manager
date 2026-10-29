import React, { useState, useRef } from 'react'
import { Plus, Trash2, Calendar, MapPin, Users, CheckCircle, ArrowLeft, AlertTriangle, Upload, X, Image as ImageIcon } from 'lucide-react'
import { CollegeEvent, EventCategory } from '../types'
import { ChaiButton } from '../components/ChaiButton'
import { Highlight } from '../components/Highlight'
import { ConfirmDialog } from '../components/ConfirmDialog'

export interface CreateEventPageProps {
  onEventCreated: (event: CollegeEvent) => void
  onEventUpdated?: (event: CollegeEvent) => void
  onDeleteEvent?: (eventId: string) => void
  editingEvent?: CollegeEvent | null
  onNavigate: (view: string) => void
}

export const CreateEventPage: React.FC<CreateEventPageProps> = ({
  onEventCreated,
  onEventUpdated,
  onDeleteEvent,
  editingEvent,
  onNavigate,
}) => {
  const isEditing = Boolean(editingEvent)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [title, setTitle] = useState(editingEvent ? editingEvent.title : '')
  const [description, setDescription] = useState(editingEvent ? editingEvent.description : '')
  const [category, setCategory] = useState<EventCategory>(editingEvent ? editingEvent.category : 'Technical')
  const [date, setDate] = useState(editingEvent ? editingEvent.date : 'Nov 15, 2026')
  const [time, setTime] = useState(editingEvent ? editingEvent.time : '10:00 AM - 04:00 PM')
  const [venue, setVenue] = useState(editingEvent ? editingEvent.venue : 'Main Seminar Hall, Academic Block')
  const [capacity, setCapacity] = useState(editingEvent ? String(editingEvent.capacity) : '100')
  const [registrationDeadline, setRegistrationDeadline] = useState(editingEvent ? editingEvent.registrationDeadline : 'Nov 12, 2026')
  const [image, setImage] = useState(editingEvent?.image || '')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [rules, setRules] = useState<string[]>(
    editingEvent && editingEvent.rules.length > 0
      ? editingEvent.rules
      : [
          'Valid student identity cards mandatory for entry verification.',
          'Participants must report at venue 30 minutes prior to event schedule.',
          'Digital attendance check-in required to receive participation certificate.',
        ]
  )
  const [newRule, setNewRule] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [successNotice, setSuccessNotice] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, etc.)')
      return
    }

    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string
      if (!result) return

      const img = new Image()
      img.onload = () => {
        const maxWidth = 1200
        const maxHeight = 675
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          setImage(canvas.toDataURL('image/jpeg', 0.85))
        } else {
          setImage(result)
        }
      }
      img.onerror = () => {
        setImage(result)
      }
      img.src = result
    }
    reader.readAsDataURL(file)
  }

  const handleAddRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()])
      setNewRule('')
    }
  }

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const eventPayload: CollegeEvent = {
      id: editingEvent ? editingEvent.id : `evt-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      description: description.trim() || 'Exciting campus event organized for students.',
      category,
      date,
      time,
      venue,
      organizer: editingEvent?.organizer || 'Campus Event Coordination Committee',
      organizerEmail: editingEvent?.organizerEmail || 'events@college.edu',
      capacity: parseInt(capacity) || 80,
      registeredCount: editingEvent ? editingEvent.registeredCount : 0,
      registrationDeadline,
      rules,
      eligibility: editingEvent?.eligibility || 'Open to all college students',
      teamSize: editingEvent?.teamSize || 'Individual / Team',
      status: 'upcoming',
      image: image.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      tags: editingEvent?.tags || [category, 'Campus2026'],
      isFeatured: editingEvent?.isFeatured,
    }

    if (isEditing && onEventUpdated) {
      onEventUpdated(eventPayload)
    } else {
      onEventCreated(eventPayload)
    }

    setSuccessNotice(true)
    setTimeout(() => {
      onNavigate('organizer-dashboard')
    }, 1200)
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('organizer-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono"
        >
          <ArrowLeft className="size-3.5" /> Back to organizer dashboard
        </button>

        <span className="font-mono text-xs text-muted-foreground uppercase">
          Module 02 Event Setup
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
          {isEditing ? 'Update event details' : 'Create and publish event'}
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-sans">
          {isEditing
            ? 'Modify schedules, guidelines, or venue parameters with instant campus synchronization.'
            : 'Setup schedules, capacity restrictions, rules, and instant campus registration availability.'}
        </p>
      </div>

      {successNotice && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="size-4 shrink-0" />
          <span>{isEditing ? 'Event details successfully updated. Redirecting...' : 'Event successfully created and published to campus catalogue. Redirecting...'}</span>
        </div>
      )}

      {/* Event Setup Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-chai p-6 space-y-5">
          <h3 className="font-montserrat text-sm font-semibold text-foreground">
            Core event information
          </h3>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <label htmlFor="evt-title" className="block font-mono uppercase text-muted-foreground text-[11px] mb-1.5">
                Event title *
              </label>
              <input
                id="evt-title"
                type="text"
                required
                placeholder="e.g. InnovateX: Annual Project Exhibition 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="evt-category" className="block font-mono uppercase text-muted-foreground text-[11px] mb-1.5">
                Category
              </label>
              <select
                id="evt-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>

            <div>
              <label htmlFor="evt-desc" className="block font-mono uppercase text-muted-foreground text-[11px] mb-1.5">
                Detailed description
              </label>
              <textarea
                id="evt-desc"
                rows={3}
                placeholder="Provide a comprehensive summary of the event activities and outcomes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Banner Image Upload */}
        <div className="card-chai p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-montserrat text-sm font-semibold text-foreground">
                Event banner image
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload a custom event poster or banner directly from your device with one click.
              </p>
            </div>
            {image && (
              <button
                type="button"
                onClick={() => setImage('')}
                className="text-xs text-red-500 hover:text-red-600 inline-flex items-center gap-1 font-mono cursor-pointer"
              >
                <X className="size-3" /> Remove image
              </button>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {image ? (
            <div className="relative rounded-lg overflow-hidden border border-border group bg-neutral-900/40">
              <img
                src={image}
                alt="Event banner preview"
                className="w-full h-48 sm:h-56 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-md bg-white text-black font-montserrat text-xs font-semibold hover:bg-neutral-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Upload className="size-3.5" /> Change image
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-neutral-500 rounded-lg p-8 text-center cursor-pointer transition-colors bg-neutral-900/20 hover:bg-neutral-900/40 group flex flex-col items-center justify-center gap-2"
            >
              <div className="p-3 rounded-full bg-neutral-800 text-muted-foreground group-hover:text-foreground group-hover:bg-neutral-700 transition-colors">
                <Upload className="size-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-montserrat font-medium text-foreground">
                  Click to upload banner image from your device
                </p>
                <p className="text-[11px] font-mono text-muted-foreground">
                  PNG, JPG, WEBP or GIF (automatically optimized for campus cards)
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
            <span>One-click device upload</span>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="hover:text-foreground underline underline-offset-2 cursor-pointer"
            >
              {showUrlInput ? 'Cancel URL entry' : 'Or enter image URL'}
            </button>
          </div>

          {showUrlInput && (
            <div className="flex gap-2 pt-2 border-t border-border">
              <input
                type="text"
                placeholder="https://example.com/banner.jpg"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none"
              />
              <ChaiButton
                type="button"
                variant="outline"
                size="sm"
                iconRight={null}
                onClick={() => {
                  if (imageUrlInput.trim()) {
                    setImage(imageUrlInput.trim())
                    setShowUrlInput(false)
                  }
                }}
              >
                Apply
              </ChaiButton>
            </div>
          )}
        </div>

        {/* Schedule & Venue Logistics */}
        <div className="card-chai p-6 space-y-5">
          <h3 className="font-montserrat text-sm font-semibold text-foreground">
            Schedule and venue logistics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <label htmlFor="evt-date" className="block font-mono uppercase text-muted-foreground text-[11px] mb-1.5">
                Event date
              </label>
              <input
                id="evt-date"
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="evt-time" className="block font-mono uppercase text-muted-foreground text-[11px] mb-1.5">
                Schedule window
              </label>
              <input
                id="evt-time"
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="evt-capacity" className="block font-mono uppercase text-muted-foreground text-[11px] mb-1.5">
                Attendee capacity
              </label>
              <input
                id="evt-capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="evt-venue" className="block font-mono uppercase text-muted-foreground text-[11px] mb-1.5">
                Venue location
              </label>
              <input
                id="evt-venue"
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="evt-deadline" className="block font-mono uppercase text-muted-foreground text-[11px] mb-1.5">
                Registration cutoff
              </label>
              <input
                id="evt-deadline"
                type="text"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Participation Rules & Guidelines */}
        <div className="card-chai p-6 space-y-4">
          <h3 className="font-montserrat text-sm font-semibold text-foreground">
            Rules and guidelines
          </h3>

          <div className="space-y-2">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2.5 rounded-md border border-border bg-neutral-100/30 dark:bg-neutral-900/30 text-xs"
              >
                <span className="text-muted-foreground">{rule}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Add another competition rule or entry guideline..."
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddRule()
                }
              }}
              className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none"
            />
            <ChaiButton
              type="button"
              variant="outline"
              size="sm"
              iconRight={null}
              onClick={handleAddRule}
            >
              Add rule
            </ChaiButton>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
          <div>
            {isEditing && onDeleteEvent && (
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-red-500/40 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-mono transition-colors cursor-pointer"
              >
                <Trash2 className="size-3.5" /> Delete event
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ChaiButton
              type="button"
              variant="outline"
              size="md"
              iconRight={null}
              onClick={() => onNavigate('organizer-dashboard')}
            >
              Cancel
            </ChaiButton>

            <ChaiButton
              type="submit"
              variant="solid"
              size="md"
            >
              {isEditing ? 'Save event changes' : 'Publish to campus portal'}
            </ChaiButton>
          </div>
        </div>
      </form>

      {/* Delete Event Confirmation Modal */}
      {isEditing && (
        <ConfirmDialog
          open={deleteConfirmOpen}
          title="Delete event permanently?"
          description={`Are you sure you want to delete "${title || 'this event'}"? All registrations, attendee check-in logs, and passes for this event will be permanently removed. This action cannot be undone.`}
          confirmLabel="Delete event"
          cancelLabel="Keep event"
          tone="danger"
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={() => {
            setDeleteConfirmOpen(false)
            if (editingEvent && onDeleteEvent) {
              onDeleteEvent(editingEvent.id)
            }
          }}
        />
      )}
    </div>
  )
}
