import { useEffect, useState } from 'react'
import { Plus, Trash2, Shield } from 'lucide-react'
import api from '../lib/api'
import { AdminUser } from '../hooks/useAuth'

interface Props { currentUser: AdminUser }

export default function UserManagementPage({ currentUser }: Props) {
  const [users, setUsers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'admin' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchUsers = () => api.get('/auth/users').then(({ data }) => setUsers(data))
  useEffect(() => { fetchUsers() }, [])

  const createUser = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      await api.post('/auth/users', form)
      setSuccess('Admin user created successfully')
      setForm({ email: '', password: '', full_name: '', role: 'admin' })
      setShowForm(false)
      fetchUsers()
    } catch (e: any) { setError(e.response?.data?.error || 'Failed to create user') }
    finally { setLoading(false) }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) return
    await api.delete(`/auth/users/${id}`)
    fetchUsers()
  }

  const roleColors: Record<string, string> = {
    super_admin: 'bg-orange-100 text-orange-700',
    admin: 'bg-blue-100 text-blue-700',
    reviewer: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Super Admin only — manage admin access</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer">
          <Plus className="h-4 w-4" />Add Admin
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h3 className="font-display font-semibold text-sm mb-4">New Admin User</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[['full_name', 'Full Name', 'Jane Smith'], ['email', 'Email', 'jane@kovil.ai'], ['password', 'Password', '••••••••']].map(([key, label, ph]) => (
              <div key={key} className={key === 'email' ? 'col-span-1' : ''}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                <input type={key === 'password' ? 'password' : 'text'}
                  value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={ph} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-accent" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-accent cursor-pointer">
                <option value="admin">Admin</option>
                <option value="reviewer">Reviewer</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createUser} disabled={loading || !form.email || !form.password}
              className="bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50">
              {loading ? 'Creating...' : 'Create User'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="text-left px-5 py-3">User</th>
              <th className="text-left px-5 py-3">Role</th>
              <th className="text-left px-5 py-3">Last Login</th>
              <th className="text-left px-5 py-3">Created</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-accent">{user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-xs">{user.full_name || '—'}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${roleColors[user.role] || 'bg-gray-100 text-gray-600'}`}>
                    {user.role?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-400">{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                <td className="px-5 py-3 text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  {user.id !== currentUser.id && user.role !== 'super_admin' && (
                    <button onClick={() => deleteUser(user.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {user.role === 'super_admin' && <Shield className="h-4 w-4 text-accent" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
