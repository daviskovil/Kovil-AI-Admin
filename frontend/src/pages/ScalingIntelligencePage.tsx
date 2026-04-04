import { Lock, RefreshCw } from 'lucide-react'
import { scalingAgents } from '../data/agents'

const AGENT_DESCRIPTIONS: Record<string, string> = {
  's-01': 'Monitors how Toptal, Turing, Arc.dev, and Lemon.io are evolving their content and SEO — and recommends counter-moves.',
  's-02': 'Spots rising search trends in AI engineering before competition increases so Kovil can publish first.',
  's-03': 'Identifies new growth channels (LinkedIn, YouTube, communities) where the target audience is most active.',
  's-04': 'Attributes revenue to traffic and content sources — tells you exactly which content generates the most pipeline value.',
}

export default function ScalingIntelligencePage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">Phase 4</span>
            <span className="text-[10px] font-bold bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Scaling Intelligence</h1>
          <p className="text-sm text-gray-400 mt-1">
            4 AI agents that identify new growth channels, monitor competitors, and attribute revenue to content.
            Activates after traffic and conversion are working.
          </p>
        </div>
      </div>

      {/* Phase banner */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-8 flex items-start gap-4">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
          <Lock className="h-5 w-5 text-orange-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Phase 4 — Not Yet Active</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            These agents are designed to compound growth once a stable traffic and conversion baseline exists.
            Building them before that baseline is established would generate noise, not insight.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-xs text-orange-600 font-semibold">Prerequisite: Phase 1 score ≥ 75 · Phase 3 active · 90+ days traffic data</p>
          </div>
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-2 gap-5 mb-8">
        {scalingAgents.map(agent => (
          <div key={agent.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm opacity-75 relative">
            <div className="absolute top-4 right-4">
              <Lock className="h-3.5 w-3.5 text-gray-300" />
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-gray-400">{agent.code}</span>
              </div>
              <div className="flex-1 pr-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{agent.label}</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed mb-4">{AGENT_DESCRIPTIONS[agent.id]}</p>

                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <p className="text-[10px] font-semibold text-gray-400 w-16 shrink-0 pt-0.5">Schedule</p>
                    <p className="text-[10px] text-gray-500">{agent.schedule}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <p className="text-[10px] font-semibold text-gray-400 w-16 shrink-0 pt-0.5">Data</p>
                    <p className="text-[10px] text-gray-500">{agent.dataSources.join(', ')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <p className="text-[10px] font-semibold text-gray-400 w-16 shrink-0 pt-0.5">Edge Fn</p>
                    <code className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{agent.id}-agent</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Roadmap summary */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h2 className="font-display font-semibold text-sm text-gray-900 mb-4">Phase Roadmap</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { phase: 'Phase 1', label: 'Traffic Intelligence', status: 'active', agents: '18 agents', desc: 'Drive organic traffic' },
            { phase: 'Phase 2', label: 'Ops Management', status: 'active', agents: 'Manual dashboards', desc: 'Leads, roster, pipeline' },
            { phase: 'Phase 3', label: 'Conversion Intelligence', status: 'pending', agents: '5 agents', desc: 'Convert visitors to leads' },
            { phase: 'Phase 4', label: 'Scaling Intelligence', status: 'future', agents: '4 agents', desc: 'Scale what works' },
          ].map((p, i) => (
            <div key={p.phase} className="relative">
              {i < 3 && <div className="absolute top-4 left-full w-full h-px bg-gray-100 z-0" />}
              <div className={`relative z-10 rounded-xl p-4 border ${
                p.status === 'active'  ? 'border-orange-200 bg-orange-50' :
                p.status === 'pending' ? 'border-gray-200 bg-gray-50' :
                'border-gray-100 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${
                    p.status === 'active' ? 'bg-green-500' : p.status === 'pending' ? 'bg-amber-400' : 'bg-gray-300'
                  }`} />
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{p.phase}</span>
                </div>
                <p className="text-xs font-semibold text-gray-800 mb-1">{p.label}</p>
                <p className="text-[10px] text-gray-500 mb-2">{p.desc}</p>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  p.status === 'active' ? 'bg-green-100 text-green-700' :
                  p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {p.status === 'active' ? 'Building' : p.status === 'pending' ? 'Next' : 'Future'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
