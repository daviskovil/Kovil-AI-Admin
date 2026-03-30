import { useState } from 'react'
import { BarChart2, Zap } from 'lucide-react'
import api from '../../lib/api'

export default function KeywordsAgentPage() {
  const [form, setForm] = useState({ seed_keywords: '', target_audience: '', current_content: '' })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    setLoading(true); setError(''); setResult(null)
    try {
      const { data } = await api.post('/agents/keywords/analyze', form)
      setResult(data.result)
    } catch (e: any) { setError(e.response?.data?.error || 'Agent error') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-50 p-2.5 rounded-xl"><BarChart2 className="h-5 w-5 text-accent" /></div>
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Keyword Analysis Agent</h1>
          <p className="text-sm text-gray-500">Discover keyword opportunities to rank better</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Seed Keywords</label>
            <input value={form.seed_keywords} onChange={e => setForm({ ...form, seed_keywords: e.target.value })}
              placeholder="AI engineers, hire AI developers..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Target Audience</label>
            <input value={form.target_audience} onChange={e => setForm({ ...form, target_audience: e.target.value })}
              placeholder="CTOs, startups, enterprises..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-accent" />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Current Content Sample (optional)</label>
          <textarea value={form.current_content} onChange={e => setForm({ ...form, current_content: e.target.value })}
            rows={4} placeholder="Paste existing content to find gaps..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-accent resize-none" />
        </div>
        <button onClick={run} disabled={loading}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50">
          <Zap className="h-4 w-4" />{loading ? 'Analyzing...' : 'Run Keyword Analysis'}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
      {result && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-display font-semibold text-base mb-3">Keyword Opportunities</h3>
          <pre className="text-xs text-gray-700 bg-gray-50 rounded-xl p-4 overflow-auto max-h-96 leading-relaxed">
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
