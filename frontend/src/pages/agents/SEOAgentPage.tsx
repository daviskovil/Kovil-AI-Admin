import { useState } from 'react'
import { Search, Zap } from 'lucide-react'
import api from '../../lib/api'

export default function SEOAgentPage() {
  const [form, setForm] = useState({ url: '', page_title: '', meta_description: '', h1: '', page_content: '' })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    setLoading(true); setError(''); setResult(null)
    try {
      const { data } = await api.post('/agents/seo/analyze', form)
      setResult(data.result)
    } catch (e: any) { setError(e.response?.data?.error || 'Agent error') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-50 p-2.5 rounded-xl"><Search className="h-5 w-5 text-accent" /></div>
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">SEO Optimizer Agent</h1>
          <p className="text-sm text-gray-500">On-page, technical & content SEO audit powered by Claude</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[['url', 'Page URL', 'https://kovil.ai/...'], ['page_title', 'Page Title', 'Hire Elite AI Engineers...'], ['meta_description', 'Meta Description', 'Scale your AI team...'], ['h1', 'H1 Heading', 'Elite AI Engineers...']].map(([key, label, ph]) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
              <input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={ph} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-accent" />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Page Content (paste HTML or text)</label>
          <textarea value={form.page_content} onChange={e => setForm({ ...form, page_content: e.target.value })}
            rows={5} placeholder="Paste your page content here..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-accent resize-none" />
        </div>
        <button onClick={run} disabled={loading || !form.url}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50">
          <Zap className="h-4 w-4" />{loading ? 'Analyzing...' : 'Run SEO Audit'}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      {result && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-14 w-14 rounded-xl bg-orange-50 flex items-center justify-center">
              <span className="font-display font-bold text-xl text-accent">{typeof result === 'object' ? result.score : '?'}</span>
            </div>
            <div><p className="font-display font-bold text-lg text-gray-900">SEO Score</p><p className="text-sm text-gray-500">out of 100</p></div>
          </div>
          <pre className="text-xs text-gray-700 bg-gray-50 rounded-xl p-4 overflow-auto max-h-96 leading-relaxed">
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
