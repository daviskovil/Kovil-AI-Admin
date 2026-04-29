import { useEffect, useState } from 'react'
import { Search, Download, Filter, RefreshCw, Trash2, X, Mail, Building2, Tag, Globe, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Lead {
  id: string
  name?: string
  company?: string
  email?: string
  engagement_type?: string
  project_description?: string
  source?: string
  status?: string
  created_at?: string
}

const STATUS_OPTIONS = ['all', 'new', 'contacted', 'qualified', 'closed-won', 'closed-lost']

function statusBadge(s: string) {
  const map: Record<string, string> = {
    new:           'bg-blue-50 text-blue-700',
    contacted:     'bg-amber-50 text-amber-700',
    qualified:     'bg-purple-50 text-purple-700',
    'closed-won':  'bg-green-50 text-green-700',
    'closed-lost': 'bg-gray-100 text-gray-500',
    in_progress:   'bg-orange-50 text-orange-700',
    matched:       'bg-purple-50 text-purple-700',
    closed:        'bg-green-50 text-green-700',
    lost:          'bg-gray-100 text-gray-500',
  }
  return map[s] || 'bg-gray-100 text-gray-600'
}

const fmt = (s?: string) => s?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '—'
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<Lead | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const fetchLeads = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setLeads(data)
    else console.error('Leads fetch error:', error)
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [])

  const filtered = leads.filter(l => {
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter
    const q = search.toLowerCase()
    const matchesSearch = !q || [l.name, l.email, l.company].some(v => v?.toLowerCase().includes(q))
    return matchesStatus && matchesSearch
  })

  const toggleCheck = (id: string) => {
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  const toggleAll = () => setChecked(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(l => l.id)))

  const deleteChecked = async () => {
    if (!window.confirm(`Delete ${checked.size} lead${checked.size > 1 ? 's' : ''}? This cannot be undone.`)) return
    const results = await Promise.all([...checked].map(id => supabase.from('leads').delete().eq('id', id)))
    const failed = results.filter(r => r.error)
    if (failed.length) { alert(`Delete failed: ${failed[0].error?.message}`); return }
    setChecked(new Set())
    fetchLeads()
  }

  const deleteLead = async (id: string) => {
    if (!window.confirm('Delete this lead? This cannot be undone.')) return
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) { alert(`Delete failed: ${error.message}`); return }
    setSelected(null)
    fetchLeads()
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('leads').update({ status }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : s)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-gray-900 tracking-tight">Leads</h1>
          <p className="text-sm text-gray-400 mt-1">All client enquiries from the website — {leads.length} total</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, company…"
            className="w-full pl-8 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize cursor-pointer transition-all ${statusFilter === s ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:border-orange-300 hover:text-gray-800'}`}>
              {s === 'all' ? 'All' : fmt(s)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {checked.size > 0 && (
            <button onClick={deleteChecked} className="flex items-center gap-1.5 text-xs text-white bg-red-500 hover:bg-red-600 rounded-lg px-3 py-2 font-semibold cursor-pointer">
              <Trash2 className="h-3.5 w-3.5" /> Delete {checked.size}
            </button>
          )}
          <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button onClick={fetchLeads} className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:border-orange-300 hover:text-orange-500 cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading leads from Supabase…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-gray-500 mb-1">No leads found</p>
            <p className="text-xs text-gray-400">Leads submitted via the website will appear here automatically.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pl-5 py-3 w-8">
                  <input type="checkbox" checked={checked.size === filtered.length && filtered.length > 0} onChange={toggleAll}
                    className="rounded border-gray-300 accent-orange-500 cursor-pointer" />
                </th>
                {['Name / Email', 'Company', 'Engagement', 'Source', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(lead => (
                <tr key={lead.id} className={`hover:bg-gray-50 transition-colors ${checked.has(lead.id) ? 'bg-red-50/40' : ''}`}>
                  <td className="pl-5 py-3.5 w-8">
                    <input type="checkbox" checked={checked.has(lead.id)} onChange={() => toggleCheck(lead.id)}
                      className="rounded border-gray-300 accent-orange-500 cursor-pointer" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-orange-500">{(lead.name || lead.email || '?').charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{lead.name || '—'}</p>
                        <p className="text-[10px] text-gray-400">{lead.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-600">{lead.company || '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-600">{fmt(lead.engagement_type)}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-600">{fmt(lead.source)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusBadge(lead.status ?? 'new')}`}>
                      {(lead.status ?? 'new').replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">{fmtDate(lead.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setSelected(lead)} className="text-[10px] text-orange-500 font-semibold hover:underline cursor-pointer">
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Lead Detail</p>
                <h2 className="text-lg font-bold text-gray-900">{selected.name || selected.email || 'Unknown'}</h2>
                {selected.company && <p className="text-sm text-gray-400 mt-0.5">{selected.company}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => deleteLead(selected.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors cursor-pointer" title="Delete lead">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Status bar */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${statusBadge(selected.status ?? 'new')}`}>
                {(selected.status ?? 'new').replace('-', ' ')}
              </span>
              <span className="text-xs text-gray-400">{fmtDate(selected.created_at)}</span>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 space-y-5">
              {/* Contact */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</p>
                {selected.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400">Email</p>
                      <a href={`mailto:${selected.email}`} className="text-sm font-medium text-blue-600 hover:underline">{selected.email}</a>
                    </div>
                  </div>
                )}
                {selected.company && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400">Company</p>
                      <p className="text-sm font-medium text-gray-800">{selected.company}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Engagement */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Engagement</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-1"><Tag className="h-3.5 w-3.5 text-gray-400" /><p className="text-[10px] text-gray-400">Type</p></div>
                    <p className="text-sm font-semibold text-gray-800">{fmt(selected.engagement_type)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-1"><Globe className="h-3.5 w-3.5 text-gray-400" /><p className="text-[10px] text-gray-400">Source</p></div>
                    <p className="text-sm font-semibold text-gray-800">{fmt(selected.source)}</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selected.project_description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message</p>
                  </div>
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.project_description}</p>
                  </div>
                </div>
              )}

              {/* Update status */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update Status</p>
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      className={`text-[10px] font-semibold py-1.5 rounded-xl capitalize cursor-pointer transition-all ${selected.status === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {fmt(s)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <a href={`mailto:${selected.email}`} className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-orange-600 transition-colors">
                <Mail className="h-4 w-4" /> Reply via Email
              </a>
              <button onClick={() => setSelected(null)} className="px-4 py-2.5 border border-gray-200 text-sm text-gray-500 rounded-xl hover:bg-gray-50 cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
