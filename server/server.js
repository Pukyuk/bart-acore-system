import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const { Pool } = pg

const app = express()
const PORT = process.env.PORT || 4000

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env file.')
  process.exit(1)
}

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in .env file.')
  process.exit(1)
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DB_SSL === 'false'
      ? false
      : {
          rejectUnauthorized: false,
        },
})

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      if (origin.endsWith('.vercel.app')) {
        return callback(null, true)
      }

      return callback(null, true)
    },
    credentials: true,
  })
)

app.use(express.json())

function createId() {
  return Date.now() + Math.floor(Math.random() * 1000)
}

function toNumber(value) {
  return Number(value) || 0
}

function getActionUser(req) {
  return req.authUser?.name || req.body?.actionUser || req.body?.user || 'System'
}

function createToken(user) {
  return jwt.sign(
    {
      id: Number(user.id),
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '8h',
    }
  )
}

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. Missing login token.' })
  }

  try {
    req.authUser = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Unauthorized. Invalid or expired token.' })
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.authUser?.role)) {
      return res.status(403).json({ message: 'Access denied for this role.' })
    }

    next()
  }
}

function sanitizeUser(user) {
  if (!user) return null

  return {
    id: Number(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  }
}

function mapRecord(row) {
  return {
    id: Number(row.id),
    department: row.department,
    service: row.service,
    company: row.company,
    branch: row.branch,
    date: row.date,
    preGroom: Number(row.pre_groom) || 0,
    postGroom: Number(row.post_groom) || 0,
    scannedPdf: Number(row.scanned_pdf) || 0,
    scannedPages: Number(row.scanned_pages) || 0,
    indexedPdf: Number(row.indexed_pdf) || 0,
    indexedPages: Number(row.indexed_pages) || 0,
    qaIndexed: Number(row.qa_indexed) || 0,
    qaPages: Number(row.qa_pages) || 0,
    category: row.category,
    status: row.status,
    user: row.user_name,
    remarks: row.remarks,
  }
}

function mapTransmittal(row) {
  return {
    id: Number(row.id),
    batchNo: row.batch_no,
    department: row.department,
    branch: row.branch,
    date: row.date,
    documents: Number(row.documents) || 0,
    receivedBy: row.received_by,
    status: row.status,
    remarks: row.remarks,
  }
}

function mapBranch(row) {
  return {
    id: Number(row.id),
    branch: row.branch,
    department: row.department,
    status: row.status,
  }
}

function mapLog(row) {
  return {
    id: Number(row.id),
    createdAt: row.created_at,
    user: row.user_name,
    module: row.module,
    action: row.action,
    description: row.description,
  }
}

async function ensureSecurityColumns() {
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_hash TEXT
  `)
}

async function addLog({
  user = 'System',
  module = 'System',
  action = 'Action',
  description = '',
}) {
  const id = createId()

  await pool.query(
    `
      INSERT INTO logs (id, user_name, module, action, description)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [id, user, module, action, description]
  )

  await pool.query(`
    DELETE FROM logs
    WHERE id NOT IN (
      SELECT id FROM logs
      ORDER BY created_at DESC
      LIMIT 500
    )
  `)

  return id
}

async function getAllData() {
  const [usersResult, branchesResult, recordsResult, transmittalsResult, logsResult] =
    await Promise.all([
      pool.query('SELECT * FROM users ORDER BY id DESC'),
      pool.query('SELECT * FROM branches ORDER BY id DESC'),
      pool.query('SELECT * FROM records ORDER BY id DESC'),
      pool.query('SELECT * FROM transmittals ORDER BY id DESC'),
      pool.query('SELECT * FROM logs ORDER BY created_at DESC, id DESC'),
    ])

  return {
    users: usersResult.rows.map(sanitizeUser),
    branches: branchesResult.rows.map(mapBranch),
    records: recordsResult.rows.map(mapRecord),
    transmittals: transmittalsResult.rows.map(mapTransmittal),
    logs: logsResult.rows.map(mapLog),
  }
}

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'B.A.R.T. A-Core API',
    company: 'Balibago Waterworks Systems, Inc.',
    team: 'A-Core',
    message: 'Backend API is running. Use /api/health or /api/data.',
  })
})

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS server_time')

    res.json({
      status: 'ok',
      app: 'B.A.R.T. A-Core PostgreSQL API',
      database: 'Supabase PostgreSQL',
      serverTime: result.rows[0].server_time,
      port: PORT,
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '').trim()

    const result = await pool.query(
      `
        SELECT *
        FROM users
        WHERE lower(email) = $1
        LIMIT 1
      `,
      [email]
    )

    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'This account is inactive.' })
    }

    let passwordIsValid = false

    if (user.password_hash) {
      passwordIsValid = await bcrypt.compare(password, user.password_hash)
    } else {
      passwordIsValid = password === user.password
    }

    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    if (!user.password_hash) {
      const passwordHash = await bcrypt.hash(password, 12)

      await pool.query(
        `
          UPDATE users
          SET password_hash = $1,
              password = 'HASHED'
          WHERE id = $2
        `,
        [passwordHash, user.id]
      )

      user.password_hash = passwordHash
      user.password = 'HASHED'
    }

    await addLog({
      user: user.name,
      module: 'Auth',
      action: 'Login',
      description: `${user.name} logged in as ${user.role}.`,
    })

    res.json({
      message: 'Login successful.',
      token: createToken(user),
      user: sanitizeUser(user),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/data', authRequired, async (req, res) => {
  try {
    res.json(await getAllData())
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/logs', authRequired, requireRoles('Admin', 'Supervisor'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM logs ORDER BY created_at DESC, id DESC')
    res.json(result.rows.map(mapLog))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/logs/clear', authRequired, requireRoles('Admin'), async (req, res) => {
  try {
    const actionUser = getActionUser(req)

    await pool.query('DELETE FROM logs')

    await addLog({
      user: actionUser,
      module: 'Audit Logs',
      action: 'Clear Logs',
      description: `${actionUser} cleared all activity logs.`,
    })

    const result = await pool.query('SELECT * FROM logs ORDER BY created_at DESC, id DESC')

    res.json({
      message: 'Logs cleared successfully.',
      logs: result.rows.map(mapLog),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/users', authRequired, requireRoles('Admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id DESC')
    res.json(result.rows.map(sanitizeUser))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/users', authRequired, requireRoles('Admin'), async (req, res) => {
  try {
    const actionUser = getActionUser(req)
    const email = String(req.body.email || '').trim().toLowerCase()

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE lower(email) = $1 LIMIT 1',
      [email]
    )

    if (existing.rows.length) {
      return res.status(409).json({ message: 'Email already exists.' })
    }

    const plainPassword = req.body.password || 'password123'
    const passwordHash = await bcrypt.hash(plainPassword, 12)

    const user = {
      id: createId(),
      name: req.body.name || 'New User',
      email,
      password: 'HASHED',
      passwordHash,
      role: req.body.role || 'Encoder',
      status: req.body.status || 'Active',
    }

    const result = await pool.query(
      `
        INSERT INTO users (id, name, email, password, password_hash, role, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      [
        user.id,
        user.name,
        user.email,
        user.password,
        user.passwordHash,
        user.role,
        user.status,
      ]
    )

    await addLog({
      user: actionUser,
      module: 'Users',
      action: 'Create User',
      description: `${actionUser} created user ${user.name} (${user.role}).`,
    })

    res.status(201).json(sanitizeUser(result.rows[0]))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.patch('/api/users/:id', authRequired, requireRoles('Admin'), async (req, res) => {
  try {
    const id = Number(req.params.id)
    const actionUser = getActionUser(req)

    const existingResult = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    const existing = existingResult.rows[0]

    if (!existing) {
      return res.status(404).json({ message: 'User not found.' })
    }

    let nextPassword = existing.password
    let nextPasswordHash = existing.password_hash

    if (req.body.password) {
      nextPassword = 'HASHED'
      nextPasswordHash = await bcrypt.hash(String(req.body.password), 12)
    }

    const updated = {
      name: req.body.name ?? existing.name,
      email: req.body.email ? String(req.body.email).trim().toLowerCase() : existing.email,
      password: nextPassword,
      passwordHash: nextPasswordHash,
      role: req.body.role ?? existing.role,
      status: req.body.status ?? existing.status,
    }

    const emailOwner = await pool.query(
      'SELECT id FROM users WHERE lower(email) = $1 AND id != $2 LIMIT 1',
      [updated.email, id]
    )

    if (emailOwner.rows.length) {
      return res.status(409).json({ message: 'Email already exists.' })
    }

    const result = await pool.query(
      `
        UPDATE users
        SET name = $1,
            email = $2,
            password = $3,
            password_hash = $4,
            role = $5,
            status = $6
        WHERE id = $7
        RETURNING *
      `,
      [
        updated.name,
        updated.email,
        updated.password,
        updated.passwordHash,
        updated.role,
        updated.status,
        id,
      ]
    )

    await addLog({
      user: actionUser,
      module: 'Users',
      action: 'Update User',
      description: `${actionUser} updated user ${updated.name}.`,
    })

    res.json(sanitizeUser(result.rows[0]))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.delete('/api/users/:id', authRequired, requireRoles('Admin'), async (req, res) => {
  try {
    const id = Number(req.params.id)
    const actionUser = getActionUser(req)

    const targetResult = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    const target = targetResult.rows[0]

    if (!target) {
      return res.status(404).json({ message: 'User not found.' })
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id])

    await addLog({
      user: actionUser,
      module: 'Users',
      action: 'Delete User',
      description: `${actionUser} deleted user ${target.name}.`,
    })

    res.json({ message: 'User deleted successfully.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/branches', authRequired, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches ORDER BY id DESC')
    res.json(result.rows.map(mapBranch))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/branches', authRequired, requireRoles('Admin', 'Supervisor'), async (req, res) => {
  try {
    const actionUser = getActionUser(req)
    const branchName = String(req.body.branch || '').trim()

    if (!branchName) {
      return res.status(400).json({ message: 'Branch name is required.' })
    }

    const existing = await pool.query(
      'SELECT id FROM branches WHERE lower(branch) = $1 LIMIT 1',
      [branchName.toLowerCase()]
    )

    if (existing.rows.length) {
      return res.status(409).json({ message: 'Branch already exists.' })
    }

    const branch = {
      id: createId(),
      branch: branchName,
      department: req.body.department || 'Accounting',
      status: req.body.status || 'Active',
    }

    const result = await pool.query(
      `
        INSERT INTO branches (id, branch, department, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [branch.id, branch.branch, branch.department, branch.status]
    )

    await addLog({
      user: actionUser,
      module: 'Branches',
      action: 'Create Branch',
      description: `${actionUser} created branch ${branch.branch}.`,
    })

    res.status(201).json(mapBranch(result.rows[0]))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.patch('/api/branches/:id', authRequired, requireRoles('Admin', 'Supervisor'), async (req, res) => {
  try {
    const id = Number(req.params.id)
    const actionUser = getActionUser(req)

    const existingResult = await pool.query('SELECT * FROM branches WHERE id = $1', [id])
    const existing = existingResult.rows[0]

    if (!existing) {
      return res.status(404).json({ message: 'Branch not found.' })
    }

    const updated = {
      branch: req.body.branch ?? existing.branch,
      department: req.body.department ?? existing.department,
      status: req.body.status ?? existing.status,
    }

    const branchOwner = await pool.query(
      'SELECT id FROM branches WHERE lower(branch) = $1 AND id != $2 LIMIT 1',
      [String(updated.branch).toLowerCase(), id]
    )

    if (branchOwner.rows.length) {
      return res.status(409).json({ message: 'Branch already exists.' })
    }

    const result = await pool.query(
      `
        UPDATE branches
        SET branch = $1,
            department = $2,
            status = $3
        WHERE id = $4
        RETURNING *
      `,
      [updated.branch, updated.department, updated.status, id]
    )

    await addLog({
      user: actionUser,
      module: 'Branches',
      action: 'Update Branch',
      description: `${actionUser} updated branch ${updated.branch}.`,
    })

    res.json(mapBranch(result.rows[0]))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.delete('/api/branches/:id', authRequired, requireRoles('Admin', 'Supervisor'), async (req, res) => {
  try {
    const id = Number(req.params.id)
    const actionUser = getActionUser(req)

    const targetResult = await pool.query('SELECT * FROM branches WHERE id = $1', [id])
    const target = targetResult.rows[0]

    if (!target) {
      return res.status(404).json({ message: 'Branch not found.' })
    }

    await pool.query('DELETE FROM branches WHERE id = $1', [id])

    await addLog({
      user: actionUser,
      module: 'Branches',
      action: 'Delete Branch',
      description: `${actionUser} deleted branch ${target.branch}.`,
    })

    res.json({ message: 'Branch deleted successfully.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/records', authRequired, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM records ORDER BY id DESC')
    res.json(result.rows.map(mapRecord))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/records', authRequired, requireRoles('Admin', 'Supervisor', 'Encoder'), async (req, res) => {
  try {
    const actionUser = getActionUser(req)

    const record = {
      id: createId(),
      department: req.body.department || 'Accounting',
      service: req.body.service || 'Document Processing',
      company: req.body.company || 'Balibago Waterworks Systems, Inc.',
      branch: req.body.branch || 'Main Office',
      date: req.body.date || new Date().toISOString().slice(0, 10),
      preGroom: toNumber(req.body.preGroom),
      postGroom: toNumber(req.body.postGroom),
      scannedPdf: toNumber(req.body.scannedPdf),
      scannedPages: toNumber(req.body.scannedPages),
      indexedPdf: toNumber(req.body.indexedPdf),
      indexedPages: toNumber(req.body.indexedPages),
      qaIndexed: toNumber(req.body.qaIndexed),
      qaPages: toNumber(req.body.qaPages),
      category: req.body.category || 'General Batch',
      status: req.body.status || 'For Review',
      user: req.body.user || actionUser,
      remarks: req.body.remarks || 'No remarks.',
    }

    const result = await pool.query(
      `
        INSERT INTO records (
          id, department, service, company, branch, date,
          pre_groom, post_groom, scanned_pdf, scanned_pages,
          indexed_pdf, indexed_pages, qa_indexed, qa_pages,
          category, status, user_name, remarks
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17, $18
        )
        RETURNING *
      `,
      [
        record.id,
        record.department,
        record.service,
        record.company,
        record.branch,
        record.date,
        record.preGroom,
        record.postGroom,
        record.scannedPdf,
        record.scannedPages,
        record.indexedPdf,
        record.indexedPages,
        record.qaIndexed,
        record.qaPages,
        record.category,
        record.status,
        record.user,
        record.remarks,
      ]
    )

    await addLog({
      user: actionUser,
      module: 'Daily Output',
      action: 'Create Record',
      description: `${actionUser} created ${record.department} record for ${record.branch}.`,
    })

    res.status(201).json(mapRecord(result.rows[0]))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.patch('/api/records/:id', authRequired, requireRoles('Admin', 'Supervisor', 'Encoder'), async (req, res) => {
  try {
    const id = Number(req.params.id)
    const actionUser = getActionUser(req)

    const existingResult = await pool.query('SELECT * FROM records WHERE id = $1', [id])
    const existing = existingResult.rows[0]

    if (!existing) {
      return res.status(404).json({ message: 'Record not found.' })
    }

    const updated = {
      department: req.body.department ?? existing.department,
      service: req.body.service ?? existing.service,
      company: req.body.company ?? existing.company,
      branch: req.body.branch ?? existing.branch,
      date: req.body.date ?? existing.date,
      preGroom: req.body.preGroom !== undefined ? toNumber(req.body.preGroom) : existing.pre_groom,
      postGroom: req.body.postGroom !== undefined ? toNumber(req.body.postGroom) : existing.post_groom,
      scannedPdf: req.body.scannedPdf !== undefined ? toNumber(req.body.scannedPdf) : existing.scanned_pdf,
      scannedPages: req.body.scannedPages !== undefined ? toNumber(req.body.scannedPages) : existing.scanned_pages,
      indexedPdf: req.body.indexedPdf !== undefined ? toNumber(req.body.indexedPdf) : existing.indexed_pdf,
      indexedPages: req.body.indexedPages !== undefined ? toNumber(req.body.indexedPages) : existing.indexed_pages,
      qaIndexed: req.body.qaIndexed !== undefined ? toNumber(req.body.qaIndexed) : existing.qa_indexed,
      qaPages: req.body.qaPages !== undefined ? toNumber(req.body.qaPages) : existing.qa_pages,
      category: req.body.category ?? existing.category,
      status: req.body.status ?? existing.status,
      user: req.body.user ?? existing.user_name,
      remarks: req.body.remarks ?? existing.remarks,
    }

    const result = await pool.query(
      `
        UPDATE records
        SET department = $1,
            service = $2,
            company = $3,
            branch = $4,
            date = $5,
            pre_groom = $6,
            post_groom = $7,
            scanned_pdf = $8,
            scanned_pages = $9,
            indexed_pdf = $10,
            indexed_pages = $11,
            qa_indexed = $12,
            qa_pages = $13,
            category = $14,
            status = $15,
            user_name = $16,
            remarks = $17
        WHERE id = $18
        RETURNING *
      `,
      [
        updated.department,
        updated.service,
        updated.company,
        updated.branch,
        updated.date,
        updated.preGroom,
        updated.postGroom,
        updated.scannedPdf,
        updated.scannedPages,
        updated.indexedPdf,
        updated.indexedPages,
        updated.qaIndexed,
        updated.qaPages,
        updated.category,
        updated.status,
        updated.user,
        updated.remarks,
        id,
      ]
    )

    await addLog({
      user: actionUser,
      module: 'Daily Output',
      action: 'Update Record',
      description: `${actionUser} updated record #${id} to status ${updated.status}.`,
    })

    res.json(mapRecord(result.rows[0]))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.delete('/api/records/:id', authRequired, requireRoles('Admin', 'Supervisor'), async (req, res) => {
  try {
    const id = Number(req.params.id)
    const actionUser = getActionUser(req)

    const targetResult = await pool.query('SELECT * FROM records WHERE id = $1', [id])
    const target = targetResult.rows[0]

    if (!target) {
      return res.status(404).json({ message: 'Record not found.' })
    }

    await pool.query('DELETE FROM records WHERE id = $1', [id])

    await addLog({
      user: actionUser,
      module: 'Daily Output',
      action: 'Delete Record',
      description: `${actionUser} deleted ${target.department} record for ${target.branch}.`,
    })

    res.json({ message: 'Record deleted successfully.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/transmittals', authRequired, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transmittals ORDER BY id DESC')
    res.json(result.rows.map(mapTransmittal))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/transmittals', authRequired, requireRoles('Admin', 'Supervisor', 'Encoder'), async (req, res) => {
  try {
    const actionUser = getActionUser(req)

    const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM transmittals')
    const count = countResult.rows[0].count

    const transmittal = {
      id: createId(),
      batchNo: req.body.batchNo || `BART-TR-${String(count + 1).padStart(4, '0')}`,
      department: req.body.department || 'Accounting',
      branch: req.body.branch || 'Main Office',
      date: req.body.date || new Date().toISOString().slice(0, 10),
      documents: toNumber(req.body.documents),
      receivedBy: req.body.receivedBy || '',
      status: req.body.status || 'Pending',
      remarks: req.body.remarks || 'No remarks.',
    }

    const existing = await pool.query(
      'SELECT id FROM transmittals WHERE lower(batch_no) = $1 LIMIT 1',
      [String(transmittal.batchNo).toLowerCase()]
    )

    if (existing.rows.length) {
      return res.status(409).json({ message: 'Batch number already exists.' })
    }

    const result = await pool.query(
      `
        INSERT INTO transmittals (
          id, batch_no, department, branch, date, documents, received_by, status, remarks
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        transmittal.id,
        transmittal.batchNo,
        transmittal.department,
        transmittal.branch,
        transmittal.date,
        transmittal.documents,
        transmittal.receivedBy,
        transmittal.status,
        transmittal.remarks,
      ]
    )

    await addLog({
      user: actionUser,
      module: 'Transmittal',
      action: 'Create Transmittal',
      description: `${actionUser} created transmittal ${transmittal.batchNo}.`,
    })

    res.status(201).json(mapTransmittal(result.rows[0]))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.patch('/api/transmittals/:id', authRequired, requireRoles('Admin', 'Supervisor', 'Encoder'), async (req, res) => {
  try {
    const id = Number(req.params.id)
    const actionUser = getActionUser(req)

    const existingResult = await pool.query('SELECT * FROM transmittals WHERE id = $1', [id])
    const existing = existingResult.rows[0]

    if (!existing) {
      return res.status(404).json({ message: 'Transmittal not found.' })
    }

    const updated = {
      batchNo: req.body.batchNo ?? existing.batch_no,
      department: req.body.department ?? existing.department,
      branch: req.body.branch ?? existing.branch,
      date: req.body.date ?? existing.date,
      documents: req.body.documents !== undefined ? toNumber(req.body.documents) : existing.documents,
      receivedBy: req.body.receivedBy ?? existing.received_by,
      status: req.body.status ?? existing.status,
      remarks: req.body.remarks ?? existing.remarks,
    }

    const owner = await pool.query(
      'SELECT id FROM transmittals WHERE lower(batch_no) = $1 AND id != $2 LIMIT 1',
      [String(updated.batchNo).toLowerCase(), id]
    )

    if (owner.rows.length) {
      return res.status(409).json({ message: 'Batch number already exists.' })
    }

    const result = await pool.query(
      `
        UPDATE transmittals
        SET batch_no = $1,
            department = $2,
            branch = $3,
            date = $4,
            documents = $5,
            received_by = $6,
            status = $7,
            remarks = $8
        WHERE id = $9
        RETURNING *
      `,
      [
        updated.batchNo,
        updated.department,
        updated.branch,
        updated.date,
        updated.documents,
        updated.receivedBy,
        updated.status,
        updated.remarks,
        id,
      ]
    )

    await addLog({
      user: actionUser,
      module: 'Transmittal',
      action: 'Update Transmittal',
      description: `${actionUser} updated transmittal ${updated.batchNo} to ${updated.status}.`,
    })

    res.json(mapTransmittal(result.rows[0]))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.delete('/api/transmittals/:id', authRequired, requireRoles('Admin', 'Supervisor'), async (req, res) => {
  try {
    const id = Number(req.params.id)
    const actionUser = getActionUser(req)

    const targetResult = await pool.query('SELECT * FROM transmittals WHERE id = $1', [id])
    const target = targetResult.rows[0]

    if (!target) {
      return res.status(404).json({ message: 'Transmittal not found.' })
    }

    await pool.query('DELETE FROM transmittals WHERE id = $1', [id])

    await addLog({
      user: actionUser,
      module: 'Transmittal',
      action: 'Delete Transmittal',
      description: `${actionUser} deleted transmittal ${target.batch_no}.`,
    })

    res.json({ message: 'Transmittal deleted successfully.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/reset', authRequired, requireRoles('Admin'), async (req, res) => {
  const client = await pool.connect()

  try {
    const actionUser = getActionUser(req)

    const adminHash = await bcrypt.hash('admin123', 12)
    const encoderHash = await bcrypt.hash('encoder123', 12)
    const supervisorHash = await bcrypt.hash('supervisor123', 12)
    const viewerHash = await bcrypt.hash('viewer123', 12)

    await client.query('BEGIN')

    await client.query('DELETE FROM users')
    await client.query('DELETE FROM branches')
    await client.query('DELETE FROM records')
    await client.query('DELETE FROM transmittals')
    await client.query('DELETE FROM logs')

    await client.query(
      `
        INSERT INTO users (id, name, email, password, password_hash, role, status)
        VALUES
          (1, 'Aldrin', 'admin@bwsi.com', 'HASHED', $1, 'Admin', 'Active'),
          (2, 'A-Core Encoder', 'encoder@bwsi.com', 'HASHED', $2, 'Encoder', 'Active'),
          (3, 'A-Core Supervisor', 'supervisor@bwsi.com', 'HASHED', $3, 'Supervisor', 'Active'),
          (4, 'BART Viewer', 'viewer@bwsi.com', 'HASHED', $4, 'Viewer', 'Active')
      `,
      [adminHash, encoderHash, supervisorHash, viewerHash]
    )

    await client.query(`
      INSERT INTO branches (id, branch, department, status)
      VALUES
        (1, 'Main Office', 'Accounting', 'Active'),
        (2, 'San Pedro', 'Accounting', 'Active'),
        (3, 'Calamba', 'Accounting', 'Active'),
        (4, 'Sta. Rosa', 'Accounting', 'Active'),
        (5, 'Treasury', 'Treasury', 'Active'),
        (6, 'Billing', 'Billing', 'Active'),
        (7, 'Engineering', 'Engineering', 'Active')
    `)

    await client.query(`
      INSERT INTO records (
        id, department, service, company, branch, date,
        pre_groom, post_groom, scanned_pdf, scanned_pages,
        indexed_pdf, indexed_pages, qa_indexed, qa_pages,
        category, status, user_name, remarks
      )
      VALUES
        (1, 'Accounting', 'Document Processing', 'Balibago Waterworks Systems, Inc.', 'Main Office', '2026-05-12', 128, 110, 116, 2240, 102, 1988, 96, 1850, 'Accounting Batch', 'Approved', 'Aldrin', 'Completed accounting document batch.'),
        (2, 'Accounting', 'Document Processing', 'Balibago Waterworks Systems, Inc.', 'San Pedro', '2026-05-12', 88, 81, 74, 1395, 68, 1280, 61, 1192, 'Accounting Batch', 'For Review', 'A-Core Encoder', 'Pending supervisor validation.'),
        (3, 'Treasury', 'Indexing Only', 'Balibago Waterworks Systems, Inc.', 'Treasury', '2026-05-12', 0, 0, 0, 0, 143, 0, 132, 0, 'Collection', 'Approved', 'A-Core Encoder', 'Collection documents indexed.'),
        (4, 'Treasury', 'Indexing Only', 'Balibago Waterworks Systems, Inc.', 'Treasury', '2026-05-11', 0, 0, 0, 0, 97, 0, 91, 0, 'Disbursement', 'Returned', 'Aldrin', 'Needs category checking.')
    `)

    await client.query(`
      INSERT INTO transmittals (
        id, batch_no, department, branch, date, documents, received_by, status, remarks
      )
      VALUES
        (101, 'BART-TR-0001', 'Accounting', 'Main Office', '2026-05-12', 116, 'Accounting Receiver', 'Released', 'Initial completed accounting batch.')
    `)

    await client.query(
      `
        INSERT INTO logs (id, user_name, module, action, description)
        VALUES ($1, $2, 'System', 'Reset Data', $3)
      `,
      [
        createId(),
        actionUser,
        `${actionUser} reset the Supabase PostgreSQL database to default data.`,
      ]
    )

    await client.query('COMMIT')

    res.json(await getAllData())
  } catch (error) {
    await client.query('ROLLBACK')
    res.status(500).json({ message: error.message })
  } finally {
    client.release()
  }
})

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

async function startServer() {
  try {
    await ensureSecurityColumns()

    app.listen(PORT, () => {
      console.log(`B.A.R.T. A-Core PostgreSQL API running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()