import { useEffect, useState } from 'react'
import { Shield, Plus, Trash2, X, Eye, EyeOff, UserCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'super_admin' | 'admin' | 'reviewer'
  created_at: string
  last_login?: string
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  reviewer: 'Reviewer',
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-orange-100 text-orange-700',
  admin: 'bg-blue-100 text-blue-700',
  reviewer: 'bg-gray-100 text-gray-600',
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'admin' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const callEdge = async (body: object) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token ?? SUPABASE_ANON_KEY
    const res = await fetch(`${SUPABASE_URL}/functions/v1/manage-users`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()
  }

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      // Get current user's role from profiles
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setCurrentUserRole(profile?.role ?? '')
      }

      // Fetch all users via Edge Function
      const result = await callEdge({ action: 'list' })
      if (result.error) setError(result.error)
      else setUsers(result.users ?? [])
    } catch (e) {
      setError('Failed to load users')
    }
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    const result = await callEdge({ action: 'create', ...form })
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(`User ${form.email} created successfully`)
      setShowForm(false)
      setForm({ email: '', password: '', full_name: '', role: 'admin' })
      fetchUsers()
    }
    setSubmitting(false)
  }

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return
    setDeleting(userId)
    setError('')
    const result = await callEdge({ action: 'delete', user_id: userId })
    if (result.error) setError(result.error)
    else {
      setSuccess(`User ${email} deleted`)
      fetchUsers()
    }
    setDeleting(null)
  }

  const isSuperAdmin = currentUserRole === 'super_admin'

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage admin panel access and roles</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => { setShowForm(true); setError(''); setSuccess('') }}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add User
          </button>
        )}
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 border border-red-100 flex items-center justify-between">
          {error}
          <button onClick={() => setError('')}><X className="h-4 w-4" /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 text-green-700 text-sm rounded-lg px-4 py-3 border border-green-100 flex items-center justify-between">
          {success}
          <button onClick={() => setSuccess('')}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Create User Form */}
      {showForm && isSuperAdmin && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Create New User</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="e.g. Sahdev Kumar"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="user@kovil.ai"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 pr-9 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-white"
              >
                <option value="admin">Admin — Full access, cannot manage users</option>
                <option value="reviewer">Reviewer — Read-only access</option>
              </select>
            </div>
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer">Cancel</button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">User</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Created</th>
              {isSuperAdmin && <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-12 text-sm text-gray-400">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-sm text-gray-400">No users found</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-orange-500">
                        {u.full_name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{u.full_name || '—'}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                    <Shield className="h-3 w-3" />
                    {ROLE_LABELS[u.role] ?? u.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-gray-400">
                  {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                {isSuperAdmin && (
                  <td className="px-5 py-4 text-right">
                    {u.role !== 'super_admin' && (
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        disabled={deleting === u.id}
                        className="text-red-400 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50 p-1"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role permissions legend */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="h-4 w-4 text-gray-400" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role Permissions</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { role: 'Super Admin', color: 'bg-orange-100 text-orange-700', perms: ['Full access', 'Create & delete users', 'All modules', 'Settings'] },
            { role: 'Admin', color: 'bg-blue-100 text-blue-700', perms: ['Full access', 'Cannot manage users', 'All modules', 'Settings'] },
            { role: 'Reviewer', color: 'bg-gray-100 text-gray-600', perms: ['Read-only access', 'View leads & data', 'View reports', 'No settings'] },
          ].map(r => (
            <div key={r.role} className="space-y-2">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${r.color}`}>{r.role}</span>
              <ul className="space-y-1">
                {r.perms.map(p => (
                  <li key={p} className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-gray-300 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
