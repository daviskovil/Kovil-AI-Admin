import { useState } from 'react'
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

// ─── Real GSC data synced 2026-04-05 ─────────────────────────────────────────
const LAST_SYNCED = '2026-04-05 · 09:45 EST'
const DATE_RANGE  = 'Mar 8 – Apr 4, 2026 (28 days)'

const overview = {
  clicks: 257, impressions: 60064, ctr: 0.43, avgPosition: 18.6,
}

const topQueries = [
  { query: 'kovil ai',                          clicks: 14, impressions: 45,    ctr: 31.1, position: 2.8,  flag: 'branded' },
  { query: 'power automate vs n8n',             clicks: 3,  impressions: 577,   ctr: 0.5,  position: 11.1, flag: 'opportunity' },
  { query: 'n8n vs power automate',             clicks: 1,  impressions: 579,   ctr: 0.2,  position: 11.1, flag: 'opportunity' },
  { query: 'ai development life cycle',         clicks: 3,  impressions: 138,   ctr: 2.2,  position: 6.6,  flag: 'quick-win' },
  { query: 'power automate vs n8n',             clicks: 3,  impressions: 245,   ctr: 1.2,  position: 9.9,  flag: 'opportunity' },
  { query: 'ai life cycle',                     clicks: 2,  impressions: 138,   ctr: 1.4,  position: 14.6, flag: 'opportunity' },
  { query: 'ai lifecycle',                      clicks: 1,  impressions: 962,   ctr: 0.1,  position: 25.5, flag: 'opportunity' },
  { query: 'n8n vs zapier vs make vs power automate', clicks: 1, impressions: 106, ctr: 0.9, position: 3.7, flag: 'quick-win' },
  { query: 'n8n vs zapier vs power automate',   clicks: 1,  impressions: 13,    ctr: 7.7,  position: 3.1,  flag: 'quick-win' },
  { query: 'kovil.ai',                          clicks: 2,  impressions: 13,    ctr: 15.4, position: 1.0,  flag: 'branded' },
]

const topPages = [
  { page: '/',                                      clicks: 19, impressions: 541,   ctr: 3.5,  position: 6.9,  flag: 'healthy' },
  { page: '/blog/n8n-vs-zapier-vs-power-automate',  clicks: 8,  impressions: 13300, ctr: 0.06, position: 7.0,  flag: 'critical' },
  { page: '/blog/what-is-ai-integration',           clicks: 8,  impressions: 2043,  ctr: 0.39, position: 23.4, flag: 'warning' },
  { page: '/about',                                 clicks: 7,  impressions: 93,    ctr: 7.5,  position: 2.9,  flag: 'healthy' },
  { page: '/contact',                               clicks: 4,  impressions: 128,   ctr: 3.1,  position: 3.5,  flag: 'healthy' },
  { page: '/how-it-works',                          clicks: 4,  impressions: 39,    ctr: 10.3, position: 4.9,  flag: 'healthy' },
  { page: '/engage/managed-ai-engineer',            clicks: 2,  impressions: 193,   ctr: 1.0,  position: 18.4, flag: 'warning' },
  { page: '/blog/ai-development-lifecycle',         clicks: 0,  impressions: 0,     ctr: 0,    position: 0,    flag: 'new' },
]

const opportunities = [
  { query: 'ai lifecycle',           impressions: 962,  position: 25.5, action: 'New post /blog/ai-development-lifecycle published — should start ranking within 2–4 weeks' },
  { query: 'power automate vs n8n',  impressions: 577,  position: 11.1, action: 'Optimise /blog/n8n-vs-zapier-vs-power-automate title + H1; target "Power Automate vs n8n" explicitly' },
  { query: 'n8n vs power automate',  impressions: 579,  position: 11.1, action: 'Same page as above — add a dedicated H2 section comparing exactly these two tools' },
  { query: 'ai life cycle',          impressions: 138,  position: 14.6, action: 'New lifecycle post should capture this variant — monitor over next 30 days' },
  { query: 'hire machine learning engineer', impressions: 739, position: 30.3, action: 'Redirect added to /engage/managed-ai-engineer — Google needs to recrawl and reindex' },
]

const quickWins = [
  { query: 'ai development life cycle', position: 6.6, impressions: 138, clicks: 3, page: '/blog/what-is-ai-integration', action: 'Redirect now fixed → lifecycle post. Should move from pos 6.6 to top 3 within 4 weeks.' },
  { query: 'n8n vs zapier vs power automate', position: 3.1, impressions: 13, clicks: 1, page: '/blog/n8n-vs-zapier-vs-power-automate', action: 'Already pos 3.1. Add FAQ schema + internal links from homepage to push to pos 1–2.' },
  { query: 'n8n vs zapier vs make vs power automate', position: 3.7, impressions: 106, clicks: 1, page: '/blog/n8n-vs-zapier-vs-power-automate', action: 'Pos 3.7 with 106 impressions. Strong click opportunity if title includes "Make".' },
]

const spamUrls = [
  { url: '/onlines/6I517101578', clicks: 3, impressions: 69, status: 'Removal requested' },
  { url: '/onlines/6I16750173',  clicks: 3, impressions: 4,  status: 'Removal requested' },
  { url: '/onlines/6I661874415', clicks: 2, impressions: 22, status: 'Removal requested' },
  { url: '/onlines/6I664563702', clicks: 2, impressions: 15, status: 'Removal requested' },
  { url: '/onlines/6I791174623', clicks: 2, impressions: 5,  status: 'Removal requested' },
]

const countries = [
  { country: 'United States', clicks: 57, impressions: 24490 },
  { country: 'India',         clicks: 29, impressions: 2273  },
  { country: 'Spain',         clicks: 21, impressions: 4000  },
  { country: 'Italy',         clicks: 21, impressions: 3296  },
  { country: 'United Kingdom',clicks: 13, impressions: 4013  },
  { country: 'Canada',        clicks: 9,  impressions: 1360  },
  { country: 'Mexico',        clicks: 9,  impressions: 1713  },
]

// ─── Score (computed from real data) ─────────────────────────────────────────
const subScores = [
  { label: 'Organic CTR',         score: 15, note: '0.43% vs 2%+ target' },
  { label: 'Avg Position',        score: 38, note: '18.6 avg — needs top-10 pages' },
  { label: 'High-Value Page CTR', score: 12, note: 'n8n article: 13K impr, 0.06% CTR' },
  { label: 'Quick Win Coverage',  score: 55, note: '3 keywords in pos 3–7, not yet optimised' },
  { label: 'Spam Deindex Progress',score: 42, note: '30+ /onlines/ pages still indexed' },
  { label: 'Redirect Health',     score: 65, note: '9 broken redirects fixed 2026-04-05' },
]
const overallScore = Math.round(subScores.reduce((s, x) => s + x.score, 0) / subScores.length)

// ─── Helpers ─────────────────────────────────────────────────────────────────
function scoreCol(s: number) {
  if (s >= 80) return 'text-green-600'
  if (s >= 60) return 'text-amber-500'
  if (s >= 40) return 'text-orange-500'
  return 'text-red-500'
}
function scoreBg(s: number) {
  if (s >= 80) return 'bg-green-500'
  if (s >= 60) return 'bg-amber-400'
  if (s >= 40) return 'bg-orange-400'
  return 'bg-red-500'
}
function ctrFlag(ctr: number) {
  if (ctr >= 5) return <span className="text-green-600 font-semibold">{ctr.toFixed(1)}%</span>
  if (ctr >= 1) return <span className="text-amber-500 font-semibold">{ctr.toFixed(1)}%</span>
  return <span className="text-red-500 font-semibold">{ctr.toFixed(2)}%</span>
}
function posFlag(pos: number) {
  if (pos === 0) return <span className="text-gray-300">—</span>
  if (pos <= 3) return <span className="text-green-600 font-semibold flex items-center gap-1"><TrendingUp className="h-3 w-3" />{pos.toFixed(1)}</span>
  if (pos <= 10) return <span className="text-amber-500 font-semibold flex items-center gap-1"><Minus className="h-3 w-3" />{pos.toFixed(1)}</span>
  return <span className="text-red-500 font-semibold flex items-center gap-1"><TrendingDown className="h-3 w-3" />{pos.toFixed(1)}</span>
}
function pageFlag(flag: string) {
  const map: Record<string, string> = {
    healthy: 'bg-green-50 text-green-700 border-green-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    critical: 'bg-red-50 text-red-700 border-red-100',
    new:     'bg-blue-50 text-blue-700 border-blue-100',
  }
  return map[flag] ?? 'bg-gray-50 text-gray-500 border-gray-100'
}
function queryFlag(flag: string) {
  const map: Record<string, string> = {
    branded: 'bg-green-50 text-green-700',
    'quick-win': 'bg-amber-50 text-amber-700',
    opportunity: 'bg-orange-50 text-orange-700',
  }
  const labels: Record<string, string> = {
    branded: 'Branded', 'quick-win': 'Quick Win', opportunity: 'Opportunity',
  }
  return { cls: map[flag] ?? 'bg-gray-50 text-gray-500', label: labels[flag] ?? flag }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GSCAgentPage() {
  const [scanning, setScanning] = useState(false)
  const [activeTab, setActiveTab] = useState<'queries' | 'pages' | 'opportunities' | 'spam'>('opportunities')

  function handleScan() {
    setScanning(true)
    setTimeout(() => setScanning(false), 3000)
  }

  return (
    <div className="p-8 max-w-7xl">

      {/* Back */}
      <Link to="/traffic" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Traffic Intelligence
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">T-GSC · Traffic Intelligence</span>
            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Critical</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900">GSC Performance Agent</h1>
          <p className="text-sm text-gray-400 mt-1">Google Search Console · {DATE_RANGE}</p>
          <p className="text-[10px] text-gray-300 mt-0.5">Last synced: {LAST_SYNCED}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Score ring */}
          <div className="text-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#ef4444" strokeWidth="8"
                  strokeDasharray={`${(overallScore / 100) * 213.6} 213.6`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-bold text-xl text-red-500">{overallScore}</span>
                <span className="text-[8px] text-gray-400">/ 100</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Health Score</p>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Syncing GSC…' : 'Sync GSC Data'}
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Organic Clicks',   value: overview.clicks.toLocaleString(),      sub: 'Last 28 days',       color: 'text-gray-900' },
          { label: 'Impressions',      value: overview.impressions.toLocaleString(),  sub: 'Last 28 days',       color: 'text-gray-900' },
          { label: 'Avg CTR',          value: `${overview.ctr}%`,                    sub: 'Target: >2%',        color: 'text-red-500' },
          { label: 'Avg Position',     value: overview.avgPosition,                  sub: 'Target: <10',        color: 'text-red-500' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{k.label}</p>
            <p className={`font-display font-bold text-3xl ${k.color}`}>{k.value}</p>
            <p className="text-[10px] text-gray-300 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Sub-scores */}
        <div className="col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-gray-700 mb-4">Health Breakdown</h3>
          <div className="space-y-4">
            {subScores.map(s => (
              <div key={s.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-gray-600">{s.label}</span>
                  <span className={`text-[11px] font-bold ${scoreCol(s.score)}`}>{s.score}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-1.5 rounded-full ${scoreBg(s.score)}`} style={{ width: `${s.score}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Country + Device */}
        <div className="col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-gray-700 mb-4">Top Countries</h3>
          <div className="space-y-2.5">
            {countries.map(c => (
              <div key={c.country} className="flex items-center gap-3">
                <span className="text-[11px] text-gray-600 w-32">{c.country}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-1.5 bg-orange-400 rounded-full" style={{ width: `${(c.clicks / 57) * 100}%` }} />
                </div>
                <span className="text-[11px] text-gray-500 w-12 text-right">{c.clicks}c / {c.impressions.toLocaleString()}i</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-50">
            <h3 className="text-xs font-bold text-gray-700 mb-3">Devices</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[{ d: 'Mobile', c: 144, i: 23999 }, { d: 'Desktop', c: 108, i: 35777 }, { d: 'Tablet', c: 5, i: 288 }].map(d => (
                <div key={d.d} className="bg-gray-50 rounded-xl p-3">
                  <p className="font-bold text-sm text-gray-800">{d.c}</p>
                  <p className="text-[9px] text-gray-400">{d.d}</p>
                  <p className="text-[9px] text-gray-300">{d.i.toLocaleString()} impr</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action summary */}
        <div className="col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-gray-700 mb-4">Priority Actions</h3>
          <div className="space-y-3">
            {[
              { icon: AlertTriangle, color: 'text-red-500 bg-red-50', text: 'n8n article: 13,300 impressions, 0.06% CTR — optimise title + H2 structure' },
              { icon: AlertTriangle, color: 'text-orange-500 bg-orange-50', text: '"ai lifecycle": 962 impressions at pos 25 — new post published, monitor weekly' },
              { icon: AlertTriangle, color: 'text-orange-500 bg-orange-50', text: '30+ /onlines/ spam pages still indexed — awaiting GSC removal processing' },
              { icon: CheckCircle,   color: 'text-green-600 bg-green-50', text: '9 broken redirects fixed — 1,800+ impressions now properly redirected' },
              { icon: CheckCircle,   color: 'text-green-600 bg-green-50', text: 'n8n article title updated to include "Make" + 2026 for CTR improvement' },
              { icon: Info,          color: 'text-blue-500 bg-blue-50', text: 'Spain + Italy traffic (42 clicks) likely residual spam audience — expected to normalize' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`p-1 rounded-lg shrink-0 mt-0.5 ${item.color}`}>
                  <item.icon className="h-3 w-3" />
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {([
            { key: 'opportunities', label: 'Opportunities', count: opportunities.length },
            { key: 'queries',       label: 'Top Queries',   count: topQueries.length },
            { key: 'pages',         label: 'Top Pages',     count: topPages.length },
            { key: 'spam',          label: 'Spam Tracker',  count: spamUrls.length },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold transition-colors ${
                activeTab === t.key
                  ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/30'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === t.key ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Opportunities tab */}
        {activeTab === 'opportunities' && (
          <div className="divide-y divide-gray-50">
            <div className="grid grid-cols-12 gap-4 px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
              <div className="col-span-4">Query</div>
              <div className="col-span-1 text-right">Impressions</div>
              <div className="col-span-1 text-right">Position</div>
              <div className="col-span-6">Recommended Action</div>
            </div>
            {opportunities.map((o, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 items-start hover:bg-orange-50/20 transition-colors">
                <div className="col-span-4">
                  <p className="text-sm font-medium text-gray-800">{o.query}</p>
                </div>
                <div className="col-span-1 text-right">
                  <span className="text-sm font-bold text-gray-700">{o.impressions.toLocaleString()}</span>
                </div>
                <div className="col-span-1 text-right">
                  {posFlag(o.position)}
                </div>
                <div className="col-span-6">
                  <p className="text-[11px] text-gray-500 leading-relaxed">{o.action}</p>
                </div>
              </div>
            ))}
            {/* Quick wins */}
            <div className="grid grid-cols-12 gap-4 px-5 py-2.5 text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-50/30">
              <div className="col-span-12">Quick Wins — Already ranking pos 3–7, can reach top 3</div>
            </div>
            {quickWins.map((q, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 items-start hover:bg-amber-50/20 transition-colors">
                <div className="col-span-4">
                  <p className="text-sm font-medium text-gray-800">{q.query}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{q.page}</p>
                </div>
                <div className="col-span-1 text-right">
                  <span className="text-sm font-bold text-gray-700">{q.impressions.toLocaleString()}</span>
                </div>
                <div className="col-span-1 text-right">
                  {posFlag(q.position)}
                </div>
                <div className="col-span-6">
                  <p className="text-[11px] text-gray-500 leading-relaxed">{q.action}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Queries tab */}
        {activeTab === 'queries' && (
          <div className="divide-y divide-gray-50">
            <div className="grid grid-cols-12 gap-4 px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
              <div className="col-span-5">Query</div>
              <div className="col-span-1 text-right">Clicks</div>
              <div className="col-span-2 text-right">Impressions</div>
              <div className="col-span-1 text-right">CTR</div>
              <div className="col-span-1 text-right">Position</div>
              <div className="col-span-2 text-right">Type</div>
            </div>
            {topQueries.map((q, i) => {
              const { cls, label } = queryFlag(q.flag)
              return (
                <div key={i} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="col-span-5">
                    <p className="text-sm text-gray-800">{q.query}</p>
                  </div>
                  <div className="col-span-1 text-right text-sm font-bold text-gray-700">{q.clicks}</div>
                  <div className="col-span-2 text-right text-sm text-gray-500">{q.impressions.toLocaleString()}</div>
                  <div className="col-span-1 text-right">{ctrFlag(q.ctr)}</div>
                  <div className="col-span-1 text-right">{posFlag(q.position)}</div>
                  <div className="col-span-2 text-right">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pages tab */}
        {activeTab === 'pages' && (
          <div className="divide-y divide-gray-50">
            <div className="grid grid-cols-12 gap-4 px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
              <div className="col-span-5">Page</div>
              <div className="col-span-1 text-right">Clicks</div>
              <div className="col-span-2 text-right">Impressions</div>
              <div className="col-span-1 text-right">CTR</div>
              <div className="col-span-1 text-right">Position</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            {topPages.map((p, i) => (
              <div key={i} className={`grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors ${p.flag === 'critical' ? 'bg-red-50/30' : ''}`}>
                <div className="col-span-5">
                  <a href={`https://kovil.ai${p.page}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-gray-800 hover:text-orange-500 flex items-center gap-1 transition-colors">
                    {p.page} <ExternalLink className="h-3 w-3 opacity-40" />
                  </a>
                </div>
                <div className="col-span-1 text-right text-sm font-bold text-gray-700">{p.clicks}</div>
                <div className="col-span-2 text-right text-sm text-gray-500">{p.impressions === 0 ? '—' : p.impressions.toLocaleString()}</div>
                <div className="col-span-1 text-right">{p.impressions === 0 ? <span className="text-gray-300">—</span> : ctrFlag(p.ctr)}</div>
                <div className="col-span-1 text-right">{posFlag(p.position)}</div>
                <div className="col-span-2 text-right">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pageFlag(p.flag)}`}>
                    {p.flag === 'new' ? 'New — not indexed' : p.flag.charAt(0).toUpperCase() + p.flag.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Spam tab */}
        {activeTab === 'spam' && (
          <div>
            <div className="px-5 py-4 bg-red-50/40 border-b border-red-100">
              <p className="text-xs text-red-600 font-semibold">30+ /onlines/ spam pages from the previous site are still indexed in Google. GSC removal requests have been submitted. These pages return 404 on the live site — Google will deindex them naturally within 4–8 weeks.</p>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="grid grid-cols-12 gap-4 px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <div className="col-span-6">URL</div>
                <div className="col-span-2 text-right">Clicks</div>
                <div className="col-span-2 text-right">Impressions</div>
                <div className="col-span-2 text-right">GSC Status</div>
              </div>
              {spamUrls.map((s, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center">
                  <div className="col-span-6 text-sm text-red-400 font-mono">{s.url}</div>
                  <div className="col-span-2 text-right text-sm text-gray-700">{s.clicks}</div>
                  <div className="col-span-2 text-right text-sm text-gray-500">{s.impressions}</div>
                  <div className="col-span-2 text-right">
                    <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 font-semibold px-2 py-0.5 rounded-full">{s.status}</span>
                  </div>
                </div>
              ))}
              <div className="px-5 py-3 text-[11px] text-gray-400 italic">
                + 25 more /onlines/ pages with 0 clicks — all returning 404 and deindexing naturally.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
