import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import { initDatabase } from './db/database.js'
import { authenticateToken } from './middleware/auth.middleware.js'
import { authRouter } from './routes/auth.routes.js'
import { eventsRouter } from './routes/events.routes.js'
import { registrationsRouter } from './routes/registrations.routes.js'
import { attendanceRouter } from './routes/attendance.routes.js'
import { notificationsRouter } from './routes/notifications.routes.js'
import { certificatesRouter } from './routes/certificates.routes.js'
import { reportsRouter } from './routes/reports.routes.js'

dotenv.config()
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Initialize Relational SQL Database
initDatabase()

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))

// Global token extraction middleware
app.use(authenticateToken)

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'EventHub College Management REST API',
    database: 'SQLite Relational Database',
  })
})

// Route Modules
app.use('/api/auth', authRouter)
app.use('/api/events', eventsRouter)
app.use('/api/registrations', registrationsRouter)
app.use('/api/attendance', attendanceRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/certificates', certificatesRouter)
app.use('/api/reports', reportsRouter)

// Serve Frontend Production Assets (when built)
const frontendDist = path.resolve(__dirname, '../frontend/dist')
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 EventHub Backend REST API running at http://localhost:${PORT}`)
})
