import { Search } from 'lucide-react'

export default function SEOPanelPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SEO Panel</h1>
        <p className="text-sm text-gray-400 mt-1">Per-page meta title, description, and OG image — edit without touching code</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-14 w-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-5">
          <Search className="h-6 w-6 text-orange-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">SEO Panel</h2>
        <p className="text-sm text-gray-400 max-w-sm">Browse every page and edit its meta title, description, and OG image from a slide-out drawer. No code, no deploy — changes go live immediately.</p>
        <span className="mt-6 text-[11px] font-semibold bg-orange-100 text-orange-500 px-3 py-1.5 rounded-full">Coming soon</span>
      </div>
    </div>
  )
}
