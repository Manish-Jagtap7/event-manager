import { Router } from 'express'
import { db } from '../db/database.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

export const registrationsRouter = Router()

function formatRegistrationRow(row) {
  if (!row) return null
  return {
    id: row.id,
    eventId: row.event_id,
    eventTitle: row.event_title || row.title,
    eventCategory: row.event_category || row.category,
    eventDate: row.event_date || row.date,
    eventTime: row.event_time || row.time,
    eventVenue: row.event_venue || row.venue,
    studentId: row.student_id,
    studentName: row.student_name,
    rollNumber: row.roll_number,
    department: row.department,
    email: row.email,
    registeredAt: row.registered_at,
    status: row.status,
    checkInTime: row.check_in_time,
    certificateId: row.certificate_id,
  }
}

// POST register for an event (Student)
registrationsRouter.post('/', requireAuth, (req, res) => {
  try {
    const { eventId } = req.body
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required to register.' })
    }

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId)
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' })
    }

    if (event.registered_count >= event.capacity) {
      return res.status(400).json({ error: 'Event capacity reached. Registration is full.' })
    }

    // Check duplicate
    const existing = db.prepare('SELECT * FROM registrations WHERE event_id = ? AND student_id = ?').get(eventId, req.user.id)
    if (existing) {
      if (existing.status === 'cancelled') {
        // Re-activate registration
        db.prepare(`
          UPDATE registrations
          SET status = 'approved', registered_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(existing.id)
        db.prepare('UPDATE events SET registered_count = registered_count + 1 WHERE id = ?').run(eventId)
        return res.json({ message: 'Registration reinstated successfully.', registrationId: existing.id })
      }
      return res.status(409).json({ error: 'You are already registered for this event.' })
    }

    const regId = `reg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
    const insertStmt = db.prepare(`
      INSERT INTO registrations (
        id, event_id, student_id, student_name, roll_number,
        department, email, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')
    `)

    insertStmt.run(
      regId,
      eventId,
      req.user.id,
      req.user.name,
      req.user.rollNumber || 'N/A',
      req.user.department || 'General',
      req.user.email
    )

    // Increment registered_count
    db.prepare('UPDATE events SET registered_count = registered_count + 1 WHERE id = ?').run(eventId)

    // Send confirmation alert to the student
    const notifId = `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
    db.prepare(`
      INSERT INTO notifications (id, target_event_id, user_id, title, message, category, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      notifId,
      eventId,
      req.user.id,
      `Registration Confirmed: ${event.title}`,
      `Your enrolment for ${event.title} has been confirmed. Your digital check-in entry pass is ready.`,
      'announcement',
      'Just now'
    )

    const created = db.prepare(`
      SELECT r.*, e.title as event_title, e.category as event_category, e.date as event_date, e.time as event_time, e.venue as event_venue
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.id = ?
    `).get(regId)

    res.status(201).json({
      message: 'Enrolled successfully. Digital pass generated.',
      registration: formatRegistrationRow(created),
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Failed to process event registration.' })
  }
})

// GET my registrations (Current Student)
registrationsRouter.get('/my', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT r.*, e.title as event_title, e.category as event_category, e.date as event_date, e.time as event_time, e.venue as event_venue
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.student_id = ?
      ORDER BY r.registered_at DESC
    `)
    const rows = stmt.all(req.user.id)
    res.json({ registrations: rows.map(formatRegistrationRow) })
  } catch (error) {
    console.error('Fetch my registrations error:', error)
    res.status(500).json({ error: 'Failed to retrieve registrations.' })
  }
})

// GET event participant roster (Organizer only)
registrationsRouter.get('/event/:eventId', requireRole('organizer'), (req, res) => {
  try {
    const { eventId } = req.params
    const { search, department, status } = req.query

    let query = `
      SELECT r.*, e.title as event_title, e.category as event_category, e.date as event_date, e.time as event_time, e.venue as event_venue
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.event_id = ?
    `
    const params = [eventId]

    if (status && status !== 'All') {
      query += ' AND r.status = ?'
      params.push(status)
    }

    if (department && department !== 'All') {
      query += ' AND r.department LIKE ?'
      params.push(`%${department}%`)
    }

    if (search) {
      query += ' AND (r.student_name LIKE ? OR r.roll_number LIKE ? OR r.email LIKE ?)'
      const term = `%${search}%`
      params.push(term, term, term)
    }

    query += ' ORDER BY r.registered_at ASC'

    const stmt = db.prepare(query)
    const rows = stmt.all(...params)
    res.json({ registrations: rows.map(formatRegistrationRow) })
  } catch (error) {
    console.error('Fetch event roster error:', error)
    res.status(500).json({ error: 'Failed to retrieve participant roster.' })
  }
})

// PATCH update participant registration status (Organizer only)
registrationsRouter.patch('/:id/status', requireRole('organizer'), (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['approved', 'pending', 'attended', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required (approved, pending, attended, cancelled).' })
    }

    const existing = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id)
    if (!existing) {
      return res.status(404).json({ error: 'Registration record not found.' })
    }

    db.prepare('UPDATE registrations SET status = ? WHERE id = ?').run(status, id)
    res.json({ message: `Registration status updated to ${status}.` })
  } catch (error) {
    console.error('Update status error:', error)
    res.status(500).json({ error: 'Failed to update registration status.' })
  }
})

// DELETE cancel registration
registrationsRouter.delete('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params
    const reg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(id)
    if (!reg) {
      return res.status(404).json({ error: 'Registration not found.' })
    }

    // Only the student themselves or an organizer can cancel
    if (req.user.role !== 'organizer' && reg.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to cancel this registration.' })
    }

    if (reg.status !== 'cancelled') {
      db.prepare("UPDATE registrations SET status = 'cancelled' WHERE id = ?").run(id)
      db.prepare('UPDATE events SET registered_count = MAX(0, registered_count - 1) WHERE id = ?').run(reg.event_id)
    }

    res.json({ message: 'Registration cancelled successfully. Slot released.' })
  } catch (error) {
    console.error('Cancel registration error:', error)
    res.status(500).json({ error: 'Failed to cancel registration.' })
  }
})
