import { useEffect, useState } from 'react'
import { Search, Download, Filter, RefreshCw, X, Mail, ExternalLink, FileDown, Linkedin } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Application {
  id: string
  full_name?: string
  email?: string
  phone?: string
  role?: string
  specializations?: string[]
  tech_stack?: string[]
  languages?: string[]
  linkedin_url?: string
  portfolio_url?: string
  timezone?: string
  availability?: string
  referral_source?: string
  resume_url?: string
  notes?: string
  status?: string
  created_at?: string
}

const STATUS_OPTIONS = ['all', 'new', 'reviewing', 'interview', 'accepted', 'rejected']

function statusBadge(s: string) {
  const map: Record<string, string> = {
    new:        'bg-blue-50 text-blue-700',
    reviewing:  'bg-amber-50 text-amber-700',
    interview:  'bg-purple-50 text-purple-700',
    accepted:   'bg-green-50 text-green-700',
    rejected:   'bg-red-50 text-red-700',
    // legacy
    under_review: 'bg-amber-50 text-amber-700',
    approved:     'bg-green-50 text-green-700',
  }
  return map[s] || 'bg-gray-100 text-gray-600'
}

const fmt = (s?: string) => s?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '—'
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<Application | null>(null)

  const fetchApps = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setApps(data)
    else console.error('Applications fetch error:', error)
    setLoading(false)
  }

  useEffect(() => { fetchApps() }, [])

  const filtered = apps.filter(a => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter
    const q = search.toLowerCase()
    const matchesSearch = !q || [a.full_name, a.email, a.role].some(v => v?.toLowerCase().includes(q))
    return matchesStatus && matchesSearch
  })

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('applications').update({ status }).eq('id', id)
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : s)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-gray-900 tracking-tight">Applications</h1>
          <p className="text-sm text-gray-400 mt-1">AI builder applications from /apply — {apps.length} total</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or role…"
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
          <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button onClick={fetchApps} className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:border-orange-300 hover:text-orange-500 cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading applications from Supabase…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-gray-500 mb-1">No applications found</p>
            <p className="text-xs text-gray-400">Applications from /apply will appear here automatically.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                {['Name / Email', 'Role', 'Skills', 'LinkedIn', 'Status', 'Applied', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(app => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-orange-500">{app.full_name?.charAt(0)?.toUpperCase() || '?'}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{app.full_name || '—'}</p>
                        <p className="text-[10px] text-gray-400">{app.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-600">{app.role || '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {[...(app.specializations ?? []), ...(app.tech_stack ?? [])].slice(0, 3).map(s => (
                        <span key={s} className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {app.linkedin_url
                      ? <a href={app.linkedin_url.startsWith('http') ? app.linkedin_url : `https://${app.linkedin_url}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">View →</a>
                      : <span className="text-[10px] text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusBadge(app.status ?? 'new')}`}>
                      {app.status ?? 'new'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">{fmtDate(app.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setSelected(app)} className="text-[10px] text-orange-500 font-semibold hover:underline cursor-pointer">
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
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Application Detail</p>
                <h2 className="text-lg font-bold text-gray-900">{selected.full_name || 'Unknown'}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Status bar */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${statusBadge(selected.status ?? 'new')}`}>
                {selected.status ?? 'new'}
              </span>
              <span className="text-xs text-gray-400">{fmtDate(selected.created_at)}</span>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 space-y-5">
              {/* Contact */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</p>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400">Email</p>
                    <a href={`mailto:${selected.email}`} className="text-sm font-medium text-blue-600 hover:underline">{selected.email}</a>
                  </div>
                </div>
                {selected.linkedin_url && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Linkedin className="h-4 w-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400">LinkedIn</p>
                      <a href={selected.linkedin_url.startsWith('http') ? selected.linkedin_url : `https://${selected.linkedin_url}`} target="_blank" rel="noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 truncate">
                        View Profile <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                )}
                {selected.resume_url && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <FileDown className="h-4 w-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400">Resume</p>
                      <a href={selected.resume_url} target="_blank" rel="noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 truncate">
                        Download Resume <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Role */}
              {selected.role && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role Applied For</p>
                  <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full inline-block">{selected.role}</span>
                </div>
              )}

              {/* Specializations */}
              {(selected.specializations ?? []).length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {(selected.specializations ?? []).map(s => <span key={s} className="text-xs bg-orange-50 text-orange-600 font-medium px-2.5 py-1 rounded-full">{s}</span>)}
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              {(selected.tech_stack ?? []).length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {(selected.tech_stack ?? []).map(s => <span key={s} className="text-xs bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-full">{s}</span>)}
                  </div>
                </div>
              )}

              {/* Languages */}
              {(selected.languages ?? []).length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {(selected.languages ?? []).map(l => <span key={l} className="text-xs bg-purple-50 text-purple-600 font-medium px-2.5 py-1 rounded-full">{l}</span>)}
                  </div>
                </div>
              )}

              {/* Availability */}
              {(selected.availability || selected.timezone) && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Availability</p>
                  <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                    {selected.availability && <p className="text-sm text-gray-800">{selected.availability}</p>}
                    {selected.timezone && <p className="text-xs text-gray-400">{selected.timezone}</p>}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selected.notes && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Notes</p>
                  <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{selected.notes}</p>
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
