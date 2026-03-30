import { useEffect, useState } from 'react'
import { Search, ExternalLink, FileText } from 'lucide-react'
import api from '../lib/api'

const statusOptions = ['all', 'new', 'under_review', 'approved', 'rejected']
const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700', under_review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)

  const fetchApps = () => {
    setLoading(true)
    const params: any = {}
    if (status !== 'all') params.status = status
    if (search) params.search = search
    api.get('/applications', { params })
      .then(({ data }) => { setApps(data.data || []); setTotal(data.count || 0) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchApps() }, [status, search])

  const updateStatus = async (id: string, newStatus: string) => {
    await api.patch(`/applications/${id}`, { status: newStatus })
    fetchApps()
    if (selected?.id === id) setSelected({ ...selected, status: newStatus })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">AI Builder Applications</h1>
          <p className="text-sm text-gray-500 mt-1">{total} applications received</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search applicants..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
        </div>
        <div className="flex gap-1.5">
          {statusOptions.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize cursor-pointer transition-all ${status === s ? 'bg-accent text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-accent'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-5">
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Applicant</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3">Experience</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-xs">Loading...</td></tr>}
              {!loading && apps.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-xs">No applications found.</td></tr>}
              {apps.map(app => (
                <tr key={app.id} onClick={() => setSelected(app)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === app.id ? 'bg-orange-50' : ''}`}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{app.full_name}</p>
                    <p className="text-xs text-gray-400">{app.email}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600">{app.role}</td>
                  <td className="px-5 py-3 text-xs text-gray-600">{app.years_experience ? `${app.years_experience} yrs` : '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[app.status] || 'bg-gray-100 text-gray-600'}`}>
                      {app.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">{new Date(app.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-80 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 shrink-0 overflow-y-auto max-h-[80vh]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-base">{selected.full_name}</h3>
                <p className="text-xs text-accent font-medium">{selected.role}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg leading-none">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div><p className="text-xs text-gray-400 mb-0.5">Email</p><p className="text-gray-800">{selected.email}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Timezone</p><p className="text-gray-800">{selected.timezone || '—'}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Availability</p><p className="text-gray-800 capitalize">{selected.availability?.replace('_', ' ') || '—'}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Experience</p><p className="text-gray-800">{selected.years_experience ? `${selected.years_experience} years` : '—'}</p></div>
              {selected.tech_stack?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Tech Stack</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.tech_stack.map((t: string) => <span key={t} className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 rounded">{t}</span>)}
                  </div>
                </div>
              )}
              {selected.bio && <div><p className="text-xs text-gray-400 mb-0.5">Bio</p><p className="text-gray-700 text-xs leading-relaxed">{selected.bio}</p></div>}
              <div className="flex gap-2">
                {selected.linkedin_url && <a href={selected.linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1 cursor-pointer"><ExternalLink className="h-3 w-3" />LinkedIn</a>}
                {selected.github_url && <a href={selected.github_url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1 cursor-pointer"><ExternalLink className="h-3 w-3" />GitHub</a>}
                {selected.resume_url && <a href={selected.resume_url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1 cursor-pointer"><FileText className="h-3 w-3" />Resume</a>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Update Status</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {['new', 'under_review', 'approved', 'rejected'].map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      className={`text-[10px] font-semibold py-1.5 rounded-lg capitalize cursor-pointer transition-all ${selected.status === s ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
