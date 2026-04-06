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
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-gray-900 tracking-tight">Leads</h1>
          <p className="text-sm text-gray-400 mt-1">View and manage all client enquiries in one place.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
          />
        </div>
        <div className="flex gap-1.5 items-center">
          <Filter className="h-4 w-4 text-gray-400" />
          {statusOptions.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize cursor-pointer transition-all ${
                status === s
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-orange-300 hover:text-gray-800'
              }`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Name / Email</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Company</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Loading...</td></tr>}
              {!loading && leads.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">No leads found.</td></tr>}
              {leads.map(lead => (
                <tr key={lead.id} onClick={() => setSelected(lead)}
                  className={`cursor-pointer hover:bg-orange-50/40 transition-colors ${selected?.id === lead.id ? 'bg-orange-50' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-orange-500">{(lead.name || lead.email || '?').charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{lead.name || '—'}</p>
                        <p className="text-xs text-gray-400">{lead.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{lead.company || '—'}</td>
                  <td className="px-5 py-4 text-xs text-gray-500 capitalize">{lead.engagement_type?.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                      {lead.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">{new Date(lead.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-80 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 shrink-0">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-orange-500">{(selected.name || selected.email || '?').charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 truncate">{selected.name || 'Anonymous'}</h3>
                <p className="text-xs text-gray-400 truncate">{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 cursor-pointer text-xl leading-none">×</button>
            </div>
            <div className="space-y-3.5 text-sm">
              <div><p className="text-[11px] text-gray-400 font-medium mb-0.5 uppercase tracking-wide">Company</p><p className="text-gray-700 text-sm">{selected.company || '—'}</p></div>
              <div><p className="text-[11px] text-gray-400 font-medium mb-0.5 uppercase tracking-wide">Engagement</p><p className="text-gray-700 text-sm capitalize">{selected.engagement_type?.replace(/_/g, ' ')}</p></div>
              <div><p className="text-[11px] text-gray-400 font-medium mb-0.5 uppercase tracking-wide">Project</p><p className="text-gray-600 text-xs leading-relaxed">{selected.project_description || '—'}</p></div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium mb-1.5 uppercase tracking-wide">Status</p>
                <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 cursor-pointer bg-white">
                  {statusOptions.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div><p className="text-[11px] text-gray-400 font-medium mb-0.5 uppercase tracking-wide">Submitted</p><p className="text-gray-600 text-xs">{new Date(selected.created_at).toLocaleString()}</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
