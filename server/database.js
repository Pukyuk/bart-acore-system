import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const DB_FILE = path.join(__dirname, 'bart-acore.db')
const JSON_DB_FILE = path.join(__dirname, 'db.json')

export const defaultData = {
  users: [
    {
      id: 1,
      name: 'Aldrin',
      email: 'admin@bwsi.com',
      password: 'admin123',
      role: 'Admin',
      status: 'Active',
    },
    {
      id: 2,
      name: 'A-Core Encoder',
      email: 'encoder@bwsi.com',
      password: 'encoder123',
      role: 'Encoder',
      status: 'Active',
    },
    {
      id: 3,
      name: 'A-Core Supervisor',
      email: 'supervisor@bwsi.com',
      password: 'supervisor123',
      role: 'Supervisor',
      status: 'Active',
    },
    {
      id: 4,
      name: 'BART Viewer',
      email: 'viewer@bwsi.com',
      password: 'viewer123',
      role: 'Viewer',
      status: 'Active',
    },
  ],
  branches: [
    {
      id: 1,
      branch: 'Main Office',
      department: 'Accounting',
      status: 'Active',
    },
    {
      id: 2,
      branch: 'San Pedro',
      department: 'Accounting',
      status: 'Active',
    },
    {
      id: 3,
      branch: 'Calamba',
      department: 'Accounting',
      status: 'Active',
    },
    {
      id: 4,
      branch: 'Sta. Rosa',
      department: 'Accounting',
      status: 'Active',
    },
    {
      id: 5,
      branch: 'Treasury',
      department: 'Treasury',
      status: 'Active',
    },
    {
      id: 6,
      branch: 'Billing',
      department: 'Billing',
      status: 'Active',
    },
    {
      id: 7,
      branch: 'Engineering',
      department: 'Engineering',
      status: 'Active',
    },
  ],
  records: [
    {
      id: 1,
      department: 'Accounting',
      service: 'Document Processing',
      company: 'Balibago Waterworks Systems, Inc.',
      branch: 'Main Office',
      date: '2026-05-12',
      preGroom: 128,
      postGroom: 110,
      scannedPdf: 116,
      scannedPages: 2240,
      indexedPdf: 102,
      indexedPages: 1988,
      qaIndexed: 96,
      qaPages: 1850,
      category: 'Accounting Batch',
      status: 'Approved',
      user: 'Aldrin',
      remarks: 'Completed accounting document batch.',
    },
    {
      id: 2,
      department: 'Accounting',
      service: 'Document Processing',
      company: 'Balibago Waterworks Systems, Inc.',
      branch: 'San Pedro',
      date: '2026-05-12',
      preGroom: 88,
      postGroom: 81,
      scannedPdf: 74,
      scannedPages: 1395,
      indexedPdf: 68,
      indexedPages: 1280,
      qaIndexed: 61,
      qaPages: 1192,
      category: 'Accounting Batch',
      status: 'For Review',
      user: 'A-Core Encoder',
      remarks: 'Pending supervisor validation.',
    },
    {
      id: 3,
      department: 'Treasury',
      service: 'Indexing Only',
      company: 'Balibago Waterworks Systems, Inc.',
      branch: 'Treasury',
      date: '2026-05-12',
      preGroom: 0,
      postGroom: 0,
      scannedPdf: 0,
      scannedPages: 0,
      indexedPdf: 143,
      indexedPages: 0,
      qaIndexed: 132,
      qaPages: 0,
      category: 'Collection',
      status: 'Approved',
      user: 'A-Core Encoder',
      remarks: 'Collection documents indexed.',
    },
    {
      id: 4,
      department: 'Treasury',
      service: 'Indexing Only',
      company: 'Balibago Waterworks Systems, Inc.',
      branch: 'Treasury',
      date: '2026-05-11',
      preGroom: 0,
      postGroom: 0,
      scannedPdf: 0,
      scannedPages: 0,
      indexedPdf: 97,
      indexedPages: 0,
      qaIndexed: 91,
      qaPages: 0,
      category: 'Disbursement',
      status: 'Returned',
      user: 'Aldrin',
      remarks: 'Needs category checking.',
    },
  ],
  transmittals: [
    {
      id: 101,
      batchNo: 'BART-TR-0001',
      department: 'Accounting',
      branch: 'Main Office',
      date: '2026-05-12',
      documents: 116,
      receivedBy: 'Accounting Receiver',
      status: 'Released',
      remarks: 'Initial completed accounting batch.',
    },
  ],
  logs: [
    {
      id: 1,
      createdAt: '2026-05-12T08:00:00.000Z',
      user: 'System',
      module: 'System',
      action: 'Initialize',
      description: 'B.A.R.T. A-Core SQLite database initialized.',
    },
  ],
}

export const db = new Database(DB_FILE)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export function createId() {
  return Date.now() + Math.floor(Math.random() * 1000)
}

export function sanitizeUser(user) {
  if (!user) return null
  const { password, ...safeUser } = user
  return safeUser
}

export function getActionUser(req) {
  return req.body?.actionUser || req.body?.user || 'System'
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Encoder',
      status TEXT NOT NULL DEFAULT 'Active'
    );

    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY,
      branch TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL DEFAULT 'Accounting',
      status TEXT NOT NULL DEFAULT 'Active'
    );

    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY,
      department TEXT NOT NULL DEFAULT 'Accounting',
      service TEXT NOT NULL DEFAULT 'Document Processing',
      company TEXT NOT NULL DEFAULT 'Balibago Waterworks Systems, Inc.',
      branch TEXT NOT NULL DEFAULT 'Main Office',
      date TEXT NOT NULL,
      preGroom INTEGER NOT NULL DEFAULT 0,
      postGroom INTEGER NOT NULL DEFAULT 0,
      scannedPdf INTEGER NOT NULL DEFAULT 0,
      scannedPages INTEGER NOT NULL DEFAULT 0,
      indexedPdf INTEGER NOT NULL DEFAULT 0,
      indexedPages INTEGER NOT NULL DEFAULT 0,
      qaIndexed INTEGER NOT NULL DEFAULT 0,
      qaPages INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL DEFAULT 'General Batch',
      status TEXT NOT NULL DEFAULT 'For Review',
      user TEXT NOT NULL DEFAULT 'System',
      remarks TEXT NOT NULL DEFAULT 'No remarks.'
    );

    CREATE TABLE IF NOT EXISTS transmittals (
      id INTEGER PRIMARY KEY,
      batchNo TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL DEFAULT 'Accounting',
      branch TEXT NOT NULL DEFAULT 'Main Office',
      date TEXT NOT NULL,
      documents INTEGER NOT NULL DEFAULT 0,
      receivedBy TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Pending',
      remarks TEXT NOT NULL DEFAULT 'No remarks.'
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY,
      createdAt TEXT NOT NULL,
      user TEXT NOT NULL DEFAULT 'System',
      module TEXT NOT NULL DEFAULT 'System',
      action TEXT NOT NULL DEFAULT 'Action',
      description TEXT NOT NULL DEFAULT ''
    );
  `)
}

function readJsonFallback() {
  if (!fs.existsSync(JSON_DB_FILE)) return defaultData

  try {
    const raw = fs.readFileSync(JSON_DB_FILE, 'utf-8')
    const parsed = JSON.parse(raw)

    return {
      users: Array.isArray(parsed.users) ? parsed.users : defaultData.users,
      branches: Array.isArray(parsed.branches) ? parsed.branches : defaultData.branches,
      records: Array.isArray(parsed.records) ? parsed.records : defaultData.records,
      transmittals: Array.isArray(parsed.transmittals) ? parsed.transmittals : defaultData.transmittals,
      logs: Array.isArray(parsed.logs) ? parsed.logs : defaultData.logs,
    }
  } catch {
    return defaultData
  }
}

function insertUser(user) {
  db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, password, role, status)
    VALUES (@id, @name, @email, @password, @role, @status)
  `).run(user)
}

function insertBranch(branch) {
  db.prepare(`
    INSERT OR IGNORE INTO branches (id, branch, department, status)
    VALUES (@id, @branch, @department, @status)
  `).run(branch)
}

function insertRecord(record) {
  db.prepare(`
    INSERT OR IGNORE INTO records (
      id, department, service, company, branch, date,
      preGroom, postGroom, scannedPdf, scannedPages,
      indexedPdf, indexedPages, qaIndexed, qaPages,
      category, status, user, remarks
    )
    VALUES (
      @id, @department, @service, @company, @branch, @date,
      @preGroom, @postGroom, @scannedPdf, @scannedPages,
      @indexedPdf, @indexedPages, @qaIndexed, @qaPages,
      @category, @status, @user, @remarks
    )
  `).run(record)
}

function insertTransmittal(item) {
  db.prepare(`
    INSERT OR IGNORE INTO transmittals (
      id, batchNo, department, branch, date, documents, receivedBy, status, remarks
    )
    VALUES (
      @id, @batchNo, @department, @branch, @date, @documents, @receivedBy, @status, @remarks
    )
  `).run(item)
}

function insertLog(log) {
  db.prepare(`
    INSERT OR IGNORE INTO logs (id, createdAt, user, module, action, description)
    VALUES (@id, @createdAt, @user, @module, @action, @description)
  `).run(log)
}

function seedDatabase() {
  const count = db.prepare('SELECT COUNT(*) AS count FROM users').get().count
  if (count > 0) return

  const source = readJsonFallback()

  const seed = db.transaction(() => {
    source.users.forEach(insertUser)
    source.branches.forEach(insertBranch)
    source.records.forEach(insertRecord)
    source.transmittals.forEach(insertTransmittal)
    source.logs.forEach(insertLog)

    addLog({
      user: 'System',
      module: 'System',
      action: 'SQLite Setup',
      description: 'SQLite database created and seeded from default/db.json data.',
    })
  })

  seed()
}

export function initializeDatabase() {
  createTables()
  seedDatabase()
}

export function addLog({ user = 'System', module = 'System', action = 'Action', description = '' }) {
  const log = {
    id: createId(),
    createdAt: new Date().toISOString(),
    user,
    module,
    action,
    description,
  }

  insertLog(log)

  const totalLogs = db.prepare('SELECT COUNT(*) AS count FROM logs').get().count

  if (totalLogs > 500) {
    db.prepare(`
      DELETE FROM logs
      WHERE id NOT IN (
        SELECT id FROM logs
        ORDER BY createdAt DESC
        LIMIT 500
      )
    `).run()
  }

  return log
}

export function getAllData() {
  const users = db.prepare('SELECT * FROM users ORDER BY id DESC').all().map(sanitizeUser)
  const branches = db.prepare('SELECT * FROM branches ORDER BY id DESC').all()
  const records = db.prepare('SELECT * FROM records ORDER BY id DESC').all()
  const transmittals = db.prepare('SELECT * FROM transmittals ORDER BY id DESC').all()
  const logs = db.prepare('SELECT * FROM logs ORDER BY createdAt DESC, id DESC').all()

  return {
    users,
    branches,
    records,
    transmittals,
    logs,
  }
}

export function resetDatabase(actionUser = 'System') {
  const reset = db.transaction(() => {
    db.prepare('DELETE FROM users').run()
    db.prepare('DELETE FROM branches').run()
    db.prepare('DELETE FROM records').run()
    db.prepare('DELETE FROM transmittals').run()
    db.prepare('DELETE FROM logs').run()

    defaultData.users.forEach(insertUser)
    defaultData.branches.forEach(insertBranch)
    defaultData.records.forEach(insertRecord)
    defaultData.transmittals.forEach(insertTransmittal)
    defaultData.logs.forEach(insertLog)

    addLog({
      user: actionUser,
      module: 'System',
      action: 'Reset Data',
      description: `${actionUser} reset the SQLite database to default data.`,
    })
  })

  reset()

  return getAllData()
}