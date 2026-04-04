import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, FileText, UserCheck, Kanban, Plus, Download, Filter, Search, ChevronRight, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Props { defaultTab: 'leads' | 'applications' | 'roster' | 'pipeline' }

// ─── Types ─────────────────────────────────────────────────────────────────
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

interface Application {
  id: string
  name?: string
  email?: string
  roles?: string[]
  skills?: string[]
  linkedin_url?: string
  status?: string
  created_at?: string
}

const MOCK_ROSTER = [
  { id: 1, name: 'David R.', specialisation: 'Fintech Automation', stack: ['GPT-4o Vision', 'Python', 'Extractor'], availability: 'engaged', client: 'Finova Labs', start: '2026-02-10', end: '2026-05-10', rating: 4.9 },
  { id: 2, name: 'Elena M.', specialisation: 'Healthcare AI', stack: ['Voice AI', 'n8n', 'Twilio'], availability: 'available', client: null, start: null, end: null, rating: 4.8 },
  { id: 3, name: 'Rafael S.', specialisation: 'AI Performance', stack: ['AWS', 'Redis', 'Node.js'], availability: 'engaged', client: 'DataBridge', start: '2026-03-01', end: '2026-06-01', rating: 5.0 },
  { id: 4, name: 'Tomas H.', specialisation: 'AI Reliability', stack: ['Legacy Sync', 'Uptime Ops', 'P1 Triage'], availability: 'on-hold', client: null, start: null, end: null, rating: 4.7 },
]

const PIPELINE_STAGES = ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']

const MOCK_DEALS = [
  { id: 1, company: 'Finova Labs', type: 'Managed Engineer', value: 18000, probability: 80, close: '2026-04-30', assigned: 'Davis R.', stage: 'Proposal' },
  { id: 2, company: 'HealthStack', type: 'App Rescue', value: 12000, probability: 60, close: '2026-05-15', assigned: 'Davis R.', stage: 'Discovery' },
  { id: 3, company: 'CartFlow', type: 'Managed Engineer', value: 15000, probability: 40, close: '2026-05-30', assigned: 'Davis R.', stage: 'Discovery' },
  { id: 4, company: 'DataBridge', type: 'Outcome Project', value: 45000, probability: 95, close: '2026-04-10', assigned: 'Davis R.', stage: 'Closed Won' },
]

// ─── Badge helpers ─────────────────────────────────────────────────────────
function statusBadge(s: string) {
  const map: Record<string, string> = {
    new:        'bg-blue-50 text-blue-700',
    contacted:  'bg-amber-50 text-amber-700',
    qualified:  'bg-purple-50 text-purple-700',
    'closed-won': 'bg-green-50 text-green-700',
    'closed-lost':'bg-gray-100 text-gray-500',
    reviewing:  'bg-amber-50 text-amber-700',
    interview:  'bg-purple-50 text-purple-700',
    accepted:   'bg-green-50 text-green-700',
    rejected:   'bg-red-50 text-red-700',
    available:  'bg-green-50 text-green-700',
    engaged:    'bg-blue-50 text-blue-700',
    'on-hold':  'bg-gray-100 text-gray-500',
  }
  return map[s] || 'bg-gray-100 text-gray-600'
}

function availDot(a: string) {
  if (a === 'available') return 'bg-green-500'
  if (a === 'engaged')   return 'bg-blue-500'
  return 'bg-gray-300'
}

const TABS = (leadsCount: number, appsCount: number) => [
  { key: 'leads',        label: 'Leads',          icon: Users,     path: '/ops/leads',        count: leadsCount },
  { key: 'applications', label: 'Applications',    icon: FileText,  path: '/ops/applications', count: appsCount },
  { key: 'roster',       label: 'Builder Roster',  icon: UserCheck, path: '/ops/roster',       count: MOCK_ROSTER.length },
  { key: 'pipeline',     label: 'Pipeline / CRM',  icon: Kanban,    path: '/ops/pipeline',     count: MOCK_DEALS.length },
]

export default function OpsManagementPage({ defaultTab }: Props) {
  const [tab, setTab] = useState(defaultTab)
  const navigate = useNavigate()

  // ─── Real data from Supabase ─────────────────────────────────────────────
  const [leads, setLeads] = useState<Lead[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [leadsLoading, setLeadsLoading] = useState(true)
  const [appsLoading, setAppsLoading] = useState(true)

  const fetchLeads = async () => {
    setLeadsLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setLeads(data)
    else console.error('Leads fetch error:', error)
    setLeadsLoading(false)
  }

  const fetchApplications = async () => {
    setAppsLoading(true)
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setApplications(data)
    else console.error('Applications fetch error:', error)
    setAppsLoading(false)
  }

  useEffect(() => { fetchLeads(); fetchApplications() }, [])

  const formatEngagement = (e?: string) =>
    e?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '—'

  const formatSource = (s?: string) =>
    s?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '—'

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  const switchTab = (key: string, path: string) => {
    setTab(key as any)
    navigate(path, { replace: true })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">Phase 2</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Ops Management</h1>
          <p className="text-sm text-gray-400 mt-1">Leads, applications, builder roster, and sales pipeline.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-all">
          <Plus className="h-4 w-4" /> Add Lead
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {TABS(leads.length, applications.length).map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => switchTab(t.key, t.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── LEADS ── */}
      {tab === 'leads' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
              <input placeholder="Search leads…" className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-200" />
            </div>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300">
              <Filter className="h-3.5 w-3.5" /> Filter
            </button>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button onClick={fetchLeads} className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:border-orange-300 hover:text-orange-500">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
          {leadsLoading ? (
            <div className="px-5 py-12 text-center text-xs text-gray-400">Loading leads from Supabase…</div>
          ) : leads.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-semibold text-gray-500 mb-1">No leads yet</p>
              <p className="text-xs text-gray-400">Leads submitted via the website will appear here automatically.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Name / Email', 'Engagement Type', 'Source', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-gray-800">{lead.name || lead.email || 'Unknown'}</p>
                      <p className="text-[10px] text-gray-400">{[lead.company, lead.email].filter(Boolean).join(' · ')}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600">{formatEngagement(lead.engagement_type)}</td>
                    <td className="px-5 py-3 text-xs text-gray-600">{formatSource(lead.source)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusBadge(lead.status ?? 'new')}`}>
                        {(lead.status ?? 'new').replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{formatDate(lead.created_at)}</td>
                    <td className="px-5 py-3">
                      <button className="text-[10px] text-orange-500 font-semibold hover:underline flex items-center gap-0.5">
                        View <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── APPLICATIONS ── */}
      {tab === 'applications' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
              <input placeholder="Search applicants…" className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none" />
            </div>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2">
              <Filter className="h-3.5 w-3.5" /> Filter
            </button>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button onClick={fetchApplications} className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:border-orange-300 hover:text-orange-500">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
          {appsLoading ? (
            <div className="px-5 py-12 text-center text-xs text-gray-400">Loading applications from Supabase…</div>
          ) : applications.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-semibold text-gray-500 mb-1">No applications yet</p>
              <p className="text-xs text-gray-400">Engineer applications from /apply will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Name / Email', 'Roles Applied', 'Skills', 'LinkedIn', 'Status', 'Applied', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-gray-800">{app.name || '—'}</p>
                      <p className="text-[10px] text-gray-400">{app.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(app.roles ?? []).map(r => <span key={r} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{r}</span>)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(app.skills ?? []).slice(0, 3).map(s => <span key={s} className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">{s}</span>)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {app.linkedin_url
                        ? <a href={app.linkedin_url.startsWith('http') ? app.linkedin_url : `https://${app.linkedin_url}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">View →</a>
                        : <span className="text-[10px] text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusBadge(app.status ?? 'new')}`}>
                        {app.status ?? 'new'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{formatDate(app.created_at)}</td>
                    <td className="px-5 py-3">
                      <button className="text-[10px] text-orange-500 font-semibold hover:underline flex items-center gap-0.5">
                        View <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── ROSTER ── */}
      {tab === 'roster' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-2">
            {[
              { label: 'Available', count: MOCK_ROSTER.filter(r => r.availability === 'available').length, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Engaged', count: MOCK_ROSTER.filter(r => r.availability === 'engaged').length, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'On Hold', count: MOCK_ROSTER.filter(r => r.availability === 'on-hold').length, color: 'text-gray-500', bg: 'bg-gray-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                <p className={`font-display font-bold text-3xl ${s.color}`}>{s.count}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Builder', 'Specialisation', 'Tech Stack', 'Availability', 'Current Client', 'Engagement', 'Rating', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_ROSTER.map(builder => (
                  <tr key={builder.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600 shrink-0">
                          {builder.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{builder.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600">{builder.specialisation}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {builder.stack.slice(0,3).map(s => <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${availDot(builder.availability)}`} />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusBadge(builder.availability)}`}>
                          {builder.availability.replace('-', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600">{builder.client || '—'}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {builder.start ? `${builder.start} → ${builder.end}` : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="text-xs font-semibold text-gray-700">{builder.rating}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <button className="text-[10px] text-orange-500 font-semibold hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PIPELINE / CRM ── */}
      {tab === 'pipeline' && (
        <div>
          {/* Pipeline value summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Pipeline', value: `$${(MOCK_DEALS.filter(d => !d.stage.startsWith('Closed')).reduce((s,d) => s+d.value, 0) / 1000).toFixed(0)}k`, color: 'text-gray-800' },
              { label: 'Weighted Value', value: `$${(MOCK_DEALS.filter(d => !d.stage.startsWith('Closed')).reduce((s,d) => s + d.value * d.probability/100, 0) / 1000).toFixed(0)}k`, color: 'text-orange-500' },
              { label: 'Closed Won', value: `$${(MOCK_DEALS.filter(d => d.stage === 'Closed Won').reduce((s,d) => s+d.value, 0) / 1000).toFixed(0)}k`, color: 'text-green-600' },
              { label: 'Open Deals', value: MOCK_DEALS.filter(d => !d.stage.startsWith('Closed')).length, color: 'text-blue-600' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Kanban board */}
          <div className="grid grid-cols-5 gap-4">
            {PIPELINE_STAGES.map(stage => {
              const deals = MOCK_DEALS.filter(d => d.stage === stage)
              return (
                <div key={stage} className="bg-gray-50 rounded-2xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-gray-600">{stage}</p>
                    <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">{deals.length}</span>
                  </div>
                  <div className="space-y-2">
                    {deals.map(deal => (
                      <div key={deal.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm cursor-pointer hover:border-orange-200 transition-all">
                        <p className="text-xs font-semibold text-gray-800 mb-1">{deal.company}</p>
                        <p className="text-[10px] text-gray-400 mb-2">{deal.type}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800">${(deal.value/1000).toFixed(0)}k</span>
                          <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">{deal.probability}%</span>
                        </div>
                        <p className="text-[10px] text-gray-300 mt-2">Close: {deal.close}</p>
                      </div>
                    ))}
                    {deals.length === 0 && (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                        <p className="text-[10px] text-gray-300">No deals</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
