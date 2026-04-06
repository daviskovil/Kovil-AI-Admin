import { useState } from 'react'
import { Eye, EyeOff, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react'

const API_KEYS = [
  { id: 'gemini', label: 'Google Gemini 2.0 Flash', description: 'Powers all AI agent analysis across all modules.', env: 'GEMINI_API_KEY', status: 'connected', masked: 'AIzaSy••••••••••••••WWUg' },
  { id: 'gsc', label: 'Google Search Console', description: 'Used by SERP Rank Tracker, Technical SEO, Sitemap Agent, and Keyword Gap Agent.', env: 'GSC_SERVICE_ACCOUNT_PATH', status: 'connected', masked: 'kovil-admin-gsc@gen-lang-client-••••.json' },
  { id: 'ga4', label: 'Google Analytics 4', description: 'Required for Conversion Intelligence agents. Not yet needed.', env: 'GA4_PROPERTY_ID', status: 'not-configured', masked: 'Not configured' },
  { id: 'resend', label: 'Resend (Email)', description: 'Sends weekly summary emails and critical alerts to admin users.', env: 'RESEND_API_KEY', status: 'connected', masked: 're_••••••••••••••rhefc' },
]

const MOCK_USERS = [
  { id: 1, name: 'Davis Rajan', email: 'davisrajan@gmail.com', role: 'super_admin', lastLogin: '2026-04-04 09:12' },
]

const SCHEDULE_INFO = [
  { agent: 'SERP Rank Tracker (T-02)', schedule: 'Daily · 06:00 EST', next: 'Apr 5 · 06:00 EST' },
  { agent: 'Sitemap & Indexing Agent (T-18)', schedule: 'Daily · 06:30 EST', next: 'Apr 5 · 06:30 EST' },
  { agent: 'Technical SEO Auditor (T-01)', schedule: 'Weekly · Sun 03:00 EST', next: 'Apr 6 · 03:00 EST' },
  { agent: 'On-Page SEO Scorer (T-03)', schedule: 'Weekly · Sun 04:00 EST', next: 'Apr 6 · 04:00 EST' },
  { agent: 'All remaining agents', schedule: 'Weekly · Sun 05:00 EST', next: 'Apr 6 · 05:00 EST' },
  { agent: 'Conversion agents', schedule: 'Weekly · Mon 06:00 EST', next: 'Inactive' },
  { agent: 'Scaling agents', schedule: 'Monthly · 1st 07:00 EST', next: 'Inactive' },
]

export default function SettingsPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  const toggleKey = (id: string) => setShowKeys(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-bold text-2xl text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">API keys, agent schedules, and user management.</p>
      </div>

      {/* API Keys */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">API Keys & Integrations</h2>
          <p className="text-[10px] text-gray-400">Keys are stored as Supabase Edge Function secrets — never exposed to the browser</p>
        </div>
        <div className="space-y-3">
          {API_KEYS.map(key => (
            <div key={key.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{key.label}</p>
                    {key.status === 'connected'
                      ? <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                          <CheckCircle2 className="h-3 w-3" /> Connected
                        </span>
                      : <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                          <AlertCircle className="h-3 w-3" /> Not configured
                        </span>
                    }
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{key.description}</p>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">{key.env}</code>
                    <span className="text-gray-200 text-sm">·</span>
                    <p className="text-[11px] font-mono text-gray-400">
                      {showKeys[key.id] ? key.masked : key.masked.replace(/[^•\s@_\-.]/g, '•')}
                    </p>
                    <button onClick={() => toggleKey(key.id)} className="text-gray-300 hover:text-gray-500 transition-colors">
                      {showKeys[key.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  key.status === 'connected'
                    ? 'text-gray-500 border-gray-200 hover:border-red-200 hover:text-red-500'
                    : 'text-orange-500 border-orange-200 hover:bg-orange-50'
                }`}>
                  {key.status === 'connected' ? 'Rotate Key' : 'Configure'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* User Management */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">User Management</h2>
          <button className="flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all">
            <Plus className="h-3.5 w-3.5" /> Invite User
          </button>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Name', 'Email', 'Role', 'Last Login', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_USERS.map(u => (
                <tr key={u.id} className="hover:bg-orange-50/30">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${
                      u.role === 'super_admin' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">{u.lastLogin}</td>
                  <td className="px-5 py-4">
                    <button className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {/* Invite placeholder row */}
              <tr className="border-t border-dashed border-gray-100">
                <td colSpan={5} className="px-5 py-4 text-center">
                  <button className="text-xs text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1.5 mx-auto">
                    <Plus className="h-3.5 w-3.5" /> Invite a team member (Admin or Reviewer role)
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 px-1">
          Reviewer role: read-only access to all dashboards. Admin: full access except user management. Super Admin: everything.
        </p>
      </section>

      {/* Agent Schedules */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Agent Schedules</h2>
          <p className="text-[10px] text-gray-400">Scheduled via Supabase Edge Function cron triggers</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Agent', 'Schedule', 'Next Run'].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {SCHEDULE_INFO.map((s, i) => (
                <tr key={i} className="hover:bg-orange-50/30">
                  <td className="px-5 py-4 text-xs font-medium text-gray-700">{s.agent}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">{s.schedule}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-semibold ${s.next === 'Inactive' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {s.next}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
