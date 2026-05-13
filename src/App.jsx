import { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Users,
  Building2,
  Settings,
  Menu,
  X,
  Search,
  Droplets,
  ScanLine,
  CheckCircle2,
  Clock3,
  Plus,
  Save,
  Send,
  Download,
  UserRound,
  BadgeCheck,
  Archive,
  Database,
  FileText,
  Layers3,
  TrendingUp,
  Activity,
  Trash2,
  Pencil,
  RotateCcw,
  Loader2,
  LogOut,
  Lock,
  Mail,
} from 'lucide-react'
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const SESSION_KEY = 'bart_acore_session'

const allNavigation = [
  { id: 'dashboard', label: 'Processing Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Supervisor', 'Encoder', 'Viewer'] },
  { id: 'daily', label: 'Daily Output', icon: ClipboardList, roles: ['Admin', 'Supervisor', 'Encoder'] },
  { id: 'transmittal', label: 'Transmittal', icon: Archive, roles: ['Admin', 'Supervisor', 'Encoder'] },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'Supervisor', 'Viewer'] },
  { id: 'approvals', label: 'Approvals', icon: ShieldCheck, roles: ['Admin', 'Supervisor'] },
  { id: 'users', label: 'Users', icon: Users, roles: ['Admin'] },
  { id: 'branches', label: 'Branches', icon: Building2, roles: ['Admin', 'Supervisor'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['Admin'] },
]

const departments = ['All Departments', 'Accounting', 'Treasury', 'Billing', 'Engineering']
const realDepartments = departments.filter((department) => department !== 'All Departments')
const defaultBranches = [
  { id: 1, branch: 'Main Office', department: 'Accounting', status: 'Active' },
  { id: 2, branch: 'San Pedro', department: 'Accounting', status: 'Active' },
  { id: 3, branch: 'Calamba', department: 'Accounting', status: 'Active' },
  { id: 4, branch: 'Sta. Rosa', department: 'Accounting', status: 'Active' },
  { id: 5, branch: 'Treasury', department: 'Treasury', status: 'Active' },
  { id: 6, branch: 'Billing', department: 'Billing', status: 'Active' },
  { id: 7, branch: 'Engineering', department: 'Engineering', status: 'Active' },
]

function getBranchNames(branches) {
  const source = Array.isArray(branches) && branches.length ? branches : defaultBranches
  return source
    .filter((item) => item.status !== 'Inactive')
    .map((item) => item.branch)
}

function cls(...classes) {
  return classes.filter(Boolean).join(' ')
}

function numberFormat(value) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0)
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }))
    throw new Error(error.message || 'API request failed')
  }

  return response.json()
}

function downloadCsv(filename, rows) {
  if (!rows.length) return

  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const rawValue = row[header] ?? ''
          const escaped = String(rawValue).replaceAll('"', '""')
          return `"${escaped}"`
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@bwsi.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user))
      onLogin(data.user)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const accounts = [
    ['Admin', 'admin@bwsi.com', 'admin123'],
    ['Encoder', 'encoder@bwsi.com', 'encoder123'],
    ['Supervisor', 'supervisor@bwsi.com', 'supervisor123'],
    ['Viewer', 'viewer@bwsi.com', 'viewer123'],
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-cyan-800 p-4 text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-3 ring-1 ring-white/15">
            <Droplets className="text-cyan-200" />
            <span className="text-sm font-black uppercase tracking-[0.3em] text-cyan-100">B.A.R.T. A-Core</span>
          </div>
          <h1 className="mt-8 max-w-2xl text-6xl font-black tracking-tight">
            Document Processing & Archiving System
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-sky-50">
            Secure monitoring for daily output, scanned PDF, indexed records, QA validation, transmittal, reports, and approval workflow.
          </p>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-4">
            {['Daily Output', 'QA Review', 'Reports'].map((item) => (
              <div key={item} className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15">
                <p className="font-black text-white">{item}</p>
                <p className="mt-1 text-sm text-cyan-100">Ready</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-200">
              <Droplets size={30} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-700">Balibago Waterworks Systems, Inc.</p>
              <h2 className="text-2xl font-black">B.A.R.T. Login</h2>
            </div>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700">Email</label>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
                <Mail size={18} className="text-slate-400" />
                <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Enter email" />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700">Password</label>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
                <Lock size={18} className="text-slate-400" />
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Enter password" />
              </div>
            </div>

            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}

            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-sky-100 hover:from-sky-700 hover:to-cyan-600 disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
              Login to Dashboard
            </button>
          </form>

          <div className="mt-8 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-black text-slate-900">Demo Accounts</p>
            <div className="mt-3 space-y-2">
              {accounts.map(([role, accountEmail, accountPassword]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setEmail(accountEmail)
                    setPassword(accountPassword)
                  }}
                  className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left text-xs font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-sky-50"
                >
                  <span>{role}</span>
                  <span>{accountEmail} / {accountPassword}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Released: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Received: 'bg-blue-50 text-blue-700 ring-blue-200',
    'For Review': 'bg-amber-50 text-amber-700 ring-amber-200',
    Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    Returned: 'bg-rose-50 text-rose-700 ring-rose-200',
    Draft: 'bg-slate-50 text-slate-700 ring-slate-200',
  }

  return <span className={cls('inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1', styles[status] || styles.Draft)}>{status}</span>
}

function Sidebar({ user, activePage, setActivePage, open, setOpen, onLogout }) {
  const navigation = allNavigation.filter((item) => item.roles.includes(user.role))

  return (
    <>
      <div className={cls('fixed inset-0 z-40 bg-slate-950/50 lg:hidden', open ? 'block' : 'hidden')} onClick={() => setOpen(false)} />
      <aside className={cls('fixed left-0 top-0 z-50 h-full w-72 border-r border-slate-800 bg-slate-950 text-white shadow-xl transition-transform duration-300 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center justify-between lg:justify-start">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-lg shadow-cyan-500/20"><Droplets size={30} /></div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">B.A.R.T.</p>
                  <h1 className="text-xl font-black tracking-tight text-white">A-Core</h1>
                  <p className="text-xs font-medium text-slate-300">Document Processing</p>
                </div>
              </div>
              <button className="rounded-xl p-2 text-slate-300 hover:bg-white/10 lg:hidden" onClick={() => setOpen(false)}><X size={22} /></button>
            </div>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id
              return (
                <button key={item.id} onClick={() => { setActivePage(item.id); setOpen(false) }} className={cls('flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition', isActive ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-300 hover:bg-white/10 hover:text-white')}>
                  <Icon size={19} />{item.label}
                </button>
              )
            })}
          </nav>

          <div className="space-y-3 p-4">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-black text-cyan-200">Logged in as</p>
              <p className="mt-1 font-black text-white">{user.name}</p>
              <p className="text-sm text-slate-300">{user.role}</p>
            </div>
            <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-black text-white hover:bg-rose-700"><LogOut size={17} /> Logout</button>
          </div>
        </div>
      </aside>
    </>
  )
}

function Topbar({ user, activePage, setSidebarOpen }) {
  const navigation = allNavigation.filter((item) => item.roles.includes(user.role))
  const title = navigation.find((item) => item.id === activePage)?.label || 'Processing Dashboard'

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="rounded-2xl border border-slate-200 p-2 text-slate-700 lg:hidden" onClick={() => setSidebarOpen(true)}><Menu size={23} /></button>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-700">Balibago Waterworks Systems, Inc.</p>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
          </div>
        </div>
        <div className="hidden min-w-72 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:flex">
          <Search size={18} className="text-slate-400" /><input className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" placeholder="Search records..." />
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700"><UserRound size={18} /></div>
          <p className="hidden text-sm font-black text-slate-900 sm:block">{user.name} • {user.role}</p>
        </div>
      </div>
    </header>
  )
}

function LoadingScreen() {
  return <div className="flex min-h-[70vh] items-center justify-center"><div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><Loader2 className="mx-auto animate-spin text-sky-600" size={38} /><p className="mt-4 font-black text-slate-900">Loading B.A.R.T. data...</p><p className="mt-1 text-sm text-slate-500">Connecting to local backend API.</p></div></div>
}

function ErrorBox({ message, onRetry }) {
  return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800"><p className="font-black">Backend connection error</p><p className="mt-2 text-sm leading-6">{message}</p><button onClick={onRetry} className="mt-4 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-black text-white hover:bg-rose-700">Retry</button></div>
}

function StatCard({ label, value, icon: Icon, note, tone = 'sky', percent }) {
  const iconStyles = { sky: 'from-sky-500 to-cyan-400', emerald: 'from-emerald-500 to-teal-400', amber: 'from-amber-500 to-orange-400', indigo: 'from-indigo-500 to-blue-500', slate: 'from-slate-700 to-slate-900' }
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-bold text-slate-500">{label}</p><h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</h3><p className="mt-2 text-xs font-semibold text-slate-500">{note}</p></div>
        <div className={cls('flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', iconStyles[tone])}><Icon size={23} /></div>
      </div>
      {typeof percent === 'number' && <div className="mt-4"><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" style={{ width: `${Math.min(percent, 100)}%` }} /></div><p className="mt-2 text-xs font-bold text-slate-500">{percent}% performance rate</p></div>}
    </div>
  )
}

function SectionCard({ title, subtitle, children, action }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-lg font-black text-slate-950">{title}</h3>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>{action}</div>{children}</section>
}

function Field({ label, value, onChange, type = 'text', disabled = false }) {
  return <div><label className="text-sm font-bold text-slate-700">{label}</label><input type={type} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none ring-sky-100 transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 disabled:bg-slate-100" placeholder={`Enter ${label.toLowerCase()}`} /></div>
}

function SelectField({ label, value, onChange, options }) {
  return <div><label className="text-sm font-bold text-slate-700">{label}</label><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none ring-sky-100 transition focus:border-sky-500 focus:ring-4">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
}

function Dashboard({ records }) {
  const [departmentFilter, setDepartmentFilter] = useState('All Departments')
  const filteredRecords = useMemo(() => departmentFilter === 'All Departments' ? records : records.filter((record) => record.department === departmentFilter), [records, departmentFilter])
  const totals = useMemo(() => {
    const scannedPdf = filteredRecords.reduce((sum, record) => sum + Number(record.scannedPdf || 0), 0)
    const scannedPages = filteredRecords.reduce((sum, record) => sum + Number(record.scannedPages || 0), 0)
    const indexedPdf = filteredRecords.reduce((sum, record) => sum + Number(record.indexedPdf || 0), 0)
    const qaIndexed = filteredRecords.reduce((sum, record) => sum + Number(record.qaIndexed || 0), 0)
    const preGroom = filteredRecords.reduce((sum, record) => sum + Number(record.preGroom || 0), 0)
    const postGroom = filteredRecords.reduce((sum, record) => sum + Number(record.postGroom || 0), 0)
    const pending = filteredRecords.filter((record) => record.status === 'For Review').length
    const qaRate = indexedPdf ? Number(((qaIndexed / indexedPdf) * 100).toFixed(1)) : 0
    const indexRate = scannedPdf ? Number(((indexedPdf / scannedPdf) * 100).toFixed(1)) : 0
    return { scannedPdf, scannedPages, indexedPdf, qaIndexed, preGroom, postGroom, pending, qaRate, indexRate }
  }, [filteredRecords])

  const trendData = [
    { date: 'Mon', Scanned: 980, Indexed: 790, QA: 720 },
    { date: 'Tue', Scanned: 1220, Indexed: 980, QA: 910 },
    { date: 'Wed', Scanned: 1105, Indexed: 1010, QA: 940 },
    { date: 'Thu', Scanned: 1360, Indexed: 1180, QA: 1075 },
    { date: 'Fri', Scanned: totals.scannedPages || 1120, Indexed: totals.indexedPdf || 1040, QA: totals.qaIndexed || 990 },
  ]

  const departmentOutput = realDepartments.map((department) => {
    const items = records.filter((record) => record.department === department)
    return { department, Indexed: items.reduce((sum, record) => sum + Number(record.indexedPdf || 0), 0), QA: items.reduce((sum, record) => sum + Number(record.qaIndexed || 0), 0) }
  })

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="bg-gradient-to-br from-slate-950 via-sky-900 to-cyan-800 p-6 text-white lg:p-7"><div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-50 ring-1 ring-white/20"><Database size={15} /> Document Processing & Archiving</div><h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-4xl">B.A.R.T. Document Processing & Archiving System</h1><p className="mt-3 max-w-4xl text-base leading-7 text-sky-50">Monitoring for scanned documents, indexed files, QA validation, transmittal status, and department performance.</p></div><div className="min-w-full xl:min-w-72"><label className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">Filter by Department</label><select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-cyan-300/40">{departments.map((department) => <option key={department} value={department}>{department}</option>)}</select></div></div></div></div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Scanned PDF" value={numberFormat(totals.scannedPdf)} icon={FileText} note="Document files scanned" tone="sky" percent={Math.min(100, Math.round(totals.scannedPdf / 3))} /><StatCard label="Scanned Pages" value={numberFormat(totals.scannedPages)} icon={ScanLine} note="Total pages scanned" tone="indigo" percent={Math.min(100, Math.round(totals.scannedPages / 40))} /><StatCard label="Indexed PDF" value={numberFormat(totals.indexedPdf)} icon={Database} note="Files indexed for archiving" tone="emerald" percent={totals.indexRate} /><StatCard label="QA Completion" value={`${totals.qaRate}%`} icon={ShieldCheck} note="QA indexed PDF vs indexed PDF" tone="slate" percent={totals.qaRate} /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Pre-Groom" value={numberFormat(totals.preGroom)} icon={Layers3} note="Prepared before scanning" tone="sky" /><StatCard label="Post-Groom" value={numberFormat(totals.postGroom)} icon={CheckCircle2} note="Processed after scanning" tone="emerald" /><StatCard label="QA Indexed" value={numberFormat(totals.qaIndexed)} icon={BadgeCheck} note="Validated indexed documents" tone="indigo" /><StatCard label="Pending Review" value={numberFormat(totals.pending)} icon={Clock3} note="Waiting for approval" tone="amber" /></div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]"><SectionCard title="Document Processing Trend" subtitle="Scanned, indexed, and QA validated outputs."><div className="h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}><defs><linearGradient id="scannedGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient><linearGradient id="indexedGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0891b2" stopOpacity={0.25} /><stop offset="95%" stopColor="#0891b2" stopOpacity={0} /></linearGradient><linearGradient id="qaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.25} /><stop offset="95%" stopColor="#059669" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} /><YAxis tick={{ fill: '#64748b', fontSize: 12 }} /><Tooltip /><Area type="monotone" dataKey="Scanned" stroke="#2563eb" strokeWidth={3} fill="url(#scannedGradient)" /><Area type="monotone" dataKey="Indexed" stroke="#0891b2" strokeWidth={3} fill="url(#indexedGradient)" /><Area type="monotone" dataKey="QA" stroke="#059669" strokeWidth={3} fill="url(#qaGradient)" /></AreaChart></ResponsiveContainer></div></SectionCard><SectionCard title="Department Output" subtitle="Indexed and QA output by department."><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={departmentOutput} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="department" tick={{ fill: '#64748b', fontSize: 12 }} /><YAxis tick={{ fill: '#64748b', fontSize: 12 }} /><Tooltip /><Bar dataKey="Indexed" fill="#0e7490" radius={[10, 10, 0, 0]} /><Bar dataKey="QA" fill="#2563eb" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer></div></SectionCard></div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]"><SectionCard title="Recent Data" subtitle="Latest encoded processing records for the selected department."><RecentRecords records={filteredRecords.slice(0, 6)} /></SectionCard><SectionCard title="Processing Health" subtitle="Quick operational indicators based on current filtered data."><div className="space-y-4"><HealthRow label="Indexing Completion" value={totals.indexRate} icon={TrendingUp} /><HealthRow label="QA Completion" value={totals.qaRate} icon={ShieldCheck} /><HealthRow label="Approval Readiness" value={totals.pending === 0 ? 100 : Math.max(20, 100 - totals.pending * 20)} icon={Activity} /></div></SectionCard></div>
    </div>
  )
}

function HealthRow({ label, value, icon: Icon }) {
  return <div className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-xl bg-sky-50 p-2 text-sky-700"><Icon size={18} /></div><p className="font-black text-slate-800">{label}</p></div><p className="font-black text-slate-950">{value}%</p></div><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-gradient-to-r from-sky-600 to-cyan-400" style={{ width: `${Math.min(value, 100)}%` }} /></div></div>
}

function RecentRecords({ records }) {
  if (!records.length) return <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm font-bold text-slate-500">No records found for this filter.</div>
  return <div className="space-y-3">{records.map((record) => <div key={record.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-sky-50/50 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-black text-slate-950">{record.department}</p><StatusBadge status={record.status} /></div><p className="mt-1 text-sm text-slate-500">{record.date} • {record.branch} • {record.category}</p></div><div className="grid grid-cols-3 gap-2 text-center sm:min-w-72"><MiniMetric label="Scanned" value={record.scannedPdf} /><MiniMetric label="Indexed" value={record.indexedPdf} /><MiniMetric label="QA" value={record.qaIndexed} /></div></div>)}</div>
}

function MiniMetric({ label, value }) {
  return <div className="rounded-xl bg-slate-50 px-3 py-2"><p className="text-xs font-bold text-slate-500">{label}</p><p className="font-black text-slate-950">{numberFormat(value)}</p></div>
}

function getDefaultDailyForm() {
  return { company: 'Balibago Waterworks Systems, Inc.', branch: 'Main Office', date: new Date().toISOString().slice(0, 10), preGroom: '', postGroom: '', scannedPdf: '', scannedPages: '', indexedPdf: '', indexedPages: '', qaIndexed: '', qaPages: '', category: 'Collection', remarks: '' }
}

function DailyOutput({ user, records, setRecords, branches }) {
  const [department, setDepartment] = useState('Accounting')
  const [form, setForm] = useState(getDefaultDailyForm())
  const [saving, setSaving] = useState(false)
  const isTreasury = department === 'Treasury'
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const submit = async (status) => {
    setSaving(true)
    try {
      const payload = { department, service: isTreasury ? 'Indexing Only' : 'Document Processing', company: form.company, branch: form.branch, date: form.date, preGroom: Number(form.preGroom) || 0, postGroom: Number(form.postGroom) || 0, scannedPdf: isTreasury ? 0 : Number(form.scannedPdf) || 0, scannedPages: isTreasury ? 0 : Number(form.scannedPages) || 0, indexedPdf: Number(form.indexedPdf) || 0, indexedPages: isTreasury ? 0 : Number(form.indexedPages) || 0, qaIndexed: Number(form.qaIndexed) || 0, qaPages: isTreasury ? 0 : Number(form.qaPages) || 0, category: isTreasury ? form.category : `${department} Batch`, status, user: user.name, remarks: form.remarks || 'No remarks.' }
      const savedRecord = await apiRequest('/records', { method: 'POST', body: JSON.stringify(payload) })
      setRecords([savedRecord, ...records])
      setForm(getDefaultDailyForm())
    } catch (error) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  return <div className="space-y-6"><SectionCard title="Daily Output Encoding" subtitle="Encode daily department processing output. Treasury uses indexed count only; no pages required."><div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{realDepartments.map((item) => <button key={item} onClick={() => setDepartment(item)} className={cls('rounded-2xl border p-5 text-left transition', department === item ? 'border-sky-500 bg-sky-50 ring-4 ring-sky-100' : 'border-slate-200 bg-white hover:bg-slate-50')}><p className="text-lg font-black text-slate-950">{item}</p><p className="mt-1 text-sm leading-6 text-slate-500">{item === 'Treasury' ? 'Collection and disbursement indexing without pages.' : 'Pre-groom, scan, index, QA, and post-groom tracking.'}</p></button>)}</div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Field label="Company" value={form.company} onChange={(value) => update('company', value)} /><SelectField label="Branch" value={form.branch} onChange={(value) => update('branch', value)} options={getBranchNames(branches)} /><Field label="Date" type="date" value={form.date} onChange={(value) => update('date', value)} />{isTreasury && <SelectField label="Treasury Category" value={form.category} onChange={(value) => update('category', value)} options={['Collection', 'Disbursement']} />}{!isTreasury && <><Field label="Pre-groom" type="number" value={form.preGroom} onChange={(value) => update('preGroom', value)} /><Field label="Scanned PDF" type="number" value={form.scannedPdf} onChange={(value) => update('scannedPdf', value)} /><Field label="Scanned Pages" type="number" value={form.scannedPages} onChange={(value) => update('scannedPages', value)} /><Field label="Indexed PDF" type="number" value={form.indexedPdf} onChange={(value) => update('indexedPdf', value)} /><Field label="Indexed Pages" type="number" value={form.indexedPages} onChange={(value) => update('indexedPages', value)} /><Field label="QA Indexed" type="number" value={form.qaIndexed} onChange={(value) => update('qaIndexed', value)} /><Field label="QA Indexed Pages" type="number" value={form.qaPages} onChange={(value) => update('qaPages', value)} /><Field label="Post-groom" type="number" value={form.postGroom} onChange={(value) => update('postGroom', value)} /></>}{isTreasury && <><Field label="Indexed Count" type="number" value={form.indexedPdf} onChange={(value) => update('indexedPdf', value)} /><Field label="QA Count" type="number" value={form.qaIndexed} onChange={(value) => update('qaIndexed', value)} /></>}<div className="md:col-span-2 xl:col-span-3"><label className="text-sm font-bold text-slate-700">Remarks</label><textarea value={form.remarks} onChange={(event) => update('remarks', event.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none ring-sky-100 transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4" placeholder="Add notes or details for this daily output..." /></div></div><div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end"><button disabled={saving} onClick={() => submit('Draft')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60"><Save size={18} /> Save as Draft</button><button disabled={saving} onClick={() => submit('For Review')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-sky-100 hover:from-sky-700 hover:to-cyan-600 disabled:opacity-60">{saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Submit for Review</button></div></SectionCard></div>
}

function Reports({ records, setRecords, branches }) {
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [editingRecord, setEditingRecord] = useState(null)

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const matchesDepartment = departmentFilter === 'All' || record.department === departmentFilter
      const matchesStatus = statusFilter === 'All' || record.status === statusFilter
      const keyword = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !keyword ||
        String(record.department || '').toLowerCase().includes(keyword) ||
        String(record.branch || '').toLowerCase().includes(keyword) ||
        String(record.category || '').toLowerCase().includes(keyword) ||
        String(record.user || '').toLowerCase().includes(keyword) ||
        String(record.remarks || '').toLowerCase().includes(keyword)
      const matchesFrom = !dateFrom || record.date >= dateFrom
      const matchesTo = !dateTo || record.date <= dateTo

      return matchesDepartment && matchesStatus && matchesSearch && matchesFrom && matchesTo
    })
  }, [records, departmentFilter, statusFilter, searchTerm, dateFrom, dateTo])

  const reportTotals = useMemo(() => {
    const totalPreGroom = filtered.reduce((sum, record) => sum + Number(record.preGroom || 0), 0)
    const totalPostGroom = filtered.reduce((sum, record) => sum + Number(record.postGroom || 0), 0)
    const totalScannedPdf = filtered.reduce((sum, record) => sum + Number(record.scannedPdf || 0), 0)
    const totalScannedPages = filtered.reduce((sum, record) => sum + Number(record.scannedPages || 0), 0)
    const totalIndexedPdf = filtered.reduce((sum, record) => sum + Number(record.indexedPdf || 0), 0)
    const totalIndexedPages = filtered.reduce((sum, record) => sum + Number(record.indexedPages || 0), 0)
    const totalQaIndexed = filtered.reduce((sum, record) => sum + Number(record.qaIndexed || 0), 0)
    const totalQaPages = filtered.reduce((sum, record) => sum + Number(record.qaPages || 0), 0)
    const pending = filtered.filter((record) => record.status === 'For Review').length
    const approved = filtered.filter((record) => record.status === 'Approved').length
    const returned = filtered.filter((record) => record.status === 'Returned').length
    const qaRate = totalIndexedPdf ? Number(((totalQaIndexed / totalIndexedPdf) * 100).toFixed(1)) : 0

    return {
      totalPreGroom,
      totalPostGroom,
      totalScannedPdf,
      totalScannedPages,
      totalIndexedPdf,
      totalIndexedPages,
      totalQaIndexed,
      totalQaPages,
      pending,
      approved,
      returned,
      qaRate,
    }
  }, [filtered])

  const departmentSummary = useMemo(() => {
    return realDepartments.map((department) => {
      const items = filtered.filter((record) => record.department === department)
      const indexed = items.reduce((sum, record) => sum + Number(record.indexedPdf || 0), 0)
      const qa = items.reduce((sum, record) => sum + Number(record.qaIndexed || 0), 0)
      const scannedPages = items.reduce((sum, record) => sum + Number(record.scannedPages || 0), 0)
      const qaRate = indexed ? Number(((qa / indexed) * 100).toFixed(1)) : 0

      return {
        department,
        records: items.length,
        scannedPages,
        indexed,
        qa,
        qaRate,
      }
    })
  }, [filtered])

  const clearFilters = () => {
    setDepartmentFilter('All')
    setStatusFilter('All')
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
  }

  const exportReports = () => {
    const rows = filtered.map((record) => ({
      date: record.date,
      department: record.department,
      branch: record.branch,
      category: record.category,
      preGroom: record.preGroom,
      postGroom: record.postGroom,
      scannedPdf: record.scannedPdf,
      scannedPages: record.scannedPages,
      indexedPdf: record.indexedPdf,
      indexedPages: record.indexedPages,
      qaIndexed: record.qaIndexed,
      qaPages: record.qaPages,
      status: record.status,
      user: record.user,
      remarks: record.remarks,
    }))
    downloadCsv(`bart-acore-report-${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

  const printReport = () => {
    window.print()
  }

  const deleteRecord = async (id) => {
    const confirmDelete = window.confirm('Delete this record? This action cannot be undone.')
    if (!confirmDelete) return

    try {
      await apiRequest(`/records/${id}`, { method: 'DELETE' })
      setRecords(records.filter((record) => record.id !== id))
    } catch (error) {
      alert(error.message)
    }
  }

  const updateRecord = async (updatedRecord) => {
    try {
      const saved = await apiRequest(`/records/${updatedRecord.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedRecord),
      })
      setRecords(records.map((record) => (record.id === saved.id ? saved : record)))
      setEditingRecord(null)
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; background: white; padding: 24px; }
          .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 12mm; }
        }
      `}</style>

      <div className="space-y-6 no-print">
        <SectionCard
          title="Reports"
          subtitle="Search, filter, edit, print, and export daily output records."
          action={
            <div className="flex flex-wrap gap-2">
              <button onClick={printReport} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">
                <FileText size={16} /> Print Report
              </button>
              <button onClick={exportReports} className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-black text-white hover:bg-sky-700">
                <Download size={16} /> Export CSV
              </button>
            </div>
          }
        >
          <div className="mb-5 grid gap-3 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_auto]">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search branch, user, category, remarks..."
              />
            </div>
            <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100">
              {['All', ...realDepartments].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100">
              {['All', 'Approved', 'For Review', 'Returned', 'Draft'].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
            <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
            <button onClick={clearFilters} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-100">
              Clear
            </button>
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ReportSummaryCard label="Total Records" value={filtered.length} note="Filtered entries" />
            <ReportSummaryCard label="Indexed PDF" value={numberFormat(reportTotals.totalIndexedPdf)} note="Total indexed files" />
            <ReportSummaryCard label="QA Completion" value={`${reportTotals.qaRate}%`} note="QA indexed vs indexed" />
            <ReportSummaryCard label="Pending Review" value={reportTotals.pending} note="Needs approval" />
          </div>

          <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-base font-black text-slate-950">Department Summary</h3>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Department', 'Records', 'Scanned Pages', 'Indexed PDF', 'QA Indexed', 'QA Rate'].map((head) => (
                        <th key={head} className="whitespace-nowrap px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departmentSummary.map((row) => (
                      <tr key={row.department}>
                        <td className="whitespace-nowrap px-4 py-3 font-black text-slate-950">{row.department}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.records}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{numberFormat(row.scannedPages)}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-black text-slate-950">{numberFormat(row.indexed)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{numberFormat(row.qa)}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-black text-slate-950">{row.qaRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-sm font-bold text-slate-600">Showing <span className="text-slate-950">{filtered.length}</span> of <span className="text-slate-950">{records.length}</span> records</p>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Editable backend records</p>
          </div>

          <RecordsTable records={filtered} onDelete={deleteRecord} onEdit={setEditingRecord} />
        </SectionCard>
      </div>

      <PrintableReport
        filtered={filtered}
        reportTotals={reportTotals}
        departmentSummary={departmentSummary}
        departmentFilter={departmentFilter}
        statusFilter={statusFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />

      {editingRecord && (
        <EditRecordModal
          record={editingRecord}
          branches={branches}
          onClose={() => setEditingRecord(null)}
          onSave={updateRecord}
        />
      )}
    </>
  )
}

function ReportSummaryCard({ label, value, note }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-bold text-slate-500">{note}</p>
    </div>
  )
}

function PrintableReport({ filtered, reportTotals, departmentSummary, departmentFilter, statusFilter, dateFrom, dateTo }) {
  return (
    <div className="print-area hidden">
      <div className="mb-6 border-b border-slate-300 pb-4">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-500">Balibago Waterworks Systems, Inc.</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">B.A.R.T. A-Core Daily Output Report</h1>
        <p className="mt-2 text-sm text-slate-600">
          Department: {departmentFilter} • Status: {statusFilter} • Date From: {dateFrom || 'All'} • Date To: {dateTo || 'All'}
        </p>
        <p className="mt-1 text-sm text-slate-600">Generated: {new Date().toLocaleString()}</p>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-3">
        <div className="border border-slate-300 p-3"><p className="text-xs font-bold text-slate-500">Total Records</p><p className="text-xl font-black">{filtered.length}</p></div>
        <div className="border border-slate-300 p-3"><p className="text-xs font-bold text-slate-500">Indexed PDF</p><p className="text-xl font-black">{numberFormat(reportTotals.totalIndexedPdf)}</p></div>
        <div className="border border-slate-300 p-3"><p className="text-xs font-bold text-slate-500">QA Completion</p><p className="text-xl font-black">{reportTotals.qaRate}%</p></div>
        <div className="border border-slate-300 p-3"><p className="text-xs font-bold text-slate-500">Pending Review</p><p className="text-xl font-black">{reportTotals.pending}</p></div>
      </div>

      <h2 className="mb-2 text-lg font-black text-slate-950">Department Summary</h2>
      <table className="mb-6 w-full border-collapse text-xs">
        <thead>
          <tr>
            {['Department', 'Records', 'Scanned Pages', 'Indexed PDF', 'QA Indexed', 'QA Rate'].map((head) => (
              <th key={head} className="border border-slate-300 bg-slate-100 p-2 text-left font-black">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departmentSummary.map((row) => (
            <tr key={row.department}>
              <td className="border border-slate-300 p-2 font-bold">{row.department}</td>
              <td className="border border-slate-300 p-2">{row.records}</td>
              <td className="border border-slate-300 p-2">{numberFormat(row.scannedPages)}</td>
              <td className="border border-slate-300 p-2">{numberFormat(row.indexed)}</td>
              <td className="border border-slate-300 p-2">{numberFormat(row.qa)}</td>
              <td className="border border-slate-300 p-2">{row.qaRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mb-2 text-lg font-black text-slate-950">Detailed Records</h2>
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr>
            {['Date', 'Department', 'Branch', 'Category', 'Pre-Groom', 'Scanned PDF', 'Scanned Pages', 'Indexed PDF', 'Indexed Pages', 'QA Indexed', 'QA Pages', 'Status', 'User'].map((head) => (
              <th key={head} className="border border-slate-300 bg-slate-100 p-1 text-left font-black">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((record) => (
            <tr key={record.id}>
              <td className="border border-slate-300 p-1">{record.date}</td>
              <td className="border border-slate-300 p-1">{record.department}</td>
              <td className="border border-slate-300 p-1">{record.branch}</td>
              <td className="border border-slate-300 p-1">{record.category}</td>
              <td className="border border-slate-300 p-1">{record.preGroom}</td>
              <td className="border border-slate-300 p-1">{record.scannedPdf}</td>
              <td className="border border-slate-300 p-1">{record.scannedPages}</td>
              <td className="border border-slate-300 p-1">{record.indexedPdf}</td>
              <td className="border border-slate-300 p-1">{record.indexedPages}</td>
              <td className="border border-slate-300 p-1">{record.qaIndexed}</td>
              <td className="border border-slate-300 p-1">{record.qaPages}</td>
              <td className="border border-slate-300 p-1">{record.status}</td>
              <td className="border border-slate-300 p-1">{record.user}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EditRecordModal({ record, branches, onClose, onSave }) {
  const [form, setForm] = useState({ ...record })
  const isTreasury = form.department === 'Treasury'

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const save = () => {
    const cleaned = {
      ...form,
      preGroom: Number(form.preGroom) || 0,
      postGroom: Number(form.postGroom) || 0,
      scannedPdf: isTreasury ? 0 : Number(form.scannedPdf) || 0,
      scannedPages: isTreasury ? 0 : Number(form.scannedPages) || 0,
      indexedPdf: Number(form.indexedPdf) || 0,
      indexedPages: isTreasury ? 0 : Number(form.indexedPages) || 0,
      qaIndexed: Number(form.qaIndexed) || 0,
      qaPages: isTreasury ? 0 : Number(form.qaPages) || 0,
      category: isTreasury ? form.category : `${form.department} Batch`,
    }
    onSave(cleaned)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-950">Edit Daily Output</h3>
            <p className="mt-1 text-sm text-slate-500">Update record details and save changes to backend database.</p>
          </div>
          <button onClick={onClose} className="rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SelectField label="Department" value={form.department} onChange={(value) => update('department', value)} options={realDepartments} />
          <Field label="Company" value={form.company} onChange={(value) => update('company', value)} />
          <SelectField label="Branch" value={form.branch} onChange={(value) => update('branch', value)} options={getBranchNames(branches)} />
          <Field label="Date" type="date" value={form.date} onChange={(value) => update('date', value)} />
          <SelectField label="Status" value={form.status} onChange={(value) => update('status', value)} options={['Draft', 'For Review', 'Approved', 'Returned']} />

          {isTreasury && (
            <SelectField label="Treasury Category" value={form.category} onChange={(value) => update('category', value)} options={['Collection', 'Disbursement']} />
          )}

          {!isTreasury && (
            <>
              <Field label="Pre-groom" type="number" value={form.preGroom} onChange={(value) => update('preGroom', value)} />
              <Field label="Scanned PDF" type="number" value={form.scannedPdf} onChange={(value) => update('scannedPdf', value)} />
              <Field label="Scanned Pages" type="number" value={form.scannedPages} onChange={(value) => update('scannedPages', value)} />
              <Field label="Indexed PDF" type="number" value={form.indexedPdf} onChange={(value) => update('indexedPdf', value)} />
              <Field label="Indexed Pages" type="number" value={form.indexedPages} onChange={(value) => update('indexedPages', value)} />
              <Field label="QA Indexed" type="number" value={form.qaIndexed} onChange={(value) => update('qaIndexed', value)} />
              <Field label="QA Indexed Pages" type="number" value={form.qaPages} onChange={(value) => update('qaPages', value)} />
              <Field label="Post-groom" type="number" value={form.postGroom} onChange={(value) => update('postGroom', value)} />
            </>
          )}

          {isTreasury && (
            <>
              <Field label="Indexed Count" type="number" value={form.indexedPdf} onChange={(value) => update('indexedPdf', value)} />
              <Field label="QA Count" type="number" value={form.qaIndexed} onChange={(value) => update('qaIndexed', value)} />
            </>
          )}

          <div className="md:col-span-2 xl:col-span-3">
            <label className="text-sm font-bold text-slate-700">Remarks</label>
            <textarea
              value={form.remarks || ''}
              onChange={(event) => update('remarks', event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none ring-sky-100 transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4"
              placeholder="Update remarks..."
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={save} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-sky-100 hover:from-sky-700 hover:to-cyan-600">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function RecordsTable({ records, onDelete, onEdit }) {
  return <div className="overflow-hidden rounded-2xl border border-slate-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr>{['Date', 'Department', 'Branch', 'Category', 'Scanned PDF', 'Scanned Pages', 'Indexed', 'QA', 'Status', 'User', 'Action'].map((head) => <th key={head} className="whitespace-nowrap px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 bg-white">{records.map((record) => <tr key={record.id} className="hover:bg-sky-50/50"><td className="whitespace-nowrap px-4 py-4 font-bold text-slate-700">{record.date}</td><td className="whitespace-nowrap px-4 py-4 font-bold text-slate-950">{record.department}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{record.branch}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{record.category}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{numberFormat(record.scannedPdf)}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{numberFormat(record.scannedPages)}</td><td className="whitespace-nowrap px-4 py-4 font-black text-slate-950">{numberFormat(record.indexedPdf)}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{numberFormat(record.qaIndexed)}</td><td className="whitespace-nowrap px-4 py-4"><StatusBadge status={record.status} /></td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{record.user}</td><td className="whitespace-nowrap px-4 py-4"><div className="flex gap-2"><button onClick={() => onEdit(record)} className="rounded-xl bg-sky-50 p-2 text-sky-700 hover:bg-sky-100" title="Edit record"><Pencil size={16} /></button><button onClick={() => onDelete(record.id)} className="rounded-xl bg-rose-50 p-2 text-rose-700 hover:bg-rose-100" title="Delete record"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div></div>
}

function Approvals({ records, setRecords }) {
  const pending = records.filter((record) => record.status === 'For Review' || record.status === 'Returned' || record.status === 'Draft')
  const changeStatus = async (id, status) => {
    try { const updated = await apiRequest(`/records/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); setRecords(records.map((record) => record.id === id ? updated : record)) } catch (error) { alert(error.message) }
  }
  return <SectionCard title="Approvals" subtitle="Review submitted daily output records before final reporting."><div className="grid gap-4">{pending.length === 0 && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800"><div className="flex items-center gap-3 font-black"><CheckCircle2 /> No pending approvals</div><p className="mt-2 text-sm">All submitted records are already cleared.</p></div>}{pending.map((record) => <div key={record.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-slate-950">{record.department} - {record.branch}</h3><StatusBadge status={record.status} /></div><p className="mt-2 text-sm leading-6 text-slate-600">Date: <b>{record.date}</b> • Indexed: <b>{numberFormat(record.indexedPdf)}</b> • QA: <b>{numberFormat(record.qaIndexed)}</b> • User: <b>{record.user}</b></p><p className="mt-1 text-sm text-slate-500">{record.remarks}</p></div><div className="flex flex-col gap-2 sm:flex-row"><button onClick={() => changeStatus(record.id, 'Returned')} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 hover:bg-rose-100">Return</button><button onClick={() => changeStatus(record.id, 'For Review')} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-black text-amber-700 hover:bg-amber-100">Review</button><button onClick={() => changeStatus(record.id, 'Approved')} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-700">Approve</button></div></div></div>)}</div></SectionCard>
}

function getDefaultTransmittalForm(count) {
  return { batchNo: `BART-TR-${String(count + 1).padStart(4, '0')}`, department: 'Accounting', branch: 'Main Office', date: new Date().toISOString().slice(0, 10), documents: '', receivedBy: '', status: 'Pending', remarks: '' }
}

function TransmittalPage({ transmittals, setTransmittals, branches }) {
  const [form, setForm] = useState(getDefaultTransmittalForm(transmittals.length))
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const submit = async () => {
    try { const payload = { ...form, documents: Number(form.documents) || 0, remarks: form.remarks || 'No remarks.' }; const savedItem = await apiRequest('/transmittals', { method: 'POST', body: JSON.stringify(payload) }); setTransmittals([savedItem, ...transmittals]); setForm(getDefaultTransmittalForm(transmittals.length + 1)) } catch (error) { alert(error.message) }
  }
  const exportTransmittals = () => downloadCsv(`bart-acore-transmittal-${new Date().toISOString().slice(0, 10)}.csv`, transmittals)
  const changeStatus = async (id, status) => {
    try { const updated = await apiRequest(`/transmittals/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); setTransmittals(transmittals.map((item) => item.id === id ? updated : item)) } catch (error) { alert(error.message) }
  }
  const deleteItem = async (id) => {
    try { await apiRequest(`/transmittals/${id}`, { method: 'DELETE' }); setTransmittals(transmittals.filter((item) => item.id !== id)) } catch (error) { alert(error.message) }
  }

  return <div className="space-y-6"><SectionCard title="Transmittal Monitoring" subtitle="Track batch turnover, receiving status, and document release."><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Field label="Batch No." value={form.batchNo} onChange={(value) => update('batchNo', value)} /><SelectField label="Department" value={form.department} onChange={(value) => update('department', value)} options={realDepartments} /><SelectField label="Branch" value={form.branch} onChange={(value) => update('branch', value)} options={getBranchNames(branches)} /><Field label="Date" type="date" value={form.date} onChange={(value) => update('date', value)} /><Field label="Document Count" type="number" value={form.documents} onChange={(value) => update('documents', value)} /><Field label="Received By" value={form.receivedBy} onChange={(value) => update('receivedBy', value)} /><SelectField label="Status" value={form.status} onChange={(value) => update('status', value)} options={['Pending', 'Released', 'Received']} /><div className="md:col-span-2 xl:col-span-3"><label className="text-sm font-bold text-slate-700">Remarks</label><textarea value={form.remarks} onChange={(event) => update('remarks', event.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none ring-sky-100 transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4" placeholder="Add transmittal remarks..." /></div></div><div className="mt-6 flex justify-end"><button onClick={submit} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-sky-100 hover:from-sky-700 hover:to-cyan-600"><Plus size={18} /> Add Transmittal</button></div></SectionCard><SectionCard title="Transmittal Records" subtitle="Current batch release and receiving list." action={<button onClick={exportTransmittals} className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-black text-white hover:bg-sky-700"><Download size={16} /> Export CSV</button>}><div className="overflow-hidden rounded-2xl border border-slate-200"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr>{['Batch No.', 'Date', 'Department', 'Branch', 'Docs', 'Received By', 'Status', 'Action'].map((head) => <th key={head} className="whitespace-nowrap px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 bg-white">{transmittals.map((item) => <tr key={item.id} className="hover:bg-sky-50/50"><td className="whitespace-nowrap px-4 py-4 font-black text-slate-950">{item.batchNo}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{item.date}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{item.department}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{item.branch}</td><td className="whitespace-nowrap px-4 py-4 font-black text-slate-950">{numberFormat(item.documents)}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{item.receivedBy || '-'}</td><td className="whitespace-nowrap px-4 py-4"><StatusBadge status={item.status} /></td><td className="whitespace-nowrap px-4 py-4"><div className="flex gap-2"><button onClick={() => changeStatus(item.id, 'Released')} className="rounded-xl bg-blue-50 p-2 text-blue-700 hover:bg-blue-100" title="Mark released"><Send size={16} /></button><button onClick={() => changeStatus(item.id, 'Received')} className="rounded-xl bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100" title="Mark received"><CheckCircle2 size={16} /></button><button onClick={() => deleteItem(item.id)} className="rounded-xl bg-rose-50 p-2 text-rose-700 hover:bg-rose-100" title="Delete"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div></div></SectionCard></div>
}

function UsersPage({ users = [], setUsers, currentUser }) {
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    if (!keyword) return users

    return users.filter((user) => {
      return (
        String(user.name || '').toLowerCase().includes(keyword) ||
        String(user.email || '').toLowerCase().includes(keyword) ||
        String(user.role || '').toLowerCase().includes(keyword) ||
        String(user.status || '').toLowerCase().includes(keyword)
      )
    })
  }, [users, searchTerm])

  const openAddModal = () => {
    setEditingUser(null)
    setShowModal(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setShowModal(true)
  }

  const saveUser = async (form) => {
    try {
      if (editingUser) {
        const updated = await apiRequest(`/users/${editingUser.id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        })
        setUsers(users.map((user) => (user.id === updated.id ? updated : user)))
      } else {
        const created = await apiRequest('/users', {
          method: 'POST',
          body: JSON.stringify(form),
        })
        setUsers([created, ...users])
      }

      setShowModal(false)
      setEditingUser(null)
    } catch (error) {
      alert(error.message)
    }
  }

  const toggleStatus = async (user) => {
    if (currentUser && currentUser.id === user.id) {
      alert('You cannot disable your own active session.')
      return
    }

    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active'

    try {
      const updated = await apiRequest(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })
      setUsers(users.map((item) => (item.id === updated.id ? updated : item)))
    } catch (error) {
      alert(error.message)
    }
  }

  const deleteUser = async (user) => {
    if (currentUser && currentUser.id === user.id) {
      alert('You cannot delete your own account while logged in.')
      return
    }

    const confirmDelete = window.confirm(`Delete user ${user.name}? This cannot be undone.`)
    if (!confirmDelete) return

    try {
      await apiRequest(`/users/${user.id}`, { method: 'DELETE' })
      setUsers(users.filter((item) => item.id !== user.id))
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <>
      <SectionCard
        title="User Management"
        subtitle="Add, edit, disable, activate, and delete system users."
        action={
          <button onClick={openAddModal} className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-black text-white hover:bg-sky-700">
            <Plus size={16} /> Add User
          </button>
        }
      >
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Search user name, email, role, or status..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <UserRound />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-950">{user.name}</h3>
                    <p className="text-sm font-bold text-slate-500">{user.email}</p>
                  </div>
                </div>
                <StatusBadge status={user.status} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-500">Role</p>
                  <p className="font-black text-slate-950">{user.role}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-500">Status</p>
                  <p className={cls('font-black', user.status === 'Active' ? 'text-emerald-700' : 'text-rose-700')}>{user.status}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <button onClick={() => openEditModal(user)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-50 px-3 py-2 text-xs font-black text-sky-700 hover:bg-sky-100">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => toggleStatus(user)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 hover:bg-amber-100">
                  {user.status === 'Active' ? 'Disable' : 'Activate'}
                </button>
                <button onClick={() => deleteUser(user)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 hover:bg-rose-100">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {!filteredUsers.length && (
          <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
            <p className="font-black text-slate-700">No users found.</p>
            <p className="mt-1 text-sm text-slate-500">Try clearing your search or add a new user.</p>
          </div>
        )}
      </SectionCard>

      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowModal(false)
            setEditingUser(null)
          }}
          onSave={saveUser}
        />
      )}
    </>
  )
}

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'Encoder',
    status: user?.status || 'Active',
  })

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const save = () => {
    if (!form.name.trim()) {
      alert('Name is required.')
      return
    }

    if (!form.email.trim()) {
      alert('Email is required.')
      return
    }

    if (!user && !form.password.trim()) {
      alert('Password is required for new users.')
      return
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      status: form.status,
    }

    if (form.password.trim()) {
      payload.password = form.password.trim()
    }

    onSave(payload)
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-950">{user ? 'Edit User' : 'Add User'}</h3>
            <p className="mt-1 text-sm text-slate-500">Manage account role, status, and login credentials.</p>
          </div>
          <button onClick={onClose} className="rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full Name" value={form.name} onChange={(value) => update('name', value)} />
          <Field label="Email" type="email" value={form.email} onChange={(value) => update('email', value)} />
          <Field label={user ? 'New Password Optional' : 'Password'} type="password" value={form.password} onChange={(value) => update('password', value)} />
          <SelectField label="Role" value={form.role} onChange={(value) => update('role', value)} options={['Admin', 'Encoder', 'Supervisor', 'Viewer']} />
          <SelectField label="Status" value={form.status} onChange={(value) => update('status', value)} options={['Active', 'Inactive']} />
        </div>

        <div className="mt-6 rounded-3xl border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm font-black text-sky-900">Role Guide</p>
          <p className="mt-1 text-sm leading-6 text-sky-800">
            Admin has full access. Encoder can encode daily output. Supervisor can review approvals. Viewer can only view dashboard and reports.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={save} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-sky-100 hover:from-sky-700 hover:to-cyan-600">
            <Save size={18} /> Save User
          </button>
        </div>
      </div>
    </div>
  )
}

function BranchesPage({ branches, setBranches }) {
  const [showForm, setShowForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    branch: '',
    department: 'Accounting',
    status: 'Active',
  })

  const openAddForm = () => {
    setEditingBranch(null)
    setForm({ branch: '', department: 'Accounting', status: 'Active' })
    setShowForm(true)
  }

  const openEditForm = (selectedBranch) => {
    setEditingBranch(selectedBranch)
    setForm({
      branch: selectedBranch.branch || '',
      department: selectedBranch.department || 'Accounting',
      status: selectedBranch.status || 'Active',
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingBranch(null)
    setForm({ branch: '', department: 'Accounting', status: 'Active' })
  }

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const saveBranch = async (event) => {
    event.preventDefault()

    if (!form.branch.trim()) {
      alert('Branch name is required.')
      return
    }

    setSaving(true)

    try {
      const payload = {
        branch: form.branch.trim(),
        department: form.department,
        status: form.status,
      }

      if (editingBranch) {
        const updated = await apiRequest(`/branches/${editingBranch.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })

        setBranches(branches.map((branch) => (branch.id === editingBranch.id ? updated : branch)))
      } else {
        const created = await apiRequest('/branches', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        setBranches([created, ...branches])
      }

      closeForm()
    } catch (error) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (selectedBranch) => {
    const nextStatus = selectedBranch.status === 'Active' ? 'Inactive' : 'Active'

    try {
      const updated = await apiRequest(`/branches/${selectedBranch.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })

      setBranches(branches.map((branch) => (branch.id === selectedBranch.id ? updated : branch)))
    } catch (error) {
      alert(error.message)
    }
  }

  const deleteBranch = async (selectedBranch) => {
    const confirmed = window.confirm(`Delete branch ${selectedBranch.branch}?`)

    if (!confirmed) return

    try {
      await apiRequest(`/branches/${selectedBranch.id}`, { method: 'DELETE' })
      setBranches(branches.filter((branch) => branch.id !== selectedBranch.id))
    } catch (error) {
      alert(error.message)
    }
  }

  const activeCount = branches.filter((branch) => branch.status === 'Active').length
  const inactiveCount = branches.filter((branch) => branch.status === 'Inactive').length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Branches" value={numberFormat(branches.length)} icon={Building2} note="Configured service branches" tone="sky" />
        <StatCard label="Active Branches" value={numberFormat(activeCount)} icon={CheckCircle2} note="Available in encoding forms" tone="emerald" />
        <StatCard label="Inactive Branches" value={numberFormat(inactiveCount)} icon={Clock3} note="Hidden from active forms" tone="amber" />
        <StatCard label="Departments" value={numberFormat(realDepartments.length)} icon={Layers3} note="Supported service groups" tone="indigo" />
      </div>

      <SectionCard
        title="Branch Management"
        subtitle="Add, edit, disable, activate, or delete branches used in Daily Output and Transmittal forms."
        action={
          <button onClick={openAddForm} className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-black text-white hover:bg-sky-700">
            <Plus size={16} /> Add Branch
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {branches.map((item) => (
            <div key={item.id || item.branch} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                    <Building2 />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-950">{item.branch}</h3>
                    <p className="text-sm font-bold text-slate-500">{item.department}</p>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-500">Department</p>
                  <p className="font-black text-slate-950">{item.department}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-500">Status</p>
                  <p className={cls('font-black', item.status === 'Active' ? 'text-emerald-700' : 'text-rose-700')}>{item.status}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <button onClick={() => openEditForm(item)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
                  Edit
                </button>
                <button onClick={() => toggleStatus(item)} className={cls('rounded-2xl px-3 py-2 text-xs font-black', item.status === 'Active' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100')}>
                  {item.status === 'Active' ? 'Disable' : 'Activate'}
                </button>
                <button onClick={() => deleteBranch(item)} className="rounded-2xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 hover:bg-rose-100">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-700">Branch Management</p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">{editingBranch ? 'Edit Branch' : 'Add Branch'}</h3>
                <p className="mt-1 text-sm text-slate-500">Maintain branch availability for operational encoding.</p>
              </div>
              <button onClick={closeForm} className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveBranch} className="mt-6 grid gap-4">
              <Field label="Branch Name" value={form.branch} onChange={(value) => update('branch', value)} />
              <SelectField label="Department" value={form.department} onChange={(value) => update('department', value)} options={realDepartments} />
              <SelectField label="Status" value={form.status} onChange={(value) => update('status', value)} options={['Active', 'Inactive']} />

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeForm} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button disabled={saving} type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-sky-100 hover:from-sky-700 hover:to-cyan-600 disabled:opacity-60">
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {editingBranch ? 'Save Changes' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsPage({ onReset }) {
  return <div className="grid gap-6 xl:grid-cols-2"><SectionCard title="System Settings" subtitle="Core configuration for B.A.R.T. A-Core monitoring."><div className="space-y-4"><Field label="Company Name" value="Balibago Waterworks Systems, Inc." onChange={() => {}} disabled /><Field label="Team Name" value="A-Core" onChange={() => {}} disabled /><SelectField label="Default Department" value="Accounting" onChange={() => {}} options={realDepartments} /></div></SectionCard><SectionCard title="Data Control" subtitle="Backend data controls for this development version."><div className="rounded-3xl border border-amber-200 bg-amber-50 p-5"><p className="font-black text-amber-900">Reset Demo Data</p><p className="mt-2 text-sm leading-6 text-amber-800">This clears saved records from db.json and returns the system to the default sample data.</p><button onClick={onReset} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2 text-sm font-black text-white hover:bg-amber-700"><RotateCcw size={16} /> Reset Data</button></div></SectionCard></div>
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [records, setRecords] = useState([])
  const [transmittals, setTransmittals] = useState([])
  const [users, setUsers] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const allowedPages = useMemo(() => user ? allNavigation.filter((item) => item.roles.includes(user.role)).map((item) => item.id) : [], [user])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiRequest('/data')
      setRecords(data.records || [])
      setTransmittals(data.transmittals || [])
      setUsers(data.users || [])
      setBranches(data.branches || defaultBranches)
    } catch (error) {
      setError(`${error.message}. Make sure backend is running on http://localhost:4000`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadData()
  }, [user])

  useEffect(() => {
    if (user && allowedPages.length && !allowedPages.includes(activePage)) {
      setActivePage(allowedPages[0])
    }
  }, [user, allowedPages, activePage])

  const resetData = async () => {
    try {
      const data = await apiRequest('/reset', { method: 'POST' })
      setRecords(data.records || [])
      setTransmittals(data.transmittals || [])
      setUsers(data.users || [])
      setBranches(data.branches || defaultBranches)
    } catch (error) {
      alert(error.message)
    }
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    setActivePage('dashboard')
  }

  if (!user) return <LoginPage onLogin={setUser} />

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar user={user} activePage={activePage} setActivePage={setActivePage} open={sidebarOpen} setOpen={setSidebarOpen} onLogout={logout} />
      <div className="lg:pl-72">
        <Topbar user={user} activePage={activePage} setSidebarOpen={setSidebarOpen} />
        <main className="p-4 sm:p-6 lg:p-8">
          {loading && <LoadingScreen />}
          {!loading && error && <ErrorBox message={error} onRetry={loadData} />}
          {!loading && !error && (
            <>
              {activePage === 'dashboard' && <Dashboard records={records} />}
              {activePage === 'daily' && <DailyOutput user={user} records={records} setRecords={setRecords} branches={branches} />}
              {activePage === 'transmittal' && <TransmittalPage transmittals={transmittals} setTransmittals={setTransmittals} branches={branches} />}
              {activePage === 'reports' && <Reports records={records} setRecords={setRecords} branches={branches} />}
              {activePage === 'approvals' && <Approvals records={records} setRecords={setRecords} />}
              {activePage === 'users' && <UsersPage users={users} setUsers={setUsers} currentUser={user} />}
              {activePage === 'branches' && <BranchesPage branches={branches} setBranches={setBranches} />}
              {activePage === 'settings' && <SettingsPage onReset={resetData} />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
