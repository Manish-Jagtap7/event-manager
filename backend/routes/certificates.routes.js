import { Router } from 'express'
import { db } from '../db/database.js'
import { requireAuth } from '../middleware/auth.middleware.js'

export const certificatesRouter = Router()

function formatCertRow(row) {
  if (!row) return null
  return {
    id: row.id,
    certificateNumber: row.certificate_number,
    eventId: row.event_id,
    eventTitle: row.event_title,
    category: row.category,
    studentName: row.student_name,
    rollNumber: row.roll_number,
    department: row.department,
    issueDate: row.issue_date,
    verificationCode: row.verification_code,
    organizerName: row.organizer_name,
    authorizedSignatory: row.authorized_signatory,
    createdAt: row.created_at,
  }
}

// GET my certificates (Student)
certificatesRouter.get('/my', requireAuth, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM certificates
      WHERE student_id = ?
      ORDER BY created_at DESC
    `)
    const rows = stmt.all(req.user.id)
    res.json({ certificates: rows.map(formatCertRow) })
  } catch (error) {
    console.error('Fetch certificates error:', error)
    res.status(500).json({ error: 'Failed to retrieve certificates.' })
  }
})

// GET single certificate by ID
certificatesRouter.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM certificates WHERE id = ?')
    const row = stmt.get(req.params.id)
    if (!row) {
      return res.status(404).json({ error: 'Certificate not found.' })
    }
    res.json({ certificate: formatCertRow(row) })
  } catch (error) {
    console.error('Fetch cert by id error:', error)
    res.status(500).json({ error: 'Failed to retrieve certificate.' })
  }
})

// GET verify certificate by verification code (Public)
certificatesRouter.get('/verify/:code', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM certificates WHERE verification_code = ?')
    const row = stmt.get(req.params.code.trim().toUpperCase())
    if (!row) {
      return res.status(404).json({ verified: false, error: 'Invalid verification credential code.' })
    }
    res.json({
      verified: true,
      certificate: formatCertRow(row),
    })
  } catch (error) {
    console.error('Verify certificate error:', error)
    res.status(500).json({ error: 'Verification failed.' })
  }
})
