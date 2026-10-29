import { Router } from 'express'
import { db } from '../db/database.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

export const notificationsRouter = Router()

// GET notifications for current user
notificationsRouter.get('/', requireAuth, (req, res) => {
  try {
    const userId = req.user.id

    // Fetch notifications:
    // 1. Directly addressed to this user (n.user_id = ?)
    // 2. Global campus-wide broadcasts (n.target_event_id IS NULL)
    // 3. Event-specific broadcasts ONLY IF the student is enrolled in that event
    // 4. Or if the user is the organizer of that event
    const query = `
      SELECT n.*,
             e.title as event_title,
             CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END as is_read
      FROM notifications n
      LEFT JOIN events e ON n.target_event_id = e.id
      LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
      WHERE (
        n.user_id = ?
        OR n.target_event_id IS NULL
        OR (
          n.target_event_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.event_id = n.target_event_id
              AND r.student_id = ?
              AND r.status != 'cancelled'
          )
        )
        OR (
          n.target_event_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM events ev
            WHERE ev.id = n.target_event_id
              AND ev.organizer_id = ?
          )
        )
      )
      ORDER BY n.created_at DESC
      LIMIT 50
    `
    const rows = db.prepare(query).all(userId, userId, userId, userId)

    const notifications = rows.map((r) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      category: r.category,
      timestamp: r.timestamp,
      read: Boolean(r.is_read),
      eventTitle: r.event_title || 'All Campus Events',
      createdAt: r.created_at,
    }))

    res.json({ notifications })
  } catch (error) {
    console.error('Fetch notifications error:', error)
    res.status(500).json({ error: 'Failed to retrieve notifications.' })
  }
})

// PATCH mark single notification as read
notificationsRouter.patch('/:id/read', requireAuth, (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const readId = `nr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`

    db.prepare(`
      INSERT OR IGNORE INTO notification_reads (id, notification_id, user_id)
      VALUES (?, ?, ?)
    `).run(readId, id, userId)

    res.json({ message: 'Notification marked as read.' })
  } catch (error) {
    console.error('Mark read error:', error)
    res.status(500).json({ error: 'Failed to update notification.' })
  }
})

// PATCH mark all notifications as read
notificationsRouter.patch('/read-all', requireAuth, (req, res) => {
  try {
    const userId = req.user.id
    const notifs = db.prepare(`
      SELECT n.id FROM notifications n
      WHERE (
        n.user_id = ?
        OR n.target_event_id IS NULL
        OR (
          n.target_event_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.event_id = n.target_event_id
              AND r.student_id = ?
              AND r.status != 'cancelled'
          )
        )
        OR (
          n.target_event_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM events ev
            WHERE ev.id = n.target_event_id
              AND ev.organizer_id = ?
          )
        )
      )
    `).all(userId, userId, userId)

    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO notification_reads (id, notification_id, user_id)
      VALUES (?, ?, ?)
    `)

    for (const n of notifs) {
      const readId = `nr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
      insertStmt.run(readId, n.id, userId)
    }

    res.json({ message: 'All notifications marked as read.' })
  } catch (error) {
    console.error('Mark all read error:', error)
    res.status(500).json({ error: 'Failed to mark all as read.' })
  }
})

// POST broadcast notification (Organizer only)
notificationsRouter.post('/broadcast', requireRole('organizer'), (req, res) => {
  try {
    const { targetEventId, title, message, category } = req.body

    if (!title || !message) {
      return res.status(400).json({ error: 'Subject title and notice message are required.' })
    }

    // Safely validate targetEventId against existing events in the database
    let validEventId = null
    let eventTitle = 'All Campus Events'

    if (targetEventId && targetEventId !== 'all') {
      let evt = db.prepare('SELECT id, title FROM events WHERE id = ?').get(targetEventId)
      if (!evt) {
        evt = db.prepare('SELECT id, title FROM events WHERE title = ?').get(targetEventId)
      }
      if (evt) {
        validEventId = evt.id
        eventTitle = evt.title
      }
    }

    const notifId = `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
    const now = new Date()
    const timeFormatted =
      now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ', ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    db.prepare(`
      INSERT INTO notifications (id, target_event_id, user_id, title, message, category, timestamp)
      VALUES (?, ?, NULL, ?, ?, ?, ?)
    `).run(
      notifId,
      validEventId,
      title.trim(),
      message.trim(),
      category || 'announcement',
      timeFormatted
    )

    res.status(201).json({
      message: 'Broadcast notice dispatched successfully.',
      notification: {
        id: notifId,
        title: title.trim(),
        message: message.trim(),
        category: category || 'announcement',
        timestamp: timeFormatted,
        eventTitle,
        read: false,
      },
    })
  } catch (error) {
    console.error('Broadcast error:', error)
    res.status(500).json({ error: 'Failed to send broadcast notice.' })
  }
})
