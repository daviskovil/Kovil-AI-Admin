import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { getAgent, scoreColor, scoreBadge, scoreLabel } from '../data/agents'

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : score >= 40 ? '#ea580c' : '#dc2626'
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  )
}

function severityColor(s: string) {
  if (s === 'critical') return { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700', border: 'border-red-100' }
  if (s === 'warning')  return { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700', border: 'border-amber-100' }
  return { dot: 'bg-blue-400', badge: 'bg-blue-50 text-blue-700', border: 'border-blue-100' }
}

function effortBadge(e: string) {
  if (e === 'Quick Fix') return 'bg-green-50 text-green-700'
  if (e === 'Medium')    return 'bg-amber-50 text-amber-700'
  return 'bg-purple-50 text-purple-700'
}

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const agent = getAgent(agentId ?? '')
  const [rawOpen, setRawOpen] = useState(false)
  const [scanning, setScanning] = useState(false)

  // Determine back path based on module
  const backPath = agent?.module === 'conversion' ? '/conversion'
    : agent?.module === 'scaling' ? '/scaling'
    : '/traffic'
  const backLabel = agent?.module === 'conversion' ? 'Conversion Intelligence'
    : agent?.module === 'scaling' ? 'Scaling Intelligence'
    : 'Traffic Intelligence'

  if (!agent) {
    return (
      <div className="p-8">
        <p className="text-gray-400 text-sm">Agent not found.</p>
        <Link to="/traffic" className="text-orange-500 text-sm hover:underline mt-2 block">← Back to Traffic Intelligence</Link>
      </div>
    )
  }

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => setScanning(false), 2500)
  }

  return (
    <div className="p-8">
      {/* Back */}
      <Link to={backPath} className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{agent.code}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scoreBadge(agent.score)}`}>
              {scoreLabel(agent.score, agent.status)}
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900">{agent.label}</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              {agent.lastScanned ? `Last scanned ${agent.lastScanned}` : 'Never scanned'}
            </div>
            <span className="text-gray-200">·</span>
            <p className="text-xs text-gray-400">{agent.schedule}</p>
          </div>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-60 transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scanning…' : 'Run Scan Now'}
        </button>
      </div>

      {/* Score card + sub-scores */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-8">
          {/* Big score ring */}
          <div className="relative shrink-0">
            <ScoreRing score={agent.score} size={120} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-display font-bold text-3xl ${scoreColor(agent.score, 'text')}`}>
                {agent.status === 'not-run' ? '—' : agent.score}
              </span>
              <span className="text-[10px] text-gray-400">/100</span>
            </div>
          </div>

          {/* Sub-scores */}
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Sub-scores</p>
            <div className="space-y-2.5">
              {agent.subScores.map(sub => (
                <div key={sub.label} className="flex items-center gap-3">
                  <p className="text-xs text-gray-600 w-48 shrink-0">{sub.label}</p>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${scoreColor(sub.score, 'bg')}`}
                      style={{ width: `${sub.score}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold w-8 text-right ${scoreColor(sub.score, 'text')}`}>{sub.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data sources */}
          <div className="shrink-0 w-44">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Data Sources</p>
            <div className="space-y-1.5">
              {agent.dataSources.map(ds => (
                <div key={ds} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  <p className="text-xs text-gray-600">{ds}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Findings */}
      {agent.findings.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-display font-semibold text-sm text-gray-900">Findings</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">Sorted by severity</p>
          </div>
          <div className="divide-y divide-gray-50">
            {agent.findings.map((finding, i) => {
              const sc = severityColor(finding.severity)
              return (
                <div key={i} className="px-6 py-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full ${sc.dot} mt-1.5 shrink-0`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm font-semibold text-gray-900">{finding.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${sc.badge}`}>
                          {finding.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                        <span className="font-semibold text-gray-700">Why it matters: </span>
                        {finding.whyItMatters}
                      </p>
                      <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-xs text-gray-700">
                          <span className="font-semibold">Fix: </span>{finding.fix}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-gray-400">Impact:</span>
                        <span className={`text-[10px] font-bold ${finding.impact === 'High' ? 'text-red-600' : finding.impact === 'Medium' ? 'text-amber-600' : 'text-gray-500'}`}>
                          {finding.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {agent.actions.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-display font-semibold text-sm text-gray-900">Recommended Actions</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {agent.actions.map((action, i) => (
              <div key={i} className="px-6 py-5 flex items-start gap-4">
                <span className="text-xs font-bold text-gray-300 w-5 shrink-0 mt-0.5">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{action.issue}</p>
                  <p className="text-xs text-gray-500 mb-2">{action.whatToDo}</p>
                  <p className="text-xs text-green-600 font-medium">{action.estimatedImpact}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${effortBadge(action.effort)}`}>
                    {action.effort}
                  </span>
                  <select
                    defaultValue={action.status}
                    className="text-[10px] border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Not-run state */}
      {agent.status === 'not-run' && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="h-6 w-6 text-orange-400" />
          </div>
          <h3 className="font-display font-semibold text-gray-800 mb-2">Agent Not Yet Run</h3>
          <p className="text-sm text-gray-400 mb-4">Click "Run Scan Now" to get the first analysis for this agent.</p>
          <button
            onClick={handleScan}
            className="px-6 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-all"
          >
            Run First Scan
          </button>
        </div>
      )}

      {/* Raw Data (collapsible) */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => setRawOpen(!rawOpen)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <p className="text-xs font-semibold text-gray-500">Raw Data (last scan)</p>
          {rawOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
        {rawOpen && (
          <div className="px-6 pb-5">
            <pre className="text-[11px] text-gray-500 bg-gray-50 rounded-xl p-4 overflow-auto max-h-64">
              {JSON.stringify({ agent_id: agent.id, score: agent.score, scanned_at: agent.lastScanned, findings: agent.findings }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
