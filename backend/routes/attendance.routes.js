import { Router } from 'express'
import { db } from '../db/database.js'
import { requireRole } from '../middleware/auth.middleware.js'

export const attendanceRouter = Router()

// GET event attendance metrics and attendee list (Organizer only)
attendanceRouter.get('/:eventId', requireRole('organizer'), (req, res) => {
  try {
    const { eventId } = req.params
    const event = db.prepare('SELECT id, title, category, date, time, venue FROM events WHERE id = ?').get(eventId)
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' })
    }

    const registrations = db.prepare(`
      SELECT id, event_id, student_id, student_name, roll_number, department, email, status, check_in_time
      FROM registrations
      WHERE event_id = ? AND status != 'cancelled'
      ORDER BY roll_number ASC
    `).all(eventId)

    const total = registrations.length
    const checkedInCount = registrations.filter((r) => r.status === 'attended').length
    const pendingCount = total - checkedInCount
    const turnoutRate = total > 0 ? Math.round((checkedInCount / total) * 100) : 0

    res.json({
      event,
      total,
      checkedInCount,
      pendingCount,
      turnoutRate,
      attendees: registrations.map((r) => ({
        id: r.id,
        eventId: r.event_id,
        studentId: r.student_id,
        studentName: r.student_name,
        rollNumber: r.roll_number,
        department: r.department,
        email: r.email,
        status: r.status,
        checkInTime: r.check_in_time,
      })),
    })
  } catch (error) {
    console.error('Fetch attendance desk error:', error)
    res.status(500).json({ error: 'Failed to retrieve attendance roster.' })
  }
})

// POST check in attendee (Organizer only)
attendanceRouter.post('/check-in', requireRole('organizer'), (req, res) => {
  try {
    const { registrationId, eventId, rollNumber } = req.body

    let reg = null
    if (registrationId) {
      reg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(registrationId)
    } else if (eventId && rollNumber) {
      reg = db.prepare('SELECT * FROM registrations WHERE event_id = ? AND roll_number = ? AND status != "cancelled"').get(eventId, rollNumber.trim())
    }

    if (!reg) {
      return res.status(404).json({ error: 'Student registration not found for this event.' })
    }

    if (reg.status === 'attended') {
      return res.json({ message: 'Attendee is already checked in.', registrationId: reg.id, alreadyAttended: true })
    }

    const now = new Date()
    const timeFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const certId = `cert-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
    const certNumber = `EH-2026-${reg.roll_number.replace(/\s+/g, '')}-${Math.floor(100 + Math.random() * 900)}`
    const verifyCode = `VERIFY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Fetch event for certificate metadata
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(reg.event_id)

    // Update registration to attended
    db.prepare(`
      UPDATE registrations
      SET status = 'attended', check_in_time = ?, certificate_id = ?
      WHERE id = ?
    `).run(timeFormatted, certId, reg.id)

    // Issue verified certificate in database
    db.prepare(`
      INSERT OR REPLACE INTO certificates (
        id, certificate_number, event_id, event_title, category,
        student_id, student_name, roll_number, department,
        issue_date, verification_code, organizer_name, authorized_signatory
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      certId,
      certNumber,
      reg.event_id,
      event ? event.title : 'Collegiate Competition',
      event ? event.category : 'Technical',
      reg.student_id,
      reg.student_name,
      reg.roll_number,
      reg.department,
      now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      verifyCode,
      event ? `${event.organizer_name} (Event Coordinator)` : 'Faculty Coordinator',
      'Dr. V. N. Swaminathan (Dean of Student Affairs)'
    )

    // Send push notification to student
    const notifId = `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
    db.prepare(`
      INSERT INTO notifications (id, target_event_id, user_id, title, message, category, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      notifId,
      reg.event_id,
      reg.student_id,
      `Attendance Verified & Certificate Unlocked`,
      `Your live attendance was verified at the venue for ${event ? event.title : 'the event'}. Your verified e-certificate is unlocked for download.`,
      'certificate',
      'Just now'
    )

    res.json({
      message: `Attendance verified for ${reg.student_name} (${reg.roll_number}). Certificate unlocked.`,
      registrationId: reg.id,
      checkInTime: timeFormatted,
      certificateId: certId,
      certificateNumber: certNumber,
    })
  } catch (error) {
    console.error('Check-in error:', error)
    res.status(500).json({ error: 'Failed to record check-in.' })
  }
})

// POST revoke check-in (Organizer only)
attendanceRouter.post('/revoke', requireRole('organizer'), (req, res) => {
  try {
    const { registrationId } = req.body
    if (!registrationId) {
      return res.status(400).json({ error: 'Registration ID is required.' })
    }

    const reg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(registrationId)
    if (!reg) {
      return res.status(404).json({ error: 'Registration record not found.' })
    }

    if (reg.certificate_id) {
      db.prepare('DELETE FROM certificates WHERE id = ?').run(reg.certificate_id)
    }

    db.prepare(`
      UPDATE registrations
      SET status = 'approved', check_in_time = NULL, certificate_id = NULL
      WHERE id = ?
    `).run(registrationId)

    res.json({ message: `Check-in revoked for ${reg.student_name}.` })
  } catch (error) {
    console.error('Revoke check-in error:', error)
    res.status(500).json({ error: 'Failed to revoke check-in.' })
  }
})
