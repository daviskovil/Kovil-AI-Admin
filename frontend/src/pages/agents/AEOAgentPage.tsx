import { useState } from 'react'
import { Cpu, Zap } from 'lucide-react'
import api from '../../lib/api'

export default function AEOAgentPage() {
  const [form, setForm] = useState({ page_content: '', target_questions: '' })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    setLoading(true); setError(''); setResult(null)
    try {
      const { data } = await api.post('/agents/aeo/analyze', form)
      setResult(data.result)
    } catch (e: any) { setError(e.response?.data?.error || 'Agent error') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-50 p-2.5 rounded-xl"><Cpu className="h-5 w-5 text-accent" /></div>
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">AEO Optimizer Agent</h1>
          <p className="text-sm text-gray-500">Optimize for Perplexity, ChatGPT, Google SGE & Bing Copilot</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Page Content</label>
          <textarea value={form.page_content} onChange={e => setForm({ ...form, page_content: e.target.value })}
            rows={6} placeholder="Paste your page content here..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-accent resize-none" />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Target Questions (optional)</label>
          <input value={form.target_questions} onChange={e => setForm({ ...form, target_questions: e.target.value })}
            placeholder="e.g. How to hire AI engineers? What is AI staffing?"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-accent" />
        </div>
        <button onClick={run} disabled={loading || !form.page_content}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50">
          <Zap className="h-4 w-4" />{loading ? 'Analyzing...' : 'Run AEO Analysis'}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
      {result && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-display font-semibold text-base mb-3">AEO Analysis Results</h3>
          <pre className="text-xs text-gray-700 bg-gray-50 rounded-xl p-4 overflow-auto max-h-96 leading-relaxed">
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
