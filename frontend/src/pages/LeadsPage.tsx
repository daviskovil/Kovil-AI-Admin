import { useEffect, useState } from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'
import api from '../lib/api'

const statusOptions = ['all', 'new', 'contacted', 'in_progress', 'matched', 'closed', 'lost']
const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700', contacted: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-orange-100 text-orange-700', matched: 'bg-purple-100 text-purple-700',
  closed: 'bg-green-100 text-green-700', lost: 'bg-gray-100 text-gray-500',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)

  const fetchLeads = () => {
    setLoading(true)
    const params: any = {}
    if (status !== 'all') params.status = status
    if (search) params.search = search
    api.get('/leads', { params })
      .then(({ data }) => { setLeads(data.data || []); setTotal(data.count || 0) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLeads() }, [status, search])

  const updateStatus = async (id: string, newStatus: string) => {
    await api.patch(`/leads/${id}`, { status: newStatus })
    fetchLeads()
    if (selected?.id === id) setSelected({ ...selected, status: newStatus })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total enquiries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
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
        {/* Table */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3">Name / Email</th>
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-xs">Loading...</td></tr>}
              {!loading && leads.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-xs">No leads found.</td></tr>}
              {leads.map(lead => (
                <tr key={lead.id} onClick={() => setSelected(lead)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === lead.id ? 'bg-orange-50' : ''}`}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{lead.name || '—'}</p>
                    <p className="text-xs text-gray-400">{lead.email}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600 capitalize">{lead.engagement_type?.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">{new Date(lead.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-80 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 shrink-0">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-display font-bold text-base">{selected.name || 'Anonymous'}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg leading-none">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div><p className="text-xs text-gray-400 mb-0.5">Email</p><p className="text-gray-800">{selected.email}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Company</p><p className="text-gray-800">{selected.company || '—'}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Engagement</p><p className="text-gray-800 capitalize">{selected.engagement_type?.replace(/_/g, ' ')}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Project</p><p className="text-gray-700 text-xs leading-relaxed">{selected.project_description || '—'}</p></div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Status</p>
                <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent cursor-pointer">
                  {statusOptions.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div><p className="text-xs text-gray-400 mb-0.5">Submitted</p><p className="text-gray-700 text-xs">{new Date(selected.created_at).toLocaleString()}</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
