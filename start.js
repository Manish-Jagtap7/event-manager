import { spawn, execSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const backendDir = path.join(__dirname, 'backend')
const frontendDir = path.join(__dirname, 'frontend')
const frontendDist = path.join(frontendDir, 'dist')

console.log('====================================================')
console.log('🚀 EventHub Full-Stack Single Runner (VPS & Local)')
console.log('====================================================')

// 1. Check Backend Dependencies
const backendModules = path.join(backendDir, 'node_modules')
const betterSqliteModule = path.join(backendModules, 'better-sqlite3')
if (!fs.existsSync(backendModules) || !fs.existsSync(betterSqliteModule)) {
  console.log('📦 Installing backend dependencies...')
  execSync('npm install', { cwd: backendDir, stdio: 'inherit' })
}

// 2. Check Frontend Dependencies
const frontendModules = path.join(frontendDir, 'node_modules')
if (!fs.existsSync(frontendModules)) {
  console.log('📦 Installing frontend dependencies...')
  execSync('npm install', { cwd: frontendDir, stdio: 'inherit' })
}

// 3. Ensure Frontend Production Build Exists
if (!fs.existsSync(frontendDist) || !fs.existsSync(path.join(frontendDist, 'index.html'))) {
  console.log('🔨 Building frontend production bundle (dist)...')
  execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' })
}

// 4. Start Unified Server
console.log('🌐 Launching unified production server...')
const port = process.env.PORT || 5000

const server = spawn('node', ['server.js'], {
  cwd: backendDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: String(port),
    NODE_ENV: process.env.NODE_ENV || 'production',
  },
})

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err)
  process.exit(1)
})

server.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`)
  process.exit(code || 0)
})

// Handle termination signals
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down EventHub server...')
  server.kill('SIGINT')
})

process.on('SIGTERM', () => {
  server.kill('SIGTERM')
})
