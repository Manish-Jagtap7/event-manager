import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db/database.js'
import { JWT_SECRET, requireAuth } from '../middleware/auth.middleware.js'

export const authRouter = Router()

// Register new user (Student or Organizer)
authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, department, semester } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and account role are required.' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanRole = role === 'organizer' ? 'organizer' : 'student'

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' })
    }

    // Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail)
    if (existing) {
      return res.status(409).json({ error: 'An account with this college email already exists. Please sign in.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const userId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`

    const insertStmt = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, roll_number, department, semester)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insertStmt.run(
      userId,
      name.trim(),
      cleanEmail,
      passwordHash,
      cleanRole,
      cleanRole === 'student' ? (rollNumber ? rollNumber.trim() : null) : null,
      department ? department.trim() : 'General',
      semester ? semester.trim() : (cleanRole === 'student' ? '1st Semester' : null)
    )

    const user = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      role: cleanRole,
      rollNumber: cleanRole === 'student' ? rollNumber : undefined,
      department: department || 'General',
      semester: semester || undefined,
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    })

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user,
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error during registration.' })
  }
})

// Login existing user
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail)

    if (!userRow) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' })
    }

    const passwordMatches = await bcrypt.compare(password, userRow.password_hash)
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      role: userRow.role,
      rollNumber: userRow.roll_number,
      department: userRow.department,
      semester: userRow.semester,
      avatar: userRow.avatar,
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    })

    res.json({
      message: 'Signed in successfully.',
      token,
      user,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error during sign in.' })
  }
})

// Get current session user
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

// Update user profile
authRouter.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, email, department, semester, rollNumber, password } = req.body

    // Check if new email is already registered by another account
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase()
      const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(cleanEmail, req.user.id)
      if (existing) {
        return res.status(409).json({ error: 'This email is already in use by another user.' })
      }
    }

    let passwordHash = null
    if (password && password.trim().length >= 6) {
      passwordHash = await bcrypt.hash(password.trim(), 10)
    }

    const updateStmt = db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          department = COALESCE(?, department),
          semester = COALESCE(?, semester),
          roll_number = COALESCE(?, roll_number),
          password_hash = COALESCE(?, password_hash)
      WHERE id = ?
    `)

    updateStmt.run(
      name ? name.trim() : null,
      email ? email.trim().toLowerCase() : null,
      department ? department.trim() : null,
      semester ? semester.trim() : null,
      rollNumber ? rollNumber.trim() : null,
      passwordHash,
      req.user.id
    )

    // Synchronize registrations with updated student details
    if (name || email || rollNumber || department) {
      db.prepare(`
        UPDATE registrations
        SET student_name = COALESCE(?, student_name),
            email = COALESCE(?, email),
            roll_number = COALESCE(?, roll_number),
            department = COALESCE(?, department)
        WHERE student_id = ?
      `).run(
        name ? name.trim() : null,
        email ? email.trim().toLowerCase() : null,
        rollNumber ? rollNumber.trim() : null,
        department ? department.trim() : null,
        req.user.id
      )
    }

    // Synchronize events with updated organizer details
    if (req.user.role === 'organizer' && (name || email)) {
      db.prepare(`
        UPDATE events
        SET organizer_name = COALESCE(?, organizer_name),
            organizer_email = COALESCE(?, organizer_email)
        WHERE organizer_id = ?
      `).run(
        name ? name.trim() : null,
        email ? email.trim().toLowerCase() : null,
        req.user.id
      )
    }

    const updated = db.prepare('SELECT id, name, email, role, roll_number, department, semester FROM users WHERE id = ?').get(req.user.id)
    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        rollNumber: updated.roll_number,
        department: updated.department,
        semester: updated.semester,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ error: 'Failed to update profile.' })
  }
})
