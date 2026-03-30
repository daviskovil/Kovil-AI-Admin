import { useState } from 'react'
import { Megaphone, Zap, Copy } from 'lucide-react'
import api from '../../lib/api'

const types = [
  { value: 'lead_intro', label: 'Lead Intro' },
  { value: 'lead_followup', label: 'Lead Follow-up' },
  { value: 'builder_welcome', label: 'Builder Welcome' },
  { value: 'builder_rejection', label: 'Builder Rejection' },
]

export default function OutreachAgentPage() {
  const [form, setForm] = useState({ type: 'lead_intro', name: '', email: '', role: '', engagement_type: '', tone: '' })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const run = async () => {
    setLoading(true); setError(''); setResult(null)
    const { type, tone, ...leadFields } = form
    try {
      const { data } = await api.post('/agents/outreach/draft', { type, tone, lead: leadFields })
      setResult(data.result)
    } catch (e: any) { setError(e.response?.data?.error || 'Agent error') }
    finally { setLoading(false) }
  }

  const copy = () => {
    const text = typeof result === 'string' ? result : `Subject: ${result.subject}\n\n${result.body}${result.ps_note ? `\n\nP.S. ${result.ps_note}` : ''}`
    navigator.clipboard.writeText(text)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-50 p-2.5 rounded-xl"><Megaphone className="h-5 w-5 text-accent" /></div>
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Outreach Agent</h1>
          <p className="text-sm text-gray-500">AI-drafted emails for leads and builders</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Type</label>
          <div className="flex gap-2 flex-wrap">
            {types.map(t => (
              <button key={t.value} onClick={() => setForm({ ...form, type: t.value })}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all ${form.type === t.value ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[['name', 'Name', 'John Smith'], ['email', 'Email', 'john@company.com'], ['role', 'Role / Company', 'CTO at Acme'], ['engagement_type', 'Engagement Type', 'Managed AI Builder']].map(([key, label, ph]) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
              <input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={ph} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-accent" />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tone (optional)</label>
          <input value={form.tone} onChange={e => setForm({ ...form, tone: e.target.value })}
            placeholder="e.g. warm and professional, concise, empathetic"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-accent" />
        </div>
        <button onClick={run} disabled={loading || !form.name}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50">
          <Zap className="h-4 w-4" />{loading ? 'Drafting...' : 'Draft Email'}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
      {result && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-base">Drafted Email</h3>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-accent hover:underline cursor-pointer">
              <Copy className="h-3.5 w-3.5" />{copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          {typeof result === 'object' && result.subject && (
            <div className="mb-3 pb-3 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Subject</p>
              <p className="text-sm font-semibold text-gray-800">{result.subject}</p>
            </div>
          )}
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {typeof result === 'string' ? result : result.body}
          </div>
          {result.ps_note && (
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 italic">P.S. {result.ps_note}</p>
          )}
        </div>
      )}
    </div>
  )
}
