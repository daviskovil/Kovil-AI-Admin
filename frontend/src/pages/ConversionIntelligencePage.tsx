import { Link } from 'react-router-dom'
import { Lock, RefreshCw } from 'lucide-react'
import { conversionAgents } from '../data/agents'

const AGENT_DESCRIPTIONS: Record<string, string> = {
  'c-01': 'Analyses landing page intent mismatches — finds where the wrong audience is arriving on the wrong page.',
  'c-02': 'Maps your full conversion funnel and pinpoints exactly which step loses the most visitors.',
  'c-03': 'Compares your copy against actual audience language from Reddit/Quora — surfaces disconnects.',
  'c-04': 'Auto-scores every inbound lead 1–10 in real-time so the team knows who to call first.',
  'c-05': 'Audits every trust signal on kovil.ai — case studies, testimonials, guarantees — and flags gaps.',
}

export default function ConversionIntelligencePage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">Phase 3</span>
            <span className="text-[10px] font-bold bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Conversion Intelligence</h1>
          <p className="text-sm text-gray-400 mt-1">
            5 AI agents that systematically remove every barrier between a visit and a booked call.
            Activates after Phase 1 baseline is established.
          </p>
        </div>
      </div>

      {/* Phase banner */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-8 flex items-start gap-4">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
          <Lock className="h-5 w-5 text-orange-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Phase 3 — Not Yet Active</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            These agents require GA4 Behavioural Data API access and a minimum 30 days of traffic data to generate meaningful insights.
            All agents are defined and ready to build. Backend activation follows Phase 1 completion.
          </p>
          <p className="text-xs text-orange-600 font-semibold mt-2">
            Prerequisite: Phase 1 overall score ≥ 70 · GA4 API configured
          </p>
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-3 gap-4">
        {conversionAgents.map(agent => (
          <div
            key={agent.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm opacity-80 relative overflow-hidden"
          >
            {/* Lock overlay hint */}
            <div className="absolute top-3 right-3">
              <Lock className="h-3.5 w-3.5 text-gray-300" />
            </div>

            {/* Top row */}
            <div className="flex items-start justify-between mb-3 pr-6">
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{agent.code}</span>
              <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Phase 3</span>
            </div>

            {/* Name */}
            <h3 className="text-sm font-semibold text-gray-700 leading-snug mb-2">{agent.label}</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-4">{AGENT_DESCRIPTIONS[agent.id]}</p>

            {/* Score placeholder */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full" />
              <span className="text-xs font-bold text-gray-300 w-8 text-right">—</span>
            </div>

            {/* Schedule + data sources */}
            <div className="pt-3 border-t border-gray-50 space-y-1">
              <p className="text-[10px] text-gray-400"><span className="font-semibold">Schedule:</span> {agent.schedule}</p>
              <p className="text-[10px] text-gray-400"><span className="font-semibold">Data:</span> {agent.dataSources.join(', ')}</p>
            </div>
          </div>
        ))}

        {/* Build card */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
            <RefreshCw className="h-5 w-5 text-gray-300" />
          </div>
          <p className="text-xs font-semibold text-gray-400 mb-1">Phase 3 Backend</p>
          <p className="text-[10px] text-gray-300 leading-relaxed">
            GA4 API integration + Gemini agent logic pending. 5 Edge Functions to build.
          </p>
        </div>
      </div>

      {/* What each agent needs */}
      <div className="mt-8 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-display font-semibold text-sm text-gray-900">Build Requirements — Phase 3</h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50">
              {['Agent', 'Primary API', 'Edge Function', 'Schedule'].map(h => (
                <th key={h} className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {conversionAgents.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="text-xs font-semibold text-gray-700">{a.label}</p>
                  <p className="text-[10px] text-gray-400">{a.code}</p>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">{a.dataSources[0]}</td>
                <td className="px-5 py-3">
                  <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{a.id}-agent</span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-400">{a.schedule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
