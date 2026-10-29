import jwt from 'jsonwebtoken'
import { db } from '../db/database.js'

export const JWT_SECRET = process.env.JWT_SECRET || 'eventhub-secure-college-jwt-secret-key-2026'

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    req.user = null
    return next()
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const stmt = db.prepare('SELECT id, name, email, role, roll_number, department, semester, avatar FROM users WHERE id = ?')
    const user = stmt.get(decoded.id)
    if (!user) {
      req.user = null
      return next()
    }
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.roll_number,
      department: user.department,
      semester: user.semester,
      avatar: user.avatar,
    }
    next()
  } catch (err) {
    req.user = null
    next()
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' })
  }
  next()
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' })
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Access forbidden: requires ${role} privileges.` })
    }
    next()
  }
}
