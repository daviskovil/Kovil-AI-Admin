import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { trafficAgents, scoreColor, scoreBadge, scoreLabel, statusDot } from '../data/agents'

const sorted = [...trafficAgents].sort((a, b) => a.score - b.score)

const moduleAvg = Math.round(trafficAgents.reduce((s, a) => s + a.score, 0) / trafficAgents.length)

export default function TrafficIntelligencePage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">Phase 1</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Traffic Intelligence</h1>
          <p className="text-sm text-gray-400 mt-1">
            18 AI agents monitoring every dimension of kovil.ai's organic search performance.
            Sorted by health score — worst first.
          </p>
        </div>
        <div className="text-right">
          <p className={`font-display font-bold text-4xl ${scoreColor(moduleAvg, 'text')}`}>{moduleAvg}</p>
          <p className="text-xs text-gray-400 mt-0.5">Module avg score</p>
        </div>
      </div>

      {/* Score summary bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Healthy (80+)', count: trafficAgents.filter(a => a.score >= 80).length, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
          { label: 'Needs Work (60–79)', count: trafficAgents.filter(a => a.score >= 60 && a.score < 80).length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'At Risk (40–59)', count: trafficAgents.filter(a => a.score >= 40 && a.score < 60).length, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: 'Critical (0–39)', count: trafficAgents.filter(a => a.score < 40).length, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
        ].map(b => (
          <div key={b.label} className={`${b.bg} border ${b.border} rounded-xl p-4 text-center`}>
            <p className={`font-display font-bold text-3xl ${b.color}`}>{b.count}</p>
            <p className="text-[10px] text-gray-500 mt-1">{b.label}</p>
          </div>
        ))}
      </div>

      {/* Agent grid — worst first */}
      <div className="grid grid-cols-3 gap-4">
        {sorted.map(agent => (
          <Link
            key={agent.id}
            to={`/traffic/${agent.id}`}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group cursor-pointer"
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusDot(agent.status)}`} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{agent.code}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scoreBadge(agent.score)}`}>
                {scoreLabel(agent.score, agent.status)}
              </span>
            </div>

            {/* Name */}
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-500 transition-colors leading-snug mb-1">
              {agent.label}
            </h3>
            <p className="text-[10px] text-gray-400 mb-4">{agent.schedule}</p>

            {/* Score bar */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${scoreColor(agent.score, 'bg')}`}
                  style={{ width: `${agent.score}%` }}
                />
              </div>
              <span className={`text-sm font-bold w-8 text-right ${scoreColor(agent.score, 'text')}`}>
                {agent.score}
              </span>
            </div>

            {/* Top finding */}
            <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{agent.topFinding}</p>

            {/* Last scanned */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
              <p className="text-[10px] text-gray-300">
                {agent.lastScanned ? `Scanned ${agent.lastScanned}` : 'Never scanned'}
              </p>
              <button
                onClick={e => { e.preventDefault(); alert(`Scanning ${agent.label}…`) }}
                className="flex items-center gap-1 text-[10px] text-orange-500 font-semibold hover:underline"
              >
                <RefreshCw className="h-3 w-3" /> Run Scan
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
