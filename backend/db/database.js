import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure data directory exists
const dataDir = path.resolve(__dirname, '../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'eventhub.db')

// Dual-engine support: Node 22+ built-in node:sqlite or zero-dependency sql.js WASM fallback (Node 18/20 LTS)
let dbInstance

try {
  if (process.env.FORCE_SQL_JS === 'true') throw new Error('Forced WASM mode')
  const sqlite = await import('node:sqlite')
  dbInstance = new sqlite.DatabaseSync(dbPath)
  console.log('📦 Using native node:sqlite engine.')
} catch {
  console.log('📦 Built-in node:sqlite not present (Node <22). Initializing sql.js WASM engine...')
  const { default: initSqlJs } = await import('sql.js')
  const SQL = await initSqlJs()

  let initialBuffer = null
  if (fs.existsSync(dbPath)) {
    try {
      initialBuffer = fs.readFileSync(dbPath)
    } catch {
      initialBuffer = null
    }
  }

  const sqlDb = initialBuffer && initialBuffer.length > 0
    ? new SQL.Database(initialBuffer)
    : new SQL.Database()

  const persist = () => {
    try {
      const data = sqlDb.export()
      fs.writeFileSync(dbPath, Buffer.from(data))
    } catch (err) {
      console.error('Error persisting database to disk:', err)
    }
  }

  const normalizeParams = (args) => {
    if (args.length === 1 && Array.isArray(args[0])) return args[0]
    return args
  }

  dbInstance = {
    exec(sql) {
      sqlDb.exec(sql)
      persist()
    },
    prepare(sql) {
      return {
        run(...params) {
          sqlDb.run(sql, normalizeParams(params))
          const changes = sqlDb.getRowsModified()
          persist()
          return { changes }
        },
        get(...params) {
          const stmt = sqlDb.prepare(sql)
          stmt.bind(normalizeParams(params))
          if (stmt.step()) {
            const row = stmt.getAsObject()
            stmt.free()
            return row
          }
          stmt.free()
          return undefined
        },
        all(...params) {
          const stmt = sqlDb.prepare(sql)
          stmt.bind(normalizeParams(params))
          const rows = []
          while (stmt.step()) {
            rows.push(stmt.getAsObject())
          }
          stmt.free()
          return rows
        },
      }
    },
  }
}

export const db = dbInstance

// Initialize relational SQL tables
export function initDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'organizer')),
      roll_number TEXT,
      department TEXT,
      semester TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Technical', 'Cultural', 'Sports', 'Hackathon', 'Workshop')),
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      venue TEXT NOT NULL,
      organizer_id TEXT,
      organizer_name TEXT NOT NULL,
      organizer_email TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 100,
      registered_count INTEGER NOT NULL DEFAULT 0,
      registration_deadline TEXT NOT NULL,
      rules TEXT,
      eligibility TEXT NOT NULL,
      team_size TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'ongoing', 'completed', 'draft')),
      image TEXT,
      tags TEXT,
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      roll_number TEXT NOT NULL,
      department TEXT NOT NULL,
      email TEXT NOT NULL,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'approved' CHECK(status IN ('approved', 'pending', 'attended', 'cancelled')),
      check_in_time TEXT,
      certificate_id TEXT,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(event_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      target_event_id TEXT,
      user_id TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('announcement', 'venue', 'schedule', 'certificate')),
      timestamp TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (target_event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notification_reads (
      id TEXT PRIMARY KEY,
      notification_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(notification_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      certificate_number TEXT UNIQUE NOT NULL,
      event_id TEXT NOT NULL,
      event_title TEXT NOT NULL,
      category TEXT NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      roll_number TEXT NOT NULL,
      department TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      verification_code TEXT UNIQUE NOT NULL,
      organizer_name TEXT NOT NULL,
      authorized_signatory TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
    CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_student ON registrations(student_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_event ON notifications(target_event_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
  `)
  console.log('✅ SQLite Relational Database Initialized at:', dbPath)
}
