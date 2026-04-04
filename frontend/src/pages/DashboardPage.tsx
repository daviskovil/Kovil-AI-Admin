import { Link } from 'react-router-dom'
import { AlertTriangle, Bell, CheckCircle2, ChevronRight, Clock, TrendingUp, Zap } from 'lucide-react'
import { trafficAgents, conversionAgents, scalingAgents, allAgents, scoreColor, scoreBadge, scoreLabel, statusDot } from '../data/agents'

// ─── Composite growth score ────────────────────────────────────────────────
const HIGH_WEIGHT_IDS = ['t-01', 't-02', 't-03', 't-07', 't-08']
const MED_WEIGHT_IDS  = ['t-04', 't-10', 't-11', 't-18', 't-05']

function computeGrowthScore() {
  let total = 0, weights = 0
  trafficAgents.forEach(a => {
    const w = HIGH_WEIGHT_IDS.includes(a.id) ? 3 : MED_WEIGHT_IDS.includes(a.id) ? 2 : 1
    total += a.score * w
    weights += w
  })
  return Math.round(total / weights)
}

const growthScore = computeGrowthScore()

// ─── Mock data ─────────────────────────────────────────────────────────────
const MOCK_ALERTS = [
  { id: 1, severity: 'critical', title: 'No tracked keywords in top 10', agent: 'SERP Rank Tracker', time: '2h ago' },
  { id: 2, severity: 'warning',  title: '"why-ai-projects-fail" not yet indexed', agent: 'Sitemap & Indexing Agent', time: '6h ago' },
  { id: 3, severity: 'warning',  title: 'LCP failing on /engage (mobile)', agent: 'Technical SEO Auditor', time: '1d ago' },
  { id: 4, severity: 'info',     title: 'New blog post published: "LLM Chatbot for Business"', agent: 'Content Performance', time: '2d ago' },
]

const TOP_ACTIONS = [
  { rank: 1, agent: 'SERP Rank Tracker', issue: '"hire AI engineer" stuck at position 34', impact: '+400–800 monthly visits', effort: 'Project', priority: 'High', module: 'traffic', agentId: 't-02' },
  { rank: 2, agent: 'Backlink Outreach Finder', issue: '0 quality backlinks acquired — no domain authority', impact: '+Domain rating +5 in 90 days', effort: 'Quick Fix', priority: 'High', module: 'traffic', agentId: 't-16' },
  { rank: 3, agent: 'Keyword Gap Agent', issue: '47 near-miss keywords with no dedicated content', impact: '+200–400 monthly visits', effort: 'Medium', priority: 'High', module: 'traffic', agentId: 't-04' },
  { rank: 4, agent: 'Competitor Content Gap Agent', issue: '38 keyword clusters competitors rank for — Kovil does not', impact: '+300–600 monthly visits', effort: 'Project', priority: 'High', module: 'traffic', agentId: 't-14' },
  { rank: 5, agent: 'Technical SEO Auditor', issue: 'LCP failing on /engage (mobile)', impact: '+8–12 ranking positions on mobile', effort: 'Quick Fix', priority: 'High', module: 'traffic', agentId: 't-01' },
]

const MOCK_LEADS = [
  { id: 1, name: 'Sarah Chen', company: 'Finova Labs', type: 'Managed Engineer', status: 'new', time: '3h ago' },
  { id: 2, name: 'Marcus T.', company: 'HealthStack', type: 'App Rescue', status: 'contacted', time: '1d ago' },
  { id: 3, name: 'Priya K.', company: 'Relio AI', type: 'Outcome Project', status: 'qualified', time: '2d ago' },
]

// ─── Helpers ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size / 2) - 6
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : score >= 40 ? '#ea580c' : '#dc2626'
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  )
}

function severityIcon(s: string) {
  if (s === 'critical') return <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
  if (s === 'warning')  return <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
  return <Bell className="h-3.5 w-3.5 text-blue-500 shrink-0" />
}

function severityBg(s: string) {
  if (s === 'critical') return 'border-l-red-500'
  if (s === 'warning')  return 'border-l-amber-500'
  return 'border-l-blue-400'
}

function effortBadge(e: string) {
  if (e === 'Quick Fix') return 'bg-green-50 text-green-700'
  if (e === 'Medium')    return 'bg-amber-50 text-amber-700'
  return 'bg-purple-50 text-purple-700'
}

function leadStatusBadge(s: string) {
  if (s === 'new')       return 'bg-blue-50 text-blue-700'
  if (s === 'contacted') return 'bg-amber-50 text-amber-700'
  if (s === 'qualified') return 'bg-green-50 text-green-700'
  return 'bg-gray-100 text-gray-600'
}

// ─── Sorted worst-first for the agent grid ─────────────────────────────────
const sortedTrafficAgents = [...trafficAgents].sort((a, b) => a.score - b.score)

export default function DashboardPage() {
  const bandLabel = growthScore >= 80 ? 'Healthy' : growthScore >= 60 ? 'Needs Attention' : growthScore >= 40 ? 'At Risk' : 'Critical'
  const bandColor = scoreColor(growthScore, 'text')

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Command Centre</h1>
        <p className="text-sm text-gray-400 mt-1">Last updated: April 4, 2026 · 06:30 EST</p>
      </div>

      {/* Top row: Growth Score + Module Health + Alerts */}
      <div className="grid grid-cols-12 gap-5">

        {/* Overall Growth Score */}
        <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">Overall Growth Score</p>
          <div className="relative">
            <ScoreRing score={growthScore} size={120} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-display font-bold text-3xl ${bandColor}`}>{growthScore}</span>
              <span className="text-[10px] text-gray-400">/100</span>
            </div>
          </div>
          <p className={`text-sm font-bold mt-4 ${bandColor}`}>{bandLabel}</p>
          <p className="text-[10px] text-gray-400 mt-1">Weighted avg · 18 active agents</p>
          <div className="mt-4 grid grid-cols-2 gap-2 w-full text-[10px]">
            {[
              { label: 'Healthy (80+)', count: trafficAgents.filter(a => a.score >= 80).length, color: 'text-green-600' },
              { label: 'Needs Work', count: trafficAgents.filter(a => a.score >= 60 && a.score < 80).length, color: 'text-amber-600' },
              { label: 'At Risk', count: trafficAgents.filter(a => a.score >= 40 && a.score < 60).length, color: 'text-orange-600' },
              { label: 'Critical', count: trafficAgents.filter(a => a.score < 40).length, color: 'text-red-600' },
            ].map(b => (
              <div key={b.label} className="bg-gray-50 rounded-lg px-2 py-1.5">
                <p className={`font-bold text-base ${b.color}`}>{b.count}</p>
                <p className="text-gray-400">{b.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Module Health */}
        <div className="col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">Module Health</p>
          <div className="space-y-4">
            {[
              { label: 'Traffic Intelligence', phase: 'Phase 1', agents: trafficAgents, path: '/traffic', active: true },
              { label: 'Ops Management', phase: 'Phase 2', agents: [], path: '/ops/leads', active: true, manualScore: 100 },
              { label: 'Conversion Intelligence', phase: 'Phase 3', agents: conversionAgents, path: '/conversion', active: false },
              { label: 'Scaling Intelligence', phase: 'Phase 4', agents: scalingAgents, path: '/scaling', active: false },
            ].map(m => {
              const avg = m.manualScore ?? (m.agents.length > 0
                ? Math.round(m.agents.filter(a => a.score > 0).reduce((s, a) => s + a.score, 0) / Math.max(1, m.agents.filter(a => a.score > 0).length))
                : 0)
              const color = m.active ? scoreColor(avg, 'bg') : 'bg-gray-200'
              const textColor = m.active ? scoreColor(avg, 'text') : 'text-gray-400'
              return (
                <Link key={m.label} to={m.path} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-32 shrink-0">
                    <p className="text-xs font-semibold text-gray-800 group-hover:text-orange-500 transition-colors">{m.label}</p>
                    <p className="text-[10px] text-gray-400">{m.phase}</p>
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${m.active ? avg : 0}%` }} />
                  </div>
                  <span className={`text-xs font-bold w-8 text-right ${textColor}`}>
                    {m.active ? `${avg}` : '—'}
                  </span>
                  {!m.active && <span className="text-[9px] font-bold bg-orange-100 text-orange-500 px-1.5 py-0.5 rounded-full">Soon</span>}
                </Link>
              )
            })}
          </div>

          {/* Weekly summary mini */}
          <div className="mt-6 pt-4 border-t border-gray-50">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Week of Mar 31</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Score Change', value: '+3', color: 'text-green-600' },
                { label: 'New Backlinks', value: '1', color: 'text-gray-800' },
                { label: 'Posts Published', value: '2', color: 'text-gray-800' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className={`font-display font-bold text-lg ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alert Feed */}
        <div className="col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Alert Feed</p>
            <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full">
              {MOCK_ALERTS.filter(a => a.severity === 'critical').length} Critical
            </span>
          </div>
          <div className="space-y-2">
            {MOCK_ALERTS.map(alert => (
              <div key={alert.id} className={`border-l-2 ${severityBg(alert.severity)} pl-3 py-2`}>
                <div className="flex items-start gap-2">
                  {severityIcon(alert.severity)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 leading-snug">{alert.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-gray-400">{alert.agent}</p>
                      <span className="text-gray-200">·</span>
                      <p className="text-[10px] text-gray-400">{alert.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 text-[10px] text-orange-500 font-semibold hover:underline w-full text-center">
            View all alerts
          </button>
        </div>
      </div>

      {/* Priority Action Queue */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-sm text-gray-900">Priority Action Queue</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">Top actions across all agents, ranked by estimated impact</p>
          </div>
          <Zap className="h-4 w-4 text-orange-400" />
        </div>
        <div className="divide-y divide-gray-50">
          {TOP_ACTIONS.map(action => (
            <div key={action.rank} className="px-6 py-4 flex items-start gap-4">
              <span className="text-xs font-bold text-gray-300 w-5 shrink-0 mt-0.5">#{action.rank}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{action.issue}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-400">{action.agent}</span>
                  <span className="text-gray-200">·</span>
                  <span className="text-[10px] text-green-600 font-medium">{action.impact}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${effortBadge(action.effort)}`}>
                  {action.effort}
                </span>
                <Link to={`/${action.module}/${action.agentId}`}
                  className="text-[10px] text-orange-500 font-semibold hover:underline flex items-center gap-0.5">
                  View <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row: Agent grid (worst first) + Recent Leads */}
      <div className="grid grid-cols-12 gap-5">

        {/* Worst agents */}
        <div className="col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-sm text-gray-900">Agent Health — Worst First</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">Phase 1 · Traffic Intelligence · 18 agents</p>
            </div>
            <Link to="/traffic" className="text-[10px] text-orange-500 font-semibold hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-0 divide-x divide-y divide-gray-50">
            {sortedTrafficAgents.slice(0, 9).map(agent => (
              <Link key={agent.id} to={`/traffic/${agent.id}`}
                className="p-4 hover:bg-gray-50 transition-colors group">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[9px] font-bold text-gray-300 uppercase">{agent.code}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${scoreBadge(agent.score)}`}>
                    {scoreLabel(agent.score, agent.status)}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-800 group-hover:text-orange-500 transition-colors leading-snug mb-2">
                  {agent.label}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-1.5 rounded-full ${scoreColor(agent.score, 'bg')}`}
                      style={{ width: `${agent.score}%` }} />
                  </div>
                  <span className={`text-xs font-bold ${scoreColor(agent.score, 'text')}`}>{agent.score}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 leading-snug line-clamp-2">{agent.topFinding}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent leads + ops summary */}
        <div className="col-span-4 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-display font-semibold text-sm text-gray-900">Recent Leads</h2>
              <Link to="/ops/leads" className="text-[10px] text-orange-500 font-semibold hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {MOCK_LEADS.map(lead => (
                <div key={lead.id} className="px-5 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{lead.name}</p>
                      <p className="text-[10px] text-gray-400">{lead.company} · {lead.type}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${leadStatusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-300 mt-1">{lead.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">Ops Snapshot</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'New Leads', value: '3', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Applications', value: '7', icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Active Builders', value: '4', icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Open Deals', value: '2', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map(s => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                    <div className={`${s.bg} ${s.color} w-7 h-7 rounded-lg flex items-center justify-center mb-2`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <p className={`font-display font-bold text-xl ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
