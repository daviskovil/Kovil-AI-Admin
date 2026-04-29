import { BookOpen } from 'lucide-react'

export default function BlogEditorPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Blog Editor</h1>
        <p className="text-sm text-gray-400 mt-1">Create and edit blog posts — title, slug, cover image, body, tags, publish toggle</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-14 w-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-5">
          <BookOpen className="h-6 w-6 text-orange-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Blog Editor</h2>
        <p className="text-sm text-gray-400 max-w-sm">Write and publish blog posts with a rich text editor. Set title, slug, cover image, tags, and toggle publish status — all without touching code.</p>
        <span className="mt-6 text-[11px] font-semibold bg-orange-100 text-orange-500 px-3 py-1.5 rounded-full">Coming soon</span>
      </div>
    </div>
  )
}
