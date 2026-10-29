import { db, initDatabase } from '../db/database.js'

function wipeDatabase() {
  console.log('🧹 Wiping EventHub SQLite database clean...')

  // Ensure tables and schema exist
  initDatabase()

  // Disable foreign keys to allow truncating tables in any order
  db.exec('PRAGMA foreign_keys = OFF;')

  // Completely wipe all data from every table
  db.exec(`
    DELETE FROM notification_reads;
    DELETE FROM notifications;
    DELETE FROM certificates;
    DELETE FROM registrations;
    DELETE FROM events;
    DELETE FROM users;
  `)

  // Reset sqlite autoincrement sequences if any exist
  try {
    db.exec('DELETE FROM sqlite_sequence;')
  } catch {
    // Ignore if sqlite_sequence table does not exist
  }

  // Vacuum to reclaim disk space and defragment database
  db.exec('VACUUM;')

  // Re-enable foreign key constraints
  db.exec('PRAGMA foreign_keys = ON;')

  console.log('✅ EventHub database completely wiped clean! Remaining records:')
  const tables = ['users', 'events', 'registrations', 'notifications', 'notification_reads', 'certificates']
  for (const table of tables) {
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get()
    console.log(`   - ${table}: ${row.count} records`)
  }
}

wipeDatabase()

