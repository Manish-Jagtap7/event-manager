import { Router } from 'express'
import { db } from '../db/database.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

export const eventsRouter = Router()

function formatEventRow(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    date: row.date,
    time: row.time,
    venue: row.venue,
    organizer: row.organizer_name,
    organizerEmail: row.organizer_email,
    organizerId: row.organizer_id,
    capacity: row.capacity,
    registeredCount: row.registered_count,
    registrationDeadline: row.registration_deadline,
    rules: row.rules ? JSON.parse(row.rules) : [],
    eligibility: row.eligibility,
    teamSize: row.team_size,
    status: row.status,
    image: row.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    tags: row.tags ? JSON.parse(row.tags) : [],
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at,
  }
}

// GET all events with optional filters
eventsRouter.get('/', (req, res) => {
  try {
    const { category, search, status } = req.query
    let query = 'SELECT * FROM events WHERE 1=1'
    const params = []

    if (category && category !== 'All') {
      query += ' AND category = ?'
      params.push(category)
    }

    if (status && status !== 'All') {
      query += ' AND status = ?'
      params.push(status)
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR venue LIKE ? OR organizer_name LIKE ?)'
      const term = `%${search}%`
      params.push(term, term, term, term)
    }

    query += ' ORDER BY created_at DESC'

    const stmt = db.prepare(query)
    const rows = stmt.all(...params)
    const events = rows.map(formatEventRow)
    res.json({ events })
  } catch (error) {
    console.error('Fetch events error:', error)
    res.status(500).json({ error: 'Failed to retrieve events.' })
  }
})

// GET single event by id
eventsRouter.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM events WHERE id = ?')
    const row = stmt.get(req.params.id)
    if (!row) {
      return res.status(404).json({ error: 'Event not found.' })
    }
    res.json({ event: formatEventRow(row) })
  } catch (error) {
    console.error('Fetch event error:', error)
    res.status(500).json({ error: 'Failed to retrieve event details.' })
  }
})

// POST create new event (Organizer only)
eventsRouter.post('/', requireRole('organizer'), (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      venue,
      capacity,
      registrationDeadline,
      rules,
      eligibility,
      teamSize,
      image,
      tags,
      status,
    } = req.body

    if (!title || !category || !date || !time || !venue) {
      return res.status(400).json({ error: 'Title, category, date, time, and venue are required.' })
    }

    const eventId = `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
    const insertStmt = db.prepare(`
      INSERT INTO events (
        id, title, description, category, date, time, venue,
        organizer_id, organizer_name, organizer_email, capacity,
        registered_count, registration_deadline, rules, eligibility,
        team_size, status, image, tags, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insertStmt.run(
      eventId,
      title.trim(),
      description ? description.trim() : 'Campus event organized for students.',
      category,
      date.trim(),
      time.trim(),
      venue.trim(),
      req.user.id,
      req.user.name,
      req.user.email,
      parseInt(capacity) || 100,
      registrationDeadline ? registrationDeadline.trim() : date.trim(),
      JSON.stringify(Array.isArray(rules) ? rules : []),
      eligibility ? eligibility.trim() : 'Open to all college students',
      teamSize ? teamSize.trim() : 'Individual',
      status === 'draft' ? 'draft' : 'upcoming',
      image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      JSON.stringify(Array.isArray(tags) ? tags : [category, 'Campus2026']),
      0
    )

    // Automatically create a campus announcement notification if published
    if (status !== 'draft') {
      const notifId = `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
      db.prepare(`
        INSERT INTO notifications (id, target_event_id, user_id, title, message, category, timestamp)
        VALUES (?, NULL, NULL, ?, ?, ?, ?)
      `).run(
        notifId,
        `New Event Published: ${title.trim()}`,
        `Registration is now open for ${title.trim()} (${category}) scheduled on ${date.trim()} at ${venue.trim()}.`,
        'announcement',
        'Just now'
      )
    }

    const createdRow = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId)
    res.status(201).json({
      message: 'Event published successfully.',
      event: formatEventRow(createdRow),
    })
  } catch (error) {
    console.error('Create event error:', error)
    res.status(500).json({ error: 'Failed to create event.' })
  }
})

// PUT update event (Organizer only)
eventsRouter.put('/:id', requireRole('organizer'), (req, res) => {
  try {
    const eventId = req.params.id
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId)
    if (!existing) {
      return res.status(404).json({ error: 'Event not found.' })
    }

    const {
      title,
      description,
      category,
      date,
      time,
      venue,
      capacity,
      registrationDeadline,
      rules,
      eligibility,
      teamSize,
      image,
      tags,
      status,
    } = req.body

    const updateStmt = db.prepare(`
      UPDATE events
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          date = COALESCE(?, date),
          time = COALESCE(?, time),
          venue = COALESCE(?, venue),
          capacity = COALESCE(?, capacity),
          registration_deadline = COALESCE(?, registration_deadline),
          rules = COALESCE(?, rules),
          eligibility = COALESCE(?, eligibility),
          team_size = COALESCE(?, team_size),
          image = COALESCE(?, image),
          tags = COALESCE(?, tags),
          status = COALESCE(?, status)
      WHERE id = ?
    `)

    updateStmt.run(
      title ? title.trim() : null,
      description ? description.trim() : null,
      category || null,
      date ? date.trim() : null,
      time ? time.trim() : null,
      venue ? venue.trim() : null,
      capacity ? parseInt(capacity) : null,
      registrationDeadline ? registrationDeadline.trim() : null,
      rules ? JSON.stringify(rules) : null,
      eligibility ? eligibility.trim() : null,
      teamSize ? teamSize.trim() : null,
      image || null,
      tags ? JSON.stringify(tags) : null,
      status || null,
      eventId
    )

    const updatedRow = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId)
    res.json({
      message: 'Event updated successfully.',
      event: formatEventRow(updatedRow),
    })
  } catch (error) {
    console.error('Update event error:', error)
    res.status(500).json({ error: 'Failed to update event.' })
  }
})

// DELETE event (Organizer only)
eventsRouter.delete('/:id', requireRole('organizer'), (req, res) => {
  try {
    const eventId = req.params.id
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId)
    if (!existing) {
      return res.status(404).json({ error: 'Event not found.' })
    }

    db.prepare('DELETE FROM events WHERE id = ?').run(eventId)
    res.json({ message: 'Event deleted successfully.' })
  } catch (error) {
    console.error('Delete event error:', error)
    res.status(500).json({ error: 'Failed to delete event.' })
  }
})
