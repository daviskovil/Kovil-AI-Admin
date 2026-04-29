import { BarChart2 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Site traffic snapshot — visitors, top pages, sources</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-14 w-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-5">
          <BarChart2 className="h-6 w-6 text-orange-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Analytics Snapshot</h2>
        <p className="text-sm text-gray-400 max-w-sm">Embedded read-only analytics dashboard — visitors, pageviews, top pages, traffic sources, and device breakdown. Powered by Plausible, PostHog, or GA4.</p>
        <span className="mt-6 text-[11px] font-semibold bg-orange-100 text-orange-500 px-3 py-1.5 rounded-full">Coming soon</span>
      </div>
    </div>
  )
}
