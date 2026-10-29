import { Router } from 'express'
import { db } from '../db/database.js'
import { requireRole } from '../middleware/auth.middleware.js'

export const reportsRouter = Router()

// GET analytical metrics (Organizer only)
reportsRouter.get('/analytics', requireRole('organizer'), (req, res) => {
  try {
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get().count
    const totalRegistrations = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE status != 'cancelled'").get().count
    const totalAttended = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE status = 'attended'").get().count
    const totalCertificates = db.prepare('SELECT COUNT(*) as count FROM certificates').get().count

    // Department participation distribution
    const deptRows = db.prepare(`
      SELECT department, COUNT(*) as count
      FROM registrations
      WHERE status != 'cancelled'
      GROUP BY department
      ORDER BY count DESC
    `).all()

    const departmentCounts = {
      'Computer Science & Engineering': 0,
      'Information Technology': 0,
      'Electronics & Communication': 0,
      'Mechanical Engineering': 0,
      'Other Branches': 0,
    }

    deptRows.forEach((r) => {
      const d = r.department || ''
      if (d.includes('Computer')) departmentCounts['Computer Science & Engineering'] += r.count
      else if (d.includes('Information')) departmentCounts['Information Technology'] += r.count
      else if (d.includes('Electronics')) departmentCounts['Electronics & Communication'] += r.count
      else if (d.includes('Mechanical')) departmentCounts['Mechanical Engineering'] += r.count
      else departmentCounts['Other Branches'] += r.count
    })

    // Category breakdown
    const categoryRows = db.prepare(`
      SELECT category, COUNT(*) as event_count, SUM(capacity) as total_capacity, SUM(registered_count) as total_registered
      FROM events
      GROUP BY category
    `).all()

    res.json({
      totalEvents,
      totalRegistrations,
      totalAttended,
      totalCertificates,
      attendanceRate: totalRegistrations > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0,
      departmentCounts,
      categoryStats: categoryRows.map((r) => ({
        category: r.category,
        eventCount: r.event_count,
        totalCapacity: r.total_capacity || 0,
        totalRegistered: r.total_registered || 0,
      })),
    })
  } catch (error) {
    console.error('Analytics reports error:', error)
    res.status(500).json({ error: 'Failed to generate analytics reports.' })
  }
})

// GET export event master summary as CSV (Organizer only)
reportsRouter.get('/export/summary', requireRole('organizer'), (req, res) => {
  try {
    const events = db.prepare('SELECT * FROM events ORDER BY created_at DESC').all()
    let csv = 'Event ID,Title,Category,Date,Time,Venue,Capacity,Registered,Status\n'
    events.forEach((e) => {
      csv += `${e.id},"${e.title.replace(/"/g, '""')}",${e.category},${e.date},"${e.time}","${e.venue.replace(/"/g, '""')}",${e.capacity},${e.registered_count},${e.status}\n`
    })

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="EventHub_Master_Summary.csv"')
    res.send(csv)
  } catch (error) {
    console.error('Export summary error:', error)
    res.status(500).json({ error: 'Failed to export summary CSV.' })
  }
})

// GET export attendance audit logs as CSV (Organizer only)
reportsRouter.get('/export/attendance', requireRole('organizer'), (req, res) => {
  try {
    const query = `
      SELECT r.id, e.title as event_title, r.roll_number, r.student_name, r.department, r.email, r.status, r.check_in_time
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      ORDER BY r.registered_at DESC
    `
    const rows = db.prepare(query).all()
    let csv = 'Registration ID,Event Title,Roll Number,Student Name,Department,Email,Status,Check In Time\n'
    rows.forEach((r) => {
      csv += `${r.id},"${r.event_title.replace(/"/g, '""')}",${r.roll_number},"${r.student_name.replace(/"/g, '""')}","${r.department.replace(/"/g, '""')}",${r.email},${r.status},"${r.check_in_time || 'N/A'}"\n`
    })

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="EventHub_Attendance_Logs.csv"')
    res.send(csv)
  } catch (error) {
    console.error('Export attendance error:', error)
    res.status(500).json({ error: 'Failed to export attendance CSV.' })
  }
})
